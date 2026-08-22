#!/usr/bin/env python3
"""
A journey router: how long a rider's actual trip takes, not how much service
a route runs.

Every other module in this repo counts service -- stops, trips, headways,
square kilometres. This one answers a different question: starting from a
point, ready at a minute, how do you get to another point, and when do you
arrive? That is a RAPTOR-style round-based search (Delling et al., "Round-
Based Public Transit Routing"): round k boards one trip and rides it to every
stop further along; between rounds, the walks synthesised at build time carry
the rider from wherever a ride left them to wherever the next one starts.
Bounding rounds bounds transfers, so `MAX_ROUNDS` is chosen to allow at least
three of them before the search gives up.

WHY THIS IS RISKIER THAN A SERVICE COUNT

A wrong trip count is visibly wrong -- the CSV disagrees with the PDF, or a
route total looks absurd. A plausible-looking itinerary that no rider could
actually make has no such tell; it reads as authoritative right up until
someone tries to walk it. Five choices carry that risk, in the order a wrong
answer would embarrass this repo:

1. THE CLOCK STARTS WHEN THE RIDER IS READY, NOT WHEN THEY BOARD. Waiting for
   a bus is part of the trip. `Journey.wait_minutes` exists so a router that
   quietly excluded it could never ship -- and a network whose headways
   doubled has to show up here as a longer *trip*, not just a longer gap
   between two timetable rows.
2. A CONNECTION THAT CANNOT BE MADE IS NOT OFFERED. Neither feed publishes
   transfers, so they are synthesised from stop coordinates at build time
   (`_build_transfer_graph`), and three numbers decide whether a synthesised
   connection is real: how fast the rider walks, how far they will walk
   between two stops, and how much slack they need beyond the walk before a
   departure counts as catchable. Generous values invent journeys nobody
   could make; all three live in `CONSTANTS` so a finding that depends on one
   can quote it rather than bury it in code. The buffer
   (`MIN_TRANSFER_BUFFER_MIN`) is charged only when the rider's arrival at a
   stop came from a ride -- boarding the very first trip from the origin walk
   needs no buffer, because there is nothing to have just gotten off of.
3. LEAVING LATER NEVER ARRIVES EARLIER. The FIFO property a round-based
   search gets for free only if trips within a pattern are boarded in
   schedule order -- `_Pattern.dep_times` keeps every position's times
   aligned to one `trips_sorted` order for exactly this reason. Break it and
   the failure is invisible in any single answer; it only shows up as a
   profile whose journeys are not monotonic in ready time, which is why
   `test_leaving_later_never_arrives_earlier` sweeps ninety consecutive
   minutes rather than checking one.
4. RAIL IS IN IT, under both feeds' spellings. Convention 13 in CLAUDE.md: a
   journey is not a service quantity, so a one-seat ride that happens to be
   the T still counts, unlike everywhere else in this repo. The trap is that
   the two feeds disagree on rail's GTFS `route_type` -- current GTFS calls
   it "2", the proposed feed calls it "0" -- so `ROUTED_TYPES` has to carry
   both, and `gtfs.bus_only` (which keys on "3" alone) must never be reused
   for this module's filtering.
5. NO JOURNEY IS `None`, NEVER A SENTINEL. An unreachable pair has to fail
   loudly; a large-number stand-in would silently enter a median.

HOW A SEARCH ACTUALLY RUNS

`origin` and `dest` are points, not stop ids -- a rider starts somewhere on
the ground. Both "which stops are near this point" queries -- the walk out
from `origin` and the walk in to `dest` -- go through `tt.stop_grid`, a
`_StopGrid` bucketed into cells sized in metres and built once in
`Timetable.build`; a search never re-buckets or linearly scans the feed's
~6,000 stops to answer either one. `_seed_from_origin` walks out to every
stop within `access_walk_m` (a keyword-only parameter on `earliest_arrival`
and `profile`, defaulting to `MAX_ACCESS_WALK_M`, the site's published
quarter-mile radius), arriving at `ready_at + distance / WALK_SPEED_M_PER_MIN`;
that is round 0. Each subsequent round (`_round`) scans only the patterns
that touch a stop marked in the previous round -- the real feeds run ~471
patterns and ~33k trips, so re-scanning everything every round would be the
difference between a profile finishing in seconds and not finishing --
boards the earliest trip a marked stop's `ready_to_board` time allows
(found by bisecting each position's precomputed departure times, never by
scanning trips), rides it forward improving every later stop, and then walks
out along the synthesised transfer graph from every stop a ride newly
reached. A stop reached this way gets its own `ready_to_board` bumped by the
buffer immediately, which is what makes an immediate same-stop transfer to a
different route cost the buffer exactly like a transfer that needs a walk --
there is no separate zero-distance case to get wrong.

The stops within `access_walk_m` of `dest` (the egress set) are found once,
before round 0, rather than by scanning every reached stop after the rounds
finish. A `_DestBound` tracks the best known arrival at `dest` as the search
proceeds -- a direct walk if `origin` and `dest` are close enough, tightened
every time a newly-reached stop turns out to be in the egress set -- and
doubles as a standard RAPTOR target-pruning bound: a stop cannot lead to a
better arrival at `dest` than one already known once its own arrival is no
better than that bound, since riding or walking from it only adds
non-negative time, so `_seed_from_origin` and `_round` drop such a stop
rather than mark and expand it. This only ever discards a stop that
provably cannot win; it changes how many labels a search touches, never
which journey it finds. `_reconstruct` then walks the winning stop's
back-pointer chain to build the leg list a rider could actually follow.

`profile()` needs the arrival time for every minute in the window, but it
does not run `earliest_arrival` once per minute -- against the real feeds
that is 120-290 ms per search, so a two-hour window would take 20+ seconds,
too slow to serve from a web request. Instead it exploits a property of
`arrive(t)`, the earliest arrival for a rider ready at minute t: `arrive` is
non-decreasing in t (the FIFO property above, `test_leaving_later_never_
arrives_earlier`) and piecewise constant (an arrival only changes when a
different departure becomes the earliest catchable one, which happens at
isolated minutes, not continuously). Divide-and-conquer over a block `[lo,
hi]` follows directly: compute `arrive(lo)` and `arrive(hi)`; if they are
equal, every minute in between has that same arrival too, because a
non-decreasing function bounded above and below by two equal values cannot
vary in between; otherwise split the block and recurse on both halves.
Unreachable is treated as an arrival of infinity so it participates in the
same comparison -- if `arrive(lo)` is infinite then, by the same
monotonicity, so is every later minute in the block, and the whole block is
unreachable without another search. Each minute is searched at most once
(`earliest_arrival` results are memoised by ready minute), and a 30-minute
headway over a two-hour window collapses roughly 120 searches to a double
digit count -- see the timing note in `profile`'s docstring.

A block found constant is assigned the `Journey` computed at its RIGHT end,
never its left. A journey found for a rider ready at `hi` only boards trips
departing at or after `hi`, so a rider ready at any earlier minute in the
block can make the same journey -- they simply wait longer at the origin.
The reverse does not hold: the journey found at `lo` may board a trip that
has already left by a later minute in the block, which is an itinerary
nobody ready at that minute could actually make. The chosen journey is
copied per minute via `dataclasses.replace(ready_at=...)`, which keeps
`arrive` (and therefore `total_minutes`, `wait_minutes`, ...) correct for
each rider even though the underlying legs were computed once.

Some minutes in a window have no usable departure left in the timetable;
those count toward `n_departures` and lower `reachable_fraction` without
contributing a journey, so a median never quietly narrows itself to the
minutes that happened to work.
"""

import math
import statistics
from bisect import bisect_left
from collections import defaultdict
from dataclasses import dataclass, replace

# --------------------------------------------------------------------------
# geometry: everything here works in metres, converted from the feeds' lat/lon
# --------------------------------------------------------------------------

M_PER_DEG_LAT = 111_320.0


def m_per_deg_lon(lat):
    """A degree of longitude is shorter than a degree of latitude away from
    the equator; both feeds sit at ~40.44N, where it is about 76% as wide."""
    return M_PER_DEG_LAT * math.cos(math.radians(lat))


def _distance_m(a, b):
    lat1, lon1 = a
    lat2, lon2 = b
    mid_lat = (lat1 + lat2) / 2
    dlat_m = (lat2 - lat1) * M_PER_DEG_LAT
    dlon_m = (lon2 - lon1) * m_per_deg_lon(mid_lat)
    return math.hypot(dlat_m, dlon_m)


# --------------------------------------------------------------------------
# the three numbers that decide whether an itinerary is real, plus the speed
# that turns a distance into a walk time. Published as CONSTANTS so a finding
# that depends on one can quote it rather than bury it in code.
# --------------------------------------------------------------------------

WALK_SPEED_M_PER_MIN = 80.0        # ~4.8 km/h, an unhurried adult walking pace
# The site's published quarter-mile access radius (`PRIMARY_RADIUS` in
# src/refresh/query.py, CLAUDE.md convention 4), shared with every other
# layer -- so the same point never reads as served here and unserved there.
# Overridable per search via `access_walk_m`, since convention 4 requires
# radius sensitivity to be reported, not chosen once and hidden.
MAX_ACCESS_WALK_M = 400.0          # origin/dest <-> stop
MAX_TRANSFER_WALK_M = 400.0        # ~5 minutes: stop <-> stop, a quarter mile
MIN_TRANSFER_BUFFER_MIN = 3.0      # dwell + reaction time on top of the walk

CONSTANTS = {
    "walk_speed_m_per_min": WALK_SPEED_M_PER_MIN,
    "max_access_walk_m": MAX_ACCESS_WALK_M,
    "max_transfer_walk_m": MAX_TRANSFER_WALK_M,
    "min_transfer_buffer_min": MIN_TRANSFER_BUFFER_MIN,
}

# GTFS route_type values that count as a journey. Convention 13: a journey is
# not a service quantity, so rail and the inclines are IN, unlike everywhere
# else in this repo. The two feeds spell rail differently -- current GTFS
# types the T as "2" (rail), the proposed feed types it "0" (tram/light
# rail) -- so both have to be here or the future network's T silently drops
# out of every one-seat answer. `gtfs.bus_only` keys on "3" alone and must
# never be reused for this module.
ROUTED_TYPES = frozenset({
    "0",   # tram, streetcar, light rail (proposed feed's spelling of the T)
    "1",   # subway, metro
    "2",   # rail (current feed's spelling of the T)
    "3",   # bus
    "4",   # ferry
    "5",   # cable tram
    "6",   # aerial lift (the inclines)
    "7",   # funicular
})

MAX_ROUNDS = 5   # rounds = rides; allows up to 4 transfers, "at least 3"

LEG_WALK = "walk"
LEG_RIDE = "ride"

_KIND_ACCESS = "access"   # internal back-pointer kind: origin -> stop
_KIND_RIDE = "ride"       # internal back-pointer kind: boarded a trip
_KIND_TRANSFER = "transfer"  # internal back-pointer kind: walked stop -> stop


@dataclass(frozen=True)
class Leg:
    kind: str            # LEG_WALK or LEG_RIDE
    route: object         # route id for a ride leg, else None
    from_stop: object     # stop id, or None at the origin
    to_stop: object       # stop id, or None at the destination
    depart: float
    arrive: float


@dataclass(frozen=True)
class Journey:
    ready_at: float
    arrive: float
    legs: tuple

    @property
    def total_minutes(self):
        return self.arrive - self.ready_at

    @property
    def ride_minutes(self):
        return sum(leg.arrive - leg.depart for leg in self.legs
                   if leg.kind == LEG_RIDE)

    @property
    def walk_minutes(self):
        return sum(leg.arrive - leg.depart for leg in self.legs
                   if leg.kind == LEG_WALK)

    @property
    def wait_minutes(self):
        return self.total_minutes - self.ride_minutes - self.walk_minutes

    @property
    def transfers(self):
        rides = sum(1 for leg in self.legs if leg.kind == LEG_RIDE)
        return max(rides - 1, 0)

    @property
    def routes(self):
        return tuple(leg.route for leg in self.legs if leg.kind == LEG_RIDE)


@dataclass
class Profile:
    journeys: tuple
    n_departures: int
    median_minutes: object
    best_minutes: object
    worst_minutes: object
    reachable_fraction: float


# --------------------------------------------------------------------------
# the timetable: a pattern per (route, ordered stop sequence), trips sorted
# so each search can bisect instead of scan; a transfer graph synthesised
# once at build time so a search never recomputes stop-to-stop distances.
# --------------------------------------------------------------------------

@dataclass
class _Pattern:
    route_id: object
    stops: tuple
    trips_sorted: list
    # dep_times[position] is a tuple of trip times at that position, in the
    # same trip order as trips_sorted -- so an index found by bisecting one
    # position's times is valid at every other position of the same trip.
    dep_times: list


def _build_pattern(route_id, stops, trips):
    trips_sorted = sorted(trips, key=lambda trip: trip[0])
    dep_times = [
        tuple(start + offsets[pos] for start, offsets in trips_sorted)
        for pos in range(len(stops))
    ]
    return _Pattern(route_id=route_id, stops=tuple(stops),
                    trips_sorted=trips_sorted, dep_times=dep_times)


def _build_stop_patterns(patterns):
    stop_patterns = defaultdict(list)
    for pattern_idx, pattern in enumerate(patterns):
        for position, stop in enumerate(pattern.stops):
            stop_patterns[stop].append((pattern_idx, position))
    return dict(stop_patterns)


@dataclass
class _StopGrid:
    """Every stop bucketed into a cell sized in METRES on both axes, so
    "which stops are within R of this point" costs a scan of the handful of
    cells R can reach rather than a walk over the whole feed. Built once in
    `Timetable.build` and shared by everything that needs such a lookup: the
    transfer graph (`_build_transfer_graph`), the walk out from an origin
    (`_access_stops`), and the walk in to a destination (the egress set in
    `earliest_arrival`) -- so a search never re-buckets the ~6,000 stops of
    a real feed, it only ever queries a structure built once at load time.

    Sizing the cell in metres rather than degrees matters more than it
    looks: a degree of longitude is only ~0.76 of a degree of latitude at
    Pittsburgh's latitude, so a cell indexed by raw degrees is narrower on
    the ground east-west than north-south. Sizing the cell at `cell_m` in
    each direction guarantees two stops closer together than that never
    land more than one cell apart on either axis, at any latitude.
    """
    coords: dict
    cell_m: float
    lat_cell_deg: float
    lon_cell_deg: float
    buckets: dict   # (cell_y, cell_x) -> [stop, ...]

    @staticmethod
    def _cell(lat, lon, lat_cell_deg, lon_cell_deg):
        return math.floor(lat / lat_cell_deg), math.floor(lon / lon_cell_deg)

    @classmethod
    def build(cls, coords, cell_m):
        if not coords:
            return cls(coords={}, cell_m=cell_m, lat_cell_deg=1.0,
                       lon_cell_deg=1.0, buckets={})
        lat_cell_deg = cell_m / M_PER_DEG_LAT
        mean_lat = sum(lat for lat, _ in coords.values()) / len(coords)
        lon_cell_deg = cell_m / m_per_deg_lon(mean_lat)
        buckets = defaultdict(list)
        for stop, (lat, lon) in coords.items():
            buckets[cls._cell(lat, lon, lat_cell_deg, lon_cell_deg)].append(stop)
        return cls(coords=coords, cell_m=cell_m, lat_cell_deg=lat_cell_deg,
                   lon_cell_deg=lon_cell_deg, buckets=dict(buckets))

    def stops_within(self, point, radius_m):
        """Every stop within radius_m of point, as (stop, distance) pairs.

        The query radius is a per-search parameter (`access_walk_m`) and can
        exceed the cell size the grid was built with (fixed at
        `max_transfer_walk_m`), so the neighbourhood scanned widens with the
        query rather than staying a hard-coded 3x3 -- `reach` cells in every
        direction is always enough, because a cell measures `cell_m` on each
        axis by construction.
        """
        if not self.buckets:
            return []
        lat, lon = point
        cell_y, cell_x = self._cell(lat, lon, self.lat_cell_deg, self.lon_cell_deg)
        reach = max(1, math.ceil(radius_m / self.cell_m))
        found = []
        for dy in range(-reach, reach + 1):
            for dx in range(-reach, reach + 1):
                for stop in self.buckets.get((cell_y + dy, cell_x + dx), ()):
                    distance = _distance_m(point, self.coords[stop])
                    if distance <= radius_m:
                        found.append((stop, distance))
        return found


def _build_transfer_graph(coords, max_transfer_walk_m, grid=None):
    """Every stop pair within the published transfer radius, both directions.

    Neither feed publishes transfers, so this is the only source of them --
    which is why MAX_TRANSFER_WALK_M is one of the three numbers CONSTANTS
    exists to publish.

    Comparing every stop pair is quadratic -- fine for a toy fixture, not for
    a real feed's ~6,000 stops, where it costs seconds and grows as the
    square. Instead every stop is bucketed by `_StopGrid` (the same
    coarse-index idiom `Grid` uses in analyze_frequency_change.py) and only
    the 3x3 neighbourhood around a stop's own cell is searched -- correct
    because the grid's cell is sized in metres, per `_StopGrid`'s docstring.
    `Timetable.build` already needs this grid for per-search lookups, so it
    is passed in as `grid` rather than rebuilt here; the direct two-argument
    call (as the tests use, to check this function against a brute-force
    oracle) builds one on the spot.

    Each unordered pair is still checked exactly once: within a cell by index
    (i < j), and across a pair of distinct cells via a canonical half of the 8
    neighbour offsets (the other half is each offset's negation, reached when
    the roles of the two cells swap).
    """
    graph = defaultdict(list)
    if not coords:
        return {}
    if grid is None:
        grid = _StopGrid.build(coords, max_transfer_walk_m)
    buckets = grid.buckets

    def _link(stop_a, stop_b):
        distance = _distance_m(coords[stop_a], coords[stop_b])
        if distance <= max_transfer_walk_m:
            walk_min = distance / WALK_SPEED_M_PER_MIN
            graph[stop_a].append((stop_b, walk_min))
            graph[stop_b].append((stop_a, walk_min))

    # One of each {offset, -offset} pair, so every distinct-cell pair of
    # neighbours is visited from exactly one side.
    half_neighbours = ((0, 1), (1, -1), (1, 0), (1, 1))
    for (cell_y, cell_x), cell_stops in buckets.items():
        for i, stop_a in enumerate(cell_stops):
            for stop_b in cell_stops[i + 1:]:
                _link(stop_a, stop_b)
        for dy, dx in half_neighbours:
            for stop_a in cell_stops:
                for stop_b in buckets.get((cell_y + dy, cell_x + dx), ()):
                    _link(stop_a, stop_b)
    return dict(graph)


@dataclass
class Timetable:
    label: str
    patterns: list
    coords: dict
    stop_patterns: dict
    transfer_graph: dict
    max_transfer_walk_m: float
    stop_grid: "_StopGrid"

    @classmethod
    def build(cls, label, patterns, coords, max_transfer_walk_m=MAX_TRANSFER_WALK_M):
        built_patterns = [_build_pattern(route_id, stops, trips)
                          for route_id, stops, trips in patterns]
        stop_grid = _StopGrid.build(coords, max_transfer_walk_m)
        return cls(
            label=label,
            patterns=built_patterns,
            coords=dict(coords),
            stop_patterns=_build_stop_patterns(built_patterns),
            transfer_graph=_build_transfer_graph(coords, max_transfer_walk_m,
                                                 grid=stop_grid),
            max_transfer_walk_m=max_transfer_walk_m,
            stop_grid=stop_grid,
        )


# --------------------------------------------------------------------------
# the search
# --------------------------------------------------------------------------

def _access_stops(tt, point, access_walk_m):
    """Every stop within the access walk of a point, with the walk distance.

    A linear scan over every stop in the feed used to answer this -- fine
    for a toy fixture, ~24% of a real search's runtime against ~6,000 stops
    (it is run once for the origin here and, before target pruning, again
    for the destination). `tt.stop_grid` is the same bucketed index
    `_build_transfer_graph` builds for the transfer radius, reused here for
    a different radius via `stops_within`.
    """
    return tt.stop_grid.stops_within(point, access_walk_m)


@dataclass
class _DestBound:
    """The best known arrival at dest so far, updated as the search finds
    better ones, and the target-pruning bound: no stop whose own arrival is
    already >= this can lead to a better one, because riding or walking
    from it only adds non-negative time. `stop` is the reached stop the
    bound currently routes through, or None while a direct walk (or nothing
    yet) is the best candidate.
    """
    arrive: float
    stop: object = None

    def tighten_from_stop(self, egress_distance_m, stop, stop_arrive):
        """Consider walking in to dest from `stop`, newly arrived at
        `stop_arrive` -- `egress_distance_m` is None for a stop outside the
        access walk of dest, which cannot egress at all."""
        distance = egress_distance_m
        if distance is None:
            return
        candidate = stop_arrive + distance / WALK_SPEED_M_PER_MIN
        if candidate < self.arrive:
            self.arrive = candidate
            self.stop = stop


def _seed_from_origin(tt, origin, ready_at, best_arrival, ready_to_board, back,
                      access_walk_m, dest_bound, egress):
    for stop, distance in _access_stops(tt, origin, access_walk_m):
        arrive = ready_at + distance / WALK_SPEED_M_PER_MIN
        if arrive >= dest_bound.arrive:
            continue  # cannot lead to a dest arrival better than the bound
        if arrive < best_arrival.get(stop, math.inf):
            best_arrival[stop] = arrive
            ready_to_board[stop] = arrive  # no buffer: nothing to connect from
            back[stop] = (_KIND_ACCESS, arrive)
            dest_bound.tighten_from_stop(egress.get(stop), stop, arrive)


def _scan_pattern(pattern, marked, best_arrival, ready_to_board, ride_updates,
                  dest_bound_value):
    """One RAPTOR route-scan: ride the pattern once, boarding the earliest
    trip available at each marked stop, improving every stop further along.

    `dest_bound_value` is a snapshot of the target-pruning bound taken once
    per round (see `_round`) rather than re-read live -- this loop runs once
    per touched pattern per round and dominates a search's cost, so keeping
    it to local variables and a single attribute read up front matters.
    """
    board_trip_index = None
    board_stop = None
    board_depart = None
    best_arrival_get = best_arrival.get
    ride_updates_get = ride_updates.get
    ready_to_board_get = ready_to_board.get
    for position, stop in enumerate(pattern.stops):
        dep_times = pattern.dep_times[position]
        if board_trip_index is not None:
            arrive = dep_times[board_trip_index]
            if (arrive < dest_bound_value
                    and arrive < best_arrival_get(stop, math.inf)
                    and arrive < ride_updates_get(stop, (math.inf,))[0]):
                ride_updates[stop] = (arrive, pattern.route_id, board_stop,
                                      board_depart)
        if stop in marked:
            ready = ready_to_board_get(stop)
            if ready is not None:
                candidate = bisect_left(dep_times, ready)
                if candidate < len(dep_times) and (
                        board_trip_index is None or candidate < board_trip_index):
                    board_trip_index = candidate
                    board_stop = stop
                    board_depart = dep_times[candidate]


def _round(tt, marked, best_arrival, ready_to_board, back, dest_bound, egress):
    """Board and ride once (a RAPTOR round), then synthesise the transfer
    walks out of every stop a ride newly reached. Returns the stops a rider
    could newly be standing at, ready to board again next round.

    `dest_bound` tightens as stops are newly reached, and its value at the
    START of this round is what `_scan_pattern` prunes against for the
    whole round -- a snapshot rather than a live read, so a bound found by
    one touched pattern cannot retroactively prune a pattern already
    scanned in this same round out of order; it only ever sharpens the next
    round's pruning, which keeps the result independent of dict/set
    iteration order.
    """
    touched_patterns = {pattern_idx
                        for stop in marked
                        for pattern_idx, _ in tt.stop_patterns.get(stop, ())}

    dest_bound_value = dest_bound.arrive
    ride_updates = {}
    for pattern_idx in touched_patterns:
        _scan_pattern(tt.patterns[pattern_idx], marked, best_arrival,
                     ready_to_board, ride_updates, dest_bound_value)

    newly_ridden = set()
    for stop, (arrive, route, board_stop, board_depart) in ride_updates.items():
        if arrive < best_arrival.get(stop, math.inf):
            best_arrival[stop] = arrive
            ready_to_board[stop] = arrive + MIN_TRANSFER_BUFFER_MIN
            back[stop] = (_KIND_RIDE, route, board_stop, board_depart, arrive)
            newly_ridden.add(stop)
            dest_bound.tighten_from_stop(egress.get(stop), stop, arrive)

    next_marked = set()
    for stop in newly_ridden:
        arrive = best_arrival[stop]
        next_marked.add(stop)  # reboarding a different route at the same stop
        for neighbour, walk_min in tt.transfer_graph.get(stop, ()):
            candidate = arrive + walk_min
            if candidate >= dest_bound.arrive:
                continue  # cannot lead to a dest arrival better than the bound
            if candidate < best_arrival.get(neighbour, math.inf):
                best_arrival[neighbour] = candidate
                ready_to_board[neighbour] = candidate + MIN_TRANSFER_BUFFER_MIN
                back[neighbour] = (_KIND_TRANSFER, stop, arrive, candidate)
                next_marked.add(neighbour)
                dest_bound.tighten_from_stop(egress.get(neighbour), neighbour,
                                             candidate)
    return next_marked


def _leg_from_back_entry(back_entry, to_stop):
    kind = back_entry[0]
    if kind == _KIND_RIDE:
        _, route, board_stop, depart, arrive = back_entry
        return Leg(LEG_RIDE, route, board_stop, to_stop, depart, arrive), board_stop
    _, from_stop, depart, arrive = back_entry
    return Leg(LEG_WALK, None, from_stop, to_stop, depart, arrive), from_stop


def _reconstruct(tt, back, ready_at, dest_stop, stop_arrive, dest_arrive):
    legs = []
    if dest_arrive > stop_arrive:
        legs.append(Leg(LEG_WALK, None, dest_stop, None, stop_arrive, dest_arrive))

    cursor = dest_stop
    while True:
        entry = back[cursor]
        if entry[0] == _KIND_ACCESS:
            _, arrive = entry
            if arrive > ready_at:
                legs.append(Leg(LEG_WALK, None, None, cursor, ready_at, arrive))
            break
        leg, cursor = _leg_from_back_entry(entry, cursor)
        legs.append(leg)

    legs.reverse()
    return tuple(legs)


def _initial_dest_bound(origin, dest, ready_at, access_walk_m):
    """The best dest arrival known before any transit is searched: a direct
    walk, when origin and dest are close enough to make one."""
    direct_distance = _distance_m(origin, dest)
    if direct_distance <= access_walk_m:
        return _DestBound(arrive=ready_at + direct_distance / WALK_SPEED_M_PER_MIN)
    return _DestBound(arrive=math.inf)


def earliest_arrival(tt, origin, dest, ready_at, *, access_walk_m=MAX_ACCESS_WALK_M):
    best_arrival = {}
    ready_to_board = {}
    back = {}

    # Egress stops and the running best-known dest arrival are computed once,
    # up front, rather than by scanning every reached stop after the rounds
    # finish -- both to answer "how do I get to dest" cheaply (`stops_within`
    # rather than a linear scan) and to drive target pruning: a stop whose
    # own arrival cannot beat this bound is dropped rather than expanded.
    egress = dict(tt.stop_grid.stops_within(dest, access_walk_m))
    dest_bound = _initial_dest_bound(origin, dest, ready_at, access_walk_m)

    _seed_from_origin(tt, origin, ready_at, best_arrival, ready_to_board, back,
                      access_walk_m, dest_bound, egress)
    marked = set(best_arrival)

    for _ in range(MAX_ROUNDS):
        if not marked:
            break
        marked = _round(tt, marked, best_arrival, ready_to_board, back,
                        dest_bound, egress)

    if dest_bound.arrive == math.inf:
        return None

    if dest_bound.stop is None:
        direct_distance = _distance_m(origin, dest)
        legs = ()
        if direct_distance > 0:
            legs = (Leg(LEG_WALK, None, None, None, ready_at, dest_bound.arrive),)
        return Journey(ready_at, dest_bound.arrive, legs)

    legs = _reconstruct(tt, back, ready_at, dest_bound.stop,
                        best_arrival[dest_bound.stop], dest_bound.arrive)
    return Journey(ready_at, dest_bound.arrive, legs)


def _minute_block_is_constant(cache, tt, origin, dest, access_walk_m, lo, hi):
    """Search `lo` and `hi` (memoised) and say whether `arrive` is the same
    at both -- which, by the monotonicity in the module docstring, means it
    is that same value at every minute in between too."""
    journey_lo = _searched_minute(cache, tt, origin, dest, lo, access_walk_m)
    journey_hi = _searched_minute(cache, tt, origin, dest, hi, access_walk_m)
    arrival_lo = journey_lo.arrive if journey_lo is not None else math.inf
    arrival_hi = journey_hi.arrive if journey_hi is not None else math.inf
    return arrival_lo == arrival_hi, journey_lo, journey_hi


def _searched_minute(cache, tt, origin, dest, ready_at, access_walk_m):
    if ready_at not in cache:
        cache[ready_at] = earliest_arrival(tt, origin, dest, ready_at,
                                           access_walk_m=access_walk_m)
    return cache[ready_at]


def _assign_block(per_minute, lo, hi, journey_at_hi):
    """Every minute in a constant block gets the journey found at the block's
    right end, `ready_at` rewritten to that minute -- see the module
    docstring for why the right end and not the left."""
    for ready_at in range(lo, hi + 1):
        per_minute[ready_at] = (None if journey_at_hi is None
                                else replace(journey_at_hi, ready_at=ready_at))


def _collapse_block(cache, per_minute, tt, origin, dest, access_walk_m, lo, hi):
    """The divide-and-conquer step: a constant block needs no more searches;
    otherwise split at the midpoint and recurse on both halves."""
    is_constant, journey_lo, journey_hi = _minute_block_is_constant(
        cache, tt, origin, dest, access_walk_m, lo, hi)
    if is_constant:
        _assign_block(per_minute, lo, hi, journey_hi)
        return
    if hi - lo <= 1:
        per_minute[lo] = journey_lo
        per_minute[hi] = journey_hi
        return
    mid = (lo + hi) // 2
    _collapse_block(cache, per_minute, tt, origin, dest, access_walk_m, lo, mid)
    _collapse_block(cache, per_minute, tt, origin, dest, access_walk_m, mid, hi)


def profile(tt, origin, dest, window, *, access_walk_m=MAX_ACCESS_WALK_M):
    """The distribution of trip times for a rider ready at any minute in
    `window = (start, end)` (end exclusive).

    Exact, not sampled: every minute's arrival is either searched directly
    or inferred from two searches that bracket it and agree, per the
    divide-and-conquer in the module docstring ("HOW A SEARCH ACTUALLY
    RUNS").

    HOW MUCH THIS ACTUALLY SAVES, measured rather than assumed. The collapse
    can never do fewer searches than the arrival curve has steps, and on a
    frequent corridor that number is high: three real weekday pairs over a
    07:00-09:00 window needed 40, 62 and 75 searches against 120 naive ones,
    for 3.0s, 5.2s and 7.7s against ~20-26s. So this is a 2-4x saving and NOT
    a web-request latency budget. Treat a profile as a slow query -- fine for
    the pipeline, needing a loading state or a cache in front of it for the
    app. The ceiling is per-search cost, not search count.
    """
    start, end = window
    n_departures = end - start
    per_minute = {}
    if n_departures > 0:
        cache = {}
        _collapse_block(cache, per_minute, tt, origin, dest, access_walk_m,
                        start, end - 1)

    journeys = [per_minute[ready_at] for ready_at in range(start, end)
               if per_minute[ready_at] is not None]

    if not journeys:
        return Profile(journeys=(), n_departures=n_departures,
                       median_minutes=None, best_minutes=None,
                       worst_minutes=None, reachable_fraction=0.0)

    totals = [j.total_minutes for j in journeys]
    return Profile(
        journeys=tuple(journeys),
        n_departures=n_departures,
        median_minutes=statistics.median(totals),
        best_minutes=min(totals),
        worst_minutes=max(totals),
        reachable_fraction=len(journeys) / n_departures,
    )
