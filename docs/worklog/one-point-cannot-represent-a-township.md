# A township is not a point, and the travel-time layer used to treat it as one

**Observed:** representing each place by a single origin point made 76 of 369
published pairs unreachable, and every one of those was a statement about that
one point rather than about the place — most sharply for large suburban
townships, where the population-weighted centre can sit a kilometre from any
stop while the township plainly has service.
**Where it stands:** fixed, awaiting close. A place is now searched from every
populated census block group that labels to it and the results are pooled by
population, so the answer is about residents rather than about a centroid.
Max still owes the decision on whether the remaining ten fallback-origin places
are acceptable as published.

## What was observed

`data/trip_time_change.csv` used to publish one origin per place: the
population-weighted centre of the census block groups that label to it. Of 369
place–anchor pairs:

| | pairs |
|---|---|
| reachable on both networks | 293 |
| unreachable on both | 60 |
| reachable today only | 12 |
| reachable under the plan only | 4 |

The 60 and the 12 were not what they looked like.

**The 60 were an origin artefact.** Measured against the current feed: Banksville's
origin had its nearest stop at 411 m, Green Tree's at 699 m, Bridgeville's at
434 m — all outside the 400 m access walk, so no journey existed *from that
point* even though all three places obviously have buses. The router was right
and the question was wrong.

**The 12 were a coverage statement wearing a travel-time costume.** Every one of
them had the same diagnosis — no stop within 400 m of the origin under the
plan, with the nearest proposed stop 611 m to 1,246 m away:

```
Hampton township        2 stops now -> 0,  nearest proposed  902 m
Kennedy township        6 stops now -> 0,  nearest proposed 1246 m
Mount Lebanon township  3 stops now -> 0,  nearest proposed  611 m
Reserve township        5 stops now -> 0,  nearest proposed  996 m
Scott township          9 stops now -> 0,  nearest proposed  785 m
Trafford borough        4 stops now -> 0,  nearest proposed 1151 m
```

Nothing about *time* was being measured there. That is coverage change at one
arbitrary point, which `analyze_coverage_change.py` already measures properly
over the whole surface, with tiers and a radius sensitivity. Reporting it from
this layer would be quoting one unit as if it were another — the error
convention 10 exists to forbid — and doing it on a worse measurement than the
one already published.

It is also convention 3 reappearing one unit up: *a vanished stop id is not a
lost bus.* There it was a vanished stop *near one chosen point*, which is weaker
still.

## Why it mattered

The six townships above are exactly the kind of result that gets quoted. "Mount
Lebanon loses all peak access to Downtown" is a sentence a reader would repeat,
and it would be false — what was true is that the plan puts no stop within a
quarter mile of one particular point in Mount Lebanon. Publishing it would have
discredited the 293 pairs that *were* honest.

## What was done: the reporting fix, then the method fix

**First, in the session that found this**, the CSV gained the stop counts within
the access walk on each side, so an unreachable pair was self-diagnosing rather
than ambiguous, and the printed report separated "no origin coverage" from "no
journey" and deferred the former to the coverage layer by name. That stopped the
false headline from being published, but it was a reporting fix, not a method
fix: the origin model was unchanged and the townships still had no travel time.

**Then the origin model itself changed.** `analyze_travel_time.py` now searches
a place from *every* populated block group that labels to it — 951 points across
177 places, a median of 4 per place and as many as 37 (Penn Hills) — and pools
the resulting profiles by population. Concretely:

- Every itinerary of every block group's profile is one sample weighted by that
  block group's residents; the published median is the weighted median of the
  pooled samples. So the number means *the median minute experienced by a
  randomly chosen resident of this place, ready at a randomly chosen minute of
  the peak*, rather than the trip time of a coordinate nobody lives at.
- `{radius}_{side}_origin_coverage_fraction` replaces the old binary
  origin-access test with the **share of a place's residents** who have a stop
  within the access walk. This is the column that retires the false township
  headline: Mount Lebanon does not lose access, a measurable share of its
  residents does, and the share is printed.
- `NO_ORIGIN_COVERAGE` now means a network reaches *none* of a place's
  residents — a real and rare statement — rather than "one chosen coordinate
  had no stop near it".
- A second file, `data/trip_time_origins.csv`, publishes the per-block-group
  evidence, and the pooled file's `spread_headline_min` records how far apart a
  place's own block groups are. That spread is the substance of the original
  argument and it is large where the argument predicted: Mount Lebanon's block
  groups span 29.6 minutes of change around a pooled −5.1.

Mount Lebanon → Downtown is the before-and-after in one line: it went from
*unreachable under the plan* (false) to *comparable, 5.1 minutes faster, over
the 43% of residents the plan keeps within a quarter mile of a stop*.

Across the file, comparable pairs went from 293 of 369 to **343**, and the
"no origin coverage" category — the one that produced the false headlines —
from 76 pairs to **24**, where it now means something real: no populated
block group of the place has a stop in reach on one of the networks.

**A second defect surfaced while validating this one, and is fixed in the
same change.** Because the clock starts when a rider is *ready*, a place with
no morning bus was getting a correct arrival on the evening service and
publishing it as a 863-minute travel time. Twenty-five origin-rows were
affected and they distorted the output badly — Verona and Penn Hills topped
the widest-spread ranking at 779 and 475 minutes, and Ross township's pooled
change to Downtown read −9.0 when the artefact-free answer is −1.0.
`journey.MAX_JOURNEY_MINUTES` now bounds a trip at four hours and reports
longer ones as unreachable; the constant's comment carries the reasoning and
the empty ground the cut sits in. Worth noting for its shape rather than its
substance: **searching more origins did not create this bug, it made it
visible**, which is the usual return on replacing one sample with many.

## Approaches considered

- **Sample several points per place rather than one.** Adopted, as described
  above. Cost was the stated risk and it landed as predicted: roughly 5× the
  searches, which is a run measured in hours rather than minutes for a script
  that runs rarely.
- **Widen the access walk for the origin only.** Rejected: it would manufacture
  reachability by walking riders 800 m in a way no other layer on the site
  does, and it breaks the shared 400 m radius that keeps this layer's answer
  consistent with the map's.
- **Drop unreachable pairs from the file.** Rejected: silent truncation. A
  reader could not tell 293 from 369, and the reachability asymmetry between
  the networks would vanish along with the artefact.

*All three are agent judgements, not Max's decisions; a later session with
better information should feel free to overturn them.*

## What is still open

The fix does not reach the **ten fallback-origin places** (`origin_source ==
"stops"`: Bedford Dwellings, Central Northside, Chateau, Esplen, Findlay
township, Mt. Oliver, New Homestead, St. Clair, West End, West Homestead
borough). No block group's population centre labels to them, so they keep a
single origin at the mean of their own labelled stops — and that origin is
*self-fulfilling*, since a point defined by today's stops is guaranteed to have
current-network coverage and so can only ever show the plan taking something
away. Several are small, low-income places the equity analysis already singles
out for coverage loss, so the weak origins are not randomly distributed across
the 187 places.

The expectation that this fix would retire the fallback tier "as a side effect"
was wrong, and the reason is worth recording because it is a shape rather than
a fact: the fallback exists because **no block group labels to those places**,
which is a naming failure in `analyze_equity_places.label_for`, not a
one-point-per-place failure. Sampling more points from an empty set yields an
empty set. Fixing it means changing how a block group is assigned a name —
letting one block group carry more than one label, or labelling from PRT's
`HOOD` polygons rather than the nearest stop — which is a different piece of
work in a different file.

Decision owed by Max: publish as-is with the tier recorded per row and the
caveat in the docstring, or hold the ten places out of the file until naming
is fixed.

## Resolution

Method fixed; the file is regenerated from the resident-weighted origins. The
ten fallback places remain, marked, pending Max's call above.
