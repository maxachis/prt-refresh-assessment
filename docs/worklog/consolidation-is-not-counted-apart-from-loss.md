# A deleted stop is not a lost bus, and nothing counts which is which

**Observed:** 1,407 stop ids served today are absent from the proposal, and the
repo publishes no split between the ones whose service moves to a pole down the
street and the ones whose service goes away — only a caveat that the gap between
the 400 m and 150 m radii "is stop consolidation, not service loss."
**Where it stands:** partly answered on 2026-09-09 — the map now counts the
split and draws it; the published CSV and the answer documents still do not.
Measured on 2026-09-01. The audit of
that date claimed every radius-based layer was structurally immune; that is
true at 400 m and **false at the map's strict 150 m setting, corrected
2026-09-09** after a reader in Uptown reported it. There are two exposures, not
one: the app's 150 m walk setting, which tells a reader "−100%" and "no
service" at 341 weekday locations that still have buses within a 400 m walk;
and `stop_service_change.csv`'s `status` column, whose 150 m verdict three
answer documents quote. That column now carries a caveat in
[`STOP-LOST-SERVICE.md`](../answers/STOP-LOST-SERVICE.md); whether it should
carry a walked distance and a 400 m verdict of its own is Max's call, and so is
whether the 150 m setting should say what the 400 m one would.

> Raised by Max as a question to investigate.

## The question

When is a stop disappearing because PRT is consolidating stops, and when is it
disappearing because the buses stop coming? A rider whose pole moves 120 m keeps
their service and walks further. A rider whose nearest replacement is a kilometre
away has lost it. Both are "loses all service" in `stop_service_change.csv`
today, separated only by the walk-radius test, and the answers directory never
states the split as a number.

## What is measured

Stop ids with trips in the current feed but none in the proposed feed, both
read all-modes through `gtfs.stop_routes` the way `analyze_service_loss.py`
reads them: **6,388 served today, 5,515 in the proposal, 1,407 ids gone.**
Boardings are May 2025 weekday averages off the `All Routes` row (convention 7),
about 6,824 across the 1,407.

Distance from each vanished stop to the nearest stop the proposal actually
serves, on the pedestrian network (`refresh.walking`, bounded at 800 m), not as
the crow flies:

| Walk to the nearest proposed stop | Stops | Weekday boardings |
|---|---:|---:|
| ≤ 150 m — same corner, renumbered | 332 | 4,100 |
| 150–400 m — consolidated onto another pole | 347 | 1,921 |
| 400–800 m — past the published quarter mile | 204 | 292 |
| no proposed stop within an 800 m walk | 524 | 511 |

**Consolidation is where the riders are and withdrawal is where the stops are.**
88% of the boardings at a deleted stop (6,021 of 6,824) are within a 400 m walk
of a stop the proposal serves; the 524 stops with nothing within 800 m carry 511
weekday boardings between them, about 1 each. That is the same broad-and-thin
shape `STOP-LOST-SERVICE.md` already reports, seen from the stop-id side.

**Routing the walk moves the line.** The median walk to a replacement stop is
199 m, and a walk is a median 1.29× its own straight line here (p90 1.93×).
**104 stops carrying 332 boardings are within 400 m of a proposed stop as the
crow flies and are not within a 400 m walk of one** — they read as consolidated
under convention 4's straight-line radius and as stranded on the pavement. This
is convention 14's split arriving at the stop inventory: whether to restate the
consolidation count on the walk network is the substantive question here.

**A nearby pole is not the same route.** Translating current route numbers to
their final ones through `data/route_crosswalk.csv` and asking whether any
successor calls within 400 m: 400 vanished stops (5,464 boardings) keep a
successor route nearby — consolidation proper; 597 (932 boardings) have a
proposed stop nearby that no successor route serves — the corner keeps a bus,
the rider's route left; 410 (428 boardings) have no successor at all because
every route serving them is discontinued. The middle bucket is the one no
existing answer names: it is not a coverage loss and it is not
[`STOP-ROUTE-REPLACE.md`](../answers/STOP-ROUTE-REPLACE.md)'s comparable
substitution either, since that answer requires the trip count to hold within
10%.

## Why it may not deserve a script

Three of the four numbers above are re-cuts of `coverage_change.csv`, which
already measures both radii at every location and is the file the answers cite.
The stop-id view adds one thing the location view structurally cannot: it names
*which pole* went away and how far its replacement is, which is the sentence a
commenter writes about their own corner. Against that, a stop id is exactly the
unit conventions 2 and 3 say not to publish. A plausible resolution is a column
on `stop_service_change.csv` — the walked distance and the successor-route
verdict — rather than a new script and a new question ID.

## Approaches considered

- **Straight-line bands only** (what the 400/150 caveat does today). Rejected
  here as the sole measure: it puts 104 stops in the wrong bucket, and the repo
  already owns a pedestrian network that settles them in five seconds.
- **Calling a stop "consolidated" whenever any proposed stop is near.** Rejected:
  it counts the 597 stops whose corner keeps a bus but whose route left as
  though nothing happened to those riders.

## Caveats on the numbers above

At least 21 of the 524 stops with nothing inside an 800 m walk are an artifact,
not a withdrawal: they snap onto disconnected fragments of the OSM walk graph
and can reach nothing on foot at any bound. FOURTH AVE AT PPG ENTRANCE, 169
weekday boardings and 74 m from a proposed stop, is the largest. See
[`some-stops-sit-on-an-island-of-the-walk-network.md`](some-stops-sit-on-an-island-of-the-walk-network.md).

Stop ids are the unit here, so the caveats of conventions 2 and 3 apply in full:
adjacent ids at one corner are counted separately, and none of these counts are
locations.

## What the existing views do with it — audited 2026-09-01

**The immunity is the radius, so it is only ever as wide as the radius — which
the original wording of this section missed.** Applying one circle to both
networks absorbs a consolidation *that lands inside the circle*, and nothing
more; at 400 m that covers almost all of them, and at 150 m it does not. The
first version of this paragraph said "every layer that answers at a point is
immune by construction" and named the panel among them. That reads the
convention as a property of the method rather than of the number the method was
given, and it is the shape of the mistake worth keeping: an invariant stated
without the parameter it depends on.

Corrected, at 400 m: the map's Locations dots, the magnitude surface, the
People reading, `coverage_change.csv`, `coverage_area*.csv`, the frequency
tiers, the equity weightings and the panel all apply the same walk radius to
both networks and cluster the stops inside it, so a stop consolidated onto a
pole 120 m away is inside the same circle and the location reads unchanged.
`analyze_corridor_change.py` never reads a stop at all — it resamples route
shapes — so a stop inventory cannot move it. The one-seat index and the journey
router pick candidate stops by radius on each side independently, so neither
can see a renumbering.

**At 150 m the same layers report consolidation as withdrawal, in the app's own
voice — measured 2026-09-09.** On a weekday, 974 locations fall in the `gone`
bucket at 150 m against 633 at 400 m. Of those 974, 341 are not `gone` at
400 m: 118 read `less`, 51 `same`, 95 `more` and 27 `doubled` once the circle is
the published quarter mile. The median walk-line distance from those 341 to the
nearest stop the proposal serves is 227 m — a pole moved down the block. The
panel gives that reader an unqualified sentence: at FIFTH AVE + GIST ST
(40.438346, −79.979360), 150 m, weekday, it prints **489 → 0, −100.0%**, "drops
below hourly", first-and-last "no service", and — because `oneseat_named` takes
the same radius — "loses its one-seat ride" to Downtown. At 400 m the same
point reads 612 → 871, +259. The plan moves that stop 170 m up Fifth Avenue to
WYANDOTTE ST, where the panel reads 490 → 694.

Convention 4 already anticipates this: it says radius sensitivity is *reported,
not chosen*, and that where the two radii disagree both numbers are printed.
The pipeline does that. The app hands the reader a radius toggle and then
prints one of the two numbers as a finished sentence, which is the one place
the convention is not carried through. Reproduce:

```
python3 - <<'PY'
import sqlite3, sys; sys.path.insert(0, 'src')
from refresh import query
con = sqlite3.connect('data/refresh.db'); con.row_factory = sqlite3.Row
at400 = {r[1]: r[10] for r in query.compute_change(con, radius=400) if r[2] == 'weekday'}
gone = [r for r in query.compute_change(con, radius=150)
        if r[2] == 'weekday' and r[10] == 'gone']
print(len(gone), sum(1 for r in gone if at400.get(r[1]) != 'gone'))
PY
```

The panel goes further and refuses to grade the one row that would tempt a
reader: `frontend/place.ts` prints the stop count before and after with no
better/worse colouring, on the stated grounds that a vanished id is consolidation
more often than a lost bus, and `frontend/place.test.ts` pins it.

**The other exposure is the stop-id file and the documents that quote it.** Of the 880
rows `data/stop_service_change.csv` flags `loses_all_service`, 217 — carrying 661
of its 1,200 weekday boardings, 55% — have a stop the proposal serves within a
400 m walk. The column is a 150 m verdict under an unqualified name, and it is
the file cited whenever an answer wants to check a single pole.

**Three answers quote raw per-place stop counts** out of
`oneseat_change.csv`'s `stops_now` / `stops_proposed`, as evidence that a place
loses service: McCandless 100 → 26 and four more places in
[`GAIN-ONE-SEAT-OAKLAND.md`](../answers/GAIN-ONE-SEAT-OAKLAND.md), Plum 36 → 2
in [`LOSE-ONE-SEAT-OAKLAND.md`](../answers/LOSE-ONE-SEAT-OAKLAND.md), Chartiers
City six → one in
[`locations/OUTER-CHARTIERS.md`](../answers/locations/OUTER-CHARTIERS.md). Only
the McCandless claim is defended in the text. Checking the rest by containment
(`refresh.geometry`, so the counts differ slightly from the PRT-label ones the
documents print) and walking each vanished stop to the nearest proposed one:

| Place | Served today | Proposed | Gone | ≤150 m walk | 150–400 m | further or none |
|---|---:|---:|---:|---:|---:|---:|
| McCandless township | 106 | 26 | 85 | 4 | 4 | 77 |
| Ross township | 156 | 97 | 79 | 3 | 5 | 71 |
| Scott township | 98 | 50 | 51 | 3 | 10 | 38 |
| Mount Lebanon township | 101 | 67 | 41 | 3 | 13 | 25 |
| Carrick | 44 | 31 | 13 | 0 | 3 | 10 |
| Plum borough | 51 | 10 | 41 | 0 | 1 | 40 |
| Chartiers City | 6 | 0 | 6 | 0 | 0 | 6 |

**The claims hold.** In every one of them most vanished stops have nothing
within a 400 m walk, so these are withdrawals and not consolidations. The
unstated share is largest at Mount Lebanon, where 16 of 41 (39%) are within a
400 m walk of a replacement, and at Scott, 13 of 51 (25%) — so "Mount Lebanon
98 → 68" is a sentence carrying a consolidation fraction it does not name. Worth
a clause, not a retraction.

## What shipped on 2026-09-09

The map's dots view, renamed **Stop-by-stop**, now answers the stop's own
question separately from the service question. A stop the plan takes away is
drawn as a red cross and a place the plan adds a stop to as a hollow ring, both
decided by `query.is_removed_stop` and `is_new_place` — exact mirrors on the
same 150 m identity constant, so a renumbered kerb cannot draw both.

**A dot is a cross or a colour, never both** (Max, 2026-09-09). The first cut
carried the mark *over* the coloured dot, on the argument that the two
questions differ; they do, but the result was unresolvable dots the moment the
day switch moved — 25 stops PRT retires are coloured "new service" on a
Saturday, because the plan puts a weekend bus where none runs today. A removed
stop is now in no bucket, and what it leaves behind is read off the
neighbouring dots instead. The cost is recorded where it will be missed: on a
weekday at 400 m all 633 "loses all service" locations are removed stops, so
that key row reads 0 there and the published 633 lives only in the published
files.

That gives the split a number on screen for the first time: 972 stops removed
countywide, of which 245 have another stop within a 400 m walk, 193 more within
800 m, and 534 none. Those walks are routed on the pedestrian network by
`build_webdb.write_stop_fates` and stored on `stop_place`, so the panel and the
hover can print "nearest stop is a 189 m walk" at the corner where the reader is
standing. The key prints the countywide split under the mark's row, because a
count of crosses alone reads as 972 corners losing their bus.

What this does **not** settle, and why the entry stays open:

- `data/stop_service_change.csv`'s `status` column still calls a consolidation
  at 150 m a total service loss, and three answer documents quote it. Only
  [`STOP-LOST-SERVICE.md`](../answers/STOP-LOST-SERVICE.md) carries the caveat.
- Its `metres_to_nearest_proposed_stop` is still a straight line where the map
  now says walk — filed separately at
  [`two-distances-to-the-replacement-stop.md`](two-distances-to-the-replacement-stop.md).
- Whether the 150 m radius should say what the 400 m one would is still Max's
  call. The mark helps a reader who looks at the dot; it does not change the
  number the bucket reports.

## What was checked and found clean

`analyze_place_service.py` (trips touching a place, counted once per trip),
`analyze_route_hours.py`, `analyze_coverage_area.py`, the Riders weighting
(`query.point_boardings` keys boardings to each stop's own id, so consolidating
two stops cannot double-count them), and `query.change_points`, which fixes the
point set at 400 m whatever radius is asked for precisely so the two radii stay
comparable.

## Reproduce

Not a repo script. The measurement is `gtfs.stop_routes` on both feeds, set
difference on the ids, then `walking.load(ingest_osm_walk.EXTRACT).reach(point,
candidates_within_800m, 800)` per vanished stop; boardings join from
`data/raw/stop_usage_202505.csv` on `stop_code` where `route_code == "All Routes"`.
