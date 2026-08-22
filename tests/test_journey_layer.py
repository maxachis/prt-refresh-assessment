"""The journey layer in the serving database -- the router's own timetable.

`data/refresh.db` has always held how MUCH service runs: departure minutes per
stop, bus only, folded onto the 4:00-28:00 axis. A router cannot use any of
that. It needs which departures belong to the same vehicle, in what order that
vehicle calls, in raw minutes, with rail in -- which is exactly what
`gtfs.load_patterns` reads and what `journey.Timetable` is built from. These
tests pin the carry-over of that structure into the database, so the app can
answer a journey without opening a GTFS feed.

What must hold, in the order a wrong answer would embarrass the repo:

1. IT IS THE SAME TIMETABLE, not a summary of one. Every pattern and every
   trip the router would load from the feed is in the database, with each
   trip's own running times -- both feeds widen a route's end-to-end time at
   the PM peak, and a per-pattern average would erase the plan's own
   congestion assumptions.
2. RAIL IS IN IT, AND STAYS OUT OF THE SERVICE TABLES. Convention 13: a
   journey counts the T, every service figure drops it. These are separate
   tables from `stops`/`departures` precisely so that widening the universe
   here can never widen it under a published service number, and that
   separation is only real if something checks it.
3. RAW MINUTES, NOT THE 4AM AXIS. Folding is right for a period bucket and
   wrong along a trip: a vehicle running through 4am would appear to arrive
   an hour before it left.
4. A REBUILT TIMETABLE ROUTES IDENTICALLY. The point of the tables is that
   `journey.Timetable.build` over what the database holds is the same object
   as over the feed -- same patterns, same coordinates, and therefore the
   same synthesised transfer graph and the same arrival.
"""
import csv
from pathlib import Path

import pytest

import gtfs
import journey

ROOT = Path(__file__).resolve().parent.parent
ORIGINS_CSV = ROOT / "data" / "trip_time_origins.csv"
PAIRS_CSV = ROOT / "data" / "trip_time_change.csv"

# Rail route ids that must survive into the journey layer. The two feeds spell
# rail differently -- current as route_type 2, proposed as 0 -- which is the
# trap `gtfs.load_patterns` exists to avoid.
RAIL = {"BLUE", "RED", "SLVR"}

MINUTES_PER_DAY = 24 * 60

# The published travel-time window, so the pin below asks the router the
# question `analyze_travel_time.py` asked it.
WINDOW_START_MIN = 7 * 60


@pytest.fixture(scope="module", params=["current", "proposed"])
def feed_side(request):
    side = request.param
    feed = gtfs.current() if side == "current" else gtfs.proposed()
    by_day, coords = gtfs.load_patterns(feed, gtfs.SAMPLE[side], quiet=True)
    return side, by_day, coords


def db_patterns(con, side, day):
    """{(route, stops): [(start, offsets)]} as the database holds it."""
    out = {}
    for row in con.execute(
            "SELECT pattern_id, route_id, stops FROM journey_pattern "
            "WHERE side = ? AND day = ?", (side, day)):
        stops = tuple(row["stops"].split(";"))
        trips = []
        for t in con.execute(
                "SELECT start_min, offsets FROM journey_trip WHERE side = ? "
                "AND day = ? AND pattern_id = ?", (side, day, row["pattern_id"])):
            offsets = tuple(int(o) for o in t["offsets"].split(","))
            trips.append((t["start_min"], offsets))
        out[(row["route_id"], stops)] = sorted(trips)
    return out


def db_coords(con, side):
    return {r["stop_id"]: (r["lat"], r["lon"]) for r in con.execute(
        "SELECT stop_id, lat, lon FROM journey_stop WHERE side = ?", (side,))}


# --------------------------------------------------------------------------
# 1. the same timetable, not a summary of one
# --------------------------------------------------------------------------

def test_every_pattern_the_router_would_load_is_in_the_database(con, feed_side):
    side, by_day, _ = feed_side
    for day in gtfs.DAYS:
        from_feed = {(route, tuple(stops)) for route, stops, _ in by_day[day]}
        assert set(db_patterns(con, side, day)) == from_feed


def test_every_trip_keeps_its_own_running_times(con, feed_side):
    side, by_day, _ = feed_side
    for day in gtfs.DAYS:
        stored = db_patterns(con, side, day)
        for route, stops, trips in by_day[day]:
            assert stored[(route, tuple(stops))] == sorted(
                (start, tuple(offsets)) for start, offsets in trips)


def test_a_pattern_id_is_not_reused_across_a_side_or_a_day(con):
    dupes = con.execute(
        "SELECT COUNT(*) FROM (SELECT side, day, pattern_id FROM "
        "journey_pattern GROUP BY side, day, pattern_id HAVING COUNT(*) > 1)"
    ).fetchone()[0]
    assert dupes == 0


def test_no_trip_points_at_a_pattern_that_does_not_exist(con):
    orphans = con.execute(
        "SELECT COUNT(*) FROM journey_trip t LEFT JOIN journey_pattern p "
        "ON p.side = t.side AND p.day = t.day AND p.pattern_id = t.pattern_id "
        "WHERE p.pattern_id IS NULL").fetchone()[0]
    assert orphans == 0


def test_every_trip_has_one_offset_per_stop_and_runs_forwards(con):
    for row in con.execute(
            "SELECT p.stops AS stops, t.offsets AS offsets FROM journey_trip t "
            "JOIN journey_pattern p ON p.side = t.side AND p.day = t.day "
            "AND p.pattern_id = t.pattern_id"):
        offsets = [int(o) for o in row["offsets"].split(",")]
        assert len(offsets) == len(row["stops"].split(";"))
        assert offsets[0] == 0
        assert offsets == sorted(offsets)


# --------------------------------------------------------------------------
# 2. rail is in it, and stays out of the service tables
# --------------------------------------------------------------------------

def test_rail_rides_in_the_journey_layer(con):
    routed = {r["route_id"] for r in
              con.execute("SELECT DISTINCT route_id FROM journey_pattern")}
    assert RAIL <= routed


def test_rail_never_leaks_into_a_service_table(con):
    for table in ("routes", "departures"):
        column = "route_id" if table == "routes" else "route"
        served = {r[0] for r in con.execute(
            f"SELECT DISTINCT {column} FROM {table}")}
        assert not (RAIL & served), f"{table} counts rail as service"


# --------------------------------------------------------------------------
# 3. raw minutes, not the 4am axis
# --------------------------------------------------------------------------

def test_times_are_raw_minutes_so_an_owl_trip_runs_past_midnight(con):
    latest = con.execute(
        "SELECT MAX(start_min) FROM journey_trip").fetchone()[0]
    assert latest >= MINUTES_PER_DAY, (
        "no departure past midnight -- the times look folded onto the 4am axis")


def test_no_trip_starts_before_the_service_day(con):
    assert con.execute(
        "SELECT MIN(start_min) FROM journey_trip").fetchone()[0] >= 0


# --------------------------------------------------------------------------
# 4. a rebuilt timetable routes identically
# --------------------------------------------------------------------------

def test_the_stored_coordinates_are_the_feeds_own(con, feed_side):
    side, _, coords = feed_side
    assert db_coords(con, side) == coords


def test_every_stop_a_pattern_calls_at_can_be_placed(con):
    for side in ("current", "proposed"):
        placed = set(db_coords(con, side))
        called = {stop for row in con.execute(
            "SELECT stops FROM journey_pattern WHERE side = ?", (side,))
            for stop in row["stops"].split(";")}
        assert called <= placed


def rebuild(con, side, day):
    return journey.Timetable.build(
        f"{side}-{day}",
        [(route, stops, trips)
         for (route, stops), trips in db_patterns(con, side, day).items()],
        db_coords(con, side))


def test_a_timetable_rebuilt_from_the_database_finds_the_same_journey(con):
    """The whole point of the tables, end to end.

    A pair is taken from `data/trip_time_origins.csv` rather than invented, so
    this is the arrival the published travel-time answer was pooled from -- if
    the carry-over ever loses a trip, the two arrivals diverge here before the
    app can serve a wrong number.
    """
    if not (ORIGINS_CSV.exists() and PAIRS_CSV.exists()):
        pytest.skip("travel-time output not built -- run analyze_travel_time.py")
    with open(ORIGINS_CSV, encoding="utf-8") as f:
        row = next(r for r in csv.DictReader(f)
                   if r["headline_current_median_min"] not in ("", None))
    with open(PAIRS_CSV, encoding="utf-8") as f:
        pair = next(r for r in csv.DictReader(f)
                    if r["place"] == row["place"] and r["anchor"] == row["anchor"])

    origin = (float(row["lat"]), float(row["lon"]))
    dest = (float(pair["dest_lat"]), float(pair["dest_lon"]))
    ready_at = WINDOW_START_MIN

    by_day, coords = gtfs.load_patterns(gtfs.current(), gtfs.SAMPLE["current"],
                                        quiet=True)
    from_feed = journey.Timetable.build("current-weekday", by_day["weekday"],
                                        coords)
    from_db = rebuild(con, "current", "weekday")

    feed_journey = journey.earliest_arrival(from_feed, origin, dest, ready_at)
    db_journey = journey.earliest_arrival(from_db, origin, dest, ready_at)
    assert (db_journey is None) == (feed_journey is None)
    if feed_journey is not None:
        assert db_journey.arrive == feed_journey.arrive
        assert db_journey.routes == feed_journey.routes
