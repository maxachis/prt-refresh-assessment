#!/usr/bin/env python3
"""
Coverage change as an AREA, in square kilometres -- the last piece of
BASE_CAMP's COVERAGE-CHANGE, which asks for "the total change in coverage, in
terms of area, and by several different coverage criteria".

analyze_coverage_change.py answers the criteria at 5,751 LOCATIONS -- stops
served today that carry a PRT ridership record. That denominator can only
measure change where a bus stops today, so it cannot see coverage the plan adds
somewhere with no bus at all, and it weights a dense downtown block the same as
a mile of Route 51. This script answers the same five tiers over SPACE instead,
which fixes both, at the cost of counting hillsides and rivers as covered.
Neither is the better number; they answer different questions and the two
belong side by side.

METHOD

The covered region of a network is the union of walk-radius discs around the
stops that meet a tier. Union, not sum: overlapping discs are one place, which
is exactly why this cannot be done by counting stops. There is no geometry
library in this repo and no third-party package is wanted, so the union is
measured by rasterising -- a square lattice of CELL_M metres, and a cell counts
when its CENTRE is covered:

    area(tier) = CELL_M^2 x |{cells whose centre has tier service within R}|

Centre-sampling a union of discs is unbiased and converges as the cell shrinks;
section A prints the same area at 200/100/50/25 m so the reader can see the
convergence rather than take 100 m on trust. At 100 m the minimum tiers move by
well under 1% against 25 m, which is far inside the honest precision of any
walk-radius assumption.

The service test at a cell is IDENTICAL to the one at a location in
analyze_coverage_change.py -- the same cluster rule (per route-direction, the
stop within R carrying the most departures), the same 6am-6pm maximum-gap
definition of hourly, the same 400 m headline and 150 m sensitivity. A cell is
just a location that need not have a stop on it. That is the point: a rider
stands in a place, not at a stop id, and can walk to whatever is within R.

WHAT THIS COUNTS AND WHAT IT DOES NOT

Every bus stop with a departure on the day type, in each network's own feed --
not only the stops with ridership records. Rail and the inclines are out, as
everywhere else in this repo.

Raw land area is not opportunity. A square kilometre of Hays Woods and a square
kilometre of Brookline count the same here, and a population- or
destination-weighted version needs a source this repo does not have (census
blocks, parcels, or the SNAP/POI layer that blocks GAIN/LOSE-ONE-SEAT-CRITICAL).
Read the area figures as extent, and the location figures in
analyze_coverage_change.py as who is standing in it.

Section C attributes lost and gained area to municipalities and neighbourhoods
by nearest labelled stop, using PRT's HOOD/MUNI fields through the same outlier
filter analyze_one_seat.py applies -- those labels put stops up to 40 km from
their own place, and unfiltered they would move whole square kilometres to the
wrong town. It is indicative: a cell midway between two municipalities goes to
whichever stop is nearer.

THE ON-DEMAND ZONES ARE DELIBERATELY NOT MEASURED HERE

data/raw/remix_project.json carries 10 onDemandZones polygons, and until
2026-08-25 a section E rasterised them to report that 23% of the area losing
all fixed-route service fell inside one. That figure is RETRACTED and the
section is gone. PPT reports PRT is not including microtransit in this
proposal, and the file agrees: all ten zones carry isHidden and hideZoneName,
they do not render on the public Remix map, and no PRT document or feed
mentions them. Measuring them published a softener for a loss that has none.

Do not restore this without a published PRT commitment to point at. See
docs/worklog/the-on-demand-zones-are-retracted.md.

Run ingest_blr.py first.  Usage: python3 analyze_coverage_area.py [cell_m]
    -> data/coverage_area.csv, data/coverage_area_places.csv
"""

import csv
import math
import sys
from collections import defaultdict
from pathlib import Path

import gtfs
from gtfs import DAYS, SAMPLE
from analyze_frequency_change import PRIMARY, RADII, period_of, to_axis
from analyze_coverage_change import TIERS, departures_by_direction, hourly
from analyze_one_seat import drop_outliers, load_labels

DATA = Path("data")

# Lattice pitch for the headline figures, and the ladder section A converges
# over. 100 m is 0.01 km^2 a cell -- finer than the walk radius is honest to.
CELL_M = 100
CELL_LADDER = [200, 100, 50, 25]

# A lost or gained cell takes the place label of the nearest labelled stop
# within this far; beyond it the area is reported as unplaced rather than
# guessed at. Wider than analyze_one_seat.py's 400 m because new coverage can
# land where no labelled stop is close.
PLACE_RADIUS_M = 2_000

# Local equirectangular projection. Over a 50 km span at Pittsburgh's latitude
# the scale error is under 0.2%, an order of magnitude below the cell size, and
# it keeps the distance test identical in form to Grid's in
# analyze_frequency_change.py.
LAT0, LON0 = 40.45, -79.98
M_PER_DEG_LAT = 111_320.0
M_PER_DEG_LON = M_PER_DEG_LAT * math.cos(math.radians(LAT0))


def project(lat, lon):
    return ((lon - LON0) * M_PER_DEG_LON, (lat - LAT0) * M_PER_DEG_LAT)


def unproject(x, y):
    return (y / M_PER_DEG_LAT + LAT0, x / M_PER_DEG_LON + LON0)


def centre(cell, cell_m):
    return ((cell[0] + 0.5) * cell_m, (cell[1] + 0.5) * cell_m)


# --------------------------------------------------------------------------
# rasterising a union of discs
# --------------------------------------------------------------------------

def stamp(cells, x, y, r, cell_m):
    """Add every cell whose centre is within r metres of (x, y).

    Row by row rather than over a bounding box: for each lattice row the disc
    is a single contiguous run of cells, so the run is computed directly and
    no cell is ever tested and rejected.
    """
    r2 = r * r
    for iy in range(int(math.floor((y - r) / cell_m)),
                    int(math.floor((y + r) / cell_m)) + 1):
        dy = (iy + 0.5) * cell_m - y
        half = r2 - dy * dy
        if half <= 0:
            continue
        half = math.sqrt(half)
        ix0 = int(math.ceil((x - half) / cell_m - 0.5))
        ix1 = int(math.floor((x + half) / cell_m - 0.5))
        for ix in range(ix0, ix1 + 1):
            cells.add((ix, iy))


def covered_cells(points, r, cell_m):
    """The rasterised union of r-metre discs around projected points."""
    cells = set()
    for x, y in points:
        stamp(cells, x, y, r, cell_m)
    return cells


def km2(cells, cell_m):
    return len(cells) * cell_m * cell_m / 1e6


def components(cells):
    """Split a cell set into edge-connected blocks, largest first.

    A municipality total answers "how much"; a block answers "where", which is
    what a comment about a specific place needs. Lost coverage is not scattered
    evenly over a township -- it is a road the buses come off.
    """
    seen, out = set(), []
    for start in sorted(cells):
        if start in seen:
            continue
        stack, blob = [start], []
        seen.add(start)
        while stack:
            ix, iy = stack.pop()
            blob.append((ix, iy))
            for n in ((ix + 1, iy), (ix - 1, iy), (ix, iy + 1), (ix, iy - 1)):
                if n in cells and n not in seen:
                    seen.add(n)
                    stack.append(n)
        out.append(blob)
    return sorted(out, key=len, reverse=True)


def stop_names(feed):
    """stop_id -> stop_name, for naming a block by the road it sits on."""
    return {s["stop_id"]: s["stop_name"] for s in feed.rows("stops.txt")}


class Bucket:
    """Point index in projected metres; the 3x3 neighbourhood covers radius r."""

    def __init__(self, r):
        self.r = r
        self.cell = float(r)
        self.b = defaultdict(list)

    def add(self, x, y, payload):
        self.b[(int(x // self.cell), int(y // self.cell))].append((x, y, payload))

    def within(self, x, y):
        lim = self.r * self.r
        kx, ky = int(x // self.cell), int(y // self.cell)
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for px, py, payload in self.b.get((kx + dx, ky + dy), ()):
                    if (px - x) ** 2 + (py - y) ** 2 <= lim:
                        yield payload

    def nearest(self, x, y, limit):
        """(payload, distance) for the closest point within `limit`, or None.

        Rings outward a bucket at a time so a cell in open country still finds
        its place instead of falling off the 3x3 neighbourhood.
        """
        kx, ky = int(x // self.cell), int(y // self.cell)
        rings = int(math.ceil(limit / self.cell))
        best, bestd = None, limit * limit
        for ring in range(rings + 1):
            if best is not None and (ring - 1) * self.cell > math.sqrt(bestd):
                break
            for dx in range(-ring, ring + 1):
                for dy in range(-ring, ring + 1):
                    if ring and max(abs(dx), abs(dy)) != ring:
                        continue
                    for px, py, payload in self.b.get((kx + dx, ky + dy), ()):
                        d = (px - x) ** 2 + (py - y) ** 2
                        if d < bestd:
                            best, bestd = payload, d
        return (best, math.sqrt(bestd)) if best is not None else None


# --------------------------------------------------------------------------
# the tiers, per network
# --------------------------------------------------------------------------

def day_cells(svc, xy, day, r, cell_m, want_hourly):
    """Cells covered on one day type by one network, at one radius.

    The minimum case is the plain disc union. The hourly case has to look at
    each covered cell's cluster, because hourly-or-better is a property of the
    combined timetable a rider at that spot can reach -- two half-hourly stops
    600 m apart do not make the ground between them hourly, and two two-hourly
    routes at one corner may. Clusters repeat heavily between neighbouring
    cells, so the gap test is memoised on the cluster itself.
    """
    served = [sid for sid in svc.times[day] if sid in xy]
    cells = covered_cells((xy[sid] for sid in served), r, cell_m)
    if not want_hourly:
        return cells

    index = Bucket(r)
    for sid in sorted(served):
        index.add(*xy[sid], sid)

    out, memo = set(), {}
    times = svc.times[day]
    for ix, iy in cells:
        x, y = (ix + 0.5) * cell_m, (iy + 0.5) * cell_m
        key = tuple(sorted(index.within(x, y)))
        got = memo.get(key)
        if got is None:
            got = memo[key] = hourly(departures_by_direction(times, key))
        if got:
            out.add((ix, iy))
    return out


def network_tiers(svc, xy, r, cell_m):
    """{tier: set of covered cells} for one network."""
    minimum = {d: day_cells(svc, xy, d, r, cell_m, False) for d in DAYS}
    hourly_ = {d: day_cells(svc, xy, d, r, cell_m, True) for d in DAYS}
    out = {}
    for label, days, want_hourly in TIERS:
        src = hourly_ if want_hourly else minimum
        out[label] = set().union(*(src[d] for d in days))
    return out


# --------------------------------------------------------------------------
# report
# --------------------------------------------------------------------------

def convergence(cur_xy, prop_xy, cur, prop):
    """Section A: the same area at four lattice pitches."""
    print("\n" + "=" * 76)
    print("A. HOW MUCH THE ANSWER DEPENDS ON THE LATTICE".center(76))
    print("=" * 76)
    print(f"  WEEK-ANY-MINIMUM at {PRIMARY} m, the union of walk radii around "
          "every stop with\n  a bus on any day, rasterised four ways:\n")
    print(f"    {'cell':>6s} {'cells now':>12s} {'now km2':>10s} "
          f"{'proposed km2':>14s} {'net km2':>10s} {'net %':>8s}")
    for cell_m in CELL_LADDER:
        a = covered_cells((cur_xy[s] for s in cur.served()), PRIMARY, cell_m)
        b = covered_cells((prop_xy[s] for s in prop.served()), PRIMARY, cell_m)
        ka, kb = km2(a, cell_m), km2(b, cell_m)
        print(f"    {cell_m:5d}m {len(a):12,d} {ka:10.1f} {kb:14.1f} "
              f"{kb - ka:+10.1f} {(kb - ka) / ka:+8.1%}")
    print(f"\n  The figures below use {CELL_M} m.")


def tier_report(cur_t, prop_t, cell_m, radius, rows):
    head = f"COVERAGE AS AREA WITHIN {radius} m, BY TIER"
    print("\n" + "=" * 76)
    print(head.center(76))
    print("=" * 76)
    print(f"  {'tier':24s} {'now':>9s} {'proposed':>10s} {'net':>9s} "
          f"{'net %':>7s} {'lost':>8s} {'gained':>8s}")
    for label, _d, _h in TIERS:
        a, b = cur_t[label], prop_t[label]
        ka, kb = km2(a, cell_m), km2(b, cell_m)
        lost, gained = km2(a - b, cell_m), km2(b - a, cell_m)
        pct = (kb - ka) / ka if ka else 0
        print(f"  {label:24s} {ka:9.1f} {kb:10.1f} {kb - ka:+9.1f} "
              f"{pct:+7.1%} {lost:8.1f} {gained:8.1f}")
        rows.append({"radius_m": radius, "cell_m": cell_m, "tier": label,
                     "current_km2": round(ka, 2), "proposed_km2": round(kb, 2),
                     "net_km2": round(kb - ka, 2), "net_pct": round(pct * 100, 1),
                     "lost_km2": round(lost, 2), "gained_km2": round(gained, 2),
                     "retained_km2": round(km2(a & b, cell_m), 2)})
    print("\n  km2 are of land, unweighted: a square kilometre of hillside and a "
          "square\n  kilometre of Brookline count the same. Lost + gained do not "
          "net out to zero\n  area moving -- they are two different places.")


def place_of(cell, cell_m, label_of, gaz, memo):
    """The place label of one cell: nearest labelled stop, or "unplaced"."""
    got = memo.get(cell)
    if got is None:
        hit = gaz.nearest(*centre(cell, cell_m), PLACE_RADIUS_M)
        got = memo[cell] = label_of.get(hit[0], "?") if hit else "unplaced"
    return got


def place_report(cur_t, prop_t, cell_m, label_of, gaz, memo, rows):
    """Section C: where the lost and gained area is."""
    print("\n" + "=" * 76)
    print(f"C. WHERE THE AREA MOVES, {PRIMARY} m (nearest labelled stop)"
          .center(76))
    print("=" * 76)
    for tier in ("WEEK-ANY-MINIMUM", "WEEKENDS-ANY-MINIMUM", "WEEK-ANY-HOURLY",
                 "WEEKEND-ANY-HOURLY"):
        a, b = cur_t[tier], prop_t[tier]
        net = defaultdict(float)
        for cells, sign in ((a - b, -1), (b - a, 1)):
            for cell in cells:
                net[place_of(cell, cell_m, label_of, gaz, memo)] += (
                    sign * cell_m * cell_m / 1e6)
        for place, v in net.items():
            rows.append({"tier": tier, "place": place, "net_km2": round(v, 3)})
        ranked = sorted(net.items(), key=lambda kv: kv[1])
        losing = ", ".join(f"{p} {v:.1f}" for p, v in ranked[:8] if v < -0.05)
        gaining = ", ".join(f"{p} +{v:.1f}"
                            for p, v in reversed(ranked[-8:]) if v > 0.05)
        print(f"\n  {tier}")
        print(f"    losing most:  {losing or 'nowhere'}")
        print(f"    gaining most: {gaining or 'nowhere'}")


MIN_BLOCK_KM2 = 0.1


def block_report(cur_t, prop_t, cell_m, label_of, gaz, memo, stop_gaz, names,
                 rows):
    """Section D: the largest contiguous blocks of lost and gained coverage.

    A municipality total says how much; this says where. Each block is named by
    the nearest stop in the network that has it -- the stop being lost for a
    lost block, the stop being added for a gained one -- because the answer a
    commenter needs is which road the buses come off.
    """
    for label, _d, _h in TIERS:
        a, b = cur_t[label], prop_t[label]
        for cells, side in ((a - b, "lost"), (b - a, "gained")):
            for blob in components(cells):
                area = km2(blob, cell_m)
                if area < MIN_BLOCK_KM2:
                    break  # components() is sorted, so the rest are smaller
                x = sum(centre(c, cell_m)[0] for c in blob) / len(blob)
                y = sum(centre(c, cell_m)[1] for c in blob) / len(blob)
                # The commonest place among the block's cells, not the place at
                # its centroid: a block can be a 6 km ribbon along one road and
                # its middle can fall in a township it barely touches.
                tally = defaultdict(int)
                for c in blob:
                    tally[place_of(c, cell_m, label_of, gaz, memo)] += 1
                ranked = sorted(tally.items(), key=lambda kv: (-kv[1], kv[0]))
                near = stop_gaz[side].nearest(x, y, 4_000)
                lat, lon = unproject(x, y)
                rows.append({
                    "tier": label, "side": side, "km2": round(area, 2),
                    "place": ranked[0][0], "n_places": len(ranked),
                    "also": ";".join(p for p, _n in ranked[1:4]),
                    "nearest_stop": names.get(near[0], "?") if near else "",
                    "nearest_stop_m": round(near[1]) if near else "",
                    "lat": round(lat, 5), "lon": round(lon, 5)})

    print("\n" + "=" * 76)
    print(f"D. THE LARGEST BLOCKS OF CHANGE, {PRIMARY} m".center(76))
    print("=" * 76)
    for side, word in (("lost", "LOSES ITS BUS ENTIRELY"),
                       ("gained", "GAINS A BUS WHERE THERE IS NONE TODAY")):
        print(f"\n  Ground that {word} (WEEK-ANY-MINIMUM):")
        hits = [r for r in rows
                if r["tier"] == "WEEK-ANY-MINIMUM" and r["side"] == side]
        for r in sorted(hits, key=lambda r: -r["km2"])[:10]:
            spread = f" +{r['n_places'] - 1}" if r["n_places"] > 1 else ""
            print(f"    {r['km2']:5.2f} km2  {r['place'][:30]:30s}{spread:3s} "
                  f"{r['nearest_stop'][:30]:30s} ({r['nearest_stop_m']} m)")
        rest = sorted(hits, key=lambda r: -r["km2"])[10:]
        if rest:
            print(f"    ... and {len(rest)} more blocks over "
                  f"{MIN_BLOCK_KM2} km2, {sum(r['km2'] for r in rest):.1f} km2 "
                  "between them")


def main():
    cell_m = int(sys.argv[1]) if len(sys.argv) > 1 else CELL_M
    print("Loading sources...")
    cur = gtfs.load_service(gtfs.current(), SAMPLE["current"],
                            period_of=period_of, to_axis=to_axis)
    prop = gtfs.load_service(gtfs.proposed(), SAMPLE["proposed"],
                             period_of=period_of, to_axis=to_axis)
    cur_xy = {s: project(*c) for s, c in cur.coords.items()}
    prop_xy = {s: project(*c) for s, c in prop.coords.items()}
    print(f"\n  bus stops with service -- today {len(cur.served()):,}, "
          f"proposed {len(prop.served()):,}")

    convergence(cur_xy, prop_xy, cur, prop)

    rows, place_rows = [], []
    for radius in RADII:
        cur_t = network_tiers(cur, cur_xy, radius, cell_m)
        prop_t = network_tiers(prop, prop_xy, radius, cell_m)
        tier_report(cur_t, prop_t, cell_m, radius, rows)
        if radius == PRIMARY:
            headline = (cur_t, prop_t)

    # The gazetteer spans both feeds' stops: the two share a stop-id namespace
    # (4,654 of the 5,413 proposed served stops carry a label), and gained area
    # sits where the proposal puts stops, not where today's are.
    xy = {**prop_xy, **cur_xy}
    labels, _boardings = load_labels()
    label_of, dropped = drop_outliers(
        labels, {s: c for s, c in {**prop.coords, **cur.coords}.items()})
    print(f"\n  place labels: {len(label_of):,} stops labelled, "
          f"{len(dropped)} dropped as geographic outliers")
    gaz = Bucket(PLACE_RADIUS_M)
    for sid in sorted(label_of):
        if sid in xy:
            gaz.add(*xy[sid], sid)
    memo = {}
    place_report(*headline, cell_m, label_of, gaz, memo, place_rows)

    names = stop_names(gtfs.proposed())
    names.update(stop_names(gtfs.current()))
    stop_gaz = {"lost": Bucket(4_000), "gained": Bucket(4_000)}
    for sid in sorted(cur.served()):
        if sid in cur_xy:
            stop_gaz["lost"].add(*cur_xy[sid], sid)
    for sid in sorted(prop.served()):
        if sid in prop_xy:
            stop_gaz["gained"].add(*prop_xy[sid], sid)
    block_rows = []
    block_report(*headline, cell_m, label_of, gaz, memo, stop_gaz, names,
                 block_rows)

    for out, data in ((DATA / "coverage_area.csv", rows),
                      (DATA / "coverage_area_places.csv", place_rows),
                      (DATA / "coverage_area_blocks.csv", block_rows)):
        with open(out, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(data[0].keys()))
            w.writeheader()
            w.writerows(data)
        print(f"\nWrote {out} ({len(data):,} rows)")

    print("\nNOTE: area is unweighted land inside the walk radius, from a "
          f"{cell_m} m lattice.\n      It says how much ground keeps a bus, not "
          "how many people do -- for\n      that, read the per-location tiers in "
          "data/coverage_change.csv.")


if __name__ == "__main__":
    main()
