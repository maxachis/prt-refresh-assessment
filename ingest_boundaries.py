#!/usr/bin/env python3
"""Where Allegheny's named places actually are, as boundaries.

The seventh upstream source, and the first one in this repo that is neither
about transit nor about people: it is about ground. It exists because every
place-level answer here was previously named by the *nearest surviving
labelled PRT stop* within 2 km, which answers a different question from the
one it was being read as. See `geometry.py` for what that cost.

## The two feeds, and why two

Allegheny County publishes 130 municipal boundaries; the City of Pittsburgh
publishes its own 90 neighbourhoods. Together they reproduce the structure
PRT's own labels have -- a `MUNI` everywhere and a `HOOD` inside the city --
so a block group can take the same *kind* of name the published answers
already carry, decided properly. `hood or muni` becomes "the neighbourhood if
the point is in one, else the municipality", which `geometry.KIND_PRECEDENCE`
encodes.

Both are public, both are already WPRDC-catalogued, and WPRDC is an upstream
this repo already reads for route ridership. Neither needs a credential.

**The neighbourhood file is fetched from Esri, not WPRDC, and that is not a
preference.** WPRDC's own GeoJSON resource for `neighborhoods2` returns HTTP
500 (checked 2026-08-31); the Esri REST service behind the same catalogue
entry serves the identical layer and is listed as a resource on that package.
If the WPRDC download starts working again it is the better citation, being
the catalogue of record.

## Naming

The municipal file's `LABEL` already reads the way the published answers spell
a place -- "Bethel Park Municipality", "Ross Township" -- so the only change
is to lowercase the type word ("Ross township"), which is how PRT's `MUNI`
field and therefore `data/equity_places.csv` write it. The type word stays:
Allegheny has both a Baldwin borough and a Baldwin township, and dropping it
would merge two places three miles apart into one row.

Every response is cached verbatim under `data/raw/boundaries/` and committed,
so a clone reproduces every published number without refetching. To force a
refresh, delete the cached file.

    python3 ingest_boundaries.py     -> data/raw/boundaries/*.geojson
                                        data/place_boundaries.json
"""
import json
import sys
import urllib.request
from pathlib import Path

DATA = Path(__file__).resolve().parent / "data"
RAW = DATA / "raw" / "boundaries"
OUT = DATA / "place_boundaries.json"

# Allegheny County's 130 municipalities, from the county's own GIS via WPRDC.
MUNI_URL = ("https://data.wprdc.org/dataset/2fa577d6-1a6b-46a8-8165-27fecac1dee5"
            "/resource/b0cb0249-d1ba-45b7-9918-dc86fa8af04c/download/"
            "muni_boundaries.geojson")
MUNI_RAW = RAW / "muni_boundaries.geojson"

# The City of Pittsburgh's 90 neighbourhoods. Esri rather than WPRDC because
# WPRDC's GeoJSON resource for this layer 500s -- see the module docstring.
HOOD_URL = ("https://services1.arcgis.com/YZCmUqbcsUpOKfj7/arcgis/rest/services"
            "/PGHWebNeighborhoods/FeatureServer/0/query"
            "?where=1%3D1&outFields=*&outSR=4326&f=geojson")
HOOD_RAW = RAW / "neighborhoods.geojson"

# The municipal file's TYPE values, as they appear, mapped to the word the
# published labels use. "MUNICIPALI" is not a typo here -- the source field is
# truncated to ten characters.
MUNI_TYPE = {"BOROUGH": "borough", "TOWNSHIP": "township",
             "CITY": "city", "MUNICIPALI": "municipality"}

NEIGHBOURHOOD = "neighbourhood"


def fetch(url: str, path: Path) -> dict:
    """Cached GeoJSON. Only ever downloads on a miss, like every other ingest."""
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    path.parent.mkdir(parents=True, exist_ok=True)
    print(f"  fetching {path.name} ...")
    with urllib.request.urlopen(url, timeout=180) as r:
        body = r.read().decode("utf-8")
    data = json.loads(body)           # parse before caching, so a 500-page
    if "features" not in data:        # of HTML never lands in data/raw/
        sys.exit(f"error: {url} returned no features")
    path.write_text(body, encoding="utf-8")
    return data


def muni_label(props) -> str:
    """"ROSS"/"TOWNSHIP" -> "Ross township", the spelling PRT's MUNI uses."""
    kind = MUNI_TYPE.get((props.get("TYPE") or "").strip().upper())
    label = (props.get("LABEL") or "").strip()
    if not kind or not label:
        return None, None
    # LABEL already title-cases the name and carries the type word; only the
    # type word's case differs from how the published answers spell it.
    stem = label.rsplit(" ", 1)[0] if label.lower().endswith(kind) else label
    return f"{stem} {kind}", kind


def parts(geometry) -> list:
    """A GeoJSON geometry as a list of Polygon coordinate lists."""
    if geometry is None:
        return []
    if geometry["type"] == "Polygon":
        return [geometry["coordinates"]]
    if geometry["type"] == "MultiPolygon":
        return list(geometry["coordinates"])
    return []


def load():
    """[{place, kind, polygons}] -- every named place in the county."""
    munis = fetch(MUNI_URL, MUNI_RAW)
    hoods = fetch(HOOD_URL, HOOD_RAW)

    places = []
    for f in munis["features"]:
        name, kind = muni_label(f["properties"])
        polygons = parts(f["geometry"])
        if name and polygons:
            places.append({"place": name, "kind": kind, "polygons": polygons})

    for f in hoods["features"]:
        name = (f["properties"].get("hood") or "").strip()
        polygons = parts(f["geometry"])
        if name and polygons:
            places.append({"place": name, "kind": NEIGHBOURHOOD,
                           "polygons": polygons})
    return places


def write(places):
    OUT.write_text(json.dumps(places), encoding="utf-8")


def main():
    print("Loading place boundaries...")
    places = load()
    kinds = {}
    for p in places:
        kinds[p["kind"]] = kinds.get(p["kind"], 0) + 1
    print(f"  {len(places)} places: "
          + ", ".join(f"{n} {k}" for k, n in sorted(kinds.items())))

    duplicates = len(places) - len({p["place"] for p in places})
    if duplicates:
        sys.exit(f"error: {duplicates} places share a name -- the type word "
                 "should keep them apart; see muni_label")

    write(places)
    size = OUT.stat().st_size / 1e6
    print(f"  wrote {OUT.relative_to(DATA.parent)} ({size:.1f} MB)")


if __name__ == "__main__":
    main()
