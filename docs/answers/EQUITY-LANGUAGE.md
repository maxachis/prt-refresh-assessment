# EQUITY-LANGUAGE

> How has service access changed depending on language?

**Answered, on the smallest population of the six.** Allegheny County's **7,885
limited-English-speaking households** keep more coverage than the county average
but **share less in the gains**: they gain weekend hourly service at **0.91× the
county rate** while losing it at 1.19×, and gain weekend bus coverage at 0.68×.
Net, they end up **+3.0 points** on weekend hourly where the county gains +4.3.

That is a mild negative, on a small universe, and it is the second of only two
groups in this analysis whose gain ratios lag its loss ratios — the other being
[residents aged 65+](EQUITY-AGE.md).

Read it with [METHOD-equity.md](METHOD-equity.md), including caveat 4: ACS
publishes household language no finer than the tract.

## Result

Share of Allegheny County households with each tier within 400 m of home, now →
proposed. Source `data/equity_change.csv`, scope `allegheny`, radius 400.

| Group | Households | Any bus | Weekend bus | Weekday hourly | Weekend hourly |
|---|---:|---:|---:|---:|---:|
| **All households** | 545,802 | 55.6 → 51.6 (**−4.0**) | 49.4 → 48.6 (**−0.8**) | 41.9 → 43.9 (**+2.0**) | 31.6 → 35.9 (**+4.3**) |
| Limited-English households | 7,885 | 68.1 → 64.3 (**−3.8**) | 63.5 → 61.7 (**−1.8**) | 54.9 → 55.9 (**+1.0**) | 41.3 → 44.3 (**+3.0**) |

From ACS table C16002, summing the "limited English speaking household" cell
for each of the four language groups. 1.1% of three-county households — the
smallest universe here, and only just above the 5,000 threshold at which this
analysis stops quoting a group at all.

In absolute terms: **408 limited-English households lose all bus service near
home and 109 gain it.**

## Disproportion

| Group | Any bus | | Weekend bus | | Weekday hourly | | Weekend hourly | |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| | *loss* | *gain* | *loss* | *gain* | *loss* | *gain* | *loss* | *gain* |
| Limited-English households | 0.92 | 0.85 | 1.00 | **0.68** | 0.95 | 0.81 | **1.19** | 0.91 |

The pattern is consistent across tiers: loss ratios near or below 1, gain ratios
below 1. These households are not being singled out for cuts — they are simply
not where the plan is adding service. Every gain ratio below 1.00 says the same
thing about the same neighbourhoods.

They do still hold materially more coverage than the county average after the
plan (64.3% against 51.6% with any bus), because limited-English households in
Allegheny County are concentrated in dense, well-served neighbourhoods.

## Service volume

Departures per day within 400 m of home, weighted by households:

| Group | Weekday now → proposed | Saturday | Sunday |
|---|---|---:|---:|
| **All households** | 114.8 → 121.8 (+6.1%) | +18.8% | +21.7% |
| Limited-English households | 183.9 → 195.2 (+6.1%) | +19.6% | +23.9% |

On raw service volume they do slightly *better* than the county. The coverage
tiers and the trip counts disagree here, and the disagreement is real: their
neighbourhoods are getting more buses on the routes that already run there,
while the tier changes are happening elsewhere.

## Caveats

All eight in [METHOD-equity.md](METHOD-equity.md) apply. For this question:

- **Smallest universe, widest error.** 7,885 households across 1,062 block
  groups, from tract-level estimates apportioned down. Every figure on this page
  is softer than its counterpart in [EQUITY-RACE](EQUITY-RACE.md) or
  [EQUITY-INCOME](EQUITY-INCOME.md). Quote the direction, be careful with the
  decimal.

- **"Limited English speaking household" is ACS's definition** — no member aged
  14+ speaks English "very well". It is not a count of people who would prefer
  service information in another language, which is a larger group and a
  different question.

- **This measures where buses are, not whether they can be used.** For
  limited-English riders the binding constraint is often signage, wayfinding,
  fare media, and whether a route change is explained in their language at all.
  A redesign of this size resets everyone's knowledge of the network, and
  nothing in this repo measures who gets told. That is worth raising in the
  comment period on its own.

## Reproduce

```bash
python3 ingest_census.py
python3 analyze_equity_change.py
```

Backing data: `data/equity_change.csv` (`question=EQUITY-LANGUAGE`),
`data/equity_frequency.csv`, `data/equity_block_groups.csv`.
