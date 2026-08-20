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
| COVERAGE-CHANGE | **Answered in full** — 5 criteria, by location and by area | [doc](COVERAGE-CHANGE.md), `data/coverage_change.csv`, `data/coverage_area*.csv` |
| EQUITY-RACE | **Answered** | [doc](EQUITY-RACE.md), `data/equity_change.csv`: coverage losses fall on white residents (1.11× the county rate), frequency gains on Black residents (+8.4pp weekend hourly) |
| EQUITY-AGE | **Answered** | [doc](EQUITY-AGE.md), `data/equity_change.csv`: residents 65+ lose coverage at 1.14× and regain at 0.89× — the one group losing more and gaining less |
| EQUITY-INCOME | **Answered** | [doc](EQUITY-INCOME.md), `data/equity_change.csv`: progressive on every tier; under-$25k households gain weekday hourly at 1.33×, over-$100k at 0.70× |
| EQUITY-VEHICLE | **Answered** | [doc](EQUITY-VEHICLE.md), `data/equity_change.csv`: car-free households lose all service at 0.65× the county rate; 21% still have no bus after the plan |
| EQUITY-DISABILITY | **Answered** — tract geography | [doc](EQUITY-DISABILITY.md), `data/equity_change.csv`: loss ratios at 1.00, weekday-hourly gain at 1.31× |
| EQUITY-LANGUAGE | **Answered** — smallest universe | [doc](EQUITY-LANGUAGE.md), `data/equity_change.csv`: not singled out for cuts, but gain ratios below 1 on every tier |
| RIDERSHIP-PROJECTIONS | Deferred by decision | to be a bounded scenario range, assumptions stated inline |
| LOSE-SERVICE-DAYS | **Answered** | [doc](LOSE-SERVICE-DAYS.md), `data/route_service_days.csv` |
| GAIN-SERVICE-DAYS | **Answered** | [doc](GAIN-SERVICE-DAYS.md), `data/route_service_days.csv` |
| LOSE-SERVICE-HOURS | **Answered** | [doc](LOSE-SERVICE-HOURS.md), `data/route_frequency_change.csv`: hours rise system-wide; 24 groups keep service and lose ≥10% of weekday hours, 17 of them losing trips too |
| GAIN-SERVICE-HOURS | **Answered** | [doc](GAIN-SERVICE-HOURS.md), `data/route_frequency_change.csv`: +2.5% weekday hours, +18.0% Saturday, +15.7% Sunday; 26 groups gain ≥10% on weekdays plus 14 new groups |
| LOSE-FREQUENCY-HALF | **Answered** | [doc](LOSE-FREQUENCY-HALF.md), `data/coverage_change.csv`: 284 locations keep service and lose ≥half their weekday trips |
| GAIN-FREQUENCY-DOUBLE | **Answered** | [doc](GAIN-FREQUENCY-DOUBLE.md), `data/coverage_change.csv`: 217 double on weekdays, 331 on Saturday |
| STOP-LOST-SERVICE | **Answered for all 5 criteria** | [doc](STOP-LOST-SERVICE.md), `data/coverage_change.csv`, `data/stop_service_change.csv` |
| STOP-ROUTE-REPLACE | **Answered** | [doc](STOP-ROUTE-REPLACE.md), `data/stop_route_replace.csv`: 371 locations |

## Location-level answers

Not question IDs. One file per place in [`locations/`](locations/), for the
question the comment period actually generates.

| Place | Status | Output |
|---|---|---|
| OUTER-CHARTIERS | **Answered** | [doc](locations/OUTER-CHARTIERS.md), `data/coverage_change.csv` |
| ROUTE-51 | **Answered** — two corridors, opposite directions | [doc](locations/ROUTE-51.md), `data/coverage_change.csv`, `data/stop_service_change.csv` |

## Days of service and coverage tiers

`analyze_coverage_change.py` is the day-of-week half of the assessment; every
other script is weekday-only, so a place that keeps its weekday buses and loses
Saturday and Sunday reads as untouched everywhere else. It writes
`data/route_service_days.csv`, `data/coverage_change.csv` and
`data/stop_route_replace.csv`, counting both networks from their own GTFS
timetables through the shared `gtfs.py` loader — see
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
  15.3% and Sunday 16.8%, and weekend hourly-or-better coverage is net **+415
  locations**. Weekdays are +3.3% — the same figure `FINDINGS.md` §C reports — and roughly
  neutral on the hourly tier (−28).
- **490 locations drop below hourly-or-better on weekdays** — no gap over 60
  minutes anywhere between 6am and 6pm — and 462 rise to it.

## Coverage as population — the equity questions

`analyze_equity_change.py` answers the same five tiers a third way: as people.
It measures coverage at the interior point of all 33,131 populated 2020 census
blocks in the three counties and weights each by who lives there, from ACS
2024 5-year tables. Method, denominators and the eight caveats that travel with
every figure are in [METHOD-equity.md](METHOD-equity.md); the six question files
above carry the numbers.

The headline, on the Allegheny County denominator at 400 m:

- **53.3% of residents have a bus within 400 m of home today, 49.4% under the
  plan** — 68,989 lose all bus service near home, 20,095 gain it.
- **Hourly service goes the other way**: +1.9 points on weekdays and +4.1 on
  weekends, a net 50,218 residents gaining an hourly weekend bus.
- The trade is **progressive**. Losses concentrate on white, higher-income and
  older residents; gains concentrate on Black, lower-income, car-free and
  disabled residents. Black residents gain weekend hourly service +8.4 points
  against the county's +4.1.
- **Residents aged 65+ are the exception** and the sharpest negative finding:
  they lose coverage at 1.14× the county rate and regain it at 0.89×, the only
  group both losing more and gaining less.

Read beside the location and area figures, never alone — the plan is roughly
neutral by location, loses 12% of covered ground, and loses about 7% of covered
residents. All three are true.

## Coverage as area

`analyze_coverage_area.py` answers the same five tiers in square kilometres,
which the per-location tiers structurally cannot: they are measured at stops
that exist today, so ground the plan adds a bus to is invisible to them. It
rasterises the union of walk-radius discs on a 100 m lattice — the same cluster
and gap tests as above, applied at every point rather than at every stop — and
writes `data/coverage_area.csv`, `coverage_area_blocks.csv`,
`coverage_area_places.csv` and `coverage_area_ondemand.csv`.

- **The footprint shrinks 12.0%**: 460.4 → 405.1 km² within 400 m of a bus on
  any day. 80.1 km² loses all fixed-route service and 24.8 km² gains it.
- **The ground within reach of an hourly-or-better bus grows** — +2.6% on
  weekdays, **+20.8% on weekends**. Coverage traded for frequency, quantified.
- **Area falls faster than the stop list** (17.4% of ground lost against 10.3%
  of locations), because what is dropped is where stops are furthest apart.
- **The largest single losses**: McCandless/Ross/Hampton 12.0 km², Plum 7.8,
  Baldwin 5.7 + 4.7, Kennedy 4.9, Mount Lebanon 4.9, Reserve 4.5.
- **The largest single gain is ground with no PRT stop today** — 3.5 km² up
  Perry Hwy past AHN Wexford, which no location-based method can see.
- **23% of the lost area falls inside a proposed on-demand zone** (see below).

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
2. **The Remix map carries no timetables**, which is why proposed service was
   originally taken from the frequency PDFs. Superseded by caveat 9: the analyses
   now count both networks from GTFS, and the PDFs serve as a published
   cross-check. Remix remains the only source for the microtransit zones.
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
   timetables — 14,488 trips, 698,865 `stop_times` rows — and `gtfs.py` loads
   either network through the same code, so "measure both sides identically" is
   now structural rather than a convention. Two things it fixes were changing
   answers: the S-variants (29S, 53S, 55S, 69S, 78S, 89S) are absent from the
   Remix map, so Remix-based analysis silently drops the weekend service on their
   corridors; and span ÷ headway doubles the peak-only limiteds, which run one
   direction. In aggregate the PDF estimate was good — within 1.4% of the feed
   system-wide — but it misallocated service across the day, which is why the
   earlier night-service finding was withdrawn (`FINDINGS.md` §C). **No
   PDF-derived proposed-side figure remains in `data/`**: the last one was
   `route_frequency_change.csv`, now regenerated from both timetables by
   `analyze_route_hours.py` ([LOSE-SERVICE-HOURS.md](LOSE-SERVICE-HOURS.md)).
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
    parents: doing so cuts the STOP-ROUTE-REPLACE candidate set from 901 stops to
    749, and to **371** once stops carrying more than four routes today are
    excluded as well, since a Downtown stop with 38 routes is never a clean
    substitution ([STOP-ROUTE-REPLACE.md](STOP-ROUTE-REPLACE.md)).

12. **The 10 on-demand zones are counted in area, and nowhere else.**
    `data/raw/remix_project.json`'s `onDemandZones` polygons are the proposed
    microtransit areas, and `analyze_coverage_area.py` is the first thing here
    to measure them: **18.3 of the 80.1 km² losing all fixed-route service —
    23% — falls inside one**, concentrated in the McCandless zone (8.5 km²) and
    South Hilltop (5.0). Each zone runs all week, 7am–9pm weekdays and 8am–8pm
    weekends, on **1 to 3 vehicles for the whole zone**, so a zone is a fallback
    and not a replacement; the figures are reported beside losses and never
    netted off them. Two limits on this: every *location-level* answer here
    (REGION-LOSS, STOP-LOST-SERVICE, the `locations/` files) still ignores the
    zones and so may overstate loss where one applies; and the zones come from
    the Remix project file, which flags all ten `isHidden` — nothing verifies
    PRT has published or committed to them.

## Not yet reflected here

The zones above are counted only in the area answer. Folding them into the
location-level answers — flagging each affected stop rather than each square
kilometre — is the obvious next step, and needs no new source.
