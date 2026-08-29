# The surface counts ground, not people

**Observed:** the magnitude surface reports square kilometres and says in its
own key "of ground in view, not of people", so the map can show where coverage
moves but never how many residents it moves under — the one figure a
public-comment reader actually wants for their neighbourhood.
**Where it stands:** **closed 2026-08-29 by Max.** Built the same day — the surface
key now has a Ground/People switch (`?surfaceunit=people`) and it reproduces
the published equity rows exactly, not to within 3%. What remains open is
the companion wording question, now over three people-shaped numbers rather
than two, and it is tracked on its own entry rather than here —
[`the-site-has-two-numbers-that-look-like-people.md`](the-site-has-two-numbers-that-look-like-people.md).

## What is being asked for

A population weighting for the change map, the way `?weight=riders` weights it
by boardings (convention 15): pan to a neighbourhood and read how many people
there lose or gain a bus, rather than how many square kilometres do.

## It belongs on the surface, not on the dots

This is the whole design decision, and it is arithmetic rather than taste.

**Boardings could ride on the dots because they are one-to-one with a stop.**
Each boarding happens at exactly one dot, so summing across the dots in view
counts each one once. Population is not like that. Measured 2026-08-29: a
resident of the three counties sits within 400 m of **3.4 current stops on
average**, so "people within a walk of this dot", summed over the 5,751 dots,
totals **6,106,393 against a population of 1,773,456** — 3.4× the people who
exist. A third position on the Locations/Riders switch is therefore not a
smaller version of the same change; it is a different geometry wearing the
same control, which is the arrangement most likely to be read wrong.

The escape is to assign each resident to one stop — nearest-stop, Voronoi
style — and it was rejected here (agent-derived, overturnable): it invents an
assignment the data does not carry, putting a person on a dot they may not use,
and it would answer "how many people lose service" differently from every
other population figure in the repo.

**The 100 m lattice tessellates, which is exactly what is needed.** Each census
block falls in exactly one cell: the 33,131 populated blocks land in 28,079
distinct cells, no overlap, nothing invented, and the sum over cells in view is
each resident counted once. The surface is also the layer whose stated bias
this fixes — convention 10's "a square kilometre of hillside counts like a
square kilometre of Brookline" is the caveat a population weighting retires,
and the surface key already ends with the sentence that would be replaced.

## It reconciles with the published figure exactly

Built against `data/census_blocks.csv` and `census_block_groups.csv`, at 400 m,
weekday, Allegheny only: **−68,989 / +20,223**, which is the
`allegheny / all_residents / WEEKDAYS-ANY-MINIMUM / 400` row of
`data/equity_change.csv` to the person. `tests/test_population.py` pins it, so
the map and the published CSV cannot drift apart silently.

One thing to keep straight when quoting the two together: `/findings` prints
the **week-any** row, −68,989 / +20,095, and the map's key necessarily answers
per day type. The loss figure is the same; the weekday gain is 128 higher,
because a place gaining only weekend service passes a week-any test and fails
a weekday one. See the companion entry.

The first cut, using the **cell centre**, was 3% off (70,475 / 20,684). Two
things closed that gap, and both are worth naming because either alone leaves
a residual:

- **Coverage is decided at the resident's own block point**, not at the centre
  of the cell they are drawn in. The cell is display only. Max's call — the
  alternative was a map whose totals were 1,486 people away from the page it
  sits beside, with no way for a reader to tell which was which.
- **The block counts are rescaled to the ACS `race_total`**, not to
  `census_block_groups.population`. This is what `analyze_equity_change.py`'s
  own weighting does; using `population` gives 69,620 / 19,597, about 1% out —
  more than the whole gain side of some day types. The two columns differ by
  ~12,000 people in Allegheny.

The consequence of the first decision is deliberate and has to stay documented:
a cell the surface paints "loses all service" (a centre test) can hold
residents counted as keeping a bus (a block-point test). The colour describes
the ground; the number describes the people. Both caveats ship in `/api/meta`.

Day types behave as expected and are worth having: at 400 m the weekday loss is
72,400 against a Saturday loss of 52,264 and a Sunday one of 48,687, while
weekend *gains* are roughly double the weekday's (45,779 Saturday, 49,794
Sunday, against 27,130) — the plan's weekend service is its most redistributive
part, and no published figure currently says so by population.

## What it cost

More than the ridership weighting did, and the difference is where the data
lives. No census data was in `refresh.db` at all, so this one touched the
pipeline: **the census ingest is now a prerequisite of a database build**, which
used to need only PRT and OSM. It fails loudly with the command to run rather
than silently building a database with an empty people layer. The stored layer
is one row per (radius, day, cell) with the four class weights — 28,075
inhabited cells — and the database went from 127 MB to 143 MB.

The client work was small, as expected: the viewport tally copies the surface's
own cell-centre-in-bounds test, and the key copies the Locations/Riders switch
pattern.

## How the three open questions were settled

1. **Which denominator.** Neither: the key counts the viewport, not a county,
   because a reader panning a map is asking about what is on screen. The
   county scope stays where the published totals are quoted, on `/findings`.
   (Agent-derived; overturnable if the key turns out to read as a county
   figure.)
2. **Cell centre or block point.** Block point, cell for display — Max's
   decision, and the reason the reconciliation above is exact.
3. **People the surface cannot see.** They are counted, in a fourth class:
   *have no bus either way*. Every populated cell is in the layer whether or
   not any bus reaches it, so the four classes partition the whole population
   in view and the denominator is on screen rather than implied.
   `test_every_resident_lands_in_exactly_one_class` holds that partition.

## What is no longer a reason not to

`docs/WEBAPP.md`'s Known gaps says the equity findings are a page and not a
layer because "per convention 12 a block group is covered or not at a single
point, so a map of it would overstate its own precision". That sentence is
**stale**: `analyze_equity_change.py` now measures at the interior point of
every populated block — 33,131 of them rather than 1,465 block-group centres —
which is why the published coverage share moved from 51.9% to 53.3%. The
ecological caveat still stands (a block's residents are treated as living at
one point, and demographics still come from the block group), but the specific
objection that used to be recorded there does not. That sentence has been
rewritten.
