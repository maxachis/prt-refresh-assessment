# METHOD — the equity questions

The six `EQUITY-*` questions all ask one thing in six ways: when coverage
changes, **who is standing there?** This file is the method they share. Each
question's own file carries only its numbers and its own caveats.

Reproduce with `python3 ingest_census.py && python3 analyze_equity_change.py`.
Full method and reasoning live in those two scripts' module docstrings; this is
the summary a reader needs before quoting a number.

## The third denominator

The repo already measured the plan two ways, and neither can answer an equity
question:

| Unit | What it counts | Its blind spot |
|---|---|---|
| **Location** (`analyze_coverage_change.py`) | 5,751 stops served today | Cannot see ground the plan adds a bus to; weights a downtown corner like a mile of Route 51 |
| **Area** (`analyze_coverage_area.py`) | Square kilometres | A square kilometre of hillside counts like a square kilometre of Brookline |
| **Population** (this) | Residents | Ecological — it describes the places a group lives, not its members |

All three are complements. **Convention 10 binds here**: the plan is roughly
neutral by location, loses 12% of covered ground, and loses about 7% of covered
residents. Quoting any one alone is a talking point, not a finding.

## How a person gets a coverage tier

**Where people are** comes from the 33,131 populated 2020 census blocks in the
three counties PRT stops in, each at its interior point with its 2020
population. **What they are** comes from ACS 2024 5-year tables at block-group
level — race, age, income and vehicle access — and at tract level for
disability and language, which ACS does not publish any finer.

So coverage is a **fraction, not a flag**: a block group is the share of its
residents living in a block that clears the tier, and each group's population is
multiplied by that share. A block group straddling the edge of a walk radius
contributes the part of itself that is genuinely covered.

The service test is imported from `analyze_coverage_change.py`, not restated —
the same per-route-direction cluster rule, the same 6am–6pm maximum-gap
definition of hourly, the same 400 m headline and 150 m sensitivity, the same
five tiers, both networks through `gtfs.py`. A residential point is treated
exactly as a stop location is.

Losses and gains are counted per block, never as proposed-minus-current: one
block group can gain at one end and lose at the other, and a net would report
neither.

## Which people — the denominator is a choice, so it is printed

Two thirds of the three-county population lives where PRT has never run a bus.
Dividing by all of it makes every change look small and says more about county
lines than about the plan. `data/equity_change.csv` carries three scopes:

- **`allegheny`** — all 1,062 Allegheny block groups, 1.24 M residents. **The
  headline**, and PRT's taxing district.
- **`served`** — every block group with a bus at some block in either network,
  any county: 950,675 residents. The right denominator for "who bears the
  losses".
- **`three_county`** — everything the feeds touch. The number that looks
  smallest.

## Why census blocks, and what they changed

An earlier pass tested one point per block group, at its population-weighted
centre. **31% of Allegheny residents live in a block group whose centre sits
within 150 m of the 400 m threshold** in one network or the other — that share
of the county was being rounded wholly in or wholly out on one point.

The correction did not go the way that looked likely. One point per block group
put 51.9% of Allegheny residents within 400 m of a bus today and the plan at
−3.6 points; across the blocks it is **53.3% and −3.9 points**. Both moved up.
A population-weighted centroid is pulled toward wherever a block group is
densest, which in the outer county is a subdivision set back from the road the
bus runs on — so the coarse unit was missing real coverage at the edges, and
missing the losses along those same edges, which is where a plan that trims
coverage does its trimming. Section A of the script's output prints both.

## Caveats — read before citing any of the six

1. **This is an ecological measure.** It says coverage changed for the places
   where a group's members live. It does not follow an individual.

2. **Within a block group, a group is assumed to be spread like everyone
   else.** If a neighbourhood's Black residents live disproportionately at the
   end that keeps its bus, this will not see it. That is the sharpest remaining
   limit, and no published source fixes it: 2020 block-level demographics carry
   differential-privacy noise that makes a subgroup count unusable.

3. **ACS margins of error are wide at block-group level.** Aggregated to a
   whole race or age group across 1,062 block groups the sampling error is
   small; any single row of `data/equity_block_groups.csv` is an estimate.

4. **Disability and language are tract-level**, shared out to block groups by
   population, so they assume a uniform rate within the tract and are coarser
   than the other four.

5. **Groups under 5,000 people or households are flagged
   `too_small_to_quote`** and dropped from the disproportion table. Allegheny
   has 187 Pacific Islander and 628 Native American residents by ACS's table; a
   single block group moves either by several points, and the ratio it produces
   looks exactly like a finding.

6. **A high loss ratio is not automatically harm.** A group concentrated where
   the network is being restructured shows a high ratio on *both* loss and
   gain, because the plan is doing more to the places it lives. Black residents
   on the weekend-hourly tier are exactly that: they lose it at 1.40× the
   regional rate, gain it at 1.79×, and end up **+8.4 points**, the largest net
   gain of any group. The gain ratio is printed beside the loss ratio for this
   reason.

7. **Coverage is not service quality.** Clearing `WEEK-ANY-MINIMUM` means one
   bus a week. Section D of the output reports population-weighted departures
   per day within 400 m of home, which is the honest companion.

8. **Vintages differ.** Geography and block populations are 2020 decennial;
   demographics are ACS 2024 5-year (collected 2020–2024); the current network
   is the GTFS valid 2026-06-28 and the proposed one the feed PRT supplied to
   PPT. Population has moved since 2020, most of all in the neighbourhoods that
   have been redeveloped.

## Relationship to PRT's own obligation

A service change this size requires PRT to run a Title VI Service Equity
Analysis against a disparate-impact threshold it sets itself. Nothing here is a
legal finding, and the ratios above are a screening statistic. If PRT has
published such an analysis, these numbers are a check on it; if it has not,
that absence is itself worth raising in the comment period.
