#!/usr/bin/env python3
"""The pedestrian network: every way in Allegheny County a person may walk on.

The sixth upstream source in this repo, and the second that is not about
transit. Everything else here measures what the buses do; this measures the
ground a rider has to cross to reach one, because the travel-time layer used
to assume they crossed it in a straight line -- across the Allegheny, up the
face of a hillside, along the busway -- and charged them for the crow's
distance. `src/refresh/walking.py` is what routes on it and why; this script
only fetches and caches it.

WHAT IS ASKED FOR, AND WHAT IS LEFT OUT

Every `highway` way in the county's bounding box, minus the ones a pedestrian
may not use: motorways and trunk roads with their link ramps, anything still
under construction or merely proposed, and anything tagged `foot=no` or
`access=private`. Everything else stays in, including `highway=service`
(alleys and parking aisles, which in Pittsburgh are often the through route)
and `highway=steps` -- the city's public stairways are the actual pedestrian
network on the slopes, and dropping them would make the North Side and Hazelwood
read as unwalkable.

The bounding box is the county's, not a polygon: this repo is standard-library
only and has no geometry reader, and a rectangle is the honest simplification
because it can only ever include ground, never exclude it. Every stop in both
feeds sits inside it with at least 680 m to spare on the nearest edge, so no
stop is missing part of its own 400 m walk.

WHY THE RAW FILE IS COMMITTED

OpenStreetMap changes daily, so this is the source in this repo whose upstream
moves fastest. Re-fetching a year from now would quietly restate published
travel times, so the response is cached verbatim -- gzipped, because 115 MB of
pretty-printed JSON compresses to 17 MB and gzip changes how the bytes are
stored, not what they are. Delete the file to force a refresh, as with every
other cached source; do not add a flag.

WHY NO TIDY CSV COMES OUT OF THIS

Every other ingest writes `data/*.csv`. The graph this one describes is ~1.0M
nodes and ~2.2M directed edges -- 25 MB of rows that rebuild from the cache in
about ten seconds, and that nothing reads by hand. So it stays derived: the
pipeline builds it in memory, and `build_webdb.py` packs it into `refresh.db`
for the app. The report below is what this script publishes.

    Usage: python3 ingest_osm_walk.py
        -> data/raw/osm/allegheny_walk.json.gz
"""

import gzip
import sys
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))
from refresh import walking  # noqa: E402

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
UA = "prt-refresh-assessment (pro-bono transit analysis; maxachis@gmail.com)"

EXTRACT = Path("data/raw/osm/allegheny_walk.json.gz")

# Allegheny County's bounding box, as (south, west, north, east).
COUNTY_BBOX = (40.1938, -80.3641, 40.6737, -79.6919)

BBOX = ",".join(str(edge) for edge in COUNTY_BBOX)

# Ways a pedestrian may not use. Kept as one alternation so the query text
# below reads as the sentence in the docstring.
NOT_WALKABLE = ("motorway|motorway_link|trunk|trunk_link|construction|"
                "proposed|raceway|bus_guideway|escape")

QUERY = f"""[out:json][timeout:900];
way["highway"]["highway"!~"^({NOT_WALKABLE})$"]["foot"!~"^(no|private)$"]\
["access"!~"^(no|private)$"]({BBOX});
out skel qt;
node(w);
out skel qt;
"""


def fetch_extract(dest=EXTRACT):
    """Download the extract unless it is already cached. Returns dest."""
    dest = Path(dest)
    if dest.exists() and dest.stat().st_size > 0:
        return dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(OVERPASS_URL, data=QUERY.encode("utf-8"),
                                     headers={"User-Agent": UA})
    with urllib.request.urlopen(request, timeout=900) as response:
        body = response.read()
    with gzip.open(dest, "wb") as f:
        f.write(body)
    return dest


def main():
    path = fetch_extract()
    print(f"walk extract: {path}  ({path.stat().st_size / 1e6:.1f} MB gzipped)")

    network = walking.load(path)
    nodes, segments, metres = network.summary()
    print(f"  nodes {nodes:,}   walkable segments {segments:,}")
    print(f"  {metres / 1000:,.0f} km of ways a pedestrian may use")
    print(f"  mean segment {metres / segments:.1f} m  "
          "-- how far a point can be from the nearest node it snaps to")


if __name__ == "__main__":
    main()
