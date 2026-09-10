# A pin mark hides the dot underneath it, and the tooltip changes without saying so

Inside a dropped pin the hover answers about a **pole** — stop id, which
network, whether it moved — and a pixel away, outside the pin, the same gesture
answers about a **location** and its bucket; nothing on screen says the second
reading is still there underneath the first.
Open, decision owed — raised by Max on 2026-09-10, deliberately not fixed.

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
  and a reader who wants the coarser one can close the pin. It is where this
  stands.

Related: [`stop-marks-outlive-the-click-that-drew-them.md`](stop-marks-outlive-the-click-that-drew-them.md)
is the same marks failing to be erased, which makes this reach further than the
pin a reader is looking at — stale marks from an earlier click go on shadowing
dots elsewhere on the map.
