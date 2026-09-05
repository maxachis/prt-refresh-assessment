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
| `data/raw/proposed_gtfs/` | proposed network: stop -> routes, from PRT's own feed. This replaced the Remix extract once PRT supplied a GTFS; Remix agreed on 5,513 of 5,515 served stops but also carried 107 stops the proposal does not serve, and its labels were Remix `short_name`s rather than the GTFS route ids this join needs. |

## Caveats — read before citing

1. **Boardings are May 2025 weekday averages** and count *all* boardings at a
   place's stops, not trips to the anchor. They size the affected population;
   they are not a count of riders making that specific trip. No origin-destination
   data is public, so a true figure is not available.
2. **Both sides are read from real feeds**, the current GTFS and the
   proposed-network GTFS PRT supplied to PPT. The Remix map, and the 2023 base
   feed it is built on, no longer enter this answer.
3. **This measure carries no timetable.** A retained one-seat ride can still
   lose most of its trips, and a gained one may run hourly — the proposed feed
   would answer that, but this test deliberately does not ask it, because a
   route serves a place or it does not. Pair with `data/coverage_change.csv`,
   or click the location in the web app, for the frequency dimension.
4. **"Oakland" is three of the four Oakland neighbourhoods** — West, Central
   and South Oakland. North Oakland is deliberately excluded: it runs a mile
   north of the Fifth/Forbes hospital and university core riders mean by
   "Oakland", to the Bloomfield and Shadyside edges, so counting it credited an
   Oakland ride to routes that only touch that far edge and never approach the
   core — today's 77 at Craig St and Baum, the 82 along Centre Ave. The choice
   moves four places: Penn Hills, Plum, Homewood North and
   Lincoln-Lemington-Belmar all read as having no one-seat ride to Oakland
   either way, where the wider definition had the first two losing one and the
   second two keeping one. It is still the whole of three neighbourhoods, so a
   route clipping South Oakland's edge counts; the core itself is narrower than
   that.
5. **Rail counts.** The T and the inclines are one-seat rides where they apply,
   and appear in both networks.
6. **141 current and 241 proposed stops are unplaced** (>400 m from any
   labelled stop) and are excluded from place grouping, though they still count
   toward anchor reach.
7. **Trafford borough appears twice**, in Allegheny and Westmoreland counties,
   because PRT labels it both ways. Both rows are shown rather than merged.

## The same question in the web app

`docs/WEBAPP.md`'s **One-seat** view asks this at every location rather than
per place, with the destination chosen by the reader — Downtown, Oakland, or a
dropped pin anywhere in the county. It is a port of this method, not a second
one, and `tests/test_oneseat.py` pins the agreement: every route this file
credits with reaching an anchor must reach it in the app's index too.

Three deliberate differences:

| | this file | the app |
|---|---|---|
| unit | place (neighbourhood, else municipality) | location (a radius on the ground) |
| destination radius | 200 m | the reader's walk radius, 400 m or 150 m |
| verdicts | keeps / gains / loses / none either way | the same four, plus `here` for the destination itself |

The unit differs because the app measures a circle, which is what dissolves the
adjacent-stop-id artefact that forced this file to the place level in the first
place — at 400 m the circle contains both sides of the intersection. At 150 m
that protection weakens, which is why the strict radius is offered as a
sensitivity test rather than as the headline here too.

The destination radius differs by Max's choice: the reader picks both ends and
moves one control, and a rider walks at the far end as well. It turns out to
change nothing for the two named destinations — Downtown reaches the same 79
current and 69 proposed routes at either radius, Oakland the same 23 and 25,
because a district's seed cloud is already dense enough to saturate. It matters
only for a dropped pin, which is a single seed.

## Reproduce

```bash
python3 ingest_blr.py           # sources -> data/*.csv
python3 analyze_service_loss.py # caches data/raw/stop_usage_202505.csv
python3 analyze_one_seat.py     # -> data/oneseat_change.csv
```
