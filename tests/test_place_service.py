"""How much bus service touches a named place, and what the count must not be.

The failure this file exists to prevent is counting stop events instead of
trips: a corridor with twelve stops inside a borough would otherwise report
twelve times the service of the same corridor with one stop, and the map would
draw stop spacing.
"""
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import analyze_place_service as svc  # noqa: E402
from refresh import geometry  # noqa: E402


def box(name, lat, lon, half=0.01, kind="borough"):
    return geometry.Place(name=name, kind=kind, polygons=[[[
        [lon - half, lat - half], [lon + half, lat - half],
        [lon + half, lat + half], [lon - half, lat + half],
        [lon - half, lat - half]]]])


@pytest.fixture
def index():
    return geometry.PlaceIndex([box("Ash", 40.40, -80.00),
                                box("Birch", 40.50, -80.00)])


def test_a_stop_takes_the_place_that_contains_it(index):
    coords = {"s1": (40.40, -80.00), "s2": (40.50, -80.00),
              "far": (41.90, -77.00)}
    assert svc.assign_stops(coords, index) == {"s1": "Ash", "s2": "Birch"}


def test_a_stop_outside_every_boundary_is_dropped(index):
    """The feeds run into Beaver and Westmoreland; this analysis is Allegheny's
    named places, so a stop in neither is not a nameless place, it is out of
    scope."""
    assert "far" not in svc.assign_stops({"far": (41.9, -77.0)}, index)


def test_a_trip_counts_once_per_place_however_many_stops_it_makes():
    """The whole point. Twelve stops in Ash is one bus, not twelve."""
    stop_place = {f"s{i}": "Ash" for i in range(12)}
    visits = [("t1", f"s{i}") for i in range(12)]
    counts = svc.count_trips(visits, stop_place, {"t1": ["weekday"]})
    assert counts["weekday"]["Ash"] == 1


def test_a_trip_crossing_two_places_counts_in_both():
    """This is service *touching* a place, not an allocation of trips between
    places, so the column deliberately does not sum to the network's trips."""
    counts = svc.count_trips(
        [("t1", "a"), ("t1", "b")], {"a": "Ash", "b": "Birch"},
        {"t1": ["weekday"]})
    assert counts["weekday"] == {"Ash": 1, "Birch": 1}


def test_a_trip_runs_on_every_day_type_its_calendar_gives_it():
    counts = svc.count_trips([("t1", "a")], {"a": "Ash"},
                             {"t1": ["saturday", "sunday"]})
    assert counts["saturday"]["Ash"] == 1
    assert counts["sunday"]["Ash"] == 1
    assert "Ash" not in counts["weekday"]


def test_a_trip_whose_calendar_is_holiday_only_is_not_counted():
    """`trip_days` carries only real day types, so an unlisted trip vanishes
    rather than defaulting into weekday."""
    counts = svc.count_trips([("t1", "a")], {"a": "Ash"}, {})
    assert counts["weekday"] == {}


def test_percent_change_is_withheld_where_there_is_no_denominator():
    """A place with no bus today and buses proposed has an undefined percent
    change, not an infinite one. Like boardings, the asymmetry is reported in
    words rather than as a number the arithmetic cannot support."""
    assert svc.pct_change(80, 100) == pytest.approx(25.0)
    assert svc.pct_change(100, 25) == pytest.approx(-75.0)
    assert svc.pct_change(0, 40) is None
    assert svc.pct_change(0, 0) is None


def test_routes_split_into_buses_and_everything_else():
    """Bethel Park is why this exists. The plan leaves it no bus at all, and
    the Blue, Red and Silver lines still call there, so a place drawn at
    -100% must be able to say the T remains -- convention 13's Beechview
    trap, arriving at the service unit."""
    rows = [{"route_id": "36", "route_type": "3"},
            {"route_id": "BLUE", "route_type": "0"},
            {"route_id": "RED", "route_type": "2"},
            {"route_id": "MI", "route_type": "6"}]
    modes = svc.route_ids_by_mode(rows)
    assert modes["bus"] == {"36"}
    assert modes["rail"] == {"BLUE", "RED", "MI"}


def test_a_place_with_rail_and_no_bus_is_flagged_not_hidden():
    """The count is buses, so it is 0; the flag is what stops the map saying
    a place has no transit when the T still runs through it."""
    served = svc.places_served(
        [("t1", "a")], {"a": "Ash"}, {"t1": ["weekday"]})
    assert served["weekday"] == {"Ash"}
