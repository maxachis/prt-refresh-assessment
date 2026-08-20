# PRT Bus Line Refresh — data source inventory

Assessment of what can be programmatically ingested for the **Proposed Final
Network**, published 2026-08-17. Public comment period: **Aug 17 – Sep 30, 2026**
(board vote expected fall 2026, implementation second half of 2027).

All endpoints below were verified live on 2026-08-17.

## Bottom line

**PRT does not publish a GTFS for the proposed network at
`rideprt.org/developerresources`** — the `GTFS.zip` there is the *current*
network. Nearly everything a GTFS would give you is reachable anyway: the **Remix
public map's API answers anonymously**, yielding the proposed network's stops,
routes and ordered stop sequences, and the service-level PDFs cover frequency and
span.

**A proposed-network GTFS with real timetables is nonetheless present in this
repo**, at `data/raw/proposed_gtfs/` — see the section below. It is the better
source for anything on the proposed side, and `analyze_coverage_change.py` uses
it. **PRT supplied it to Pittsburghers for Public Transit by email, on PPT's
request, and PPT passed it to this repo's author** — see the section below.

## Ingestible (machine-readable)

| Source | Format | What it gives you |
|---|---|---|
| [Find My Route table](https://engage.rideprt.org/buslineredesign/BLR-finaldraft-findmyroute) | server-rendered HTML `<table>` | Crosswalk: current # → draft 2.0 # → proposed final #, change category, related routes. 107 rows. |
| Frequency & Hours PDFs ([wkdy](https://hdp-us-prod-app-rideprt-engage-files.s3.us-west-2.amazonaws.com/1217/8611/7803/FrequencyHoursTable_Weekday.pdf) / [sat](https://hdp-us-prod-app-rideprt-engage-files.s3.us-west-2.amazonaws.com/9717/8611/7803/FrequencyHoursTable_Saturday.pdf) / [sun](https://hdp-us-prod-app-rideprt-engage-files.s3.us-west-2.amazonaws.com/5217/8611/7803/FrequencyHoursTable_Sunday.pdf)) | PDF, text layer | **The quantitative core.** Span of service + headway across 7 time periods, per route, per day type. 93/74/73 routes. |
| [Exhibit A](https://www.rideprt.org/link/d0a97382033d4e9a8849e52609df2218.aspx) | PDF, 30pp, text layer | Official major-service-change narrative — the legally noticed document. |
| Route pages `BLR-route-{n}` | server-rendered HTML | ~100 pages of plain-language change bullets per route. Slug is the proposed number, or `{current}-discontinued`. |
| [Current GTFS](https://www.rideprt.org/developerresources/GTFS.zip) | GTFS zip | Baseline for before/after. Feed `Merged_Clever_2606_2`, valid 2026-06-28 → 2026-10-14. 102 routes, 6,388 stops. |
| GTFS-Realtime | protobuf | Bus `https://truetime.portauthority.org/gtfsrt-bus/`, train `/gtfsrt-train/`. Current network only. |
| [ArcGIS Hub](https://open-data-pgh-transit.hub.arcgis.com/) | GeoJSON / API | 21 datasets — stops, routes, walksheds, park-and-rides, stop amenities. **All current/historical; nothing proposed.** DCAT catalog at `/data.json`. |
| [WPRDC route ridership](https://data.wprdc.org/dataset/prt-monthly-average-ridership-by-route) | CKAN DataStore SQL | Average riders by route × day type, monthly, **Jan 2017 – Apr 2026**. Public, official, and the freshest ridership PRT publishes. Resource `12bb84ed-397e-435c-8d1b-8ce543108698`. |
| [WPRDC OTP](https://data.wprdc.org/dataset/port-authority-monthly-average-on-time-performance-by-route) | CSV / API | Monthly on-time performance by route. |
| `PRT_Bus_Stop_Usage_Unweighted` [FeatureServer](https://services3.arcgis.com/544gNI3xxlFIWuTc/arcgis/rest/services/PRT_Bus_Stop_Usage_Unweighted/FeatureServer/0) | ArcGIS REST | **Stop-level boardings**, 19,854 stop×route rows over 7,076 stops, 13 months from Sep 2019. Latest populated month is **May 2025**. See the note below. |
| [2020 Centers of Population, PA block groups](https://www2.census.gov/geo/docs/reference/cenpop2020/blkgrp/CenPop2020_Mean_BG42.txt) | CSV, no key | The population-weighted centre and 2020 count of every block group. 1,464 rows in Allegheny/Beaver/Westmoreland, 1,773,456 people. No block-level equivalent is published. |
| [ACS 5-year, `api.census.gov`](https://api.census.gov/data/2024/acs/acs5) | JSON, **key required** | Race (B03002), age (B01001), income (B19001), vehicles (B25044) at block group; disability (B18101) and language (C16002) at tract only. Feeds every `EQUITY-*` answer. |
| [`PRT_Current_Shelter_Locations`](https://services3.arcgis.com/544gNI3xxlFIWuTc/arcgis/rest/services/PRT_Current_Shelter_Locations/FeatureServer/0) | ArcGIS REST | Stop amenities: shelters, bike racks, TVMs, real-time screens, ADA platforms. |

## The proposed-network GTFS (`data/raw/proposed_gtfs/`)

A complete feed for the Proposed Final Network, unpacked in `data/raw/`. Not
downloaded by `ingest_blr.py`, and not published at the developer-resources URL
above. Every other file in this repo points here for its provenance, so keep
three things apart: what the feed evidences about itself (`feed_info.txt`,
below), what `verify_proposed_gtfs.py` earns against PRT's published documents
("How it is checked"), and how the feed reached this repo ("Provenance").

| File | Contents |
|---|---|
| `calendar.txt` | 3 services: `Future_BLR_Service-Weekday` / `-Sa` / `-Su`, 2027-01-01 → 2027-12-31 |
| `calendar_dates.txt` | header only — no exceptions, so no holiday-calendar trap on this side |
| `routes.txt` | 100 routes; 95 bus, 3 light rail, 2 incline |
| `trips.txt` | 14,488 trips with `direction_id` and `block_id` |
| `stop_times.txt` | **698,865 rows with real departure times** |
| `stops.txt` | 5,515 stops with coordinates; 4,981 ids match the current feed |
| `shapes.txt` | route geometry |

`feed_info.txt` names `Pittsburgh Regional Transit` as publisher and gives
`feed_version` "Updated: Aug 11, 2026, 12:14 PM", six days before the Proposed
Final Network was published. That is the whole of what the feed evidences about
its own origin.

**Why it matters.** It retires the two compromises every other script here still
carries. First, the S-variants — 29S, 53S, 55S, 69S, 78S, 89S — are in the
frequency PDFs but absent from the Remix map, and they carry the weekend service
on those corridors: reading route numbers off Remix turns Clairton and Glassport
into total weekend losses the plan does not inflict. Second, proposed trips no
longer have to be derived as span ÷ headway, which lands within **1.4%** of the
feed system-wide (5,480 estimated vs 5,559 actual weekday trips, median per-route
error 5.6%) but doubles the peak-only limiteds — 1L, 2L, 12L, 19L, 23L, 46L, 52L,
73L, 76L, 77L each run one peak direction.

On day types the PDFs and the feed now agree for all 95 routes present in both;
`analyze_coverage_change.py` prints any disagreement as a standing cross-check.

**How it is read.** `gtfs.py` loads either feed into one structure, so both
networks go through identical code — the repo's "measure both sides the same
way" convention is now structural rather than a convention. Every analysis
script uses it: `analyze_frequency_change.py`, `analyze_coverage_change.py`,
`analyze_route_hours.py`, `analyze_service_loss.py` and `analyze_one_seat.py`.

**How it is checked.** `verify_proposed_gtfs.py` tests the feed against the
documents PRT published, and prints the numbers quoted above. Route sets match
(95 bus routes each way), day types match for all 95, and service start times
match on 229 of 240 route-days. It also measures where the old span ÷ headway
model went wrong: the published span *end* is the last departure from the
anchor, not from the route, so the feed's last departure is later on all 240
route-days by a median of 96 minutes — which is why the PDFs undercount evening
and overnight service, and why the earlier "night service is being withdrawn"
finding in `FINDINGS.md` has been withdrawn.

**Provenance.** PRT does not publish this feed at any URL. Pittsburghers for
Public Transit asked PRT for it, PRT supplied it to PPT by email, and PPT passed
it to this repo's author. The network it describes is itself public: the Proposed
Final Network is out for comment at
<https://engage.rideprt.org/buslineredesign> — the machine-readable form of that
plan is what PPT asked for and what PRT sent.

> Stated by Max; not verifiable from the repo. No copy of the email is held
> here, and the date PRT sent it is not recorded — only the feed's own stamp,
> "Updated: Aug 11, 2026", which is a timestamp on the file rather than evidence
> of how it travelled.

**So the numbers are citable**, described as *obtained from PRT on request via
Pittsburghers for Public Transit*. Two things are still worth doing, and they are
different from each other:

1. **Get the date** of PRT's email from PPT, and add it above. A citation reads
   better with one, and it is a single question to a person who has the answer.
2. **Confirm before republishing the feed itself**, as distinct from findings
   computed from it. Sending a file to a requester is not the same act as
   publishing it, and the web app serves that timetable at its finest possible
   grain — every departure at every stop. One question to PPT settles it.

## The Remix public API (the proposed network, in structured form)

The interactive map at `platform.remix.com/project/82ea6210` is a JS app, but the
API behind it **answers anonymous requests** — no token, no login. Send a browser
`User-Agent` and a `Referer` on the project URL.

| Endpoint | Returns |
|---|---|
| `/api/projects/82ea6210` | Project metadata, including `transitMapId` (`632ce361`) |
| `/api/maps/632ce361` | **~9.4 MB of JSON: 7,036 stops + 100 lines** with patterns, directions and ordered stop lists |
| `/api/maps/632ce361/tile.pbf?x=&y=&z=` | Mapbox vector tiles, layer `shapes` — the route geometry |
| `/api/maps/632ce361/lines/{lineUuid}/trips` | Returns `[]` — timetables are not published |

`/api/maps/{id}` is the prize. Per stop: UUID, GTFS stop ID, name, lat/lon,
wheelchair flag. Per line: GTFS route id, short/long name, colour, then
patterns → directions → `directionStops`, each with a stop reference and
`distanceFromStart` in metres. That is 10,464 stop-visits across 200 directions —
effectively `stops.txt` + `routes.txt` + the sequence half of `stop_times.txt`.

Verified: all 87 proposed routes from the crosswalk are present (plus rail,
inclines, and reused numbers), and all 10,464 sequence rows resolve to a stop.

### Caveats

- **The map's base feed is old.** `feedStartDate` is 2023-06-18. Stop inventory
  and GTFS stop IDs may reflect the 2023 base, not the 2026 current feed, so
  before/after stop comparisons carry drift. 5,056 of the 5,620 served stop IDs
  match the current published GTFS; treat the ~1,332 current stops with no
  proposed service as an upper bound needing spot-checks, not a finding.
- **1,416 of the 7,036 stops are not served by any proposed route.** This is a
  stop inventory, not a service list — filter by `proposed_stop_sequences.csv`
  before mapping anything.
- **No timetables**, so no true `stop_times.txt`. Frequency and span come from
  the PDFs.
- This is an undocumented internal API for a public map. It can change without
  notice; `data/raw/` caches every response so analysis stays reproducible.

### The on-demand zones — the one thing only Remix has

`/api/projects/82ea6210` (cached as `data/raw/remix_project.json`) carries
`scenarios[0].onDemandZones`: **10 microtransit zone polygons** — McCandless,
Penn Hills, South Hilltop, McKeesport, McKees Rocks, Robinson, South Side,
Airport Area, Highlands Area, USC-BP — each with a weekday and two weekend
service entries giving hours (7am–9pm weekdays, 8am–8pm weekends) and a vehicle
count (`supply`, 1–3 per zone). No GTFS can express them: an on-demand zone has
no stops and no timetable.

`analyze_coverage_area.py` is the only consumer, and it rasterises the polygons
onto the same lattice as the coverage tiers to ask how much of the lost
fixed-route area they cover — 23%. Two cautions before citing them: all ten
carry `isHidden: true` in the project file, and nothing here checks them against
a published PRT document, so treat them as what the plan file says rather than
as a commitment. They are reported beside the losses, never netted off.

## The WPRDC stop-usage package: what its removal actually costs

`data.wprdc.org/dataset/prt-transit-stop-usage` now returns
`Authorization Error` from `package_show`, and it no longer appears in the
transportation group listing. Checked against the [May 2026 Wayback
snapshot](http://web.archive.org/web/20260510052551/https://data.wprdc.org/dataset/prt-transit-stop-usage),
it held three resources:

| Was on WPRDC | Still available? | Where |
|---|---|---|
| `Monthly_Updating_Bus_Stop_Usage` | **Yes, in full** | `PRT_Bus_Stop_Usage_Unweighted` FeatureServer — all 13 months, Sep 2019 → May 2025 |
| `Transit Stop Usage by Route – Deprecated` (FY2019, with amenities) | Superseded | Ridership by the layer above; amenities by `PRT_Current_Shelter_Locations` |
| `Transit Stop Usage Data Dictionary` | **Yes** | Verbatim in the ArcGIS Hub item description for *PRT Stop Ridership – Historical* |

**Nothing of substance is lost.** The field encoding I had reverse-engineered is
confirmed by PRT's own description: a data-type code (`D` days, `B` boardings,
`A` alightings, `R` ramp deployments), a service-day code (`W`/`S`/`U`), and
`YYYYMM`. What is genuinely gone is CKAN convenience — the DataStore SQL
endpoint, resource version history, and the named data steward — none of which
changes any analysis here.

### The real gaps are upstream, and worth raising in the comment period

1. **Stop-level ridership has not been updated since May 2025.** PRT publishes
   on a Jan/May/Sep pick cycle and the layer's own schema pre-creates columns
   through 2028, but `B_W_202509` onward are empty and the layer was last
   modified 2026-01-12. Three picks — Sep 2025, Jan 2026, May 2026 — are
   missing. So the network is being redesigned against ridership evidence that
   is fifteen months old, and the public cannot check the plan against current
   patterns.
2. **Alightings stopped in September 2023.** `A_*` is populated for Sep 2019
   through Sep 2023 and null thereafter; PRT confirms "passenger offs data is
   currently only available from 2019-2023". Every stop-level analysis is
   therefore boardings-only, which systematically understates destination stops
   — hospitals, schools, shopping — exactly the places a redesign should be
   judged on. Ramp deployments are similarly 2023-only.
3. **PRT's own accuracy disclaimer** should be quoted whenever these numbers
   are: stop figures are "unadjusted, unofficial totals" that "may underestimate
   true system-wide ridership by as much as 30%".

### What to use instead

For **route-level** questions — including "how many riders lose their route" —
WPRDC's `prt-monthly-average-ridership-by-route` is public, current through
**April 2026**, official rather than unweighted, and queryable by SQL. It is
strictly better than deriving route totals from the stop file, and the
difference is material: 6,154 weekday riders on the 20 discontinued routes
versus ~5,170 from the stop-level data.

The stop-level layer remains the only source for **within-route** geography, so
it stays in use for section A and C of FINDINGS.md — with its vintage stated.

## Still missing

- **An official proposed-network GTFS.** One *must exist* — the Transit App
  trip-planning preview requires it. Requesting it from PRT during the comment
  period remains worthwhile: it would supply the timetables and remove the
  2023-base-feed caveat above.

## Usage

```bash
python3 ingest_blr.py               # -> data/*.csv
python3 analyze_service_loss.py     # -> data/stop_service_change.csv
python3 analyze_route_ridership.py  # -> data/discontinued_route_ridership_*.csv
python3 analyze_frequency_change.py # -> data/stop_frequency_change.csv
python3 analyze_one_seat.py         # -> data/oneseat_change.csv
python3 analyze_coverage_change.py  # -> data/route_service_days.csv,
                                    #    data/coverage_change.csv
python3 analyze_coverage_area.py    # -> data/coverage_area*.csv
```

See `FINDINGS.md` for results.

Answers to individual `docs/BASE_CAMP.md` questions live in `docs/answers/`,
one file per question ID, with a status table covering every question in
[`docs/answers/README.md`](docs/answers/README.md).

Requires `pdftotext` (poppler-utils); no third-party Python packages.

Outputs, all in `data/`:

| File | Rows | Contents |
|---|---|---|
| `route_crosswalk.csv` | 107 | current # → draft 2.0 # → final #, category |
| `service_levels.csv` | 240 | route × day type: span + 7 headway columns |
| `proposed_stops.csv` | 7,036 | proposed-network stop inventory with lat/lon |
| `proposed_routes.csv` | 100 | proposed lines with GTFS ids and colours |
| `proposed_stop_sequences.csv` | 10,464 | route × direction × stop order + distance |
| `current_routes.csv` | 102 | current-network baseline |
| `exhibit_a.txt` | 1,311 lines | official change narrative |
| `stop_service_change.csv` | 5,782 | per stop: keeps / loses all service, distance to nearest |
| `stop_frequency_change.csv` | 5,747 | per stop: current vs proposed trips at 400 m and 150 m, by period |
| `discontinued_route_ridership_202604.csv` | 20 | riders on each discontinued route, Apr 2026 |
| `oneseat_change.csv` | 369 | place × anchor: gains / keeps / loses a one-seat ride, with the routes responsible |
| `route_service_days.csv` | 74 | per modified route: day types now vs proposed, by number and with variants credited, days lost / gained, riders by day type |
| `coverage_change.csv` | 5,751 | per stop: the five BASE_CAMP coverage tiers for both networks, at 400 m and 150 m, trips by day type, route lists, `id_name_mismatch` |
| `stop_route_replace.csv` | 371 | stops where one route replaces another at comparable service |
| `coverage_area.csv` | 10 | radius × tier: covered land area now vs proposed, km² lost / gained / retained |
| `coverage_area_blocks.csv` | 450 | each contiguous block of lost or gained coverage over 0.1 km², with place, nearest stop and centroid |
| `coverage_area_places.csv` | 452 | net km² gained or lost per municipality / neighbourhood, per tier |
| `coverage_area_ondemand.csv` | 10 | per proposed on-demand zone: zone area, fixed-route coverage now vs proposed inside it, lost area inside it, vehicles and hours |

Raw downloads are cached in `data/raw/` and reused.

## Analysis joins this enables

- `service_levels.csv` × `route_crosswalk.csv` on route number — service change
  by route, including the 20 discontinued.
- Either × **WPRDC monthly ridership by route** — weight changes by who
  actually rides, i.e. estimate riders affected by each discontinuation.
- `proposed_stop_sequences.csv` × `proposed_stops.csv` × **WPRDC stop-level
  boardings** — the strongest available analysis: which specific stops lose
  service, weighted by observed boardings. Mind the 2023-base caveat.
- `proposed_stops.csv` against census geography — walkshed and equity exposure
  of the proposed network, independently of PRT's own Equity Memo.
- `service_levels.csv` vs headways computed from current GTFS `stop_times.txt`
  — a true before/after frequency delta, independent of PRT's framing.
  **Done** (`analyze_frequency_change.py`). Note the trap: the plan re-splits
  corridors, so route-to-route comparison is invalid and the unit of analysis
  must be a location with a walk radius applied identically to both sides.

## Parsing caveats

The PDF layout has four traps, all handled in `ingest_blr.py` but worth knowing
if you re-roll the parser:

1. Long route names wrap onto the **preceding** line.
2. The current-route cell may list several routes (`86, 77`).
3. An unserved period is sometimes **blank** rather than `n/a`, so headways must
   be assigned by column position — counting tokens silently misaligns rows.
4. **The columns move between pages.** Each page repeats the header, and `4-6a`
   sits at character 70, 72, 74 and 73 on the weekday table's four pages. Measure
   the header once and page 3's Late and Owl cells collapse into one column,
   where the later value overwrites the earlier and 16 routes silently lose their
   8–11pm headway — which is exactly what happened, see `FINDINGS.md` caveat 9.
   Column centres are now measured per page and a second cell landing in an
   already-filled column is a hard error, not a silent overwrite.

Coverage check: 87 proposed routes in the crosswalk all appear in the weekday
table, plus 6 school/express variants (`29S`, `35S`, `51S`, `55S`, `69S`, `78S`)
that the crosswalk omits.

The current GTFS has a fourth trap, on the calendar rather than in a PDF, and it
decides any day-of-week question. Read `calendar.txt` columns alone and the feed
appears to hold two weekday calendars: service `2` (Mon–Fri) and service `4`
(`monday=1`). Service `4` is Labor Day service — `calendar_dates.txt` suppresses
it on all 17 Mondays in the window and adds it on 2026-09-07, the one day service
`2` is suppressed. Service `1` is the same thing for 2026-07-04 against Saturday
service `3`. Counting either as a day type credits 70 routes with a schedule they
do not run, so day types must be resolved for real dates. `analyze_coverage_change.py`
does this and reports the operating-date count per calendar (`1`=1, `2`=84, `3`=16,
`4`=1, `5`=17) so the special calendars are visible rather than inferred. One
consequence to know before quoting the 53: its only non-weekend trips are Labor
Day trips, so on the feed's evidence the weekday 53 is already gone, ahead of the
Refresh — WPRDC still shows 93 weekday riders in April 2026.

## Category counts (extracted, matches PRT's public numbers)

| Category | Count |
|---|---|
| Modified | 73 |
| Discontinued | 20 |
| New | 14 |

PRT publicly describes "changes to 56 routes" — narrower than the 73 the table
marks *Modified*, so their headline figure appears to exclude minor changes.
Use the extracted 73 with that caveat noted.
