# EQUITY-DISABILITY

> How has service access changed depending on disability status?

**Answered, with the coarsest geography of the six.** Allegheny County's
**170,957 residents with a disability** lose bus coverage at exactly the county
rate and gain frequency well above it: **+3.8 points** of weekday hourly access
against +1.9 for the county, and **+5.0** of weekend hourly against +4.1. On the
tier that decides whether a bus is usable, they gain at **1.31×** the county
rate.

Read it with [METHOD-equity.md](METHOD-equity.md), and note caveat 4 — ACS
publishes disability no finer than the tract, so this answer is coarser than
the race, age, income and vehicle ones.

## Result

Share of Allegheny County residents with each tier within 400 m of home, now →
proposed. Source `data/equity_change.csv`, scope `allegheny`, radius 400.

| Group | Residents | Any bus | Weekend bus | Weekday hourly | Weekend hourly |
|---|---:|---:|---:|---:|---:|
| **All residents** | 1,238,177 | 53.3 → 49.4 (**−3.9**) | 47.3 → 46.5 (**−0.9**) | 39.9 → 41.8 (**+1.9**) | 30.2 → 34.2 (**+4.1**) |
| With a disability | 170,957 | 58.3 → 54.5 (**−3.9**) | 51.8 → 51.4 (**−0.4**) | 42.5 → 46.3 (**+3.8**) | 31.9 → 36.9 (**+5.0**) |

From ACS table B18101, summing the "with a disability" cell under each of the
twelve sex-by-age branches. 14.3% of the three-county population.

**9,446 residents with a disability lose all bus service near home; 2,843 gain
it.** That net of −6,603 is the number to carry, alongside the 14,352 who gain
weekday hourly service against 7,776 who lose it.

## Disproportion

| Group | Any bus | | Weekend bus | | Weekday hourly | | Weekend hourly | |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| | *loss* | *gain* | *loss* | *gain* | *loss* | *gain* | *loss* | *gain* |
| With a disability | 0.99 | 1.02 | 1.01 | 1.15 | 1.01 | **1.31** | 1.07 | 1.17 |

Every loss ratio sits at or within noise of 1.00, and every gain ratio is above
it. This is the cleanest "no disparate impact, and a real benefit" result of the
six — with the geography caveat below doing real work against how confidently it
can be stated.

## Service volume

Departures per day within 400 m of home, weighted by population:

| Group | Weekday now → proposed | Saturday | Sunday |
|---|---|---:|---:|
| **All residents** | 114.7 → 121.0 (+5.5%) | +18.2% | +21.7% |
| With a disability | 103.1 → 109.1 (+5.8%) | +18.6% | +21.8% |

Slightly below the county on level, slightly above it on gain.

## Caveats

All eight in [METHOD-equity.md](METHOD-equity.md) apply. Three matter
particularly here:

- **Tract geography** (caveat 4). Disability rates were shared out from the
  tract to its block groups by population, so this assumes a uniform rate across
  a whole tract. Allegheny's tracts routinely contain both a nursing facility
  and a hillside of walk-ups; this method cannot tell them apart. Treat the
  disability figures as indicative, and never quote a single block group's row.

- **A 400 m walk radius is the wrong instrument for this question, and it is
  the only one available.** Walk distance is what every tier in this repo is
  built on, and for many people with a disability the binding constraint is not
  400 m but the grade, the sidewalk, the crossing, or whether the stop has a
  shelter and a level platform. A stop 300 m away up a Pittsburgh hillside is
  not the same access as a stop 300 m away on the flat. This analysis will
  report both as covered.

- **Stop amenities are not counted anywhere in this repo**, though PRT publishes
  them (`PRT_Current_Shelter_Locations`, with ADA platform flags — see
  `DATA_SOURCES.md`). Whether the plan concentrates service on stops that are
  actually accessible is a real, answerable question that this file does not
  answer.

## Reproduce

```bash
python3 ingest_census.py
python3 analyze_equity_change.py
```

Backing data: `data/equity_change.csv` (`question=EQUITY-DISABILITY`),
`data/equity_frequency.csv`, `data/equity_block_groups.csv`.
