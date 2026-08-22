"""Where a ride leg is drawn: the street the bus runs on, not a straight line.

The router answers in stops and minutes and knows nothing about streets, so
until now a drawn itinerary joined its stops with straight lines -- through
buildings, across rivers, and at every turn a bus actually makes. Both feeds
publish `shapes.txt`, so the path is available; these tests protect the way it
is attached to a pattern.

1. THE PATH IS THE FEED'S, NOT AN INVENTION. A pattern's geometry is the
   shape its own trips carry, sliced at its own stops -- matched by position,
   because both feeds publish a `shape_dist_traveled` that disagrees with
   their own shapes on some routes (see `gtfs._vertex_for_each_stop`).
2. A STOP LANDS ON A VERTEX. Every stop gets an index into the point list, in
   calling order and never going backwards, so a leg from stop i to stop j is
   a slice rather than a search.
3. SIMPLIFYING NEVER MOVES A STOP. The stored path drops vertices a reader
   could not see at any city zoom, but the vertices stops land on are kept, or
   the slice for a leg would start in the wrong place.
4. IT IS FOR DRAWING ONLY. Nothing measures it: the geometry is lossy by
   construction, and no published number may ever be taken from it.
5. A MISSING SHAPE IS NOT A CRASH. A feed that omits `shapes.txt`, or a trip
   with no `shape_id`, leaves the pattern without geometry and the map falls
   back to the straight line it drew before.
"""
import pytest

import gtfs

# A staircase at ~40.44: east, north, east, north. Every vertex is a real
# corner tens of metres off the chord, so a straight line between the end
# stops is visibly not the path -- and nothing here is collinear filler that
# simplifying would (correctly) drop.
SHAPE_PTS = [
    (40.4400, -80.0000),
    (40.4400, -79.9980),
    (40.4410, -79.9980),   # two of the turns fall between the last two stops
    (40.4410, -79.9960),
    (40.4420, -79.9960),
]
STOP_AT = {"S1": 0, "S2": 1, "S3": 4}


def write_feed(root, *, with_shapes=True, shape_id="SHP1"):
    """A one-route, one-trip GTFS on disk, small enough to reason about."""
    root.mkdir(parents=True, exist_ok=True)
    (root / "agency.txt").write_text(
        "agency_id,agency_name,agency_url,agency_timezone\n"
        "A,Test,http://example.org,America/New_York\n")
    (root / "calendar.txt").write_text(
        "service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,"
        "start_date,end_date\n"
        "WK,1,1,1,1,1,1,1,20260101,20261231\n")   # every day: the loader
        # insists on service for all three sample dates.
    (root / "routes.txt").write_text(
        "route_id,route_short_name,route_long_name,route_type\n"
        "R1,1,Test Line,3\n")
    (root / "trips.txt").write_text(
        "route_id,service_id,trip_id,shape_id\n"
        f"R1,WK,T1,{shape_id if with_shapes else ''}\n")
    (root / "stops.txt").write_text(
        "stop_id,stop_name,stop_lat,stop_lon\n"
        + "".join(f"{sid},Stop {sid},{SHAPE_PTS[i][0]},{SHAPE_PTS[i][1]}\n"
                  for sid, i in STOP_AT.items()))
    (root / "stop_times.txt").write_text(
        "trip_id,arrival_time,departure_time,stop_id,stop_sequence\n"
        "T1,08:00:00,08:00:00,S1,1\n"
        "T1,08:05:00,08:05:00,S2,2\n"
        "T1,08:10:00,08:10:00,S3,3\n")
    if with_shapes:
        (root / "shapes.txt").write_text(
            "shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence\n"
            + "".join(f"{shape_id},{lat},{lon},{i + 1}\n"
                      for i, (lat, lon) in enumerate(SHAPE_PTS)))
    return root


SAMPLES = {"weekday": gtfs.date(2026, 9, 16),
           "saturday": gtfs.date(2026, 9, 19),
           "sunday": gtfs.date(2026, 9, 20)}


def load(root, **kw):
    feed = gtfs.Feed(root, "test").check()
    return gtfs.load_patterns(feed, SAMPLES, quiet=True, **kw)


def test_a_pattern_carries_the_shape_its_own_trips_run(tmp_path):
    _, _, shapes = load(write_feed(tmp_path / "feed"), with_shapes=True)
    (points, stop_idx), = shapes.values()
    assert [(round(a, 4), round(b, 4)) for a, b in points] == SHAPE_PTS
    assert stop_idx == (0, 1, 4)


def test_the_turn_survives_so_the_line_follows_the_street(tmp_path):
    """The dog-leg's corner is a real vertex between two stops, not a chord."""
    _, _, shapes = load(write_feed(tmp_path / "feed"), with_shapes=True)
    (points, stop_idx), = shapes.values()
    between = points[stop_idx[1]:stop_idx[2] + 1]
    assert len(between) > 2, "the path between two stops kept its shape"


def test_stops_index_forwards_along_the_path(tmp_path):
    _, _, shapes = load(write_feed(tmp_path / "feed"), with_shapes=True)
    (_, stop_idx), = shapes.values()
    assert list(stop_idx) == sorted(stop_idx)


def test_no_shape_id_leaves_the_pattern_without_geometry(tmp_path):
    _, _, shapes = load(write_feed(tmp_path / "feed", with_shapes=False),
                        with_shapes=True)
    assert shapes == {}


def test_geometry_costs_nothing_unless_it_is_asked_for(tmp_path):
    by_day, coords, shapes = load(write_feed(tmp_path / "feed"))
    assert shapes == {}
    assert by_day["weekday"], "the patterns still load"
    assert coords


def test_simplifying_keeps_the_ends_and_drops_what_nobody_can_see():
    # A straight run of collinear points a reader could never distinguish from
    # a two-point line, plus one real corner.
    straight = [(40.44, -80.0 + i * 0.0002) for i in range(20)]
    corner = [(40.4420, -79.9962), (40.4440, -79.9962)]
    out = gtfs.simplify_path(straight + corner, tolerance_m=5.0)
    assert out[0] == straight[0] and out[-1] == corner[-1]
    assert len(out) < len(straight), "collinear filler is dropped"
    assert straight[-1] in out or corner[0] in out, "the corner is kept"


def test_a_two_point_path_is_left_alone():
    pair = [(40.44, -80.0), (40.45, -79.99)]
    assert gtfs.simplify_path(pair, tolerance_m=5.0) == pair


@pytest.fixture(scope="module")
def real_shapes():
    feed = gtfs.proposed()
    _, _, shapes = gtfs.load_patterns(feed, gtfs.SAMPLE["proposed"],
                                      quiet=True, with_shapes=True)
    return shapes


def test_the_published_feed_places_every_pattern_on_a_street(real_shapes):
    assert len(real_shapes) > 100, "the proposed feed patterns are shaped"
    for (route, stops), (points, stop_idx) in real_shapes.items():
        assert len(stop_idx) == len(stops), route
        assert list(stop_idx) == sorted(stop_idx), route
        assert stop_idx[-1] < len(points), route


def test_a_stop_sits_exactly_where_the_map_puts_it(real_shapes):
    """The vertex a stop indexes IS that stop, not the nearest bit of road.

    Some proposed-side stops sit 100-350 m off the shape their own trips
    carry, and rail stations sit beside the track alignment. Anchoring the
    path at the stop keeps a drawn leg starting and ending under the markers
    the reader can see, and confines the feed's error to a visible jog.
    """
    _, coords, _ = gtfs.load_patterns(gtfs.proposed(), gtfs.SAMPLE["proposed"],
                                      quiet=True)
    worst = 0.0
    for (_, stops), (points, stop_idx) in real_shapes.items():
        for stop, idx in zip(stops, stop_idx):
            if stop in coords:
                worst = max(worst, gtfs.metres_between(coords[stop], points[idx]))
    assert worst < 1, f"a stop landed {worst:.0f} m from its own vertex"


def test_the_drawn_path_is_longer_than_the_straight_lines_it_replaces(real_shapes):
    """The whole point: a bus drives round corners, and this shows it."""
    followed = 0
    for _, (points, stop_idx) in real_shapes.items():
        drawn = sum(gtfs.metres_between(a, b) for a, b in zip(points, points[1:]))
        chords = sum(gtfs.metres_between(points[i], points[j])
                     for i, j in zip(stop_idx, stop_idx[1:]))
        if drawn > chords * 1.05:
            followed += 1
    assert followed > len(real_shapes) * 0.8, (
        "most patterns should be visibly longer than stop-to-stop chords")
