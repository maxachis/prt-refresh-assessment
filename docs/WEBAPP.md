# The web app: "what changes here?"

A map that answers, for any point in Allegheny County, what the Bus Line Refresh
does to the buses within a short walk of it — measured from real timetables on
both sides, by the same code.

It exists because the comment period generates one question far more than any
other, and it is not a question the answer documents can hold: **not** "what
happens to the 61C", but "what happens to *my corner*". `docs/answers/locations/`
answers that one place at a time by hand. This answers it for every place.

## Status

Runs locally. **Not cleared for public deployment** — see [Before it goes
public](#before-it-goes-public). `refresh serve` binds `127.0.0.1` for that
reason.

## Why this became possible on 2026-08-11

Before PRT supplied a GTFS for the proposed network, a before/after tool would
have compared a timetable against an estimate: the proposed side had to be
modelled as span ÷ published headway from the Frequency & Hours PDFs. That
estimate is good in aggregate — within 1.4% of the real feed system-wide — and
wrong in exactly the places a per-location tool would be asked about. It doubles
the peak-only limiteds, which run one direction, and it cannot see the
S-variants at all, which is where weekend service on five corridors went.

With a real feed on both sides, `gtfs.load_service` is called twice and neither
side has its own code path. The app inherits that.

## How it is put together

```
data/raw/current_gtfs.zip  ─┐
                            ├─→ build_webdb.py ─→ data/refresh.db ─→ FastAPI ─→ MapLibre
data/raw/proposed_gtfs/    ─┘      (stdlib)         (14 MB, ~26s)     read-only
```

| Piece | What it is |
|---|---|
| `build_webdb.py` | Pipeline script, standard library. Both feeds → SQLite. |
| `src/refresh/query.py` | **The analysis.** Pure functions, ports of `analyze_coverage_change.py`. |
| `src/refresh/web/app.py` | Thin FastAPI skin. No arithmetic. |
| `frontend/*.ts` | Vanilla TypeScript, esbuild → one `app.js`. MapLibre vendored, no CDN. |
| `frontend/change.ts`, `legend.ts` | The citywide layer and the legend that summarises and filters it. |

The stack follows `pgh-ghost-bus` (kept as a gitignored reference checkout at
`pgh-ghost-bus/`): uv, `src/` package, an optional web extra, read-only SQLite,
esbuild-bundled TypeScript, vendored MapLibre, pytest + vitest.

### Why departure times are stored, not trip counts

A rider standing at a corner wants the gap between buses, and a gap cannot be
recovered from a count — eight trips in a period is a bus every 22 minutes, or
eight buses in one hour and nothing after. So the stored unit is one row per
(side, stop, route, direction, day) carrying that combination's actual departure
minutes, and every count, period bucket and gap is derived at query time. That
is what lets the walk radius be a control in the UI instead of a rebuild.

It is also what keeps the file small: one row per stop_time would be ~2.5M rows;
packing times into the row that owns them is ~54k.

## The rules the query layer must honour

These are ports, not reinterpretations. `tests/test_query.py` checks the app's
answers against `data/coverage_change.csv` — the file `docs/answers/` cites — at
120 sampled locations × 3 day types × 2 sides, on trips, the hourly tier, the
seven period buckets and the route lists. **If an aggregation here drifts from
the published analysis, that test fails.** That is the whole point of it.

1. **A location is a radius, not a stop.** Both networks are measured inside the
   same circle around the same point. Route numbers and stop ids are not
   comparable across the two networks; a corner is a corner in both.
2. **Max across the cluster, never sum.** Adjacent stop ids on a corridor are
   one bus passing once. Summing them would make consolidating two stops into
   one read as a service cut.
3. **Ties break on the lowest stop id.** Set iteration order is randomised per
   process, and this moved ~20 borderline locations between runs of the original
   script before it was pinned.
4. **Hourly is a maximum gap, not an average**, measured from 6am to the first
   departure and from the last to 6pm, on the better direction — so peak-only
   service fails on the midday gap instead of passing on a technicality.
5. **The client's drawn circle uses the server's metric.** Both use the
   equirectangular 111,320 m/degree with longitude scaled by cos(lat), pinned in
   `frontend/mapview.test.ts`. If they drift, stops render outside a ring the
   numbers say contains them.

## Presentation decisions that are not cosmetic

- **Gains read as loudly as losses.** The honest headline for this plan is a
  near service-neutral, ridership-over-coverage redesign; overstating losses
  would discredit the real ones. Both sides' absolute numbers stay on screen
  next to the delta, and the delta is coloured in both directions.
- **Route lists are shown, not diffed into a score.** Renumbering is not
  replacement — the 61A–D become the 60X/61X/62X — so a "3 routes lost" count
  off those two lists would be mostly renumbering. Both lists sit side by side
  with that said in the open.
- **Every number names its day type.** 152 locations keep their weekday buses
  and lose the weekend entirely; on a weekday-only screen they read as
  untouched.
- **Both radii are reachable.** 400 m headline, 150 m strict same-corner. Where
  they disagree — the station consolidations — the disagreement is the finding.
- **A point outside the service area is a 400, not an empty result.** An empty
  result renders as a total loss of service.
- **The caveats ship with the numbers**, in a methods drawer fed by
  `/api/meta`, because a public-comment audience will screenshot a figure off
  this map.
- **The change layer's buckets are published criteria, not a colour ramp.**
  `gone`, `halved`, `doubled` and `new` are COVERAGE-CHANGE,
  LOSE-FREQUENCY-HALF and GAIN-FREQUENCY-DOUBLE restated, so the counts the
  legend shows are the counts `docs/answers/` prints — 593, 284 and 217 on a
  weekday at 400 m. `test_change_buckets_reproduce_the_published_counts` fails
  if a bucket edge moves. Only the ±10% dead band around no change is a display
  choice, and nothing published rests on it.
- **Size carries the same signal as colour.** Red for loss and green for gain
  matches the delta colours the panel already uses, which is worth more than a
  colour-blind-optimal pair the rest of the app would contradict — so the
  extremes are also the largest dots, and the two loss buckets and two gain
  buckets get identical weight.

## The map of change

The layer paints ~5,900 locations before anybody clicks, so the shape of the
plan is visible without knowing where to look. Two point sets, kept distinct:

| | what it is |
|---|---|
| **published** (5,751) | the locations `data/coverage_change.csv` measures — stops served today that carry a PRT ridership record. Counts over this set are the published counts. |
| **new coverage** (121) | places the proposed network serves where nothing stops within 400 m today. The published denominator cannot see them, so without these the map can only draw losses in the places the plan adds service. |

Three decisions worth keeping:

1. **Precomputed, by the app's own query layer.** `build_webdb.py` calls
   `query.compute_change`, which calls the same `side_at_place` a click calls.
   A dot and the panel it opens cannot disagree, and clicking a dot snaps to
   its coordinates so the reader is not measuring a point 20 m away.
2. **The point set is fixed at 400 m for both radii.** At 150 m most of the
   proposed network is "further than a radius from a current stop", so
   selecting new-coverage points per radius would fill the strict map with
   dots that are the smaller circle's artefact, not the plan's doing.
3. **The legend is the summary and the filter.** Counts are for what is on
   screen, recomputed from the raw rows on every `moveend` — not from
   `queryRenderedFeatures`, which only sees what survived the filter, so
   switching a bucket off would otherwise look like those losses had gone away.

## API

| Endpoint | Returns |
|---|---|
| `GET /api/place?lat=&lon=&radius=` | Before and after at one point, all three day types. The app's purpose; everything else is navigation. |
| `GET /api/change?radius=` | The citywide layer: every location bucketed, all three day types, columnar. Radius must be 400 or 150 — it is precomputed. ~300 KB, 77 KB gzipped. |
| `GET /api/stops?side=&lat=&lon=&radius=` | Stops one network puts inside the radius. |
| `GET /api/routes?side=` | Bus routes with trips, revenue hours and span per day type. |
| `GET /api/crosswalk` | PRT's current → proposed route mapping. A labelling aid; no served number goes through it. |
| `GET /api/meta` | Feed versions, sample dates, periods, caveats. |

## Before it goes public

1. **Settle the proposed feed's provenance.** It exists at no URL, and how it
   reached this repo is not recorded anywhere — its `feed_info.txt` is stamped
   2026-08-11 and names PRT as publisher, which is evidence about the feed, not
   about how we got it. `DATA_SOURCES.md` records the provenance as
   unestablished and says that must be fixed before the numbers are cited
   publicly. Serving it publicly publishes
   PRT's unreleased timetable at the finest possible grain — every departure at
   every stop. This is a permission question, not a technical one.
2. **Draw the microtransit zones.** `remix_project.json` carries 10 on-demand
   zone polygons. `analyze_coverage_area.py` now counts them — 23% of the area
   losing all fixed-route service is inside one — but nothing at stop level
   does, so a place slated for on-demand service still reads as a plain loss in
   the map. The polygons are simple GeoJSON in the project file and each carries
   its hours and vehicle count, so drawing them is cheap; label the vehicle
   count, since 1–3 vans per zone is what distinguishes a fallback from a
   replacement.
3. **Decide on address search.** Today the input is a map click. Geocoding means
   an external service (Nominatim's usage policy, or a self-hosted index).

## Known gaps

- No route shapes on the map yet; both feeds have `shapes.txt`.
- The change layer can only draw locations, so it shows added coverage only
  where a proposed stop lands somewhere with no bus today. Coverage gained
  across an *area* is `analyze_coverage_area.py`'s 100 m raster, and nothing
  serves it yet — that is the polygon layer, still to build.
- Stop-name and neighbourhood search is not built (the DB has FTS5 available).
- `nearest_place_label` uses PRT's `HOOD`/`MUNI` labels, which contain errors up
  to 40 km (caveat 4). It is a display hint; nothing computed depends on it.
