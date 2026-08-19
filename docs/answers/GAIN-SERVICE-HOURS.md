# GAIN-SERVICE-HOURS

> What routes are gaining service hours overall?

**Every day type gains, and the weekend gains most:** in-service hours rise
+2.5% on weekdays, **+18.0% on Saturday** and **+15.7% on Sunday**. This is the
plan's direction, and it is the context the losses on
[LOSE-SERVICE-HOURS.md](LOSE-SERVICE-HOURS.md) belong in.

**26 corridor groups gain 10% or more of their weekday hours** (+377 hours), and
**14 new groups add 531 weekday hours** on top. On Saturday it is 29 gaining
groups and on Sunday 32 — against 13 losing groups on each.

## Result

System totals, both sides counted from real timetables through `gtfs.py`:

| Day | Trips now | Proposed | Change | Hours now | Proposed | Change |
|---|---:|---:|---:|---:|---:|---:|
| Weekday | 5,266 | 5,559 | +5.6% | 4,253 | 4,360 | **+2.5%** |
| Saturday | 3,513 | 4,107 | **+16.9%** | 2,609 | 3,078 | **+18.0%** |
| Sunday | 2,611 | 3,143 | **+20.4%** | 1,969 | 2,278 | **+15.7%** |

| Day | Gaining ≥10% | Net hours gained | Losing ≥10% | New groups |
|---|---:|---:|---:|---:|
| Weekday | **26** | +377 | 24 | 14 groups, 531 h |
| Saturday | **29** | +408 | 13 | 13 groups, 396 h |
| Sunday | **32** | +292 | 13 | 13 groups, 304 h |

**The weekday and weekend stories are different.** On weekdays gainers and losers
are near-balanced (26 against 24, +377 against −466 hours) and the net rise comes
mostly from the new routes. On both weekend days gainers outnumber losers better
than two to one, and hours rise by roughly a sixth.

## The 26 weekday gains

`riders/day` is the WPRDC route-level average for the group's **current** routes —
who rides the corridor today, not a projection.

| Corridor | Hours | Trips | Riders/day |
|---|---|---|---:|
| 58 → 58 | 32 → 75 (+131.0%) | 40 → 66 | 414 |
| 7 → 7 | 5 → 11 (+119.3%) | 12 → 34 | 63 |
| 57 → 57 | 30 → 55 (+86.9%) | 46 → 68 | 847 |
| P13 → 2L | 4 → 7 (+69.4%) | 6 → 10 | 52 |
| 29 → 29, 29S | 43 → 70 (+62.1%) | 43 → 70 | 824 |
| P78 → 78, 78S | 43 → 70 (+61.7%) | 44 → 68 | 835 |
| Y49 → 49 | 30 → 46 (+54.9%) | 36 → 50 | 689 |
| 79 → 79 | 27 → 41 (+54.5%) | 49 → 66 | 574 |
| 61B → 62X | 118 → 174 (+47.5%) | 122 → 166 | 4,058 |
| 6 → 6 | 30 → 44 (+46.3%) | 63 → 66 | 1,114 |
| P10 → 1L | 14 → 20 (+45.6%) | 10 → 14 | 191 |
| 41 → 35, 35S | 38 → 49 (+30.1%) | 44 → 54 | 650 |
| 14 → 14 | 37 → 47 (+27.1%) | 48 → 38 | 541 |
| G3 → 23L | 10 → 13 (+26.5%) | 14 → 14 | 199 |
| 24 → 24 | 53 → 65 (+22.2%) | 62 → 66 | 1,273 |
| 21 → 21 | 49 → 59 (+22.0%) | 60 → 54 | 978 |
| 16 → 16 | 61 → 73 (+20.9%) | 110 → 128 | 2,243 |
| 40 → 40 | 27 → 32 (+16.8%) | 55 → 54 | 365 |
| 27 → 27 | 32 → 38 (+16.5%) | 60 → 54 | 779 |
| 55 → 55, 55S | 52 → 60 (+14.2%) | 35 → 56 | 930 |
| 64 → 64 | 57 → 65 (+13.8%) | 72 → 70 | 1,634 |
| 61A → 60X | 139 → 157 (+13.3%) | 120 → 132 | 5,551 |
| P1 → P1 | 87 → 97 (+12.2%) | 202 → 230 | 5,986 |
| 48 → 48 | 45 → 51 (+12.1%) | 76 → 86 | 2,071 |
| 88 → 88 | 42 → 47 (+11.2%) | 70 → 70 | 1,141 |
| 61C → 61X | 143 → 159 (+11.1%) | 122 → 132 | 5,912 |

**The three biggest gains by ridership are the 61 corridor's renumbering** —
61C → 61X (5,912 riders/day, +11.1% hours), 61A → 60X (5,551, +13.3%) and
61B → 62X (4,058, +47.5%) — followed by the P1 busway (5,986 riders/day, +12.2%
hours and 202 → 230 weekday trips). Those four groups carry 21,507 riders/day
between them, against 23,955 on the 17 groups that genuinely lose weekday
service — comparable totals, which is the honest way to put the headline:
**the plan's added hours land on some of its busiest corridors, and its cuts land
on others.**

## Read five of these as route lengthenings

These gain hours while running **fewer** trips — the route got longer, not more
frequent. A rider at an existing stop may see the same or slightly worse
frequency even though hours rise.

| Corridor | Hours | Trips | In-service min/trip | Riders/day |
|---|---|---|---|---:|
| 14 → 14 | 37 → 47 (+27.1%) | 48 → 38 (−20.8%) | 46.6 → 74.8 | 541 |
| 21 → 21 | 49 → 59 (+22.0%) | 60 → 54 (−10.0%) | 48.6 → 65.9 | 978 |
| 27 → 27 | 32 → 38 (+16.5%) | 60 → 54 (−10.0%) | 32.3 → 41.9 | 779 |
| 64 → 64 | 57 → 65 (+13.8%) | 72 → 70 (−2.8%) | 47.8 → 55.9 | 1,634 |
| 40 → 40 | 27 → 32 (+16.8%) | 55 → 54 (−1.8%) | 29.6 → 35.2 | 365 |

Route 14 is the clearest: 46.6 in-service minutes per trip today, 74.8 proposed,
over 48 trips then and 38 now. A longer route reaching further, at lower
frequency. The mirror image — hours down, trips up — is the seven shortenings on
[LOSE-SERVICE-HOURS.md](LOSE-SERVICE-HOURS.md).

## The eleven durable gains

Groups gaining ≥10% of hours on **all three day types**:

| Corridor | Weekday | Saturday | Sunday | Riders/day |
|---|---:|---:|---:|---:|
| 61C → 61X | +11.1% | +36.3% | +37.7% | 5,912 |
| 61A → 60X | +13.3% | +30.8% | +29.9% | 5,551 |
| 61B → 62X | +47.5% | +46.0% | +46.6% | 4,058 |
| 24 → 24 | +22.2% | +70.9% | +13.1% | 1,273 |
| 29 → 29, 29S | +62.1% | +123.7% | +184.8% | 824 |
| 27 → 27 | +16.5% | +34.8% | +15.4% | 779 |
| Y49 → 49 | +54.9% | +25.5% | +25.4% | 689 |
| 79 → 79 | +54.5% | +10.0% | +34.6% | 574 |
| 14 → 14 | +27.1% | +73.4% | +72.9% | 541 |
| 58 → 58 | +131.0% | +214.7% | +165.2% | 414 |
| 40 → 40 | +16.8% | +50.5% | +35.6% | 365 |

The whole 61 family is here, gaining on every day type and gaining most at the
weekend. **Route 58 more than doubles on all three days** (+131% weekday, +215%
Saturday, +165% Sunday) off a small base.

## The new routes

14 groups have no current side at all and add **531 weekday hours**, more than
the 466 hours the 24 losing groups shed:

| New route | Weekday hours (rounded) | Weekday trips |
|---|---:|---:|
| 70 | 72 | 98 |
| 45 | 58 | 70 |
| 92 | 50 | 70 |
| 18 | 50 | 19 |
| 5 | 48 | 66 |
| 25 | 46 | 60 |
| 9 | 38 | 34 |
| 84 | 36 | 66 |
| 66 | 33 | 38 |
| 34 | 26 | 38 |
| 17 | 24 | 38 |
| 89, 89S | 20 | 32 |
| 3 | 17 | 32 |
| 63 | 15 | 32 |

These hours are **not** a like-for-like replacement for the 364 weekday hours on
discontinued routes — a new route may or may not cover a discontinued one's
corridor, and this page cannot tell you which. Route 45 is the example that
matters: 58 hours over much of today's route 51 corridor in Carrick, sitting in
its own group while the 51's group is scored separately
([locations/ROUTE-51.md](locations/ROUTE-51.md)). Details in
[NEW-ROUTE.md](NEW-ROUTE.md).

## Weekend gainers

Saturday's largest: 58 (+214.7%), 29 → 29/29S (+123.7%), 87 (+87.1%),
14 (+73.4%), 24 (+70.9%), 53 → 53/53S (+70.4%), 1 (+69.7%), 40 (+50.5%),
61B → 62X (+46.0%), 88 (+40.9%), 69 → 69/69S (+40.1%), 38 (+38.2%), 31 (+36.9%),
61C → 61X (+36.3%), 57 (+35.0%) — 29 groups in all.

Sunday's largest: 87 (+193.3%), 29 → 29/29S (+184.8%), 53 → 53/53S (+172.2%),
58 (+165.2%), 39 (+77.7%), 22 (+77.6%), 14 (+72.9%), 38 (+53.0%),
61B → 62X (+46.6%), 11 (+44.5%), 4 (+43.5%), 41 → 35/35S (+43.1%), 48 (+40.8%) —
32 groups in all.

**Several of these are the S-variant splits, and they are not all the same
mechanism.** The 29, 55 and 69 keep their weekend service but move it to a short
variant, so the parent number goes weekday-only while the *group* gains hours.
The 53 runs only at weekends today and hands those weekends to the 53S while the
parent picks up weekdays. The 78 is a genuine addition — today's P78 is
weekday-only and the proposal adds Saturday and Sunday through the 78S. Only the
group-level figure is safe to quote for any of them; the per-number reading is in
[GAIN-SERVICE-DAYS.md](GAIN-SERVICE-DAYS.md) and
[LOSE-SERVICE-DAYS.md](LOSE-SERVICE-DAYS.md).

## The unit is a group, not a corridor

Identical to the losing page — see
[LOSE-SERVICE-HOURS.md § the unit is a group](LOSE-SERVICE-HOURS.md#the-unit-is-a-group-not-a-corridor).
In short: groups fix renumbering (61B and 62X are one group) but not corridor
coverage (a new route covering an incumbent's corridor forms its own group).
This page answers "what happened to this service", not "did this place gain
buses" — the latter is [COVERAGE-CHANGE.md](COVERAGE-CHANGE.md) and
[GAIN-FREQUENCY-DOUBLE.md](GAIN-FREQUENCY-DOUBLE.md).

## Caveats

**Revenue hours are in-service time only** — first stop to last, summed over
trips. Layover, deadhead and pull-in/pull-out are not in a GTFS, so this is a
floor on platform hours and is **not** comparable to PRT's own service-hour
budget. It is not evidence about what the plan costs.

**More hours is not always more service.** The five lengthenings above gain hours
on fewer trips. Read a group's trips beside its hours in every case.

**+5.6% weekday trips here is not the +3.3% in [COVERAGE-CHANGE.md](COVERAGE-CHANGE.md).**
Different units, both correct: this page counts whole trips network-wide, that one
sums trips at locations, so a trip through 40 stops is weighted forty times there
and once here.

**`riders_weekday` is current-side only** — the WPRDC averages for the group's
*current* routes, April 2026, route-level. New groups show 0 by construction, so
the column cannot be read as a projection of proposed ridership, and the new
routes' 531 hours have no ridership figure attached anywhere in this repo.

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
for day in ('weekday', 'saturday', 'sunday'):
    gai = [r for r in rows if f(r, f'pct_{day}_hours') is not None
           and f(r, f'pct_{day}_hours') >= 10]
    new = [r for r in rows if r['status'] == 'new' and f(r, f'prop_{day}_hours') > 0]
    print(day, len(gai), 'groups gain >=10%;',
          round(sum(f(r, f'prop_{day}_hours') - f(r, f'cur_{day}_hours') for r in gai)),
          'net hours;', len(new), 'new groups add',
          round(sum(f(r, f'prop_{day}_hours') for r in new)))"
```
