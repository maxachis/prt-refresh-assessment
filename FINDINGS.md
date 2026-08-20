# Service change under the PRT Bus Line Refresh

Five questions, deliberately kept apart, because they have different answers:

- **A.** Which stops lose their bus entirely? — `analyze_service_loss.py`
- **B.** Which riders lose the route they use? — `analyze_route_ridership.py`
- **C.** Where service is kept, how much of it is kept? — `analyze_frequency_change.py`
- **D.** Which services gain and lose hours? — `analyze_route_hours.py`
- **E.** How much ground keeps a bus at all? — `analyze_coverage_area.py`

C is the one that changes the picture. A and B describe about 1–5% of the
system. C describes all of it. E is the one that shows what the extra service in
C and D was paid for with: **the network covers 12% less ground.**

> **Section C has been rebuilt on the proposed GTFS.** `analyze_frequency_change.py`
> now counts both networks from real `stop_times` by identical code (see
> `gtfs.py`). The summed weekday change is **+3.3%**. The estimate it replaces
> was close in aggregate — 5,480 modelled weekday trips against 5,559 real,
> +1.4% — but it misallocated service across the day, and **the previous
> night-service finding does not survive the real timetable and is withdrawn**;
> see "Correction" below. Section A is rebuilt too, and the "unverifiable" tier
> is retired. Section D is new.

---

## C. How much service each location gains or loses

**Weekday bus trips within 400 m of each stop, today vs proposed.**

### Why it is not a route-by-route comparison

The plan re-splits corridors, so comparing route N to route N is meaningless.
Carrick is the clean example. Today one route 51 runs every ~7 minutes at peak.
The proposal publishes the 51 at 20 minutes — but also adds a 51S at 20 minutes
and a new route 45 at 30 minutes over the same corridor, which combine to about
7.5 minutes. Read route-by-route the 51 "loses half its trips"; read by corridor
nothing changes. Exhibit A, which must disclose any >30% service reduction, does
not list the 51.

So the unit is a **location**, and both networks are measured by identical code:
sum, over every (route, direction) stopping within 400 m, of that
route-direction's trips, counted from GTFS `stop_times` on both sides and taken
as the maximum across the stops in the cluster. Measuring both sides over the
same radius makes the result immune to stop renumbering, stop consolidation, and
corridor re-splitting alike.

### Result

5,747 locations, 67,619 weekday boardings. Summed across locations, trips change
by **+3.3%**. This is close to a service-neutral redesign, and the interesting
question is who wins and loses inside that near-zero total.

| Change in weekday trips at the stop | Stops | Boardings | Share |
|---|---:|---:|---:|
| Loses all service | 593 | 488 | 0.7% |
| Loses 50–99% | 279 | 813 | 1.2% |
| Loses 25–50% | 567 | 3,337 | 4.9% |
| Loses 10–25% | 730 | 7,161 | 10.6% |
| About the same (±10%) | 1,468 | 29,222 | 43.2% |
| Gains 10–25% | 769 | 14,050 | 20.8% |
| Gains 25–50% | 671 | 8,808 | 13.0% |
| Gains >50% | 670 | 3,741 | 5.5% |

**39% of boardings sit where service grows by 10% or more; 18% where it shrinks
by 10% or more.** Weighted by boardings the average location gains **+8.6%**;
unweighted the average location is **flat (−0.0%)**. The gains land where riders
already are — this is a textbook ridership-over-coverage redesign, and it is
worth saying so plainly rather than treating every reduction as a loss.

### The real shape of the change: peaks to all-day

| Period | Current | Proposed | Change |
|---|---:|---:|---:|
| Early 4–6a | 45,243 | 34,469 | **−23.8%** |
| AM peak 6–9a | 225,405 | 213,629 | −5.2% |
| Midday 9a–3p | 355,919 | 388,530 | +9.2% |
| PM peak 3–6p | 237,291 | 216,858 | −8.6% |
| Evening 6–8p | 118,065 | 135,693 | **+14.9%** |
| Late 8–11p | 129,111 | 131,209 | +1.6% |
| Owl 11p–4a | 63,544 | 93,131 | **+46.6%** |

(Summed stop-visits across locations; read as ratios, not bus counts.)

This is the finding. **The plan moves service out of the commute peaks and the
pre-dawn hour, and into the midday, evening and overnight.** It is a coherent
strategy — a network useful all day rather than twice a day — and it is a real
trade-off for peak commuters, who see 5–9% fewer buses when they travel.

Very few routes lose a time period outright, and those that do are overwhelmingly
routes being discontinued altogether rather than routes being trimmed:

| Period | Routes running today | Lose it entirely |
|---|---:|---:|
| Early 4–6a | 83 | 17 |
| AM peak | 94 | 17 |
| Midday | 78 | 12 |
| PM peak | 94 | 17 |
| Evening 6–8p | 76 | 8 |
| Late 8–11p | 70 | 8 |
| Owl 11p–4a | 50 | 7 |

Of the seven routes losing owl service, four (15, 2, 43, 53L) are discontinued
outright. The genuine overnight withdrawals from surviving corridors are the
**55**, the **69** and the **Y46** (as the 46L). Only two surviving services lose
8–11pm: the **36** (as the 36L) and the **Y46**, both peak-only Flyers.

### Correction, 2026-08-17: the night-service finding is withdrawn

An earlier version of this document reported that late-evening service falls
**−20.3%** and overnight service **−31.9%**, with "23 routes losing owl service
entirely". Those figures came from modelling the proposal as *span ÷ published
headway*. The real timetable contradicts them: late evening is **+1.6%** and
overnight is **+46.6%**.

Two modelling errors produced it, both now measurable against the feed
(`verify_proposed_gtfs.py` prints all of this):

1. **The published span end is not the end of service.** It is the last
   departure from the route's anchor; the feed's last departure is later on
   **all 240 route-days**, by a median of **96 minutes**. Modelling therefore cut
   the end of every route's day.
2. **Span × headway cannot express a midday gap**, so peak-only routes were run
   all day by the model — ten "L" routes were modelled at 28 weekday trips and
   actually run 14.

Whole-network daily totals were barely affected (+1.4%), which is why the error
survived earlier checks: it misallocated service across the day rather than
inventing or destroying it. **Any citation of the night-service claim should be
withdrawn.**

### Walk distance is doing real work — check the radius

At 150 m instead of 400 m, 896 stops carrying **10,170 boardings (15%)** look
materially worse. Their service is not being cut; it is being **consolidated
onto a stop 150–400 m away**. The change those riders face is a longer walk.

| Stop | 150 m | 400 m |
|---|---:|---:|
| Fifth Ave at Chesterfield Rd (West Oakland) | −96% | +11% |
| Forbes Ave at Atwood St (Central Oakland) | −46% | +12% |
| 7th St at Ft Duquesne Blvd (Downtown) | −52% | −5% |
| Fifth Ave at Atwood Station (West Oakland) | −46% | +12% |
| Smithfield St at Third Ave (Downtown) | −14% | +24% |

Fifth & Chesterfield is the archetype: the proposal keeps the stop but routes
nothing through it, while a 17-route "PRTX" station sits 219 m away. At 150 m
that reads as a 96% service cut; at 400 m as a longer walk. Both statements are
true about different things. **In Pittsburgh 219 m of map distance is not
219 m of walking**, so consolidations near hillsides, busways, and stairways
deserve individual review rather than a flat radius.

### Busiest stops genuinely losing a quarter or more (at 400 m)

| Boardings | Stop | Place | Trips |
|---:|---|---|---|
| 83.8 | North Ave at Sandusky St (AGH) | Central Northside | 719 → 536 (−26%) |
| 79.3 | Fifth Ave at Shady Ave | Shadyside | 398 → 294 (−26%) |
| 76.3 | North Ave at Brighton Rd | Allegheny Center | 450 → 335 (−26%) |
| 75.0 | South Busway at South Hills Jct | Mount Washington | 521 → 379 (−27%) |
| 63.1 | Reedsdale St at Boyce St | Chateau | 181 → 99 (−45%) |
| 45.0 | Waterfront Dr at AMC Theatre | West Homestead | 265 → 136 (−49%) |
| 42.4 | 6th St at Braddock Ave | Braddock | 295 → 172 (−42%) |
| 39.7 | 8th Ave at Dickson St | Homestead | 469 → 237 (−50%) |

### Method validation

The proposed feed is checked against the documents PRT actually published, by
`verify_proposed_gtfs.py`: all 95 bus routes appear in both, the day types each
route runs agree for all 95, and service start times match on 229 of 240
route-days. That agreement is the basis for treating a feed PRT did not publish
as the Proposed Final Network.

An earlier version of this section carried a hand-derived route-level table
comparing GTFS trips to published headways. It is superseded by that script and
by section D, both of which are reproducible.

---

## A. Stops losing all service

Boardings are **May 2025** weekday daily averages — the last month PRT published
at stop level (see the data-currency note below).

The critical control: **a disappearing stop id is not a service loss.** Every
stop whose id is absent from the proposal is tested against the nearest stop the
proposal actually serves; if one sits within 150 m the location keeps service.
Without that control the analysis claimed 1,163 stops and 4,172 boardings lost,
including Fifth Ave at Chesterfield Rd — the same stop that resurfaces in
section C. The proximity test reclassified 344 stops and cut the headline by
more than three quarters.

| | Stops | Weekday boardings |
|---|---:|---:|
| Kept, same stop id | 4,497 | 64,061 |
| Kept, stop within 150 m (renumbered/shifted) | 405 | 5,623 |
| **Lose all service** | **880** | **1,200** (1.7%) |

**The "unverifiable" tier is gone.** It existed because the proposed network was
read from the Remix map, whose base feed is 2023: a stop served today and absent
from Remix might have been built after 2023 rather than dropped. PRT's own feed
settles it, and all 16 stops formerly parked there are genuine losses.

The affected stops are overwhelmingly low-ridership; the worst carries 30
boardings a day. Distance to the nearest remaining stop matters more than the
boardings total:

| Distance | Stops |
|---|---:|
| 150–250 m | 178 |
| 250–400 m | 134 |
| 400–800 m | 224 |
| **over 800 m** | **344** |

Median 636 m, 90th percentile 1,678 m, max 3,338 m. **344 stops end up more than
800 m from any remaining service.** Low ridership at a stop is partly a
*consequence* of thin service, so 936 boardings understates the harm.

Highest-ridership stops losing all service: Highland Dr opp Job Corps Dr
(Lincoln-Lemington-Belmar, 903 m, route 74); Negley Ave at Walnut St
(Shadyside, 276 m); Washington Ave at Chartiers St (Bridgeville, 277 m);
Fairhaven Rd at Kenmawr Plaza (Kennedy twp, 218 m); 4th Ave at 7th St
(New Kensington, 167 m).

Most-affected places: Penn Hills (68 boardings), Mount Washington (59),
Kennedy twp (45), Shadyside (45), Baldwin (42), Lincoln-Lemington-Belmar (39).

---

## B. Riders losing their route

A stop can keep service while a rider still loses the one-seat ride they use.
This now uses **WPRDC route-level ridership for April 2026** — public, official,
and twelve months fresher than the stop-level file. (The earlier stop-derived
figure was ~5,170; PRT warns the stop data may undercount by up to 30%, and the
gap is about that size.)

All **20 discontinued routes** carry **6,154 weekday riders — 4.5% of system
weekday ridership (135,585).**

| Route | Weekday riders | | Route | Weekday riders |
|---|---:|---|---|---:|
| 17 Shadeland | 949 | | G31 Bridgeville Flyer | 189 |
| 53L Homestead Park Ltd | 785 | | P69 Trafford Flyer | 182 |
| 15 Charles | 774 | | P71 Swissvale Flyer | 151 |
| Y47 Curry Flyer | 549 | | 65 Squirrel Hill | 122 |
| 2 Mount Royal | 448 | | P67 Monroeville Flyer | 109 |
| P17 Lincoln Park Flyer | 404 | | Y1 Large Flyer | 82 |
| 20 Kennedy | 333 | | 71 Edgewood Town Center | 68 |
| 43 Bailey | 333 | | Y45 Baldwin Manor Flyer | 48 |
| P7 McKeesport Flyer | 321 | | 18 Manchester | 34 |
| 51L Carrick Limited | 250 | | O5 Thompson Run Flyer | 24 |

These riders are not necessarily stranded — the plan redistributes most
corridors — but they are the population whose trip changes, and they are the
natural audience for comment-period outreach.

---

## D. Service hours by corridor group

`analyze_route_hours.py` answers BASE_CAMP's LOSE/GAIN-SERVICE-HOURS. It groups
current route numbers with the proposed numbers PRT maps them to, so renumbering
does not read as a route vanishing, and compares trips and in-service hours.

| Day | Trips now | Proposed | Change | Hours now | Proposed | Change |
|---|---:|---:|---:|---:|---:|---:|
| Weekday | 5,266 | 5,559 | **+5.6%** | 4,253 | 4,360 | +2.5% |
| Saturday | 3,513 | 4,107 | **+16.9%** | 2,609 | 3,078 | **+18.0%** |
| Sunday | 2,611 | 3,143 | **+20.4%** | 1,969 | 2,278 | **+15.7%** |

**Weekend service grows substantially** — about a sixth more trips and hours on
both Saturday and Sunday. That belongs next to the weekend *losses* that
`analyze_coverage_change.py` finds at specific locations: the system runs more
weekend service overall while particular places lose theirs.

Two cautions on this table:

- **Revenue hours are in-service time only** — first stop to last, summed over
  trips. Layover, deadhead and pull-in/pull-out are not in a GTFS. This is a
  floor on platform hours and is **not** comparable to PRT's service-hour budget.
- **A group is not a corridor.** Where the plan covers a corridor with a route
  PRT records as NEW, the new route forms its own group and the incumbent's
  looks cut. Carrick again: today's 51 groups with the proposed 51 and 51S and
  reads as −10% weekday trips, while the new route 45 — 70 weekday trips over
  much of the same corridor — sits in a separate group. Section C is the
  authority on whether a *place* gains or loses buses; this section is the
  authority on what happened to a *service*.

Only two surviving groups lose half or more of their weekday trips: **Y46 → 46L**
(50 → 14, −72%) and **36 → 36L** (40 → 14, −65%), both peak-only Flyers becoming
limited-stop services. Two groups at least double: **7** (12 → 34) and **11**
(25 → 54).

Hours and trips can move in opposite directions within a group, because the plan
shortens some routes and lengthens others: route 59 averages 129 in-service
minutes per trip today and 67 proposed, over 52 trips then and 66 now. That is a
route split in half, not a service cut. System-wide the average trip length is
near-flat (−2.9% weekday).

---

## E. How much ground keeps a bus

Sections A and C are measured at stops that exist today, which cannot answer
"how much of the county keeps a bus" and cannot see ground the plan adds one to.
`analyze_coverage_area.py` measures the union of 400 m walk radii around every
served stop in each network, on a 100 m lattice, applying the *same* cluster and
maximum-gap tests at every point instead of at every stop.

| Coverage criterion | Now | Proposed | Change |
|---|---:|---:|---:|
| Any bus, any day | 460.4 km² | 405.1 km² | **−55.4 (−12.0%)** |
| Any bus, weekends | 381.4 km² | 364.1 km² | −17.4 (−4.6%) |
| Hourly or better, weekday | 313.3 km² | 321.4 km² | **+8.1 (+2.6%)** |
| Hourly or better, weekend | 204.4 km² | 246.9 km² | **+42.4 (+20.8%)** |

**80.1 km² loses all fixed-route service; 24.8 km² gains it.** Those are
different places, so the −55.4 net is the smaller of the two true statements.
Area falls faster than the stop count does — 17.4% of ground against 10.3% of
locations — because the ground being dropped is where stops are furthest apart:
cul-de-sac loops and hill roads, not corridors.

Read against section D, this is the plan's actual trade. More trips and more
hours, run over an eighth less territory, with the frequent-service footprint
growing as the any-service footprint shrinks. Neither "the Refresh is a cut" nor
"the Refresh adds service" survives this table alone.

The lattice is not doing the work: 200/100/50/25 m give 459.0/460.4/460.5/460.5
km² today and −12.0% at every pitch. At a strict 150 m radius the loss is
−13.5%.

**23% of the lost area (18.3 km²) falls inside one of the 10 proposed on-demand
microtransit zones** — mostly the McCandless zone, 8.5 km². Each zone runs
7am–9pm weekdays and 8am–8pm weekends on 1–3 vehicles for the whole zone, so
they are reported beside the loss and never subtracted from it. They come from
the Remix project file, which flags all ten `isHidden`; nothing here verifies
PRT has committed to them.

Two limits specific to this section. **Area is unweighted land** — Hays Woods,
the rivers and the airfield count like Brookline, and a population-weighted
version needs census geography this repo does not carry, so read area as extent
and section C as who is standing in it. And the **walk radius is straight-line**,
which flatters both networks equally. Blocks, municipal totals and the zone
table are in `data/coverage_area_blocks.csv`, `_places.csv` and `_ondemand.csv`;
the write-up is [docs/answers/COVERAGE-CHANGE.md](docs/answers/COVERAGE-CHANGE.md).


## F. How much street keeps a bus

Sections C and E both measure from a walk radius, so neither can say whether a
particular street keeps its bus. `analyze_corridor_change.py` asks that
directly, and it is the only analysis here whose unit is the pavement itself:
both feeds' route geometry is resampled every 20 m and matched between networks
on position and heading, so a corridor is "served" if **any** bus runs on it,
whatever the route number. Route identity never enters — which is what keeps
this clear of the rule in section C's opening.

| | Street with a bus today | Proposed | Lost | Added |
|---|---:|---:|---:|---:|
| Weekday | 1,156.3 km | 980.8 km | **−258.5 (−22.4%)** | +83.0 (+7.2%) |
| Saturday | 914.4 km | 847.7 km | −175.5 (−19.2%) | +108.8 (+11.9%) |
| Sunday | 907.5 km | 847.9 km | −171.1 (−18.9%) | +111.5 (+12.3%) |

**Nearly a quarter of the streets carrying a weekday bus today will not carry
one under the plan**, against 7.2% of today's mileage added — a net 15.2%
reduction in street carrying a bus.

The weekday/weekend split is the more interesting half. The plan sheds 258 km
of weekday pavement but only 171 km on Sunday, and adds *more* street on the
weekend than on a weekday. What is being withdrawn is disproportionately the
weekday-only apparatus — peak expresses, branch tails, and the loops that run
five days a week — while the seven-day network spreads slightly wider. This is
the same peaks-to-all-day trade section C describes, seen as geography rather
than as trips.

**This is pavement, not access, and the two numbers must travel together.** The
22.4% here sounds larger than section E's 12.0% area loss and measures something
narrower: a street can lose its only bus while a parallel street a minute's walk
away keeps one, in which case the pavement is genuinely gone and nobody's walk
gets longer. Section E is what people can reach; this is what the buses drive
on. Quoting this figure alone would be the error section E's own closing warns
against, one unit further down.

Two limits specific to this section. The two feeds draw the same street a few
metres apart, so matching allows about 35 m of lateral tolerance and a 45°
heading band; without it a real corridor renders as an alternating stripe of
kept and lost. And **kept mileage is measured on the proposed feed's geometry
while lost mileage is measured on the current feed's**, so the "today" column
adds two digitisations of one street network — close, but not an exact
survey length. Runs are in `data/corridor_change.csv`; the layer is on the map
under *Streets* ([docs/WEBAPP.md](docs/WEBAPP.md)).

---

## G. Who is standing there

Sections C, E and F measure stops, ground and pavement. None can say who lives
in the place that changed. `analyze_equity_change.py` measures the same five
tiers a fourth way — at the interior point of all **33,131 populated 2020
census blocks** in the three counties PRT stops in, each weighted by its
residents, with race, age, income, vehicle access, disability and language
attached from ACS 2024 5-year tables.

Coverage is a fraction, not a flag: a block group contributes the share of its
residents living in a block that clears the tier. Method, the three
denominators, and the eight caveats every figure here travels with are in
[docs/answers/METHOD-equity.md](docs/answers/METHOD-equity.md).

On the Allegheny County denominator, at 400 m:

| Tier | Residents now | Proposed | Lose it | Gain it | Net |
|---|---:|---:|---:|---:|---:|
| WEEK-ANY-MINIMUM | 53.3% | 49.4% | 68,989 | 20,095 | **−48,895** |
| WEEKENDS-ANY-MINIMUM | 47.3% | 46.5% | 49,568 | 38,977 | −10,591 |
| WEEK-ANY-HOURLY | 39.9% | 41.8% | 55,964 | 79,400 | **+23,437** |
| WEEKEND-ANY-HOURLY | 30.2% | 34.2% | 36,605 | 86,823 | **+50,218** |

Same trade as everywhere else in this document, now in people: about 49,000
Allegheny residents net lose a bus near home, and about 50,000 net gain an
hourly one on weekends.

**The trade runs progressive.** Losses concentrate on white, higher-income and
older residents; gains on Black, lower-income, car-free and disabled ones:

| Group | Any bus | Weekday hourly | Weekend hourly |
|---|---:|---:|---:|
| All residents | −3.9pp | +1.9pp | +4.1pp |
| Black | −1.4 | +4.4 | **+8.4** |
| White | **−4.6** | +1.5 | +3.5 |
| Households under $25k | −2.5 | **+4.4** | +6.4 |
| Households over $100k | −4.5 | +0.2 | +3.3 |
| Car-free households | −2.2 | +3.9 | +5.8 |
| With a disability | −3.9 | +3.8 | +5.0 |
| **Age 65+** | **−4.9** | +1.8 | +4.4 |

No disparate impact on race appears on any tier — the reverse. Black Allegheny
residents lose all bus service at **0.57×** the county rate and car-free
households at **0.65×**, while white residents lose it at 1.11×.

**The one clear negative is age.** Residents 65 and over lose coverage at 1.14×
the county rate and regain it at 0.89× — the only group in the analysis both
losing more than average and gaining less. Limited-English households are a
milder version of the same shape.

Two things must travel with any of these numbers. First, a **high loss ratio is
not automatically harm**: Black residents lose weekend hourly service at 1.40×
the county rate *and* gain it at 1.79×, netting the largest increase of any
group — the plan is doing more to their neighbourhoods in both directions.
Second, this is an **ecological** measure: it describes the places a group
lives, not its members.

---

## Caveats — read before citing

1. **Stop-level boardings are May 2025** and have not been refreshed since.
   Sections A and C inherit that vintage. Section B does not.
2. **PRT's own disclaimer:** stop ridership figures are "unadjusted, unofficial
   totals" that "may underestimate true system-wide ridership by as much as
   30%". Treat section A and C boardings as relative weights, not counts.
3. **Alightings have not been published since September 2023**, so everything
   here is boardings-only and understates alight-heavy stops.
4. **The proposed GTFS is not published anywhere.** Its own
   `feed_info.txt` names PRT as publisher and is stamped 2026-08-11, six days
   before the Proposed Final Network was published; it exists at no URL and
   cannot be re-fetched. **How it reached this repo is not yet recorded in
   `DATA_SOURCES.md` and must be before publication.** `verify_proposed_gtfs.py`
   checks it against what PRT *did* publish. That is the basis for treating it as
   the final plan; it is not the same as PRT publishing it.
5. **The walk radius is a flat-earth proxy.** 400 m of map distance across a
   Pittsburgh hillside, busway, or river is not 400 m of walking. Both radii are
   reported precisely because the answer moves.
6. **The two feeds describe different years.** The current feed is sampled on
   2026-09-16/19/20, the proposed feed on 2027-09-15/18/19 — each a holiday-free
   week inside its own validity window.
7. **The current feed contains two holiday calendars that look like day types.**
   Service 4 has `monday=1` but runs only on Labor Day; service 1 is the same
   for July 4. Counting either as a day type credits 70 routes with a schedule
   they do not run, so day types are resolved for real dates. The proposed feed
   has no such trap.
8. **Comparisons exclude rail and the inclines** on both sides — they are
   outside the Refresh. The proposed feed does contain them.
   *Three caveats carried here previously — the Remix 2023 base feed, the six
   S-variants with no geometry, and the absence of proposed timetables — are all
   retired by PRT's feed.*
9. **Correction, 2026-08-17.** The weekday frequency PDF repeats its column
   header on each of its four pages at a slightly different offset, and the
   parser measured the columns once on page 1. On page 3 the drift pushed the
   Late and Owl cells into the same column, and the later cell overwrote the
   earlier one, so **16 routes lost their published 8–11pm headway** (74, 75,
   78S, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93). That inflated the
   late-evening cut to −38.7% and produced a "17 routes lose all evening
   service" claim, 11 of whose routes have a published evening headway. Fixed in
   `ingest_blr.py`, which now measures each page's own header and aborts if two
   cells fall in one column. Anything quoted from this file before that date
   should be re-checked against the current numbers; sections A and B were not
   affected.

---

## Reproduce

```bash
python3 ingest_blr.py               # sources -> data/*.csv
python3 verify_proposed_gtfs.py     # proposed feed vs PRT's published tables
python3 analyze_service_loss.py     # -> data/stop_service_change.csv       (A)
python3 analyze_route_ridership.py  # -> data/discontinued_route_*.csv      (B)
python3 analyze_frequency_change.py # -> data/stop_frequency_change.csv     (C)
python3 analyze_route_hours.py      # -> data/route_frequency_change.csv    (D)
python3 analyze_coverage_area.py    # -> data/coverage_area*.csv            (E)
```

`data/stop_frequency_change.csv` has one row per location with current and
proposed trips at both radii, per-period breakdowns, boardings, the
short-turn-variant sensitivity, and the route lists on each side.
