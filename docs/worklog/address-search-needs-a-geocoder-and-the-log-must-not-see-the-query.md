# Address search needs a geocoder, and the access log must not see the query

**Observed:** the search box found stops, routes and named places from
`refresh.db`, but a reader who typed their street address got "Nothing
found" — the repo had no address data and no way to turn text into a point.
**Where it stands:** fixed, awaiting close. `ingest_addresses.py`,
`build_webdb.py`'s `address`/`street` tables and `query.search`'s fourth
group all built 2026-09-17, on Max's decision that day to ship on the
county's "licence not specified". Max chose the order on 2026-09-12 (stops
and places first, then routes, then addresses, self-hosted), and the
what-to-tell-PPT question closed the same day address search shipped (the
site is public, in partnership with PPT).

> The ordering and "self-hosted rather than a third-party geocoder" are Max's
> decisions, 2026-09-12. The source below is agent-derived and re-checkable.

## Why not an external geocoder

Nominatim, Photon, Mapbox or Google would each turn a typed address into a
point in an afternoon, and each sends the reader's home address to a third
party. The `/findings` footer already says the site sets no cookie, runs no
tag and talks to no third party, and `docs/WEBAPP.md` ("Public, in
partnership with PPT") records that as the posture the partnership rests on.
Nominatim's usage policy also forbids autocomplete and caps at one request a
second, which is the wrong shape for a type-ahead box. Rejected by Max on those
grounds; not a technical judgement.

## The source

Allegheny County publishes its own address points on WPRDC, which is already a
trusted source in this repo (route ridership comes from there):

- Dataset: <https://data.wprdc.org/dataset/allegheny-county-addressing-address-points2>
  — "Allegheny County Addressing Address Points", harvested weekly from the
  county's GIS portal, updated by county staff continuously.
- CKAN datastore resource `ddc46dc5-65bf-42d2-b67d-dd45954b25da`: **653,615
  rows** on 2026-09-12, with `addr_num`, `st_name`, `st_type`, `full_address`,
  `municipality`, `zip_code`, `latitude`, `longitude`, `status`, `parent_id`
  (a unit inside a building points at the building's row). Checked with:

  ```
  curl -s "https://data.wprdc.org/api/3/action/datastore_search?resource_id=ddc46dc5-65bf-42d2-b67d-dd45954b25da&limit=2"
  ```

- The full CSV dump is 105 MB (`/datastore/dump/<resource>`); the datastore
  dump accepts a `fields=` parameter, so the raw cache can be the nine columns
  above rather than the thirty-three, and gzipped it should land near the
  16 MB OSM cache the repo already commits.
- **Licence: "not specified" on the WPRDC page** (`license_id: notspecified`,
  read from `package_show` on 2026-09-12). The PASDA landing page
  (<https://www.pasda.psu.edu/uci/DataSummary.aspx?dataset=1219>) was
  checked the same day and carries no use constraints either; PASDA's full
  metadata record was not opened. County GIS data is routinely reused, but the
  repo publishes every source's terms in `DATA_SOURCES.md` and this one has
  none to publish yet. **Decision owed: whether "not specified" is enough to
  ship on.**

Coverage matters more than the licence for the reader: OSM's `addr:*` tags
are patchy outside the city, and this file is the county's own, so a suburban
reader in Penn Hills gets the same answer as one in Bloomfield.

## The shape of the slice, as scoped

- `ingest_addresses.py` → `data/raw/addresses/` (cached verbatim, committed)
  → `data/addresses.csv.gz` (building rows only, `status = ACTIVE`,
  `parent_id = 0`, one row per point). Standard library, like every ingest.
- `build_webdb.py` writes an `address` table with a normalised search key
  ("118 orr ave harmar") and an index on it, so a prefix match is one indexed
  `LIKE`. Nothing else in the database reads it.
- `query.search` grows a fourth group, `addresses`, matched the way a rider
  types one: a leading number is the house number, exact, and the rest is a
  street prefix; a query with no number is a street, and a street's row is
  the median of its points inside one municipality, labelled as the street
  rather than an address. Picking one is `askAt(lat, lon)`, exactly a map
  click.
- The result carries `municipality` and `zip_code` so two "118 Orr Ave"s in
  two boroughs are told apart on screen.

## The logging rule, which is why search is a POST already

The front door keeps a 30-day access log of request URIs
(`deploy/setup-caddy.sh`; `report_usage.py` reads it). A `GET
/api/search?q=118+orr+ave` would put home addresses in that file, masked IP
or not. So `/api/search` was built as a POST with the query in the body from
the first slice, before any address could be found through it — readers type
addresses into every search box, whether or not it can answer them.

What the log does still record is the point the pick resolves to, because
the pick becomes `/api/place?lat=…&lon=…`, exactly as a click does today.
That is the posture the site already has for a click, and it is now
recorded beside the rest of what the site collects in `docs/WEBAPP.md`,
"Public, in partnership with PPT": a search resolves to a coordinate, and
coordinates are logged; the typed text is not.

## Resolved

- Whether "licence not specified" on the county address points is
  acceptable to ship on: yes, decided by Max on 2026-09-17, without asking
  the county. Neither WPRDC nor PASDA's landing page carries terms; PASDA's
  full metadata record was not opened, so a stronger answer may still exist
  there or by asking the county's GIS office, but nothing here is blocked on
  it.
- Whether to tell PPT that a search resolves to a logged coordinate: moot as
  an email, since the site is already public and built in partnership with
  PPT (Max, 2026-09-17). The fact itself is recorded in `docs/WEBAPP.md`
  instead, where the rest of what the site collects is.
