# The place number has no view of its own

**Observed:** the answer panel prints a whole neighbourhood's residents-lost
figure underneath a walk circle that measures one point, and at Squirrel Hill
South the two say opposite things — the circle is green and the sentence says
259 people lose every bus.
**Where it stands:** fixed, awaiting close. Max chose the ranked Places view on
2026-08-30 and the choropleth on 2026-08-31, once the objection blocking it was
removed rather than argued around: the repo now has place boundaries
(`ingest_boundaries.py`), so both are built. Objection 2 below was the binding
one and it is now spent — see *The boundaries arrived* at the bottom.

> Raised by Max, 2026-08-30, clicking 40.42919, -79.91788 and asking why the
> radius reads green while the panel reads a loss.

## What is observed

The panel's population line is `query.place_residents`, and convention 12
already says what it is: the figure `data/equity_places.csv` published for the
**named place**, Allegheny-only and day-free, deliberately not a count inside
the walk radius. All of that is correct and none of it is visible to a reader,
who sees a number four lines under a circle drawn on the map.

Squirrel Hill South is the sharpest case available, because the point and the
place genuinely disagree:

```
$ curl -s "http://127.0.0.1:8001/api/place?lat=40.42919&lon=-79.91788&radius=400"
  weekday    60 → 178 trips        # the clicked point roughly triples
  saturday   38 → 116
  sunday     20 →  88
  population {"lost": 258.9, "gained": 0.0, "block_groups": 2}
```

The 259 are real and they are nowhere near the pin. Re-running the panel query
at each census block point in the two changed block groups (`data/census_blocks.csv`,
geoids `420031408001` and `420031414002`) finds exactly two blocks that lose
all service, both on Beechwood Boulevard:

| block point | people | weekday trips |
|---|---|---|
| 40.434089, −79.911478 (Beechwood/Darlington/Phillips) | ~231 | 15 → **0** |
| 40.424387, −79.923238 (Beechwood/Monitor) | ~36 | 53 → **0** |

Every other block in those groups holds or gains. So the neighbourhood is a big
gain for most of it and a total loss for a couple of hundred people on the
boulevard — a true and interesting sentence that the panel currently delivers
as an apparent contradiction.

## Why it matters

This is the same failure as
[`the-site-has-two-numbers-that-look-like-people.md`](the-site-has-two-numbers-that-look-like-people.md),
one unit further in: that entry is about a reader quoting two people-shaped
numbers from different ends of a trip, this one about a reader quoting a place
number as though it described the spot under their cursor. Both are about what
the *site* says to someone who has never read `CLAUDE.md`.

The wording patch is available and weak. The note under the figure currently
reads *"The whole of ${place}, any day of the week — it does not move with the
day above"*, which defends against the day-type confusion and says nothing
about the radius; adding *"not this walk circle"* would help. It does not fix
the underlying problem, which is that a place-level answer is being rendered
inside a point-level view.

## Approaches considered

**A choropleth of neighbourhoods — proposed by Max, argued against by the
agent; not settled.** Four objections, in descending order of how hard they are
to work around:

1. **The pipeline already rejected it, on its own evidence.** The module
   docstring of `analyze_equity_places.py` says a county choropleth "would
   therefore be mostly a map of where nothing happened, over which a reader
   would read Pittsburgh's existing segregation as though it were the finding.
   A ranked list of named places is both smaller and more use." The
   concentration behind that claim still holds: of 261 changed block groups,
   twelve places carry 70.2% of the residents who lose every bus (Baldwin
   7,985; McCandless 7,213; Ross 6,119; Mount Lebanon 3,742; Scott 3,665;
   Kennedy 3,543 …). *(Figures restated 2026-08-31 under boundary
   assignment; the concentration is what the objection turned on, and it
   barely moved.)*
2. **The repo has no boundaries, and place names are not a boundary test.**
   *(Superseded 2026-08-31 — this was true when written and is the objection
   that got fixed rather than overruled.)* No
   polygon geometry existed anywhere in `data/`. A block group takes the label
   of the *nearest surviving labelled PRT stop* within `LABEL_RADIUS_M` = 2,000 m
   — median 373 m away, p90 954 m, max 1,989 m. Colouring a real municipal or
   neighbourhood polygon with a nearest-stop-derived number asserts that the
   two partitions agree; where they don't, the map is wrong in a way no reader
   can see. Fetching boundaries would also add a seventh upstream source.
3. **"Neighborhood" points at the wrong half of the county.** The losses are
   overwhelmingly suburban townships and boroughs. A view framed on Pittsburgh
   neighbourhoods would put the reader where the change mostly isn't.
4. **Count or share is an unforced choice.** A raw residents-lost choropleth
   reads population density; a share needs a denominator the file doesn't
   carry per place (`population` there is the population of *changed* block
   groups only, not of the place).

None of these is fatal to *some* map of this, and objection 2 is the only one
that cannot be written around. Max accepted the argument on 2026-08-30 and
chose the ranked view; objection 2 still stands against ever filling a real
municipal polygon with these numbers, and the built view draws points for
exactly that reason.

**A ranked Places view — proposed by the agent, chosen by Max on 2026-08-30,
and built.** All named places with any loss, sortable, residents-losing-every-bus
shown against the place's own population so a small township cannot hide behind
Baldwin's raw count. Clicking a place answers *for the place* — residents lost and gained,
the demographic split already in `equity_places.csv`, the one-seat verdicts,
the travel-time spread across its block groups — while the map zooms to it and
lights its changed block groups as **points**, which is geometry the repo
already has. The panel's population line then becomes a link into that view
rather than a caveat, and each unit is answered where it is measured.

Everything it needs was in CSVs the pipeline already built, with one
exception found during the build and described under *The denominator* below.

## Reconciliation

`data/equity_places.csv` sums to the published county figure exactly, so the
Places view cannot silently drift from `/findings`:

```
all changed block groups   68,989 lose / 20,095 gain
  of which named places    68,989      (every one, since 2026-08-31)
  of which unnamed                0
```

Under the nearest-stop rule this did not close: 6 changed block groups sat
beyond 2 km of a labelled stop, took no name, and carried 151 of the 68,989
between them — written out unnamed precisely so the reconciliation still held.
Boundary containment removed the residual rather than accounting for it, since
municipal boundaries partition the county.


## The denominator did not exist, and the obvious column was a trap

Objection 4 above guessed that a share "needs a denominator the file doesn't
carry per place". That was right, and understated: `equity_places.csv` has a
`population` column that looks exactly like the denominator and is not one,
in two independent ways at once. It counts only the block groups the plan
**changed**, so it is a place's changed part rather than the place; and it is
the 2020 decennial count, where every `*_lost` figure beside it is weighted by
ACS `race_total`. Reserve township is the case that makes this unarguable:

```
$ grep Reserve data/equity_places.csv | head -2
420034282002,Reserve township,93,...,1430.0,1629.0,0.0,...
                                     ^^^^^^ population   ^^^^^^ residents_lost
```

A share built from those two columns is 114%. Nothing would have raised —
both numbers are real, both are correctly computed, and they answer different
questions about different populations.

So `analyze_equity_places.place_totals` walks *all* 1,062 Allegheny block
groups through the same labelling `locate` uses and sums the same ACS universe
the losses are weighted by, into `data/equity_place_totals.csv`. It reconciles
exactly: 1,238,177 residents across 176 rows, against 1,238,177 summed straight
from `census_block_groups.csv`. `build_webdb.py` refuses to build if a place
that changed has no total, so the two halves of a share can never come from
different runs.

**The shape of the mistake, which is the part worth keeping:** a column whose
name matches the concept you want, sitting in the file you are already
reading, is the most dangerous denominator available — more so than no
denominator at all, which at least makes you go and look. The check that
caught it was arithmetic, not inspection: assert that no place loses more
residents than it has (`tests/test_query.py::test_no_place_loses_more_residents_than_it_has`).

## What the share changes

It is not cosmetic. The two rankings disagree about which places the plan
treats worst, and only the count-ranked one was previously visible anywhere:

| place | residents lost | of its own population |
|---|---|---|
| Baldwin borough | 7,985 | 39.7% |
| McCandless township | 7,213 | 24.8% |
| Ross township | 6,119 | 18.6% |
| Mount Lebanon township | 3,742 | 11.2% |
| **Reserve township** | **2,706** (10th) | **85.1%** (2nd) |
| Penn Hills municipality | 3,273 | 7.9% |

Reserve township loses bus service for six residents in seven and is tenth on
the list PPT would otherwise testify from — behind it by count, and ahead of
everything but Bon Air by share. The view offers both orders and
defaults to count, because count is what the published answers carry.

**The share needed a floor, which the build found by looking at it.** Ranked by
share under the nearest-stop rule, the list was led not by Reserve township but
by Trafford borough at 97.5% — a borough that straddles the county line and
whose Allegheny part is **16 people**. A third significant figure on a
denominator of 16, heading a list about 69,000 people, is the kind of number
that discredits the twelve real ones under it. `query.SHARE_MIN_RESIDENTS`
withholds a share below 100 residents; the place stays in the count-ranked
list, where 16 is simply 16, and the withheld share is drawn as a dash that
says why.

*(Corrected 2026-08-31, after boundary assignment.)* The floor's headline
example did not survive the cutover: Trafford's Allegheny part now loses 2.8
residents rather than 16, so its share would read 17.5% and would not have led
anything. The floor is still right, and it now withholds four shares rather
than one — Pittsburgh city (0 residents, every block group inside it resolving
to one of the 90 neighbourhoods), Regent Square (10), Trafford borough (16),
Haysville borough (99). Three of the four lose nobody, so the floor is doing
quieter work than the discovery suggested; Regent Square is the case that
would still have embarrassed us, since a single changed block group there
would print a share on a denominator of ten. Bon Air's 776 residents and
93.1% and Reserve township's 3,180 and 85.1% are unmoved by the cutover, so
the ranking narrative above stands.

The general shape, again: the danger was not a wrong number but a *correct*
one whose denominator could not support the precision it appeared to carry.

## Scope the view has to keep stating

*(Rewritten 2026-08-31: both residuals below are now zero. Kept because the
shape of the problem is what the next reader needs, and because the numbers
say what the nearest-stop rule was costing.)*

Under that rule the view had two residuals, and the second was the ugly one.
Of the residents who lose every bus, 68,838 of 68,989 were on named ground and
151 were not — small. But the *denominator* residual was 231,171 of Allegheny's
1,238,177 residents, 19%, living beyond 2 km of any labelled PRT stop and
therefore in no place row at all. Those were the parts of the county with no
bus to lose, which is why they held 19% of the people and 0.2% of the loss —
and why a share computed against them would have been most wrong exactly where
the plan does least.

Both are now zero: every Allegheny resident is inside a named boundary. What
the view must still state is what it *is* — Allegheny only, day-free (losing
every bus on any day of the week, so it does not move with the toolbar's day
switch), and no share for a place under 100 residents.


## The boundaries arrived, and they changed the answer to objection 2

Max chose on 2026-08-31 to fetch boundaries and use them for **both** drawing
and assignment, which is the option that dissolves objection 2 instead of
working around it. `ingest_boundaries.py` adds the seventh upstream source:
Allegheny County's 130 municipal boundaries and the City of Pittsburgh's 90
neighbourhoods, both public, both already WPRDC-catalogued.

The objection said colouring a real polygon with nearest-stop-derived numbers
asserts that two partitions agree. That is still true — so the numbers stopped
being nearest-stop-derived. A block group now takes the boundary that contains
it, and the polygon is coloured by the people inside it.

What that moved, measured before anything was published:

```
block groups         1,062 Allegheny
  same label            760
  changed label         302   (421,109 residents = 34.0% of the county)
  unnamed before        133
  unnamed after           0
```

Every spot-checked relabelling is a visible correction: Regent Square's centre
was called Point Breeze, Garfield's was called Bloomfield, South Oakland's was
called Central Oakland. And **the county totals did not move at all** — 68,989
residents lose every bus and 20,095 gain one, before and after. Only the
attribution between places changed, so `/findings` and the equity brief's
headline figures stand.

The denominator residual in *The denominator* above is now gone with it: all
1,238,177 Allegheny residents are in a named place, where 231,171 previously
sat beyond 2 km of any labelled stop and fell out of every place total.

**The trap this sprang on the way through, which is the durable part.** With
block groups named by boundary, the answer panel was still looking a place up
by the *nearest stop's* PRT label. Those two naming systems agree on 173 of
PRT's 187 labels and disagree on 14 — PRT writes "Penn Hills township", the
county's own GIS writes "Penn Hills municipality". The lookup found no row and
returned a **measured zero** for a place losing 3,273 residents' service: not
an error, not a blank, a confident nothing. The panel now decides by
containment, which is the same question the table was built from.

Two identifier systems that agree on most values and disagree on a few are
more dangerous than two that disagree on all of them; the first fails on the
first join, the second fails quietly in a fallback path. The same shape is why
`analyze_travel_time.py` was deliberately *not* converted —
[`two-scripts-now-name-a-place-differently.md`](two-scripts-now-name-a-place-differently.md).
