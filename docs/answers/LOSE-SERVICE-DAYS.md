# LOSE-SERVICE-DAYS

> What days of service will this route have cut?

**Two corridors lose a day type: Banksville and Elizabeth, both losing Saturday
and Sunday.** Six route *numbers* lose weekend service, but four of them —
the 29, 53, 55 and 69 — hand their weekends to a variant of themselves that
keeps running, so reporting six would overstate the cut threefold.

## Result

Six route numbers go weekday-only. What happens to their weekend riders differs:

| Route | Loses | Weekend riders today | Who runs those days instead |
|---|---|---:|---|
| 36 → **36L** | Sat + Sun | 174 | **nobody** |
| Y46 → **46L** | Sat + Sun | 946 | **nobody** |
| 29 | Sat + Sun | 756 | 29S — 68 Sat, 46 Sun trips |
| 53 | Sat + Sun | 381 | 53S — 30 Sat, 28 Sun trips |
| 55 | Sat + Sun | 1,258 | 55S — 34 Sat, 30 Sun trips |
| 69 | Sat + Sun | 449 | 69S — 30 Sat, 28 Sun trips |

Riders are WPRDC April 2026 daily averages on the days being dropped. Full detail
in `data/route_service_days.csv`, which carries both readings per route
(`days_lost` by number, `days_lost_corridor` with variants credited).

**The two real cuts are both a route becoming a peak-only limited.** The 36
Banksville becomes the 36L Banksville Flyer and the Y46 Elizabeth becomes the 46L
Elizabeth Flyer — weekday-only, peak-only, one direction at a time. The Y46's
946 weekend riders a day make it the largest single day-type cut in the plan.

## The variant catch, and why four routes are not on the cut list

29S, 53S, 55S and 69S appear in PRT's Frequency & Hours PDFs but **not in the
Remix map**, so any analysis built on Remix — which is everything else in this
repo — cannot see them. Read that way, Clairton and Glassport lose their weekend
buses outright. They do not: the 55S runs 34 Saturday and 30 Sunday trips over
that corridor. The proposed GTFS has the variants with geometry and timetables,
which is why this answer uses it. See [METHOD-coverage.md](METHOD-coverage.md).

**A variant is not always the whole parent, though.** In North Fayette, the 29
stays on Summit Park Dr on weekdays and the 29S does not go there at all, so
eleven Summit Park locations lose Saturday and Sunday service (30 Saturday trips
to zero) even though "the 29 keeps its weekends" is true of the corridor as a
whole. The stop-level answer is [STOP-LOST-SERVICE.md](STOP-LOST-SERVICE.md);
this file is the route-level one, and the two disagree by design.

## What this does not cover

Losing a *day type* is the crudest cut there is. A route can keep all three day
types and lose half its trips — 284 locations do
([LOSE-FREQUENCY-HALF.md](LOSE-FREQUENCY-HALF.md)) — and none of that shows up
here. Nor do the 20 discontinued routes, which lose every day of service and are
counted in [LOST-ROUTE.md](LOST-ROUTE.md).

System-wide, weekend service **grows**: summed across locations, Saturday trips
rise 15.3% and Sunday 16.8%. These two corridors are exceptions inside a plan
that adds weekend service, and citing them without that context would misstate
the plan.

## Caveats

Route-level rider counts are for the whole route, not for the stops that lose
service, and they are April 2026 averages — recent, but a route's weekend riders
partly reflect the weekend service it has.

The comparison covers the 74 routes PRT lists as neither added nor removed,
including route 77, which is hidden inside the crosswalk's `"86, 77"` cell.

Shared method and caveats: [METHOD-coverage.md](METHOD-coverage.md).

## Reproduce

```bash
python3 analyze_coverage_change.py   # -> data/route_service_days.csv
```
