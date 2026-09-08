"""The added-stops layer is an inventory, and must stay one.

`query.added_stops` is the only thing this app draws whose unit is a stop PRT
will build rather than a location something was measured at. Three properties
keep it from turning into a measurement, and each has a way of eroding
quietly:

- it must not enter the published point set, or a bucket count moves;
- it must not carry a renumbered stop, or the map claims new service where a
  pole merely changed its number;
- it must carry the stops the reports were about, which is the whole reason
  the layer exists.
"""
import pytest

from refresh import query

# The four stops route 34 gains on McMonagle Avenue and the pair on McFarland
# Road, which is what the PRT consultant reported as missing from the map.
# Named here rather than described, because a test that only counted rows
# would pass on a layer that had lost exactly these.
REPORTED = {
    "10010339": "McMonagle Ave + N Meadowcroft Ave",
    "10010424": "McMonagle Ave + N Meadowcroft Ave",
    "10010425": "McMonagle Ave + Banksville Rd",
    "10010426": "McMonagle Ave + Banksville Rd",
    "10010427": "McFarland Rd + Dell Ave",
    "10010428": "McFarland Rd + Dell Ave",
}

# Today's pole under tomorrow's number: a proposed id absent from the current
# feed, within RENUMBERING_MAX_M of a current id the proposed feed dropped,
# with the two names transposed. No bus arrives anywhere new.
RENUMBERED = {"10010294", "10010403", "20287", "8681", "21037"}


@pytest.fixture(scope="module")
def added(con):
    return query.added_stops(con)


def test_carries_the_stops_that_were_reported_missing(added):
    by_id = {s["stop_id"]: s for s in added}
    for stop_id, name in REPORTED.items():
        assert stop_id in by_id, f"{name} ({stop_id}) is not in the layer"
        assert by_id[stop_id]["name"] == name
        assert by_id[stop_id]["routes"] == ["34"]
        assert by_id[stop_id]["trips"]["weekday"] > 0


def test_a_renumbered_stop_is_not_an_added_one(added):
    ids = {s["stop_id"] for s in added}
    assert not (ids & RENUMBERED)


def test_every_added_stop_is_absent_from_todays_feed(con, added):
    current = {r["stop_id"] for r in con.execute(
        "SELECT stop_id FROM stops WHERE side = 'current'")}
    assert not ({s["stop_id"] for s in added} & current)


def test_nothing_here_is_a_measured_location(con, added):
    """The published bucket counts must not be able to move because of this.

    `change_points` is what `data/coverage_change.csv`'s locations and the
    map's dots are counted over. An added stop far enough from today's network
    does appear there -- as a `p:` point, which has always been part of the
    published set -- so the test is that these ids bring no NEW point ids with
    them, not that the two sets are disjoint.
    """
    points = {pid for pid, _lat, _lon, _pub in query.change_points(con)}
    for s in added:
        assert f"c:{s['stop_id']}" not in points


def test_trips_are_reported_for_every_day_type(added):
    for s in added:
        assert set(s["trips"]) == set(query.DAYS)
        assert any(s["trips"][d] > 0 for d in query.DAYS), s["name"]
