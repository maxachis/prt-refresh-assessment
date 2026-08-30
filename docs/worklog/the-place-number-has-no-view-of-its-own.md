# The place number has no view of its own

**Observed:** the answer panel prints a whole neighbourhood's residents-lost
figure underneath a walk circle that measures one point, and at Squirrel Hill
South the two say opposite things — the circle is green and the sentence says
259 people lose every bus.
**Where it stands:** open, decision owed on where the place-level numbers
should live. Max proposed a "By Neighborhood" choropleth; the agent argued
against the choropleth specifically and for a ranked Places view instead, on
evidence set out below. Nothing is built and nothing is settled.

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
   twelve places carry 71.5% of the residents who lose every bus (Baldwin
   9,613; Ross 6,508; McCandless 6,291; Mount Lebanon 4,514; Kennedy 3,904;
   Penn Hills 3,366 …).
2. **The repo has no boundaries, and place names are not a boundary test.** No
   polygon geometry exists anywhere in `data/`. A block group takes the label
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
that cannot be written around. Max has not accepted the argument yet.

**A ranked Places view — proposed by the agent, undecided.** All 62 named
places with any loss, sortable, residents-losing-every-bus shown against the
place's own population so a small township cannot hide behind Baldwin's raw
count. Clicking a place answers *for the place* — residents lost and gained,
the demographic split already in `equity_places.csv`, the one-seat verdicts,
the travel-time spread across its block groups — while the map zooms to it and
lights its changed block groups as **points**, which is geometry the repo
already has. The panel's population line then becomes a link into that view
rather than a caveat, and each unit is answered where it is measured.

Everything it needs is in CSVs the pipeline already builds: no new ingest, no
new naming convention, no new precompute.

## Reconciliation, for whoever builds it

`data/equity_places.csv` sums to the published county figure exactly, so a
Places view cannot silently drift from `/findings`:

```
all changed block groups   68,989 lose / 20,095 gain
  of which named places    68,838
  of which unnamed (6 BGs)    151
```

The 6 unnamed block groups sit beyond `LABEL_RADIUS_M` and are written out
anyway precisely so this reconciliation holds. A Places view that lists only
named places must say what the residual is rather than quietly dropping it.
