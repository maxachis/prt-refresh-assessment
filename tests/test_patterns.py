"""Reading both feeds as trips, not as counts.

`load_service` collapses a feed to departure minutes per stop, which is all the
service analyses ever need and is lossy in the one dimension a journey needs:
which departures belong to the same vehicle, and in what order it calls. These
tests protect the loader that keeps that dimension.

1. THE COLLAPSE IS REAL. 1.7 million stop calls across the two feeds are ~471
   distinct stop sequences. If that number moves by an order of magnitude the
   patterning is broken, and the router's data stops being affordable.
2. OFFSETS ARE MONOTONIC. A router treats a trip's times as increasing along
   the trip. Every one of the 33,305 trips satisfies that today; a feed that
   stopped satisfying it would produce itineraries that travel backwards.
3. RAW MINUTES, NOT THE 4AM AXIS. Every other analysis folds times onto a
   4:00-28:00 axis so an owl trip lands in the owl period. Folding mid-trip
   would make a trip crossing 4am appear to arrive before it departed.
4. RAIL IS KEPT. Convention 13: a journey is not a service quantity.
5. THE SAME CALENDAR RULES AS EVERY OTHER ANALYSIS. Holiday calendars that look
   like weekdays are excluded here too, or a journey is routed onto Labor Day
   service.
"""
import pytest

import gtfs

# Measured across both committed feeds, all trips, ignoring calendars. A
# day-typed load is a subset of this, so it is a ceiling, not an equality.
PATTERN_CEILING = {"current": 273, "proposed": 198}

# Rail route ids that must survive the load. The two feeds type rail
# differently -- current as route_type 2, proposed as 0 -- which is the trap.
RAIL = {"BLUE", "RED", "SLVR"}


@pytest.fixture(scope="module", params=["current", "proposed"])
def loaded(request):
    side = request.param
    feed = gtfs.current() if side == "current" else gtfs.proposed()
    by_day, coords = gtfs.load_patterns(feed, gtfs.SAMPLE[side], quiet=True)
    return side, by_day, coords


def test_the_patterning_collapses_the_feed(loaded):
    side, by_day, _ = loaded
    seen = {(route, stops) for day in gtfs.DAYS
            for route, stops, _ in by_day[day]}
    assert 0 < len(seen) <= PATTERN_CEILING[side]
    calls = sum(len(stops) * len(trips) for day in gtfs.DAYS
                for _, stops, trips in by_day[day])
    assert calls > 100_000, "a feed this size has hundreds of thousands of calls"


def test_every_trip_runs_forwards(loaded):
    _, by_day, _ = loaded
    for day in gtfs.DAYS:
        for route, stops, trips in by_day[day]:
            for start, offsets in trips:
                assert len(offsets) == len(stops)
                assert offsets[0] == 0
                assert list(offsets) == sorted(offsets), (route, start)


def test_times_are_raw_minutes_so_an_owl_trip_stays_monotonic(loaded):
    """A 25:30 departure is minute 1530, not folded back to 90."""
    _, by_day, _ = loaded
    starts = [start for _, _, trips in by_day["weekday"] for start, _ in trips]
    assert max(starts) > 24 * 60, "no post-midnight trip survived the load"


def test_rail_is_routable(loaded):
    _, by_day, _ = loaded
    routes = {route for day in gtfs.DAYS for route, _, _ in by_day[day]}
    assert RAIL & routes, f"rail dropped from the {loaded[0]} feed"


def test_holiday_calendars_are_excluded_here_too(loaded):
    """The same exclusion load_service applies, or a journey rides Labor Day."""
    side, by_day, _ = loaded
    feed = gtfs.current() if side == "current" else gtfs.proposed()
    svc = gtfs.load_service(feed, gtfs.SAMPLE[side], period_of=lambda t: "all",
                            to_axis=lambda t: t, bus_only=False, quiet=True)
    trips = sum(len(t) for _, _, t in by_day["weekday"])
    assert trips == svc.n_trips["weekday"]


def test_every_stop_called_at_has_coordinates(loaded):
    _, by_day, coords = loaded
    called = {s for day in gtfs.DAYS for _, stops, _ in by_day[day] for s in stops}
    assert called and not (called - set(coords))
