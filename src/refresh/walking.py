#!/usr/bin/env python3
"""A pedestrian network: how far a walk really is, and where it goes.

Every walk in this repo used to be a straight line. `journey.py` charged a
rider `metres_between(a, b) / WALK_SPEED_M_PER_MIN` for getting to a stop,
between two stops, and from the last stop to the door, and the map drew each
of those as a dash from one end to the other. In a grid that is nearly
right. In Pittsburgh it is not: the straight line between two points a
quarter of a mile apart routinely crosses a river, a hillside, the busway or
Bigelow Boulevard, and the rider it describes does not exist.

This module is the fix for both halves at once, which is the point -- the
distance that is drawn and the distance that is charged come out of the same
search, so the map can never show a walk shorter than the clock billed for.

WHAT IT IS BUILT FROM

OpenStreetMap, fetched from Overpass and cached by `ingest_osm_walk.py`. It
is the sixth upstream source in the repo and the second that is not about
transit. The extract is every `highway` way in Allegheny County's bounding
box except the ones a pedestrian may not use (motorways, trunk roads, and
anything tagged `foot=no` or `access=private`), which for Pittsburgh matters
more than it sounds: the city's public stairways are `highway=steps`, and
they are the actual route between an awful lot of pairs of points.

WHY THE GRAPH IS NOT CONTRACTED

The obvious build collapses every degree-2 shape point, leaving ~239k
junctions instead of ~1.0M nodes, and stores each contracted edge's geometry
alongside it for drawing. It was written that way first and then thrown
away. Keeping every OSM node costs ~38 MB of packed arrays -- nothing -- and
buys three things the contracted form has to work for: a point snaps to
within ~10 m rather than half an edge, the drawn path IS the node chain with
no geometry store to keep in step with it, and a bounded search settles a
few hundred nodes either way because the bound is 400 m, not because the
graph is small.

WHAT A BOUND MEANS HERE, AND WHY IT IS THE WHOLE POINT

`max_m` is a distance ALONG THE NETWORK, not a radius. A stop 390 m away
across the Monongahela is not within a 400 m walk of anything, and `reach`
does not return it. That is the substantive change this module makes to
published travel times, and it only ever makes a network look worse, never
better -- so it cannot flatter either side of the comparison by accident.

Deliberately NOT here: any fallback to a straight line. A point off the
network, or a destination beyond the bound, gets `None`, and the caller
decides what that means. Substituting the crow-flying distance would restore
the defect this module exists to remove, silently, in exactly the cases
where it is worst.

Geometry helpers are duplicated from `gtfs.py` rather than imported, for the
same reason `journey.py` duplicates them: this module ships inside the
installed package, and a deployed app cannot import a loose script from the
working directory.
"""

import gzip
import json
import math
from array import array
from dataclasses import dataclass
from heapq import heappush, heappop

# --------------------------------------------------------------------------
# geometry, in metres
# --------------------------------------------------------------------------

M_PER_DEG_LAT = 111_320.0


def m_per_deg_lon(lat):
    return M_PER_DEG_LAT * math.cos(math.radians(lat))


def metres_between(a, b):
    lat1, lon1 = a
    lat2, lon2 = b
    mid_lat = (lat1 + lat2) / 2
    return math.hypot((lat2 - lat1) * M_PER_DEG_LAT,
                      (lon2 - lon1) * m_per_deg_lon(mid_lat))


# How far a point may be from the nearest way and still be placed on the
# network. Beyond this it is not "a bit off the sidewalk", it is somewhere the
# extract does not describe, and `snap` says so rather than guessing. Doubles
# as the spatial index's cell size, so a snap scans a 3x3 neighbourhood.
MAX_SNAP_M = 200.0


@dataclass(frozen=True)
class Anchor:
    """Where a point joins the network: the nearest node, and the straight
    stub out to it. The stub is honest -- it is the bit from the door to the
    sidewalk, which no street network describes."""
    node: int
    offset_m: float


@dataclass(frozen=True)
class Walk:
    """One walk, as timed and as drawn. Both come from the same search."""
    distance_m: float
    points: tuple


class _Nodes:
    """The node coordinates as a sequence of (lat, lon), without materialising
    a million tuples that nothing keeps."""

    def __init__(self, lat, lon):
        self._lat, self._lon = lat, lon

    def __len__(self):
        return len(self._lat)

    def __getitem__(self, i):
        return (self._lat[i], self._lon[i])


class WalkNetwork:
    """A routable pedestrian graph, held as packed arrays.

    Adjacency is CSR: `_offsets[n]:_offsets[n + 1]` slices `_targets` and
    `_lengths` for node `n`. Every segment appears in both directions, so a
    walk is the same length whichever end it starts from.
    """

    def __init__(self, *, lat, lon, osm_ids, offsets, targets, lengths):
        self._lat, self._lon = lat, lon
        self.osm_ids = osm_ids
        self._offsets, self._targets, self._lengths = offsets, targets, lengths
        self.nodes = _Nodes(lat, lon)
        self.node_of = {osm: i for i, osm in enumerate(osm_ids)}
        self._grid = self._index(lat, lon)

    # -- spatial index ------------------------------------------------------

    @staticmethod
    def _index(lat, lon):
        """Nodes bucketed into cells MAX_SNAP_M on each axis, so a snap scans
        nine cells rather than a million nodes. Sized in metres in both
        directions, per `journey._StopGrid`: a degree of longitude is only
        ~0.76 of a degree of latitude here."""
        grid = {}
        if not len(lat):
            return grid
        mean_lat = sum(lat) / len(lat)
        lat_cell = MAX_SNAP_M / M_PER_DEG_LAT
        lon_cell = MAX_SNAP_M / m_per_deg_lon(mean_lat)
        for i in range(len(lat)):
            cell = (math.floor(lat[i] / lat_cell), math.floor(lon[i] / lon_cell))
            grid.setdefault(cell, array("i")).append(i)
        return {"cells": grid, "lat_cell": lat_cell, "lon_cell": lon_cell}

    def snap(self, point, within_m=MAX_SNAP_M):
        """The nearest node to `point`, or None if the extract does not
        describe anywhere near it."""
        if not self._grid:
            return None
        lat, lon = point
        cy = math.floor(lat / self._grid["lat_cell"])
        cx = math.floor(lon / self._grid["lon_cell"])
        reach = max(1, math.ceil(within_m / MAX_SNAP_M))
        best, best_m = None, within_m
        for dy in range(-reach, reach + 1):
            for dx in range(-reach, reach + 1):
                for node in self._grid["cells"].get((cy + dy, cx + dx), ()):
                    away = metres_between(point, (self._lat[node],
                                                  self._lon[node]))
                    if away <= best_m:
                        best, best_m = node, away
        return None if best is None else Anchor(node=best, offset_m=best_m)

    # -- search -------------------------------------------------------------

    def _settled_within(self, anchor, budget_m, wanted=None):
        """Dijkstra from `anchor`, abandoning any node further than `budget_m`
        along the network. Returns (distance by node, previous node), the
        second so a path can be walked back.

        `wanted` ends the search as soon as every node in it is settled --
        correct because Dijkstra settles in non-decreasing distance order, so
        nothing found later can improve one. This is not a micro-optimisation:
        the transfer graph runs one search per stop over ~6,000 stops, and a
        bound generous enough for a hillside detour would otherwise settle
        thousands of nodes to answer a question about a handful.
        """
        outstanding = None if wanted is None else set(wanted)
        dist = {anchor.node: anchor.offset_m}
        prev = {}
        queue = [(anchor.offset_m, anchor.node)]
        while queue:
            here_m, node = heappop(queue)
            if here_m > dist.get(node, math.inf):
                continue        # a stale queue entry, already improved
            if outstanding is not None:
                outstanding.discard(node)
                if not outstanding:
                    break
            for edge in range(self._offsets[node], self._offsets[node + 1]):
                onward = self._targets[edge]
                step = here_m + self._lengths[edge]
                if step > budget_m or step >= dist.get(onward, math.inf):
                    continue
                dist[onward] = step
                prev[onward] = node
                heappush(queue, (step, onward))
        return dist, prev

    def snap_all(self, points, within_m=MAX_SNAP_M):
        """`{key: point}` -> `{key: Anchor}`, dropping what will not place.

        A caller that asks about the same points repeatedly -- the transfer
        graph asks about every stop, once per stop -- snaps them once and
        passes the anchors to `reach`, rather than re-snapping ~6,000 stops
        ~6,000 times.
        """
        anchored = {}
        for key, point in points.items():
            anchor = self.snap(point, within_m)
            if anchor is not None:
                anchored[key] = anchor
        return anchored

    def reach(self, origin, targets, max_m, *, within_m=MAX_SNAP_M):
        """How far each of `targets` is on foot, from one bounded search.

        `targets` maps any key to a point (or to an `Anchor`, for a caller
        that snapped them once already); the result maps the same keys to a
        walking distance, omitting every target further than `max_m` on foot
        or off the network altogether. The router asks this once per origin
        rather than pair by pair.
        """
        start = origin if isinstance(origin, Anchor) else self.snap(origin,
                                                                    within_m)
        if start is None:
            return {}
        ends = {key: (point if isinstance(point, Anchor)
                      else self.snap(point, within_m))
                for key, point in targets.items()}
        ends = {key: anchor for key, anchor in ends.items() if anchor is not None}
        dist, _ = self._settled_within(start, max_m,
                                       wanted={a.node for a in ends.values()})
        found = {}
        for key, end in ends.items():
            total = dist.get(end.node, math.inf) + end.offset_m
            if total <= max_m:
                found[key] = total
        return found

    def path_between(self, origin, dest, max_m, *, within_m=MAX_SNAP_M):
        """One walk, as a `Walk`, or None if there is not one within `max_m`.

        The returned points start at `origin` and end at `dest` -- the two
        straight stubs onto the network are drawn as well as charged, so the
        line the reader sees is the line the clock measured.
        """
        start = self.snap(origin, within_m)
        end = self.snap(dest, within_m)
        if start is None or end is None:
            return None
        dist, prev = self._settled_within(start, max_m - end.offset_m,
                                          wanted={end.node})
        along = dist.get(end.node)
        if along is None or along + end.offset_m > max_m:
            return None

        chain, node = [], end.node
        while True:
            chain.append(self.nodes[node])
            if node == start.node:
                break
            node = prev[node]
        chain.reverse()
        return Walk(distance_m=along + end.offset_m,
                    points=_without_repeats((origin, *chain, dest)))

    def summary(self):
        """(nodes, undirected segments, total metres) -- what the ingest
        script reports, without reaching into the packed arrays."""
        return (len(self.nodes), len(self._targets) // 2,
                sum(self._lengths) / 2)

    # -- stored form --------------------------------------------------------

    _BLOB_FIELDS = ("lat", "lon", "osm_ids", "offsets", "targets", "lengths")

    def to_blobs(self):
        """The graph as raw bytes, one per array, for a column each in
        `refresh.db` -- so the app loads it in a moment rather than re-parsing
        115 MB of OSM every time it boots."""
        return {"lat": self._lat.tobytes(), "lon": self._lon.tobytes(),
                "osm_ids": self.osm_ids.tobytes(),
                "offsets": self._offsets.tobytes(),
                "targets": self._targets.tobytes(),
                "lengths": self._lengths.tobytes()}

    @classmethod
    def from_blobs(cls, blobs):
        """Rebuild from `to_blobs`, refusing anything that does not add up.

        The checks are not defensive habit. `array`'s typecodes are sized by
        the C compiler, not by the format, so a database built on one platform
        and served on another would unpack these blobs into a DIFFERENT graph
        rather than fail -- a router quietly walking riders down edges that do
        not exist, with no symptom but wrong minutes. In this repo the graph
        is always built on the machine that serves it, which makes that
        impossible in practice and unnoticeable if it ever stopped being true.
        So the invariants are asserted at the one moment they are cheap.
        """
        def unpack(name, typecode):
            values = array(typecode)
            blob = blobs[name]
            if len(blob) % values.itemsize:
                raise ValueError(
                    f"walk network: {name} is {len(blob)} bytes, not a whole "
                    f"number of {values.itemsize}-byte items -- the database "
                    "was written by a build with different array widths")
            values.frombytes(blob)
            return values

        lat, lon = unpack("lat", "d"), unpack("lon", "d")
        osm_ids = unpack("osm_ids", "q")
        offsets = unpack("offsets", "l")
        targets, lengths = unpack("targets", "l"), unpack("lengths", "d")
        if not (len(lat) == len(lon) == len(osm_ids) == len(offsets) - 1):
            raise ValueError("walk network: node arrays disagree on how many "
                             "nodes there are")
        if not (len(targets) == len(lengths) == offsets[-1]):
            raise ValueError("walk network: the adjacency index does not match "
                             "the edges it indexes")
        return cls(lat=lat, lon=lon, osm_ids=osm_ids, offsets=offsets,
                   targets=targets, lengths=lengths)


def _without_repeats(points):
    """Drop a point identical to the one before it -- an origin that sits
    exactly on its own snapped node would otherwise be drawn twice."""
    kept = []
    for point in points:
        if not kept or point != kept[-1]:
            kept.append(point)
    return tuple(kept)


# --------------------------------------------------------------------------
# building one from an Overpass extract
# --------------------------------------------------------------------------

def build(extract):
    """A `WalkNetwork` from Overpass's `out skel` JSON: ways as ordered node
    ids, nodes as coordinates.

    A way's consecutive node pairs become edges in both directions. A node a
    way names but the extract does not place is dropped along with the two
    edges that would have touched it -- Overpass returns whole ways, so this
    only happens when a fetch is truncated, and a silently mis-joined street
    would be worse than a missing one.
    """
    coords, order = {}, []
    ways = []
    for element in extract["elements"]:
        if element["type"] == "node":
            if element["id"] not in coords:
                order.append(element["id"])
            coords[element["id"]] = (element["lat"], element["lon"])
        elif element["type"] == "way":
            ways.append(element["nodes"])

    index = {osm: i for i, osm in enumerate(order)}
    neighbours = [[] for _ in order]
    for refs in ways:
        previous = None
        for osm in refs:
            here = index.get(osm)
            if here is not None and previous is not None:
                length = metres_between(coords[order[previous]], coords[osm])
                neighbours[previous].append((here, length))
                neighbours[here].append((previous, length))
            previous = here

    offsets = array("l", [0]) 
    targets, lengths = array("l"), array("d")
    for node_edges in neighbours:
        for onward, length in node_edges:
            targets.append(onward)
            lengths.append(length)
        offsets.append(len(targets))

    return WalkNetwork(
        lat=array("d", [coords[osm][0] for osm in order]),
        lon=array("d", [coords[osm][1] for osm in order]),
        osm_ids=array("q", order),
        offsets=offsets, targets=targets, lengths=lengths)


def load(path):
    """Build from a cached extract, gzipped or not."""
    opener = gzip.open if str(path).endswith(".gz") else open
    with opener(path, "rt", encoding="utf-8") as f:
        return build(json.load(f))
