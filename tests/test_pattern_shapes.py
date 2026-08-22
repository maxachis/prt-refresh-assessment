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
5. THE FEED'S CURB PULL-INS ARE NOT TURNS. Today's `shapes.txt` steps a few
   metres off the centreline and back at every stop; drawn as published that
   is a stub on the street at 14,820 stops, so it is dropped before the path
   is simplified (`gtfs.drop_curb_pull_ins`).
6. A MISSING SHAPE IS NOT A CRASH. A feed that omits `shapes.txt`, or a trip
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


def test_a_stop_sits_where_the_map_puts_it_or_on_the_street_beside_it(real_shapes):
    """A stop moves the drawn path only when the path genuinely misses it.

    Some proposed-side stops sit 100-350 m off the shape their own trips
    carry, and rail stations sit beside the track alignment; those anchor the
    path at the stop, because drawing through the wrong block is worse than a
    visible jog. But a stop a few metres off its own centreline is the normal
    case -- a kerbside coordinate for a bus that drives down the middle -- and
    anchoring there wrenches the line off the street and back for no
    information at all. Inside `STOP_SNAP_M` the path stays on the street.
    """
    _, coords, _ = gtfs.load_patterns(gtfs.proposed(), gtfs.SAMPLE["proposed"],
                                      quiet=True)
    worst = 0.0
    for (_, stops), (points, stop_idx) in real_shapes.items():
        for stop, idx in zip(stops, stop_idx):
            if stop in coords:
                worst = max(worst, gtfs.metres_between(coords[stop], points[idx]))
    assert worst <= gtfs.STOP_SNAP_M, (
        f"a stop landed {worst:.0f} m from its own vertex")


def _out_and_backs(shapes):
    """Every vertex the path leaves and returns to, with how far out it went."""
    return [gtfs.metres_between(points[i - 1], points[i])
            for points, _ in shapes.values()
            for i in range(1, len(points) - 1)
            if gtfs.metres_between(points[i - 1], points[i + 1])
            <= gtfs.CURB_PULL_IN_M]


def test_the_line_does_not_step_off_the_street_at_a_kerbside_stop(real_shapes):
    """The failure the snap and the pull-in scan exist to stop.

    It is worse than the stub it replaced: the two neighbouring vertices are
    simplified run ends tens of metres apart, so pulling the line out to a
    kerbside stop draws a triangle across half a block rather than a
    five-metre nick. A residue survives on excursions the feed writes with
    more points than `CURB_PULL_IN_MAX_POINTS`; it is under a tenth of a
    percent of stops, and each one is a few metres wide.
    """
    stops = sum(len(stop_idx) for _, stop_idx in real_shapes.values())
    short = [d for d in _out_and_backs(real_shapes) if d <= gtfs.STOP_SNAP_M]
    assert len(short) < stops * 0.001, f"{len(short)} kerb steps across {stops} stops"


def test_a_bus_that_drives_into_a_loop_and_back_out_still_does(real_shapes):
    """Century III, South Hills Village: 60-100 m out and back, and real.

    The counterweight to the test above — a filter aggressive enough to erase
    every out-and-back would erase these, and the map would show the route
    sailing past a transit centre it actually enters.
    """
    spurs = [d for d in _out_and_backs(real_shapes) if d > gtfs.STOP_SNAP_M]
    assert spurs, "every out-and-back was filtered away, including the real ones"


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


# --------------------------------------------------------------------------
# curb pull-ins
# --------------------------------------------------------------------------

def test_a_path_that_leaves_and_comes_straight_back_loses_the_detour():
    """Out five metres and back to the same spot is not a turn."""
    street = [(40.4400, -80.0000), (40.4400, -79.9990), (40.4400, -79.9980)]
    with_stub = [street[0], street[1], (40.44005, -79.99901), street[1], street[2]]
    assert gtfs.drop_curb_pull_ins(with_stub) == street


def test_a_real_corner_is_not_mistaken_for_a_pull_in():
    corner = [(40.4400, -80.0000), (40.4400, -79.9980), (40.4420, -79.9980)]
    assert gtfs.drop_curb_pull_ins(corner) == corner


def test_todays_feed_publishes_pull_ins_and_almost_none_survive():
    """The trap: `shapes.txt` here steps to the curb and back at every stop.

    `shp-87-01` does it at sequence 788-790 -- 5.5 m out, 5.5 m back to the
    coordinate it left from -- and simplifying cannot remove it, because the
    detour really is 5.5 m off the zero-length segment between its two
    neighbours. Drawn faithfully it puts a perpendicular stub on the street at
    every stop on every line, which is what "the route does not follow the
    street" looks like to a reader.

    A handful survive on purpose. Where a stop's OWN published coordinate is
    the curb point, anchoring the path at the stop (`_pattern_path`) puts the
    step back -- and that is the trade this repo wants: a leg has to start and
    end under the stop it names, or the walk drawn to it ends short of the
    ride drawn from it. Those stubs are honest about where the feed puts the
    stop; the thousands removed above were not telling the reader anything.
    """
    _, _, shapes = gtfs.load_patterns(gtfs.current(), gtfs.SAMPLE["current"],
                                      quiet=True, with_shapes=True)
    stops = sum(len(stop_idx) for _, stop_idx in shapes.values())
    surviving = [(points, stop_idx, i)
                 for points, stop_idx in shapes.values()
                 for i in range(1, len(points) - 1)
                 if gtfs.metres_between(points[i - 1], points[i + 1])
                 <= gtfs.CURB_PULL_IN_M]
    assert len(surviving) < stops * 0.01, (
        f"{len(surviving)} curb stubs across {stops} stops")
    assert all(i in set(stop_idx) for _, stop_idx, i in surviving), (
        "a stub survived somewhere other than at a stop the path is anchored at")


def test_the_pull_ins_are_really_in_the_feed():
    """If this ever fails, `drop_curb_pull_ins` has become a mystery."""
    raw = gtfs._shape_paths(gtfs.current(), {"shp-87-01"})["shp-87-01"]
    assert raw, "the shape is still there"
    # Read back through the dropper, so what is asserted is the raw file.
    points = []
    for r in gtfs.current().rows("shapes.txt"):
        if r["shape_id"] == "shp-87-01":
            points.append((int(r["shape_pt_sequence"]),
                           float(r["shape_pt_lat"]), float(r["shape_pt_lon"])))
    points = [(lat, lon) for _, lat, lon in sorted(points)]
    published = sum(1 for a, _b, c in zip(points, points[1:], points[2:])
                    if gtfs.metres_between(a, c) <= gtfs.CURB_PULL_IN_M)
    assert published > 20, f"only {published} pull-ins on one line's shape"
    assert len(raw) < len(points), "the drawn path is shorter than the file"
