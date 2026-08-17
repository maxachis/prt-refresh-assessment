# COVERAGE-CHANGE

> What is the total change in coverage, in terms of area, and by several
> different coverage criteria.

**Answered by criterion, not yet by area.** Across all five BASE_CAMP coverage
tiers the plan is close to neutral on weekdays and clearly positive on weekends:
593 of 5,751 locations lose their bus entirely, while **weekend
hourly-or-better coverage grows at 415 more locations than it loses**.

## Result: the five tiers

Locations are the 5,751 stops served today that carry a PRT ridership record.
Both networks are measured inside 400 m of each one. "Boardings at risk" is
weekday boardings for weekday tiers, Saturday plus Sunday for weekend tiers.

| Tier | Now | Proposed | Net | Lose it | Gain it | Boardings at risk |
|---|---:|---:|---:|---:|---:|---:|
| WEEK-ANY-MINIMUM | 5,751 | 5,158 | −593 | 593 | 0 | 488 |
| WEEKDAYS-ANY-MINIMUM | 5,751 | 5,158 | −593 | 593 | 0 | 488 |
| WEEKENDS-ANY-MINIMUM | 5,130 | 4,888 | −242 | 399 | 157 | 434 |
| WEEK-ANY-HOURLY | 4,524 | 4,496 | **−28** | 490 | 462 | 1,195 |
| WEEKEND-ANY-HOURLY | 3,366 | 3,781 | **+415** | 338 | 753 | 1,232 |

`WEEK-ANY-MINIMUM` and `WEEKDAYS-ANY-MINIMUM` are identical because no location
in either network has weekend service without weekday service, so "any bus in the
week" and "any bus on a weekday" select the same places. Full per-location detail,
including Saturday and Sunday separately, is in `data/coverage_change.csv`.

## Service volume, the other half of the answer

Summed across locations — a ratio, not a count of buses, since a corridor is
counted once per stop along it:

| Day | Now | Proposed | Change |
|---|---:|---:|---:|
| Weekday | 1,166,525 | 1,209,466 | **+3.7%** |
| Saturday | 778,357 | 899,562 | **+15.6%** |
| Sunday | 580,883 | 680,500 | **+17.1%** |

This is the clearest single statement about the plan: **a modest weekday increase
and a large weekend increase, paid for with a smaller footprint.** 593 locations
lose service outright and the places that keep it mostly get more buses,
especially on weekends. Presenting the Refresh as a service cut is not supported
by the data; presenting it as costless is not either.

**This supersedes `FINDINGS.md` §C's −0.9% weekday figure**, which was derived
from published headways before the proposed GTFS was available and could not see
the S-variants — see [METHOD-coverage.md](METHOD-coverage.md).

## Walk distance is doing real work

The same tiers at 150 m instead of 400 m:

| Tier | Lost at 400 m | Lost at 150 m |
|---|---:|---:|
| WEEK-ANY-MINIMUM | 593 | 900 |
| WEEKDAYS-ANY-MINIMUM | 593 | 900 |
| WEEKENDS-ANY-MINIMUM | 399 | 637 |
| WEEK-ANY-HOURLY | 490 | 679 |
| WEEKEND-ANY-HOURLY | 338 | 482 |

The gap between the two columns is stop consolidation: those locations keep a bus
within a quarter mile but not on the same corner. For a rider with a mobility
impairment the 150 m column is closer to the truth, and both belong in any
citation.

## What is still missing: area

The tier criteria are answered; **coverage as an area in square kilometres is
not built.** It needs no new data — both networks' stop coordinates are already
in `data/`, so it is a buffer union over the same tiers computed here. Until it
exists, this answer covers "how many places and how many riders" but not "how
many square miles", and BASE_CAMP asks for both.

## Caveats

The denominator is stops **served today with a ridership record**, so this
measures change at today's locations. A brand-new stop in a place with no bus
today cannot appear as a gain — the tiers understate greenfield coverage. Route
additions are in [NEW-ROUTE.md](NEW-ROUTE.md).

Hourly is a maximum-gap test across 6am–6pm in the better direction; peak-only
service fails it. The 1,195 and 1,232 boardings "at risk" on the hourly rows are
mostly at locations that keep frequent peak service and lose midday or evening
continuity, which is a different harm from losing the bus.

10 `onDemandZones` microtransit polygons are not accounted for anywhere, so
losses in those areas may be overstated.

119 rows carry a stop id PRT's usage extract and the GTFS disagree about, so their
boardings and place labels belong to a different stop (1,333 weekday boardings in
total). Tier counts are unaffected; the flag is `id_name_mismatch`.

Shared method and caveats: [METHOD-coverage.md](METHOD-coverage.md).

## Reproduce

```bash
python3 analyze_coverage_change.py   # -> data/coverage_change.csv
```
