# The dot's hover reported a district, not the stop under the cursor

Hovering a dot in Stop-by-stop printed the buses within a 400 m walk — 1,591
per weekday at a downtown dot, which is most of PRT's network and not a stop.
Fixed 2026-09-10, awaiting close — the tooltip, the dot's colour and the key
are all the **kerb's** own buses now, and the walk radius left this view
entirely for the answer panel and the Surface view.

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

## The rule for the plan's side of a kerb

Today's side is the departures at every current pole on that kerb. The plan's
side is read at whatever pole the plan runs there — the dot's own id first,
then the same 25 m `is_removed_stop` uses. Joining on the id alone would print
"37 → 0 buses at this stop" at every kerb PRT renumbers, which is convention
3's whole subject, and it would put the map at odds with its own removal cross:
a pole with no cross, reading zero.

The first version of this took the *larger* of two proposed poles inside the
25 m rather than the sum, for `cluster_trips`'s reason one unit down. That was
right while the tooltip was a claim about one pole and wrong once the colour
came with it: both sides are summed now, symmetrically, which is what makes a
consolidation read as one. See the next section.

## The colour followed the numbers, later the same day

The first fix left the tooltip holding two units at once — the pole's trips
under the radius's colour — and scoped the label "more service **nearby**" to
keep the pair from reading as a contradiction. They disagreed in direction on
**1,277 of 6,284 dots (20.3%)**: 494 painted "more service" whose own pole
loses trips, 458 painted "about the same".

Max rejected that as the wrong half to fix:

> "at present, coloration leverages the misleading location scope — it's
> showing the change in service based on the walk, rather than focusing on the
> change in service at that stop. If hover already shows that change in service
> at the stop level only, why have coloration communicate something potentially
> different?"

and, on what it would cost: *"This may mean the published figures change, and
that's fine, if it is in the service of accuracy."*

**I had argued the other way and was wrong.** The case against recolouring was
that it would move published figures and break conventions 2 and 3. The
published figures do not live on this key — they live in the `change` table,
which the panel prints and `docs/answers/` publishes, and it stayed exactly
where it was. What actually moved is what the *key* counts, which was never a
published number and is now labelled "stops in view" so it cannot be mistaken
for one. The convention-3 objection was real and is answered by the unit below,
not by the radius. The general shape of the mistake: I defended the existing
scope because the numbers *derived* from it were published, without checking
whether the thing on screen was one of them.

## The unit is the kerb, not the pole

Recolouring per raw pole would have been wrong for a reason neither of us had
raised: **PRT consolidates poles, and a consolidation paints as a gain.** At
c:10246 two poles of 15 weekday buses each become one of 22 — per pole that
reads "15 → 22, more service" twice; per kerb it is 30 → 22, less service. 208
kerbs consolidate that way, and 112 dots read a gain per pole that the kerb
does not.

So the unit is every pole of each network within `query.STOP_SAME_POLE_M`
(25 m) of the dot, summed on both sides (`query.kerb_departures`), and the
dot's own stop id is counted first — without that, a pole the plan stands 84 m
away reads as losing all of its service. 25 m because `is_removed_stop` and
`is_new_place` already share it: three answers about one kerb decided by three
distances would be three maps.

Where this lands against the alternatives: kerb against the 400 m radius
disagrees in direction on 21.7% of dots, pole against radius 20.3%, either
against the strict 150 m radius 10.2%. 47.7% of dots share a kerb with another
dot; 467 dots (7.4%) fall in a different bucket per kerb than per pole.

## The figures that moved, and the two that are now pinned side by side

The key's weekday Riders reading of "loses all service" went from the published
**580 boardings (0.8% of 73,408)** to **6,515 (8.9%)**. Both are true and they
are not each other: 0.8% is the riders at a *location* with no bus within a
quarter mile, 8.9% is the riders at a *stop* whose own kerb loses every bus,
and the gap is exactly the riders who can walk to another stop.
`tests/test_query.py` pins them in adjacent tests — the published one read off
the `change` table, the map's read off the layer — with a docstring on each
saying which sentence belongs to it. A screenshot of 8.9% captioned with the
published sentence would be a serious misquote.

Two wording consequences in the key. The head counts "**stops** in view", never
locations, and the Locations/Riders switch became Stops/Riders. And the walk
radius came off that head, appearing only when the surface is drawn and then
labelled as the surface's: "· a weekday · surface: 400 m walk". A bare "400 m
walk" over a count of kerbs would hand a reader a scope that no longer applies
to the number beside it.

The `nearby` scope word is gone from the tooltip, since the two channels no
longer say different things. A pole the plan adds still gets a sentence rather
than a bucket label ("the plan adds a stop here"), which is unchanged.

Cost: 0.45 s per radius to sum the kerbs, paid once per radius because
`/api/change` is cached by `cached_layer`. No change to the wire size.

## What was deliberately left alone

The **answer panel** — the thing Max was actually looking at when he asked —
still reads "within 400 m", and still prints 1,591 → 2,178 there. It answers
"what changes here?" for a clicked point, it is shared with the Surface view,
and it says its scope on its face. Max chose to leave it (2026-09-10). Making
it lead with the pole when the click lands on a dot is the open option, and it
needs the panel to know how it was opened.
