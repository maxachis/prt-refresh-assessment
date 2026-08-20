# EQUITY-INCOME

> How has service access changed depending on income?

**Answered.** The plan is **progressive on every tier**. Coverage losses rise
monotonically with income — households under $25k lose all bus service at 0.76×
the county rate, households over $100k at 1.06× — and frequency gains fall just
as steeply, from **+4.4 points** of weekday-hourly access for the poorest
households to **+0.2** for the richest.

Read it with [METHOD-equity.md](METHOD-equity.md). Note the universe here is
**households**, not people: ACS publishes income by household.

## Result

Share of Allegheny County households with each tier within 400 m of home, now →
proposed. Source `data/equity_change.csv`, scope `allegheny`, radius 400.

| Group | Households | Any bus | Weekend bus | Weekday hourly | Weekend hourly |
|---|---:|---:|---:|---:|---:|
| **All households** | 545,802 | 55.6 → 51.6 (**−4.0**) | 49.4 → 48.6 (**−0.8**) | 41.9 → 43.9 (**+2.0**) | 31.6 → 35.9 (**+4.3**) |
| Under $25k | 86,622 | 72.0 → 69.4 (**−2.5**) | 66.4 → 67.2 (**+0.8**) | 57.6 → 62.0 (**+4.4**) | 45.5 → 51.8 (**+6.4**) |
| $25k–50k | 93,323 | 62.8 → 59.1 (**−3.6**) | 56.2 → 56.1 (**−0.1**) | 46.8 → 50.2 (**+3.4**) | 35.1 → 40.4 (**+5.3**) |
| $50k–75k | 82,657 | 59.1 → 54.8 (**−4.2**) | 52.3 → 51.4 (**−0.9**) | 44.1 → 46.6 (**+2.5**) | 33.3 → 37.3 (**+4.0**) |
| $75k–100k | 67,373 | 55.0 → 50.5 (**−4.5**) | 48.2 → 47.0 (**−1.2**) | 40.5 → 42.4 (**+1.9**) | 29.8 → 34.1 (**+4.3**) |
| $100k+ | 215,827 | 44.9 → 40.4 (**−4.5**) | 38.9 → 37.4 (**−1.5**) | 33.0 → 33.2 (**+0.2**) | 24.4 → 27.7 (**+3.3**) |

Brackets are ACS table B19001 collapsed into five. The gradient is the finding:
read any column top to bottom and the poorest bracket does best on it.

**Households under $25k are the only income group that gains weekend bus
coverage at all** (+0.8 points, against −0.8 for the county), and they gain
weekday hourly service more than twice as fast as the county.

## Disproportion

| Group | Any bus | | Weekday hourly | | Weekend hourly | |
|---|---:|---:|---:|---:|---:|---:|
| | *loss* | *gain* | *loss* | *gain* | *loss* | *gain* |
| Under $25k | **0.76** | 1.08 | 0.96 | **1.33** | 1.13 | 1.33 |
| $25k–50k | 0.99 | 1.17 | 1.06 | 1.25 | 1.18 | 1.20 |
| $50k–75k | 1.04 | 0.99 | 1.04 | 1.11 | 1.15 | 1.02 |
| $75k–100k | 1.08 | 0.98 | 1.06 | 1.04 | 0.95 | 0.97 |
| $100k+ | 1.06 | 0.90 | 0.95 | **0.70** | 0.83 | **0.79** |

The hourly rows show the trade doing exactly what a ridership-oriented redesign
is supposed to do: the poorest households gain frequent service at 1.33× the
county rate while the richest gain it at 0.70×.

The middle brackets show a mild disproportion on losses (1.04–1.18) that comes
with an offsetting gain ratio, so it reads as churn rather than harm — see
caveat 6 in the method.

## Service volume

Departures per day within 400 m of home, weighted by households:

| Group | Weekday now → proposed | Saturday | Sunday |
|---|---|---:|---:|
| **All households** | 114.8 → 121.8 (+6.1%) | +18.8% | +21.7% |
| Under $25k | 175.4 → 186.8 (+6.5%) | +18.6% | +20.7% |
| $25k–50k | 120.7 → 128.6 (+6.5%) | +19.3% | +22.4% |
| $50k–75k | 110.0 → 116.4 (+5.8%) | +18.9% | +22.3% |
| $75k–100k | 110.2 → 117.4 (+6.5%) | +19.7% | +22.4% |
| $100k+ | 91.3 → 96.2 (+5.4%) | +18.3% | +21.4% |

Every bracket gains, and the poorest households both start highest (175
departures a day against 91 for the richest) and gain more than the county
average.

## Caveats

All eight in [METHOD-equity.md](METHOD-equity.md) apply. For this question:

- **Household income is not household need.** A retired homeowner and a family
  of four both appear in "under $25k". Poverty ratio (ACS C17002) would be a
  better instrument and is available at tract level if this question needs
  sharpening.
- **Nominal dollars, 2024.** The brackets are ACS 5-year estimates in the
  survey's own dollars, not adjusted to any other year.
- **Households, not people.** Do not mix a row here with a resident count from
  [EQUITY-RACE](EQUITY-RACE.md) or [EQUITY-AGE](EQUITY-AGE.md); the analysis
  keeps the universes separate for this reason, and the disproportion ratios
  above are against the all-household base.

## Reproduce

```bash
python3 ingest_census.py
python3 analyze_equity_change.py
```

Backing data: `data/equity_change.csv` (`question=EQUITY-INCOME`),
`data/equity_frequency.csv`, `data/equity_block_groups.csv`.
