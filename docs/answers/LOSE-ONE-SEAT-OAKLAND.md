# LOSE-ONE-SEAT-OAKLAND

> What communities will lose one-seat-ride to Oakland?

**Sixteen places, carrying about 2,062 weekday boardings** — the largest of
the four one-seat findings on the losing side. The losses fall on the Turtle
Creek valley and the eastern boroughs, on the western hillsides, and on the
Arlington/Warrington corridor; the offsetting gains fall on the South Hills and
North Hills.

"Oakland" here is West, Central and South Oakland — the Fifth/Forbes hospital
and university core — and deliberately **not** North Oakland, which runs a mile
up to the Bloomfield and Shadyside edges. Two places sit on that boundary:
**Penn Hills (561 boardings) and Plum borough (23)** lose today's route 77,
whose only Oakland stops are Craig St at Baum and Bigelow, about a kilometre
north of the core. Count North Oakland in and this finding is eighteen places
and 2,646 boardings; count it out, as the published figure does, and those two
never had a one-seat ride to the Oakland riders mean. State which definition a
number uses.

## Result

`stops after` is the number of stops in the place any proposed route serves.

| Place | Weekday boardings | Stops now | Stops after | Loses via |
|---|---:|---:|---:|---|
| Robinson township | 489 | 54 | 61 | 28X |
| Monroeville municipality | 290 | 116 | 109 | 67, 69 |
| Allentown | 217 | 19 | 15 | 54 |
| Elliott | 187 | 20 | 20 | 28X |
| Forest Hills borough | 157 | 28 | 26 | 69 |
| East Pittsburgh borough | 153 | 24 | 16 | 69 |
| Turtle Creek borough | 145 | 36 | 40 | 69 |
| Beltzhoover | 133 | 37 | 30 | 54 |
| Duquesne Heights | 114 | 15 | 15 | 28X |
| Wilmerding borough | 79 | 24 | 24 | 69 |
| Wilkins township | 62 | 17 | 17 | 67 |
| Trafford borough (Westmoreland) | 15 | 7 | **0** | 69 |
| Churchill borough | 12 | 7 | 9 | 67 |
| Bon Air | 9 | 13 | 2 | 54 |
| Pitcairn borough | 2 | 3 | 3 | 69 |
| Trafford borough (Allegheny) | 0 | 1 | **0** | 69 |

Full detail in `data/oneseat_change.csv` (filter `anchor == "Oakland"`).

## What is actually happening

Four mechanisms, in descending order of how many riders they touch:

**1. The 28X stops serving Robinson, Elliott, and Duquesne Heights.** The
largest loss on the list, and one that is easy to get backwards: the proposed
28X Airport **still reaches Oakland**. It simply no longer stops in these three
communities, which are left with local routes (24, 25, 29 in Robinson; the
21–31 group in Elliott and Duquesne Heights), none of which run to Oakland.
That is 790 weekday boardings losing transfer-free Oakland access to a routing
change rather than a service cut.

**2. Route 69 is truncated.** The proposed 69 becomes *Wilkinsburg – Turtle
Creek Valley*, ending at Wilkinsburg instead of continuing to Oakland. Six
communities along the Turtle Creek valley — Forest Hills, East Pittsburgh,
Turtle Creek, Wilmerding, Pitcairn, Trafford — keep their bus and lose their
destination. This is the single most concentrated geographic pattern in the
finding.

**3. Route 67 no longer reaches Oakland**, which takes the eastern end of the
Monroeville corridor with it: Monroeville itself (290 boardings, and it loses
the 69 as well), Wilkins township (62) and Churchill borough (12). None of
these places is losing its bus; Monroeville keeps five proposed routes and not
one of them reaches Oakland.

**4. Route 54 is rerouted off the Arlington/Warrington corridor.** This one is
easy to misread. The proposed 54 is still named *North Side – Oakland – South
Side* and **still reaches Oakland** — it simply no longer runs through
Allentown, Beltzhoover, or Bon Air. The route was not cut; it was moved off
those neighbourhoods, which lose 359 weekday boardings' worth of direct Oakland
access between them.

Set against this: 12 places gain an Oakland one-seat ride, worth about 3,556
weekday boardings (see [GAIN-ONE-SEAT-OAKLAND](GAIN-ONE-SEAT-OAKLAND.md)). The
system-wide net is positive on boardings — but the gains land in the South Hills
and North Hills while the losses land in the Turtle Creek valley, the western
hillsides and the southern city hillsides. **That redistribution, not the net, is the finding.**

## Also losing most or all of their service

Two of these places are not merely losing a destination: both Trafford rows go
to zero served stops. That belongs in the REGION-LOSS answer, and the Oakland
framing understates what happens to them. Plum borough — which drops from 36
served stops to 2 — is the same case one step removed: it is not in this table,
because the ride it loses was the 77's stop at Craig St rather than a ride to
the core, but it is losing very nearly all of its service.

## Caveats

Boardings are all-purpose May 2025 weekday boardings at these places' stops, not
counts of riders travelling to Oakland — they size the affected population
rather than the affected trips. No public origin-destination data exists to do
better.

Low boardings in the smaller boroughs partly reflect service that is already
thin, so the totals understate rather than overstate the disruption — the same
argument `FINDINGS.md` makes about stop closures.

"Oakland" here is West, Central and South Oakland — the Fifth/Forbes hospital
and university core — and not North Oakland, whose northern edge is a mile from
that core. A route touching only Craig St or Centre Ave therefore does not count
as an Oakland ride, which is what moves Penn Hills and Plum out of this finding;
see the note under the headline, and caveat 4 of
[METHOD-one-seat.md](METHOD-one-seat.md). Since Oakland is the region's largest
concentration of hospital and university employment, the places in this table
are losing transfer-free access to a primary job centre; quantifying that would
need employment data this pipeline does not yet ingest.

Full method and the four data controls that changed this answer:
[METHOD-one-seat.md](METHOD-one-seat.md).

## Reproduce

```bash
python3 analyze_one_seat.py   # -> data/oneseat_change.csv
```
