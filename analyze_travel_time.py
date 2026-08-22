#!/usr/bin/env python3
"""
Door-to-door trip time change under the Bus Line Refresh.

Every other script in this repo counts service -- stops, trips, headways,
one-seat rides. This one asks what a rider actually experiences: starting at
a place, ready at any minute in the weekday morning peak, how long does it
take to get to Downtown or Oakland, on each network? `journey.py` is the
router that answers that for one origin-destination pair; this script runs
it over the same 187 places x 2 anchors that `analyze_one_seat.py` already
publishes, so a reader can put "does this place still have a one-seat ride"
next to "how long does the ride actually take" for the same place.

THE WINDOW: weekday, ready any minute 07:00-09:00. The AM peak is where a
one-seat-ride answer matters most (a commute, not a discretionary trip), and
it is the window `journey.profile`'s divide-and-conquer collapse was
measured against (module docstring, "HOW MUCH THIS ACTUALLY SAVES").

THE PAIRS come from `data/oneseat_change.csv`, read rather than re-derived,
so this analysis can never quote a place or an anchor the one-seat answer
does not also cover.

THE ORIGIN, in two tiers, and the CSV records which one a place used:

  * PREFERRED ("residents"): the population-weighted centre of population of
    every census block group (`data/census_block_groups.csv`) whose nearest
    labelled stop is this place -- `analyze_equity_places.label_for` over a
    grid of `analyze_equity_places.load_place_labels()`. This is where the
    people actually live, weighted by how many of them live where, which is
    the honest question "how long does it take a resident of this place to
    get downtown" is asking. Covers 177 of 187 places.
  * FALLBACK ("stops"): the mean coordinate of the place's own labelled
    stops, used only where no block group's population centre resolves to
    it. This is where today's buses run rather than where residents live,
    and it is a materially weaker origin -- ten places need it (Bedford
    Dwellings, Central Northside, Chateau, Esplen, Findlay township
    (Allegheny, PA), Mt. Oliver, New Homestead, St. Clair, West End, West
    Homestead borough (Allegheny, PA)), and several of them are small,
    low-income places the equity analysis already singles out for coverage
    loss. So the weaker origins are not randomly distributed across the 187
    places, and a "which places lose the most travel time" ranking built on
    this file needs that caveat attached, not just a footnote about which
    tier a row used.

  Matching is done on the RAW place label `analyze_one_seat.py` produces,
  never `analyze_equity_places.tidy()`'d -- `oneseat_change.csv`'s `place`
  column keeps the " (Allegheny, PA)" municipality suffix on 103 of its 187
  rows, and tidying before the match would silently fail to place those 103
  block groups at all.

THE DESTINATION for an anchor is the mean coordinate of the labelled stops
whose place sits inside that anchor district (`analyze_one_seat.ANCHORS`).
That is a real narrowing against the published one-seat method, which draws
a radius around every anchor stop: "getting to Downtown" here means reaching
the district's single centre of stops, not arriving anywhere inside it. A
place that is well served by one edge of Downtown and poorly served by the
opposite edge will read as roughly the average of the two, which the
one-seat answer does not do.

BOTH NETWORKS, BOTH TRANSFER RADII. `docs/worklog/
transfer-radius-favours-one-network.md` argues that the walk a rider will
make between two stops is not a value that cancels out between the two
networks -- the Refresh trades corridor coverage for frequency, which is
exactly the trade that turns some one-seat rides into two-seat ones, so a
generous transfer radius can only ever flatter the network that leans on
transfers more. Every pair is therefore searched at both
`journey.MAX_TRANSFER_WALK_M` (the headline, 400 m) and `STRICT_TRANSFER_
WALK_M` (150 m, convention 4's strict same-corner distance). The printed
report's flip count -- how many pairs change the SIGN of their travel-time
change between the two radii, not just its size -- is the number that
answers that worklog entry's open question for this layer: if it is near
zero, the headline change is safe to quote; if it is large, the flip count
is the finding and the median is not.

WHAT THIS DOES NOT MEASURE. It is SCHEDULE AGAINST SCHEDULE. Today's side is
compared at its scheduled times, not the times its buses actually run; the
proposed side has no observed times and never will, so schedule-to-schedule
is the only symmetric comparison available. It is not the same claim as "the
trip will take this long", and a number from this file quoted without that
caveat is making the stronger claim by omission. A profile also has no notion
of fare, comfort, or crowding, and it takes the RAPTOR search's own
connection model on faith -- see journey.py's docstring for the walking
speed, transfer walk and buffer that decide whether a synthesised connection
is real. It also inherits
convention 13: this is the one analysis in the repo (besides one-seat) that
counts rail and the inclines, because a journey is not a service quantity.

    python3 -u analyze_travel_time.py   # -> data/trip_time_change.csv

WHEN A PAIR HAS NO COMPARABLE TRAVEL TIME. Travel time is only defined where
both networks reach the origin, reach the destination, AND turn up an
itinerary in the window -- three different failure modes that a bare "no
median" collapses into one. `docs/worklog/
one-point-cannot-represent-a-township.md` is the entry that found this: of
369 published pairs, 76 are unreachable on at least one network, and most of
those are an origin-coverage artefact (a place's population-weighted origin
happens to sit outside the 400 m access walk of any stop) rather than
anything about *time*. Whether a point has a stop within reach is a coverage
question, and it is already answered properly -- at every point, not one
arbitrary one, with tiers and a radius sensitivity -- by
`analyze_coverage_change.py`. Publishing "Mount Lebanon loses all peak access
to Downtown" from this layer would be quoting that coverage result as if it
were a travel-time finding: convention 10's error, and convention 3's trap
("a vanished stop id is not a lost bus") one unit up, weaker still because it
is a vanished stop near one *chosen point* rather than a real corridor.

So every row's classification is computed per transfer radius (`{radius_key}
_classification`, one of the `CLASS_*` constants below) from the access-stop
counts (`{radius_key}_{side}_{origin,dest}_access_stops`, via
`journey.access_stops`) and the medians already computed: COMPARABLE only
when both networks return a median; NO_ORIGIN_COVERAGE / NO_DEST_COVERAGE
when the origin or destination has zero stops within the access walk on
either network (checked in that order, since the worklog's cases are
overwhelmingly origin-side); NO_JOURNEY only when stops exist in reach on
both ends but no itinerary was found. The printed report and every headline
statistic in this file (the change distribution, the flip count) are
computed over COMPARABLE pairs only, and the denominator is stated wherever a
headline number is printed -- never hardcoded, since it moves if the pair
list or the network does.
"""

import csv
import statistics
import sys
import time
from collections import defaultdict
from pathlib import Path

import gtfs
import journey
from analyze_one_seat import ANCHORS
from analyze_equity_places import label_for, label_grid, load_place_labels

DATA = Path("data")
ONESEAT_CSV = DATA / "oneseat_change.csv"
CENSUS_BLOCK_GROUPS_CSV = DATA / "census_block_groups.csv"
OUT_CSV = DATA / "trip_time_change.csv"

# A rider ready at any minute in the weekday morning peak. `journey.profile`'s
# window is (start, end) with end EXCLUSIVE, so this is exactly 07:00-08:59.
DAY_TYPE = "weekday"
WINDOW_START_MIN = 7 * 60
WINDOW_END_MIN = 9 * 60
WINDOW = (WINDOW_START_MIN, WINDOW_END_MIN)

CURRENT = "current"
PROPOSED = "proposed"
SIDES = (CURRENT, PROPOSED)

# Convention 4's strict same-corner walk distance, applied here to the
# transfer radius rather than the access radius -- see the module docstring
# and docs/worklog/transfer-radius-favours-one-network.md for why the
# transfer radius specifically needs its own sensitivity run.
HEADLINE = "headline"
STRICT = "strict"
STRICT_TRANSFER_WALK_M = 150.0
TRANSFER_RADII_M = {HEADLINE: journey.MAX_TRANSFER_WALK_M,
                    STRICT: STRICT_TRANSFER_WALK_M}
RADIUS_KEYS = (HEADLINE, STRICT)

ORIGIN_SOURCE_RESIDENTS = "residents"
ORIGIN_SOURCE_STOPS = "stops"

# Why a pair has no comparable travel time at a given transfer radius -- see
# the module docstring's "WHEN A PAIR HAS NO COMPARABLE TRAVEL TIME" section.
# Checked in this order: origin coverage is tested before destination
# coverage, since the worklog's unreachable pairs are overwhelmingly
# origin-side.
CLASS_COMPARABLE = "comparable"
CLASS_NO_ORIGIN_COVERAGE = "no_origin_coverage"
CLASS_NO_DEST_COVERAGE = "no_dest_coverage"
CLASS_NO_JOURNEY = "no_journey"
CLASSIFICATIONS = (CLASS_COMPARABLE, CLASS_NO_ORIGIN_COVERAGE,
                   CLASS_NO_DEST_COVERAGE, CLASS_NO_JOURNEY)

# Below this, a sign flip between the headline and strict transfer radius is
# a rounding-scale artefact (e.g. +0.2 -> -0.3 min) rather than a reversal
# worth reporting -- see _print_flips and convention 14.
FLIP_MATERIAL_THRESHOLD_MIN = 2.0

COORD_DP = 6
MINUTE_DP = 1
FRACTION_DP = 3

PROFILE_SUFFIXES = ("median_min", "best_min", "worst_min", "reachable_fraction",
                    "median_transfers", "median_wait_min")
ACCESS_SUFFIXES = ("origin_access_stops", "dest_access_stops")
BASE_FIELDS = ["place", "anchor", "origin_lat", "origin_lon", "origin_source",
              "dest_lat", "dest_lon"]
COMBO_FIELDS = [f"{radius_key}_{side}_{suffix}"
               for radius_key in RADIUS_KEYS for side in SIDES
               for suffix in PROFILE_SUFFIXES]
ACCESS_FIELDS = [f"{radius_key}_{side}_{suffix}"
                 for radius_key in RADIUS_KEYS for side in SIDES
                 for suffix in ACCESS_SUFFIXES]
CLASSIFICATION_FIELDS = [f"{radius_key}_classification" for radius_key in RADIUS_KEYS]
CHANGE_FIELDS = ["change_headline_min", "change_strict_min",
                 "sign_flips_between_radii"]
FIELDNAMES = (BASE_FIELDS + COMBO_FIELDS + ACCESS_FIELDS
             + CLASSIFICATION_FIELDS + CHANGE_FIELDS)

COORD_FIELDS = {"origin_lat", "origin_lon", "dest_lat", "dest_lon"}
MINUTE_FIELDS = ({f"{r}_{s}_{suf}" for r in RADIUS_KEYS for s in SIDES
                 for suf in ("median_min", "best_min", "worst_min",
                             "median_transfers", "median_wait_min")}
                | {"change_headline_min", "change_strict_min"})
FRACTION_FIELDS = {f"{r}_{s}_reachable_fraction" for r in RADIUS_KEYS for s in SIDES}

PROGRESS_EVERY = 1   # rows; a profile is slow enough that per-row is right


# --------------------------------------------------------------------------
# loading the pair list and the geometry it needs
# --------------------------------------------------------------------------

def load_pairs():
    """The published (place, anchor) rows, read rather than re-derived."""
    if not ONESEAT_CSV.exists():
        sys.exit(f"missing {ONESEAT_CSV} -- run analyze_one_seat.py first")
    with open(ONESEAT_CSV, encoding="utf-8") as f:
        return [{"place": r["place"], "anchor": r["anchor"]}
                for r in csv.DictReader(f)]


def load_census_block_groups():
    if not CENSUS_BLOCK_GROUPS_CSV.exists():
        sys.exit(f"missing {CENSUS_BLOCK_GROUPS_CSV} -- run ingest_census.py first")
    with open(CENSUS_BLOCK_GROUPS_CSV, encoding="utf-8") as f:
        return list(csv.DictReader(f))


# --------------------------------------------------------------------------
# origins: population-weighted where a block group resolves to a place,
# the place's own stops otherwise
# --------------------------------------------------------------------------

def population_weighted_origins(block_groups, label_lookup_grid):
    """{place: (lat, lon)} at the population-weighted centre of every block
    group whose nearest labelled stop is that place. Zero-population block
    groups (unpopulated land) are skipped rather than weighted at zero,
    which would be a no-op, to make the skip visible in the code.

    Matches `label_for` on the RAW place label -- see the module docstring
    on why `tidy()` must not run here.
    """
    sums = defaultdict(lambda: [0.0, 0.0, 0.0])
    for bg in block_groups:
        population = float(bg["population"])
        if population <= 0:
            continue
        lat, lon = float(bg["lat"]), float(bg["lon"])
        place, _distance = label_for(lat, lon, label_lookup_grid)
        if place is None:
            continue
        acc = sums[place]
        acc[0] += lat * population
        acc[1] += lon * population
        acc[2] += population
    return {place: (lat_sum / pop, lon_sum / pop)
            for place, (lat_sum, lon_sum, pop) in sums.items()}


def stop_mean_origins(labelled_stops):
    """{place: (lat, lon)} at the mean of a place's own labelled stops --
    the fallback tier, used only where no block group resolves to a place."""
    sums = defaultdict(lambda: [0.0, 0.0, 0])
    for lat, lon, place in labelled_stops:
        acc = sums[place]
        acc[0] += lat
        acc[1] += lon
        acc[2] += 1
    return {place: (lat_sum / n, lon_sum / n)
            for place, (lat_sum, lon_sum, n) in sums.items()}


def resolve_origins(places, residents_origins, stops_origins):
    """{place: (lat, lon, source)}, preferring the population-weighted
    origin and falling back to the stop mean -- see the module docstring."""
    origins = {}
    for place in places:
        if place in residents_origins:
            lat, lon = residents_origins[place]
            origins[place] = (lat, lon, ORIGIN_SOURCE_RESIDENTS)
        elif place in stops_origins:
            lat, lon = stops_origins[place]
            origins[place] = (lat, lon, ORIGIN_SOURCE_STOPS)
        else:
            sys.exit(f"no origin resolves for place {place!r}: no census block "
                     "group and no labelled stop names it")
    return origins


def anchor_destinations(labelled_stops):
    """{anchor: (lat, lon)} at the mean of the labelled stops inside each
    anchor district -- see the module docstring on why this narrows the
    published one-seat method's radius-around-every-stop test."""
    sums = defaultdict(lambda: [0.0, 0.0, 0])
    for lat, lon, place in labelled_stops:
        for anchor, hoods in ANCHORS.items():
            if place in hoods:
                acc = sums[anchor]
                acc[0] += lat
                acc[1] += lon
                acc[2] += 1
    missing = [a for a in ANCHORS if a not in sums]
    if missing:
        sys.exit(f"no labelled stops found for anchor(s) {missing}")
    return {anchor: (lat_sum / n, lon_sum / n)
            for anchor, (lat_sum, lon_sum, n) in sums.items()}


# --------------------------------------------------------------------------
# timetables: one per (side, transfer radius), built once and reused across
# every pair
# --------------------------------------------------------------------------

def load_side_patterns(side):
    feed = gtfs.current() if side == CURRENT else gtfs.proposed()
    by_day, coords = gtfs.load_patterns(feed, gtfs.SAMPLE[side], quiet=True)
    return by_day[DAY_TYPE], coords


def build_timetables():
    """{(side, radius_key): journey.Timetable}, one GTFS parse per side."""
    timetables = {}
    for side in SIDES:
        print(f"  loading {side} weekday patterns...")
        patterns, coords = load_side_patterns(side)
        for radius_key in RADIUS_KEYS:
            radius_m = TRANSFER_RADII_M[radius_key]
            print(f"  building {side}/{radius_key} timetable "
                  f"(transfer walk {radius_m:.0f} m)...")
            timetables[(side, radius_key)] = journey.Timetable.build(
                label=f"{side}-{radius_key}", patterns=patterns, coords=coords,
                max_transfer_walk_m=radius_m)
    return timetables


# --------------------------------------------------------------------------
# one pair, one combination of side and transfer radius
# --------------------------------------------------------------------------

def profile_summary(tt, origin, dest):
    """The numbers this CSV publishes for one (timetable, origin, dest).

    Rounded HERE, at the published precision, rather than on the way out to
    the file. Everything downstream -- the change columns, the flip flag, the
    printed report -- is then derived from the same numbers a reader can see,
    so the file's own arithmetic checks out. Deriving from full precision and
    publishing rounded values is what produced a pair flagged as reversing
    sign between two radii whose published changes were 0.0 and -1.0: true of
    the hidden floats, false of the file.
    """
    prof = journey.profile(tt, origin, dest, window=WINDOW)
    if not prof.journeys:
        return {"median_min": None, "best_min": None, "worst_min": None,
                "reachable_fraction": round(prof.reachable_fraction, FRACTION_DP),
                "median_transfers": None, "median_wait_min": None}
    return {
        "median_min": round(prof.median_minutes, MINUTE_DP),
        "best_min": round(prof.best_minutes, MINUTE_DP),
        "worst_min": round(prof.worst_minutes, MINUTE_DP),
        "reachable_fraction": round(prof.reachable_fraction, FRACTION_DP),
        "median_transfers": statistics.median(j.transfers for j in prof.journeys),
        "median_wait_min": round(
            statistics.median(j.wait_minutes for j in prof.journeys), MINUTE_DP),
    }


def _change(proposed_median, current_median):
    """Rounded again after subtracting: two values each rounded to one decimal
    can differ by a float a hair off the decimal they imply."""
    if proposed_median is None or current_median is None:
        return None
    return round(proposed_median - current_median, MINUTE_DP)


def _sign_flips(change_headline, change_strict):
    if change_headline is None or change_strict is None:
        return None
    return (change_headline * change_strict) < 0


def access_stop_count(tt, point):
    """How many stops are within the access walk of a point on one
    timetable -- the coverage half of "why is this pair unreachable", kept
    separate from `profile_summary`'s travel-time half. See the module
    docstring's "WHEN A PAIR HAS NO COMPARABLE TRAVEL TIME" section."""
    return len(journey.access_stops(tt, point, journey.MAX_ACCESS_WALK_M))


def classify(origin_access, dest_access, current_median, proposed_median):
    """Why a pair has no comparable travel time at one transfer radius, per
    the module docstring. `origin_access` and `dest_access` are
    {side: stop_count}."""
    if current_median is not None and proposed_median is not None:
        return CLASS_COMPARABLE
    if origin_access[CURRENT] == 0 or origin_access[PROPOSED] == 0:
        return CLASS_NO_ORIGIN_COVERAGE
    if dest_access[CURRENT] == 0 or dest_access[PROPOSED] == 0:
        return CLASS_NO_DEST_COVERAGE
    return CLASS_NO_JOURNEY


def compute_row(pair, origins, destinations, timetables):
    place, anchor = pair["place"], pair["anchor"]
    origin_lat, origin_lon, origin_source = origins[place]
    dest_lat, dest_lon = destinations[anchor]
    origin_point = (origin_lat, origin_lon)
    dest_point = (dest_lat, dest_lon)

    row = {"place": place, "anchor": anchor,
           "origin_lat": origin_lat, "origin_lon": origin_lon,
           "origin_source": origin_source,
           "dest_lat": dest_lat, "dest_lon": dest_lon}

    summaries = {}
    for radius_key in RADIUS_KEYS:
        origin_access, dest_access = {}, {}
        for side in SIDES:
            tt = timetables[(side, radius_key)]
            summary = profile_summary(tt, origin_point, dest_point)
            summaries[(radius_key, side)] = summary
            prefix = f"{radius_key}_{side}_"
            for suffix in PROFILE_SUFFIXES:
                row[prefix + suffix] = summary[suffix]

            origin_access[side] = access_stop_count(tt, origin_point)
            dest_access[side] = access_stop_count(tt, dest_point)
            row[prefix + "origin_access_stops"] = origin_access[side]
            row[prefix + "dest_access_stops"] = dest_access[side]

        row[f"{radius_key}_classification"] = classify(
            origin_access, dest_access,
            summaries[(radius_key, CURRENT)]["median_min"],
            summaries[(radius_key, PROPOSED)]["median_min"])

    row["change_headline_min"] = _change(
        summaries[(HEADLINE, PROPOSED)]["median_min"],
        summaries[(HEADLINE, CURRENT)]["median_min"])
    row["change_strict_min"] = _change(
        summaries[(STRICT, PROPOSED)]["median_min"],
        summaries[(STRICT, CURRENT)]["median_min"])
    row["sign_flips_between_radii"] = _sign_flips(
        row["change_headline_min"], row["change_strict_min"])
    return row


# --------------------------------------------------------------------------
# writing
# --------------------------------------------------------------------------

def _rounded(field, value):
    if not isinstance(value, float):
        return value
    if field in COORD_FIELDS:
        return round(value, COORD_DP)
    if field in MINUTE_FIELDS:
        return round(value, MINUTE_DP)
    if field in FRACTION_FIELDS:
        return round(value, FRACTION_DP)
    return value


def write(rows):
    with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        for row in rows:
            writer.writerow({k: _rounded(k, row.get(k)) for k in FIELDNAMES})


# --------------------------------------------------------------------------
# the printed report
# --------------------------------------------------------------------------

def _print_constants():
    print("\n=== METHOD ===")
    print(f"  day type: {DAY_TYPE}, window: "
          f"{WINDOW_START_MIN // 60:02d}:{WINDOW_START_MIN % 60:02d}-"
          f"{WINDOW_END_MIN // 60:02d}:{WINDOW_END_MIN % 60:02d}")
    for key, value in journey.CONSTANTS.items():
        print(f"  {key} = {value}")
    print(f"  strict transfer walk (sensitivity) = {STRICT_TRANSFER_WALK_M} m")


def _print_origin_tiers(rows):
    counts = defaultdict(int)
    for row in rows:
        counts[row["origin_source"]] += 1
    print("\n=== ORIGIN TIERS ===")
    for source in (ORIGIN_SOURCE_RESIDENTS, ORIGIN_SOURCE_STOPS):
        print(f"  {source}: {counts[source]} pairs")


def _comparable_headline(rows):
    """The rows this file is allowed to compute a headline statistic over --
    see the module docstring's "WHEN A PAIR HAS NO COMPARABLE TRAVEL TIME"
    section. Never hardcode this count: state `len(...)` of `len(rows)`
    wherever a headline number is printed."""
    return [r for r in rows if r[f"{HEADLINE}_classification"] == CLASS_COMPARABLE]


def _print_change_distribution(rows):
    comparable = _comparable_headline(rows)
    faster = [r["change_headline_min"] for r in comparable if r["change_headline_min"] < 0]
    slower = [r["change_headline_min"] for r in comparable if r["change_headline_min"] > 0]
    unchanged = [r for r in comparable if r["change_headline_min"] == 0]
    print(f"\n=== TRAVEL TIME CHANGE AT THE HEADLINE ({journey.MAX_TRANSFER_WALK_M:.0f} m) "
          f"TRANSFER RADIUS ===")
    print(f"  {len(comparable)} of {len(rows)} pairs are comparable (both "
          f"networks reach the origin, reach the destination, and turn up a "
          f"journey) -- this and every statistic below is computed over "
          f"those {len(comparable)} pairs only")
    print(f"  faster: {len(faster)}  slower: {len(slower)}  "
          f"unchanged: {len(unchanged)}")
    if faster:
        print(f"    faster by: median {-statistics.median(faster):.1f} min, "
              f"best {-min(faster):.1f} min, least {-max(faster):.1f} min")
    if slower:
        print(f"    slower by: median {statistics.median(slower):.1f} min, "
              f"worst {max(slower):.1f} min, least {min(slower):.1f} min")


def _print_flips(rows):
    comparable = _comparable_headline(rows)
    flips = [r for r in comparable if r["sign_flips_between_radii"]]
    material = [r for r in flips
                if min(abs(r["change_headline_min"]), abs(r["change_strict_min"]))
                >= FLIP_MATERIAL_THRESHOLD_MIN]
    noise = [r for r in flips if r not in material]
    print(f"\n=== FLIP COUNT (sign of the change differs between the "
          f"{journey.MAX_TRANSFER_WALK_M:.0f} m headline and "
          f"{STRICT_TRANSFER_WALK_M:.0f} m strict transfer radius, over the "
          f"{len(comparable)} of {len(rows)} comparable pairs) ===")
    print(f"  {len(material)} material flips (smaller-radius change >= "
          f"{FLIP_MATERIAL_THRESHOLD_MIN:.1f} min) -- this is the headline "
          f"number")
    print(f"  {len(noise)} additional noise-level flips (< "
          f"{FLIP_MATERIAL_THRESHOLD_MIN:.1f} min on the smaller side; a "
          f"rounding-scale artefact, not a reversal)")
    print(f"  {len(flips)} flips of {len(comparable)} comparable pairs in total")
    for r in sorted(material, key=lambda r: -abs(r["change_headline_min"]))[:20]:
        print(f"    {r['place']:44s} -> {r['anchor']:9s}  "
              f"headline {r['change_headline_min']:+.1f} min  "
              f"strict {r['change_strict_min']:+.1f} min")


def _print_place_list(rows, limit=30):
    for r in rows[:limit]:
        print(f"    {r['place']:44s} -> {r['anchor']:9s}")
    if len(rows) > limit:
        print(f"    ... and {len(rows) - limit} more")


def _print_reachability_breakdown(rows):
    """Replaces the old "unreachable" dump, which could not tell a coverage
    artefact from a genuine no-journey result -- see the module docstring
    and docs/worklog/one-point-cannot-represent-a-township.md."""
    field = f"{HEADLINE}_classification"
    by_class = {c: [r for r in rows if r[field] == c] for c in CLASSIFICATIONS}
    total = len(rows)

    print(f"\n=== REACHABILITY, AT THE HEADLINE "
          f"({journey.MAX_TRANSFER_WALK_M:.0f} m) TRANSFER RADIUS ===")
    print(f"  {len(by_class[CLASS_COMPARABLE])} of {total} pairs are "
          f"comparable (both networks reach the origin, reach the "
          f"destination, and a journey exists)")

    no_origin = by_class[CLASS_NO_ORIGIN_COVERAGE]
    print(f"\n  {len(no_origin)} of {total} pairs: no stop within "
          f"{journey.MAX_ACCESS_WALK_M:.0f} m of the ORIGIN point on at "
          f"least one network. This is a COVERAGE statement about a single "
          f"point, not a travel-time result -- coverage is measured "
          f"properly, over the whole surface with tiers and a radius "
          f"sensitivity, by analyze_coverage_change.py, and that is the "
          f"layer to cite. It is NOT presented as a travel-time finding "
          f"here.")
    _print_place_list(no_origin)

    no_dest = by_class[CLASS_NO_DEST_COVERAGE]
    print(f"\n  {len(no_dest)} of {total} pairs: no stop within "
          f"{journey.MAX_ACCESS_WALK_M:.0f} m of the DESTINATION on at "
          f"least one network -- the same coverage caveat as above, at the "
          f"anchor end.")
    _print_place_list(no_dest)

    no_journey = by_class[CLASS_NO_JOURNEY]
    print(f"\n  {len(no_journey)} of {total} pairs: stops are within reach "
          f"on both ends of both networks, but no itinerary was found "
          f"anywhere in the window -- the only category above that is a "
          f"genuine travel-time result.")
    _print_place_list(no_journey)


def report(rows, elapsed_s):
    _print_constants()
    _print_origin_tiers(rows)
    _print_reachability_breakdown(rows)
    _print_change_distribution(rows)
    _print_flips(rows)
    print(f"\nwrote {OUT_CSV} ({len(rows)} rows)")
    print(f"elapsed: {elapsed_s / 60:.1f} min ({elapsed_s:.0f}s)")


# --------------------------------------------------------------------------

def main():
    start = time.monotonic()
    print("Loading pairs and geometry...")
    pairs = load_pairs()
    places = sorted({p["place"] for p in pairs})
    print(f"  {len(pairs)} pairs, {len(places)} places, "
          f"{len(ANCHORS)} anchors")

    labelled_stops = load_place_labels()
    grid = label_grid(labelled_stops)
    block_groups = load_census_block_groups()

    residents_origins = population_weighted_origins(block_groups, grid)
    stops_origins = stop_mean_origins(labelled_stops)
    origins = resolve_origins(places, residents_origins, stops_origins)
    destinations = anchor_destinations(labelled_stops)

    print("Building timetables (one GTFS parse per side, one transfer graph "
          "per side x radius)...")
    timetables = build_timetables()

    print(f"\nRunning {len(pairs)} pairs x {len(RADIUS_KEYS)} radii x "
          f"{len(SIDES)} sides = {len(pairs) * len(RADIUS_KEYS) * len(SIDES)} "
          "profiles...")
    rows = []
    for i, pair in enumerate(pairs, 1):
        row = compute_row(pair, origins, destinations, timetables)
        rows.append(row)
        if i % PROGRESS_EVERY == 0 or i == len(pairs):
            elapsed = time.monotonic() - start
            print(f"  [{i}/{len(pairs)}] {pair['place']} -> {pair['anchor']}  "
                  f"({elapsed:.0f}s elapsed, {elapsed / i:.1f}s/pair)")

    write(rows)
    report(rows, time.monotonic() - start)


if __name__ == "__main__":
    main()
