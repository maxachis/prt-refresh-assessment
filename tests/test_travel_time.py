"""The travel-time layer: how long a rider's actual trip takes, place by place.

`analyze_travel_time.py` is the first script to run `journey.py` at scale
against the real feeds, over the same 187 places x 2 anchors the one-seat
answer already publishes. What these tests protect, in order of how badly a
failure would read:

1. THE PAIRS ARE THE PUBLISHED ONES. Every row here has to be a row of
   `data/oneseat_change.csv` and nothing else -- a place or anchor this file
   invents (or drops) would let a reader compare a one-seat verdict to a
   travel time for a pair the one-seat answer never assessed.
2. EVERY ORIGIN AND DESTINATION IS SOMEWHERE REAL. A geometry bug that put a
   point outside the region would still search and might even find a
   journey; nothing about the router would complain.
3. REACHABILITY AND THE SUMMARY STATISTICS AGREE WITH EACH OTHER. A fraction
   outside [0, 1] or a median attached to zero reachable journeys would be
   the kind of quiet corruption `journey.Profile` itself is built to make
   impossible -- this pins that this layer never re-introduces it on the way
   into a CSV.
4. THE REPRODUCTION PIN: a fixed sample of published rows must come back out
   of a freshly rebuilt timetable and a freshly run profile. This is the
   guarantee every other layer in this repo carries -- that a published
   number is not just plausible-looking output but something a stranger can
   regenerate from the same inputs.
"""
import csv
import math
from pathlib import Path

import pytest

import journey
import analyze_travel_time as att

ROOT = Path(__file__).resolve().parent.parent
ONESEAT_CSV = ROOT / "data" / "oneseat_change.csv"
TRIP_TIME_CSV = ROOT / "data" / "trip_time_change.csv"

# A generous bounding box around the three-county PRT service area -- wide
# enough to admit any real stop or block-group centroid, tight enough to
# catch a swapped lat/lon or a stray degrees-vs-radians bug.
LAT_RANGE = (40.0, 41.0)
LON_RANGE = (-81.0, -79.0)

# The CSV rounds minutes to one decimal place; a reproduction has to agree
# with that rounding, not with float-for-float equality.
MINUTE_TOLERANCE = 0.15
FRACTION_TOLERANCE = 1e-6


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


def _float_or_none(value):
    return None if value == "" else float(value)


# --------------------------------------------------------------------------
# 1. the pairs are the published ones
# --------------------------------------------------------------------------

def test_the_published_pairs_match_oneseat_exactly(oneseat_rows, trip_time_rows):
    expected = {(r["place"], r["anchor"]) for r in oneseat_rows}
    got = {(r["place"], r["anchor"]) for r in trip_time_rows}
    assert got == expected
    assert len(trip_time_rows) == len(oneseat_rows), (
        "a duplicate or dropped pair would agree on the set but not the count")


# --------------------------------------------------------------------------
# 2. every origin and destination is somewhere real
# --------------------------------------------------------------------------

def test_origins_and_destinations_are_plausible_pittsburgh_coordinates(trip_time_rows):
    for r in trip_time_rows:
        for lat_field, lon_field in (("origin_lat", "origin_lon"),
                                     ("dest_lat", "dest_lon")):
            lat, lon = float(r[lat_field]), float(r[lon_field])
            assert LAT_RANGE[0] <= lat <= LAT_RANGE[1], r
            assert LON_RANGE[0] <= lon <= LON_RANGE[1], r


def test_origin_source_is_one_of_the_two_published_tiers(trip_time_rows):
    sources = {r["origin_source"] for r in trip_time_rows}
    assert sources <= {att.ORIGIN_SOURCE_RESIDENTS, att.ORIGIN_SOURCE_STOPS}
    assert att.ORIGIN_SOURCE_RESIDENTS in sources  # the preferred tier is used


def test_the_ten_documented_fallback_places_use_the_stops_tier(trip_time_rows):
    """Verified in the brief: these ten have no block group whose population
    centre is nearest to them, so they must fall back to their own stops."""
    documented_fallbacks = {
        "Bedford Dwellings", "Central Northside", "Chateau", "Esplen",
        "Findlay township (Allegheny, PA)", "Mt. Oliver", "New Homestead",
        "St. Clair", "West End", "West Homestead borough (Allegheny, PA)",
    }
    by_place = {r["place"]: r["origin_source"] for r in trip_time_rows}
    for place in documented_fallbacks:
        if place in by_place:
            assert by_place[place] == att.ORIGIN_SOURCE_STOPS, place


# --------------------------------------------------------------------------
# 3. reachability and the summary statistics agree with each other
# --------------------------------------------------------------------------

@pytest.mark.parametrize("radius_key", att.RADIUS_KEYS)
@pytest.mark.parametrize("side", att.SIDES)
def test_reachable_fractions_are_within_bounds(trip_time_rows, radius_key, side):
    field = f"{radius_key}_{side}_reachable_fraction"
    for r in trip_time_rows:
        fraction = float(r[field])
        assert 0.0 <= fraction <= 1.0, r


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
# 3b. the classification column agrees with reachability -- see the module
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
def test_access_stop_counts_are_nonnegative_integers(trip_time_rows, radius_key, side):
    for r in trip_time_rows:
        for suffix in att.ACCESS_SUFFIXES:
            count = int(r[f"{radius_key}_{side}_{suffix}"])
            assert count >= 0, r


@pytest.mark.parametrize("radius_key", att.RADIUS_KEYS)
def test_no_origin_coverage_classification_means_a_side_has_zero_origin_stops(
        trip_time_rows, radius_key):
    for r in trip_time_rows:
        if r[f"{radius_key}_classification"] != att.CLASS_NO_ORIGIN_COVERAGE:
            continue
        current_stops = int(r[f"{radius_key}_current_origin_access_stops"])
        proposed_stops = int(r[f"{radius_key}_proposed_origin_access_stops"])
        assert current_stops == 0 or proposed_stops == 0, r


# --------------------------------------------------------------------------
# 4. the reproduction pin
# --------------------------------------------------------------------------

@pytest.fixture(scope="module")
def current_headline_timetable():
    """Built once for the whole module -- the expensive part of the pin."""
    patterns, coords = att.load_side_patterns(att.CURRENT)
    return journey.Timetable.build(
        label="test-current-headline", patterns=patterns, coords=coords,
        max_transfer_walk_m=att.TRANSFER_RADII_M[att.HEADLINE])


def _sample_rows(trip_time_rows, n=2):
    """A small, deterministic sample: the first published row (whatever
    place that is) and one row that used the fallback origin tier, so the
    pin covers both origin tiers without rebuilding the timetable more than
    once."""
    sample = [trip_time_rows[0]]
    for r in trip_time_rows:
        if r["origin_source"] == att.ORIGIN_SOURCE_STOPS:
            sample.append(r)
            break
    return sample[:n]


def test_reproduces_the_published_current_headline_numbers(
        trip_time_rows, current_headline_timetable):
    for row in _sample_rows(trip_time_rows):
        origin = (float(row["origin_lat"]), float(row["origin_lon"]))
        dest = (float(row["dest_lat"]), float(row["dest_lon"]))
        summary = att.profile_summary(current_headline_timetable, origin, dest)

        published_fraction = float(row["headline_current_reachable_fraction"])
        assert summary["reachable_fraction"] == pytest.approx(
            published_fraction, abs=FRACTION_TOLERANCE), row

        published_median = _float_or_none(row["headline_current_median_min"])
        if published_median is None:
            assert summary["median_min"] is None, row
        else:
            assert summary["median_min"] == pytest.approx(
                published_median, abs=MINUTE_TOLERANCE), row
            assert summary["best_min"] == pytest.approx(
                float(row["headline_current_best_min"]), abs=MINUTE_TOLERANCE)
            assert summary["worst_min"] == pytest.approx(
                float(row["headline_current_worst_min"]), abs=MINUTE_TOLERANCE)
