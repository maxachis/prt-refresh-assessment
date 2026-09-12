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

Stop-by-stop and Surface share one panel because they are one measurement drawn
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
drawn routes, day type — changes what the map draws, and none of them changes what the panel
is a panel *of*. They ride on the map for that reason, docked as a strip of
groups along its top edge, and the side panel holds nothing but the answer for
the point last clicked. It collapses to a rail, which gives the map the window.

The move was forced by the phone layout rather than chosen for tidiness. With
the controls stacked in the panel, a 390 px screen showed four rows of buttons,
a clipped fifth, and no answer text at all above the fold; the map got the
remaining 55% of the screen, most of which the legend covered. On a phone the
strip is not a strip — see below — but the principle holds in both layouts:
controls belong to the map, the panel holds only the answer.

Since 2026-09-11 each group is **folded to the option it is set to**, with a
caret after it, and opens a list beneath itself when clicked
(`frontend/dropdown.ts`). Laid flat, the seven groups were two bands of
geography wide — every alternative of every control on screen, for choices a
reader makes a few times an hour — and in the one-seat and travel-time views
they wrapped to a second row. Folded, the strip still says what question is
being asked (walk 400 m, view One-seat, to Downtown) and the map has its top
edge back. The option buttons underneath are untouched: every handler, and the
button-press a link arrives through, finds the same buttons with the same
active class, and the trigger in front of each group merely mirrors whichever
option is active — its text, its disabled state under Streets, the pin's
"click the map…" while it waits. One list is open at a time; choosing, clicking
elsewhere, or Escape closes it. The phone sheet is *not* folded: there the
toolbar is already a mode a reader enters, and inside it a chip row is one tap
per choice where a list would be two.

What that costs is proximity: the day type and the walk radius used to sit two
centimetres above the numbers they were measured at. **The state line puts that
back** (`frontend/statebar.ts`), pinned above the panel where it cannot scroll
away — "One-seat ride to Downtown · any day · 400 m walk". That is not
decoration. The one-seat view can be showing either of two different
measurements, only one of which is what `data/oneseat_change.csv` publishes, and
convention 13 requires anything quoting a one-seat number to say which; the
legend says it for the map, and this says it for the panel, in the same words.

### The panel answers in two units

A click in Stop-by-stop (or the combined view) opens a panel with two blocks,
each under its own heading. **At this stop** is the kerb the reader clicked —
the same unit the dot's colour and its hover use, named for the poles PRT
names, and computed by `query.kerb_service` to agree with `query.kerb_departures`
exactly. **Within a 400 m walk** is the published location: convention 4's
quarter mile, what `data/coverage_change.csv` carries and `docs/answers/`
quotes. At the downtown dot that started this they read 167 → 179 and
1,591 → 2,178, and the gap between them is the point of showing both.

Until 2026-09-10 only the second was on screen. Stop-by-stop had moved to the
kerb in its colour, its tooltip and its key, so a reader was shown one number
on hover and a wildly different one on click, with no reason on screen for the
difference and a figure that swung by hundreds when the click moved a block.

Three rules keep the two apart. **Every number sits under the label of its own
unit**: the headline, the period table, the wait and the routes exist in both
blocks and each says which it is measuring, and the boardings row names its
scope in the row label. **The area facts stay in the area block** — stops
within the radius, the removals, the additions, the residents — because there
is no such thing as a stop count at a stop. And the place head above both
carries the radius **only when the radius is the panel's one scope**, since a
"within 400 m" subtitle hung over a kerb headline is the same error one line
further up.

**And the walk block no longer promises both directions of a count that has
one of them.** A radius is a circle; a route's two directions often run on
different streets, so one can fall outside it — the 61A/B/C and the 71B use the
Fifth/Forbes one-way pair, and a pin in Crawford-Roberts catches four of
today's seven routes and five of the plan's eight inbound only, none of them
outbound. Across the 6,644 locations with a weekday bus today, at 400 m, 14%
catch at least one route one way only and 1% catch every route that way. So
`query.days_of_service` names them (`one_direction_routes`, both sides, both
scopes), the panel prints "Routes in one direction only: 4 of 7 → 5 of 8" when
either network has any, and the headline reads "one or both directions" in that
case and "both directions" otherwise. It is not a fault — a rider here really
can board one way only — but it is convention 4's radius sensitivity arriving
per direction, a pole outside the circle by a few metres taking a whole
direction of a route with it, which is what the `one-direction` drawer entry
says. The kerb block draws no such row and now claims no directions at all:
one side of one street is one-directional by construction, so "both
directions" there was wrong always rather than sometimes, and its headline
stops at "buses per weekday at this stop".

Which unit leads is the view's call and the server's together. `place.ts` is
asked for the kerb block only where the dots are on screen (`main.dotsOn`) —
Surface, Streets, one-seat, travel time and Places draw no stop for a click to
have landed on, and are unchanged. The server decides whether there *is* a
kerb, by the 25 m on the ground rather than by a screen hit, so an `at=` link
opens the same panel at every zoom; `/api/place` returns `kerb: null` where no
pole of either network stands, and the panel falls back to the walk radius
alone. The one-seat panel's collapsed service line stays radius-based.

**A stop the plan adds is a kerb, reading 0 today.** Until 2026-09-11 the
kerb was anchored on today's poles alone, so a click on one of the 481 hollow
dots — the stops the plan adds, which the map draws on purpose — got the same
null as a click in a park: no "At this stop" block, and no ROUTES control,
at the one kind of stop where the plan's routes are the whole story. The dot
layer never had that blind spot (`query.kerb_departures` reads both networks
and the point's own id on each), so the panel disagreed with the hover it was
built to match. `query.kerb_stops` now reads both sides the same way: the id
is the nearest pole on whichever network stands one here, today's first, and
the other network's pole of that id is pulled in however far down the block
it stands, on either side. Null only where neither network has a pole.

### Drawing a stop's routes

The toolbar's **ROUTES** group — Off, Today, Proposed — draws every route
calling at the clicked kerb on the map, end to end along the street it drives,
with an arrow flowing in the direction of travel. `stoproutes.ts` fetches
`/api/kerb_routes` for the clicked point and draws it under a timed trip's own
lines, never over one.

It sat in the panel's own "At this stop" block until 2026-09-11, as a toggle
with a network switch under it, on the reasoning that the question it answers
belongs to the clicked stop rather than to the whole map. That is true and it
is not the test this app applies: **controls belong to the map, the panel
holds only the answer**, which is the rule the toolbar section above states,
and this control changes what the map draws. In the toolbar it also sits where
a reader looks for a switch. The group appears only while a stop is selected:
the answer on screen has a kerb (the server's 25 m test, not a screen hit) and
the view is one that draws dots, since there is no stop to draw routes at on
the surface, the streets or Places, and none anywhere before the first click.
Hidden rather than disabled, and the position is kept, so a reader who set it
to Today and clicks the next stop gets that stop's routes without pressing
anything. At a stop only one network serves — the plan adds it, or retires
it — the position is still kept and the empty side is still offered: the
folded trigger wears the active option's disabled state (`dropdown.ts`), so
disabling Today at an added stop while Today was selected would grey out the
whole group and lock the reader out of Proposed. The panel's caption says
instead that no bus calls here on that network and names the other button.

It draws **one network at a time and colours by route, not by side** — the
one layer here that does. Every other view is a comparison, today against the
plan, and two colours carry it. This view asks a different question — which
buses call here — and at a downtown kerb the answer is 36 of them. Drawn both
at once and coloured by network, the line had to carry two channels, and past
five or six routes the second one stopped arriving: a reader can tell blue
from orange and cannot tell the eleventh orange from the twelfth. So the
network became two of the control's three positions ("Today" / "Proposed"),
switching between which costs no fetch because the response already holds
both sides, and the colour became the route's own.

The palette is spaced in **OKLCH** (`routecolor.ts`), at one lightness with
hues `i · 360/N` apart, because "as far apart as possible" is a claim about
the eye and equal steps of HSL hue are not equal to the eye — the
yellow-greens collapse while the blues stay distinct. Where a hue cannot hold
the asked-for chroma in sRGB, **chroma is pulled in and the hue is not**:
clipping would move the hue and converge two routes on one flat colour. The
palette is computed over **the drawn side's route ids alone**, so the two
networks are not comparable by hue — and it is assigned **per kerb**, so a
colour means nothing between one stop and the next. The key for it is
therefore the panel's own route chips, which wear the same colours (the same
`routeColors` call over the same set); they and the caption above them are
what stayed in the kerb block when the control left it, because both are the
answer rather than the knob. The map key says only which network is drawn and
what the arrows mean, and the state line over the panel appends "· routes
today" or "· routes proposed" so a screenshotted answer says which network
its chips belong to.

It still draws **one line per pattern, not one per route** — a short-turn or
a branch is real service, and picking one pattern to stand for a route with
several would silently choose which trip a reader gets to see.

Two caveats travel with it. It is **drawing only**: the shapes are lossy the
way a journey's ride legs are, so nothing may be measured off a length or an
angle here. And it is **buses only** — the T and the inclines never appear,
so a stop the toggle shows losing its last bus while a train still calls
there is convention 13's Beechview trap arriving at a new unit. The control's
position travels in the URL as `stoproutes=off`/`current`/`proposed`, written
always, so a link reproduces the map it was copied from. It was two
parameters — a toggle and a side — before the feature shipped, which is one
state too many: a network is half of what is drawn, not a refinement of an
on/off.

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
drawer scrolled to that entry and marks it. The walk-radius block is under 230
words, pinned by a test — 220 until each of its figures started naming the
scope it was measured at — because prose grows back one useful sentence at a
time. The kerb block above it is its own budget and repeats none of its prose.

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

The layer paints ~6,400 locations before anybody clicks, so the shape of the
plan is visible without knowing where to look. Two point sets, kept distinct:

| | what it is |
|---|---|
| **published** (6,284) | the locations `data/coverage_change.csv` measures — every stop the current GTFS serves, whether or not it still carries a PRT ridership record (209 do not; their boardings are UNKNOWN, never zero). Counts over this set are the published counts. |
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

### Which stops get a dot of their own

A dot was a location, not a pole, until 2026-09-10, and that is what the map
got wrong three times in a row. A 150 m identity distance — convention 4's
strict same-corner test — decided whether a stop the plan adds was a *new
place to measure* or a second pole at a place already on screen. It folded 496
of the plan's 5,413 poles into a neighbouring dot: their gain landed in that
dot's colour and their own kerb stayed bare. PPT reported it on Penn Avenue, a
PRT consultant on the four stops route 34 gains on McMonagle Avenue, and Max
hit it at Northview Heights, Millvale and Homewood in one morning.

**Max's ruling: location is not this view's unit.** "Every stop on the map
should be displayed, and those that are added should be labeled as 'the plan
adds a stop here' and always displayed, regardless of pin." So the question
`query.is_new_place` asks is about a POLE, and it is asked in two steps:

1. **PRT's own stop id.** Keeping an id is the agency saying "this is that
   stop", which outranks any distance. 20918 (Churchill Rd + Holland) moved
   152 m and 18627 (Hwy Rt 286 + Royal Oak Dr, now Old Frankstown Rd) moved
   178 m; both are relocations, not additions.
2. **`query.STOP_SAME_POLE_M`, 25 m** — and this is convention 3's mirror and
   nothing more. A vanished id is not a lost bus; an appearing id is not a new
   bus. PRT renumbers 54 kerbs in place among the 535 ids new to the plan, 9 of
   them within 10 m, and drawing those as additions would credit the plan with
   a stop it is not adding.

That leaves **481** stops the plan adds, and the point set is **6,765**
locations: the 6,284 `coverage_change.csv` publishes plus those 481. Four
things follow.

- **No published figure moves.** Published counts filter on `published = 1` and
  every point this governs is `published = 0`. The weekday buckets at 400 m
  read 633 gone, 298 halved, 1420 less, 1583 same, 2113 more, 237 doubled
  before and after.
- **It is the mirror of `is_removed_stop`, and stayed one.** A stop the plan
  takes away is crossed unless the plan serves a pole within the same 25 m, so
  one distance decides both marks. A kerb PRT renumbers therefore has a
  proposed pole within 25 m (no cross) *and* a current pole within 25 m (no
  ring), and no corner can carry both — zero by construction, pinned by
  `tests/test_query.py`. The two constants were briefly held apart, on the
  worry that a shared threshold would stack both marks on 58 renumberings; it
  does not, because at renumbering distances both tests go quiet together.
- **An unpublished point is not a gain.** It says the plan puts a stop where no
  stop stands. What happens to the buses there is a different question, and at
  400 m on a weekday 297 of the 481 land in `more`, `same`, `less` or `halved`
  rather than `new`, 66 of them where the plan is thinning service. Reading the
  set as the plan's gains would be wrong, and
  `tests/test_query.py::test_new_coverage_points_are_not_all_a_gain` pins it.
- **Overlapping ground is counted twice.** At 400 m a new-coverage point could
  not fall inside a published point's circle; at 25 m a great many do, so the
  in-view key may count the same ground under two identities. That cost was
  weighed against the invisibility and accepted — Max, 2026-09-08 and again on
  2026-09-10. It is why the threshold is a named constant with the trade
  written beside it.

**And the map says which dots those are: they are drawn hollow.** A filled dot
is a stop that stands today; an unfilled one, ink outline and no centre, is a
stop the plan adds. The Stop-by-stop key carries it as a row of its own — **"the
plan adds a stop here"** — with the count in view and its own switch, and those
dots join the head line's total.

**They are not in a service bucket, and that took three tries.** They were
first drawn in their bucket's colour with a ring round them, so Grant Avenue in
Millvale read "doubled or better" and "no stop within 150 m today" at once. Max
called that incongruous on 2026-09-08 and it is: both marks are true and they
measure different footprints — the colour counts every bus within a quarter
mile, the ring is about the pole itself — so a key naming one distance leaves
the reader resolving a contradiction that was never there. A location with no
stop today also has no service today to compare against, which is exactly what
the buckets compare. So it is a category of dot rather than a seventh outcome:
out of `countIn`, out of `sumRidersIn`, counted in its own row.

The cost is stated rather than hidden: those dots no longer show what happens
to the buses within a walk of them, including the 14 weekday places the plan is
thinning. Streets and the answer panel still carry that, and the panel prints
"Stops the plan adds" for the poles inside one walk radius.

**Hollow rather than an eighth colour, because the palette is full.** That was
the intent and it does not survive measurement. Searching the colours inside
the band the ramp holds against Positron (2.9–4.2 contrast), the best
separation any candidate reaches from all seven existing inks — across normal
vision and the three dichromacies, `frontend/cvd.ts` — is ΔE 14.6, against the
40 the ramp's own sign-crossing pairs are held to, and its nearest neighbour is
the `new` blue, the one dot it must never be confused with. Going darker buys
separation (a near-black navy reaches 37.9) at 15:1 contrast, which would make
the plan's added stops the loudest mark on a map that also shows 633 locations
losing every bus — overstating gains. The fill channel is free, carries no
position on a loss–gain ramp, and survives every colour deficiency because it
is not a colour.

**Earlier labels, all withdrawn on 2026-09-08.** "New stop under Refresh"
claimed more than the data does (some are relocations). "New stop location"
nested inside the `new` bucket's "new service" — two categories both called
new. "No stop within 150 m today" was accurate and still collided with the
colour beside it, which is what forced the colour out rather than the words.

The distance is fixed whatever walk radius is asked for. The point set has to
describe the same places at 400 m and 150 m or the two stop being comparable;
selecting at whatever radius was asked for would fill the strict view with
new-service dots that are the smaller circle's artefact. See
`docs/worklog/a-new-stop-the-plan-adds-draws-no-dot.md`.

### The stop the plan takes away: a red cross

The mirror of the hollow ring, and the second half of what makes the view
stop-by-stop rather than a field of walk-radius colour. A dot wearing a red X
is a stop the plan removes: the id is retired and the plan stops at no pole
within 25 m of it — `query.is_removed_stop`, the exact mirror of `is_new_place`
at the same `STOP_SAME_POLE_M`. It asked at 150 m for part of 2026-09-10, which
left 434 retired poles drawing nothing at all where the plan served a stop
further down the block; Max ruled that "if it's a retired stop that is not
simply moved, it should be marked as removed. The user can infer a nearby stop
by looking at the map." That moved the countywide figure from 972 to **1,308**.
The shared threshold is what keeps a kerb PRT renumbers from drawing a cross
and an added-stop mark at once, and `tests/test_query.py` pins the three
Downtown PRTX stations that would otherwise have stacked both marks 2–3 m
apart.

**One dot says one thing.** Either the plan takes this stop away — a cross, on
every day of the week — or the stop stays and the colour says what the buses
within a walk of it do. A removed stop is drawn by its cross alone, is counted
only on the cross's row, and appears in no service bucket. Max set that rule on
2026-09-09.

It replaces a design that carried both channels on one dot, colour for the
service and a mark for the pole. That was defensible on a weekday — the two
questions really are different, and 675 of the 1,308 removals sit in a bucket
other than "loses all service" — but it produced dots a reader cannot resolve
the moment the day switch moves. On a Saturday, 25 stops PRT retires stand
where the plan puts a weekend bus that does not run today: crossed out and
coloured "new service" at once. What a removed stop leaves behind is legible
without the colour, because the neighbouring dots are on screen — a cross in a
field of purple is a moved pole, a cross among crosses is an abandoned
corridor.

**What it costs, and where the lost number went.** On a weekday at 400 m every
one of the 633 "loses all service" locations is also a removed stop, so that
row reads 0 there and the crosses carry the whole story. The two part company
on weekends: 149 of Saturday's 443 stranded locations are stops that survive
with nothing left to catch, and they stay red. The published 633 is quoted on
`/findings`, in `FINDINGS.md` and in `data/coverage_change.csv` — a figure to
quote belongs in a published file rather than in a viewport-dependent key, and
the key never showed the citywide number anyway.

Three things follow in the drawing, each of which was a defect until it was
fixed. The cross answers only its own switch in the key, since hiding "more
service" must not take the 192 removed stops whose radius gains service with
it.
The brush paints from the cross layer as well as the dot layer
(`change.CHANGE_HIT_LAYERS`), or the 1,308 stops a reader is most likely to
select would be unpaintable, and the selection ring for a cross is a circle
drawn under it, because a symbol layer has no stroke to thicken. And the hover
binds to both layers: the removal sentence, with the walk to the nearest
surviving stop, lives in that tooltip.

**The whole view answers for the kerb — hover, colour and key alike.**
Stop-by-stop is the view about stops, so its tooltip counts the buses calling
at that kerb — "306 → 731 buses per weekday at this stop" — and the dot's
colour is `query.bucket()` on those same two numbers. Until 2026-09-10 both
channels were the 400 m walk radius's, which at a downtown dot read
1,591 → 2,178: every bus within a quarter mile of the Central Business
District, and not a stop by any reading. That comparison is the Surface view's
job, and the answer panel's — which now prints both, in two labelled blocks;
see "The panel answers in two units" above.

**A kerb, not a raw pole**, and the difference decides 467 dots. The unit is
every pole of each network within `query.STOP_SAME_POLE_M` (25 m) of the dot,
summed on both sides, with the dot's own stop id counted first so a pole the
plan stands 84 m away does not read as losing all its service. Count the raw
pole instead and the 208 kerbs where the plan consolidates two poles into one
paint as gains: at c:10246 two poles of 15 weekday buses become one of 22, so
per pole that is "15 → 22, more service" twice and per kerb it is 30 → 22,
less. The plan's side is read at whatever pole the plan runs there, by the same
25 m test as the removal cross, so a renumbered stop does not report zero.

**The key's figures are therefore not the published ones, and it says so.**
The head counts "stops in view", never locations, and carries no walk radius
over that number — the radius is named only when the surface is drawn, and
named as the surface's. Under Riders the weekday "loses all service" row weighs
6,515 boardings, 8.9% of the system's 73,408, against the published 0.8% at a
*location* that loses all service within a quarter mile: the gap is precisely
the riders who can walk to another stop. Both figures are pinned in
`tests/test_query.py`. Quoting one with the other's sentence is a serious
misquote in either direction.

For half a day between the two changes the tooltip printed the pole's numbers
under the radius's colour and scoped the label "more service **nearby**". Max
ruled that out: "if hover already shows that change in service at the stop
level only, why have coloration communicate something potentially different?"
The scope word is gone because the thing it was protecting a reader from is
gone.

**A dot names the pole it is drawn at, whether or not a pin is down.** The
layer carries one point per stop id, so a dot *is* a pole rather than a
neighbourhood of one, and since 2026-09-10 its hover opens with PRT's own name
for the stop, the stop id, and — for the 225 poles it applies to — "the plan
stands this pole 34 m away", above a rule, with the walk radius's own reading
beneath. That is the same information a pin's marks carry, in the same order,
so the map gives one answer about a kerb instead of two chosen by whether the
reader had clicked. The name travels as a sixth fixed field in the packed row
rather than as a lookup keyed by id, so it cannot come unaligned from the point
it names; the metres travel as a sparse map, since the plan leaves 6,540 of the
6,765 poles where they stand. It costs 65 KB gzipped, 15 of which came back
when the radius trip counts left the row: the layer is 205 KB against 155 KB
before either change, which is the largest single price paid for anything in
this view. The kerb sums cost 0.45 s per radius on the server, paid once
because `/api/change` is cached per radius by `cached_layer`.

**How far the replacement is, is a walk, not a straight line.**
`build_webdb.write_stop_fates` routes from every removed stop over the
pedestrian network (`refresh.walking`) to the nearest stop the plan keeps,
bounded at 800 m, and stores the metres on `stop_place`. The hover line reads
"Stop removed — nearest stop is a 189 m walk"; the panel prints "Stops the plan
removes: 2 of 17" with the range of those walks under it. Where nothing
survives inside 800 m the number is absent and says so, rather than being
rounded up into a figure.

**Where the ground makes the walk absurd, the hover prints the straight line
too.** A walk more than 1.5× the distance to the nearest stop *as the crow
flies* gains "; the nearest in a straight line is 301 m"
(`change.STRAIGHT_LINE_NOTE_RATIO`, `stop_place.nearest_straight_m`). The case
that asked for it is Mt Troy Rd + Beckert on Troy Hill: the walk to any
surviving stop is 651 m, while the map plainly shows Lowrie St stops 301 m
away, which are 863 m on foot because Mt Troy Road switchbacks round the head
of a ravine. Without the second number the walk reads as an arithmetic error to
anyone who knows the hill. The comparison is deliberately against **the nearest
stop in a straight line, which is usually a different stop from the one the
walk found** — measured against the walk-winner's own straight line the Troy
Hill ratio is 1.30 and the hover that prompted the whole change would print
nothing. Countywide the median walk is 1.22× its own straight line
(convention 14), so most removals print one number, as they should: 211 of the
772 removals with a walk carry the second one.

A stop with **no** reachable replacement is measured the same way, against the
800 m the search failed at — 151 of the 536 stranded stops stand within 800 m
of a surviving stop as the crow flies and now say so. That is the sharpest form of
the same confusion, not an exception to it: "no other stop within an 800 m
walk" beside a stop plainly 513 m off on the map reads as flatly wrong.

**And the key says what the mark does not mean.** Countywide, of the 1,308
stops the plan removes, 578 have another stop within a 400 m walk and 194 more
within 800 m; 536 have none. Left without that line the mark reads as 1,308
corners losing their bus, which is not what it measures — and the 536 that *are*
that only read as alarming when the other 772 are counted beside them. That the two
distances differ from `data/stop_service_change.csv`'s straight-line column is
filed at `docs/worklog/two-distances-to-the-replacement-stop.md`.

### Locations or riders: the legend's second denominator

`?weight=riders`. The same dots in the same buckets, counted by PRT's May 2025
boardings instead of by place — the numbers come from `stop_place`, carried
into `refresh.db` from `data/coverage_change.csv`, and ship in the change
payload as a fourth field per day type (`weekday_riders`, …) so switching the
day moves the riders with the buses.

It exists because the two denominators answer the same question in opposite
tones. Citywide on a weekday at 400 m, the plan strands **633 locations** —
and those locations carry **580 of the system's 73,408 daily boardings**,
0.8%. The first sentence is the reason to comment on the plan; the second is
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
  em dash, not a zero. The same rule now also covers 209 of the *published*
  6,284 locations: stops the current GTFS serves but whose id a renumbering
  left with no unambiguous ridership match. Their `boardings_source` is
  `none`, and they travel as `null` beside the 121, not as a 0.
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
   change nothing for Downtown — the same 79 current and 69 proposed routes at
   200 m and at 400 m, because a district's seed cloud is dense enough that
   widening each seed's circle finds nothing new. Oakland is the exception
   since North Oakland was dropped from the district: 21 current and 24
   proposed routes at 200 m, 22 and 25 at 400 m, the extra one on each side
   being the 82 on Centre Ave, which passes just outside a narrow circle round
   the core. The app is therefore fractionally more generous about Oakland than
   `data/oneseat_change.csv`, and `tests/test_oneseat.py` pins the direction
   rather than the equality: every route the CSV credits must still reach the
   anchor, and a wider circle may only add. Where the radius bites hardest is a
   dropped pin, which is one seed with nothing to saturate it.

### What a destination is

A **set of seed points**, which is what lets a district and a pin share one
definition. Downtown is the 44 stops PRT labels Central Business District and
Oakland the 52 across West, Central and South Oakland — North Oakland is
deliberately not part of the district, because its northern edge is a mile from
the Fifth/Forbes core riders mean — both put through
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
(`destination_reach`), because Downtown is 44 seeds and Oakland 52 and
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
| Losses | share of the place's own residents who lose all buses | no |
| Gains | share who gain a bus | no |
| Service | percent change in the place's own bus trips | **yes** |

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

## The Route changes view

The one view whose unit is a **route** — or rather a *route group*, the
connected set of today's numbers and the plan's that PRT maps onto one
another, which is `analyze_route_hours.py`'s unit and the one
`data/route_frequency_change.csv` publishes. It answers the question a rider
actually arrives with — "what happens to my bus?" — which every other view
declines on principle: convention 1 forbids comparing route N to route N,
because the plan re-splits corridors, and the site measures locations, ground,
streets, people and journeys instead. This view is route-based anyway, on the
same terms as the one-seat and travel-time views (conventions 13 and 14): it
is a different question, it is labelled as one, and its caveat travels with
every number it shows.

**A group is not a corridor, and the card says so.** The 51 group reads −10%
weekday trips; the new 45 runs 70 weekday trips over much of the same street in
a separate group, because PRT's crosswalk records it as new rather than as the
51's successor, and the only column that would connect them — PRT's "related
routes" — chains across the network and cannot be unioned on
(`analyze_route_hours.py`'s docstring). So the card prints the measured group
and PRT's own suggestion as two different things: the service table is the
group's, and "PRT points riders to: …" is PRT's, labelled as PRT's, with a link
to PRT's route page — and PRT's own "N/A", which is how 35 of its rows spell
"nowhere", arrives empty so the card does not point riders to N/A. Neither is
a replacement claim the repo has measured. Where
access is measured is the location, surface and street views, and the card
sends the reader there.

**The map draws what changed and hides what merely continued.** Nothing
selected, every group's shown side is a line coloured by its status —
discontinued routes red, along today's alignment; new routes blue, along the
plan's; split and merged routes purple, along the plan's. **The key's rows
are the filter**, as the Stop-by-stop key's are: each row switches its lines
off and on, a switched-off row is dimmed, and "Show all" turns every row back
on. The 65 one-to-one groups are grey and **off by default** (Max: "grey
behind a toggle", then "make it so that, like with other views, the legend is
selectable"): they are most of the network, and a map with all 108 groups on
it at once is the whole network drawn twice, which is the picture the
stop-by-stop and one-seat views already give. Unlike the dots' buckets, the
switched-off rows travel in the link (`routehide=`), because the default hides
sixty routes and an embed has to draw what its author saw; an empty list is
spelled `none`, since absence means the default. The one-to-one bucket is the
one whose name has to be read carefully — one today's number maps to one of
the plan's, which says nothing about its service; the 61C becomes the 61X and
gains 8% of its weekday trips — so the key names it *one-to-one* and never
*unchanged*.

**The key has a second reading, which colours the same lines by how much
service each group keeps.** "What happened" is the default above; "How much
service" (`routecolor=service`) recolours every group's shown side by the
day's trips, today → plan, in the **Stop-by-stop key's own buckets and
colours** — loses all service, halved or worse, less, about the same, more,
doubled or better, new, with the same ±10% band around no change
(`query.bucket`, computed once per group and day at request time from the
published trips) — and widens a line the further its bucket is from "about
the same", so the extremes read at a glance the way the dots' sizes do. This
is the reading that shows what the status reading cannot: **a one-to-one
group is not unchanged**, and here the 61C → 61X reads as a gain and the 51
as a loss while both are grey in the other reading. The colour follows the
toolbar's day, because a group's Saturday change is not its weekday one (the
Y46 → 46L keeps its weekday trips and loses every Saturday one); the head
line says which day, and the panel's directory regroups under the same
buckets, its names in the same colours, with a note for the groups that run
on neither network that day. Its rows are switches like the status rows,
with their own hidden list in the link (`servicehide=`, written only when
something is off, since this reading hides nothing by default); "Show all"
clears whichever reading is on screen. The figure is **trips, not revenue
hours** (Max: "trips as the figure"): hours would say the same thing for
nearly every group and mislead where the two disagree — a route that gets
shorter and more frequent — and trips is what the dots count. It is still a
figure per route group, not per corridor: the 51 reads fewer trips while the
new 45 runs much of the same street in its own bucket, and the foot says so.

**Selecting a group changes what the colours mean, and the key changes with
them.** A click on a line, or a row in the panel's directory, dims every other
line and draws the group's own two sides in the site's today/plan pair — the
blue and orange the travel-time view uses for its two itineraries — so a
one-to-one route's reroute reads as two alignments over each other, which is
the only way "how did this route change" has a picture. Today's side is drawn
**wider, underneath** (`routechange.CASING_WIDTH`): the two sides are mostly
the same street, and at one width the plan's line simply covered today's, so
"today's alignment" appeared to be only the stub where they part company. As
a casing, a shared stretch reads orange edged in blue and an abandoned one
reads blue alone — the 77 + 86 → 86 merge shows the 77's Penn Hills loop in
blue by itself beside the shared trunk. Blue therefore means
*new route* before a selection and *today's alignment* after one; the key
rewrites its rows at the moment of selection precisely because that is a
trap, and an embed, which keeps the key and loses the panel, still says which
it is.

**The directory is the panel's empty state**, as the ranked list is for Places:
grouped under Discontinued, New, Split or merged, and One-to-one, the last
folded shut so the panel opens on what changed — or, in the service reading,
under the day's trips buckets in the key's order, empty ones left out. Each
row's name is printed in its bucket's colour, and a group with one side is named by that side alone
— "17 SHADELAND" under Discontinued, not "17 SHADELAND → —": the heading
already says the other side is missing, and an arrow to a dash read as a
rendering fault (Max's call). The card for a selected group
gives its service on all three day types — trips and revenue hours, today
against the plan, with the published percent — beside today's weekday riders
from WPRDC's route-level table. The figures are copied from
`route_frequency_change.csv` at build time rather than recomputed from the
app's own timetables, so a percent on the card is the percent
`docs/answers/LOSE-SERVICE-HOURS.md` cites and cannot drift from it. Revenue
hours are in-service time only — no layover, no deadhead — and the card says
they are not a cost figure.

**The day switch moves the map and, in the service reading, the colours and
the directory's groupings.** The drawn patterns are per day type, because a
route's Sunday pattern is not its weekday one and today's 53 has no weekday
pattern at all; the status reading's list and the card's three-row table are
day-free by construction, while the service reading is a day's figure and
says which day in its head line and over its list. The state line says the
day for the map's sake.

**Nothing is measured off the lines.** They are the journey layer's shapes,
thinned at build time and lossy by construction (`journey_shape`'s schema
comment); the API and the module both say so. Street length lost is
`analyze_corridor_change.py`'s question, measured on the full shape.

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
| `GET /api/change?radius=` | The citywide layer: every location bucketed, all three day types, columnar, each with the boardings observed there — `null`, never 0, where the plan adds a bus and nothing stops today. Radius must be 400 or 150 — it is precomputed. ~510 KB, 149 KB gzipped. |
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
| `GET /api/route_changes?day=` | Every route GROUP `analyze_route_hours.py` publishes (108, day-free list), with trips/hours/riders copied from `data/route_frequency_change.csv` and the drawn path of whichever side each group's overview shows, for one day type. Route-based, against convention 1 — see `query.route_changes`'s docstring for why a group is not a corridor. |
| `GET /api/route_changes/{key}?day=` | One route group, drawn on both sides for one day type. 404 on an unknown key. |
| `GET /api/meta` | Feed versions, sample dates, periods, caveats. |

### The three precomputed layers are built once, not once per request

`/api/change`, `/api/surface` and `/api/population` are `build_webdb.py`'s own
tables read back out. Nothing about them can change while the process lives,
and until 2026-09-10 every request rebuilt one from SQLite: 309 ms to pack the
6,765 dots, 919 ms the 48,526 surface cells. A reader toggling the walk radius
to 150 m and back paid for the 400 m layer twice, and every visit to Surface
paid again — a large part of why Max found the map laggy.

They are now held **as the bytes they are sent as**, keyed by radius, on both
sides of the wire:

- **The server** keeps at most six entries (three layers × two radii, about
  4 MB) in `create_app`'s own `cached_layer`. Bytes rather than the dict,
  because caching the dict would still leave FastAPI's encoder walking 6,765
  rows of 17 on every hit. Measured cold → warm: change at 400 m 216 ms →
  2.4 ms, surface at 400 m 397 ms → 3.4 ms.
- **The page** holds the promise, not the answer (`utils.fetchJSONOnce`), so
  two callers that overlap — a double-clicked radius switch, a view asking for
  the surface while the first ask is in the air — share one request. A
  rejection is dropped rather than remembered: a cached failure would refuse
  that layer for the rest of the session over one lost packet.

**Not the one-seat layer**, which looks like a fourth candidate and is not: its
destination can be any point a reader drops a pin on, so a cache keyed by its
URL would grow without bound as they drag one around. **Not the corridor
layer** either, which is precomputed and day-keyed but is re-fetched on every
day switch — an open candidate rather than a decision, since the day buttons
change three other views by repainting rather than re-fetching.

Two pages, not one endpoint each: `GET /` is the map and `GET /findings` is the
equity brief.

## Drawing it on a machine with no graphics chip

A vector map recomputes every dot's screen position on every frame and then
fills the pixels under them, and some of the machines this is read on have
nothing but a processor to do that with. Max's VM is the measured case:
`chrome://gpu` reports every acceleration path off and WebGL arrives through
Mesa's CPU rasteriser, which names itself `llvmpipe, or similar`. The same is
true of any browser falling back to SwiftShader, of a locked-down office
desktop, and of the cheap end of the phones a public-comment audience reads on.

Three things were done about it on 2026-09-10, and one thing was deliberately not.

**Fewer pixels, not fewer dots** (`frontend/hardware.ts`). The canvas is capped
at 2 device pixels per CSS pixel on any machine — above that the returns are
invisible and the cost is quadratic, a phone at 3 filling 2.25× the fragments
of the same map at 2 — and at **1** where the renderer names itself a software
rasteriser. Measured here at an emulated device ratio of 2, dragging the
countywide dot view under llvmpipe: **579 ms per frame uncapped against 274 ms
capped**, two runs each. The label fade goes to 0 in the same case, a fade
being a repaint per frame for as long as it runs, and world copies are off for
everyone — there is one Allegheny County and no reader will pan to a second.
An unrecognised renderer is assumed to be hardware, so a name the list has not
met costs one reader some sharpness rather than costing every reader theirs.

**One hit test per pointer move, not nineteen** (`frontend/hover.ts`).
MapLibre's `map.on('mousemove', layer, …)` is a delegated listener that runs
`queryRenderedFeatures` itself, once per listener: three listeners on each of
six layers was 19 queries for one mouse move, and four of those six layers
belonged to views that were not on screen. A drag delivers a pointer event per
frame, so that work landed on exactly the frames a reader judges the map by.
The app now dispatches instead — one query over the layers the current view is
drawing, the topmost feature routed to whichever spec owns its layer, and the
tooltip left alone while the pointer stays on one feature. **19 queries → 1,
and 5.1 ms → 1.0 ms of main-thread JavaScript per pointer move at zoom 12**
(p90 17.4 → 5.1 ms). It also collapses the two popups that could previously
stand open at once, the pin marks having owned one of their own.

**A different basemap where nothing can draw the usual one** — measured, built,
and **switched off pending a tile source** (`hardware.basemapStyle`,
`RASTER_BASEMAP_READY`). This is the change that dwarfs the other two, and none
of it is about this site's own drawing. The basemap is Positron, and as a
vector style it is 55 layers — 26 line, 19 symbol, 9 fill — re-tessellated and
re-filled every frame. Measured on a bare map with none of this site's layers
on it: hiding every vector layer took a drag from 564–868 ms per frame to
**37–47 ms**; hiding all 19 label layers changed nothing, so it is not text.
Against a raster basemap, arms alternated twice in one run, the same camera and
drag: **952 / 1,500 / 1,300 / 441 ms vector against 115 / 52 / 109 / 39 ms
raster**, two distributions that do not overlap. Max's call was that only
software renderers take the trade, a raster label being one that cannot be
restyled, cannot be held out from under a dot, and is soft on a good screen.

**Three tile services were tried and none may be used as it stands.** CARTO's
Positron raster — what the measurement was taken on — stamps `API KEY REQUIRED`
across every tile served without an account. Esri's Light Gray Canvas is
keyless and the right look, but Esri's own summary of the terms conditions
every permitted use on having Esri software or a subscription, and separately
forbids self-hosting its content. OpenStreetMap's own tiles are permitted for
exactly this and were the fastest of the three, but they are a full-colour
general-purpose map: coloured motorways under red removal crosses, green parks
under a purple gain palette `contrast.ts` never tested against them, and a tile
server slow enough that a pan shows gaps. So every reader keeps the vector
style — the slower map, and the legible one — until a source is settled.

**Not fewer features.** Thinning the dots at low zoom is the obvious third
lever and it is the one that may not be pulled: the key counts the rows, not
what survived a filter, so a map drawing 3,000 of the 6,765 dots would print a
number no reader could see. Max's ruling that every stop is displayed
regardless of pin (2026-09-10) settles it in the same direction.

**None of this is measurable from a machine with a GPU**, and the reverse is
also true — this repo's own test browser is llvmpipe, so its frame times say
what Max's VM feels and nothing about what a visitor's phone feels. Frame
numbers here are A/B against themselves, never absolute.

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
| `view` | `dots`, `surface`, `both`, `corridors`, `oneseat`, `journey`, `places`, `routes` |
| `day` | `weekday`, `saturday`, `sunday` |
| `radius` | `400` or `150` (convention 4's two radii) |
| `oneseatday` | `any` — the published day-free measure — or `selected` (convention 13) |
| `weight` | `riders` to count the change map by boardings instead of locations (convention 15). Absent means locations, so a link only carries this when the reader chose it |
| `surfaceunit` | `people` to read the surface as residents rather than km² (convention 12). Absent means ground, on the same only-when-chosen rule as `weight` |
| `dest` | `downtown`, `oakland`, or `lat,lon` for a dropped pin |
| `at` | `lat,lon` — where the reader asked; opens the answer panel |
| `map` | `lat,lon,zoom` — where the map is looking |
| `route` | A route group's key (`c:51`, `p:45`, `c:77-86`) to open the Route changes view on; checked against the key grammar before it reaches a request |
| `routehide` | The Route changes key's switched-off rows, comma-separated from `discontinued`, `new`, `reshaped`, `one-to-one`; `none` for every row on. Absent means the default, which is `one-to-one` alone |
| `routecolor` | `service` to colour the Route changes overview by each group's trips change on the day, in the Stop-by-stop buckets; absent for the default reading, by what happened to the group |
| `servicehide` | The service reading's switched-off rows, comma-separated from `gone`, `halved`, `less`, `same`, `more`, `doubled`, `new`. Absent means nothing hidden, which is that reading's default |
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

`/findings` carries two readings of the plan under two denominators —
**residents**, in the equity charts, and **boardings**, in the ranked removals
below them. Both are there because either alone is a talking point: the
boardings say 0.8% of the system's riders are touched, the residents say tens
of thousands of people are, and convention 15 forbids quoting one without the
other. The removals ranked by riders answer `STOP-LOST-SERVICE`, which is
also the map's Riders switch's question; the ranking is by cluster of removed
locations within 150 m, so one corner split across two stop ids is one row.

It is the one part of the site that is not the map, because the
question the charts answer has no location. "Who does this fall on?" is a rate for a
group divided by the county's own rate for the same group's universe — a
number about a population, not a place — and a map cannot draw a ratio. Nor
would a choropleth of it be honest: 83% of Allegheny's block groups are
unchanged, so the picture would be a demographic base map with a scatter of
colour on it, and every reader would infer the cause from the base map.

So it is a document, and a pre-rendered one. `build_equity_brief.py` writes it
straight from `data/equity_change.csv`, `data/equity_places.csv` and
`data/removed_ridership.csv`, the same files `docs/answers/` cite, into
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
3. **Say what is collected, when asking PPT.** Since 2026-09-11 the front door
   keeps a 30-day access log with the reader's address masked to a /24, and
   `report_usage.py` reads it for which views, places and destinations get
   asked about — no cookie, no tag, no third party. The `/findings` footer says
   so; the permission question above should mention it too, so PPT is not
   surprised by it later. See `deploy/README.md`, "Reading the usage".

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
