"""The pedestrian network: what a walk actually costs, and where it goes.

Four things here are worth stating before the assertions, because each was a
wrong answer with a confident face on it before it was a test:

1. A WALK IS NEVER SHORTER THAN THE STRAIGHT LINE BETWEEN ITS ENDS. That is
   geometry, not a modelling choice, so it holds for every pair the network
   can route -- and it is the single assertion that would catch a snapping
   bug, a units error, or a reversed edge.

2. THE RADIUS IS A WALKING DISTANCE, NOT A RADIUS. `reach` bounds the search
   by distance ALONG THE NETWORK, so a stop 390 m away across a river is not
   within a 400 m walk of anything. This is the whole point of the layer:
   before it, that stop was a five-minute connection.

3. AN UNROUTABLE POINT IS `None`, NEVER A FALLBACK. A point off the network,
   or one whose destination is beyond the bound, has no walk -- and the
   caller has to decide what that means. Silently substituting the straight
   line here would restore the defect this module exists to fix, in exactly
   the cases where it is worst.

4. THE DRAWN PATH IS THE WALK THAT WAS TIMED. `path_between` returns the
   distance alongside the points, from the same search, so the map can never
   draw a walk shorter than the clock charged for.
"""

import math

import pytest

from refresh import walking


# --------------------------------------------------------------------------
# A hand-built block, in Overpass's shape. Two parallel streets 200 m apart
# joined at both ends, so walking from one to the other is a detour of known
# length rather than the 200 m the crow flies.
# --------------------------------------------------------------------------

def _elements(ways, nodes):
    return {"elements": (
        [{"type": "node", "id": nid, "lat": lat, "lon": lon}
         for nid, (lat, lon) in nodes.items()]
        + [{"type": "way", "id": wid, "nodes": list(refs)}
           for wid, refs in ways.items()])}


def _metres_north(lat, metres):
    return lat + metres / walking.M_PER_DEG_LAT


def _metres_east(lat, lon, metres):
    return lon + metres / walking.m_per_deg_lon(lat)


BASE_LAT, BASE_LON = 40.44, -79.99


@pytest.fixture(scope="module")
def block():
    """Two east-west streets 200 m apart, joined by a cross street at x=0
    only. Getting from the middle of one to the middle of the other means
    walking back to the junction, across, and out again."""
    def at(east_m, north_m):
        lat = _metres_north(BASE_LAT, north_m)
        return lat, _metres_east(lat, BASE_LON, east_m)

    nodes = {
        1: at(0, 0), 2: at(150, 0), 3: at(300, 0),      # south street
        4: at(0, 200), 5: at(150, 200), 6: at(300, 200),  # north street
    }
    ways = {10: [1, 2, 3], 11: [4, 5, 6], 12: [1, 4]}
    return walking.build(_elements(ways, nodes))


def test_a_straight_run_costs_its_own_length(block):
    """Node 1 to node 3 is one street, 300 m of it."""
    south_west = block.nodes[block.node_of[1]]
    south_east = block.nodes[block.node_of[3]]
    walk = block.path_between(south_west, south_east, max_m=400)
    assert walk is not None
    assert walk.distance_m == pytest.approx(300, abs=1.0)


def test_crossing_the_block_walks_round_it_not_through_it(block):
    """The crow flies 200 m from the middle of one street to the middle of
    the other. A pedestrian walks 150 back, 200 across and 150 out: 500."""
    mid_south = block.nodes[block.node_of[2]]
    mid_north = block.nodes[block.node_of[5]]
    straight = walking.metres_between(mid_south, mid_north)
    assert straight == pytest.approx(200, abs=1.0)

    walk = block.path_between(mid_south, mid_north, max_m=800)
    assert walk is not None
    assert walk.distance_m == pytest.approx(500, abs=2.0)


def test_the_drawn_path_is_the_walk_that_was_timed(block):
    """Points and distance come from one search, so the map cannot draw a
    shorter walk than the clock charged for."""
    mid_south = block.nodes[block.node_of[2]]
    mid_north = block.nodes[block.node_of[5]]
    walk = block.path_between(mid_south, mid_north, max_m=800)

    drawn = sum(walking.metres_between(walk.points[i], walk.points[i + 1])
                for i in range(len(walk.points) - 1))
    assert drawn == pytest.approx(walk.distance_m, abs=1.0)
    assert walk.points[0] == mid_south
    assert walk.points[-1] == mid_north
    # and it really goes via the one junction, not across the block
    assert block.nodes[block.node_of[1]] in walk.points


def test_a_bound_is_a_walking_distance_not_a_radius(block):
    """200 m apart as the crow flies, 500 m on foot -- so a 400 m WALK does
    not reach it, though a 400 m radius would have."""
    mid_south = block.nodes[block.node_of[2]]
    mid_north = block.nodes[block.node_of[5]]
    assert block.path_between(mid_south, mid_north, max_m=400) is None


def test_a_point_off_the_network_is_unroutable_not_approximated(block):
    """Ten kilometres from any way, `snap` refuses rather than guessing."""
    far = (BASE_LAT + 0.1, BASE_LON + 0.1)
    assert block.snap(far) is None
    on_street = block.nodes[block.node_of[2]]
    assert block.path_between(far, on_street, max_m=400) is None


def test_a_walk_starts_and_ends_off_the_network_at_its_own_ends(block):
    """A door is not on a sidewalk. The stub from the point to the nearest
    node is part of the distance, and part of the drawn line."""
    lat = _metres_north(BASE_LAT, -30)          # 30 m south of node 2
    door = (lat, _metres_east(lat, BASE_LON, 150))
    walk = block.path_between(door, block.nodes[block.node_of[3]], max_m=400)
    assert walk is not None
    # 30 m out to the street, then 150 m along it
    assert walk.distance_m == pytest.approx(180, abs=2.0)
    assert walk.points[0] == door


def test_reach_answers_many_targets_from_one_search(block):
    """The router asks 'how far to each of these stops', not one pair at a
    time -- one bounded search has to answer the whole set."""
    origin = block.nodes[block.node_of[1]]
    targets = {"east": block.nodes[block.node_of[3]],
               "across": block.nodes[block.node_of[4]],
               "far": block.nodes[block.node_of[6]]}
    found = block.reach(origin, targets, max_m=400)
    assert found["east"] == pytest.approx(300, abs=1.0)
    assert found["across"] == pytest.approx(200, abs=1.0)
    assert "far" not in found          # 500 m on foot, beyond the bound


def test_a_walk_is_the_same_length_in_both_directions(block):
    there = block.path_between(block.nodes[block.node_of[2]],
                               block.nodes[block.node_of[5]], max_m=800)
    back = block.path_between(block.nodes[block.node_of[5]],
                              block.nodes[block.node_of[2]], max_m=800)
    assert there.distance_m == pytest.approx(back.distance_m, abs=0.01)


def test_a_network_survives_a_round_trip_through_its_stored_form(block):
    """The app reads the graph out of refresh.db rather than re-parsing 115 MB
    of OSM on every boot, so the stored form has to route identically."""
    restored = walking.WalkNetwork.from_blobs(block.to_blobs())
    origin = block.nodes[block.node_of[2]]
    dest = block.nodes[block.node_of[5]]
    assert (restored.path_between(origin, dest, max_m=800).distance_m
            == pytest.approx(block.path_between(origin, dest,
                                                max_m=800).distance_m))


def test_a_mismatched_stored_graph_is_refused_not_silently_rebuilt(block):
    """`array`'s widths are sized by the C compiler, so a database written by
    a build with different ones would unpack into a DIFFERENT graph and route
    riders down edges that do not exist -- wrong minutes, no symptom."""
    blobs = block.to_blobs()
    blobs["targets"] = blobs["targets"][:-1]        # one byte short
    with pytest.raises(ValueError, match="array widths"):
        walking.WalkNetwork.from_blobs(blobs)

    blobs = block.to_blobs()
    blobs["lon"] = blobs["lon"][:-8]                # one node short
    with pytest.raises(ValueError, match="how many nodes"):
        walking.WalkNetwork.from_blobs(blobs)


# --------------------------------------------------------------------------
# Against the real extract. Skipped where it is not cached, like every other
# test here that needs a built artifact.
# --------------------------------------------------------------------------

@pytest.fixture(scope="module")
def allegheny():
    import ingest_osm_walk
    if not ingest_osm_walk.EXTRACT.exists():
        pytest.skip(f"{ingest_osm_walk.EXTRACT} not cached "
                    "-- run `python3 ingest_osm_walk.py`")
    return walking.load(ingest_osm_walk.EXTRACT)


def test_the_real_network_covers_every_stop_both_feeds_publish(allegheny):
    """A stop the network cannot place has no walk at all, so it would fall
    back to a straight line -- the defect this module exists to remove."""
    import gtfs
    unplaced = []
    for feed in (gtfs.current(), gtfs.proposed()):
        for row in feed.rows("stops.txt"):
            point = (float(row["stop_lat"]), float(row["stop_lon"]))
            if allegheny.snap(point) is None:
                unplaced.append(row["stop_id"])
    assert not unplaced, f"{len(unplaced)} stops off the walk network"


def test_a_real_walk_is_never_shorter_than_the_crow_flies(allegheny):
    """Geometry, not a modelling choice. Sampled across the county so a
    snapping or units error anywhere shows up."""
    import gtfs
    stops = [(float(r["stop_lat"]), float(r["stop_lon"]))
             for r in gtfs.current().rows("stops.txt")]
    checked = 0
    for i in range(0, len(stops) - 1, 97):
        walk = allegheny.path_between(stops[i], stops[i + 1], max_m=400)
        if walk is None:
            continue
        assert walk.distance_m >= walking.metres_between(
            stops[i], stops[i + 1]) - 1.0
        checked += 1
    assert checked > 20


def test_the_walk_max_raises_pittsburgh_left_the_river_in_the_way(allegheny):
    """The pair Max pinned on 2026-08-22: alighting on Liberty Avenue and
    walking into the Hill District. Straight line 568 m; on foot it is a good
    deal further, because the straight line crosses a hillside."""
    alight = (40.449248, -79.985329)
    destination = (40.4443, -79.9837)
    straight = walking.metres_between(alight, destination)
    assert straight == pytest.approx(568, abs=20)
    walk = allegheny.path_between(alight, destination, max_m=3000)
    assert walk is not None
    assert walk.distance_m > straight * 1.15
