# GAIN-SERVICE-DAYS

> What days of service will this route gain?

**Three routes gain a day type: the P3 and the 78 gain Saturday and Sunday, and
the 53 gains weekdays.** Only the first two are unambiguous gains; the 53's is an
artifact of when its weekday service was cut, and is explained below.

## Result

| Route | Gains | Proposed trips on the gained days | Note |
|---|---|---|---|
| **P3** East Busway–Oakland | Sat + Sun | 80 Saturday, 76 Sunday | 1,908 weekday riders today, the busiest route to gain anything |
| **P78** → **78 Oakmont** | Sat + Sun | 48 Saturday, 32 Sunday, run by the 78S | 835 weekday riders today |
| **53** Homestead Park | weekday | 34 weekday | see below — not a genuine gain |

Detail in `data/route_service_days.csv` (`days_gained_corridor`).

The P3 is the substantive one. It carries 1,908 weekday riders today with no
weekend service at all; the proposal gives it 80 Saturday and 76 Sunday trips —
roughly a bus every 30 minutes across the day on the East Busway into Oakland.

The 78's weekend service arrives as the **78S**, a variant of the route rather
than the route itself. That counts as a corridor gain here, and the same
variant logic that credits it also keeps four routes off the losses list — see
[LOSE-SERVICE-DAYS.md](LOSE-SERVICE-DAYS.md).

## Why the 53 is not really a gain

In the current GTFS the 53's only non-weekend trips run on service id `4`, which
`calendar_dates` operates on exactly one date: **Labor Day, 2026-09-07**. On the
feed's own evidence the 53 runs Saturdays and Sundays today and no ordinary
weekday, so the proposal's 34 weekday trips read as a gain.

WPRDC's April 2026 table still shows **93 weekday riders** on the 53. The honest
reading is that the weekday 53 was pared back to almost nothing before this plan
rather than by it, and the Refresh restores a weekday service — but "the 53 gains
weekdays" would mislead anyone who remembers riding it on a Tuesday. It is
flagged in the script's output for that reason.

For the same route's weekend story, note that the 53 itself is weekday-only in
the proposal and its weekends are run by the **53S** (30 Saturday, 28 Sunday
trips), so the corridor keeps all three day types.

## The larger gains are not day types at all

Day types are a coarse measure and this list is short. The plan's weekend
investment shows up as frequency instead: summed across locations, **Saturday
trips rise 15.6% and Sunday 17.1%**, and 342 locations at least double their
Saturday service against 123 that lose half of it
([GAIN-FREQUENCY-DOUBLE.md](GAIN-FREQUENCY-DOUBLE.md)). Twelve of the fourteen
new routes run all three day types from day one
([NEW-ROUTE.md](NEW-ROUTE.md)).

## Caveats

The comparison covers the 74 routes PRT lists as neither added nor removed. A new
route cannot "gain" a day type and is not counted here.

Rider figures are WPRDC April 2026 daily averages for the whole route, not for
the days being added — nobody rides a service that does not exist yet.

Shared method and caveats: [METHOD-coverage.md](METHOD-coverage.md).

## Reproduce

```bash
python3 analyze_coverage_change.py   # -> data/route_service_days.csv
```
