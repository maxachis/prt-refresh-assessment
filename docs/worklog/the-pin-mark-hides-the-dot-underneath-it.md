# A pin mark hides the dot underneath it, and the tooltip changes without saying so

Inside a dropped pin the hover answered about a **pole** — stop id, which
network, whether it moved — and a pixel away, outside the pin, the same gesture
answered about a **location** and its bucket, with nothing saying the second
reading was still there underneath the first.
Fixed 2026-09-10, awaiting close — every dot now answers both, pole first, pin
or no pin.

## What was observed

> Max, 2026-09-10: "I noticed that when I hover over things that are within a
> pin, I get a different tooltip compared to when I don't hover over things in a
> pin. Why?"

Correct, and both tooltips are right about what they describe. Dropping a pin
draws the walk circle and both networks' poles inside it (`mapview.showPlace`),
and those two mark layers are added after the change layer, so they are above
it. Hover dispatch runs one `queryRenderedFeatures` per pointer move and routes
the **topmost** feature to whichever spec owns its layer
(`frontend/hover.ts`, wired in `main.ts:294`). So:

| Where the pointer is | Layer hit | What the tooltip says |
|---|---|---|
| inside a pin, on a pole | `stops-now-c` / `stops-prop-c` | `stopPopupHtml` — the stop's name, today or proposed, its PRT stop id, and `moved N m` where the id survived and the pole shifted |
| anywhere else, on a dot | the change layers | `dotLabel` — the bucket for the day in force, and for a removal the walk to the nearest surviving stop |

## Why it is not simply a bug

The two tooltips are two units of analysis, not two wordings of one.

A dot is a **location** — convention 2, aggregate above the stop id — and it
answers what happens to bus service at a place. A pin mark is a **single pole**,
which is the whole reason the pin exists: it breaks a location back into the two
networks' stops so a reader can see a renumbering, a consolidation or a 40 m
shift. Making them agree would mean giving one of those questions up.

## Why it is still worth a decision

While a pin is down the location reading at that spot is **unreachable**, and
nothing indicates it exists. The same pixel gives different information
depending on layer stacking a reader cannot see, which is how this was found —
by accident, by a reader who knew both readings existed.

It is also the narrow case of a wider habit: this map answers at four units
(location, pole, ground, place) and the unit in force is usually implied by
which view is selected. Here two units are live at once, in the same gesture,
and separated only by depth.

## Approaches considered

Not put to Max; all of these are the agent's, and none is started.

- **Say which unit is answering.** A one-line head on each tooltip — the stop's
  own name is already bold, so the pole's could carry "this pole" and the dot's
  "this location". Cheapest, and it does not recover the hidden reading.
- **Fold the location line into the pole's tooltip** when a pin is down, so
  hovering a pole says both what the pole is and what the location does. Recovers
  the reading with no new gesture. The cost is a taller tooltip on the densest
  part of the map, exactly where poles are two metres apart.
- **Let the reader choose the depth** — hovering with a modifier held, or a
  toggle in the pin key. Honest, invisible, and a discoverability problem of its
  own.
- **Leave it.** Defensible: the pin is an explicit request for the finer unit,
  and a reader who wants the coarser one can close the pin.

## How it was fixed

Max chose the second, on 2026-09-10. A mark's tooltip now carries the pole
first — name, network, stop id, and the metres it moved — then a rule, then the
location's own line beneath it, which is `dotLabel`'s output unchanged, so the
two readings cannot drift apart in wording or in day.

It costs no second hit test. The hover already runs one `queryRenderedFeatures`
per pointer move and took only the topmost feature; the dot under the mark was
in that same result and was being thrown away. `HoverSpec.html` now receives
the rest of the hit as `beneath`, and the stop-mark spec reads the dot out of
it (`hover.ts`, `mapview.stopMarkHoverSpecs`, wired in `main.ts`).

Two consequences worth knowing. The tooltip is taller, which is felt most where
poles cluster a few metres apart — the objection recorded against this approach
above, now shipped rather than answered. And where a mark stands on no dot at
all, nothing extra is printed, so the pole tooltip is exactly what it was.

Related: [`stop-marks-outlive-the-click-that-drew-them.md`](stop-marks-outlive-the-click-that-drew-them.md)
is the same marks failing to be erased, which makes this reach further than the
pin a reader is looking at — stale marks from an earlier click go on shadowing
dots elsewhere on the map.


## Then the other half: the pole reading was still pin-only

> Max, 2026-09-10: "Let's have it so all of this information is available
> regardless of whether a pole is down or not"

The fix above made the two tooltips agree wherever they overlapped, but it
made agreement conditional on a pin being down: with no pin, the pole half —
the stop's name, its id, whether the plan stands it somewhere else — still had
no way onto the screen except by clicking. Which is the same complaint one turn
later: one kerb, two readings, chosen by a gesture that has nothing to do with
the question.

Naming a dot after a pole is honest and is not an approximation.
`query.change_points` yields **one point per stop id** — 6,284 published poles
and 481 the plan adds — so a dot *is* a pole, and the map simply had no name
for it. What it lacked was the name on the wire: a packed point carried
`[lat, lon, published, id, removed, …]` and nothing else identifying.

So the layer gained a sixth fixed field, `name`, and a sparse `moved` map:

- **A column, not a parallel array.** The row is the format's unit; a second
  list aligned by position is one reordering away from naming every dot after
  its neighbour. `FIXED_FIELDS` went 5 → 6 on both sides
  (`query.NAME_AT`, `frontend/types.NAME`), which is the offset the tests on
  both sides pin.
- **`moved` is sparse, like `replacement`.** The plan stands 225 of the 6,765
  poles somewhere else; 6,540 nulls is not a column. It is keyed on the
  **published** point (`c:…`) and that is not a slip — a pole whose id the plan
  keeps is never a point of its own on the proposed side, because
  `is_new_place` rules the id out before it measures any distance. The dot that
  can carry the sentence is the one drawn on today's kerb, which is also the
  kerb the sentence is about, so it is phrased as something the plan does —
  "the plan stands this pole 34 m away" — rather than as a distance the pole
  has already travelled.
- **The mark suppresses it.** `dotLabel(…, { pole: false })` is passed by the
  one caller that has already printed the pole itself, so a tooltip inside a
  pin does not name the stop twice.

**The cost is 65 KB gzipped**, taking the change layer from 155 KB to 220 KB —
a 42% larger response for every reader, paid so the map gives one answer about
a kerb. That measurement is the thing to revisit if the layer ever needs to get
smaller: the names are the largest single thing in it that is not a number, and
a dictionary keyed by id was measured at 63 KB gzipped rather than 65, which is
not enough of a saving to buy back the alignment risk.
