# A walk is drawn — and timed — straight through the blocks

**Observed:** the travel-time view drew every walk leg as a straight line and
charged the rider for the crow's distance, so a 570 m walk out of the Strip
District crossed a rail cut and the face of a hillside on a diagonal no
pedestrian can take — and the clock billed seven minutes for a walk that
really takes twenty-nine.
**Where it stands:** fixed, awaiting close. Walks are now routed on a
pedestrian network built from OpenStreetMap, and the same search produces
both the drawn line and the timed distance. Max's to close; two judgement
calls inside the fix are his to overturn, and they are named below.

## What was wrong

`journey.py` had no street network. Access, egress and transfer walks were all
`metres_between(a, b) / WALK_SPEED_M_PER_MIN` — a straight-line distance at a
constant speed — and `query.itinerary_of` gave a walk leg no `path`, so the
map fell back to a two-point line. The dashes and the legend said so on
screen, which made the drawing defensible; nothing made the *timing*
defensible. Pittsburgh is close to the worst American city in which to assume
a straight-line walk — hillsides, three rivers, a busway, a rail cut, and
public stairways that are the actual route — so the error was never a uniform
underestimate. It was near zero in the Strip District grid and enormous on
the slopes.

Max raised it on 2026-08-22, as the first of three observations against a
Lawrenceville → Crawford-Roberts trip, and then chose the full fix over the
cheaper halves.

## What was built

- `ingest_osm_walk.py` fetches every walkable `highway` way in Allegheny
  County's bounding box from Overpass and caches it, gzipped and committed,
  at `data/raw/osm/allegheny_walk.json.gz` (16 MB). Motorways, trunk roads
  and anything tagged `foot=no`/`access=private` are excluded;
  `highway=steps` is deliberately kept.
- `src/refresh/walking.py` routes on it: 1,003,168 nodes, 1,089,957 segments,
  25,975 km of walkable ways. The graph is **not** contracted to junctions —
  keeping every OSM node costs ~38 MB of packed arrays and buys a ~12 m snap
  accuracy and a drawn path that *is* the node chain, with no geometry store
  to keep in step with it.
- `journey.py` takes an optional network and measures all four of its walk
  distances on it. `analyze_travel_time.py` and `build_webdb.py` refuse to
  run without it, so a stale artifact cannot quietly republish old numbers
  under the new method.

Validated against controls before the re-run: 1.14–1.21× inside the Strip
District grid, unroutable across the Monongahela where no bridge is near, and
the pinned Strip → Hill District pair routing west to Bigelow Boulevard —
which is in fact the only way up that bluff on foot.

## How much it moves

Across 400 sampled stop pairs 50–400 m apart, the walk is a median **1.22×**
its own straight line (p75 1.45, p95 2.17, max 4.19). Two figures matter more
than the median:

- **About a third of stop pairs within 400 m as the crow flies are not within
  a 400 m walk of each other** — 48,320 of 70,430 candidate transfer links
  survive on the current feed. A great many synthesised connections simply
  stop existing.
- On Max's pinned pair the current network's median went from **23.3 to 53.4
  minutes**, almost all of it the final walk: 568 m straight, 2,332 m on foot
  around the bluff. That pair is an outlier, not the typical case — see below.

**And then the comparison barely moved, which is the finding.** The full
re-run (38.4 min, 369 pairs) restated both networks' absolute times upward by
almost exactly the same amount, so the published *change* figures survived
nearly intact:

| | before (straight) | after (routed) |
|---|---|---|
| current median, across pairs | 51.3 min | 55.7 min (+3.9 per pair) |
| proposed median, across pairs | 46.8 min | 52.4 min (+3.7 per pair) |
| the change figure itself | — | moved a median of **−0.1 min** |
| pairs the plan makes faster / slower | 197 / 132 | 202 / 130 |
| **material sign reversals caused by the method change** | — | **0 of 337** |

So the straight-line assumption was inflating both networks by about the same
amount and the before-and-after comparison was robust to it all along. That
was *argued* in the first version of this entry — "a symmetric underestimate
cancels in the change figure" — and is now measured. What it does **not**
excuse is the absolute times, which were understated by roughly four minutes
a trip and are quoted on their own all over the site.

One thing did get worse rather than merely more accurate: **6 pairs stopped
being comparable at all** (`no_journey` went from 2 to 8), because the walks
their itineraries depended on turned out not to exist on the ground.

Routing can only ever make a network look slower, never faster, so it cannot
flatter either side by accident. Travel times published before this are still
not comparable to those published after — but the *direction and size of the
change*, which is what the findings actually quote, turns out to be.

## The two judgement calls inside the fix

Both are agent decisions, not Max's, and either could be reversed without
touching the network layer.

1. **The two radii stopped meaning the same thing.**
   `MAX_TRANSFER_WALK_M` became a *walking* distance, because it is a claim
   about how far a rider will walk and this layer owns it. `MAX_ACCESS_WALK_M`
   still picks its candidates by *straight line*, because it is convention 4's
   published quarter mile, shared with every coverage number on the site —
   redefining it here would make one point read as served by the coverage
   layer and unserved by the journey layer. Only the price of that walk
   changed. The asymmetry is deliberate and is the part most worth a second
   opinion.
2. **`WALK_DETOUR_BOUND = 3.0`.** Past three times the radius a walk is
   treated as not happening at all, rather than sold at fifteen minutes. It
   costs ~2.4% of transfer candidates. The number is chosen, not sourced.

## Approaches considered and rejected

- **A detour factor** (multiply the straight line by ~1.3). Rejected before
  the build: it is a single number applied to a city whose circuity runs from
  1.0 to unbounded, and it would put a sourced-looking figure on screen no
  better informed than the old one at any specific pair. The measured spread
  above — p95 of 2.17 against a median of 1.22 — is the evidence that it
  would have been wrong where it mattered.
- **Draw walks on the street while still timing them straight.** Rejected:
  drawing a route the clock does not charge for is worse than an obviously
  schematic line.
- **Snap to the nearest point on a segment rather than the nearest node.**
  Not built. Mean segment is 23.8 m, so each end of a walk carries up to
  ~12 m of snap error — about nine seconds. Immaterial against the effects
  being measured, and it would complicate path reconstruction.

*All agent judgements; a later session should feel free to overturn them.*

## Resolution

Fixed, awaiting close. Related:
[[the-last-walk-doglegs-via-a-stop-nobody-boards]] is a second walk defect
visible in the same itinerary and is **not** fixed by this — it is about which
stop the router is allowed to walk in from, not how far the walk is.
[[transfer-radius-favours-one-network]] has had its premise changed by this
work and has been updated. [[stairways-are-timed-as-though-they-were-level]]
is a gap this fix *created*: the router now walks people up Pittsburgh's
stairways and charges them a level-ground pace to do it. [[one-point-cannot-represent-a-township]] is the
same class of problem one unit up.
