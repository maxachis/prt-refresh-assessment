# LOSE-ONE-SEAT-OAKLAND

> What communities will lose one-seat-ride to Oakland?

**Eighteen places, carrying about 2,646 weekday boardings** — by far the
largest of the four one-seat findings on the losing side, and the strongest
equity argument available in this data. The losses fall on the Mon Valley and
the eastern boroughs; the offsetting gains fall on the South Hills and North
Hills.

## Result

`stops after` is the number of stops in the place any proposed route serves.

| Place | Weekday boardings | Stops now | Stops after | Loses via |
|---|---:|---:|---:|---|
| Penn Hills township | 561 | 268 | 223 | 77 |
| Robinson township | 489 | 54 | 61 | 28X |
| Monroeville municipality | 290 | 116 | 115 | 67, 69, 77 |
| Allentown | 217 | 19 | 15 | 54 |
| Elliott | 187 | 20 | 20 | 28X |
| Forest Hills borough | 157 | 28 | 26 | 69 |
| East Pittsburgh borough | 153 | 24 | 16 | 69 |
| Turtle Creek borough | 145 | 36 | 40 | 69 |
| Beltzhoover | 133 | 37 | 30 | 54 |
| Duquesne Heights | 114 | 15 | 15 | 28X |
| Wilmerding borough | 79 | 24 | 24 | 69 |
| Wilkins township | 62 | 17 | 17 | 67 |
| Plum borough | 23 | 36 | **2** | 77 |
| Trafford borough (Westmoreland) | 15 | 7 | **0** | 69 |
| Churchill borough | 12 | 7 | 9 | 67 |
| Bon Air | 9 | 13 | 2 | 54 |
| Pitcairn borough | 2 | 3 | 3 | 69 |
| Trafford borough (Allegheny) | 0 | 1 | **0** | 69 |

Full detail in `data/oneseat_change.csv` (filter `anchor == "Oakland"`).

## What is actually happening

Four mechanisms, in descending order of how many riders they touch:

**1. Route 77 is folded into 86 Liberty, which does not serve Oakland.** This is
the largest loss on the list and the most easily misstated, so state it
carefully: Penn Hills is **not** losing its bus and is **not** losing Downtown.
It keeps five proposed routes — 77L, 78, 79, 86, 89 — and three of them (77L,
78, 86) still run Downtown. **None of the five reaches Oakland.** What Penn
Hills loses is one destination: 561 weekday boardings across 268 served stops,
transfer-free access to Oakland gone.

The same pattern covers part of Monroeville, whose five proposed routes all miss
Oakland, and effectively all of Plum borough, which is left with a single route
(73L) at 2 stops.

Note that current route 77 and the proposed **77L Penn Hills Flyer** are not the
same lineage: 77 merges into 86 Liberty, while 77L is the successor to today's
**P16**. The number survives; the route does not.

**2. Route 69 is truncated.** The proposed 69 becomes *Wilkinsburg – Turtle
Creek Valley*, ending at Wilkinsburg instead of continuing to Oakland. Six
communities along the Turtle Creek valley — Forest Hills, East Pittsburgh,
Turtle Creek, Wilmerding, Pitcairn, Trafford — keep their bus and lose their
destination. This is the single most concentrated geographic pattern in the
finding.

**3. The 28X stops serving Robinson, Elliott, and Duquesne Heights.** Another
one that is easy to get backwards: the proposed 28X Airport **still reaches
Oakland**. It simply no longer stops in these three communities, which are left
with local routes (24, 25, 29 in Robinson; the 21–31 group in Elliott and
Duquesne Heights), none of which run to Oakland. That is 790 weekday boardings
losing transfer-free Oakland access to a routing change rather than a service
cut.

**4. Route 54 is rerouted off the Arlington/Warrington corridor.** This one is
easy to misread. The proposed 54 is still named *North Side – Oakland – South
Side* and **still reaches Oakland** — it simply no longer runs through
Allentown, Beltzhoover, or Bon Air. The route was not cut; it was moved off
those neighbourhoods, which lose 359 weekday boardings' worth of direct Oakland
access between them.

Set against this: 12 places gain an Oakland one-seat ride, worth about 3,556
weekday boardings (see [GAIN-ONE-SEAT-OAKLAND](GAIN-ONE-SEAT-OAKLAND.md)). The
system-wide net is positive on boardings — but the gains land in the South Hills
and North Hills while the losses land in the Mon Valley, Penn Hills, and the
southern city hillsides. **That redistribution, not the net, is the finding.**

## Also losing most or all of their service

Three of these places are not merely losing a destination. **Plum borough drops
from 36 served stops to 2**, and both Trafford rows go to zero. Those belong in
the REGION-LOSS answer, and the Oakland framing understates what happens to
them.

## Caveats

Boardings are all-purpose May 2025 weekday boardings at these places' stops, not
counts of riders travelling to Oakland — they size the affected population
rather than the affected trips. No public origin-destination data exists to do
better.

Low boardings in the smaller boroughs partly reflect service that is already
thin, so the totals understate rather than overstate the disruption — the same
argument `FINDINGS.md` makes about stop closures.

"Oakland" here is the whole of the four Oakland neighbourhoods, broader than the
Fifth/Forbes hospital and university core. Since Oakland is the region's largest
concentration of hospital and university employment, several of these
communities are losing transfer-free access to a primary job centre; quantifying
that would need employment data this pipeline does not yet ingest.

Full method and the four data controls that changed this answer:
[METHOD-one-seat.md](METHOD-one-seat.md).

## Reproduce

```bash
python3 analyze_one_seat.py   # -> data/oneseat_change.csv
```
