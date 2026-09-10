# The marks around the pin borrow the dot palette

The marks the map paints when a reader selects a location sit on top of the
Stop-by-stop dots and were drawn in colours the key gives to buckets, so a
selection scattered what looked like findings across the map.
Fixed, awaiting close: both marks left the palette on 2026-09-09 — "stop today"
became ink, and "stop proposed" became a ring around an empty core.

## What was measured

Clicking a location draws the walk radius and then one mark per stop inside
it — `mapview.initMapLayers`, layers `stops-now-c` and `stops-prop-c`. Those
marks land on the change dots, which are coloured by bucket. Distances are
`cvd.worstCaseDistance` (the minimum over normal vision, protanopia,
deuteranopia and tritanopia), the same measure `cvd.test.ts` enforces on the
ramps:

| Mark | Nearest bucket | Worst-case ΔE |
|---|---|---|
| `stop today` **was** `#4aa3ff` | `doubled or better` | 11.0 |
| `stop today` **was** `#4aa3ff` | `new service` | 16.4 |
| `stop proposed` **was** `#ffa23a` fill | `halved or worse` | 16.7 |
| `stop proposed` **was** `#ffa23a` fill | `loses all service` | 23.9 |
| `stop today` **now** `#15181e` | `about the same` | 39.7 |
| `stop proposed` **now** `#ffffff` core | `about the same` | 47.9 |

For scale, the ramp's own floor between a loss bucket and a gain bucket is 40.

> Max reported the blue reading on 2026-09-09: a selected location "gets a
> blue circle to indicate selection, [which] confuses it with new service."

## What was done

Both marks now say what they always meant, but the **core** carries it and the
**ring** is decoration rather than the other way round:

- **The core says today.** Ink (`mapview.NOW`) where a stop stands today, white
  (`mapview.PROP_CORE`) where the plan is putting one on ground that has none.
- **The ring says the plan stops here.** Orange (`mapview.PROP`), and only ever
  a ring — as a filled disc it was the thing colliding with "halved or worse".

So a stop both networks keep reads as an ink core in an orange ring; a stop only
the plan has reads as an empty orange ring; a stop only today has reads as bare
ink. The two are pinned against every keyed bucket by `cvd.test.ts` at a floor
of 25 — lower than the ramp's 40 on purpose, because these marks only have to be
*tellable* from the dots underneath rather than orderable against them.

Blue still means today in the panel's trip chart, its route lists and the
Travel-time view, where nothing can be mistaken for a dot; orange likewise stays
solid on the panel's own bars, which is why the ring style is scoped to
`#pin-key`.

> Max asked for the second half on 2026-09-09 — "Maybe we give proposed stops
> also an ink core?" A literal ink core would have collapsed "stop proposed"
> into "both, same spot", since ink is what says *today*; core-says-today,
> ring-says-proposed keeps all three marks apart and was accepted.

## Approaches considered

- **Recolour the marks (taken).** Cheapest, and it keeps the marks as circles,
  which is what they are on the map.
- **Change the shape instead** — squares for the pin marks, since no bucket dot
  is ever a square. Rejected by Max in favour of the recolour.
- **An ink core on the proposed mark too.** Proposed by Max, declined by the
  agent for the reason above and replaced with the core/ring split, which Max
  accepted.
- **Move the `new service` bucket off blue.** Not proposed to Max: `NEW_COLOR`
  is shared with the Streets and One-seat layers, so it would repaint three
  views to fix one overlap, and the ramp's blue is the one that has been
  published in screenshots.

## What would settle it

Max's eye on the map: whether an empty orange ring still reads as a stop rather
than as the walk radius drawn small, at the zooms where both are on screen.
