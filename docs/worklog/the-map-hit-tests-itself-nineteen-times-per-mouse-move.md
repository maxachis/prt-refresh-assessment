# The map hit-tests itself nineteen times per mouse move

Every pointer movement over the map runs 19 separate `queryRenderedFeatures`
calls — three for each of six hover layers, including four that the current
view is not showing — costing 2.5–3.5 ms of main-thread JavaScript per move,
which is spent again on every frame of a drag because a pan is a stream of
mouse moves.
Open, not fixed: measured 2026-09-10 while looking into a frame rate Max
reports as struggling. One query per move would do the same work.

## What was measured

Local server, `?view=dots&day=weekday&radius=400`, MapLibre's own
`Map.prototype.queryRenderedFeatures` wrapped with a counter, 20 synthetic
`mousemove` events dispatched at the canvas with no camera movement — so this
is hit-testing alone, no tile rendering in the number.

| Zoom | Queries per mouse move | Query time | Total JS per move (median / p90) |
|---|---:|---:|---:|
| 12, whole county in view | 19 | 3.5 ms | 5.1 ms / 17.4 ms |
| 15, a neighbourhood | 19 | 2.5 ms | 2.4 ms / 8.6 ms |

Where the 19 go, at zoom 12 — three calls per layer, one each for the
`mouseenter`, `mouseleave` and `mousemove` listeners bound to it:

| Layer | Calls per move | ms per move |
|---|---:|---:|
| `stops-now-c` (a pin's "stop today" marks) | 3 | 0.41 |
| `change-dots` | 3 | 0.41 |
| `places-fill` (the Places choropleth) | 4 | 0.36 |
| `change-removed` (the crosses) | 3 | 0.32 |
| `stops-prop-c` (a pin's "stop proposed" marks) | 3 | 0.12 |
| `oneseat-dots` | 3 | 0.08 |

**Four of those six layers are not in the view being measured.** Stop-by-stop
draws `change-dots` and `change-removed`; the Places choropleth, the one-seat
dots and both pin-mark layers are queried anyway, on every move, because a
delegated listener is bound for the lifetime of the map rather than for the
lifetime of the view that uses it.

The same sweep in the Streets view costs 0.5 ms per move against Stop-by-stop's
5.1 ms — the layers are the cost, not the event plumbing.

## Why it matters for a frame rate

MapLibre's `dragPan` does not suppress `mousemove`, so a drag delivers one
pointer event per frame and each one runs all 19 queries before the frame is
drawn. The work therefore lands on exactly the frames a reader is judging the
map by. It is main-thread JavaScript, which is the half of a frame the app
controls; the other half is rasterisation, which it does not.

## What this does NOT establish

**It is not a diagnosis of what Max is seeing.** Frame times could not be
measured usefully here: this session's browser is headless with a software
rasteriser, where a pan costs 277 ms per frame with the dots on, 517 ms in
Streets (which draws no dots), and 736 ms under a keyboard pan that runs no
hover handlers at all. Those numbers are ordered by how much geometry the
rasteriser has to fill, not by anything the app does, and the earlier CPU
profile agreed — 95.5% of it sat in `(program)`, the rasteriser. So the hover
cost above is a real defect measured in a way the environment cannot distort
(hit-testing is pure CPU over the tile index), and it is *not* evidence that
hit-testing is what makes Max's map struggle.

> Max, 2026-09-10, on the earlier attempt to reproduce it: "It might be a
> product of the VM I'm working on."
> Stated by Max; not verifiable from the repo.

The one measurement nobody in this session can take is whether Max's browser
has a GPU at all. `chrome://gpu` reporting "WebGL: Software only" rather than
"Hardware accelerated" would explain a struggling map completely and would make
every app-side change marginal.

## Approaches considered

- **One query per mouse move, dispatched by layer** (agent's recommendation, not
  yet put to Max). Bind a single `mousemove` on the map, run one
  `queryRenderedFeatures` over the union of the layers the *current view* uses,
  and route the top feature to the handler that owns its layer. 19 → 1, and the
  four irrelevant layers drop out for free. The cost is that hover dispatch
  stops being MapLibre's job and becomes the app's, in one place that has to
  know which layers a view hovers.
- **Coalesce hover to one query per animation frame.** Cheaper to write and
  complementary: a mousemove that arrives twice in one frame does the work
  twice today. Does nothing about the 19.
- **Skip the popup rebuild when the pointer is still on the same feature.** The
  tooltip's HTML is regenerated on every move across one dot. Small beside the
  queries, and it is the same edit.
- **Do nothing until the environment question is settled.** Defensible: if the
  answer is a software rasteriser, this work will not be felt. It is still 19
  hit-tests where 1 would do, and it will be felt on a phone.
