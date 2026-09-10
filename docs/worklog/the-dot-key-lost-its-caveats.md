# The dot key lost its caveats

The Stop-by-stop key carried three paragraphs under its rows — what the counts
measure, why a street the plan adds stops to can have no dot, and what a removed
stop does not mean. Max had them taken out on 2026-09-10.
Open: the two misreadings the middle one was written for are unguarded again,
and nothing else on the map answers them at the moment a reader has the
question.

> Max's instruction, 2026-09-10: "can you remove the copy for the legend at
> stop-by-stop", quoting all three paragraphs.

## What came out

1. **"Buses per day within the walk radius, both directions — counting
   locations, not riders."** What the numbers beside the rows are. The
   Locations/Riders switch sits directly above them, so this was the least
   load-bearing of the three.

2. **"Dots mark today's stops, plus the places the plan puts a stop where none
   stands within 150 m. A stop the plan takes away is drawn as a cross instead
   of a colour… A stop added right beside an existing one changes a dot's
   colour rather than adding one; Streets colours the pavement itself, and
   shows the rest."** This is the one with a history. The point set is every
   stop a bus calls at today plus the proposed stops with nothing within 150 m;
   **infill** — a stop the plan adds a couple of hundred metres from one that
   already exists — earns neither, so the gain lands in the colour of the
   neighbouring dot and the new stop's own kerb stays bare. Two separate
   readers, PPT and PRT, took bare ground beside a recoloured dot as the plan's
   new service missing from the data. The sentence also had to name both halves
   of the point set, because the blue "new service" row is precisely the half
   that does not sit at a stop today.

3. **"A removed stop is not the same as a corner losing its bus: countywide, of
   the 972 stops the plan removes, 245 have another stop within a 400 m walk
   and 193 more within 800 m. The remaining 534 have none."** Left off, the
   cross row reads as 972 corners losing their buses. The 534 with nothing
   inside an 800 m walk are the ones worth the alarm, and they only read as
   alarming if the other 438 are not counted alongside them.

The boardings caveat stays. It is the same kind of sentence, but convention 15
requires it: boardings can only ever exist at stops that run today, so a key
counting riders has to say it is measuring what is at risk and never what is
gained, and the locations with no figure have to be named rather than summed as
zeros.

## Where each fact still lives

- The panel's empty state and its key note describe the marks a click puts on
  the map, and `/findings` carries the removal split with all 293 clusters
  ranked.
- `frontend/change.ts`'s `REMOVED_STOP` docstring and `query.is_new_place` hold
  the reasoning for the 150 m rule and the cross.
- Nothing states any of it **on the map, at the moment the reader is looking at
  the mark**, which is what these three did.

## What would settle it

Whether the infill reading needs a home on the map at all, and if so a cheaper
one than a paragraph — the Streets view answers it (McMonagle Avenue has no dot
and draws blue there), so a pointer to that view, or a note on the hover of a
recoloured dot, would cost a line rather than a screenful. Filed rather than
built: Max asked for the copy gone, not for a replacement.
