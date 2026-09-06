#!/usr/bin/env python3
"""Which removals of bus service take the most riders with them.

This asks a narrower question than any of `analyze_coverage_change.py`'s five
tiers: not "how does service change here" but, among the locations that lose
EVERY bus (the `WEEK-ANY-MINIMUM` tier at 0), which losses matter most by
convention 15's weighting -- observed boardings. It is that convention's
"never quote one alone" rule, applied to a ranking rather than a total: the
headline says the plan is roughly service-neutral by location while covering
12% less ground; this says which of the losing locations actually carried
riders, and confirms the flat part of that headline is flat because the
biggest losses carry almost none.

    python3 analyze_removed_ridership.py   -> data/removed_ridership.csv

Needs `analyze_coverage_change.py` to have run (reads its output directly) and
`ingest_boundaries.py` to have run (for `data/place_boundaries.json`).

## WHY CLUSTER AT ALL -- CONVENTION 2, ARRIVED AT A RANKING

PRT gives opposite-direction stops at one corner different ids under the same
corridor name, and a plan that consolidates a corridor onto one side leaves
one id served and the other not. A stop-id-level ranking would then list that
single loss twice, at half its real weight each time, and a real corridor loss
(four Chartiers Ave stops in a row, none of them individually the biggest
number) would never surface at all. So removed locations are grouped by
single-linkage clustering at `CLUSTER_RADIUS_M` -- convention 4's strict
same-corner test -- before they are ranked, and the boardings are summed
across a cluster's members. Single linkage chains along a corridor by design:
a stop 140 m from one cluster member and 140 m from another belongs to the
same loss even if it is 280 m from the first. That is verified not to run
away on the real data: at 400 m the 593 removed locations produce 286
clusters, the largest 14 members spanning 681 m -- a real corridor, not a
run-on chain across a neighbourhood.

## WHY TWO RADII SHIP -- CONVENTION 4

400 m is the headline quarter-mile access distance and 150 m the strict
same-corner test; they disagree at real "PRTX" station consolidations, so
both are computed and written, distinguished by `radius_m`, rather than
picking one.

## WHY THE PLACE COMES FROM CONTAINMENT, NOT PRT'S LABEL -- CONVENTION 6

PRT's `MUNI` field is wrong by up to 40 km at real stops -- the #2 removed
stop by boardings, Presidential Dr at Babcock, is labelled Duquesne and sits
in McCandless, 25 km away. So a cluster's place is looked up by containment
(`analyze_equity_places.place_index`/`place_at`) at its most-boarded member's
own coordinates, never at the cluster centroid: for a 681 m corridor the
centroid can fall in the next municipality from where the riders actually
board. The boundary file is Allegheny-only, so a cluster outside the county
(Trafford borough, in Westmoreland, is the 9th-largest loss) gets no
containment hit; it falls back to the members' own PRT `muni` label, and
`place_source` records which of the two named it, because a reader has to be
able to see which rows rest on the label convention 6 distrusts.

## THE THREE THINGS THIS BORROWS FROM CONVENTION 15, UNCHANGED

Boardings are a weighting on an existing loss, not a new measure, and they
carry the same three caveats here as everywhere else in this repo they are
quoted. They are one-sided: a location the plan adds a bus to has never had a
rider counted at it and never can, so this file only ever ranks what is at
risk, never what is gained -- there is no "removed ridership" for a location
with no prior service to lose. They are not people: PRT's May 2025 usage
extract is unlinked and unweighted boardings, and PRT's own disclaimer calls
them unadjusted, unofficial totals that may understate ridership by up to
30%. And the measure is circular: the plan concentrates service where
ridership already is, so a ranking of the losses by today's boardings is
partly a ranking of how thoroughly the plan did the thing it was optimised to
do -- which is exactly why the flat share (well under 1% of system boardings,
at both radii) is worth reporting rather than a surprise.
"""
import csv
import math
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

DATA = Path(__file__).resolve().parent / "data"
COVERAGE_CSV = DATA / "coverage_change.csv"
BOUNDARIES = DATA / "place_boundaries.json"
OUT_CSV = DATA / "removed_ridership.csv"

from analyze_equity_places import place_index  # noqa: E402

# Radii published for REMOVED, in report order (400 first) -> the
# coverage_change.csv column pair each reads. Convention 4: both ship.
RADIUS_COLUMNS = {
    400: ("cur_week_any_minimum", "prop_week_any_minimum"),
    150: ("cur_week_any_minimum_150m", "prop_week_any_minimum_150m"),
}

# Single-linkage distance, metres: convention 4's strict same-corner test,
# reused here to merge a corridor's stop ids into one loss (convention 2).
CLUSTER_RADIUS_M = 150

M_PER_DEG_LAT = 111_320.0

# Where a cluster's place comes from -- a reader must be able to tell which
# rows rest on the boundary and which fall back to PRT's own mislabelled
# field (convention 6).
PLACE_SOURCE_BOUNDARY = "boundary"
PLACE_SOURCE_PRT_LABEL = "prt_label"

# PRT writes a stop name as "STREET <separator> everything else", separators
# being any of these words or symbols, in PRT's own capitalisation.
STREET_SPLIT_RE = re.compile(r"\s+(?:\+|AT|OPP|OPPOSITE|AND|&)\s+")

REPORT_TOP_N = 15

OUT_COLUMNS = [
    "radius_m", "cluster_id", "place", "place_source", "primary_street",
    "top_stop_id", "top_stop_name", "n_stops", "span_m", "lat", "lon",
    "weekday_boardings", "saturday_boardings", "sunday_boardings",
    "current_routes", "stop_ids",
]


def safe_float(value):
    """A CSV cell as a float, or 0.0 for the empty cells this repo writes."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def stop_sort_key(stop_id):
    """Sort stop ids numerically where they parse, so "7280" < "19514"."""
    try:
        return (0, int(stop_id))
    except (TypeError, ValueError):
        return (1, stop_id)


def distance_m(point_a, point_b):
    """Flat local approximation, metres, between two (lat, lon) points.

    Good enough at corridor scale (convention 4's radii) without a projection
    dependency this repo does not carry; the latitude used for the longitude
    scale is the pair's own mean, so it stays accurate pair to pair rather
    than drifting from a single reference point across the county.
    """
    lat_a, lon_a = point_a
    lat_b, lon_b = point_b
    lat_rad = math.radians((lat_a + lat_b) / 2)
    dlat = (lat_a - lat_b) * M_PER_DEG_LAT
    dlon = (lon_a - lon_b) * M_PER_DEG_LAT * math.cos(lat_rad)
    return math.hypot(dlat, dlon)


def removed_rows(rows, *, cur_col, prop_col):
    """Locations with any bus today and none proposed, at one radius's test."""
    return [r for r in rows if r[cur_col] == "1" and r[prop_col] == "0"]


def clusters_from(rows, *, radius_m):
    """Group rows by single-linkage clustering at `radius_m`.

    Union-find over every pair: the removed sets here are at most low
    thousands of rows, so the O(n^2) pairwise distance check is cheap and
    keeps the result exactly single-linkage rather than an approximation.
    Chaining along a corridor is wanted, not a bug -- see the module
    docstring.
    """
    n = len(rows)
    parent = list(range(n))

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    def union(i, j):
        ri, rj = find(i), find(j)
        if ri != rj:
            parent[ri] = rj

    coords = [(float(r["lat"]), float(r["lon"])) for r in rows]
    for i in range(n):
        for j in range(i + 1, n):
            if distance_m(coords[i], coords[j]) <= radius_m:
                union(i, j)

    groups = defaultdict(list)
    for i in range(n):
        groups[find(i)].append(rows[i])
    return list(groups.values())


def top_member(members):
    """The most-boarded member, ties broken by smallest stop id.

    This is the point a cluster's place is looked up at, per the module
    docstring: the riders, not the corridor's geographic middle.
    """
    return min(members, key=lambda r: (
        -safe_float(r["weekday_boardings"]), stop_sort_key(r["stop_id"])))


def span_m(members):
    """The largest pairwise distance within a cluster, 0 for a single stop."""
    coords = [(float(r["lat"]), float(r["lon"])) for r in members]
    if len(coords) < 2:
        return 0
    return round(max(
        distance_m(coords[i], coords[j])
        for i in range(len(coords)) for j in range(i + 1, len(coords))))


def mean_coords(members):
    lats = [float(r["lat"]) for r in members]
    lons = [float(r["lon"]) for r in members]
    return round(sum(lats) / len(lats), 6), round(sum(lons) / len(lons), 6)


def routes_union(members):
    """Sorted unique routes across every member, re-joined with ';'."""
    routes = set()
    for r in members:
        routes.update(x for x in r.get("current_routes", "").split(";") if x)
    return ";".join(sorted(routes))


def stop_ids_joined(members):
    return ";".join(sorted(
        (r["stop_id"] for r in members), key=stop_sort_key))


def leading_street(stop_name):
    """A stop name up to its first separator: "HOMEVILLE RD OPP ..." -> "HOMEVILLE RD"."""
    return STREET_SPLIT_RE.split(stop_name, maxsplit=1)[0].strip()


def primary_street(members):
    """The shared leading street, or "" where members disagree.

    A strict majority is required -- half or fewer sharing a street is not
    "this corridor", it is a cluster that happens to straddle a corner.
    """
    streets = [leading_street(r["stop_name"]) for r in members]
    street, count = Counter(streets).most_common(1)[0]
    return street if count * 2 > len(members) else ""


def place_and_source(members, *, index):
    """(place, place_source) for a cluster: containment first, PRT label second.

    Looked up at the most-boarded member's own coordinates -- see
    `top_member` and the module docstring's containment section.
    """
    top = top_member(members)
    hit = index.place_at(float(top["lat"]), float(top["lon"])) if index else None
    if hit:
        return hit.name, PLACE_SOURCE_BOUNDARY
    labels = Counter(r["muni"] for r in members if r.get("muni"))
    place = labels.most_common(1)[0][0] if labels else ""
    return place, PLACE_SOURCE_PRT_LABEL


def summarize_cluster(members, *, index):
    """One output row for a cluster of removed locations."""
    top = top_member(members)
    place, place_source = place_and_source(members, index=index)
    lat, lon = mean_coords(members)
    return {
        "cluster_id": min((r["stop_id"] for r in members), key=stop_sort_key),
        "place": place,
        "place_source": place_source,
        "primary_street": primary_street(members),
        "top_stop_id": top["stop_id"],
        "top_stop_name": top["stop_name"],
        "n_stops": len(members),
        "span_m": span_m(members),
        "lat": lat,
        "lon": lon,
        "weekday_boardings": round(
            sum(safe_float(r["weekday_boardings"]) for r in members), 1),
        "saturday_boardings": round(
            sum(safe_float(r["saturday_boardings"]) for r in members), 1),
        "sunday_boardings": round(
            sum(safe_float(r["sunday_boardings"]) for r in members), 1),
        "current_routes": routes_union(members),
        "stop_ids": stop_ids_joined(members),
    }


def build_rows(coverage_rows, *, index):
    """Every (radius, cluster) row, sorted per the module's published order."""
    out = []
    for radius_m, (cur_col, prop_col) in RADIUS_COLUMNS.items():
        removed = removed_rows(coverage_rows, cur_col=cur_col, prop_col=prop_col)
        clusters = clusters_from(removed, radius_m=CLUSTER_RADIUS_M)
        summaries = [summarize_cluster(c, index=index) for c in clusters]
        summaries.sort(key=lambda r: -r["weekday_boardings"])
        for s in summaries:
            s["radius_m"] = radius_m
        out.extend(summaries)
    return out


def write(rows):
    with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=OUT_COLUMNS)
        w.writeheader()
        for r in rows:
            w.writerow(r)


def report(rows, *, coverage_rows):
    """The stdout draft material for the findings: see the module docstring."""
    total_system_boardings = sum(
        safe_float(r["weekday_boardings"]) for r in coverage_rows)

    for radius_m, (cur_col, prop_col) in RADIUS_COLUMNS.items():
        removed = removed_rows(coverage_rows, cur_col=cur_col, prop_col=prop_col)
        clusters = [r for r in rows if r["radius_m"] == radius_m]
        # Summed from the removed locations directly, not from the CSV's
        # already-rounded per-cluster totals -- clustering only partitions
        # the same rows, so re-summing the rounded pieces would drift from
        # the true total by the accumulated rounding error of ~300 clusters.
        total = sum(safe_float(r["weekday_boardings"]) for r in removed)
        share = total / total_system_boardings if total_system_boardings else 0
        nobody = sum(1 for r in removed if safe_float(r["weekday_boardings"]) == 0)
        fallback = sum(
            1 for r in clusters if r["place_source"] == PLACE_SOURCE_PRT_LABEL)

        print("\n" + "=" * 76)
        print(f"REMOVED RIDERSHIP AT {radius_m} m".center(76))
        print("=" * 76)
        print(f"  {len(removed)} locations lose all bus service, clustered into "
              f"{len(clusters)} losses.")
        print(f"  Those losses carry {total:.1f} of the system's "
              f"{total_system_boardings:.1f} weekday boardings ({share:.1%}).")
        print(f"  {nobody} of {len(removed)} removed locations board nobody at "
              "all.")
        print(f"  {fallback} of {len(clusters)} losses are named from PRT's own "
              "MUNI label rather than a containing boundary.")

        if radius_m == 400:
            print(f"\n  Top {REPORT_TOP_N} losses by weekday boardings:")
            print(f"  {'boardings':>10s} {'stops':>6s} {'span_m':>7s} "
                  f"{'street / top stop':<38s} place")
            for r in clusters[:REPORT_TOP_N]:
                street = r["primary_street"] or r["top_stop_name"]
                print(f"  {r['weekday_boardings']:10.1f} {r['n_stops']:6d} "
                      f"{r['span_m']:7d} {street:<38s} {r['place']}")

    print("\n  Boardings are unlinked, unweighted counts from PRT's May 2025 "
          "usage extract,\n  which PRT's own disclaimer calls unadjusted, "
          "unofficial totals that may\n  understate ridership by up to 30%. "
          "A location the plan adds a bus to has no\n  boardings and never "
          "can -- this ranks what is at risk, never what is gained.\n  Quote "
          "beside the location, area, street, people and one-seat figures, "
          "never alone\n  (convention 10).")


def main():
    if not COVERAGE_CSV.exists():
        sys.exit(f"missing {COVERAGE_CSV} -- run analyze_coverage_change.py first")

    with open(COVERAGE_CSV, encoding="utf-8") as f:
        coverage_rows = list(csv.DictReader(f))

    index = place_index()  # sys.exits if place_boundaries.json is missing

    rows = build_rows(coverage_rows, index=index)
    write(rows)
    print(f"wrote {OUT_CSV.relative_to(DATA.parent)} -- {len(rows)} rows")
    report(rows, coverage_rows=coverage_rows)


if __name__ == "__main__":
    main()
