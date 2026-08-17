# Method — one-seat-ride change

Shared method for the four `*-ONE-SEAT-*` answers in `BASE_CAMP.md`. Produced by
`analyze_one_seat.py`, output `data/oneseat_change.csv` (369 rows, one per
place × anchor).

## Definitions

**One-seat ride.** A place has a one-seat ride to an anchor if some route
serving that place also stops in the anchor district — no transfer. This says
nothing about how long the ride takes or how often it runs; pair with
`service_levels.csv` for the frequency dimension.

**Anchor.** Defined once, from PRT's own `HOOD` labels on the current network,
then applied identically to both networks:

| Anchor | Neighbourhoods | Seed stops |
|---|---|---|
| Downtown | Central Business District | 44 |
| Oakland | West / Central / North / South Oakland | 93 |

A route reaches an anchor if it stops within **200 m** of a seed stop.

**Place.** City neighbourhood where PRT publishes one, else municipality. This
is the unit of analysis, not the stop — see below.

## Why the unit is the place, not the stop

Running this per stop produces a wrong answer with a confident face on it. At a
corridor location, adjacent stop ids split the route set: Fifth Ave at
Chesterfield (stop 38) matches a proposed stop served only by route 93, while
its twin across the intersection (stop 36) carries the other sixteen routes. Per
stop, West Oakland "loses its one-seat ride Downtown" and 716 daily boardings
go with it. It does not. Aggregating to the place dissolves the artifact, and a
place is what the question asks about anyway.

This is the same family of error as the 150 m proximity control in
`FINDINGS.md`: a stop-id-level change is not by itself a service change.

## Four controls that changed the answer

Each of these was found by spot-checking an implausible row, and each altered
the published result:

1. **Reach is measured over every served stop**, not only place-labelled ones.
   PRT's usage extract covers bus stops only; restricting the anchor test to
   labelled stops dropped 61A's Downtown terminus and made Braddock appear to
   have no Downtown service today.
2. **Both networks are placed the same way.** Rail stations carry no bus-usage
   record. Labelling the current network from PRT's field while inheriting
   labels on the proposed side invented one-seat "gains" on the T — Bon Air
   appeared to gain Downtown via BLUE and SILVER, which it has had all along.
3. **Boardings come from the `route_code == "All Routes"` row.** The extract is
   one row per stop per route *plus* a stop total. Summing every row
   double-counts; taking the last row read picks an arbitrary single route.
4. **Geographic outliers are dropped.** PRT's `HOOD` field carries gross
   errors — two stops on 6th St in Braddock are labelled "Westwood", 16 km from
   every other Westwood stop, and a Fifth Ave stop in Oakland is labelled
   "Fineview". These handed those neighbourhoods phantom 61A/61B one-seat rides
   to lose. A label is discarded when its stop sits further from the place's
   median position than `max(1500 m, 3 × the place's own median spread)` — a
   floor so small neighbourhoods keep a sane margin, scaled so large
   municipalities are not clipped at their edges. 
   
   The filter drops stops PRT mislabelled by up to 40 km.

## Sources

All raw, so this is independent of the other analysis scripts' outputs:

| Source | Role |
|---|---|
| `data/raw/current_gtfs.zip` | current network: stop → routes actually serving it |
| `data/raw/stop_usage_202505.csv` | place labels (`HOOD`/`MUNI`) and May 2025 weekday boardings |
| `data/proposed_stops.csv` + `data/proposed_stop_sequences.csv` | proposed network, from the Remix public API |

## Caveats — read before citing

1. **Boardings are May 2025 weekday averages** and count *all* boardings at a
   place's stops, not trips to the anchor. They size the affected population;
   they are not a count of riders making that specific trip. No origin-destination
   data is public, so a true figure is not available.
2. **The Remix map is built on a 2023 base feed** (`feedStartDate` 2023-06-18),
   so the proposed stop inventory carries drift against the 2026 current feed.
3. **No timetables exist for the proposed network.** A retained one-seat ride
   can still lose most of its trips; a gained one may run hourly.
4. **"Oakland" is the whole of the four Oakland neighbourhoods.** A route
   clipping the edge of North Oakland counts. The destination most riders mean
   is the Fifth/Forbes hospital and university core, which is a narrower target.
5. **Rail counts.** The T and the inclines are one-seat rides where they apply,
   and appear in both networks.
6. **141 current and 241 proposed stops are unplaced** (>400 m from any
   labelled stop) and are excluded from place grouping, though they still count
   toward anchor reach.
7. **Trafford borough appears twice**, in Allegheny and Westmoreland counties,
   because PRT labels it both ways. Both rows are shown rather than merged.

## Reproduce

```bash
python3 ingest_blr.py           # sources -> data/*.csv
python3 analyze_service_loss.py # caches data/raw/stop_usage_202505.csv
python3 analyze_one_seat.py     # -> data/oneseat_change.csv
```
