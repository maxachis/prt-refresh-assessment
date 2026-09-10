# The dot's hover reported a district, not the stop under the cursor

Hovering a dot in Stop-by-stop printed the buses within a 400 m walk — 1,591
per weekday at a downtown dot, which is most of PRT's network and not a stop.
Fixed 2026-09-10, awaiting close — the tooltip counts the pole's own buses now,
and the walk radius survives in that tooltip only as one word.

## What was observed

> Max, 2026-09-10, of the reading at 40.44531, −79.99173: "Does it make sense
> to have this many trips in a single day passing through a stop?"

The number was right and was not about a stop. Within 400 m of that point sit
16 stops served by 37 routes / 68 route-directions, both directions counted, so
1,591 weekday trips is about 23 per route-direction — an ordinary all-day
route, sixty-eight times over. The pole beside the click carries 167.

> Max, same exchange: "This is a stop-by-stop view, so when someone hovers over
> a stop, they expect to get information about that stop only, not about the
> wider location, which is served by the Surface view."

## What was actually on the wire

The packed point carried the walk radius's own trip counts per day type, and
**nothing but the dot's tooltip ever read them** — the legend counts buckets and
boardings, the panel measures its own point, the surface has its own layer. So
the fix was a replacement, not an addition: the radius counts left the row and
the pole's took their slots. The layer got 15 KB smaller (205 KB gzipped
against 220 KB).

## The rule for the plan's side of a pole

Today's side is the stop id's own departures. The plan's side is read at
whatever pole the plan runs on that kerb — the id first, then the same 25 m
`is_removed_stop` uses. Joining on the id alone would print "37 → 0 buses at
this stop" at every kerb PRT renumbers, which is convention 3's whole subject,
and it would put the map at odds with its own removal cross: a pole with no
cross, reading zero. Where two proposed poles fall inside those 25 m the larger
is taken rather than the sum, for `cluster_trips`'s reason one unit down — one
kerb described twice is not twice the service.

## Why the colour now says "nearby"

The dot's **colour** is still the walk radius's answer, and it has to be: it is
what the key counts and what `data/coverage_change.csv` and `docs/answers/`
publish. So the tooltip holds two units at once, and they disagree in direction
on **1,277 of 6,284 dots (20.3%)** — 494 painted "more service" whose own pole
loses trips, 458 painted "about the same". That is two true sentences about one
corner, the same shape `is_removed_stop`'s docstring describes for a cross on a
dot painted "more service": PRT thinning poles on a corridor it is
strengthening.

Three ways to hold that were put to Max on 2026-09-10, who chose the first:

- **Pole's trips, bucket label kept but scoped** — "more service nearby". The
  scope word is the entire remnant of the walk radius in the tooltip, and
  without it one dot in five reads as the map contradicting itself.
- **Pole's trips alone**, no label — rejected: the colour would go unexplained
  under the cursor at the moment a reader is questioning it.
- **Recolour the view per pole** — rejected, and it is worth recording why,
  because it is the obvious-looking fix: it would change the published bucket
  counts and break conventions 2 and 3 outright, since adjacent stop ids split
  route sets and a renumbered pole would read as a total loss.

A pole the plan adds is exempt from the scope word: its label ("the plan adds a
stop here") is a sentence about the pole, so "nearby" would attach to the wrong
noun.

## What was deliberately left alone

The **answer panel** — the thing Max was actually looking at when he asked —
still reads "within 400 m", and still prints 1,591 → 2,178 there. It answers
"what changes here?" for a clicked point, it is shared with the Surface view,
and it says its scope on its face. Max chose to leave it (2026-09-10). Making
it lead with the pole when the click lands on a dot is the open option, and it
needs the panel to know how it was opened.
