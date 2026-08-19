# STOP-LOST-SERVICE

> What stops have lost service by one of the given service criteria?

**593 locations lose all bus service at 400 m, 900 at 150 m**, carrying 488 and
1,270 weekday boardings. Beyond those, **152 locations keep their weekday buses
and lose the weekend entirely**, and **490 fall below hourly-or-better on
weekdays** while keeping a bus.

The weekend losses have one mechanism behind almost all of them: **an all-week
flyer becomes a peak-only weekday limited.**

## Result, by criterion

Per-location detail is in `data/coverage_change.csv`; the columns are `cur_*` /
`prop_*` per tier at both radii.

| Criterion | Losing it at 400 m | at 150 m | Boardings at risk |
|---|---:|---:|---:|
| WEEK-ANY-MINIMUM (any bus at all) | 593 | 900 | 488 weekday |
| WEEKDAYS-ANY-MINIMUM | 593 | 900 | 488 weekday |
| WEEKENDS-ANY-MINIMUM | 399 | 637 | 434 weekend |
| WEEK-ANY-HOURLY | 490 | 679 | 1,195 weekday |
| WEEKEND-ANY-HOURLY | 338 | 482 | 1,232 weekend |

Of the 399 losing weekend service, **246 lose all service in any case** and
belong to the first row rather than to a weekend story. The genuinely
weekend-specific losses are **152 locations** (153 for Saturday, 130 for Sunday),
carrying about 167 weekend boardings between them.

## The weekend losses are three corridors

| Corridor | Locations | Weekend boardings | What changes |
|---|---:|---:|---|
| **Mount Royal Blvd** — Shaler (47), Etna (10), Hampton (5) | 62 | 40.4 | the 2 is discontinued and the P13 becomes the peak-only **2L** |
| **Route 51 south** — Jefferson Hills (24), Whitehall (23), Clairton (4), Elizabeth (1) | 52 | 65.4 | the Y45, Y46 and Y47 flyers become the peak-only **46L** |
| **Banksville Rd** — Banksville (9), Beechview (5), Mount Lebanon (4) | 18 | 24.8 | the 36 becomes the peak-only **36L** |
| **Summit Park Dr**, North Fayette | 11 | 22.4 | the 29 keeps weekdays here; the 29S, which runs weekends, does not come |

A peak-only limited is weekday-only by construction, so every stop whose only
service was a flyer loses Saturday and Sunday outright. The single largest
weekend loss at one stop is **Third Ave at the Rt 51 overpass in Elizabeth** —
32 Saturday trips to zero, 39.4 weekend boardings — where the Y46 becomes the
46L.

The North Fayette case is the one to understand before quoting any route-level
answer. At route level "the 29 keeps its weekends" is true, because the 29S runs
68 Saturday trips — but not over Summit Park Dr. **A variant covering a corridor
is not the same as covering every street its parent served.**

Note also that two of these corridors are driven by *discontinued* routes (the 2,
Y45, Y47), which never appear in
[LOSE-SERVICE-DAYS.md](LOSE-SERVICE-DAYS.md)'s route-level answer. Only the
stop-level view catches them.

## Busiest locations losing all service

| Weekday boardings | Stop | Place | Routes today |
|---:|---|---|---|
| 30.5 | HIGHLAND DR + JOB CORPS DR | Lincoln–Lemington | 74 |
| 13.3 | BANK ST + WALNUT | Sewickley | 21 |
| 10.7 | OXFORD DR + GIANT EAGLE | Bethel Park | 36 |
| 10.3 | CHARLES ST + IRWIN | Perry South | 15 |
| 9.8 | BLAZIER + GIANT EAGLE | McCandless | 12, O12 |
| 8.8 | 5TH ST + CAVIT | Trafford | 69, P69 |

No location losing all service carries more than about 31 weekday boardings. The
losses are broad and thin rather than concentrated — the opposite shape from the
frequency changes, where a few busy corridors move a great deal
([LOSE-FREQUENCY-HALF.md](LOSE-FREQUENCY-HALF.md)). Two of the six are a
supermarket stop.

## Cross-validation

Two independent pipelines answer "loses all service" and they agree.
`analyze_service_loss.py` compares stop ids against the Remix map with a 150 m
walk test and finds **870 stops** (854 confirmed, 16 unverifiable against the
Remix map's 2023 base feed); this analysis counts real trips in both GTFS feeds
at 150 m and finds **900 locations**, with **867 in common**. Different
proposed-network sources, different logic, a 3.4% difference in the total. Either
is defensible; quoting both is better.

## Caveats

**A stop id disappearing is not a lost bus** — stops are renumbered, consolidated
and nudged across intersections. Both networks are therefore measured by
proximity, and both radii are reported: the gap between the 400 m and 150 m
columns is stop consolidation, not service loss.

**119 of the 5,751 rows carry a stop id the two PRT sources disagree about.**
Trips and geometry come from the GTFS; boardings and the `HOOD`/`MUNI` labels come
from the usage extract on the same id, and for those rows they describe a
different physical stop — id 22728 is `SMITHFIELD ST AT FIFTH AVE` in the extract
and `CHURCH AVE AT DALZELL AVE` in the feed. They are flagged as
`id_name_mismatch` and excluded from every example table here. Tier counts are
unaffected (they do not depend on names), but the 1,333 weekday boardings on
those rows should not be attributed to a place.

Boardings at these locations are small partly *because* service there is already
thin. Low boardings are not evidence that nobody is affected — 30 boardings a day
is 30 people whose trip changes.

The 5,751 locations are stops served today **with a ridership record**, so stops
without one are not in the denominator.

**The 10 proposed on-demand zones are not accounted for at stop level.** They are
now measured in area — 23% of the ground losing all fixed-route service falls
inside one ([COVERAGE-CHANGE.md](COVERAGE-CHANGE.md)) — so some of the losses
counted here would be offered microtransit rather than nothing. The zones with
lost ground inside them are McCandless, South Hilltop, Penn Hills, Highlands
Area, USC-BP and McKees Rocks; a loss anywhere else is unaffected by them. Each
zone runs on 1–3 vehicles, so a zone is a reason to qualify a loss, not to drop
it.

Shared method and caveats: [METHOD-coverage.md](METHOD-coverage.md).

## Reproduce

```bash
python3 analyze_coverage_change.py   # -> data/coverage_change.csv
python3 analyze_service_loss.py      # -> data/stop_service_change.csv (the
                                     #    independent Remix-based comparison)
```
