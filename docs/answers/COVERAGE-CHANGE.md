# COVERAGE-CHANGE

> What is the total change in coverage, in terms of area, and by several
> different coverage criteria.

**Answered, by criterion and by area.** The two halves of the question do not
give the same answer, and the difference is the finding:

- **By criterion**, at the 5,751 locations that have a bus today, the plan is
  close to neutral on weekdays and clearly positive on weekends — 593 lose their
  bus entirely, while **weekend hourly-or-better coverage grows at 415 more
  locations than it loses**.
- **By area**, the network's footprint shrinks by **55 km², from 460 to 405 —
  −12.0%** — while the ground within reach of an hourly-or-better bus *grows*,
  by 2.6% on weekdays and **20.8% on weekends**.

That is the ridership-over-coverage trade in one pair of numbers: the same plan
covers an eighth less ground and puts a frequent bus across more of what is
left.

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
| Weekday | 1,175,537 | 1,214,537 | **+3.3%** |
| Saturday | 782,935 | 902,422 | **+15.3%** |
| Sunday | 584,048 | 682,253 | **+16.8%** |

This is the clearest single statement about the plan: **a modest weekday increase
and a large weekend increase, paid for with a footprint 12.0% smaller in area.**
593 locations lose service outright and the places that keep it mostly get more buses,
especially on weekends. Presenting the Refresh as a service cut is not supported
by the data; presenting it as costless is not either.

The weekday figure is the same statistic `FINDINGS.md` §C reports, computed the
same way from the same loader. Both replace the −0.9% that earlier drafts carried,
which was derived from published headways before the proposed GTFS was available
— see [METHOD-coverage.md](METHOD-coverage.md).

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

## Result: the same five tiers as area

BASE_CAMP asks for area as well as criteria, and area answers a question the
location tiers cannot: they are measured *at stops that exist today*, so ground
the plan adds a bus to is invisible to them, and a dense downtown block counts
the same as a mile of Route 51. The covered region of a network is the union of
walk-radius discs around the stops meeting a tier — union, not sum, since
overlapping discs are one place. `analyze_coverage_area.py` measures it on a
100 m lattice.

| Tier | Now km² | Proposed km² | Net | Lost | Gained |
|---|---:|---:|---:|---:|---:|
| WEEK-ANY-MINIMUM | 460.4 | 405.1 | **−55.4 (−12.0%)** | 80.1 | 24.8 |
| WEEKDAYS-ANY-MINIMUM | 460.3 | 405.1 | −55.2 (−12.0%) | 80.1 | 24.9 |
| WEEKENDS-ANY-MINIMUM | 381.4 | 364.1 | −17.4 (−4.6%) | 52.7 | 35.3 |
| WEEK-ANY-HOURLY | 313.3 | 321.4 | **+8.1 (+2.6%)** | 59.6 | 67.7 |
| WEEKEND-ANY-HOURLY | 204.4 | 246.9 | **+42.4 (+20.8%)** | 30.2 | 72.6 |

Lost and gained do not net out to area moving from one place to another: they
are different places, and 80 km² of Allegheny County losing its bus is the
finding, not the −55 that remains after the gains are set against it.

**The footprint shrinks faster than the stop list.** 10.3% of locations lose all
service but 17.4% of covered ground does, because the ground being dropped is
where stops are furthest apart and their discs overlap least — cul-de-sac loops
and hill roads, not corridors. The same asymmetry runs the other way on the
frequency tiers: the plan concentrates service, so the area within reach of an
hourly bus rises even as the area within reach of *any* bus falls.

At 150 m the direction is identical and the loss slightly sharper — 176.3 →
152.4 km², −13.5% for WEEK-ANY-MINIMUM, and +17.2% for WEEKEND-ANY-HOURLY.

The lattice is not doing the work. The same measurement at 200/100/50/25 m gives
459.0 / 460.4 / 460.5 / 460.5 km² today, and −12.0% at every one of them.

## Where the ground is

`data/coverage_area_blocks.csv` breaks the change into contiguous blocks, each
named by the nearest stop that has it. The ten largest losses:

| km² | Place | Nearest stop losing service |
|---:|---|---|
| 12.01 | McCandless, Ross, Hampton | MCINTYRE DR + THOMPSON RUN |
| 7.77 | Plum, Penn Hills, Monroeville | UNITY TRESTLE RD + ASHLAND DR |
| 5.67 | Baldwin, South Park, Whitehall | CURRY RD + HORNING |
| 4.94 | Kennedy, Neville | CORAOPOLIS RD + HWY RT 51 |
| 4.90 | Mount Lebanon, Bethel Park | GALLERIA STOREFRONT |
| 4.65 | Baldwin, Carrick, Brentwood | CHURCHVIEW AVE + VILLAGE DR |
| 4.49 | Reserve, Ross, Spring Garden | MT TROY RD |
| 2.37 | North Versailles | LINCOLN HWY + MCKEE |
| 2.08 | Scott, Bridgeville, Collier | BOWER HILL RD AT BEDNERS FARM |
| 1.94 | West Mifflin, McKeesport | HOMEVILLE RD |

Blocks are contiguous ground, not municipal areas, and most of these straddle a
line — the places are listed commonest-first, as the CSV's `place` and `also`
columns. Another 49 blocks over 0.1 km² account for 27.2 km² between them. Two mechanisms
produce nearly all of it: **routes PRT discontinues outright** — of the 1,045
current stops standing in ground that loses all service, 114 are on the O5
alone, and 228 more on the 20, Y45, 2, P17, 43, Y47 and G31 — and **flyers
becoming peak-only limiteds that stop
running the residential loops they collect from**: P16 → 77L, P10 → 1L,
P13 → 2L, P76 → 76L.

The gains are smaller and more scattered — 24.8 km², of which the largest are:

| km² | Place | Nearest new stop |
|---:|---|---|
| 3.52 | Perry Hwy north of McCandless | Perry Hwy + Bonnie View, past AHN Wexford |
| 3.39 | East Deer | Freeport Rd + Drey St |
| 1.93 | West View | Perry Hwy + Saint John's |
| 1.88 | McKeesport | Riverview Ave + Powers St |
| 1.70 | Penn Hills | Newport Dr + Duff Rd |
| 1.33 | Robinson | Campbells Run Rd + Settlers Ridge |

The Perry Hwy block is the clearest single gain and the clearest illustration of
why area is worth measuring: it is 3.5 km² of ground with no PRT stop at all
today, so no location-based method could ever have found it. It is also the same
corridor as the largest loss: McCandless township's coverage falls by a net
8.8 km² of side streets while the trunk extends north past AHN Wexford.

## The on-demand zones, counted for the first time

`data/raw/remix_project.json` carries 10 `onDemandZones` polygons — proposed
microtransit areas — which nothing in this repo had ever counted. On the same
lattice:

**Of the 80.1 km² that loses fixed-route service entirely, 18.3 km² (23%) falls
inside a proposed on-demand zone. 61.8 km² does not.**

| Zone | Zone km² | Fixed-route now | Proposed | Lost inside | Weekday vans |
|---|---:|---:|---:|---:|---:|
| McCandless | 25.8 | 15.4 | 7.4 | **8.5** | 3 |
| South Hilltop | 14.6 | 11.6 | 6.6 | **5.0** | 3 |
| Penn Hills | 28.8 | 15.1 | 14.5 | 2.2 | 3 |
| Highlands Area | 15.3 | 7.4 | 7.4 | 1.1 | 2 |
| USC-BP | 10.5 | 1.0 | 0.0 | 1.0 | 1 |
| McKees Rocks | 8.4 | 7.6 | 7.2 | 0.4 | 2 |
| Airport, McKeesport, Robinson, South Side | 72.5 | 21.6 | 24.5 | &lt;0.1 | 1–3 |

Every zone runs all week — 7am–9pm weekdays, 8am–8pm weekends — with **1 to 3
vehicles for the whole zone**. Two readings are defensible and both belong in a
comment: McCandless's 8.5 km² is not being abandoned, and 3 vans across 25.8 km²
is not what a bus route was. What is not defensible is either extreme — calling
the 80 km² a clean loss, or treating a zone as coverage restored.

Full detail in `data/coverage_area_ondemand.csv`. Provenance caveat below.

## Caveats

The denominator is stops **served today with a ridership record**, so this
measures change at today's locations. A brand-new stop in a place with no bus
today cannot appear as a gain — the tiers understate greenfield coverage. Route
additions are in [NEW-ROUTE.md](NEW-ROUTE.md).

Hourly is a maximum-gap test across 6am–6pm in the better direction; peak-only
service fails it. The 1,195 and 1,232 boardings "at risk" on the hourly rows are
mostly at locations that keep frequent peak service and lose midday or evening
continuity, which is a different harm from losing the bus.

119 rows carry a stop id PRT's usage extract and the GTFS disagree about, so their
boardings and place labels belong to a different stop (1,333 weekday boardings in
total). Tier counts are unaffected; the flag is `id_name_mismatch`.

### On the area figures specifically

**A square kilometre is not a square kilometre of people.** The area tiers
weight Hays Woods, the rivers and the airfield exactly like Brookline. A
population-weighted version would need census geography, which this repo does
not carry; until then, read area as extent and the location tiers as who is
standing in it. The two are complements, and quoting only the one that suits an
argument is the failure mode to avoid here.

**Walk radius is straight-line.** 400 m across a hillside, a river or a busway
is not 400 m of walking, so every area figure is an upper bound on real access —
in both networks equally, which is why the *change* survives the objection
better than the levels do.

**The on-demand zones come from the Remix project file, not from a published PRT
document**, and all ten are flagged `isHidden` in it. Vehicle counts and hours
are what that file records; nothing here verifies PRT has committed to them.
They are reported alongside the loss, never subtracted from it.

Shared method and caveats: [METHOD-coverage.md](METHOD-coverage.md).

## Reproduce

```bash
python3 analyze_coverage_change.py   # -> data/coverage_change.csv
python3 analyze_coverage_area.py     # -> data/coverage_area.csv,
                                     #    coverage_area_blocks.csv,
                                     #    coverage_area_places.csv,
                                     #    coverage_area_ondemand.csv
```

`analyze_coverage_area.py` takes an optional lattice size in metres
(`analyze_coverage_area.py 50`); 100 m is the default and the figures above.
