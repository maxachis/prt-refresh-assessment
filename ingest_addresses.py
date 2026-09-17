#!/usr/bin/env python3
"""Every address point in Allegheny County, tidied to one row per building.

The one upstream source that exists to answer "where is this address"
rather than anything about a bus. It backs the search box's
fourth group (`refresh.query`'s address search, `docs/worklog/address-search-needs-a-geocoder-and-the-log-must-not-see-the-query.md`):
a reader types a street address, and the site turns it into a point the same
way a map click already does, without sending the typed text to a third-party
geocoder. That "self-hosted, not a third party" call and the ordering that put
address search last are Max's, 2026-09-12; the source and what to do about its
licence are this script's own.

THE SOURCE, AND ITS LICENCE

Allegheny County publishes its own address points on WPRDC, already a trusted
source in this repo (route ridership comes from the same catalogue): dataset
"Allegheny County Addressing Address Points", CKAN datastore resource
`ddc46dc5-65bf-42d2-b67d-dd45954b25da`, 653,615 rows, harvested weekly from the
county's GIS portal. Its `license_id` is `notspecified` -- WPRDC carries no
terms for it, and PASDA's landing page is silent too. **Max decided 2026-09-17
to ship on "not specified"**; see the worklog entry above for what was checked
before that call.

WHY THIS SOURCE OVER OSM'S `addr:*` TAGS

Coverage, not licensing: OpenStreetMap's address tags are patchy outside the
city core, and this file is the county's own cadastral data, so a reader in
Penn Hills gets the same answer as one in Bloomfield. `ingest_osm_walk.py`
already reads OSM for the ground between a door and a stop; addresses
themselves are a different question with a better county-specific source.

THE RAW CACHE IS COLUMN-TRIMMED AT THE SOURCE

The datastore dump endpoint takes a `fields=` parameter, so the request itself
asks for only the 13 columns this repo uses rather than the full 33-column
row -- `full_address` and the rest are the county's own convenience columns,
which this repo rebuilds from the parts instead, so that normalisation stays
one function (`refresh.query.address_key`) rather than two that could
disagree. Trimmed at
the source, the raw cache still runs ~14 MB gzipped -- smaller than the 16 MB
OSM cache this repo already commits -- and it is committed for the same
reason: a clone reproduces the published search results with no re-fetch
against a source that changes weekly.

THE TIDY OUTPUT IS ONE ROW PER BUILDING, NOT PER ADDRESS POINT

Three filters get a building down from 653,615 raw rows, one of them doing
nearly all the work.
`status` keeps only `ACTIVE` (652,937 of 653,615; the rest are demolished,
disputed, preliminary, temporary or retired addresses the county has not
removed from the table). `parent_id == '0'` drops units inside a building --
an apartment or suite points at its building's own row, and the search box
answers "118 Orr Ave", not "118 Orr Ave, Unit 4B" (531,809 active roots
remain). And within what is left, (num, num_suffix, st_prefix, st_name,
st_type, municipality) can still repeat -- a complex with several buildings
sharing one address, up to 154 rows deep at the worst case -- so the tidy
output dedupes on that key, keeping the lowest `address_id`
(convention 3's determinism rule at a new unit: the lowest id is the
same point on every run, where "whichever the county returned first" is
not). Coordinates are rounded to `COORD_DECIMALS` places: the county
publishes thirteen or more, six is about a tenth of a metre -- finer than the
point placement itself -- and the committed tidy file is a third smaller for
it.

    python3 ingest_addresses.py
        -> data/raw/addresses/address_points.csv.gz (cached verbatim, trimmed
           to 13 columns, committed)
        -> data/addresses.csv.gz (tidy, one row per building)
"""
from __future__ import annotations

import csv
import gzip
import io
import sys
import urllib.request
from pathlib import Path

DATA = Path(__file__).resolve().parent / "data"
RAW = DATA / "raw" / "addresses" / "address_points.csv.gz"
OUT = DATA / "addresses.csv.gz"

RESOURCE_ID = "ddc46dc5-65bf-42d2-b67d-dd45954b25da"

# The 13 columns this repo uses, in the order the dump is asked for and
# cached in. Kept apart (st_prefix/st_name/st_type, not `full_address`) so
# there is exactly one place -- `refresh.query.address_key` -- that joins
# them into a search key or a label.
FIELDS = ["address_id", "parent_id", "status", "addr_num", "addr_num_suffix",
          "st_prefix", "st_name", "st_type", "unit", "municipality",
          "zip_code", "latitude", "longitude"]

DUMP_URL = ("https://data.wprdc.org/datastore/dump/" + RESOURCE_ID
            + "?fields=" + ",".join(FIELDS) + "&format=csv")

STATUS_ACTIVE = "ACTIVE"
ROOT_PARENT_ID = "0"

# Decimal places kept on a coordinate: ~0.1 m at this latitude. See the
# module docstring.
COORD_DECIMALS = 6

# The tidy output's columns -- `status`, `parent_id` and `unit` are consumed
# by the filter above and dropped rather than carried through, since every
# surviving row is by definition an active building root.
TIDY_FIELDS = ["address_id", "num", "num_suffix", "st_prefix", "st_name",
               "st_type", "municipality", "zip_code", "lat", "lon"]


def fetch(url: str, path: Path) -> str:
    """Cached CSV text. Only ever downloads on a miss, like every other ingest."""
    if path.exists():
        with gzip.open(path, "rt", encoding="utf-8") as f:
            return f.read()
    path.parent.mkdir(parents=True, exist_ok=True)
    print(f"  fetching {path.name} ...")
    with urllib.request.urlopen(url, timeout=180) as r:
        body = r.read().decode("utf-8")
    with gzip.open(path, "wt", encoding="utf-8") as f:
        f.write(body)
    return body


def load_raw() -> list[dict]:
    """Every raw address point, as the county's own column names."""
    body = fetch(DUMP_URL, RAW)
    return list(csv.DictReader(io.StringIO(body)))


def tidy_rows(raw_rows: list[dict]) -> list[dict]:
    """Active building roots, one per (num, suffix, prefix, name, type, muni).

    Pure and dict-in-dict-out so `tests/test_addresses.py` can hand it inline
    fixture rows rather than a real 653,615-row extract. See the module
    docstring for why each of the three steps below exists.
    """
    roots = [r for r in raw_rows
             if r["status"] == STATUS_ACTIVE
             and r["parent_id"] == ROOT_PARENT_ID]

    best_by_key: dict[tuple, dict] = {}
    for r in roots:
        key = (r["addr_num"], r["addr_num_suffix"], r["st_prefix"],
               r["st_name"], r["st_type"], r["municipality"])
        current = best_by_key.get(key)
        if current is None or int(r["address_id"]) < int(current["address_id"]):
            best_by_key[key] = r

    deduped = sorted(best_by_key.values(), key=lambda r: int(r["address_id"]))
    return [{
        "address_id": r["address_id"],
        "num": r["addr_num"],
        "num_suffix": r["addr_num_suffix"],
        "st_prefix": r["st_prefix"],
        "st_name": r["st_name"],
        "st_type": r["st_type"],
        "municipality": r["municipality"],
        "zip_code": r["zip_code"],
        "lat": f"{float(r['latitude']):.{COORD_DECIMALS}f}",
        "lon": f"{float(r['longitude']):.{COORD_DECIMALS}f}",
    } for r in deduped]


def write(rows: list[dict]) -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with gzip.open(OUT, "wt", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=TIDY_FIELDS)
        w.writeheader()
        w.writerows(rows)


def main():
    print("Loading Allegheny County address points...")
    raw_rows = load_raw()
    active_roots = sum(1 for r in raw_rows
                       if r["status"] == STATUS_ACTIVE
                       and r["parent_id"] == ROOT_PARENT_ID)
    print(f"  {len(raw_rows):,} rows fetched, {active_roots:,} active roots")

    rows = tidy_rows(raw_rows)
    streets = {(r["st_prefix"], r["st_name"], r["st_type"], r["municipality"])
               for r in rows}
    print(f"  {len(rows):,} buildings after dedupe, {len(streets):,} streets")

    write(rows)
    size = OUT.stat().st_size / 1e6
    print(f"  wrote {OUT.relative_to(DATA.parent)} ({size:.1f} MB)")


if __name__ == "__main__":
    main()
