# EQUITY-AGE

> How has service access changed depending on age?

**Answered, and this is the sharpest negative finding of the six.** Allegheny
County residents **aged 65 and over lose all bus service near home at 1.14× the
county rate** and regain it at 0.89× — the only dimension in this analysis where
a group is both losing more than average and gaining less. Their coverage falls
**4.9 points against 3.9 for the county**.

Children under 18 track the county closely and need no separate warning.

Read it with [METHOD-equity.md](METHOD-equity.md).

## Result

Share of Allegheny County residents with each tier within 400 m of home, now →
proposed. Source `data/equity_change.csv`, scope `allegheny`, radius 400.

| Group | Residents | Any bus | Weekend bus | Weekday hourly | Weekend hourly |
|---|---:|---:|---:|---:|---:|
| **All residents** | 1,238,177 | 53.3 → 49.4 (**−3.9**) | 47.3 → 46.5 (**−0.9**) | 39.9 → 41.8 (**+1.9**) | 30.2 → 34.2 (**+4.1**) |
| Under 18 | 230,228 | 48.8 → 45.0 (**−3.7**) | 42.9 → 42.1 (**−0.8**) | 35.6 → 37.3 (**+1.7**) | 25.8 → 29.5 (**+3.7**) |
| Age 65+ | 249,886 | 49.8 → 44.9 (**−4.9**) | 42.8 → 41.6 (**−1.1**) | 34.7 → 36.5 (**+1.8**) | 24.7 → 29.1 (**+4.4**) |

Age brackets are built from ACS table B01001, summing male and female cells:
under 18 is cells 003–006 and 027–030, 65+ is 020–025 and 044–049.

## Disproportion

| Group | Any bus | | Weekday hourly | | Weekend hourly | |
|---|---:|---:|---:|---:|---:|---:|
| | *loss* | *gain* | *loss* | *gain* | *loss* | *gain* |
| Under 18 | 0.99 | 1.08 | 1.01 | 0.98 | 0.99 | 0.95 |
| Age 65+ | **1.14** | **0.89** | 1.09 | 1.04 | 1.00 | 1.05 |

The 65+ "any bus" pair is the one to quote and the one that survives scrutiny:
unlike the high loss ratios elsewhere in this analysis, it is **not** offset by
a matching gain ratio. Older residents are losing bus service at above the
county rate and getting it back at below the county rate. Everything else on
this dimension sits within noise of 1.00.

Seniors do share fully in the weekend-frequency gain (+4.4 points, the county
+4.1), so the picture is not uniformly bad — it is specifically the *coverage*
half of the trade that lands on them harder than on anyone else.

Why: the coverage being trimmed is in the outer, lower-density parts of the
county, and Allegheny County's population aged 65+ is more suburban than its
population as a whole. This is the same geography that produces the
white-residents finding in [EQUITY-RACE](EQUITY-RACE.md); the two are the same
places seen through different variables, and should not be presented as two
independent findings.

`analyze_equity_places.py` shows that directly. The places where the most
residents aged 65+ lose every bus are Baldwin borough (1,885), Ross township
(1,554), McCandless township (1,430), Kennedy township (966) and Scott
township (946); twenty-five places hold 92% of the 15,882 county-wide. Only
Carrick, Bon Air and Squirrel Hill South appear from inside the city.
Per block group in `data/equity_places.csv`.

## Service volume

Departures per day within 400 m of home, weighted by population:

| Group | Weekday now → proposed | Saturday | Sunday |
|---|---|---:|---:|
| **All residents** | 114.7 → 121.0 (+5.5%) | +18.2% | +21.7% |
| Under 18 | 69.5 → 73.0 (+5.0%) | +16.9% | +20.3% |
| Age 65+ | 80.1 → 83.8 (+4.6%) | +17.9% | +21.1% |

Both age groups start well below the county average — children at 69 departures
a day against 115 — and both gain slightly less than average. Children and
older adults live disproportionately in the parts of the county with the least
service, before and after.

## Caveats

All eight in [METHOD-equity.md](METHOD-equity.md) apply. For this question
specifically:

- **The 2020/2024 vintage gap** (caveat 8) bites hardest on age. Block
  populations are 2020 and age shares are ACS 2020–2024; a neighbourhood that
  has aged or been redeveloped since the 2020 count carries the older mix.
- **Age is not mobility.** A 70-year-old and a 90-year-old have the same row
  here, and a 400 m walk is a very different proposition for each. If the
  question is really about who can reach a bus, [EQUITY-DISABILITY](EQUITY-DISABILITY.md)
  is the closer instrument, and neither is a substitute for asking riders.

## Reproduce

```bash
python3 ingest_census.py
python3 analyze_equity_change.py
```

Backing data: `data/equity_change.csv` (`question=EQUITY-AGE`),
`data/equity_frequency.csv`, `data/equity_block_groups.csv`.
