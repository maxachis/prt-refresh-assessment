#!/usr/bin/env python3
"""
Door-to-door trip time change under the Bus Line Refresh.

Every other script in this repo counts service -- stops, trips, headways,
one-seat rides. This one asks what a rider actually experiences: starting at
a place, ready at any minute in the weekday morning peak, how long does it
take to get to Downtown or Oakland, on each network? `src/refresh/journey.py`
is the router that answers that for one origin-destination pair; this script runs
it over the same 187 places x 2 anchors that `analyze_one_seat.py` already
publishes, so a reader can put "does this place still have a one-seat ride"
next to "how long does the ride actually take" for the same place.

THE WINDOW: weekday, ready any minute 07:00-09:00. The AM peak is where a
one-seat-ride answer matters most (a commute, not a discretionary trip), and
it is the window `journey.profile`'s divide-and-conquer collapse was
measured against (module docstring, "HOW MUCH THIS ACTUALLY SAVES").

AND THE WAIT INSIDE IT IS BOUNDED. `journey.MAX_JOURNEY_MINUTES` (4 hours)
is where
a trip stops being a trip: because the clock starts when the rider is
ready, a place with no morning bus otherwise returns a correct 863-minute
arrival, and 863 minutes is not a travel time -- it is the absence of
morning service wearing a quotable number. Those minutes are reported
UNREACHABLE, so `reachable_fraction` carries the information instead. The
bound sits in empty ground: the genuine distribution over 2,492 published
origin medians ran continuously to 202 minutes and then jumped to a cluster
of 24 values between 480 and 864, every one an overnight wait.

THE PAIRS come from `data/oneseat_change.csv`, read rather than re-derived,
so this analysis can never quote a place or an anchor the one-seat answer
does not also cover.

THE ORIGIN IS THE PLACE'S RESIDENTS, NOT ITS CENTRE. A place is searched
from EVERY populated census block group that labels to it -- 951 block
groups across 177 places, a median of 4 and as many as 37 (Penn Hills) --
and the place's answer is the population-weighted pooling of those searches.

  This is the fix for `docs/worklog/one-point-cannot-represent-a-township.md`.
  An earlier version searched from one point per place, the population-
  weighted centre, and that point is a fiction for anything larger than a
  neighbourhood: Mount Lebanon's centre sits 611 m from the nearest proposed
  stop, so the township read as losing ALL morning-peak access to Downtown
  when what was true is that one arbitrary point in it has no stop within a
  quarter mile. Six townships produced that headline and every one of them
  was false. Searching from where people actually live cannot produce it,
  because a township with buses has block groups next to them.

  THE POOLING, and why it is over resident-minutes rather than over places.
  Each block group's search yields a `journey.Profile` -- one itinerary per
  ready-minute in the window, or none where the trip cannot be made. Every
  such itinerary is one sample weighted by that block group's population, and
  the published median is the weighted median of the pooled samples. So the
  number means: the median minute experienced by a randomly chosen resident
  of this place, ready at a randomly chosen minute of the peak. A block group
  reachable at only half the minutes contributes half as much weight as an
  equally populous one reachable at all of them, which is correct -- it is
  half as often able to make the trip.

  COVERAGE BECOMES A FRACTION, NOT A VERDICT. `{radius_key}_{side}_origin_
  coverage_fraction` is the share of the place's residents living in a block
  group with at least one stop within the access walk. This is the column
  that retires the false township headline: Mount Lebanon does not "lose
  access", some measurable share of its residents does, and the share is
  printed rather than rounded to all-or-nothing. It remains a COVERAGE
  measure and `analyze_coverage_change.py` is still the layer that owns it
  (see "WHEN A PAIR HAS NO COMPARABLE TRAVEL TIME" below); it appears here
  only to say how much of a place a travel time speaks for.

  THE FALLBACK TIER ("stops"): ten places have no block group whose nearest
  labelled stop is them (Bedford Dwellings, Central Northside, Chateau,
  Esplen, Findlay township (Allegheny, PA), Mt. Oliver, New Homestead, St.
  Clair, West End, West Homestead borough (Allegheny, PA)). Those keep a
  single origin at the mean of the place's own labelled stops -- where
  today's buses run rather than where residents live, which is a materially
  weaker origin AND a self-fulfilling one, since a point defined by today's
  stops is guaranteed to have current-network coverage. Several are small,
  low-income places the equity analysis singles out for coverage loss, so
  the weak origins are not randomly distributed and a "which places lose the
  most travel time" ranking built on this file needs that caveat attached.
  `origin_population` is written blank for these rows because no population
  underlies the weight.

  Matching is done on the RAW place label `analyze_one_seat.py` produces,
  never `analyze_equity_places.tidy()`'d -- `oneseat_change.csv`'s `place`
  column keeps the " (Allegheny, PA)" municipality suffix on 103 of its 187
  rows, and tidying before the match would silently fail to place those 103
  block groups at all.

  `origin_centre_lat`/`origin_centre_lon` are published for mapping only.
  They are the population-weighted centre of the points, and NOTHING is
  searched from them -- the name says centre precisely so that a later
  reader cannot mistake them for the origin the way the earlier version's
  `origin_lat`/`origin_lon` invited.

THE DESTINATION for an anchor is the mean coordinate of the labelled stops
whose place sits inside that anchor district (`analyze_one_seat.ANCHORS`).
That is a real narrowing against the published one-seat method, which draws
a radius around every anchor stop: "getting to Downtown" here means reaching
the district's single centre of stops, not arriving anywhere inside it. A
place that is well served by one edge of Downtown and poorly served by the
opposite edge will read as roughly the average of the two, which the
one-seat answer does not do. The destination is still ONE point -- the
township argument above applies to origins because that is where residents
are, not to a downtown a rider is trying to reach.

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
connection model on faith -- see the router's docstring for the walking
speed, transfer walk and buffer that decide whether a synthesised connection
is real. It also inherits
convention 13: this is the one analysis in the repo (besides one-seat) that
counts rail and the inclines, because a journey is not a service quantity.

    python3 -u analyze_travel_time.py   # -> data/trip_time_change.csv
                                        #    data/trip_time_origins.csv

TWO FILES. `trip_time_change.csv` is one row per published pair, the pooled
answer. `trip_time_origins.csv` is one row per (place, anchor, block group)
-- the evidence underneath, and the only place the SPREAD WITHIN a place is
visible. That spread is the substance of the township argument: a place
whose block groups disagree by forty minutes has no single travel time, and
a reader quoting its pooled median should know that. The printed report
ranks the widest-spread places for exactly that reason.

WHEN A PAIR HAS NO COMPARABLE TRAVEL TIME. Travel time is only defined where
both networks reach some residents of the origin, reach the destination, AND
turn up an itinerary in the window -- three different failure modes that a
bare "no median" collapses into one. Whether a point has a stop within reach
is a coverage question, and it is already answered properly -- at every
point, not one arbitrary one, with tiers and a radius sensitivity -- by
`analyze_coverage_change.py`. Publishing "Mount Lebanon loses all peak
access to Downtown" from this layer would be quoting that coverage result as
if it were a travel-time finding: convention 10's error, and convention 3's
trap ("a vanished stop id is not a lost bus") one unit up, weaker still
because it is a vanished stop near one *chosen point* rather than a real
corridor.

So every row's classification is computed per transfer radius (`{radius_key}
_classification`, one of the `CLASS_*` constants below): COMPARABLE when
both networks return a pooled median; NO_ORIGIN_COVERAGE when a network puts
no stop within the access walk of ANY populated block group of the place
(`origin_coverage_fraction` is 0 -- a much stronger and rarer statement than
the earlier one-point test, which is the point of the fix);
NO_DEST_COVERAGE when the anchor point has no stop in reach; NO_JOURNEY only
when stops exist in reach on both ends but no itinerary was found. The
printed report and every headline statistic in this file (the change
distribution, the flip count) are computed over COMPARABLE pairs only, and
the denominator is stated wherever a headline number is printed -- never
hardcoded, since it moves if the pair list or the network does.
"""

import csv
import sys
import time
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path

import gtfs
from analyze_one_seat import ANCHORS
from analyze_equity_places import label_for, label_grid, load_place_labels

# The router lives in the installed package rather than at the repo root,
# because the web app routes journeys too and an installed app cannot import a
# loose file from the working directory. Adding `src/` to the path is how
# `build_webdb.py` reaches `refresh.query` for the same reason, and it adds no
# dependency: `journey.py` is standard library like everything else here.
sys.path.insert(0, str(Path(__file__).parent / "src"))
from refresh import journey  # noqa: E402

DATA = Path("data")
ONESEAT_CSV = DATA / "oneseat_change.csv"
CENSUS_BLOCK_GROUPS_CSV = DATA / "census_block_groups.csv"
OUT_CSV = DATA / "trip_time_change.csv"
ORIGINS_CSV = DATA / "trip_time_origins.csv"

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

# The weight carried by a fallback ("stops") origin. Arbitrary and harmless:
# a fallback place has exactly one point, so the weight cancels out of every
# weighted statistic. It is NOT a population, and `origin_population` is
# written blank for those rows rather than publishing this number as people.
FALLBACK_POINT_WEIGHT = 1.0

# Why a pair has no comparable travel time at a given transfer radius -- see
# the module docstring's "WHEN A PAIR HAS NO COMPARABLE TRAVEL TIME" section.
# Checked in this order: origin coverage is tested before destination
# coverage, since the unreachable pairs are overwhelmingly origin-side.
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

# A place whose block groups' travel-time changes span more than this has no
# single travel time worth quoting -- see _print_within_place_spread.
SPREAD_NOTABLE_MIN = 10.0

COORD_DP = 6
MINUTE_DP = 1
FRACTION_DP = 3
POPULATION_DP = 0

PROFILE_SUFFIXES = ("median_min", "best_min", "worst_min", "reachable_fraction",
                    "median_transfers", "median_wait_min")
BASE_FIELDS = ["place", "anchor", "origin_source", "origin_points",
               "origin_population", "origin_centre_lat", "origin_centre_lon",
               "dest_lat", "dest_lon"]
COMBO_FIELDS = [f"{radius_key}_{side}_{suffix}"
                for radius_key in RADIUS_KEYS for side in SIDES
                for suffix in PROFILE_SUFFIXES]
ACCESS_FIELDS = [f"{radius_key}_{side}_{suffix}"
                 for radius_key in RADIUS_KEYS for side in SIDES
                 for suffix in ("origin_coverage_fraction", "dest_access_stops")]
CLASSIFICATION_FIELDS = [f"{radius_key}_classification" for radius_key in RADIUS_KEYS]
CHANGE_FIELDS = ["change_headline_min", "change_strict_min",
                 "sign_flips_between_radii", "spread_headline_min"]
FIELDNAMES = (BASE_FIELDS + COMBO_FIELDS + ACCESS_FIELDS
              + CLASSIFICATION_FIELDS + CHANGE_FIELDS)

ORIGIN_COMBO_FIELDS = [f"{radius_key}_{side}_{suffix}"
                       for radius_key in RADIUS_KEYS for side in SIDES
                       for suffix in ("median_min", "reachable_fraction",
                                      "access_stops")]
ORIGIN_FIELDNAMES = (["place", "anchor", "geoid", "lat", "lon", "population"]
                     + ORIGIN_COMBO_FIELDS + ["change_headline_min"])

COORD_FIELDS = {"origin_centre_lat", "origin_centre_lon", "dest_lat",
                "dest_lon", "lat", "lon"}
MINUTE_FIELDS = ({f"{r}_{s}_{suf}" for r in RADIUS_KEYS for s in SIDES
                  for suf in ("median_min", "best_min", "worst_min",
                              "median_transfers", "median_wait_min")}
                 | {"change_headline_min", "change_strict_min",
                    "spread_headline_min"})
FRACTION_FIELDS = ({f"{r}_{s}_reachable_fraction" for r in RADIUS_KEYS for s in SIDES}
                   | {f"{r}_{s}_origin_coverage_fraction"
                      for r in RADIUS_KEYS for s in SIDES})
POPULATION_FIELDS = {"origin_population", "population"}

PROGRESS_EVERY = 1   # rows; a pair is slow enough that per-row is right


@dataclass(frozen=True)
class OriginPoint:
    """One place a search actually starts from. `geoid` is the census block
    group's id, or "" for a fallback point that is not a block group at all.
    `weight` is residents for the preferred tier -- see the module docstring
    on why it is not people for the fallback tier."""
    geoid: str
    lat: float
    lon: float
    weight: float


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
# origins: every populated block group of a place, the place's own stops
# only where no block group names it
# --------------------------------------------------------------------------

def resident_origin_points(block_groups, label_lookup_grid):
    """{place: [OriginPoint]} -- one point per populated census block group
    whose nearest labelled stop is that place, weighted by its residents.

    Zero-population block groups (unpopulated land) are skipped rather than
    carried at weight zero, which would be a no-op, to make the skip visible
    in the code -- and because a search from them would still cost the same
    several seconds as a search that counts.

    Matches `label_for` on the RAW place label -- see the module docstring
    on why `tidy()` must not run here.
    """
    points = defaultdict(list)
    for bg in block_groups:
        population = float(bg["population"])
        if population <= 0:
            continue
        lat, lon = float(bg["lat"]), float(bg["lon"])
        place, _distance = label_for(lat, lon, label_lookup_grid)
        if place is None:
            continue
        points[place].append(OriginPoint(geoid=bg["geoid"], lat=lat, lon=lon,
                                         weight=population))
    return dict(points)


def stop_mean_origin_points(labelled_stops):
    """{place: [OriginPoint]} with one point at the mean of a place's own
    labelled stops -- the fallback tier, used only where no block group
    resolves to a place."""
    sums = defaultdict(lambda: [0.0, 0.0, 0])
    for lat, lon, place in labelled_stops:
        acc = sums[place]
        acc[0] += lat
        acc[1] += lon
        acc[2] += 1
    return {place: [OriginPoint(geoid="", lat=lat_sum / n, lon=lon_sum / n,
                                weight=FALLBACK_POINT_WEIGHT)]
            for place, (lat_sum, lon_sum, n) in sums.items()}


def resolve_origins(places, resident_points, stop_points):
    """{place: ([OriginPoint], source)}, preferring the residents tier and
    falling back to the place's own stops -- see the module docstring."""
    origins = {}
    for place in places:
        if place in resident_points:
            origins[place] = (resident_points[place], ORIGIN_SOURCE_RESIDENTS)
        elif place in stop_points:
            origins[place] = (stop_points[place], ORIGIN_SOURCE_STOPS)
        else:
            sys.exit(f"no origin resolves for place {place!r}: no census block "
                     "group and no labelled stop names it")
    return origins


def population_weighted_centre(points):
    """The point published for mapping. Nothing is searched from it."""
    total = sum(p.weight for p in points)
    return (sum(p.lat * p.weight for p in points) / total,
            sum(p.lon * p.weight for p in points) / total)


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
# pooling many residents' profiles into one place's answer
# --------------------------------------------------------------------------

def weighted_median(samples):
    """The lower weighted median of `(value, weight)` pairs, or None if empty.

    Lower rather than interpolated: with unequal weights there is no
    defensible "average of the two middle values" -- the two middles are not
    equally representative -- and a value that a resident actually
    experiences is a better thing to publish than an average of two that
    nobody does. For a single origin point with one weight this differs from
    `statistics.median` only on an even count, by half a step of the arrival
    curve.
    """
    ordered = sorted(samples)
    if not ordered:
        return None
    half = sum(weight for _value, weight in ordered) / 2.0
    running = 0.0
    for value, weight in ordered:
        running += weight
        if running >= half:
            return value
    return ordered[-1][0]


def summarise(weighted_profiles):
    """The numbers this CSV publishes, pooled over `[(weight, Profile)]`.

    Every itinerary of every profile is one sample at that profile's weight,
    so the median is over resident-minutes -- see the module docstring's
    "THE POOLING". `best`/`worst` are the extremes any resident of the place
    sees at any minute, unweighted, since an extreme is not an average.

    Rounded HERE, at the published precision, rather than on the way out to
    the file. Everything downstream -- the change columns, the flip flag, the
    printed report -- is then derived from the same numbers a reader can see,
    so the file's own arithmetic checks out. Deriving from full precision and
    publishing rounded values is what produced a pair flagged as reversing
    sign between two radii whose published changes were 0.0 and -1.0: true of
    the hidden floats, false of the file.
    """
    total_weight = sum(weight for weight, _profile in weighted_profiles)
    reachable = (sum(weight * profile.reachable_fraction
                     for weight, profile in weighted_profiles) / total_weight
                 if total_weight else 0.0)
    minutes, transfers, waits, totals = [], [], [], []
    for weight, profile in weighted_profiles:
        for trip in profile.journeys:
            minutes.append((trip.total_minutes, weight))
            transfers.append((trip.transfers, weight))
            waits.append((trip.wait_minutes, weight))
            totals.append(trip.total_minutes)
    if not totals:
        return {"median_min": None, "best_min": None, "worst_min": None,
                "reachable_fraction": round(reachable, FRACTION_DP),
                "median_transfers": None, "median_wait_min": None}
    return {
        "median_min": round(weighted_median(minutes), MINUTE_DP),
        "best_min": round(min(totals), MINUTE_DP),
        "worst_min": round(max(totals), MINUTE_DP),
        "reachable_fraction": round(reachable, FRACTION_DP),
        "median_transfers": weighted_median(transfers),
        "median_wait_min": round(weighted_median(waits), MINUTE_DP),
    }


def profile_summary(tt, origin, dest):
    """One point's answer: the single-origin case of `summarise`, kept as its
    own name because the reproduction pin and any caller asking about a
    literal coordinate want it."""
    return summarise([(FALLBACK_POINT_WEIGHT,
                       journey.profile(tt, origin, dest, window=WINDOW))])


def origin_coverage_fraction(covered_weight, total_weight):
    """The share of a place's residents with a stop within the access walk.
    See the module docstring: this is a coverage measure, reported here only
    to say how much of a place a travel time speaks for."""
    return round(covered_weight / total_weight, FRACTION_DP) if total_weight else 0.0


# --------------------------------------------------------------------------
# one pair
# --------------------------------------------------------------------------

def search_place(tt, points, dest):
    """Every origin point of a place against one timetable.

    Returns `(weighted_profiles, covered_weight, per_point)`, where
    `per_point` is `{geoid_or_index: (median, reachable_fraction,
    access_stops)}` -- the evidence row `trip_time_origins.csv` publishes.
    """
    weighted_profiles, covered_weight, per_point = [], 0.0, {}
    for index, point in enumerate(points):
        at = (point.lat, point.lon)
        access = len(journey.access_stops(tt, at, journey.MAX_ACCESS_WALK_M))
        if access:
            covered_weight += point.weight
        profile = journey.profile(tt, at, dest, window=WINDOW)
        weighted_profiles.append((point.weight, profile))
        # Through `summarise` rather than off `Profile.median_minutes`, so a
        # point's published median is the same statistic as the pooled one --
        # `statistics.median` averages the two middle values on an even count
        # and `weighted_median` does not, and a reproduction pin comparing
        # the two would fail by half a step of the arrival curve.
        alone = summarise([(FALLBACK_POINT_WEIGHT, profile)])
        per_point[index] = (alone["median_min"], alone["reachable_fraction"],
                            access)
    return weighted_profiles, covered_weight, per_point


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


def classify(coverage, dest_access, current_median, proposed_median):
    """Why a pair has no comparable travel time at one transfer radius, per
    the module docstring. `coverage` is {side: resident fraction with a stop
    in reach}; `dest_access` is {side: stop count at the anchor}."""
    if current_median is not None and proposed_median is not None:
        return CLASS_COMPARABLE
    if coverage[CURRENT] == 0 or coverage[PROPOSED] == 0:
        return CLASS_NO_ORIGIN_COVERAGE
    if dest_access[CURRENT] == 0 or dest_access[PROPOSED] == 0:
        return CLASS_NO_DEST_COVERAGE
    return CLASS_NO_JOURNEY


def _point_change_spread(per_point_rows):
    """How far apart this place's own block groups are on the headline
    change -- the number that says whether the pooled median means anything.
    None where fewer than two points have a change at all."""
    changes = [r["change_headline_min"] for r in per_point_rows
               if r["change_headline_min"] is not None]
    if len(changes) < 2:
        return None
    return round(max(changes) - min(changes), MINUTE_DP)


def compute_row(pair, origins, destinations, timetables):
    """One published row, plus the per-origin evidence rows behind it."""
    place, anchor = pair["place"], pair["anchor"]
    points, origin_source = origins[place]
    dest_point = destinations[anchor]
    centre_lat, centre_lon = population_weighted_centre(points)
    total_weight = sum(p.weight for p in points)

    row = {"place": place, "anchor": anchor, "origin_source": origin_source,
           "origin_points": len(points),
           "origin_population": (total_weight
                                 if origin_source == ORIGIN_SOURCE_RESIDENTS
                                 else None),
           "origin_centre_lat": centre_lat, "origin_centre_lon": centre_lon,
           "dest_lat": dest_point[0], "dest_lon": dest_point[1]}

    point_rows = [{"place": place, "anchor": anchor, "geoid": p.geoid,
                   "lat": p.lat, "lon": p.lon,
                   "population": (p.weight
                                  if origin_source == ORIGIN_SOURCE_RESIDENTS
                                  else None)}
                  for p in points]

    summaries = {}
    for radius_key in RADIUS_KEYS:
        coverage, dest_access = {}, {}
        for side in SIDES:
            tt = timetables[(side, radius_key)]
            weighted_profiles, covered_weight, per_point = search_place(
                tt, points, dest_point)

            summary = summarise(weighted_profiles)
            summaries[(radius_key, side)] = summary
            prefix = f"{radius_key}_{side}_"
            for suffix in PROFILE_SUFFIXES:
                row[prefix + suffix] = summary[suffix]

            coverage[side] = origin_coverage_fraction(covered_weight, total_weight)
            dest_access[side] = len(journey.access_stops(
                tt, dest_point, journey.MAX_ACCESS_WALK_M))
            row[prefix + "origin_coverage_fraction"] = coverage[side]
            row[prefix + "dest_access_stops"] = dest_access[side]

            for index, (median, reachable, access) in per_point.items():
                point_rows[index][prefix + "median_min"] = median
                point_rows[index][prefix + "reachable_fraction"] = reachable
                point_rows[index][prefix + "access_stops"] = access

        row[f"{radius_key}_classification"] = classify(
            coverage, dest_access,
            summaries[(radius_key, CURRENT)]["median_min"],
            summaries[(radius_key, PROPOSED)]["median_min"])

    for point_row in point_rows:
        point_row["change_headline_min"] = _change(
            point_row[f"{HEADLINE}_{PROPOSED}_median_min"],
            point_row[f"{HEADLINE}_{CURRENT}_median_min"])

    row["change_headline_min"] = _change(
        summaries[(HEADLINE, PROPOSED)]["median_min"],
        summaries[(HEADLINE, CURRENT)]["median_min"])
    row["change_strict_min"] = _change(
        summaries[(STRICT, PROPOSED)]["median_min"],
        summaries[(STRICT, CURRENT)]["median_min"])
    row["sign_flips_between_radii"] = _sign_flips(
        row["change_headline_min"], row["change_strict_min"])
    row["spread_headline_min"] = _point_change_spread(point_rows)
    return row, point_rows


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
    if field in POPULATION_FIELDS:
        return round(value, POPULATION_DP)
    return value


def _write(path, fieldnames, rows):
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({k: _rounded(k, row.get(k)) for k in fieldnames})


def write(rows, point_rows):
    _write(OUT_CSV, FIELDNAMES, rows)
    _write(ORIGINS_CSV, ORIGIN_FIELDNAMES, point_rows)


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
    counts, points, population = defaultdict(int), defaultdict(int), 0.0
    for row in rows:
        counts[row["origin_source"]] += 1
        points[row["origin_source"]] += row["origin_points"]
        population += row["origin_population"] or 0.0
    print("\n=== ORIGINS ===")
    print(f"  a place is searched from EVERY populated census block group "
          f"that labels to it, and its answer is those searches pooled by "
          f"population -- see docs/worklog/"
          f"one-point-cannot-represent-a-township.md")
    for source in (ORIGIN_SOURCE_RESIDENTS, ORIGIN_SOURCE_STOPS):
        print(f"  {source}: {counts[source]} pairs, "
              f"{points[source]} origin points")
    print(f"  {sum(points.values())} origin points in total, standing for "
          f"{population:,.0f} residents (pairs double-count a place, once "
          f"per anchor)")


def _comparable_headline(rows):
    """The rows this file is allowed to compute a headline statistic over --
    see the module docstring's "WHEN A PAIR HAS NO COMPARABLE TRAVEL TIME"
    section. Never hardcode this count: state `len(...)` of `len(rows)`
    wherever a headline number is printed."""
    return [r for r in rows if r[f"{HEADLINE}_classification"] == CLASS_COMPARABLE]


def _median(values):
    return weighted_median([(value, 1.0) for value in values])


def _print_change_distribution(rows):
    comparable = _comparable_headline(rows)
    faster = [r["change_headline_min"] for r in comparable if r["change_headline_min"] < 0]
    slower = [r["change_headline_min"] for r in comparable if r["change_headline_min"] > 0]
    unchanged = [r for r in comparable if r["change_headline_min"] == 0]
    print(f"\n=== TRAVEL TIME CHANGE AT THE HEADLINE ({journey.MAX_TRANSFER_WALK_M:.0f} m) "
          f"TRANSFER RADIUS ===")
    print(f"  {len(comparable)} of {len(rows)} pairs are comparable (both "
          f"networks reach some residents of the origin, reach the "
          f"destination, and turn up a journey) -- this and every statistic "
          f"below is computed over those {len(comparable)} pairs only")
    print(f"  faster: {len(faster)}  slower: {len(slower)}  "
          f"unchanged: {len(unchanged)}")
    if faster:
        print(f"    faster by: median {-_median(faster):.1f} min, "
              f"best {-min(faster):.1f} min, least {-max(faster):.1f} min")
    if slower:
        print(f"    slower by: median {_median(slower):.1f} min, "
              f"worst {max(slower):.1f} min, least {min(slower):.1f} min")


def _print_within_place_spread(rows):
    """The payoff of searching a place rather than a point: how far apart a
    place's own residents are. A wide spread does not invalidate the pooled
    median -- it says the median is a summary of genuinely different
    experiences, and that a "this place gets N minutes slower" sentence
    built on it is hiding that."""
    comparable = _comparable_headline(rows)
    spreads = [r for r in comparable if r["spread_headline_min"] is not None]
    notable = [r for r in spreads
               if r["spread_headline_min"] >= SPREAD_NOTABLE_MIN]
    print(f"\n=== SPREAD WITHIN A PLACE (headline radius, comparable pairs) ===")
    print(f"  {len(spreads)} of {len(comparable)} comparable pairs have two "
          f"or more origin points with a change; their block groups' changes "
          f"span a median of "
          f"{_median([r['spread_headline_min'] for r in spreads]):.1f} min")
    print(f"  {len(notable)} span {SPREAD_NOTABLE_MIN:.0f} min or more -- for "
          f"these, the pooled median is a summary of materially different "
          f"experiences and should not be quoted as 'this place':")
    for r in sorted(notable, key=lambda r: -r["spread_headline_min"])[:20]:
        print(f"    {r['place']:44s} -> {r['anchor']:9s}  "
              f"pooled {r['change_headline_min']:+.1f} min  "
              f"across {r['origin_points']:2d} block groups spanning "
              f"{r['spread_headline_min']:.1f} min")


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


def _print_partial_coverage(rows):
    """Where a comparable travel time speaks for only part of a place. The
    earlier one-point origin could only say "covered" or "not"; this says
    how much, and a pooled median over a third of a township's residents is
    a different claim from one over all of it."""
    partial = []
    for row in rows:
        if row[f"{HEADLINE}_classification"] != CLASS_COMPARABLE:
            continue
        worst = min(row[f"{HEADLINE}_{side}_origin_coverage_fraction"]
                    for side in SIDES)
        if worst < 1.0:
            partial.append((worst, row))
    print(f"\n  {len(partial)} comparable pairs speak for only part of their "
          f"place -- some residents have no stop within "
          f"{journey.MAX_ACCESS_WALK_M:.0f} m on one network. The 20 thinnest:")
    # Keyed on the fraction alone: two places tied on coverage would
    # otherwise fall through to comparing the row dicts, which raises.
    for worst, row in sorted(partial, key=lambda entry: entry[0])[:20]:
        print(f"    {row['place']:44s} -> {row['anchor']:9s}  "
              f"covers {worst:.0%} of residents "
              f"(now {row[f'{HEADLINE}_{CURRENT}_origin_coverage_fraction']:.0%}, "
              f"plan {row[f'{HEADLINE}_{PROPOSED}_origin_coverage_fraction']:.0%})")


def _print_reachability_breakdown(rows):
    """What used to be the "unreachable" dump. With a place searched from all
    of its block groups rather than one point, NO_ORIGIN_COVERAGE now means
    a network reaches none of a place's residents -- a real statement rather
    than an artefact of one chosen coordinate."""
    field = f"{HEADLINE}_classification"
    by_class = {c: [r for r in rows if r[field] == c] for c in CLASSIFICATIONS}
    total = len(rows)

    print(f"\n=== REACHABILITY, AT THE HEADLINE "
          f"({journey.MAX_TRANSFER_WALK_M:.0f} m) TRANSFER RADIUS ===")
    print(f"  {len(by_class[CLASS_COMPARABLE])} of {total} pairs are "
          f"comparable (both networks reach some residents of the origin, "
          f"reach the destination, and a journey exists)")

    no_origin = by_class[CLASS_NO_ORIGIN_COVERAGE]
    print(f"\n  {len(no_origin)} of {total} pairs: NO populated block group "
          f"of the place has a stop within {journey.MAX_ACCESS_WALK_M:.0f} m "
          f"on at least one network. This is a COVERAGE statement -- coverage "
          f"is measured properly, over the whole surface with tiers and a "
          f"radius sensitivity, by analyze_coverage_change.py, and that is "
          f"the layer to cite. It is NOT presented as a travel-time finding "
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

    _print_partial_coverage(rows)


def report(rows, point_rows, elapsed_s):
    _print_constants()
    _print_origin_tiers(rows)
    _print_reachability_breakdown(rows)
    _print_change_distribution(rows)
    _print_within_place_spread(rows)
    _print_flips(rows)
    print(f"\nwrote {OUT_CSV} ({len(rows)} rows)")
    print(f"wrote {ORIGINS_CSV} ({len(point_rows)} rows)")
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

    resident_points = resident_origin_points(block_groups, grid)
    stop_points = stop_mean_origin_points(labelled_stops)
    origins = resolve_origins(places, resident_points, stop_points)
    destinations = anchor_destinations(labelled_stops)

    searches = sum(len(origins[p["place"]][0]) for p in pairs)
    print(f"  {sum(len(pts) for pts, _src in origins.values())} origin points "
          f"across {len(places)} places")

    print("Building timetables (one GTFS parse per side, one transfer graph "
          "per side x radius)...")
    timetables = build_timetables()

    print(f"\nRunning {searches} origin points x {len(RADIUS_KEYS)} radii x "
          f"{len(SIDES)} sides = {searches * len(RADIUS_KEYS) * len(SIDES)} "
          f"profiles, pooled into {len(pairs)} pairs...")
    rows, point_rows = [], []
    for i, pair in enumerate(pairs, 1):
        row, rows_for_pair = compute_row(pair, origins, destinations, timetables)
        rows.append(row)
        point_rows.extend(rows_for_pair)
        if i % PROGRESS_EVERY == 0 or i == len(pairs):
            elapsed = time.monotonic() - start
            print(f"  [{i}/{len(pairs)}] {pair['place']} -> {pair['anchor']}  "
                  f"({row['origin_points']} origin points, {elapsed:.0f}s "
                  f"elapsed, {elapsed / i:.1f}s/pair)")

    write(rows, point_rows)
    report(rows, point_rows, time.monotonic() - start)


if __name__ == "__main__":
    main()
