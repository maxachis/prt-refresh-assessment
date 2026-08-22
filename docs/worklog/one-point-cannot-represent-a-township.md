# A township is not a point, and the travel-time layer currently treats it as one

**Observed:** representing each place by a single origin point makes 76 of 369
published pairs unreachable, and every one of those is a statement about that
one point rather than about the place — most sharply for large suburban
townships, where the population-weighted centre can sit a kilometre from any
stop while the township plainly has service.
**Where it stands:** open, decision owed by Max. The immediate reporting error
is fixed — the CSV now records why a pair is unreachable, and the report no
longer presents it as a travel-time finding — but the underlying origin model
is unchanged.

## What was observed

`data/trip_time_change.csv` publishes one origin per place: the
population-weighted centre of the census block groups that label to it. Of 369
place–anchor pairs:

| | pairs |
|---|---|
| reachable on both networks | 293 |
| unreachable on both | 60 |
| reachable today only | 12 |
| reachable under the plan only | 4 |

The 60 and the 12 are not what they look like.

**The 60 are an origin artefact.** Measured against the current feed: Banksville's
origin has its nearest stop at 411 m, Green Tree's at 699 m, Bridgeville's at
434 m — all outside the 400 m access walk, so no journey exists *from that
point* even though all three places obviously have buses. The router is right
and the question was wrong.

**The 12 are a coverage statement wearing a travel-time costume.** Every one of
them has the same diagnosis — no stop within 400 m of the origin under the
plan, with the nearest proposed stop 611 m to 1,246 m away:

```
Hampton township        2 stops now -> 0,  nearest proposed  902 m
Kennedy township        6 stops now -> 0,  nearest proposed 1246 m
Mount Lebanon township  3 stops now -> 0,  nearest proposed  611 m
Reserve township        5 stops now -> 0,  nearest proposed  996 m
Scott township          9 stops now -> 0,  nearest proposed  785 m
Trafford borough        4 stops now -> 0,  nearest proposed 1151 m
```

Nothing about *time* is being measured there. That is coverage change at one
arbitrary point, which `analyze_coverage_change.py` already measures properly
over the whole surface, with tiers and a radius sensitivity. Reporting it from
this layer would be quoting one unit as if it were another — the error
convention 10 exists to forbid — and doing it on a worse measurement than the
one already published.

It is also convention 3 reappearing one unit up: *a vanished stop id is not a
lost bus.* Here it is a vanished stop *near one chosen point*, which is weaker
still.

## Why it matters

The six townships above are exactly the kind of result that gets quoted. "Mount
Lebanon loses all peak access to Downtown" is a sentence a reader would repeat,
and it would be false — what is true is that the plan puts no stop within a
quarter mile of one particular point in Mount Lebanon. Publishing it would
discredit the 293 pairs that *are* honest.

## What was done about it now

The CSV records the stop counts within the access walk on each side, so an
unreachable pair is self-diagnosing rather than ambiguous, and the printed
report separates "no origin coverage" from "no journey" and defers the former
to the coverage layer by name. That is a reporting fix, not a method fix.

## Approaches considered

- **Sample several points per place rather than one.** The likely right answer:
  profile from every block-group centre of population in the place and weight
  by residents, so a township is represented by its people rather than by its
  centroid. Cost is roughly linear in block groups — the current run is 8
  minutes, so this is affordable. It also fixes the ten fallback-origin places
  (`origin_source == "stops"`) as a side effect, since those exist only because
  a single point had to be chosen.
- **Widen the access walk for the origin only.** Rejected: it would manufacture
  reachability by walking riders 800 m in a way no other layer on the site
  does, and it breaks the shared 400 m radius that keeps this layer's answer
  consistent with the map's.
- **Drop unreachable pairs from the file.** Rejected: silent truncation. A
  reader could not tell 293 from 369, and the reachability asymmetry between
  the networks would vanish along with the artefact.

*All three are agent judgements, not Max's decisions; a later session with
better information should feel free to overturn them.*

## Resolution

Open. The reporting is honest as of now; the origin model is not yet fixed.
