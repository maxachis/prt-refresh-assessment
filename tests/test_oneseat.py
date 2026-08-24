"""The one-seat layer: can a rider get from here to there without transferring?

What these tests are protecting, in order of how badly each failure would read:

1. THE ROUTE SETS ARE THE PUBLISHED ONES. `data/oneseat_change.csv` is what
   `docs/answers/GAIN|LOSE-ONE-SEAT-*.md` cite. Every route those rows credit
   with reaching Downtown or Oakland must still reach it here, measured at the
   published 200 m, or the app and the answer documents disagree about the
   same word.
2. RAIL IS IN IT. Every other layer in this app is bus only. This one must not
   be: drop the T and Beechview reads as losing a Downtown one-seat ride the
   Blue Line still provides. That is control 2 of `analyze_one_seat.py`.
3. THE WALK RADIUS IS APPLIED AT BOTH ENDS, and the divergence from the
   published 200 m destination radius is measured rather than assumed away.
4. A DOT AND THE PANEL BEHIND IT AGREE, the same guarantee the change layer
   and the surface carry.
"""
import csv
from pathlib import Path

import pytest

from refresh import query

ROOT = Path(__file__).resolve().parent.parent
ONESEAT_CSV = ROOT / "data" / "oneseat_change.csv"

# Rail route ids in the current feed. Named rather than discovered so the test
# fails loudly if the one-seat index silently goes bus-only.
RAIL = {"BLUE", "RED", "SLVR"}

# Somewhere unambiguously in each anchor, for the "at the destination" test.
DOWNTOWN_POINT = (40.4406, -79.9959)          # Fifth & Market


@pytest.fixture(scope="module")
def oneseat_rows():
    if not ONESEAT_CSV.exists():
        pytest.skip(f"{ONESEAT_CSV} not built -- run analyze_one_seat.py")
    with open(ONESEAT_CSV, encoding="utf-8") as f:
        return list(csv.DictReader(f))


def _has_layer(con):
    return con.execute("SELECT 1 FROM sqlite_master WHERE type = 'table' "
                       "AND name = 'point_reach'").fetchone() is not None


@pytest.fixture(scope="module")
def built(con):
    if not _has_layer(con):
        pytest.skip("refresh.db predates the one-seat layer -- rebuild it")
    return con


# --------------------------------------------------------------------------
# the verdict itself -- pure functions, no database
# --------------------------------------------------------------------------

def test_status_needs_both_sides_to_keep():
    assert query.oneseat_status({"61C"}, {"61X"}) == "keeps"


def test_status_reads_an_empty_side_as_the_change():
    assert query.oneseat_status(set(), {"P3"}) == "gains"
    assert query.oneseat_status({"71B"}, set()) == "loses"
    assert query.oneseat_status(set(), set()) == "none"


def test_being_at_the_destination_outranks_keeping_a_ride_to_it():
    """A place needs no one-seat ride to itself.

    `analyze_one_seat.py` skips the anchor districts outright; this layer has
    to paint them, so they get their own status rather than joining the 'keeps'
    tally and overstating it by the size of Downtown.
    """
    assert query.oneseat_status({"61C"}, {"61X"}, here=True) == "here"
    assert query.oneseat_status(set(), set(), here=True) == "here"


def test_at_destination_measures_from_every_seed_not_a_centroid():
    seeds = [(40.44, -79.99), (40.50, -79.90)]
    assert query.at_destination(40.5001, -79.9001, seeds, 400)
    assert not query.at_destination(40.47, -79.945, seeds, 400)   # between them


# --------------------------------------------------------------------------
# agreement with the published place-level answer
# --------------------------------------------------------------------------

@pytest.mark.parametrize("key", ["downtown", "oakland"])
def test_published_routes_reach_the_destination_at_the_published_radius(
        built, oneseat_rows, key):
    """Every route the CSV credits with reaching an anchor still reaches it.

    Measured at PUBLISHED_ANCHOR_RADIUS, not the app's walk radius, because
    this is a port check: the two must agree where they are asking the same
    question. Where they differ by design is the radius, and the test below
    measures that difference instead of hiding it here.
    """
    anchor = key.capitalize()
    seeds = query.destination_seeds(built, key)
    assert seeds, f"no seed stops for {key}"

    for side, column in (("current", "routes_now"), ("proposed", "routes_proposed")):
        published = {r for row in oneseat_rows if row["anchor"] == anchor
                     for r in row[column].split(";") if r}
        reach = query.routes_reaching(
            built, seeds, query.PUBLISHED_ANCHOR_RADIUS, side)
        missing = published - reach
        assert not missing, (
            f"{side}: {sorted(missing)} reach {anchor} in oneseat_change.csv "
            f"but not in the app's index")


@pytest.mark.parametrize("key", ["downtown", "oakland"])
def test_the_walk_radius_only_ever_adds_routes(built, key):
    """400 m at the destination is a superset of the published 200 m.

    Max chose the walk radius at both ends: the reader moves one radius
    control and a rider walks at the far end too. The consequence is that the
    app is slightly more generous than the CSV about what reaches an anchor,
    and the direction of that difference is the part worth pinning -- a
    strictly larger circle must never find fewer routes, and if it does, the
    seed cloud or the metric is wrong rather than the plan.
    """
    seeds = query.destination_seeds(built, key)
    for side in query.SIDES:
        narrow = query.routes_reaching(
            built, seeds, query.PUBLISHED_ANCHOR_RADIUS, side)
        wide = query.routes_reaching(built, seeds, query.PRIMARY_RADIUS, side)
        assert narrow <= wide


def test_rail_reaches_downtown(built):
    """The one-seat index is not bus only, and this is the test that says so.

    If this fails because the rail routes were dropped, the visible symptom is
    the South Hills reading as a wall of lost Downtown one-seat rides that the
    Blue and Red lines still provide.
    """
    reach = query.routes_reaching(
        built, query.destination_seeds(built, "downtown"),
        query.PRIMARY_RADIUS, "current")
    assert RAIL <= reach


def test_the_reach_index_is_wider_than_the_bus_only_stop_table(built):
    reach = built.execute(
        "SELECT COUNT(*) FROM reach_stop WHERE side = 'current'").fetchone()[0]
    bus = built.execute(
        "SELECT COUNT(*) FROM stops WHERE side = 'current'").fetchone()[0]
    assert reach > bus


# --------------------------------------------------------------------------
# one point
# --------------------------------------------------------------------------

def test_a_point_in_downtown_is_at_the_destination(built):
    lat, lon = DOWNTOWN_POINT
    got = query.oneseat_at_place(built, lat, lon, query.PRIMARY_RADIUS,
                                 key="downtown")
    assert got["status"] == "here"


def test_a_dropped_pin_needs_no_named_destination(built):
    """The reader can pick anywhere; a pin is a destination with one seed."""
    lat, lon = DOWNTOWN_POINT
    got = query.oneseat_at_place(built, 40.4614, -79.9247, query.PRIMARY_RADIUS,
                                 dest_lat=lat, dest_lon=lon)
    assert got["destination"]["seeds"] == 1
    assert got["status"] in dict(query.ONESEAT_STATUSES)


def test_the_verdict_splits_into_route_lists_that_add_up(built):
    got = query.oneseat_at_place(built, 40.4614, -79.9247, query.PRIMARY_RADIUS,
                                 key="downtown")
    now, prop = set(got["current"]), set(got["proposed"])
    assert set(got["kept"]) == now & prop
    assert set(got["lost"]) == now - prop
    assert set(got["gained"]) == prop - now


def test_place_carries_a_verdict_for_every_named_destination(built):
    got = query.place(built, 40.4614, -79.9247, query.PRIMARY_RADIUS)
    keys = {d["key"] for d in got["oneseat"]}
    assert keys == {d["key"] for d in query.destinations(built)}
    assert keys == {"downtown", "oakland"}


# --------------------------------------------------------------------------
# the citywide layer
# --------------------------------------------------------------------------

def test_the_layer_paints_the_same_points_as_the_change_layer(built):
    """Switching views must not also switch which places are on the map."""
    layer = query.oneseat_layer(built, query.PRIMARY_RADIUS, key="downtown")
    change = query.change_layer(built, query.PRIMARY_RADIUS)
    assert len(layer["points"]) == len(change["points"])
    assert ({(p[0], p[1]) for p in layer["points"]}
            == {(p[0], p[1]) for p in change["points"]})


def test_the_layer_counts_every_point_exactly_once(built):
    layer = query.oneseat_layer(built, query.PRIMARY_RADIUS, key="downtown")
    assert sum(layer["counts"].values()) == len(layer["points"])
    assert set(layer["counts"]) == set(query.ONESEAT_KEYS)


def test_a_dot_agrees_with_the_panel_it_opens(built):
    """The change layer's guarantee, carried over: a dot cannot lie about the
    answer a reader gets by clicking it."""
    layer = query.oneseat_layer(built, query.PRIMARY_RADIUS, key="oakland")
    labels = [s["key"] for s in layer["statuses"]]
    for p in layer["points"][::400]:
        panel = query.oneseat_at_place(built, p[0], p[1], query.PRIMARY_RADIUS,
                                       key="oakland")
        assert labels[p[3]] == panel["status"], f"disagreement at {p[0]},{p[1]}"
        assert p[4] == ";".join(panel["current"])
        assert p[5] == ";".join(panel["proposed"])


def test_downtown_itself_is_painted_as_the_destination(built):
    layer = query.oneseat_layer(built, query.PRIMARY_RADIUS, key="downtown")
    assert layer["counts"]["here"] > 0


def test_an_unknown_destination_key_is_an_error_not_an_empty_map(built):
    with pytest.raises(KeyError):
        query.oneseat_layer(built, query.PRIMARY_RADIUS, key="shadyside")


def test_a_destination_needs_a_key_or_a_point(built):
    with pytest.raises(ValueError):
        query.oneseat_layer(built, query.PRIMARY_RADIUS)


# --------------------------------------------------------------------------
# the day-restricted variant
# --------------------------------------------------------------------------
#
# The published question has no day type: a route serves a place or it does
# not. That answer stays the default and stays what `data/oneseat_change.csv`
# pins. This is the additive variant beside it, and what these tests protect
# is that it is a genuinely different measurement -- resolved per stop and per
# day, not a route-level "does the 61C run on Sunday" -- and that widening it
# can never leak into the published one.

def test_day_route_sets_are_subsets_of_the_any_day_one():
    """No day can boast a route the all-days index has never seen."""
    import gtfs
    feed = gtfs.current()
    any_day, _ = gtfs.stop_routes(feed, bus_only=False)
    by_day, _ = gtfs.stop_routes_by_day(feed, gtfs.SAMPLE["current"],
                                        bus_only=False)
    assert set(by_day) == set(gtfs.DAYS)
    for day, served in by_day.items():
        for sid, routes in served.items():
            assert routes <= any_day.get(sid, set()), f"{sid} on {day}"


def test_sunday_is_strictly_smaller_than_any_day():
    """The whole reason the variant exists: weekend service is not the week's.

    Checked as stop-route PAIRS rather than as route ids, because a route
    running on Sunday somewhere is not the same claim as it running past this
    corner -- that gap is exactly what a route-level day filter would miss.
    """
    import gtfs
    feed = gtfs.current()
    any_day, _ = gtfs.stop_routes(feed, bus_only=False)
    by_day, _ = gtfs.stop_routes_by_day(feed, gtfs.SAMPLE["current"],
                                        bus_only=False)
    pairs = {(sid, rt) for sid, rts in any_day.items() for rt in rts}
    sunday = {(sid, rt) for sid, rts in by_day["sunday"].items() for rt in rts}
    assert len(sunday) < len(pairs) * 0.9


def test_rail_survives_the_day_filter():
    """Control 2 again: the T runs on a Sunday and must still be in the index."""
    import gtfs
    by_day, _ = gtfs.stop_routes_by_day(gtfs.current(), gtfs.SAMPLE["current"],
                                        bus_only=False)
    for day in gtfs.DAYS:
        seen = {rt for rts in by_day[day].values() for rt in rts}
        assert RAIL & seen, f"no rail on {day}"


def test_day_restricted_routes_at_a_point_narrow(built):
    """The stored per-day index narrows what is boardable, never widens it."""
    lat, lon = DOWNTOWN_POINT
    wide = query.routes_at(built, lat, lon, query.PRIMARY_RADIUS, "current")
    for day in query.DAYS:
        narrow = query.routes_at(built, lat, lon, query.PRIMARY_RADIUS,
                                 "current", day=day)
        assert narrow <= wide
    assert query.routes_at(built, lat, lon, query.PRIMARY_RADIUS, "current",
                           day="sunday") < wide


def test_day_restricted_layer_agrees_with_its_own_panel(built):
    """The dot and the panel behind it agree on a day, as they do off one."""
    layer = query.oneseat_layer(built, query.PRIMARY_RADIUS, key="downtown",
                                day="sunday")
    assert layer["day"] == "sunday"
    fields = layer["fields"]
    lat_i, lon_i, st_i = (fields.index(f) for f in ("lat", "lon", "status"))
    keys = [s["key"] for s in layer["statuses"]]
    for row in layer["points"][::400]:
        panel = query.oneseat_at_place(built, row[lat_i], row[lon_i],
                                       query.PRIMARY_RADIUS, key="downtown",
                                       day="sunday")
        assert panel["status"] == keys[row[st_i]]


def test_the_published_answer_is_the_default(built):
    """Asking for no day is the any-day answer, and it is what the CSV pins."""
    default = query.oneseat_layer(built, query.PRIMARY_RADIUS, key="downtown")
    explicit = query.oneseat_layer(built, query.PRIMARY_RADIUS, key="downtown",
                                   day=query.ANY_DAY)
    assert default["day"] == query.ANY_DAY
    assert default["counts"] == explicit["counts"]


def test_a_day_loses_one_seat_rides_the_any_day_answer_keeps(built):
    """Sunday must not read as better connected than the week that contains it."""
    wide = query.oneseat_layer(built, query.PRIMARY_RADIUS, key="downtown")
    sunday = query.oneseat_layer(built, query.PRIMARY_RADIUS, key="downtown",
                                 day="sunday")
    assert sunday["counts"]["keeps"] < wide["counts"]["keeps"]
