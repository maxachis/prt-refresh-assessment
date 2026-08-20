# EQUITY-RACE

> How has service access changed depending on race and ethnicity?

**Answered.** The plan's coverage losses fall disproportionately on **white**
Allegheny County residents, and its frequency gains fall disproportionately on
**Black** residents. On every tier, Black residents come out ahead of the county
average; on the weekend-hourly tier they gain **+8.4 points against +3.9 for
white residents**, the largest net gain of any group measured in this repo.

Read it with [METHOD-equity.md](METHOD-equity.md) — in particular that this
describes the places a group lives, not its members.

## Result

Share of Allegheny County residents with each tier within 400 m of home, now →
proposed. Source `data/equity_change.csv`, scope `allegheny`, radius 400.

| Group | Residents | Any bus | Weekend bus | Weekday hourly | Weekend hourly |
|---|---:|---:|---:|---:|---:|
| **All residents** | 1,238,177 | 53.3 → 49.4 (**−3.9**) | 47.3 → 46.5 (**−0.9**) | 39.9 → 41.8 (**+1.9**) | 30.2 → 34.2 (**+4.1**) |
| Black | 152,924 | 81.0 → 79.6 (**−1.4**) | 76.4 → 77.5 (**+1.1**) | 67.9 → 72.2 (**+4.4**) | 52.8 → 61.2 (**+8.4**) |
| White | 934,734 | 47.9 → 43.3 (**−4.6**) | 41.4 → 40.3 (**−1.1**) | 34.2 → 35.7 (**+1.5**) | 25.3 → 28.8 (**+3.5**) |
| Hispanic or Latino | 36,691 | 64.2 → 61.2 (**−2.9**) | 59.5 → 58.1 (**−1.4**) | 53.5 → 54.6 (**+1.1**) | 42.2 → 47.2 (**+5.0**) |
| Asian | 53,578 | 54.1 → 51.8 (**−2.4**) | 50.8 → 49.4 (**−1.4**) | 43.6 → 44.5 (**+0.9**) | 36.2 → 37.4 (**+1.2**) |
| Two or more races | 52,662 | 59.5 → 56.7 (**−2.8**) | 54.7 → 53.6 (**−1.0**) | 46.7 → 49.5 (**+2.8**) | 35.8 → 39.7 (**+3.9**) |
| Other race | 6,773 | 62.8 → 59.8 (**−3.0**) | 53.0 → 55.6 (**+2.6**) | 47.5 → 47.4 (**−0.1**) | 39.7 → 39.6 (**−0.1**) |

Categories are ACS table B03002 and are mutually exclusive: everyone Hispanic
or Latino appears once in that row regardless of race, and every race row is
not-Hispanic. Native American (628 residents) and Pacific Islander (187) are
in the CSV but flagged `too_small_to_quote` — see caveat 5 in the method.

The starting levels are the other half of the story. **81% of Black Allegheny
residents already live within 400 m of a bus, against 48% of white residents**,
so the plan is trimming coverage mostly in places that are whiter than the
county as a whole, and adding frequency mostly in places that are less so.

## Disproportion

Share of each group losing a tier, against every resident's share (400 m,
Allegheny). Ratios above 1 mean losses fall disproportionately on that group.

| Group | Any bus | | Weekend hourly | |
|---|---:|---:|---:|---:|
| | *loss ratio* | *gain ratio* | *loss ratio* | *gain ratio* |
| Black | 0.57 | 1.09 | 1.40 | 1.79 |
| White | 1.11 | 0.98 | 0.93 | 0.89 |
| Hispanic or Latino | 0.76 | 0.81 | 1.01 | 1.14 |
| Asian | 0.66 | 0.80 | 0.78 | 0.50 |

**No disparate impact on race appears in the "any bus" tier — the reverse.**
Black residents lose all bus service at 0.57× the county rate; white residents
at 1.11×.

The weekend-hourly row is the one that needs care and is the reason the gain
ratio is printed beside the loss ratio. Black residents lose that tier at 1.40×
the county rate *and* gain it at 1.79×, netting +8.4 points. That is **churn,
not harm**: the plan is doing more to the neighbourhoods they live in, in both
directions. Quoting the 1.40 alone would describe a large net gain as a loss.

## Service volume

Departures per day within 400 m of home, weighted by population — the companion
to a tier that only asks for one bus:

| Group | Weekday now → proposed | Saturday | Sunday |
|---|---|---:|---:|
| All residents | 114.7 → 121.0 (+5.5%) | +18.2% | +21.7% |
| Black | 168.9 → 177.4 (+5.0%) | +15.1% | +16.1% |
| White | 94.7 → 100.0 (+5.6%) | +19.1% | +23.2% |
| Hispanic or Latino | 192.0 → 202.0 (+5.2%) | +16.8% | +20.8% |
| Asian | 240.5 → 255.1 (+6.1%) | +19.1% | +24.1% |

Every group gains, and the *proportional* gains are slightly larger for white
residents — but from a base 44% lower. A Black resident of Allegheny County
lives within 400 m of 169 bus departures a day; a white resident, 95.

## Caveats

All eight in [METHOD-equity.md](METHOD-equity.md) apply. The two that bite
hardest on this question:

- **Within-block-group uniformity** (caveat 2). If a neighbourhood's Black
  residents live disproportionately at the end of it that keeps its bus, this
  will not see it. Given how sharply segregated parts of Allegheny County are
  at sub-block-group scale, this is a real limit on the race question
  specifically.
- **A high loss ratio is not harm** (caveat 6), as the weekend-hourly row above
  shows in the data rather than in the abstract.

## Reproduce

```bash
python3 ingest_census.py            # needs CENSUS_API_KEY only on a cache miss
python3 analyze_equity_change.py    # section B, C and D of stdout
```

Backing data: `data/equity_change.csv` (`question=EQUITY-RACE`),
`data/equity_frequency.csv`, per-block-group detail in
`data/equity_block_groups.csv`.
