# The marks around the pin borrow the dot palette

The marks the map paints when a reader selects a location sit on top of the
Stop-by-stop dots and are drawn in colours the key gives to buckets, so a
selection scatters what look like findings across the map.
Open, half fixed: "stop today" moved to ink on 2026-09-09; "stop proposed"
is still an orange a worst-case ΔE 16.7 from "halved or worse".

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
| `stop proposed` `#ffa23a` | `halved or worse` | 16.7 |
| `stop proposed` `#ffa23a` | `loses all service` | 23.9 |
| `stop today` **now** `#15181e` | `about the same` | 39.7 |

For scale, the ramp's own floor between a loss bucket and a gain bucket is 40.

> Max reported the blue reading on 2026-09-09: a selected location "gets a
> blue circle to indicate selection, [which] confuses it with new service."

## What was done, and what was not

"Stop today" is now ink (`mapview.NOW`), pinned against every keyed bucket by
`cvd.test.ts` at a floor of 25 — lower than the ramp's 40 on purpose, because
these marks only have to be *tellable* from the dots underneath rather than
orderable against them. Blue still means today in the panel's trip chart, its
route lists and the Travel-time view, where nothing can be mistaken for a dot.

**"Stop proposed" was left orange.** Max chose the ink-for-today option from
three; moving both marks in one pass would have left nothing on screen
carrying the today/proposed pairing the panel beside it uses. The orange
collision is real but weaker than the blue one was — it is nearest to "halved
or worse", which is a *loss* bucket, so a misread says the plan cut service at
a corner where in fact it proposes a stop. That is the wrong direction to be
sloppy in, and it is why this entry stays open rather than being closed as
"good enough".

## Approaches considered

- **Recolour the marks (taken, half).** Cheapest, and it keeps the marks as
  circles, which is what they are on the map.
- **Change the shape instead** — squares for the pin marks, since no bucket
  dot is ever a square. Rejected by Max in favour of the recolour. It remains
  the option that fixes both marks at once, and would settle the orange half
  too.
- **Move the `new service` bucket off blue.** Not proposed to Max: `NEW_COLOR`
  is shared with the Streets and One-seat layers, so it would repaint three
  views to fix one overlap, and the ramp's blue is the one that has been
  published in screenshots.

## What would settle it

Whether "stop proposed" should follow "stop today" out of the palette — by
colour, or by giving both marks a shape no bucket uses. The measurement above
is the whole input; the trade is one more departure from the site's
today/proposed convention against a 16.7 ΔE against a loss bucket.
