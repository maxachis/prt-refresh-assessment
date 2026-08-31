# The web app: "what changes here?"

A map that answers, for any point in Allegheny County, what the Bus Line Refresh
does to the buses within a short walk of it — measured from real timetables on
both sides, by the same code. A third view drops the walk radius and colours the
street network itself, by whether any bus still runs on each block. A fourth
asks a different kind of question entirely: from every place at once, can a
rider still reach Downtown, Oakland or a point you pick **without
transferring**? A fifth puts a clock on it: from a point you click to a
destination you choose, **how many minutes does the trip take** on each
network, waiting for the bus included?

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
data/raw/proposed_gtfs/    ─┘      (stdlib)         (43 MB, ~2.5 min)     read-only
```

| Piece | What it is |
|---|---|
| `build_webdb.py` | Pipeline script, standard library. Both feeds → SQLite. |
| `src/refresh/query.py` | **The analysis.** Pure functions, ports of `analyze_coverage_change.py`. |
| `src/refresh/web/app.py` | Thin FastAPI skin. No arithmetic. |
| `frontend/*.ts` | Vanilla TypeScript, esbuild → one `app.js`. MapLibre vendored, no CDN. |
| `frontend/change.ts`, `legend.ts` | The citywide layer and the legend that summarises and filters it. |
| `frontend/surface.ts` | The magnitude surface — the same layer as a continuous field. |
| `frontend/oneseat.ts` | The one-seat layer and its destination picker. |
| `frontend/oneseatpanel.ts` | The one-seat view's own answer panel — a verdict about a destination, not a count at a point. |
| `frontend/statebar.ts` | The line above the panel saying which question the panel is answering. |
| `frontend/sheet.ts` | The phone layout: the answer panel as a bottom sheet over a full-height map. |

The stack follows `pgh-ghost-bus` (kept as a gitignored reference checkout at
`pgh-ghost-bus/`): uv, `src/` package, an optional web extra, read-only SQLite,
esbuild-bundled TypeScript, vendored MapLibre, pytest + vitest.

### Why the one-seat view has a panel of its own

Locations and Surface share one panel because they are one measurement drawn
two ways: a quantity of service, answered at a point. One-seat is a different
unit (convention 13) — a connection, with no day type and no clock — and while
it shared that panel the view had two markers of visibly unequal weight. The
red origin rewrote the whole panel; the dark destination, which recolours every
dot on the map, changed one row most of a scroll down. A reader could
reasonably conclude the destination marker did nothing, which was Max's report
and the reason this exists.

So `frontend/oneseatpanel.ts` makes the destination the subject: it is the
heading, and the headline under it is the verdict — keeps, gains, loses — in
the map's own colours rather than a pair of trip counts. Both sides' route
lists stay, because "loses its one-seat ride to Downtown" is a sentence
somebody will screenshot and it should arrive checkable; but they are now
diffed into kept / lost / gained, which the server had been computing and
nobody was showing. At Downtown that is the difference between reading fourteen
route numbers against fourteen and reading three short lists.

Two things it deliberately does not do. It does not drop the service figures —
"loses the Oakland ride, and the corridor drops from 599 buses to 587" is one
thought, so they ride along collapsed, with the trip counts in the summary line
so the fact is on screen closed. And it does not become a second answer: it is
rendered from the same `/api/place` response the shared panel uses, dispatched
by `main.renderPanel`, so switching views redraws rather than refetches and the
two can never answer differently. Travel time already worked this way and is
unchanged.

### Why the controls sit on the map and the panel is only content

Every control — walk radius, view, one-seat day, destination,
day type — changes what the map draws, and none of them changes what the panel
is a panel *of*. They ride on the map for that reason, docked as a strip of
groups along its top edge, and the side panel holds nothing but the answer for
the point last clicked. It collapses to a rail, which gives the map the window.

The move was forced by the phone layout rather than chosen for tidiness. With
the controls stacked in the panel, a 390 px screen showed four rows of buttons,
a clipped fifth, and no answer text at all above the fold; the map got the
remaining 55% of the screen, most of which the legend covered. On a phone the
strip is not a strip — see below — but the principle holds in both layouts:
controls belong to the map, the panel holds only the answer.

What that costs is proximity: the day type and the walk radius used to sit two
centimetres above the numbers they were measured at. **The state line puts that
back** (`frontend/statebar.ts`), pinned above the panel where it cannot scroll
away — "One-seat ride to Downtown · any day · 400 m walk". That is not
decoration. The one-seat view can be showing either of two different
measurements, only one of which is what `data/oneseat_change.csv` publishes, and
convention 13 requires anything quoting a one-seat number to say which; the
legend says it for the map, and this says it for the panel, in the same words.

### What the panel says, and what the drawer says instead

An answer used to arrive with about 350 words of prose around twenty numbers:
five caveat blocks, the longest 96 words. Every sentence in them was there for
a reason, and none of them was being read.

The split is by what a sentence *does*, not by how long it is. A clause that
changes how the number beside it reads stays on the panel, cut to one line —
boardings are today's stops only, a one-seat ride has no frequency in it, the
residents figure is the whole place on any day of the week, two route lists
differ by renumbering rather than by service. Take any of those away and the
number above it means something else. Provenance — the May 2025 vintage,
unlinked trips, the ACS weighting, the file that reproduces the ranking —
qualifies a number without changing what it says, so it is written once in the
method drawer and reached from the figure by a `method` link, which opens the
drawer scrolled to that entry and marks it. The whole panel is now under 220
words, pinned by a test, because prose grows back one useful sentence at a time.

One thing deliberately did not move. PRT's own disclaimer — unofficial totals
that may understate ridership by up to 30% — stays visible next to the number,
here and in the legend, because this audience screenshots figures off the map
and a caveat behind a click is not in the screenshot.

Collapsing the prose behind disclosure triangles was considered and rejected
for that same reason: a closed `<details>` fails the test the caveats exist to
pass, and five of them are their own kind of clutter.

### The phone layout: one window, three things that wanted it

A desktop gives the map and the panel a column each and they never compete. A
phone has one short window, and the first attempt divided it — 58% map, 42%
panel — which made both useless at once. Measured on a 390x844 screen: the map
got 490 px of which the legend covered 250x277 (36%), and `elementFromPoint` at
the centre of the screen returned the legend, so the one point a reader taps
first was the one point that was not the map. The panel got 354 px of which the
masthead took 138 and the state line 38, leaving under 180 px for the answer.
Meanwhile the toolbar held 1,135 px of controls in a 322 px window with the
scrollbar hidden, so the view switcher — the control the whole app turns on —
was off the right edge with nothing to say it existed. A landscape phone was
worse still: the breakpoint tested width alone at 820 px, so an 844x390 handset
fell through to the desktop layout and got a toolbar wrapped into four rows over
about 60% of the map.

Nothing is divided any more. The map is the whole window and the three things
that were fighting over it take turns:

- **The answer is a bottom sheet** (`frontend/sheet.ts`) with three stops —
  peek, half, full. Peek carries the state line, the place name and the
  before/after figures over a nearly whole map; a click on the map raises the
  sheet to half, but only ever upward, so a reader comparing two corners at full
  height does not have it drop under them on the second click. Drag it anywhere
  and it settles on the nearest stop, or tap the handle to climb a stop at a
  time and wrap back to the peek. The masthead is hidden at the peek: a reader
  peeking at an answer needs the site's title least of anything on that strip,
  and the subtitle and feed vintage move into the methods dialog rather than off
  the site.
- **The toolbar is a mode you enter**, opened from one button that says which
  view is up and closed by the scrim, the button or Escape. It is the same DOM
  as the desktop strip — every handler applies to both, so neither layout can
  gain a control the other lacks. It does not close when a control is used,
  because these controls interact: choosing the one-seat view is what makes the
  destination and one-seat-day rows appear.
- **The key opens folded** to its head line, which is the sentence carrying the
  count, the day and the walk radius, and it rides above the sheet rather than
  over the middle of the city. Folding happens on the layout *flip*, not once at
  startup, so rotating a tablet into the phone layout gets the same treatment a
  phone-sized load does.

Two details are load-bearing. The breakpoint is declared once, as a `--compact`
custom property in the stylesheet, and read back from TypeScript; a `matchMedia`
copy of the query would drift into the sheet's geometry and its appearance
disagreeing about whether there is a sheet at all. And the map keeps bottom
padding under the sheet, which is why moving the sheet needs no `map.resize()` —
the container is always the full window and only the usable middle of it moves.
That matters beyond tidiness: a MapLibre canvas resized behind the map's back
puts clicks on the wrong coordinates, and on this map a wrong coordinate is a
wrong answer rather than a wrong pixel.

The tile attribution moves up with the sheet. It is a condition of using
OpenFreeMap's tiles, and the sheet's first version parked itself exactly on top
of it.

### Why departure times are stored, not trip counts

A rider standing at a corner wants the gap between buses, and a gap cannot be
recovered from a count — eight trips in a period is a bus every 22 minutes, or
eight buses in one hour and nothing after. So the stored unit is one row per
(side, stop, route, direction, day) carrying that combination's actual departure
minutes, and every count, period bucket and gap is derived at query time. That
is what lets the walk radius be a control in the UI instead of a rebuild.

It is also what keeps the file small: one row per stop_time would be ~2.5M rows;
packing times into the row that owns them is ~54k.

### And why the router carries a second copy of both feeds

Departure lists say how *much* service a place has. They cannot say how long a
rider's trip takes, because the thing they threw away is exactly the thing a
journey needs: which departures belong to the same vehicle, and in what order
that vehicle calls. So `build_webdb.py` reads both feeds twice, and the
`journey_*` tables hold the second reading — `gtfs.load_patterns`' own tuples,
written down, so the app can build a router's timetable without opening a GTFS
zip. 1,082 patterns, 26,660 trips, ~6.8 MB.

They break three of the house rules the tables above follow, all three
deliberately, all three convention 14: the times are **raw minutes** rather
than folded onto the 4:00–28:00 axis (folding mid-trip makes a vehicle running
through 4am arrive before it left), **every mode is in** including the T and
the inclines (a journey is not a quantity of service), and each trip keeps
**its own running times** rather than a per-pattern average (both feeds widen
end-to-end times at the PM peak, and that widening is part of what the
comparison measures). Separate tables rather than flags, for the same reason
the one-seat index is separate: widening the universe here must never widen it
under a published service number. `tests/test_journey_layer.py` checks the
carry-over pattern by pattern and trip by trip against the feeds, and checks
that a timetable rebuilt from the database finds the same journey as one built
from the feed.

`/api/journey` serves them. The query layer builds a router's timetable from
those tables — one per (network, day type, transfer walk), cached, ~0.3 s each
— and answers two dropped pins with a profile over every ready-minute of the
published window, on both networks and at both transfer radii. It is the only
slow endpoint on the site and the only one with nothing precomputed: a few
tenths of a second for a well-served pair, a few seconds for a badly served
one, because both ends are points the reader chose. The **Travel time** view
reads it; see [The travel-time view](#the-travel-time-view).

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
4. **The legend counts two things, and says which.** A Locations/Riders switch
   inside the key flips every count from dots to the boardings observed at
   them. See below — it is the one control here that changes what the numbers
   mean rather than which question is asked.

### Locations or riders: the legend's second denominator

`?weight=riders`. The same dots in the same buckets, counted by PRT's May 2025
boardings instead of by place — the numbers come from `stop_place`, carried
into `refresh.db` from `data/coverage_change.csv`, and ship in the change
payload as a fourth field per day type (`weekday_riders`, …) so switching the
day moves the riders with the buses.

It exists because the two denominators answer the same question in opposite
tones. Citywide on a weekday at 400 m, the plan strands **593 locations** —
and those locations carry **488 of the system's 67,619 daily boardings**,
0.7%. The first sentence is the reason to comment on the plan; the second is
the reason PRT drew it. Convention 15, and neither is quotable alone.

Three things the drawing has to get right, all of them about the same
asymmetry:

- **A location with no ridership record is not a location with no riders.**
  The 121 new-coverage points have no bus today, so no observed boardings can
  exist for them, ever. They travel as `null` rather than 0
  (`query.point_boardings`), are excluded from every total, and are reported
  as a sentence — "7 locations in view gain a bus where none stops today" —
  because a 0 in the *new service* row would read as a finding about the
  plan's gains. A bucket whose in-view locations are all unmeasured shows an
  em dash, not a zero.
- **This weighting can measure what is at risk and never what is gained**, and
  the legend's footer says exactly that whenever it is on.
- **The caveats travel with the number, not with the methods list.** Unlinked
  trips rather than people, and PRT's own up-to-30% understatement, are
  rendered under the counts — this is the figure most likely to be
  screenshotted out of context.

**The panel carries the same figure for one point.** Under "stops within
400 m", where it is the same set of stops read as riders rather than as
service: *4,714 on an average weekday, today only*, with the count of stops in
the circle the usage extract has no figure for said out loud beside it — 11 of
29 in the Golden Triangle, and treating those as zeros would quietly understate
every busy place. It is kept out of the today → proposed headline on purpose:
there is no proposed half and never can be, so an empty column there would read
as a fall to zero. Beside it the panel keeps the one clause PRT asks to travel
with the figure everywhere — unofficial totals that may understate ridership by
up to 30% — and sends the rest to the method drawer.

**And the panel says who lives in the place, once.** Under the service
figures, a "who lives here" block: *1,923 residents lose every bus · 0 gain
one*, for the whole named place rather than for the walk radius above it.
Three things separate it from everything else on the panel. It is a **place** figure — a point has no population worth
quoting, and a count inside the walk circle would be a fourth people-number
disagreeing with the map key's reading of the same spot. It answers on **any
bus in a week**, the measure `analyze_equity_places.py` ranks on, so it does
not move with the day switch — which it says on screen, because a figure that
ignores a switch directly above it otherwise looks broken. And it is
**Allegheny only**: outside the county
the equity work never asked, so the block is absent rather than showing a zero
— while inside it, a place with no published row shows a real zero, "nobody in
Whitehall borough loses or gains every bus under the plan", because the file
holds every block group that changed.

The lookup is by the label the heading already prints, weak as convention 6
says that label is, so the two can never name different places. `refresh.db`
carries the rollup in `place_population`, keyed on the label with PRT's
" (Allegheny, PA)" suffix stripped — the census work and PRT spell the same
borough differently, and Trafford arrives under both spellings because the
borough straddles the county line.

Deliberately *not* done: sizing the dots by boardings. The median stop has 1.95
weekday boardings and the top 10% of stops carry 73% of the total, so a
proportional radius is a dozen discs and five thousand invisible specks —
misleading in the direction of "nothing is happening out here". The skew lives
in the counts, where it can be read, rather than in the geometry, where it
cannot.

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
km² together, and the area line said "of ground in view, not of people" — a
square kilometre of hillside paints exactly like a square kilometre of
Brookline. That sentence is now a switch: see below.

### Ground or people: the surface's second denominator

`?surfaceunit=people`. The same cells in the same viewport, summed by who
lives in them instead of by how much ground they cover — the answer to the
hillside-versus-Brookline problem the line above names.

**Where the numbers come from.** Every populated census block (33,131 of them)
is placed on the surface's own lattice, carrying its share of its block
group's ACS population. Coverage is decided **at the block's point, not at the
cell's centre**, which is the one rule here worth defending: the citywide
totals then *are* `data/equity_change.csv`'s — 68,989 Allegheny residents
losing all bus service on a weekday at 400 m, 20,223 gaining it — rather than
a second answer 3% away from the published one. `tests/test_population.py`
pins them. One figure to keep straight: `/findings` prints the *week-any* row
— the same 68,989 losing, but 20,095 gaining — because the key answers per day
type and a place that gains only weekend service passes a week-any test and
fails a weekday one.

The price of that rule is a deliberate mismatch inside one view: a cell the
surface colours *loses all service*, decided at its centre, can hold residents
this counts as keeping a bus, decided at theirs. The colour describes the
ground; the number describes the people. Any other arrangement puts a figure
under the reader's cursor that the findings page contradicts.

**Four classes, not the ramp.** People are counted as losing all service,
gaining it, keeping a bus, or having none either way — coverage, not
magnitude, because that is the question the published equity work answers. The
fourth is not padding: it is the denominator, and without it a "1,200 people
lose their bus" line has nothing to be read against.

**What it is not.** Ecological, per convention 12 — it describes the places
people live, not whether any of them ride, and a block's residents all sit at
one point. And it is 2020 census population against a 2026 network, which is a
different vintage from everything else on the site.

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

## The one-seat view

The first three views all measure a QUANTITY of service — trips within a walk,
square kilometres of covered ground, kilometres of street with a bus on it.
This one measures a CONNECTION: from each location, does some single route
serve both here and the destination? It is `analyze_one_seat.py`'s published
question — the four `*-ONE-SEAT-*` answers in `BASE_CAMP.md` — asked at every
location rather than per place, and with the destination chosen by the reader.

Downtown and Oakland are built in. Anything else is a dropped pin, and the
whole county repaints for it.

### Five ways it differs from every other layer, all of them load-bearing

1. **It counts rail, and nothing else here does.** Every service figure in this
   app is bus only, because the T and the inclines are outside the Refresh and
   putting unchanged service on both sides of a change figure dilutes it. A
   one-seat ride is not a change figure. Drop the T and Beechview reads as
   losing a Downtown ride the Blue Line still runs, while Bon Air appears to
   *gain* one it has had all along — control 2 of `analyze_one_seat.py`, found
   there the same way. So the layer reads its own all-mode index (`reach_stop`),
   a separate table rather than a flag on `stops`, so that widening the
   universe here cannot widen it under a published number.
2. **It is route-based, which convention 1 normally forbids.** The convention
   forbids comparing route N to route N; this never does. It intersects the set
   of routes serving a location with the set serving the destination, both
   recomputed independently per network, so renumbering cannot manufacture a
   loss: the 61A becoming the 61X moves both sets together.
3. **Its default has no day type, and a day type can be asked for beside it.**
   A route serves a location or it does not — the published method, what keeps
   the default comparable to `data/oneseat_change.csv`, and what the legend
   says when it is on. The **one-seat** control switches to the day the
   toolbar is showing, which restricts both ends to routes that call there on
   that day type, resolved per (stop, route, day) rather than per route: a
   weekend pattern that skips a corner does not credit that corner with a
   Sunday bus, which is exactly the S-variants' case. It is an opt-in and not
   a fourth day button, because the two are **different measurements** — the
   day-typed counts are not the published ones, and the legend and the panel
   both say which one is on screen. It exists because the plan's weekend cuts
   are real: 152 locations keep every weekday bus and lose the weekend
   outright, and the day-free answer says yes to all of them. Downtown at
   400 m keeps 4,504 one-seat rides on the published measure and 3,642 on a
   Sunday.

   What neither answers is *how often*. A ride surviving on a Sunday may still
   be hourly, and the panel's day-by-day counts are where that question goes.
4. **It has no travel time.** A route touching both ends is a one-seat ride
   however long it takes; 90 minutes around three sides of the county counts
   the same as 12.
5. **The destination takes the same walk radius as the origin.** The published
   script uses a fixed 200 m at the destination against a *place* at the origin;
   here the reader picks both ends and moves one radius control, so both ends
   use it. *Max chose this.* For the two named destinations it turns out to
   change nothing — Downtown reaches the same 79 current and 69 proposed routes
   at 200 m and at 400 m, Oakland the same 23 and 25, because a district's seed
   cloud is dense enough that widening each seed's circle finds nothing new. So
   the Downtown and Oakland verdicts rest on exactly the published route sets,
   and `tests/test_oneseat.py` checks that against the CSV rather than assuming
   it. Where the radius bites is a dropped pin, which is one seed with nothing
   to saturate it.

### What a destination is

A **set of seed points**, which is what lets a district and a pin share one
definition. Downtown is the 44 stops PRT labels Central Business District and
Oakland the 93 across its four neighbourhoods, both put through
`analyze_one_seat.py`'s outlier filter (convention 6) — PRT labels two stops in
Braddock "Westwood", 16 km out, and an unfiltered cloud would put a piece of a
district wherever a label went wrong. A pin is a set of one.

Seeds come from the **current** network for both sides. A destination defined
per network would move under the plan, and a route stopping one block from
where the old definition ended would read as a lost one-seat ride.

Districts get no map marker, deliberately: 44 stops spread over a neighbourhood
are not a point, and one pin would invite the map to be read as though they
were. A dropped pin does get one, because it is a point.

### Why an arbitrary destination is affordable

The expensive half of a one-seat answer — *which routes can be boarded here* —
does not depend on where the reader is going. So it is measured once per
location per side per radius at build time (`point_reach`), and every
destination picked afterwards is a set intersection over stored strings. The
county repaints in well under a second, against the ~20 s `compute_change`
takes. The named destinations' own route sets are precomputed too
(`destination_reach`), because Downtown is 44 seeds and Oakland 93 and
measuring them live would put ~270 spatial queries in front of every click.

### Presentation decisions

- **The point set is the change layer's.** Same dots, same published/new-
  coverage split, same two radii — a reader switching views is not also
  switching which places are on the map.
- **The palette is borrowed, not invented.** Lost is the surface's red and
  gained its blue, keeps the street layer's desaturated grey, exactly as the
  street layer borrowed them. Losses and gains take the same dot size, per the
  standing rule that overstating losses discredits the real ones.
- **The destination itself is not a verdict.** A place needs no one-seat ride
  to itself; `analyze_one_seat.py` drops the anchor districts outright, and
  this layer gives them a fifth status in a neutral near-black rather than
  letting Downtown join the "keeps" tally and inflate it by its own size.
- **"No ride either way" is drawn, faintly.** For Oakland it is more than half
  the county, and leaving it off would make the map's empty half read as
  missing data rather than as the finding: most of Allegheny cannot reach
  Oakland without transferring, before or after.
- **The verdict always arrives with route numbers**, in the hover text and in
  the panel. "Loses its one-seat ride to Oakland" is a sentence somebody will
  screenshot, and it should be checkable.
- **The panel carries the verdicts whichever view is open**, because a corner
  can keep every bus it has and still lose the ride that got it to Oakland
  without changing. A dropped pin joins Downtown and Oakland there rather than
  replacing them.

### Citywide, weekday, 400 m

| destination | loses | gains | keeps | none either way | at it |
|---|---|---|---|---|---|
| Downtown | 864 | 148 | 4,504 | 308 | 48 |
| Oakland | 486 | 384 | 1,704 | 3,139 | 159 |

At 150 m: Downtown 1,188 lose and 205 gain; Oakland 528 lose and 326 gain.
Counts are locations, not people — the same caveat the change layer carries.

## The Places view

The one view whose unit is a **named place** rather than a point, a cell, a
street or a trip. It answers "which places does this plan treat worst", which
is the question a public comment is actually written about, and it is the only
view a reader can quote without first choosing a location.

It is a ranked list beside a choropleth, and they are the same data. The list
orders every place the plan changes by residents who lose all buses, or by
that count as a share of the place's own population — both orders are a click
apart because they disagree about who is worst treated, and only the count
order existed anywhere before. Reserve township is tenth by count and second
by share.

**A place is a boundary, never a label.** Allegheny's 130 municipalities and
Pittsburgh's 90 neighbourhoods come from `ingest_boundaries.py`, and a block
group belongs to the polygon its residents sit inside. This replaced naming a
place by the nearest labelled PRT stop, which moved a third of the county's
residents when it was fixed and is the subject of convention 6. Pittsburgh
city has no polygon on this map: every acre of it is inside one of its own
neighbourhoods, so drawing it would lay one share-of-nobody over the ninety
that hold its people.

**The fill has three readings and they are not interchangeable.**

| Reading | Colours by | Moves with the day switch |
|---|---|---|
| Map losses | share of the place's own residents who lose all buses | no |
| Map gains | share who gain a bus | no |
| Map service | percent change in the place's own bus trips | **yes** |

The first two are day-free and county-wide, from `equity_places.csv`; the
third is per day type, from `analyze_place_service.py`. That split is stated
on the panel whenever the service reading is active, because a reader
switching days and watching two of three readings ignore it would rightly
read that as a bug. The day toolbar is hidden on this view except in the
service reading, for the same reason.

Losses and gains are shown **one at a time and never subtracted**. Ross
township loses 6,119 residents' service and gains 1,952; a net map would draw
it as mildly negative and hide that thousands of people on both sides had
their service replaced rather than kept. This is convention 10 arriving inside
a single view.

**Two holes in the service ramp, both deliberate.** A place with no bus today
and buses proposed has an undefined percent change, not an infinite one, so it
is left unshaded and named in words instead — one place on a weekday, five at
the weekend. And the ramp is signed on magnitude, so a place at −100% and one
at +1,060% are both in the top band: the colour says direction and roughly how
much, and the tooltip says exactly.

**The tooltip carries the rail flag, and that is not decoration.** Seven places
lose their last weekday bus, and three of them keep a train. Bethel Park goes
from 46 weekday bus trips to none while the Blue, Red and Silver lines call
there all day, so its tooltip reads "Loses all buses on a weekday (46 → 0
trips); the T still calls here." Reserve township's does not, because nothing
calls there. Every service figure on this site is bus-only (convention 16); a
map that could not say which of those seven still has rail would publish a
false sentence about three of them.

Clicking a place selects it in both directions — row to map, polygon to row —
and lights its changed census block groups as points on top of the fill. The
fill says how much of a whole place changed; the points say where inside it.

A share is withheld below 100 residents and drawn as a dash that says why.
Trafford borough's Allegheny part is 16 people, and a third significant figure
on that denominator would discredit the twelve real ones above it.

## The travel-time view

The fifth view, and the only one on the site with a clock. A reader picks a
destination — Downtown, Oakland, or a point of their own — clicks a starting
point, and gets the trip timed on both networks: the median across every minute
they could be ready inside the published weekday 07:00–09:00 window, with the
wait for the bus counted in.

Both pins can be **dragged**, and dropping one re-asks the question rather
than only moving a dot. Comparing two corners is the commonest thing anyone
does here, and clicking each in turn throws the first answer away before the
second arrives. Dragging the *destination* pin turns a named district into a
point of the reader's own — the same thing "pick a point" does, reached by
dragging instead of by arming a mode — and the toolbar re-lights to say so.
Nothing recomputes mid-drag: only the drop asks.

It is the only view that **answers on the click rather than from a layer loaded
in advance**, because both of its ends belong to the reader and there is
nothing to precompute. That costs a few tenths of a second for a well-served
pair and a few seconds for a badly served one, so the panel says what it is
doing rather than dimming and going quiet — and the prompt that stands before
the first click says the same thing, so the wait is expected rather than read
as a hang.

**"To Downtown" here is the published question, not a second definition of
Downtown.** The one-seat view measures against every stop of the district — 44
of them for Downtown, 93 for Oakland — but a journey has to arrive somewhere,
so this view uses the centre of that same seed cloud, which is the identical
point `analyze_travel_time.py` searches to. That is also why the destination
gets a marker here and not in the one-seat view: here the marker is where the
trip actually ends.

What the panel shows, and why each part is there rather than a single number:

- **Both medians and the change**, in the panel's existing blue and orange.
  Slower is red and faster is green, the same way the trip counts are coloured,
  so gains read as loudly as losses.
- **The spread**: the fastest and slowest minute of the window, the typical
  wait, the number of bus changes, and the share of minutes the trip can be
  made at all. The answer is a profile, not a departure (convention 14), and a
  median with no spread under it is quotable and misleading in the same breath.
- **One real trip, leg by leg** — the one that takes the median time, not a
  composite — with the **waits between legs spelled out**. The wait is most of
  what a headway change does to a rider, and leaving it implicit in a gap
  between two clock times would drop the point of the view.
- **The strict transfer radius beside the headline one**, and where the two
  disagree about *which network is faster*, a framed warning above the number.
  The connections are invented — neither feed publishes them — and for a pair
  close to the line the invention decides the direction, so for that pair the
  disagreement is the finding and neither median may be quoted alone
  (`docs/worklog/transfer-radius-favours-one-network.md`).
- **The constants that invented those transfers**, in the note under it, with
  schedule-against-schedule said in the same breath.

The map draws both trips: today's in blue, the proposed one thinner in orange
so that where they share a street both stay visible. A **ride follows the
street its bus drives** — the path comes from the pattern's own `shapes.txt`
entry, sliced between the two stops the leg rides (`journey_shape`, built by
`build_webdb.py`). A **walk now follows the pedestrian network** too — the
sidewalks, alleys and public stairways `refresh.walking.WalkNetwork` routes
on — searched over exactly the distance the clock already charged that leg,
so the line drawn can never be shorter than the trip billed. Walks stay
dashed and thinner, which is what still tells the two kinds apart now that
neither is a straight line. A walk the network cannot route within its
charged distance falls back to the straight line every walk used to draw.
The first and last walks are anchored at the pins rather than at the first
and last stop, since the clock is already counting them.

The drawn path is **for drawing only**. It is thinned to five metres between
stops, and two things happen at each stop that a reader would otherwise see as
the line failing to follow the street. Today's `shapes.txt` **steps to the kerb
and back at every stop** — five metres out and five metres back to the
coordinate it left from, on 14,820 stops — and simplifying cannot remove that,
because the step really is five metres off the zero-length segment between its
neighbours; whole excursions the path leaves and returns from are dropped
instead (`gtfs.drop_curb_pull_ins`), while a bus that drives 60–100 m into a
transit centre and back out keeps its spur. And a stop **moves the drawn line
only when the feed has genuinely put it somewhere else**: within
`gtfs.STOP_SNAP_M` the line stays on the street and the stop is a kerbside
coordinate for a bus driving down the middle, and beyond it — some
proposed-side stops sit 100–350 m off the path their own trips carry, and rail
stations sit beside the track alignment — the line jogs out to the stop rather
than through the wrong block. Nothing between 25 m and 100 m occurs in either
feed, so that threshold sits in an empty gap. Street length is a different
question and is measured on the full shape by `analyze_corridor_change.py`;
nothing may be measured off this one.

The walk-radius control is disabled here, like it is for the street view. A
journey's walking is the router's own (`journey.CONSTANTS`), not a control, and
leaving the buttons live would let them mean nothing silently. The day control
does apply: the published answer is the weekday peak, but a Saturday or Sunday
trip is a fair question and re-times the answer on screen.

## The on-demand zones: removed, 2026-08-25

The app used to carry a violet overlay of 10 proposed microtransit zones,
switchable over any view, with a legend note reporting that 23% of the ground
losing all fixed-route service fell inside one. **It is gone, along with
`/api/zones`, the `ondemand_zone` table and `frontend/zones.ts`.**

PPT reports that PRT is not including microtransit in this proposal. The source
agrees: the polygons live only in PRT's Remix project file, all ten are flagged
`isHidden` and `hideZoneName`, they do not render on the public Remix map, and
no PRT document or feed mentions them. The overlay existed to stop a reader
taking a red patch as a plain loss where the plan offered a van — and there is
no van, so the overlay was arguing the plan's case for it with nothing behind
the claim. Red means gone, everywhere, with nothing qualifying it.

Reasoning and evidence:
[worklog/the-on-demand-zones-are-retracted.md](worklog/the-on-demand-zones-are-retracted.md).

## API

| Endpoint | Returns |
|---|---|
| `GET /api/place?lat=&lon=&radius=` | Before and after at one point, all three day types, plus the one-seat verdicts for the named destinations. Optional `dest_lat`/`dest_lon` adds a dropped pin's verdict; `oneseat_day=` follows the map so a dot and its panel cannot answer different questions. The app's purpose; everything else is navigation. |
| `GET /api/change?radius=` | The citywide layer: every location bucketed, all three day types, columnar, each with the boardings observed there — `null`, never 0, where the plan adds a bus and nothing stops today. Radius must be 400 or 150 — it is precomputed. ~340 KB, 88 KB gzipped. |
| `GET /api/population?radius=` | Residents per 100 m cell, split into lose-all / gain / keep / neither, all three day types. Same lattice as the surface; citywide totals are `equity_change.csv`'s. Radius must be 400 or 150. |
| `GET /api/surface?radius=` | The magnitude surface: every covered 100 m cell, all three day types, columnar as lattice indices. Radius must be 400 or 150. ~1.3 MB, 198 KB gzipped. |
| `GET /api/corridors?day=` | Every street run kept, lost or added for one day type, with citywide kilometres by class. No radius — a corridor is pavement, not a catchment. ~290 KB weekday. |
| `GET /api/oneseat?radius=&dest=` *or* `&dest_lat=&dest_lon=` | Every location's one-seat verdict for one destination, named or dropped. Not precomputed — only its expensive half is, which is what lets the destination be arbitrary. `day=` defaults to `any`, the published day-free answer; a day type restricts both ends and is a different measurement. |
| `GET /api/journey?lat=&lon=&dest_lat=&dest_lon=&day=` | How long the trip takes door to door, both networks, over every ready-minute of the weekday 07:00–09:00 peak. Answered at both transfer radii, with `sign_flips` where they disagree about which network is faster. Nothing precomputed and no radius control — seconds, not milliseconds. |
| `GET /api/places` | Every named place the plan changes, ranked by residents who lose all buses, with each place's own population as the denominator and its share — withheld below 100 residents. Day-free and Allegheny-only. |
| `GET /api/places/{key}` | One place, plus its changed block groups as points. 404 on an unknown key. |
| `GET /api/boundaries` | Every named place's polygon, with the change figures the choropleth colours itself from — residents lost and gained with shares, and bus trips before and after for all three day types with a rail flag beside them. Places wholly covered by finer ones are absent: Pittsburgh city is inside its own 90 neighbourhoods. ~3.5 MB. |
| `GET /api/destinations` | The named destinations, with seed counts and centres. |
| `GET /api/stops?side=&lat=&lon=&radius=` | Stops one network puts inside the radius. |
| `GET /api/routes?side=` | Bus routes with trips, revenue hours and span per day type. |
| `GET /api/crosswalk` | PRT's current → proposed route mapping. A labelling aid; no served number goes through it. |
| `GET /api/meta` | Feed versions, sample dates, periods, caveats. |

Two pages, not one endpoint each: `GET /` is the map and `GET /findings` is the
equity brief.

## Linking to a view, and embedding one

The map's own state lives in its query string, so a view can be sent to
somebody or dropped into another organisation's page. Every control is written
out, defaults included: omitting them would mean keeping a fourth copy of what
the defaults are — they are already in `main.ts`'s initial values and in the
`active` class in `index.html` — and that copy would drift silently into links
that no longer show what they showed. It also makes an embed's `src`
self-documenting.

| Parameter | Value |
|---|---|
| `view` | `dots`, `surface`, `both`, `corridors`, `oneseat`, `journey` |
| `day` | `weekday`, `saturday`, `sunday` |
| `radius` | `400` or `150` (convention 4's two radii) |
| `oneseatday` | `any` — the published day-free measure — or `selected` (convention 13) |
| `weight` | `riders` to count the change map by boardings instead of locations (convention 15). Absent means locations, so a link only carries this when the reader chose it |
| `surfaceunit` | `people` to read the surface as residents rather than km² (convention 12). Absent means ground, on the same only-when-chosen rule as `weight` |
| `dest` | `downtown`, `oakland`, or `lat,lon` for a dropped pin |
| `at` | `lat,lon` — where the reader asked; opens the answer panel |
| `map` | `lat,lon,zoom` — where the map is looking |
| `embed` | `1` — map and key only, for an iframe; see below |

A parameter that fails to parse is ignored and its control left at the default,
because these URLs are meant to be hand-edited by someone building an embed: a
typo is the expected input, not the exceptional one. `dest=pin` is refused
outright — "pick a point" is a mode the next click consumes, and a map that
loaded already armed would spend a reader's first tap moving the destination
instead of answering. The parameters are a published interface the moment
anyone pastes an iframe into a page, so renaming one breaks every embed already
in the wild, in a way that looks to the embedder like the map ignoring them.

A link is applied by pressing the toolbar buttons a reader would have pressed,
not by assigning the variables behind them, so a linked view cannot acquire
fewer side effects than a clicked one. `at` and `map` interact: a point to ask
at fits the map to that point's walk circle, which overrides the camera the
link asked for.

Nothing is written to the address bar until something is used, so an
unadorned visit stays unadorned. Writing is `replaceState`, never `push`: in an
iframe the two share a history stack with the page around them, and pushing
would quietly turn the host page's back button into a control for our toolbar.

Framed, the map also takes **cooperative gestures** — a plain wheel scrolls the
host page instead of zooming the map, and it takes Ctrl+wheel or two fingers to
work the map, with MapLibre saying so on the map the first time a scroll is
refused. It is off when the map is the whole page, where the wheel has nothing
else to do. Nothing blocks framing at the HTTP level: no `X-Frame-Options` and
no `frame-ancestors`, so anyone can embed this, not only whoever was asked.

### `embed=1`: the map, the key, and a way back

An organisation putting this in an article has a column a few hundred pixels
wide and a reader who did not come looking for a transit tool. The answer panel
is the first thing that does not fit: at embed widths it either takes the whole
frame or becomes the phone's bottom sheet, and in both cases the map — the
thing worth embedding — is what disappears. So `?embed=1` keeps the map, the
toolbar and the key, and drops the panel.

```html
<iframe src="https://prt-refresh.lemaliconsulting.com/?embed=1&view=oneseat&dest=oakland&radius=150"
        width="100%" height="520" style="border:0" loading="lazy"
        title="Bus Line Refresh: what changes here?"></iframe>
```

[`docs/embed-example.html`](embed-example.html) is the worked version of that:
a pretend article carrying three live embeds — one dropped in as-is, one
opened at a specific question, one in a 300 px sidebar. Open it from the
filesystem; nothing serves it. It is hand-written, unlike the generated
`equity-brief.html` beside it, so a change to the parameters above is a change
to that file too. It is also the fastest check that a deploy did not break the
embed, since its iframes are against the live site.

What survives is more than it sounds: the key's head line is the summary
sentence for whatever is on screen ("2,688 locations in view · a weekday ·
400 m walk"), the toolbar still switches views, and a click still asks — the
walk circle, the routed trips and the recoloured dots are all map-side answers.
What is lost is the panel's prose and figures.

That loss is why **the corner link is not optional furniture**. It is the only
thing on an embedded map that says whose map it is, and the only route to the
method and the caveats, which this project requires to travel with any number
it shows. It tracks the view: before anyone has clicked it offers the full map,
and after a click it offers the full answer for the place that was clicked,
opening in a new tab at the same question the embed is showing — with `embed`
stripped, so "open the full map" can never open another stripped one.

Three details worth knowing before changing any of this. The mode is asked for
in the URL rather than inferred from being framed: cooperative gestures are a
safe thing to do to anyone who frames us, but taking the answer panel away is
an editorial choice the embedder makes. The mode is re-written into the address
bar on every control the reader touches, because the state written back is
built from the question alone and an embed would otherwise silently lose its
own mode. And the panel stays in the DOM and is still filled — one code path
answers a click whether or not there is anywhere to show the answer — so
nothing here has a second, quieter version of itself to keep in step.

An embed is usually narrow enough to be in the phone layout while sitting on a
desktop, which has two consequences: the key folds to its head line, and the
zoom buttons stay on screen, since the phone's answer to zoom is pinch and the
wheel now belongs to the host page.

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
2. **Decide on address search.** Today the input is a map click. Geocoding means
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
- **A walk used to be drawn and timed as a straight line**; that gap is
  closed. `refresh.walking.WalkNetwork`, fetched from OpenStreetMap by
  `ingest_osm_walk.py`, now routes and charges every walk on the ground a
  rider actually crosses — sidewalks, alleys and Pittsburgh's public
  stairways — rather than through the blocks, rivers and hillsides between
  its ends. Still open: the last walk can dogleg via a bus stop the rider
  never boards, because only a stop inside the destination's own 400 m
  radius may be the final alighting point —
  `docs/worklog/the-last-walk-doglegs-via-a-stop-nobody-boards.md`.
- **The equity findings are half a layer now.** The surface's key can be read
  as people (`?surfaceunit=people`), so the map answers "how many residents
  here lose a bus" — but nothing on the map is *coloured* by who lives there,
  and no demographic breakdown is on the map at all: race, age, income,
  vehicle access, disability and language remain `/findings` only. The old
  reason recorded here — that a block group is covered or not at a single
  point — is out of date: `analyze_equity_change.py` has measured at every
  populated block's interior point since the blocks were brought in, which is
  what made a map of it defensible. The ecological caveat still stands.
- **The travel-time view is fixed to the morning peak.** The window is the
  published one — weekday 07:00–09:00 — and there is no control for it, so a
  reader cannot ask what the same trip looks like at 8pm, which is where this
  plan's evening headway changes live. The day type is switchable; the window
  is not. Widening it is a query parameter and a control, not new analysis,
  but every number then stops being the published one, which is why it has not
  been added on a whim.
- Stop-name and neighbourhood search is not built (the DB has FTS5 available).
- `nearest_place_label` uses PRT's `HOOD`/`MUNI` labels, which contain errors up
  to 40 km (caveat 4). It is a display hint; nothing computed depends on it.
