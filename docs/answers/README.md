# Answers to BASE_CAMP questions

One file per question ID in `docs/BASE_CAMP.md`, each with question, method,
result, caveats, and how to reproduce. Backing data is a CSV in `data/`.

[`locations/`](locations/) holds the other kind of answer — "what happens to
*here*?", asked of a corridor or a neighbourhood rather than of the question
list. Those files are cuts of the same CSVs, not new analysis, and they carry
the same caveats as everything below.

## Status

| Question | Status | Output |
|---|---|---|
| REGION-LOSS | Mostly answered at stop level | `FINDINGS.md` §A, `data/stop_service_change.csv` |
| GAIN-ONE-SEAT-DOWNTOWN | **Answered** | [doc](GAIN-ONE-SEAT-DOWNTOWN.md), `data/oneseat_change.csv` |
| LOSE-ONE-SEAT-DOWNTOWN | **Answered** | [doc](LOSE-ONE-SEAT-DOWNTOWN.md), `data/oneseat_change.csv` |
| GAIN-ONE-SEAT-OAKLAND | **Answered** | [doc](GAIN-ONE-SEAT-OAKLAND.md), `data/oneseat_change.csv` |
| LOSE-ONE-SEAT-OAKLAND | **Answered** | [doc](LOSE-ONE-SEAT-OAKLAND.md), `data/oneseat_change.csv` |
| GAIN/LOSE-ONE-SEAT-CRITICAL | **Blocked** — no POI data | needs SNAP/grocery coordinates; see below |
| GAIN-OTHER / LOSE-OTHER | Not started — editorial | `data/exhibit_a.txt`, route pages |
| NEW-ROUTE | **Answered** — 14 routes | [doc](NEW-ROUTE.md), `data/route_crosswalk.csv` |
| LOST-ROUTE | **Answered** — 20 routes, plus the 77 | [doc](LOST-ROUTE.md), `data/discontinued_route_ridership_202604.csv` |
| COVERAGE-CHANGE | **Answered for all 5 criteria**; area in km² not built | [doc](COVERAGE-CHANGE.md), `data/coverage_change.csv` |
| RIDERSHIP-PROJECTIONS | Deferred by decision | to be a bounded scenario range, assumptions stated inline |
| LOSE-SERVICE-DAYS | **Answered** | [doc](LOSE-SERVICE-DAYS.md), `data/route_service_days.csv` |
| GAIN-SERVICE-DAYS | **Answered** | [doc](GAIN-SERVICE-DAYS.md), `data/route_service_days.csv` |
| LOSE/GAIN-SERVICE-HOURS | Not answered | needs a route-level rollup no script writes; `data/route_frequency_change.csv` is orphaned and predates both the 8–11pm headway fix (caveat 8) and the proposed GTFS (caveat 10) — **do not cite it** |
| LOSE-FREQUENCY-HALF | **Answered** | [doc](LOSE-FREQUENCY-HALF.md), `data/coverage_change.csv`: 282 locations keep service and lose ≥half their weekday trips |
| GAIN-FREQUENCY-DOUBLE | **Answered** | [doc](GAIN-FREQUENCY-DOUBLE.md), `data/coverage_change.csv`: 221 double on weekdays, 342 on Saturday |
| STOP-LOST-SERVICE | **Answered for all 5 criteria** | [doc](STOP-LOST-SERVICE.md), `data/coverage_change.csv`, `data/stop_service_change.csv` |
| STOP-ROUTE-REPLACE | **Answered** | [doc](STOP-ROUTE-REPLACE.md), `data/stop_route_replace.csv`: 356 locations |

## Location-level answers

Not question IDs. One file per place in [`locations/`](locations/), for the
question the comment period actually generates.

| Place | Status | Output |
|---|---|---|
| OUTER-CHARTIERS | **Answered** | [doc](locations/OUTER-CHARTIERS.md), `data/coverage_change.csv` |

## Days of service and coverage tiers

`analyze_coverage_change.py` is the day-of-week half of the assessment; every
other script is weekday-only, so a place that keeps its weekday buses and loses
Saturday and Sunday reads as untouched everywhere else. It writes
`data/route_service_days.csv`, `data/coverage_change.csv` and
`data/stop_route_replace.csv`, and it is the only analysis here built on the
**proposed network's own GTFS** (`data/raw/proposed_gtfs/`) rather than on the
Remix map plus the frequency PDFs — see
[METHOD-coverage.md](METHOD-coverage.md). Headline results:

- **Two corridors lose a day type**: Banksville (the 36 becomes the peak-only
  36L) and Elizabeth (the Y46 becomes the 46L). Four more route numbers go
  weekday-only — the 29, 53, 55 and 69 — but hand their weekends to their own S
  variants, which the Remix-based scripts cannot see at all. **The P3 and the 78
  gain Saturday and Sunday.**
- **152 locations keep their weekday buses and lose the weekend entirely**, in
  three corridors: Mount Royal Blvd (62), Route 51 south (52) and Banksville Rd
  (18). The mechanism in all three is an all-week flyer becoming a peak-only
  weekday limited.
- **Weekend service grows**: summed across locations, Saturday trips are up
  15.6% and Sunday 17.1%, and weekend hourly-or-better coverage is net **+415
  locations**. Weekdays are +3.7% and roughly neutral on the hourly tier (−28).
- **490 locations drop below hourly-or-better on weekdays** — no gap over 60
  minutes anywhere between 6am and 6pm — and 462 rise to it.

What is still missing for COVERAGE-CHANGE is only the fifth tier's units:
**coverage as an area in square kilometres**. That needs no new source — both
networks' stop coordinates are already in `data/`, so it is a buffer union over
the same tiers this script already computes per location.

## The one blocked question

`GAIN/LOSE-ONE-SEAT-CRITICAL` needs coordinates for groceries, Walmarts and
similar. `BASE_CAMP.md`'s appendix suggests the Remix feed carries SNAP data;
it half does. `data/raw/remix_project.json` references six map layers by numeric
`sourceLayerId` (7788, 19568, 21725 "Park and Rides", 22187, 32325, 32557), but
stores only the ids — the geometry lives on Remix's servers and the obvious API
paths return the app shell rather than data. `remix_map.json` contains no POI
layer either — its four "Walmart" hits are stop names.

Two fallbacks, either of which unblocks it properly: the USDA SNAP Retailer
Locator, or OSM Overpass for `shop=supermarket` plus named chains. A partial
answer needs neither: **PRT's own stop names carry the destinations** — 20 Giant
Eagle stops, 9 Target, 7 Walmart, 6 Shop'n Save, plus Costco, Whole Foods,
Save-A-Lot and Kuhn's, and separately 21 hospital and 6 CCAC stops. That is a
floor rather than a census, since a store not named in a stop name is invisible
to it.

Either way, `analyze_one_seat.py` needs a small change first, not none: its
`ANCHORS` are sets of PRT `HOOD` labels, so a coordinate- or stop-id-keyed anchor
is a new code path rather than a parameter.

## Known cross-cutting caveats

These apply to every answer here, and each has bitten at least once:

1. **The Remix map is built on a 2023 base feed**, so proposed stop inventory
   drifts against the 2026 current GTFS.
2. **The Remix map carries no timetables**, so any answer built on it takes *how
   much* service from the frequency PDFs. This is no longer the only option — see
   caveat 9 — but it is still true of every script except
   `analyze_coverage_change.py`.
3. **Boardings are May 2025 weekday averages**, unlinked and unweighted, and
   alightings are unavailable.
4. **PRT's `HOOD`/`MUNI` labels contain gross errors** — stops mislabelled by up
   to 40 km. Any place-level analysis needs the outlier filter in
   `analyze_one_seat.py`.
5. **Stop-level analysis produces artifacts** at corridor locations where
   adjacent stop ids split a route set. Aggregate before concluding.
6. **PRT's route crosswalk packs several routes into one cell** (`"86, 77"`), so
   a naive split silently loses routes. Route 77's fate is only visible if you
   parse that cell.
7. **The current GTFS holds two holiday calendars that look like day types.**
   Service `4` has `monday=1` but operates on one date, Labor Day; service `1`
   is the same for July 4 against Saturday service `3`. Counting either as a day
   type credits 70 routes with a schedule they do not run, so day types must be
   resolved for real dates — see `analyze_coverage_change.py` and the calendar
   note in `DATA_SOURCES.md`. The 53 is the route this decides: its only
   non-weekend trips are Labor Day trips.
8. **The frequency PDFs' columns move between pages**, so the parser measures
   each page's own header. Measuring once cost 16 routes their published 8–11pm
   headway and inflated the late-evening cut from −20.3% to −38.7% before it was
   caught (`FINDINGS.md` caveat 9, `DATA_SOURCES.md` trap 4). Every answer that
   reads `service_levels.csv` — coverage tiers, service days, frequency
   halving/doubling — inherits that file, so re-run the chain after any change to
   `ingest_blr.py` rather than trusting a cached CSV.
9. **A GTFS for the proposed network now exists, and it supersedes the PDFs and
    the Remix map wherever the two disagree.** `data/raw/proposed_gtfs/` has real
    timetables — 14,488 trips, 698,865 `stop_times` rows. Only
    `analyze_coverage_change.py` uses it so far. Two things it fixes were changing
    answers: the S-variants (29S, 53S, 55S, 69S, 78S, 89S) are absent from the
    Remix map, so Remix-based analysis silently drops the weekend service on their
    corridors; and span ÷ headway doubles the peak-only limiteds, which run one
    direction. In aggregate the PDF estimate is good — within 1.4% of the feed
    system-wide — so the older outputs are not junk, but any *proposed-side*
    figure they carry should be re-derived from the feed before publication. This
    includes `FINDINGS.md` §C's −0.9% weekday change, which the feed puts at
    **+3.7%**. See [METHOD-coverage.md](METHOD-coverage.md).
10. **Stop ids collide between the usage extract and the GTFS.** They are not
    one namespace: for **119 of the 5,751 rows in `data/coverage_change.csv`**
    the two feeds disagree entirely about which stop an id names. The affected
    rows carry **1,333 weekday boardings** and are almost all in the 22600–22800
    id block; worst case is `22728` — `SMITHFIELD ST AT FIFTH AVE` in the usage
    extract, `CHURCH AVE AT DALZELL AVE` in GTFS, 627 boardings. Distinct from
    caveat 4: the `HOOD`/`MUNI` error mislabels a correctly located stop, this one
    would misplace the stop itself. Found while writing
    [locations/OUTER-CHARTIERS](locations/OUTER-CHARTIERS.md), where it surfaced
    as a Chartiers Ave stop plotting in Turtle Creek. **Handled** in
    `analyze_coverage_change.py`: names now come from the GTFS that supplies the
    geometry, the usage name is kept alongside as `usage_stop_name`, and the row
    is flagged `id_name_mismatch` and excluded from every example list. Trip
    counts and tier counts never depended on the name and are unaffected — but the
    boardings and place labels on flagged rows belong to another stop, so do not
    quote them per-stop.
11. **Route renumbering is not route replacement.** Downtown stops appear to swap
    nearly their whole route list because the 61A–D become the 60X/61X/62X and the
    P-flyers become L-limiteds. Any stop-level route comparison has to translate
    through `route_crosswalk.csv` first and fold the S-variants into their
    parents: doing so cuts the STOP-ROUTE-REPLACE candidate set from 903 stops to
    751, and to **356** once stops carrying more than four routes today are
    excluded as well, since a Downtown stop with 38 routes is never a clean
    substitution ([STOP-ROUTE-REPLACE.md](STOP-ROUTE-REPLACE.md)).

## Not yet reflected here

`data/raw/remix_project.json` contains **10 `onDemandZones` polygons** — the
proposed microtransit areas. No answer currently accounts for them, which means
REGION-LOSS may overstate losses in places slated for on-demand service instead
of fixed route. This should be resolved before any coverage or region finding is
published.
