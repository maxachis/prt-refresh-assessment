"""Unit tests for deciding which named place a point is in.

This replaces a nearest-labelled-stop guess with the actual question -- which
boundary contains this point -- so the failure modes worth testing are the
ones that would put a block group in the wrong place while looking right: a
ray that clips a shared edge and counts it twice, a hole counted as inside, a
multipart borough whose second part is ignored, and the [lon, lat] ordering
GeoJSON uses against the (lat, lon) the rest of this repo passes around.
"""
import pytest

from refresh import geometry


# A unit square from (0,0) to (1,1), in GeoJSON [lon, lat] order.
SQUARE = [[[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], [0.0, 0.0]]]

# The same square with a square hole from (.4,.4) to (.6,.6).
HOLED = [SQUARE[0],
         [[0.4, 0.4], [0.6, 0.4], [0.6, 0.6], [0.4, 0.6], [0.4, 0.4]]]


def test_a_point_inside_a_simple_polygon_is_inside():
    assert geometry.polygon_contains(0.5, 0.5, SQUARE)


def test_a_point_outside_is_outside():
    assert not geometry.polygon_contains(1.5, 0.5, SQUARE)
    assert not geometry.polygon_contains(-0.5, 0.5, SQUARE)


def test_a_point_in_a_hole_is_not_in_the_polygon():
    """A borough with a separate borough inside it is a real shape here, and a
    ray-casting test that ignores interior rings puts residents of the inner
    place in the outer one."""
    assert not geometry.polygon_contains(0.5, 0.5, HOLED)
    assert geometry.polygon_contains(0.2, 0.5, HOLED)


def test_a_ray_along_a_vertex_does_not_double_count():
    """The classic ray-casting bug: a horizontal ray leaving the test point
    passes exactly through a vertex, is counted by both edges meeting there,
    and the parity flips twice instead of once -- reporting a point inside the
    polygon as outside. The half-open edge rule below is what prevents it."""
    diamond = [[[0.0, 1.0], [1.0, 0.0], [2.0, 1.0], [1.0, 2.0], [0.0, 1.0]]]
    assert geometry.polygon_contains(1.0, 1.0, diamond)   # through two vertices
    assert not geometry.polygon_contains(1.0, 2.5, diamond)


def test_a_multipart_place_counts_all_of_its_parts():
    """Boroughs here are routinely multipart -- a river or an annexation
    splits them -- and taking only the first ring silently empties the rest."""
    far = [[[10.0, 10.0], [11.0, 10.0], [11.0, 11.0], [10.0, 11.0], [10.0, 10.0]]]
    place = geometry.Place(name='Split borough', kind='borough',
                           polygons=[SQUARE, far])
    assert place.contains(0.5, 0.5)
    assert place.contains(10.5, 10.5)
    assert not place.contains(5.0, 5.0)


def test_lookup_takes_lat_lon_in_that_order():
    """Every coordinate in this repo is passed (lat, lon); GeoJSON stores
    [lon, lat]. Getting this backwards puts all of Allegheny in the ocean and
    still returns a clean-looking answer, so it is pinned."""
    # A tall thin box around lat 40.4, lon -80.0.
    box = [[[-80.1, 40.3], [-79.9, 40.3], [-79.9, 40.5], [-80.1, 40.5],
            [-80.1, 40.3]]]
    place = geometry.Place(name='Testville', kind='borough', polygons=[box])
    index = geometry.PlaceIndex([place])
    assert index.place_at(40.4, -80.0) is place
    assert index.place_at(-80.0, 40.4) is None


def test_a_point_in_no_place_gets_no_name():
    index = geometry.PlaceIndex([
        geometry.Place(name='Testville', kind='borough', polygons=[SQUARE])])
    assert index.place_at(50.0, 50.0) is None


def test_a_neighbourhood_wins_over_the_municipality_containing_it():
    """Pittsburgh is one municipality and 90 neighbourhoods, and the published
    labels are the neighbourhood wherever there is one -- `hood or muni`. A
    point inside both has to resolve to the finer of the two."""
    city = geometry.Place(name='Pittsburgh', kind='city', polygons=[SQUARE])
    hood = geometry.Place(name='Squirrel Hill South', kind='neighbourhood',
                          polygons=[[[[0.2, 0.2], [0.4, 0.2], [0.4, 0.4],
                                      [0.2, 0.4], [0.2, 0.2]]]])
    index = geometry.PlaceIndex([city, hood])
    assert index.place_at(0.3, 0.3).name == 'Squirrel Hill South'
    assert index.place_at(0.8, 0.8).name == 'Pittsburgh'
