# EQUITY-VEHICLE

> How has service access changed depending on vehicle access?

**Answered, and this is the group with the most at stake.** Allegheny County's
**65,143 households with no vehicle** are the residents for whom a bus stop is
not a convenience. They come out ahead of the county on every tier: they lose
all bus service at **0.65×** the county rate, hold weekend coverage steady while
the county loses it, and gain weekend hourly service **+5.8 points against
+4.3**.

Read it with [METHOD-equity.md](METHOD-equity.md). Universe is **households**.

## Result

Share of Allegheny County households with each tier within 400 m of home, now →
proposed. Source `data/equity_change.csv`, scope `allegheny`, radius 400.

| Group | Households | Any bus | Weekend bus | Weekday hourly | Weekend hourly |
|---|---:|---:|---:|---:|---:|
| **All households** | 545,802 | 55.6 → 51.6 (**−4.0**) | 49.4 → 48.6 (**−0.8**) | 41.9 → 43.9 (**+2.0**) | 31.6 → 35.9 (**+4.3**) |
| No vehicle | 65,143 | 81.2 → 79.0 (**−2.2**) | 76.9 → 77.0 (**+0.1**) | 68.3 → 72.3 (**+3.9**) | 56.7 → 62.5 (**+5.8**) |
| One vehicle | 221,226 | 62.1 → 58.2 (**−3.8**) | 55.7 → 55.2 (**−0.6**) | 47.4 → 50.1 (**+2.7**) | 36.0 → 41.1 (**+5.0**) |

From ACS table B25044 (tenure by vehicles available), summing owner- and
renter-occupied households with no vehicle. The journey-to-work table B08201
asks a similar question but is not published below tract level; this one is.

**The residual is what matters here.** Even after the plan, **21% of car-free
Allegheny households have no bus within 400 m of home**, and 37.5% have no
hourly weekend bus. The plan improves that; it does not solve it.

## Disproportion

| Group | Any bus | | Weekday hourly | | Weekend hourly | |
|---|---:|---:|---:|---:|---:|---:|
| | *loss* | *gain* | *loss* | *gain* | *loss* | *gain* |
| No vehicle | **0.65** | 0.87 | 0.88 | **1.20** | 1.21 | **1.28** |
| One vehicle | 0.97 | 0.99 | 1.07 | 1.15 | 1.09 | 1.13 |

Car-free households are protected on the tier that matters most — losing all
service — and favoured on the tier that determines whether the bus is usable.
The weekend-hourly loss ratio of 1.21 comes with a gain ratio of 1.28 and a net
of +5.8 points: churn, not harm (method caveat 6).

Still, **2,376 car-free households lose all bus service near home** and 2,654
lose weekday hourly service. Those are the households with no fallback, and
`analyze_equity_places.py` now puts them on named ground rather than leaving
them as a total: **twenty-five places hold 88% of them**, and they are suburban
almost without exception.

| Place | Car-free households losing every bus | Gaining one |
|---|---:|---:|
| Kennedy township | 198 | 0 |
| Scott township | 178 | 7 |
| Bridgeville borough | 149 | 0 |
| Bethel Park municipality | 148 | 0 |
| Baldwin borough | 135 | 0 |
| McCandless township | 121 | 4 |
| Carrick | 111 | 0 |
| Ross township | 108 | 111 |

Read both columns. Ross township is on this list and comes out level; Kennedy,
Bridgeville and Bethel Park do not. Full list, block group by block group, in
`data/equity_places.csv`, with the distance from each block group's centre to
the stop that named it — PRT's HOOD/MUNI labels are only as good as convention
6 allows, so a name from over a kilometre away should be discounted.

## Service volume

Departures per day within 400 m of home, weighted by households:

| Group | Weekday now → proposed | Saturday | Sunday |
|---|---|---:|---:|
| **All households** | 114.8 → 121.8 (+6.1%) | +18.8% | +21.7% |
| No vehicle | 255.9 → 271.8 (+6.2%) | +18.1% | +19.8% |
| One vehicle | 133.8 → 142.8 (+6.7%) | +19.6% | +22.0% |

Car-free households live where the buses are — 256 departures a day against 115
for the county — which is both a sign that the network is aimed at them and a
reminder that in Allegheny County, going car-free is largely only possible in
the places it already serves.

## Caveats

All eight in [METHOD-equity.md](METHOD-equity.md) apply. For this question:

- **Vehicle access is endogenous to service.** Households without cars
  overwhelmingly live where transit already runs — so a comparison of their
  coverage to the county's measures where car-free people can afford to live as
  much as it measures the plan. The *change* columns are the meaningful ones;
  the levels are partly a description of Pittsburgh's housing market.
- **A household with one vehicle and three adults** is functionally car-free for
  two of them. The one-vehicle row is included for that reason and should not be
  read as "has a car".

## Reproduce

```bash
python3 ingest_census.py
python3 analyze_equity_change.py
```

Backing data: `data/equity_change.csv` (`question=EQUITY-VEHICLE`),
`data/equity_frequency.csv`, `data/equity_block_groups.csv`.
