"""The travel-time layer: how long a rider's actual trip takes, place by place.

`analyze_travel_time.py` is the first script to run the router at scale
against the real feeds, over the same 187 places x 2 anchors the one-seat
answer already publishes. What these tests protect, in order of how badly a
failure would read:

1. THE PAIRS ARE THE PUBLISHED ONES. Every row here has to be a row of
   `data/oneseat_change.csv` and nothing else -- a place or anchor this file
   invents (or drops) would let a reader compare a one-seat verdict to a
   travel time for a pair the one-seat answer never assessed.
2. A PLACE IS ITS RESIDENTS, NOT A POINT. Every place is searched from all
   of its populated block groups and pooled by population. The failure this
   guards is the one that made a township read as losing all peak access
   because one arbitrary coordinate had no stop near it -- so the pooled
   file has to reconcile, row for row and resident for resident, with the
   per-origin evidence file underneath it. See
   docs/worklog/one-point-cannot-represent-a-township.md.
3. EVERY ORIGIN AND DESTINATION IS SOMEWHERE REAL. A geometry bug that put a
   point outside the region would still search and might even find a
   journey; nothing about the router would complain.
4. REACHABILITY AND THE SUMMARY STATISTICS AGREE WITH EACH OTHER. A fraction
   outside [0, 1] or a median attached to zero reachable journeys would be
   the kind of quiet corruption `journey.Profile` itself is built to make
   impossible -- this pins that this layer never re-introduces it on the way
   into a CSV.
5. THE POOLING IS BY PEOPLE. `summarise` weights a resident-minute, not a
   block group: a populous block group has to move the median more than a
   near-empty one. Pooled unweighted, a township's answer would be decided
   by however its census geography happens to be cut up.
6. THE REPRODUCTION PIN: a fixed sample of published origins must come back
   out of a freshly rebuilt timetable and a freshly run profile. This is the
   guarantee every other layer in this repo carries -- that a published
   number is not just plausible-looking output but something a stranger can
   regenerate from the same inputs.
"""
import csv
from collections import defaultdict
from pathlib import Path

import pytest

from refresh import journey, walking
import analyze_travel_time as att

ROOT = Path(__file__).resolve().parent.parent
ONESEAT_CSV = ROOT / "data" / "oneseat_change.csv"
TRIP_TIME_CSV = ROOT / "data" / "trip_time_change.csv"
TRIP_TIME_ORIGINS_CSV = ROOT / "data" / "trip_time_origins.csv"

# A generous bounding box around the three-county PRT service area -- wide
# enough to admit any real stop or block-group centroid, tight enough to
# catch a swapped lat/lon or a stray degrees-vs-radians bug.
LAT_RANGE = (40.0, 41.0)
LON_RANGE = (-81.0, -79.0)

# The CSV rounds minutes to one decimal place; a reproduction has to agree
# with that rounding, not with float-for-float equality.
MINUTE_TOLERANCE = 0.15
FRACTION_TOLERANCE = 1e-6

# Population is published rounded to whole people, so a place's summed block
# groups can miss its published total by half a person per block group.
POPULATION_TOLERANCE_PER_POINT = 0.5


def _rows(path):
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))


@pytest.fixture(scope="module")
def oneseat_rows():
    if not ONESEAT_CSV.exists():
        pytest.skip(f"{ONESEAT_CSV} not built -- run analyze_one_seat.py")
    return _rows(ONESEAT_CSV)


@pytest.fixture(scope="module")
def trip_time_rows():
    if not TRIP_TIME_CSV.exists():
        pytest.skip(f"{TRIP_TIME_CSV} not built -- run analyze_travel_time.py")
    return _rows(TRIP_TIME_CSV)


@pytest.fixture(scope="module")
def origin_rows():
    if not TRIP_TIME_ORIGINS_CSV.exists():
        pytest.skip(f"{TRIP_TIME_ORIGINS_CSV} not built -- run analyze_travel_time.py")
    return _rows(TRIP_TIME_ORIGINS_CSV)


@pytest.fixture(scope="module")
def origins_by_pair(origin_rows):
    grouped = defaultdict(list)
    for r in origin_rows:
        grouped[(r["place"], r["anchor"])].append(r)
    return grouped


def _float_or_none(value):
    return None if value == "" else float(value)


def _leg(depart, arrive):
    return journey.Leg(kind=journey.LEG_RIDE, route="R", from_stop="a",
                       to_stop="b", depart=depart, arrive=arrive)


def _profile(totals, n_departures=None):
    """A `journey.Profile` whose journeys have the given total minutes, built
    without a router so the pooling can be tested on values chosen to make a
    weighting mistake visible."""
    n_departures = len(totals) if n_departures is None else n_departures
    journeys = tuple(journey.Journey(ready_at=0.0, arrive=float(total),
                                     legs=(_leg(0.0, float(total)),))
                     for total in totals)
    return journey.Profile(
        journeys=journeys, n_departures=n_departures,
        median_minutes=None, best_minutes=None, worst_minutes=None,
        reachable_fraction=len(journeys) / n_departures if n_departures else 0.0)


# --------------------------------------------------------------------------
# 1. the pairs are the published ones
# --------------------------------------------------------------------------

def test_the_published_pairs_match_oneseat_exactly(oneseat_rows, trip_time_rows):
    expected = [(r["place"], r["anchor"]) for r in oneseat_rows]
    actual = [(r["place"], r["anchor"]) for r in trip_time_rows]
    assert actual == expected


# --------------------------------------------------------------------------
# 2. a place is its residents, not a point: the pooled file reconciles with
#    the per-origin evidence file underneath it
# --------------------------------------------------------------------------

def test_every_pair_has_at_least_one_origin_point(trip_time_rows, origins_by_pair):
    for r in trip_time_rows:
        points = origins_by_pair[(r["place"], r["anchor"])]
        assert points, r
        assert len(points) == int(r["origin_points"]), r


def test_most_places_are_searched_from_more_than_one_point(trip_time_rows):
    """The whole fix. If this ever falls back to one point per place, the
    township artefact is back and every unreachable pair becomes suspect
    again."""
    multi = [r for r in trip_time_rows if int(r["origin_points"]) > 1]
    assert len(multi) > len(trip_time_rows) / 2


def test_origin_population_is_the_sum_of_the_block_groups_behind_it(
        trip_time_rows, origins_by_pair):
    for r in trip_time_rows:
        if r["origin_source"] != att.ORIGIN_SOURCE_RESIDENTS:
            assert r["origin_population"] == "", r
            continue
        points = origins_by_pair[(r["place"], r["anchor"])]
        summed = sum(float(p["population"]) for p in points)
        tolerance = POPULATION_TOLERANCE_PER_POINT * len(points)
        assert abs(summed - float(r["origin_population"])) <= tolerance, r


@pytest.mark.parametrize("radius_key", att.RADIUS_KEYS)
@pytest.mark.parametrize("side", att.SIDES)
def test_origin_coverage_fraction_is_the_covered_share_of_residents(
        trip_time_rows, origins_by_pair, radius_key, side):
    """The column that retires the false township headline. It has to be a
    real population share computed from the same block groups the evidence
    file publishes, not a rounded-off all-or-nothing verdict."""
    for r in trip_time_rows:
        if r["origin_source"] != att.ORIGIN_SOURCE_RESIDENTS:
            continue
        points = origins_by_pair[(r["place"], r["anchor"])]
        total = sum(float(p["population"]) for p in points)
        covered = sum(float(p["population"]) for p in points
                      if int(p[f"{radius_key}_{side}_access_stops"]) > 0)
        published = float(r[f"{radius_key}_{side}_origin_coverage_fraction"])
        assert published == pytest.approx(covered / total, abs=0.01), r


def test_the_spread_column_is_the_range_of_its_own_block_groups(
        trip_time_rows, origins_by_pair):
    for r in trip_time_rows:
        points = origins_by_pair[(r["place"], r["anchor"])]
        changes = [_float_or_none(p["change_headline_min"]) for p in points]
        changes = [c for c in changes if c is not None]
        published = _float_or_none(r["spread_headline_min"])
        if len(changes) < 2:
            assert published is None, r
        else:
            assert published == pytest.approx(max(changes) - min(changes),
                                              abs=MINUTE_TOLERANCE), r


def test_a_pooled_median_lies_inside_its_block_groups_medians(
        trip_time_rows, origins_by_pair):
    """A weighted median is one of its samples, so a pooled place median can
    never sit outside the range of the per-origin medians it pooled. This is
    the cheap check that catches a weighting bug that a spot-check of one
    place would not."""
    for r in trip_time_rows:
        for radius_key in att.RADIUS_KEYS:
            for side in att.SIDES:
                field = f"{radius_key}_{side}_median_min"
                pooled = _float_or_none(r[field])
                if pooled is None:
                    continue
                points = origins_by_pair[(r["place"], r["anchor"])]
                medians = [_float_or_none(p[field]) for p in points]
                medians = [m for m in medians if m is not None]
                assert medians, r
                assert (min(medians) - MINUTE_TOLERANCE <= pooled
                        <= max(medians) + MINUTE_TOLERANCE), (r, field)


# --------------------------------------------------------------------------
# 3. every origin and destination is somewhere real
# --------------------------------------------------------------------------

def test_origins_and_destinations_are_plausible_pittsburgh_coordinates(
        trip_time_rows, origin_rows):
    for r in trip_time_rows:
        for lat_field, lon_field in (("origin_centre_lat", "origin_centre_lon"),
                                     ("dest_lat", "dest_lon")):
            lat, lon = float(r[lat_field]), float(r[lon_field])
            assert LAT_RANGE[0] <= lat <= LAT_RANGE[1], r
            assert LON_RANGE[0] <= lon <= LON_RANGE[1], r
    for r in origin_rows:
        assert LAT_RANGE[0] <= float(r["lat"]) <= LAT_RANGE[1], r
        assert LON_RANGE[0] <= float(r["lon"]) <= LON_RANGE[1], r


def test_origin_source_is_one_of_the_two_published_tiers(trip_time_rows):
    sources = {r["origin_source"] for r in trip_time_rows}
    assert sources <= {att.ORIGIN_SOURCE_RESIDENTS, att.ORIGIN_SOURCE_STOPS}
    assert att.ORIGIN_SOURCE_RESIDENTS in sources  # the preferred tier is used


def test_the_ten_documented_fallback_places_use_the_stops_tier(trip_time_rows):
    """Verified in the brief: these ten have no block group whose population
    centre labels to them, so they must fall back to their own stops -- and
    a fallback place has exactly one origin, which is the whole reason its
    numbers are weaker than the rest."""
    documented_fallbacks = {
        "Bedford Dwellings", "Central Northside", "Chateau", "Esplen",
        "Findlay township (Allegheny, PA)", "Mt. Oliver", "New Homestead",
        "St. Clair", "West End", "West Homestead borough (Allegheny, PA)",
    }
    by_place = {r["place"]: r for r in trip_time_rows}
    for place in documented_fallbacks:
        if place in by_place:
            assert by_place[place]["origin_source"] == att.ORIGIN_SOURCE_STOPS, place
            assert int(by_place[place]["origin_points"]) == 1, place


# --------------------------------------------------------------------------
# 4. reachability and the summary statistics agree with each other
# --------------------------------------------------------------------------

@pytest.mark.parametrize("radius_key", att.RADIUS_KEYS)
@pytest.mark.parametrize("side", att.SIDES)
def test_reachable_fractions_are_within_bounds(trip_time_rows, radius_key, side):
    for field in (f"{radius_key}_{side}_reachable_fraction",
                  f"{radius_key}_{side}_origin_coverage_fraction"):
        for r in trip_time_rows:
            assert 0.0 <= float(r[field]) <= 1.0, r


@pytest.mark.parametrize("radius_key", att.RADIUS_KEYS)
@pytest.mark.parametrize("side", att.SIDES)
def test_a_median_exists_exactly_when_the_pair_is_reachable(
        trip_time_rows, radius_key, side):
    prefix = f"{radius_key}_{side}_"
    for r in trip_time_rows:
        fraction = float(r[prefix + "reachable_fraction"])
        median = _float_or_none(r[prefix + "median_min"])
        if fraction > 0:
            assert median is not None, r
            assert _float_or_none(r[prefix + "best_min"]) is not None
            assert _float_or_none(r[prefix + "worst_min"]) is not None
            best = float(r[prefix + "best_min"])
            worst = float(r[prefix + "worst_min"])
            assert best <= median <= worst + MINUTE_TOLERANCE, r
        else:
            assert median is None, r


def test_the_flip_flag_is_only_set_when_both_radii_are_comparable(trip_time_rows):
    for r in trip_time_rows:
        headline = _float_or_none(r["change_headline_min"])
        strict = _float_or_none(r["change_strict_min"])
        flag = r["sign_flips_between_radii"]
        if headline is None or strict is None:
            assert flag == "", r
            continue
        assert flag in ("True", "False"), r
        # Recomputed from the file's OWN published columns, with no tolerance
        # and no skipped boundary. Every derived value here is computed from
        # numbers already rounded to the published precision, so a reader can
        # check the file's arithmetic against itself. An earlier version
        # derived the flag from full-precision floats and published rounded
        # ones, which flagged a pair as reversing sign whose published changes
        # were 0.0 and -1.0 -- true of the hidden values, false of the file.
        assert (flag == "True") == ((headline * strict) < 0), r


# --------------------------------------------------------------------------
# 4b. the classification column agrees with reachability -- see the module
#     docstring's "WHEN A PAIR HAS NO COMPARABLE TRAVEL TIME" section and
#     docs/worklog/one-point-cannot-represent-a-township.md
# --------------------------------------------------------------------------

@pytest.mark.parametrize("radius_key", att.RADIUS_KEYS)
def test_classification_is_always_one_of_the_named_constants(trip_time_rows, radius_key):
    field = f"{radius_key}_classification"
    for r in trip_time_rows:
        assert r[field] in att.CLASSIFICATIONS, r


@pytest.mark.parametrize("radius_key", att.RADIUS_KEYS)
def test_comparable_pairs_have_medians_on_both_sides_others_do_not(
        trip_time_rows, radius_key):
    classification_field = f"{radius_key}_classification"
    for r in trip_time_rows:
        current_median = _float_or_none(r[f"{radius_key}_current_median_min"])
        proposed_median = _float_or_none(r[f"{radius_key}_proposed_median_min"])
        both_present = current_median is not None and proposed_median is not None
        if r[classification_field] == att.CLASS_COMPARABLE:
            assert both_present, r
        else:
            assert not both_present, r


@pytest.mark.parametrize("radius_key", att.RADIUS_KEYS)
@pytest.mark.parametrize("side", att.SIDES)
def test_destination_access_counts_are_nonnegative_integers(
        trip_time_rows, radius_key, side):
    for r in trip_time_rows:
        assert int(r[f"{radius_key}_{side}_dest_access_stops"]) >= 0, r


@pytest.mark.parametrize("radius_key", att.RADIUS_KEYS)
def test_no_origin_coverage_means_a_network_reaches_none_of_the_residents(
        trip_time_rows, radius_key):
    """Stronger than the test it replaces, which only asked whether one
    chosen coordinate had a stop near it. This category now means a network
    puts no stop within the access walk of ANY populated block group of the
    place -- which is why it is safe to report at all."""
    for r in trip_time_rows:
        if r[f"{radius_key}_classification"] != att.CLASS_NO_ORIGIN_COVERAGE:
            continue
        fractions = [float(r[f"{radius_key}_{side}_origin_coverage_fraction"])
                     for side in att.SIDES]
        assert min(fractions) == 0.0, r


# --------------------------------------------------------------------------
# 5. the pooling is by people
# --------------------------------------------------------------------------

def test_weighted_median_returns_none_for_no_samples():
    assert att.weighted_median([]) is None


def test_weighted_median_of_equal_weights_is_the_lower_middle_value():
    assert att.weighted_median([(10.0, 1.0), (20.0, 1.0), (30.0, 1.0)]) == 20.0
    assert att.weighted_median([(10.0, 1.0), (20.0, 1.0)]) == 10.0


def test_weighted_median_follows_the_weight_not_the_count():
    """Nine samples say 10 minutes and one says 60, but the one carries
    almost all the people -- so 60 is the median resident's answer."""
    samples = [(10.0, 1.0)] * 9 + [(60.0, 1000.0)]
    assert att.weighted_median(samples) == 60.0


def test_pooling_weights_a_populous_block_group_over_an_empty_one():
    populous = _profile([60.0] * 10)
    tiny = _profile([10.0] * 10)
    summary = att.summarise([(5000.0, populous), (10.0, tiny)])
    assert summary["median_min"] == 60.0
    # The extremes are what any resident sees, so both survive unweighted.
    assert summary["best_min"] == 10.0
    assert summary["worst_min"] == 60.0


def test_pooled_reachability_is_the_population_weighted_share():
    always = _profile([10.0] * 10, n_departures=10)
    never = _profile([], n_departures=10)
    summary = att.summarise([(300.0, always), (100.0, never)])
    assert summary["reachable_fraction"] == pytest.approx(0.75,
                                                          abs=FRACTION_TOLERANCE)


def test_a_place_no_network_reaches_has_no_median_but_still_reports_a_fraction():
    summary = att.summarise([(100.0, _profile([], n_departures=120))])
    assert summary["median_min"] is None
    assert summary["best_min"] is None
    assert summary["reachable_fraction"] == 0.0


def test_a_half_reachable_block_group_carries_half_the_weight():
    """A block group able to make the trip at only half the minutes should
    move the pooled median half as much as an equally populous one that can
    always make it -- the median is over resident-MINUTES, not residents."""
    always_slow = _profile([60.0] * 10, n_departures=10)
    sometimes_fast = _profile([10.0] * 5, n_departures=10)
    summary = att.summarise([(100.0, always_slow), (100.0, sometimes_fast)])
    assert summary["median_min"] == 60.0
    assert summary["reachable_fraction"] == pytest.approx(0.75,
                                                          abs=FRACTION_TOLERANCE)


# --------------------------------------------------------------------------
# 6. the reproduction pin
# --------------------------------------------------------------------------

@pytest.fixture(scope="module")
def current_headline_timetable():
    """Built once for the whole module -- the expensive part of the pin.

    The pedestrian network has to be loaded here too. It is what the
    published numbers were measured on, so a timetable built without it
    answers a different question (the crow's distance) and the pin would
    fail against its own CSV rather than catching a regression.
    """
    patterns, coords = att.load_side_patterns(att.CURRENT)
    return journey.Timetable.build(
        label="test-current-headline", patterns=patterns, coords=coords,
        max_transfer_walk_m=att.TRANSFER_RADII_M[att.HEADLINE],
        walk=walking.load(att.WALK_EXTRACT))


def _sample_origin_rows(origin_rows, trip_time_rows, n=2):
    """A small, deterministic sample: the first published origin (whatever
    block group that is) and one origin belonging to a fallback-tier place,
    so the pin covers both origin tiers without rebuilding the timetable
    more than once."""
    fallback_places = {r["place"] for r in trip_time_rows
                       if r["origin_source"] == att.ORIGIN_SOURCE_STOPS}
    sample = [origin_rows[0]]
    for r in origin_rows:
        if r["place"] in fallback_places:
            sample.append(r)
            break
    return sample[:n]


def test_reproduces_the_published_current_headline_origins(
        origin_rows, trip_time_rows, current_headline_timetable):
    """Pinned against the per-origin file rather than the pooled one: a
    single coordinate is what `journey.profile` actually takes, so this
    reproduces exactly the unit the router was given."""
    prefix = f"{att.HEADLINE}_{att.CURRENT}_"
    for row in _sample_origin_rows(origin_rows, trip_time_rows):
        origin = (float(row["lat"]), float(row["lon"]))
        pair = [r for r in trip_time_rows
                if (r["place"], r["anchor"]) == (row["place"], row["anchor"])][0]
        dest = (float(pair["dest_lat"]), float(pair["dest_lon"]))
        summary = att.profile_summary(current_headline_timetable, origin, dest)

        assert summary["reachable_fraction"] == pytest.approx(
            float(row[prefix + "reachable_fraction"]), abs=FRACTION_TOLERANCE), row

        published_median = _float_or_none(row[prefix + "median_min"])
        if published_median is None:
            assert summary["median_min"] is None, row
        else:
            assert summary["median_min"] == pytest.approx(
                published_median, abs=MINUTE_TOLERANCE), row
