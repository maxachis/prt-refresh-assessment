"""The served travel time must be the published travel time.

`data/trip_time_origins.csv` is the per-block-group evidence behind
`data/trip_time_change.csv` -- one row per (place, anchor, block group), each
row the answer for a single literal coordinate. That is exactly the question
the app asks when a reader drops two pins, so it is the right pin for the
served answer: same origin, same destination, same window, same two transfer
radii, and the medians must agree to the decimal the file publishes.

They are reached by different code. The script parses two GTFS feeds and holds
the patterns in memory; the app reads them back out of SQLite and rebuilds the
timetable. `tests/test_journey_layer.py` already checks that the carry-over
keeps every trip; this module checks that the SUMMARY built on top of it is the
one `analyze_travel_time.py` publishes -- the lower weighted median rather than
`statistics.median`, the same rounding, the same classification vocabulary, and
the same answer at both transfer radii so a reader can see a sign flip rather
than be handed one number whose direction depends on an invented constant
(convention 14, `docs/worklog/transfer-radius-favours-one-network.md`).
"""
import csv
import random
from pathlib import Path

import pytest

import analyze_travel_time as att
from refresh import journey, query

ROOT = Path(__file__).resolve().parent.parent
ORIGINS_CSV = ROOT / "data" / "trip_time_origins.csv"
PAIRS_CSV = ROOT / "data" / "trip_time_change.csv"

# A profile is a slow query -- a few tenths of a second for a well-served pair,
# a few seconds for a badly served one, times two networks times two transfer
# radii. Sampled and seeded, like test_query.py's coverage pin, so the suite
# stays runnable while the sample is the same set every run.
SAMPLE_N = 8


@pytest.fixture(scope="module")
def published():
    """[(origin row, destination)] -- the evidence rows, with their anchors."""
    if not (ORIGINS_CSV.exists() and PAIRS_CSV.exists()):
        pytest.skip("travel-time output not built -- run analyze_travel_time.py")
    with open(PAIRS_CSV, encoding="utf-8") as f:
        dests = {(r["place"], r["anchor"]): (float(r["dest_lat"]),
                                             float(r["dest_lon"]))
                 for r in csv.DictReader(f)}
    with open(ORIGINS_CSV, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    return [(r, dests[(r["place"], r["anchor"])]) for r in rows
            if (r["place"], r["anchor"]) in dests]


@pytest.fixture(scope="module")
def sample(published):
    random.seed(1729)
    return random.sample(published, SAMPLE_N)


def _float_or_none(text):
    return float(text) if text not in ("", None) else None


# --------------------------------------------------------------------------
# the pin: served == published
# --------------------------------------------------------------------------

def test_matches_the_published_per_origin_medians(con, sample):
    mismatches = []
    for row, dest in sample:
        served = query.journey_between(con, float(row["lat"]), float(row["lon"]),
                                       dest[0], dest[1])
        for radius_key in query.TRANSFER_RADII:
            for side in query.SIDES:
                got = served["radii"][radius_key][side]
                for served_key, column in (
                        ("median_min", "median_min"),
                        ("reachable_fraction", "reachable_fraction"),
                        ("origin_access_stops", "access_stops")):
                    want = row[f"{radius_key}_{side}_{column}"]
                    want = (int(want) if column == "access_stops"
                            else _float_or_none(want))
                    if got[served_key] != want:
                        mismatches.append(
                            f"{row['place']} -> {row['anchor']} "
                            f"{radius_key}/{side}/{served_key}: "
                            f"served {got[served_key]}, published {want}")
    assert not mismatches, "\n".join(mismatches)


def test_the_served_summary_is_the_scripts_own(con, sample):
    """Not just equal numbers -- the same statistic.

    The lower median of one profile differs from `statistics.median` only on
    an even count, by half a step of the arrival curve, which is exactly the
    kind of drift a rounded CSV comparison can hide.
    """
    row, dest = sample[0]
    origin = (float(row["lat"]), float(row["lon"]))
    tt = query.journey_timetable(con, "current", query.JOURNEY_DAY,
                                 query.TRANSFER_RADII["headline"])
    want = att.profile_summary(tt, origin, dest)
    got = query.journey_between(con, origin[0], origin[1], dest[0],
                                dest[1])["radii"]["headline"]["current"]
    for key, value in want.items():
        assert got[key] == value, key


def test_the_window_and_the_radii_are_the_published_ones(con):
    assert query.JOURNEY_WINDOW == att.WINDOW
    assert query.JOURNEY_DAY == att.DAY_TYPE
    assert query.TRANSFER_RADII == att.TRANSFER_RADII_M
    assert set(query.JOURNEY_CLASSIFICATIONS) == set(att.CLASSIFICATIONS)


# --------------------------------------------------------------------------
# what the answer says about itself
# --------------------------------------------------------------------------

def test_a_change_is_the_difference_of_the_two_published_medians(con, sample):
    for row, dest in sample:
        served = query.journey_between(con, float(row["lat"]), float(row["lon"]),
                                       dest[0], dest[1])
        for radius_key, at_radius in served["radii"].items():
            current = at_radius["current"]["median_min"]
            proposed = at_radius["proposed"]["median_min"]
            if current is None or proposed is None:
                assert at_radius["change_min"] is None
            else:
                assert at_radius["change_min"] == round(proposed - current, 1)


def test_a_reachable_pair_is_classified_comparable(con, sample):
    for row, dest in sample:
        served = query.journey_between(con, float(row["lat"]), float(row["lon"]),
                                       dest[0], dest[1])
        for at_radius in served["radii"].values():
            both = (at_radius["current"]["median_min"] is not None
                    and at_radius["proposed"]["median_min"] is not None)
            assert (at_radius["classification"] == query.CLASS_COMPARABLE) == both


def test_an_origin_with_no_stop_in_reach_says_so_rather_than_no_journey(con):
    """The failure mode `one-point-cannot-represent-a-township.md` is about.

    A point with no stop within the access walk has a coverage answer, not a
    travel-time one, and the app has to say which -- otherwise a reader reads
    "no trip found" as the plan having taken a trip away.
    """
    middle_of_the_woods = (40.72, -80.10)
    served = query.journey_between(con, *middle_of_the_woods, 40.4406, -79.9959)
    at_radius = served["radii"]["headline"]
    assert at_radius["classification"] == query.CLASS_NO_ORIGIN_COVERAGE
    assert at_radius["current"]["origin_access_stops"] == 0
    assert at_radius["current"]["median_min"] is None


def test_the_flip_flag_fires_only_when_the_two_radii_disagree_in_direction(con,
                                                                          sample):
    for row, dest in sample:
        served = query.journey_between(con, float(row["lat"]), float(row["lon"]),
                                       dest[0], dest[1])
        headline = served["radii"]["headline"]["change_min"]
        strict = served["radii"]["strict"]["change_min"]
        if headline is None or strict is None:
            assert served["sign_flips"] is None
        else:
            assert served["sign_flips"] == (headline * strict < 0)


def test_the_constants_that_invented_the_transfers_ship_with_the_answer(con,
                                                                       sample):
    """Convention 14: the transfer graph is synthesised, and a time quoted
    without the numbers that built it is quoting a chosen constant as a fact."""
    row, dest = sample[0]
    served = query.journey_between(con, float(row["lat"]), float(row["lon"]),
                                   dest[0], dest[1])
    assert served["constants"] == journey.CONSTANTS
    assert served["radii"]["strict"]["transfer_walk_m"] == 150.0


# --------------------------------------------------------------------------
# the itinerary a reader is shown
# --------------------------------------------------------------------------

def test_the_itinerary_is_a_journey_that_takes_the_median_time(con, sample):
    for row, dest in sample:
        served = query.journey_between(con, float(row["lat"]), float(row["lon"]),
                                       dest[0], dest[1])
        for at_radius in served["radii"].values():
            for side in query.SIDES:
                answer = at_radius[side]
                if answer["median_min"] is None:
                    assert answer["itinerary"] is None
                    continue
                legs = answer["itinerary"]["legs"]
                assert legs
                assert round(answer["itinerary"]["arrive"]
                             - answer["itinerary"]["ready_at"],
                             1) == answer["median_min"]
                for earlier, later in zip(legs, legs[1:]):
                    assert earlier["arrive"] <= later["depart"]
                for leg in legs:
                    assert leg["kind"] in (journey.LEG_WALK, journey.LEG_RIDE)
                    assert (leg["route"] is None) == (leg["kind"]
                                                      == journey.LEG_WALK)


def test_a_ride_leg_can_be_drawn_on_the_map(con, sample):
    """Every stop a leg names has coordinates, so the UI can draw the trip.

    Names are best-effort and rail's are missing on purpose: `stops` is the
    bus-only service table, and joining rail into it would be the leak
    convention 13 forbids. Coordinates come from the journey layer's own stop
    table, which has every mode.
    """
    row, dest = sample[0]
    served = query.journey_between(con, float(row["lat"]), float(row["lon"]),
                                   dest[0], dest[1])
    drawn = 0
    for at_radius in served["radii"].values():
        for side in query.SIDES:
            itinerary = at_radius[side]["itinerary"]
            if itinerary is None:
                continue
            for leg in itinerary["legs"]:
                for end in ("from", "to"):
                    if leg[end] is not None:
                        assert leg[end]["lat"] and leg[end]["lon"]
                        drawn += 1
    assert drawn


# --------------------------------------------------------------------------
# the timetable behind it
# --------------------------------------------------------------------------

def test_a_timetable_is_built_once_and_reused(con):
    """A rebuild per request would be a third of a second of pure waste."""
    first = query.journey_timetable(con, "current", "weekday", 400.0)
    assert query.journey_timetable(con, "current", "weekday", 400.0) is first


def test_each_transfer_radius_gets_its_own_timetable(con):
    """The transfer graph is synthesised at build time, so the radius cannot
    be applied per search -- two radii mean two timetables."""
    wide = query.journey_timetable(con, "current", "weekday", 400.0)
    tight = query.journey_timetable(con, "current", "weekday", 150.0)
    assert wide is not tight
    assert sum(len(v) for v in tight.transfer_graph.values()) < \
        sum(len(v) for v in wide.transfer_graph.values())


def test_saturday_can_be_asked_for(con, sample):
    """The published answer is the weekday peak, but the journey layer carries
    all three day types and a Sunday trip is a fair question to ask of it."""
    row, dest = sample[0]
    served = query.journey_between(con, float(row["lat"]), float(row["lon"]),
                                   dest[0], dest[1], day="saturday")
    assert served["day"] == "saturday"
