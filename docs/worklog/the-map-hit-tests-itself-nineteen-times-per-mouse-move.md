# The map hit-tests itself nineteen times per mouse move

Every pointer movement over the map ran 19 separate `queryRenderedFeatures`
calls — three for each of six hover layers, including four that the current
view was not showing — costing 2.5–3.5 ms of main-thread JavaScript per move,
and spending it again on every frame of a drag, because a pan is a stream of
mouse moves.
Fixed, awaiting close: 19 queries became 1 on 2026-09-10, and the pixel count
-- the lever that actually mattered for the frame rate that prompted it -- was
capped in the same change.

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

**Max's browser has no GPU at all**, which is the answer to the original
complaint. `chrome://gpu` on his VM, 2026-09-10, reports every line off:
Canvas, compositing, rasterisation, video decode and OpenGL all "software only,
hardware acceleration disabled", and Vulkan, Skia Graphite, WebGPU and **WebGL**
"disabled". Every pixel of the map -- and of the browser window around it -- is
drawn by the CPU there. A vector map reprojecting thousands of features per
frame is the workload that collapses first under that, so the frame rate he
reports is explained by the environment rather than by anything in this entry.
WebGL itself still resolves, through Mesa's CPU rasteriser: the map page's own
context reports `llvmpipe, or similar` as its renderer. So MapLibre runs, and
every vertex and every fragment of every frame is computed on the CPU.

> Stated by Max; from his machine, and not reproducible here.

That does not retire the 19 queries, and it changes what this session's own
browser is good for. The headless Chrome used for the measurements above is
**also llvmpipe**, so it is a poor stand-in for a visitor with a GPU and a
faithful one for Max's VM: frame times taken here cannot predict what the
public site feels like, but an A/B between two ways of drawing the same map
transfers directly to the machine he is reading it on.

The app-side lever with real leverage for a CPU-only renderer is the *fill* --
canvas pixel ratio, symbol fade, world copies, stroke work -- rather than the
hit-testing above, and it is testable here.

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

## What was done

Max set the goal on 2026-09-10: "The site should be robust on weak hardware."
Two changes, both measured on this repo's own llvmpipe browser, which is the
right test bed for exactly this and the wrong one for anything else.

**The pixel count** (`frontend/hardware.ts`). The canvas is capped at 2 device
pixels per CSS pixel everywhere, and at 1 where the WebGL renderer names itself
a software rasteriser; the label fade drops to 0 in that case, and world copies
are off for everyone. At an emulated device pixel ratio of 2, dragging the
countywide dot view: **579 ms per frame uncapped, 274 ms capped** (two runs
each; 617/541 against 265/282). This is the change that speaks to the original
complaint, and it does nothing at all on a screen already at ratio 1.

**The hit tests** (`frontend/hover.ts`). One `queryRenderedFeatures` per
pointer move over the layers the current view is drawing, with the topmost
feature routed to whichever spec owns its layer, and the tooltip left alone
while the pointer stays on one feature. **19 → 1, and 5.1 ms → 1.0 ms of
main-thread JavaScript per move at zoom 12**; p90 17.4 → 5.1 ms. Two popups
could previously stand open at once — the pin marks owned a second one — and
now cannot.

A third lever was rejected rather than deferred: **thinning the dots at low
zoom**. The key counts the rows, not what survived a filter, so a map drawing
half the dots would print a number no reader could check against what they can
see. Max's ruling that every stop is displayed regardless of pin points the
same way. **It would also have bought nothing** — see the measurement below.

## The number of dots on screen does not measurably cost anything

> Max, 2026-09-10: "Now does the number of dots rendered on the screen have an
> impact on performance?"

Measured rather than reasoned about, on the llvmpipe browser, holding the
camera, basemap and viewport constant (1400x850, device pixel ratio 1) and
comparing a mouse drag with every dot drawn against the identical drag with all
nine keyed rows switched off, which filters the dots out and changes nothing
else. Frame times in milliseconds, median and 75th percentile:

| Scope | Dots drawn | Dots off |
|---|---|---|
| Zoom 12, 2,967 locations in view | 33/167, 150/176, 117/167 | 132/150, 33/185, 138/185 |
| Zoom 9.5, 6,765 locations in view | 33/200, 117/170 | 113/138, 47/216 |

The two arms are indistinguishable: each spans roughly 33-150 ms whichever way
round it is run, and the arm order was alternated so drift cannot masquerade as
an effect. **Dropping every dot on screen does not speed the map up.** What
costs is the number of *pixels* the CPU has to fill -- the basemap's own raster
work dominates -- which is why capping the canvas halved the frame time and
removing 6,765 dots does not move it.

Two caveats. This is a software rasteriser; a GPU has different bottlenecks, and
nothing here predicts one. And it says the dots are lost in the noise, not that
they are free.

> An earlier single run of this comparison read 200 ms against 250 ms and looked
> like a difference. The "dots off" arm had not actually taken -- the key
> re-renders itself on every toggle, so a captured list of its buttons goes
> stale after the first click and 8 of the 9 rows were never switched off. Any
> A/B against this key has to re-query the button between clicks and assert the
> off-count before trusting the arm.

## The basemap is the frame, and a raster one is roughly ten times cheaper

Measured 2026-09-10, after Max asked what else could be contributing. Every
figure below is from a bare MapLibre map on this repo's llvmpipe browser --
none of this site's own layers on it at all -- at the same camera, viewport and
drag. **Absolute frame times are not comparable between runs** on this machine:
the same bare vector map read 564 ms in one run and 1,113 ms in another, because
several browser contexts were competing. Only the within-run comparisons below
carry.

The basemap is `https://tiles.openfreemap.org/styles/positron`, which is **55
layers** -- 26 line, 19 symbol, 9 fill -- re-tessellated and re-filled every
frame.

- **Hiding every vector layer** took a drag from 564-868 ms per frame to
  **37-47 ms** in the same run. Substantially the whole frame is the basemap.
- **Hiding all 19 label layers changed nothing** (1,033-1,113 ms against
  1,102-1,118 ms, warm). It is not glyph placement or text collision.
- **A raster basemap against the vector one**, arms alternated twice in one run:
  vector **952 / 1,500 / 1,300 / 441 ms** median, raster **115 / 52 / 109 /
  39 ms**. The two distributions do not overlap. Call it an order of magnitude;
  the spread is too wide to quote a ratio.

The raster arm was CARTO's `light_all`, which is Positron -- the same design,
which is why it was the one tried. Its land fill samples as `#fafaf8` against
the `#f2efe9` that `contrast.ts` pins the dot palette against: lighter, so every
mark's contrast against the ground goes *up* slightly, and no contrast floor is
at risk.

Nothing in this site inserts a layer relative to a basemap layer id -- every
`addLayer` anchors to one of our own -- so a raster style is a drop-in for the
drawing code.

**Not done, and it is a decision rather than an implementation.** Serving
someone else's raster tiles from a public site is a dependency with terms
attached, and the tile source is Max's to choose. See the open questions at the
bottom of this entry.

## What else has not been addressed

- **The canvas can go below one device pixel per CSS pixel.** `pixelRatio: 0.75`
  on a software renderer is about 44% fewer fragments again, at a cost in
  crispness. Untested.
- **The surface view's 48,500 fill polygons have never been measured.** The dot
  measurement above says our *dots* are free; the 100 m surface is a different
  layer and the heaviest thing this site draws.
- **The API sends no `Cache-Control`.** Every radius switch and every reload
  re-fetches the change layer (155 KB gzipped, 526 KB parsed) and the surface
  (1.3 MB). Not frame rate; it is still "the map feels slow".
- **GeoJSON parse and tiling happen on the main thread at layer load** -- 5,900
  dots, 48,500 cells. A stall on load and on each radius change.
- **Pan inertia and eased zoom keep rendering after the gesture ends**, which at
  one frame per second is a tail measured in seconds.

## Open questions

1. **Which raster tiles, if any.** CARTO's are what was measured and their terms
   govern a public site's use of them; self-rendering the same style to raster
   and serving it from the deploy box is the alternative that owes nobody.
2. **Who gets the raster basemap.** Renderer-conditional, the way the pixel cap
   already is, would leave a reader with a GPU the vector map and give a
   CPU-only reader the fast one -- at the cost of two maps to keep looking alike.

What none of this establishes is what the site feels like to a visitor with a
GPU. Nobody in this session can measure that; it needs a real phone pointed at
the local server.