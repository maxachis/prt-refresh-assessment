# LOSE-SERVICE-HOURS

> What routes are losing service hours overall?

**No day type loses service hours system-wide.** In-service hours rise +2.5% on
weekdays, +18.0% on Saturday and +15.7% on Sunday. So this answer is a list of
exceptions inside a plan that adds service, and it has to be read that way in the
comment period — overstating it would discredit the real losses below.

**24 corridor groups keep service and lose 10% or more of their weekday hours**,
−466 hours between them, and **17 of those 24 lose trips as well**. The other
seven lose hours because their route got *shorter* while running *more* trips,
which is not a service cut and must not be quoted as one. A further 21
discontinued groups take 364 weekday hours with them
([LOST-ROUTE.md](LOST-ROUTE.md)).

## Result

System totals, both sides counted from real timetables through `gtfs.py`:

| Day | Trips now | Proposed | Change | Hours now | Proposed | Change |
|---|---:|---:|---:|---:|---:|---:|
| Weekday | 5,266 | 5,559 | +5.6% | 4,253 | 4,360 | **+2.5%** |
| Saturday | 3,513 | 4,107 | +16.9% | 2,609 | 3,078 | **+18.0%** |
| Sunday | 2,611 | 3,143 | +20.4% | 1,969 | 2,278 | **+15.7%** |

Groups moving by at least 10% of their hours, and what the discontinued and new
routes carry:

| Day | Losing ≥10% | Net hours lost | Gaining ≥10% | Discontinued | New |
|---|---:|---:|---:|---:|---:|
| Weekday | **24** | −466 | 26 | 21 groups, 364 h | 14 groups, 531 h |
| Saturday | **13** | −191 | 29 | 7 groups, 152 h | 13 groups, 396 h |
| Sunday | **13** | −188 | 32 | 6 groups, 105 h | 13 groups, 304 h |

Discontinued hours and new hours are **not** a like-for-like swap: a new route
may or may not cover a discontinued one's corridor. See
[the unit of analysis](#the-unit-is-a-group-not-a-corridor).

## The 17 real weekday cuts

Groups that keep service and lose both hours and trips. `riders/day` is the
WPRDC route-level average for the group's **current** routes — who rides the
corridor today, not a projection.

| Corridor | Hours | Trips | Riders/day |
|---|---|---|---:|
| 36 → 36L | 24 → 6 (−76.4%) | 40 → 14 (−65.0%) | 306 |
| Y46 → 46L | 52 → 18 (−66.0%) | 50 → 14 (−72.0%) | 883 |
| 61D → 50 | 94 → 38 (−60.3%) | 120 → 66 (−45.0%) | 2,956 |
| 77, 86 → 86 | 122 → 63 (−48.4%) | 118 → 66 (−44.1%) | 3,285 |
| 93 → 93 | 61 → 32 (−48.3%) | 60 → 54 (−10.0%) | 1,631 |
| 69 → 69, 69S | 76 → 40 (−47.5%) | 48 → 40 (−16.7%) | 1,188 |
| P16 → 77L | 21 → 11 (−47.0%) | 22 → 14 (−36.4%) | 350 |
| P76 → 76L | 15 → 8 (−44.6%) | 15 → 10 (−33.3%) | 270 |
| 91 → 91 | 99 → 65 (−34.2%) | 115 → 82 (−28.7%) | 2,516 |
| 39 → 39 | 40 → 28 (−30.8%) | 76 → 54 (−28.9%) | 766 |
| G2 → G1 | 39 → 30 (−22.4%) | 92 → 72 (−21.7%) | 1,387 |
| 54 → 54 | 127 → 99 (−21.7%) | 109 → 98 (−10.1%) | 3,930 |
| 12 → 12 | 57 → 45 (−20.6%) | 49 → 40 (−18.4%) | 1,134 |
| 81 → 81 | 40 → 32 (−20.5%) | 60 → 54 (−10.0%) | 1,217 |
| 13 → 13 | 60 → 52 (−12.8%) | 78 → 70 (−10.3%) | 1,541 |
| P12 → 73L | 16 → 14 (−10.6%) | 18 → 14 (−22.2%) | 264 |
| O12 → 12L | 12 → 11 (−10.4%) | 19 → 14 (−26.3%) | 331 |

**The two deepest are Flyers becoming peak-only limiteds** — 36 → 36L
(Banksville) and Y46 → 46L (Elizabeth). Both also lose Saturday and Sunday
entirely, and they are the same two groups that halve their trips
([LOSE-SERVICE-DAYS.md](LOSE-SERVICE-DAYS.md),
[LOSE-FREQUENCY-HALF.md](LOSE-FREQUENCY-HALF.md)).

**The largest by ridership are 77/86 → 86 (3,285 riders/day) and 61D → 50
(2,956).** Both lose roughly half their hours and 44–45% of their trips on every
day type — these are the two most consequential entries on this page.

## The seven that are shortenings, not cuts

These lose hours while running **more** trips. The route got shorter; a rider at
a stop that keeps its bus sees the same or better frequency. Quoting these as
service cuts would be wrong.

| Corridor | Hours | Trips | In-service min/trip | Riders/day |
|---|---|---|---|---:|
| 74 → 74 | 44 → 27 (−38.3%) | 50 → 54 (+8.0%) | 53.3 → 30.4 | 796 |
| 59 → 59 | 111 → 73 (−34.3%) | 52 → 66 (+26.9%) | 128.5 → 66.5 | 2,118 |
| 4 → 4 | 24 → 17 (−28.7%) | 44 → 50 (+13.6%) | 32.0 → 20.0 | 331 |
| 71A → 85 | 74 → 58 (−22.5%) | 126 → 128 (+1.6%) | 35.4 → 27.0 | 3,054 |
| 67 → 67 | 80 → 70 (−13.4%) | 54 → 66 (+22.2%) | 89.2 → 63.2 | 1,634 |
| 75 → 75 | 87 → 76 (−12.5%) | 92 → 98 (+6.5%) | 56.7 → 46.6 | 3,166 |
| 60 → 65 | 11 → 10 (−11.2%) | 16 → 22 (+37.5%) | 40.5 → 26.2 | 481 |

Route 59 is the clearest case: 128.5 in-service minutes per trip today, 66.5
proposed, over 52 trips then and 66 now. That is a long route split in half.
System-wide the mean trip is near-flat (−2.9% weekday), which is exactly why the
per-group figure has to be checked before a group's hours are read as harm.

## The six durable losses

Groups losing ≥10% of hours on **all three day types** — the ones a rider
experiences every day of the week rather than on one:

| Corridor | Weekday | Saturday | Sunday | Riders/day |
|---|---:|---:|---:|---:|
| 77, 86 → 86 | −48.4% | −50.3% | −63.6% | 3,285 |
| 61D → 50 | −60.3% | −61.9% | −60.8% | 2,956 |
| 59 → 59 | −34.3% | −29.6% | −42.0% | 2,118 |
| G2 → G1 | −22.4% | −25.8% | −27.1% | 1,387 |
| 81 → 81 | −20.5% | −30.8% | −39.3% | 1,217 |
| 74 → 74 | −38.3% | −45.5% | −16.3% | 796 |

Two of the six — 59 and 74 — are shortenings on weekdays by the trip test above,
so **77/86 → 86, 61D → 50, G2 → G1 and 81 are the four groups that lose service
in every sense on every day type.**

## Weekend losers

Saturday, groups keeping service and losing ≥10% of hours: 61D → 50 (−61.9%),
77/86 → 86 (−50.3%), 74 (−45.5%), 81 (−30.8%), 59 (−29.6%), 44 (−27.6%),
55 → 55/55S (−26.0%), G2 → G1 (−25.8%), 71A → 85 (−19.8%), P68 → 68 (−19.0%),
93 (−16.5%), 54 (−13.0%), 6 (−11.0%).

Sunday: 77/86 → 86 (−63.6%), 61D → 50 (−60.8%), 59 (−42.0%), 83 (−41.0%),
81 (−39.3%), 55 → 55/55S (−34.9%), P68 → 68 (−34.7%), G2 → G1 (−27.1%),
91 (−22.7%), 6 (−18.0%), 74 (−16.3%), 67 (−15.8%), 82 (−11.6%).

Both weekend lists are shorter than the weekday one and are outnumbered better
than two to one by gainers, consistent with the weekend growth in the totals
table ([GAIN-SERVICE-HOURS.md](GAIN-SERVICE-HOURS.md)).

## Riders on the losing side

Summed over each group's current routes, using WPRDC route-level averages for
April 2026:

| Day | Riders on groups losing ≥10% | On groups gaining ≥10% | On discontinued groups |
|---|---:|---:|---:|
| Weekday | 35,536 | 39,914 | 6,331 |
| Saturday | 24,226 | 45,897 | 3,563 |
| Sunday | 24,216 | 52,375 | 3,014 |

These riders are not stranded — most corridors are redistributed rather than
dropped — but they are the population whose service changes, and the weekday
figures are close enough to even that neither side should be quoted alone.

## The unit is a group, not a corridor

The repo's first convention is that route N is never compared to route N, because
the plan re-splits corridors. The unit here is a **group**: the connected
component joining current route numbers to the proposed numbers PRT maps them to,
built from `route_crosswalk.csv` plus the S-variants the crosswalk omits. That
fixes renumbering — today's 61B and the proposed 62X are one group.

It does **not** fix corridor coverage. Where the plan covers a corridor with a
route PRT records as NEW, the new route forms its own group and the incumbent's
group looks cut. Carrick is the canonical case: today's 51 groups with the
proposed 51 and 51S at +2.1% weekday hours, while the new route 45 — 70 weekday
trips and 58 hours over much of the same corridor — sits in a separate group and
is never added in ([locations/ROUTE-51.md](locations/ROUTE-51.md)).

The groups are not merged further because the crosswalk's `related_routes` column
chains: route 1 relates to 5 and 91, 39 to 34 and 35, and unioning on it
collapses most of the network into one component. A coarse grouping beats a wrong
one. The full reasoning is in `analyze_route_hours.py`'s module docstring.

**So this page answers "what happened to this service". It is not the authority
on whether a place lost buses** — that is
[COVERAGE-CHANGE.md](COVERAGE-CHANGE.md) and
[LOSE-FREQUENCY-HALF.md](LOSE-FREQUENCY-HALF.md), which measure locations and are
immune to grouping by construction.

## Caveats

**Revenue hours are in-service time only** — first stop to last, summed over
trips. Layover, deadhead and pull-in/pull-out are not in a GTFS. This is a floor
on platform hours and is **not** comparable to PRT's own service-hour budget.
Do not use this page to argue about operating cost.

**Hours are a poor proxy for what a rider gets.** The seven shortenings above are
the proof. Always read a group's trips beside its hours; where they disagree,
check in-service minutes per trip before concluding anything.

**+5.6% weekday trips here is not the +3.3% in [COVERAGE-CHANGE.md](COVERAGE-CHANGE.md).**
Different units, both correct: this page counts whole trips network-wide, that one
sums trips at locations, so a trip through 40 stops is weighted forty times there
and once here.

**`riders_weekday` is current-side only.** It sums the WPRDC averages for the
group's *current* routes, so new groups show 0 by construction and the column
cannot be read as a projection of proposed ridership. Vintage April 2026,
route-level — preferred over stop-level for route totals.

**A discontinued number may be reused for different service.** Today's 17 and 2
are discontinued while the proposal has a 17 and a 2L that are other corridors,
so the two sides are namespaced and never matched on the number alone.

**The two feeds describe different years** — current sampled 2026-09-16/19/20,
proposed 2027-09-15/18/19, each a holiday-free week inside its own validity
window. Rail and the inclines are excluded on both sides.

**The proposed feed's provenance is not yet recorded.** Its `feed_info.txt` names
PRT as publisher and is stamped 2026-08-11, and `verify_proposed_gtfs.py` checks
it against the published plan, but how it reached this repo is unrecorded and
must be before this page is cited publicly. See `DATA_SOURCES.md`.

## Reproduce

```bash
python3 ingest_blr.py                # once, for route_crosswalk.csv and ridership
python3 analyze_route_hours.py       # -> data/route_frequency_change.csv
```

The printed report contains every table above. To re-derive the headline counts:

```bash
python3 -c "
import csv
rows = list(csv.DictReader(open('data/route_frequency_change.csv')))
f = lambda r, k: None if r[k] == '' else float(r[k])
los = [r for r in rows if f(r, 'pct_weekday_hours') is not None
       and f(r, 'pct_weekday_hours') <= -10 and f(r, 'prop_weekday_hours') > 0]
cut = [r for r in los if f(r, 'pct_weekday_trips') < 0]
print(len(los), 'groups lose >=10% of weekday hours;', len(cut), 'lose trips too')
print(sum(f(r, 'cur_weekday_hours') - f(r, 'prop_weekday_hours') for r in los), 'net hours')"
```
