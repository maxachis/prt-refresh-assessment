"""The router: how one journey changes, measured from the moment a rider is ready.

Every other layer in this repo counts service. This one measures a journey, so
the failures it can produce are different in kind -- a plausible itinerary that
no rider could actually make reads as authoritative in a way a wrong trip count
never does. What these tests protect, in order of how badly each would read:

1. TIME IS MEASURED FROM READY, NOT FROM BOARDING. The rider arrives at the
   origin at some minute and wants to be at the destination; waiting for the
   bus is part of their trip. A router that starts the clock at boarding hides
   exactly the thing the frequency changes on the rest of the site do to a
   rider, and it flatters a network whose headways doubled.
2. A CONNECTION THAT CANNOT BE MADE IS NOT OFFERED. Transfers are synthesised
   from coordinates because neither feed publishes them, so the walking speed,
   the maximum transfer walk and the minimum buffer are the three numbers that
   decide whether an itinerary is real. Generous values invent connections.
3. LEAVING LATER NEVER ARRIVES EARLIER. The FIFO property. Its absence is the
   signature of a router that has mixed up its rounds, and it is invisible in
   any single answer.
4. RAIL IS IN IT, and both feeds' spellings of rail are. Convention 13: a
   journey is not a service quantity, so the T counts. The two feeds type rail
   differently (current 2, proposed 0), which is the trap.
5. NO JOURNEY IS None, NOT A LARGE NUMBER. An unreachable pair has to be
   reported as unreachable; a sentinel travel time would be averaged.
"""
import statistics
from collections import defaultdict

import pytest

import journey

# A synthetic grid, in metres east and north of an arbitrary origin, so a test
# can say "these stops are 300 m apart" and mean it.
LAT0, LON0 = 40.44, -79.99


def at(east_m, north_m):
    return (LAT0 + north_m / journey.M_PER_DEG_LAT,
            LON0 + east_m / journey.m_per_deg_lon(LAT0))


def hm(h, m=0):
    """Minutes since midnight, the axis the router runs on."""
    return h * 60 + m


def toy(patterns, coords, **kw):
    return journey.Timetable.build(label="toy", patterns=patterns,
                                   coords=coords, **kw)


# --------------------------------------------------------------------------
# 1. the clock starts when the rider is ready
# --------------------------------------------------------------------------

# One route, west to east, stops 1 km apart, running every 30 minutes.
LINE_COORDS = {"A": at(0, 0), "B": at(1000, 0), "C": at(2000, 0)}


def line_every(minutes, first=hm(8), n=6, route="10"):
    return [(route, ("A", "B", "C"),
             [(first + i * minutes, (0, 4, 8)) for i in range(n)])]


@pytest.fixture
def line():
    return toy(line_every(30), LINE_COORDS)


def test_waiting_is_part_of_the_trip(line):
    """Ready at 8:01 for an 8:30 bus is a 37-minute trip, not an 8-minute one."""
    j = journey.earliest_arrival(line, at(0, 0), at(2000, 0), ready_at=hm(8, 1))
    assert j is not None
    assert j.arrive == hm(8, 38)
    assert j.total_minutes == 37
    assert j.wait_minutes == 29
    assert j.ride_minutes == 8


def test_halving_the_frequency_lengthens_the_typical_trip():
    """The headway change the rest of the site measures has to reach the rider.

    Same route, same running time, same stops -- only the headway differs. If
    this does not move, the router is not measuring waiting.
    """
    window = (hm(8), hm(10))
    often = journey.profile(toy(line_every(15, n=12), LINE_COORDS),
                            at(0, 0), at(2000, 0), window=window)
    seldom = journey.profile(toy(line_every(30, n=6), LINE_COORDS),
                             at(0, 0), at(2000, 0), window=window)
    assert often.median_minutes < seldom.median_minutes
    # Uniform arrivals against a headway h wait h/2 on average.
    assert seldom.median_minutes - often.median_minutes == pytest.approx(7.5, abs=2)


def test_a_profile_reports_spread_not_just_a_median(line):
    p = journey.profile(line, at(0, 0), at(2000, 0), window=(hm(8), hm(10)))
    assert p.n_departures == 120
    assert p.worst_minutes > p.median_minutes > p.best_minutes
    assert p.median_minutes == statistics.median(
        j.total_minutes for j in p.journeys)


def test_the_walk_to_the_stop_is_in_the_trip():
    """Ready 240 m from the stop, the rider walks first and can miss the bus."""
    tt = toy(line_every(30), LINE_COORDS)
    origin = at(0, -240)
    j = journey.earliest_arrival(tt, origin, at(2000, 0), ready_at=hm(8) - 1)
    assert j.walk_minutes == pytest.approx(240 / journey.WALK_SPEED_M_PER_MIN, abs=0.01)
    assert j.arrive > hm(8, 8), "walked 3 minutes, so the 8:00 departure is gone"


def test_walking_the_whole_way_beats_waiting_for_nothing():
    """Origin and destination within the access walk, and no useful bus."""
    tt = toy(line_every(30), LINE_COORDS)
    j = journey.earliest_arrival(tt, at(0, 0), at(0, 200), ready_at=hm(8, 1))
    assert j.transfers == 0
    assert [leg.kind for leg in j.legs] == [journey.LEG_WALK]
    assert j.total_minutes == pytest.approx(200 / journey.WALK_SPEED_M_PER_MIN, abs=0.01)


# --------------------------------------------------------------------------
# 2. a connection that cannot be made is not offered
# --------------------------------------------------------------------------

# Route 10 runs A->B->C; route 20 runs P->Q, with P a short walk from C.
CROSS_COORDS = dict(LINE_COORDS,
                    P=at(2000 + 120, 0),          # 120 m from C
                    Q=at(2000 + 120, 3000))


def cross(p_departs, walk_to_p_m=120):
    coords = dict(CROSS_COORDS, P=at(2000 + walk_to_p_m, 0))
    return toy([("10", ("A", "B", "C"), [(hm(8), (0, 4, 8))]),
                ("20", ("P", "Q"), [(t, (0, 10)) for t in p_departs])],
               coords)


def test_a_transfer_needs_the_walk_and_the_buffer():
    """The 10 lands at C at 8:08; 120 m is 1.5 minutes; the buffer is on top."""
    need = 8 + 120 / journey.WALK_SPEED_M_PER_MIN + journey.MIN_TRANSFER_BUFFER_MIN
    tight = journey.earliest_arrival(cross([hm(8) + int(need) - 1]),
                                     at(0, 0), at(2120, 3000), ready_at=hm(8) - 5)
    assert tight is None, "a connection inside the buffer was offered"

    ok = journey.earliest_arrival(cross([hm(8) + int(need) + 1]),
                                  at(0, 0), at(2120, 3000), ready_at=hm(8) - 5)
    assert ok is not None
    assert ok.transfers == 1
    assert ok.routes == ("10", "20")


def test_a_transfer_walk_beyond_the_published_maximum_is_not_a_transfer():
    far = journey.MAX_TRANSFER_WALK_M + 100
    tt = cross([hm(9)], walk_to_p_m=far)
    assert journey.earliest_arrival(tt, at(0, 0), at(2000 + far, 3000),
                                    ready_at=hm(8) - 5) is None


def test_the_three_transfer_constants_are_published_not_hidden():
    """They decide whether an itinerary is real, so they must be quotable."""
    assert set(journey.CONSTANTS) == {
        "walk_speed_m_per_min", "max_access_walk_m",
        "max_transfer_walk_m", "min_transfer_buffer_min"}
    assert journey.CONSTANTS["walk_speed_m_per_min"] == journey.WALK_SPEED_M_PER_MIN


# --------------------------------------------------------------------------
# 3. leaving later never arrives earlier
# --------------------------------------------------------------------------

def test_leaving_later_never_arrives_earlier(line):
    arrivals = [journey.earliest_arrival(line, at(0, 0), at(2000, 0),
                                         ready_at=hm(8) + t)
                for t in range(0, 90)]
    got = [j.arrive for j in arrivals if j is not None]
    assert got == sorted(got)


def test_a_second_transfer_is_found_when_it_is_the_only_way():
    """Three routes in a chain, none of which overlaps the next by more than a stop."""
    coords = {"A": at(0, 0), "B": at(1000, 0),
              "C": at(1000, 1000), "D": at(1000, 2000),
              "E": at(2000, 2000)}
    tt = toy([("10", ("A", "B"), [(hm(8), (0, 5))]),
              ("20", ("B", "C", "D"), [(hm(8, 10), (0, 5, 10))]),
              ("30", ("D", "E"), [(hm(8, 25), (0, 5))])], coords)
    j = journey.earliest_arrival(tt, at(0, 0), at(2000, 2000), ready_at=hm(8) - 2)
    assert j is not None
    assert j.transfers == 2
    assert j.routes == ("10", "20", "30")
    assert j.arrive == hm(8, 30)


# --------------------------------------------------------------------------
# 4. rail is in it, in both feeds' spellings
# --------------------------------------------------------------------------

def test_rail_route_types_are_all_of_them():
    """Convention 13. Current types rail as 2, proposed as 0; both are journeys.

    `gtfs.bus_only` keys on "3" and is safe. Anything here that keys on "2"
    would silently drop the T from the future network.
    """
    assert "0" in journey.ROUTED_TYPES and "2" in journey.ROUTED_TYPES
    assert "3" in journey.ROUTED_TYPES and "7" in journey.ROUTED_TYPES


# --------------------------------------------------------------------------
# 5. unreachable is None
# --------------------------------------------------------------------------

def test_no_journey_is_none_rather_than_a_sentinel(line):
    far = at(50_000, 50_000)
    assert journey.earliest_arrival(line, at(0, 0), far, ready_at=hm(8)) is None


def test_a_profile_over_an_unreachable_pair_reports_no_journeys(line):
    p = journey.profile(line, at(0, 0), at(50_000, 50_000), window=(hm(8), hm(9)))
    assert p.journeys == ()
    assert p.median_minutes is None
    assert p.reachable_fraction == 0.0


def test_a_profile_reports_the_fraction_that_can_be_made(line):
    """Late in the service day some ready-minutes have no bus left at all.

    Reporting the fraction is what keeps a median honest: a median over the
    third of departures that still work is not a travel time for the window.
    """
    p = journey.profile(line, at(0, 0), at(2000, 0), window=(hm(9), hm(12)))
    assert 0.0 < p.reachable_fraction < 1.0
    assert len(p.journeys) < p.n_departures


# --------------------------------------------------------------------------
# 6. the bucketed transfer graph is the same graph a brute-force scan finds
# --------------------------------------------------------------------------

def _brute_force_transfer_graph(coords, max_transfer_walk_m):
    """The double loop `_build_transfer_graph` used to be, kept here only as
    an oracle: a cell-neighbour bug in the grid version drops exactly the
    pairs near a cell boundary, which no small hand-built example would ever
    exercise."""
    graph = defaultdict(list)
    stops = list(coords)
    for i, stop_a in enumerate(stops):
        for stop_b in stops[i + 1:]:
            distance = journey._distance_m(coords[stop_a], coords[stop_b])
            if distance <= max_transfer_walk_m:
                walk_min = distance / journey.WALK_SPEED_M_PER_MIN
                graph[stop_a].append((stop_b, walk_min))
                graph[stop_b].append((stop_a, walk_min))
    return dict(graph)


def _sorted_graph(graph):
    return sorted(
        (stop, sorted(neighbours))
        for stop, neighbours in graph.items())


def test_bucketed_transfer_graph_matches_brute_force():
    """Several hundred stops scattered at pseudo-random positions, from a
    fixed seed, so a boundary bug is caught rather than shrugged off as
    unlucky."""
    import random

    rng = random.Random(20260822)
    max_transfer_walk_m = journey.MAX_TRANSFER_WALK_M
    coords = {
        f"stop-{i}": at(rng.uniform(-6000, 6000), rng.uniform(-6000, 6000))
        for i in range(400)
    }

    grid_graph = journey._build_transfer_graph(coords, max_transfer_walk_m)
    brute_graph = _brute_force_transfer_graph(coords, max_transfer_walk_m)

    assert _sorted_graph(grid_graph) == _sorted_graph(brute_graph)


def test_the_transfer_grid_is_correct_away_from_pittsburgh_too():
    """The 3x3 neighbourhood must be safe by construction, not by latitude.

    A degree of longitude shrinks as you go north. A grid indexed by raw
    degrees is narrower on the ground east-west than north-south, and the gap
    widens with latitude until the neighbourhood no longer covers the transfer
    radius -- at which point the graph silently loses its east-west pairs and
    nothing in a Pittsburgh fixture would show it.
    """
    import random

    rng = random.Random(20260822)
    far_north_lat = 68.0
    coords = {}
    for i in range(400):
        east_m, north_m = rng.uniform(-6000, 6000), rng.uniform(-6000, 6000)
        lat = far_north_lat + north_m / journey.M_PER_DEG_LAT
        coords[f"stop-{i}"] = (lat, 20.0 + east_m / journey.m_per_deg_lon(lat))

    assert (_sorted_graph(journey._build_transfer_graph(
                coords, journey.MAX_TRANSFER_WALK_M))
            == _sorted_graph(_brute_force_transfer_graph(
                coords, journey.MAX_TRANSFER_WALK_M)))


# --------------------------------------------------------------------------
# 7. the fast profile is exact -- collapsing a constant block of minutes must
# never change a single journey, only how many searches produced them
# --------------------------------------------------------------------------

def _irregular_offsets(rng, n_legs, min_leg, max_leg):
    """A route's running time between each pair of stops -- cumulative and
    strictly increasing, with each leg's length chosen independently so
    consecutive legs differ (an "irregular running time").

    Drawn as floats rather than whole minutes purely so two legs are never
    exactly interchangeable by coincidence."""
    offsets = [0.0]
    for _ in range(n_legs):
        offsets.append(offsets[-1] + rng.uniform(min_leg, max_leg))
    return tuple(offsets)


def _irregular_trips(rng, offsets, first, last, min_gap, max_gap):
    """Trips at an irregular headway, all sharing one running-time profile.

    Varying only the gap between trips -- never a trip's own leg times --
    keeps `_Pattern.dep_times` sorted per position, which is what the FIFO
    property (module docstring, point 3) requires; randomising offsets
    per-trip would silently break that unrelated invariant instead of
    exercising the one this test is for.
    """
    trips = []
    t = first
    while t <= last:
        trips.append((t, offsets))
        t += rng.randint(min_gap, max_gap)
    return trips


def _irregular_network(rng):
    """Three routes chained end to end -- A-B, B-C-D, D-E -- each with its
    own irregular headway and running-time profile, so a trip needs two
    forced transfers. No route duplicates another's leg, which matters here:
    if two *different* route ids could both reach the same connection, an
    equal overall arrival could legitimately be produced by either one, and
    which a search happens to return would be an unresolvable tie rather
    than something this test could call right or wrong. A single chain has
    no such alternative -- `routes` can only ever read `("10", "20", "30")`
    -- so any mismatch the test catches is the collapse actually getting a
    minute wrong. Service ends mid-morning, well before the window used to
    exercise it below, so part of that window is genuinely unreachable --
    the case the module docstring calls out as most likely to be got wrong.
    """
    coords = {
        "A": at(0, 0), "B": at(1300, 0),
        "C": at(1300, 1200), "D": at(1300, 2500),
        "E": at(2600, 2500),
    }
    leg1_offsets = _irregular_offsets(rng, 1, 6, 11)      # A-B
    leg2_offsets = _irregular_offsets(rng, 2, 4, 10)      # B-C-D
    leg3_offsets = _irregular_offsets(rng, 1, 3, 8)       # D-E

    patterns = [
        ("10", ("A", "B"),
         _irregular_trips(rng, leg1_offsets, hm(7), hm(8, 30), 7, 19)),
        ("20", ("B", "C", "D"),
         _irregular_trips(rng, leg2_offsets, hm(7), hm(8, 50), 11, 24)),
        ("30", ("D", "E"),
         _irregular_trips(rng, leg3_offsets, hm(7), hm(9), 9, 23)),
    ]
    return toy(patterns, coords)


def _naive_profile(tt, origin, dest, window,
                   access_walk_m=journey.MAX_ACCESS_WALK_M):
    """The pre-optimisation `profile`: one `earliest_arrival` search per
    minute, kept here only as the oracle the fast version is checked
    against."""
    start, end = window
    n_departures = end - start
    journeys = [j for ready_at in range(start, end)
               for j in (journey.earliest_arrival(
                   tt, origin, dest, ready_at, access_walk_m=access_walk_m),)
               if j is not None]
    if not journeys:
        return journey.Profile(journeys=(), n_departures=n_departures,
                               median_minutes=None, best_minutes=None,
                               worst_minutes=None, reachable_fraction=0.0)
    totals = [j.total_minutes for j in journeys]
    return journey.Profile(
        journeys=tuple(journeys), n_departures=n_departures,
        median_minutes=statistics.median(totals), best_minutes=min(totals),
        worst_minutes=max(totals), reachable_fraction=len(journeys) / n_departures)


def _journey_tuple(j):
    return (j.ready_at, j.arrive, j.total_minutes, j.routes)


def test_fast_profile_matches_naive_profile():
    """The divide-and-conquer collapse must reproduce the naive, once-per-
    minute profile exactly -- same summary statistics, and the same
    (ready_at, arrive, total_minutes, routes) for every single minute."""
    import random

    rng = random.Random(20260822)
    tt = _irregular_network(rng)
    window = (hm(6, 50), hm(9, 50))
    origin, dest = at(0, 0), at(2600, 2500)

    fast = journey.profile(tt, origin, dest, window=window)
    naive = _naive_profile(tt, origin, dest, window)

    # A window that runs off the end of service is the case most likely to
    # be got wrong -- confirm the fixture actually exercises it.
    assert 0.0 < naive.reachable_fraction < 1.0

    assert fast.n_departures == naive.n_departures
    assert fast.reachable_fraction == naive.reachable_fraction
    assert fast.median_minutes == naive.median_minutes
    assert fast.best_minutes == naive.best_minutes
    assert fast.worst_minutes == naive.worst_minutes
    assert len(fast.journeys) == len(naive.journeys)

    fast_by_minute = {j.ready_at: _journey_tuple(j) for j in fast.journeys}
    naive_by_minute = {j.ready_at: _journey_tuple(j) for j in naive.journeys}
    assert fast_by_minute == naive_by_minute

    # Every journey must be one its rider could actually catch: nothing can
    # depart before the rider is ready for it. This is what would catch
    # assigning a constant block's LEFT-end journey instead of its right --
    # the values above (arrive, total_minutes, routes) stay numerically
    # correct either way once a block is genuinely constant, so only a
    # feasibility check on the legs themselves exposes a rider being handed
    # a trip that already left.
    for j in fast.journeys:
        if j.legs:
            assert j.legs[0].depart >= j.ready_at - 1e-9
