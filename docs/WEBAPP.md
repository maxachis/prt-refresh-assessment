# The web app: "what changes here?"

A map that answers, for any point in Allegheny County, what the Bus Line Refresh
does to the buses within a short walk of it — measured from real timetables on
both sides, by the same code. A third view drops the walk radius and colours the
street network itself, by whether any bus still runs on each block.

It exists because the comment period generates one question far more than any
other, and it is not a question the answer documents can hold: **not** "what
happens to the 61C", but "what happens to *my corner*". `docs/answers/locations/`
answers that one place at a time by hand. This answers it for every place.

## Status

Deployed and reachable at <https://prt-refresh.lemaliconsulting.com> (since
2026-08-19), and it still runs locally — `refresh serve` binds `127.0.0.1` by
default. The proposed feed's provenance, which is what had blocked a public
deploy, is recorded in `DATA_SOURCES.md`: PRT sent the feed to PPT on request
and PPT passed it on.

Reachable is not announced. Nobody has been pointed at that URL, and item 1 of
[Before it goes public](#before-it-goes-public) — asking PPT whether serving the
timetable itself is expected — is still open. See [`deploy/README.md`](../deploy/README.md)
for the box.

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
| `frontend/surface.ts` | The magnitude surface — the same layer as a continuous field. |

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

## The magnitude surface

The dots answer "what happens at my corner" everywhere a corner exists. They
cannot do two things: read as a *shape* — 5,900 points at county scale is a
scatter, not a picture — and show ground the plan adds a bus to, since a place
with no stop today has no dot to colour.

The surface is the same measurement on `analyze_coverage_area.py`'s 100 m
lattice, where a cell is a location that need not have a stop on it. That is
not a new method: it is how the published area figures in
`data/coverage_area.csv` were already measured, and that script's docstring
carries the reasoning — *a rider stands in a place, not at a stop id*.

48,526 cells at 400 m (485 km² of ground), 18,786 at 150 m. About a minute per
radius to build, 1.3 MB on the wire and 198 KB gzipped.

Five decisions worth keeping:

1. **It is the same lattice, not a similar one.** The origin, cell size and
   projection are `analyze_coverage_area.py`'s, so counting served cells
   reproduces the published km² — 405.15 against a published 405.06 for the
   proposed network at 400 m, a 0.02% difference that is entirely the two
   distance metrics (the lattice fixes its longitude scale at the county
   centre; the app scales by each query point's own latitude). The app's metric
   wins, because a cell that disagreed with the panel behind it is the worse
   error. `test_surface_area_reproduces_the_published_km2` pins this at 0.2%.
2. **Precomputed through `side_at_place`**, like the dots and for the same
   reason: a cell and the panel a click opens on it cannot disagree.
   `test_a_cell_agrees_with_the_panel_it_opens` checks it directly.
3. **The ramp is a display choice and the buckets are not.** The ramp passes
   *through* the bucket colours at the published edges — halved is the same
   orange here as on the dots — but the surface never reports a bucket tally.
   Those counts belong to `docs/answers/`; a continuous ramp has none to
   publish, and blurring the two would let a reader quote a figure off the
   surface as though it were published.
4. **Total loss and new service are steps, not ramp ends.** `gone` is a
   categorical outcome, not "a lot less". Fading it in from "quartered" would
   bury the plainest finding on the map in a gradient.
5. **Opacity carries magnitude, and antialiasing is off.** Most ground keeps
   roughly what it has, so a field at one opacity is mostly neutral with the
   real changes competing against it; fading the middle of the ramp lets the
   extremes carry while the covered ground stays visible to orient against.
   Antialiasing off is not a performance tweak — abutting squares' antialiased
   edges blend with the basemap rather than each other, drawing a pale seam
   along every shared edge and laying a visible 100 m mesh over the county.

**Area and locations are complements and the UI has to say so** (convention
10). The plan reads as roughly service-neutral per location and as 12% less
covered ground; either alone is a talking point rather than a finding. So the
view control offers *Both*, the legend shows the location counts and the area
km² together, and the area line says "of ground in view, not of people" — a
square kilometre of hillside paints exactly like a square kilometre of
Brookline.

## The street layer

The dots and the surface both measure from a walk radius. Neither can answer
"does my street keep its bus", because a location that keeps full walk access
can sit on a block whose own bus is gone — the trip moved one street over. The
*Streets* view answers that directly, and it is the only layer here with no
radius at all: a corridor is a piece of pavement, not a catchment.

It is `analyze_corridor_change.py` carried over verbatim — 4,933 runs, 583 KB
on disk, ~290 KB per day type on the wire. Unlike the dots and the surface it
is **not** precomputed through `side_at_place`, and that difference matters
when reading the code: the "a dot and the panel behind it cannot disagree"
guarantee governs those two layers and has no counterpart here, because this
layer answers a question `/api/place` never asks.

Four decisions worth keeping:

1. **Any bus, not which bus.** A street is served if a single trip runs on it;
   route numbers never enter the classification. That is what makes a corridor
   layer compatible with the never-compare-route-N-to-route-N rule — there is
   no route to compare.
2. **Matching is tolerant, and it has to be.** The two feeds digitise the same
   street a few metres apart, so a key matches within about 35 m and a 45°
   heading band. An exact test renders a real corridor as an alternating
   stripe of kept and lost, which reads as a finding and is an artefact.
   Heading matters as much as position: without it a street matches the cross
   street standing in the same block.
3. **Kept is grey, and it is drawn.** 897.8 of 1,239.3 weekday km are kept, and
   an invisible kept network costs the view its point — a red segment with no
   network behind it gives no way to tell an isolated block from a severed
   trunk corridor. Kept also stays *desaturated* rather than taking the
   surface's cooler dead-band grey: added is a blue, and a blue-grey kept
   beside it makes "gains a bus" and "keeps its bus" one hue family. Lost and
   added keep the surface's own red and blue.
4. **The legend totals are citywide, not in-view**, unlike every other legend
   in this app, and it says so on the legend. There is no radius to scope them
   with, and letting the reader carry the in-view habit over would silently
   change what the numbers mean between views.

**Pavement and access are complements** — convention 11, the same shape as
convention 10 one unit further down. The street view's 22.4% weekday loss is a
bigger-sounding number than the surface's 12% area loss and measures something
narrower, so the legend carries the caveat inline and the panel explains the
distinction whichever view is open.

## API

| Endpoint | Returns |
|---|---|
| `GET /api/place?lat=&lon=&radius=` | Before and after at one point, all three day types. The app's purpose; everything else is navigation. |
| `GET /api/change?radius=` | The citywide layer: every location bucketed, all three day types, columnar. Radius must be 400 or 150 — it is precomputed. ~300 KB, 77 KB gzipped. |
| `GET /api/surface?radius=` | The magnitude surface: every covered 100 m cell, all three day types, columnar as lattice indices. Radius must be 400 or 150. ~1.3 MB, 198 KB gzipped. |
| `GET /api/corridors?day=` | Every street run kept, lost or added for one day type, with citywide kilometres by class. No radius — a corridor is pavement, not a catchment. ~290 KB weekday. |
| `GET /api/stops?side=&lat=&lon=&radius=` | Stops one network puts inside the radius. |
| `GET /api/routes?side=` | Bus routes with trips, revenue hours and span per day type. |
| `GET /api/crosswalk` | PRT's current → proposed route mapping. A labelling aid; no served number goes through it. |
| `GET /api/meta` | Feed versions, sample dates, periods, caveats. |

Two pages, not one endpoint each: `GET /` is the map and `GET /findings` is the
equity brief.

## The findings page

`/findings` is the one part of the site that is not the map, because the
question it answers has no location. "Who does this fall on?" is a rate for a
group divided by the county's own rate for the same group's universe — a
number about a population, not a place — and a map cannot draw a ratio. Nor
would a choropleth of it be honest: 83% of Allegheny's block groups are
unchanged, so the picture would be a demographic base map with a scatter of
colour on it, and every reader would infer the cause from the base map.

So it is a document, and a pre-rendered one. `build_equity_brief.py` writes it
straight from `data/equity_change.csv` and `data/equity_places.csv`, the same
files `docs/answers/EQUITY-*.md` cite, into
`src/refresh/web/static/findings.html` — committed like `static/app.js`, for
the same reason: the box serves the commit it checks out. Nothing about the
page is per-request, and no number on it goes through `query.py`. Rebuild it
with `python3 build_equity_brief.py`, which also writes the standalone
`docs/equity-brief.html`.

**To change the words, edit `equity_brief_body.html` and rebuild.** That file
is the brief's prose — headline, every paragraph, both figure captions, the
"what this does not say" box, the footer — as a plain HTML fragment. The
charts and tables arrive through `<!--slot:name-->` comments, chosen over `{}`
or `$` templating because a comment cannot collide with anything a writer
might type. A slot with no builder, or a builder with no slot, raises rather
than shipping an HTML comment where a chart should be. Editing the two output
files directly does nothing: the next build overwrites them.

Some sentences quote figures as literal text — "1.40×", "182 lose coverage",
"about 12% less ground". Those are typed, not interpolated, so they do not
follow the CSVs the way the charts do; re-read them whenever the analysis is
re-run.

The two copies differ only in chrome. The served one pins `data-theme="dark"`
and carries a bar back to the map, because the map is dark-only and a light
document opening off it reads as a different site; the standalone file follows
the reader's own setting, since it has no site around it.

## Hosting it

[`deploy/`](../deploy/) is a Hetzner + Caddy kit: `./deploy/provision.sh` creates
the box, checks out a pushed commit, builds the database there and starts the
service on `127.0.0.1:8000`; `deploy/setup-caddy.sh` then puts it behind a
hostname with automatic HTTPS. Until you run the second one, the only way in is
an SSH tunnel, which is also how you show it to a few people first. The kit is
small on purpose — nothing here collects data, so there is no replica, archive
or heartbeat to maintain. See [`deploy/README.md`](../deploy/README.md).

## Before it goes public

1. **Confirm that republishing the feed's contents is expected.** Provenance is
   settled — PRT sent the feed to PPT on request and PPT passed it on
   (`DATA_SOURCES.md`) — so the numbers are citable. What is a different act is
   *serving the timetable itself*: this app exposes every departure at every
   stop of a feed PRT publishes at no URL, and sending a file to a requester is
   not the same as publishing it. One question to PPT settles it. Permission,
   not a technical matter.
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

- **A "heat route map" — corridors coloured by change — is the alternative
  visualisation to explore next**, and is deliberately not built. Both feeds
  carry `shapes.txt` (483k points current, 121k proposed), and transit change
  is linear: it happens along streets, not in blobs, so ribbons would read more
  naturally than either dots or a field. Two things have to be settled first,
  and neither is mechanical. **Shapes are not comparable across networks** —
  the plan re-splits corridors, so the proposed 60X has no counterpart line to
  diff against (convention 1); both sides' geometry would have to be snapped
  onto a shared spatial reference, for which the 100 m lattice already works,
  accumulating trips per cell per side deduplicated by trip. And **buses
  passing is not service you can board**: a cell on a busy stretch with no stop
  would light up as well-served, so the layer either says "through service" in
  as many words or restricts itself to segments within a walk of a stop — at
  which point it is the surface again, sampled along lines. Estimated 2–3 days,
  most of it in those two questions rather than in the drawing.
  *Max chose the magnitude surface first and asked for this to be held as an
  alternative to explore later; it is not abandoned.*
- The 10 on-demand microtransit zones are still undrawn — see item 2 under
  *Before it goes public*. This matters more now the surface exists: 23% of the
  area losing all fixed-route service is inside a zone, and the surface paints
  every square metre of it plain red.
- The equity findings are a page, not a layer: nothing on the map is
  coloured by who lives there, and per convention 12 a block group is
  covered or not at a single point, so a map of it would overstate its own
  precision. `/findings` is the answer for now.
- Stop-name and neighbourhood search is not built (the DB has FTS5 available).
- `nearest_place_label` uses PRT's `HOOD`/`MUNI` labels, which contain errors up
  to 40 km (caveat 4). It is a display hint; nothing computed depends on it.
