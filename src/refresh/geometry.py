"""Which named place a point is in, decided by the boundary rather than guessed.

Everything place-level in this repo used to be named by the *nearest surviving
labelled PRT stop* within 2 km -- median 373 m away, p90 954 m, max 1,989 m.
That was the only method available while the repo carried no boundary
geometry, and it has two failures that a boundary does not:

  - It answers a different question. "Which stop is nearest" is not "which
    municipality is this in", and where the two disagree nothing on screen can
    show it. Allegheny has both a Baldwin **borough** (24,071 residents) and a
    Baldwin **township**, three miles apart; a nearest-stop rule decides
    between them by whichever stop happened to survive the outlier filter.
  - It leaves 19% of the county unnamed. 231,171 residents live more than 2 km
    from a labelled stop, so they fell out of every place denominator --
    exactly the people with no bus, which is to say the people the analysis is
    about.

So this module answers the containment question directly. It is standard
library only, like the rest of the pipeline: `shapely` would be one import and
a dependency the pipeline install does not have, and the test below is a
hundred lines of ray casting that has not changed since 1974.

## The ray-casting rule, and the one bug it exists to avoid

A horizontal ray is cast from the point; the number of edges it crosses is odd
if and only if the point is inside. The trap is a ray that leaves the point and
passes exactly through a *vertex*, where the two edges meeting at that vertex
both count the crossing and the parity flips twice instead of once -- reporting
an inside point as outside. Real municipal boundaries are full of such vertices
because they are drawn along straight roads and rivers.

The fix is the half-open edge rule: an edge spans the ray's latitude only when
one endpoint is strictly above and the other is at-or-below. A vertex then
belongs to exactly one of the two edges meeting there, and the parity is right.
`test_a_ray_along_a_vertex_does_not_double_count` pins it.

## Coordinate order

GeoJSON stores `[lon, lat]`; every other coordinate in this repo is passed as
`(lat, lon)`. Rings are kept in GeoJSON order because that is how they arrive
and converting 220 polygons' worth of them would be pure risk, so the swap
happens once, at the boundary of this module, in `polygon_contains`.
"""
from dataclasses import dataclass, field


def _ring_contains(lat: float, lon: float, ring) -> bool:
    """Ray-cast one closed ring of GeoJSON `[lon, lat]` pairs."""
    inside = False
    n = len(ring)
    for i in range(n):
        lon1, lat1 = ring[i][0], ring[i][1]
        lon2, lat2 = ring[(i + 1) % n][0], ring[(i + 1) % n][1]
        # Half-open in latitude: exactly one endpoint strictly above the ray.
        # This is the whole vertex-double-count fix; see the module docstring.
        if (lat1 > lat) != (lat2 > lat):
            # Longitude where this edge crosses the ray's latitude.
            crossing = lon1 + (lat - lat1) / (lat2 - lat1) * (lon2 - lon1)
            if lon < crossing:
                inside = not inside
    return inside


def polygon_contains(lat: float, lon: float, rings) -> bool:
    """Is (lat, lon) inside this GeoJSON polygon's outer ring but no hole?

    `rings` is a GeoJSON Polygon coordinate list: the first ring is the outer
    boundary, any further rings are holes. Holes are real here -- a borough
    wholly surrounded by a township is an ordinary Allegheny shape -- and
    ignoring them files the inner place's residents under the outer one.
    """
    if not rings or not _ring_contains(lat, lon, rings[0]):
        return False
    return not any(_ring_contains(lat, lon, hole) for hole in rings[1:])


def _bbox(polygons):
    """(min_lat, min_lon, max_lat, max_lon) over every ring of every part."""
    lats, lons = [], []
    for rings in polygons:
        for lon, lat in rings[0]:
            lats.append(lat)
            lons.append(lon)
    return (min(lats), min(lons), max(lats), max(lons))


# Ranked coarsest-last, so a point inside both a neighbourhood and the city
# containing it resolves to the neighbourhood. This mirrors the published
# labels' `hood or muni`: the finest name that exists is the one a reader
# would write on a comment form.
KIND_PRECEDENCE = {"neighbourhood": 0, "borough": 1, "township": 1,
                   "municipality": 1, "city": 2}


@dataclass
class Place:
    """One named place and every part of its boundary."""
    name: str
    kind: str
    polygons: list                      # [GeoJSON Polygon coordinate list]
    bbox: tuple = field(default=None, compare=False, repr=False)

    def __post_init__(self):
        if self.bbox is None and self.polygons:
            self.bbox = _bbox(self.polygons)

    @property
    def rank(self) -> int:
        return KIND_PRECEDENCE.get(self.kind, 1)

    def contains(self, lat: float, lon: float) -> bool:
        """Any part of a multipart place counts.

        Boroughs here are routinely multipart -- a river or an old annexation
        splits them -- so testing only the first part silently empties the
        rest.
        """
        if self.bbox:
            min_lat, min_lon, max_lat, max_lon = self.bbox
            if not (min_lat <= lat <= max_lat and min_lon <= lon <= max_lon):
                return False
        return any(polygon_contains(lat, lon, rings) for rings in self.polygons)


class PlaceIndex:
    """Every place, searched by containment with a bounding-box prefilter.

    The prefilter is the only optimisation and it is worth its two lines: the
    pipeline asks this about ~1,000 block groups against ~220 places, and a
    bounding-box rejection is two comparisons where a full ray cast over a
    municipal boundary is a few thousand.
    """

    def __init__(self, places):
        self.places = sorted(places, key=lambda p: p.rank)

    def place_at(self, lat: float, lon: float):
        """The finest-grained place containing this point, or None.

        Ties do not arise between two places of the same rank, because
        municipal boundaries partition the county and neighbourhoods partition
        the city. Where a point is in both a neighbourhood and the city, the
        neighbourhood wins -- see `KIND_PRECEDENCE`.
        """
        for place in self.places:
            if place.contains(lat, lon):
                return place
        return None
