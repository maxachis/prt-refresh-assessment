# Service change under the PRT Bus Line Refresh

Three questions, deliberately kept apart, because they have different answers:

- **A.** Which stops lose their bus entirely? — `analyze_service_loss.py`
- **B.** Which riders lose the route they use? — `analyze_route_ridership.py`
- **C.** Where service is kept, how much of it is kept? — `analyze_frequency_change.py`

C is the one that changes the picture. A and B describe about 1–5% of the
system. C describes all of it.

> **Section C's proposed-side numbers are superseded.** They derive proposed
> service from published headways, because no timetable for the proposed network
> was available when this was written. One now is —
> `data/raw/proposed_gtfs/`, with 698,865 real `stop_times` rows — and counting
> both sides from GTFS puts the summed weekday change at **+3.7%**, not −0.9%,
> with **Saturday +15.6% and Sunday +17.1%**. The estimate was not far off in
> aggregate (within 1.4% system-wide) but it dropped the S-variants entirely and
> doubled the peak-only limiteds. Rebuild `analyze_frequency_change.py` on the
> feed before quoting §C; the day-of-week and coverage-tier answers already are,
> in [`docs/answers/COVERAGE-CHANGE.md`](docs/answers/COVERAGE-CHANGE.md) and
> [`docs/answers/METHOD-coverage.md`](docs/answers/METHOD-coverage.md).

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

So the unit is a **location**, and both sides are measured identically: sum, over
every (route, direction) stopping within 400 m, of that route-direction's trips.
Current trips are counted from GTFS; proposed trips are (minutes of the period
inside the route's span ÷ its published headway). Measuring both sides over the
same radius makes the result immune to stop renumbering, stop consolidation, and
corridor re-splitting alike.

### Result

5,747 locations, 67,619 weekday boardings. Summed across locations, trips change
by **+1.2%** (**+5.0%** once short-turn variants are credited). This is close to
a service-neutral redesign, and the interesting question is who wins and loses
inside that near-zero total.

| Change in weekday trips at the stop | Stops | Boardings | Share |
|---|---:|---:|---:|
| Loses all service | 592 | 478 | 0.7% |
| Loses 50–99% | 197 | 682 | 1.0% |
| Loses 25–50% | 614 | 4,174 | 6.2% |
| Loses 10–25% | 944 | 9,830 | 14.5% |
| About the same (±10%) | 1,364 | 29,871 | 44.2% |
| Gains 10–25% | 665 | 10,513 | 15.5% |
| Gains 25–50% | 745 | 8,338 | 12.3% |
| Gains >50% | 626 | 3,733 | 5.5% |

**33% of boardings sit where service grows by 10% or more; 23% where it shrinks
by 10% or more.** Weighted by boardings the average location gains **+6.7%**;
unweighted it gains **+1.7%**. The gains land where riders already are — this is
a textbook ridership-over-coverage redesign, and it is worth saying so plainly
rather than treating every reduction as a loss.

### The cut lands after 11pm

| Period | Current | Proposed | Change |
|---|---:|---:|---:|
| Early 4–6a | 45,243 | 68,973 | **+52.4%** |
| AM peak 6–9a | 225,405 | 240,582 | +6.7% |
| Midday 9a–3p | 355,919 | 380,319 | +6.9% |
| PM peak 3–6p | 237,291 | 240,344 | +1.3% |
| Evening 6–8p | 118,065 | 112,015 | −5.1% |
| Late 8–11p | 129,111 | 102,912 | **−20.3%** |
| Owl 11p–4a | 63,544 | 43,268 | **−31.9%** |

(Summed stop-visits across locations; read as ratios, not bus counts.)

The two night periods are structurally different, and the difference is the
finding:

- **8–11pm is a headway stretch, not a withdrawal.** 62 routes run today and
  only **two lose it entirely** — 36 and Y46, both peak-only Flyers whose
  proposed span ends at 6pm. What happens to the other 60 is a **flat hourly
  floor**: 17 routes are cut by more than a quarter, and in almost every case
  that is 4.5–6 trips per direction becoming exactly 3 — the 3-hour period at a
  published 60-minute headway. The routes are 4, 8, 13, 38, 39, 40, 48, 54, 61D,
  71D, 74, 75, 79, 81, 86, 91, G2. Evening service gets slower and more uniform;
  it does not disappear.
- **11pm–4am is a withdrawal.** 45 routes run today and **23 lose it entirely**
  — half. The survivors mostly keep or improve what they have (5 are cut >25%).
  Losing all owl service: 6, 14, 21, 26, 27, 31, 39, 40, 41, 44, 55, 56, 59,
  61D, 67, 69, 79, 81, 83, 86, G2, Y46, Y49.

So the plan concentrates *overnight* service onto a smaller trunk network while
flattening the late evening to hourly. That is a real structural change and it is
not what the "14 new routes" framing conveys — but it is a narrower claim than
"routes lose their night service," which is what an earlier version of this
document said on the strength of a parser bug (see caveat 9).

Four more routes — 29, 55, 69 and P78 — keep 8–11pm service **only through
their "S" variants**, table rows named "(weekend service)" that nonetheless
carry weekday spans of exactly 8:00–11:00pm. Those variants have no geometry in
the Remix map, so the stop-level columns above exclude them: at stop level those
four corridors still read as losing their evening service, and the
`_with_variants` column is where they reappear. What these rows actually
represent is worth confirming with PRT during the comment period.

### Walk distance is doing real work — check the radius

At 150 m instead of 400 m, 907 stops carrying **11,271 boardings (17%)** look
materially worse. Their service is not being cut; it is being **consolidated
onto a stop 150–400 m away**. The change those riders face is a longer walk.

| Stop | 150 m | 400 m |
|---|---:|---:|
| Fifth Ave at Chesterfield Rd (West Oakland) | −96% | +6% |
| Forbes Ave at Atwood St (Central Oakland) | −48% | +6% |
| 7th St at Ft Duquesne Blvd (Downtown) | −52% | −9% |
| Centre Ave at Negley Ave (Shadyside) | −18% | +10% |
| Penn Ave at Highland Ave (East Liberty) | +11% | +40% |

Fifth & Chesterfield is the archetype: the proposal keeps the stop but routes
nothing through it, while a 17-route "PRTX" station sits 219 m away. At 150 m
that reads as a 96% service cut; at 400 m as a longer walk. Both statements are
true about different things. **In Pittsburgh 219 m of map distance is not
219 m of walking**, so consolidations near hillsides, busways, and stairways
deserve individual review rather than a flat radius.

### Busiest stops genuinely losing a quarter or more (at 400 m)

| Boardings | Stop | Place | Trips |
|---:|---|---|---|
| 113.3 | Fifth Ave at Negley Ave | Shadyside | 399 → 294 (−26%) |
| 83.8 | North Ave at Sandusky St (AGH) | Central Northside | 719 → 532 (−26%) |
| 79.3 | Fifth Ave at Shady Ave | Shadyside | 398 → 284 (−29%) |
| 76.3 | North Ave at Brighton Rd | Allegheny Center | 450 → 326 (−28%) |
| 75.0 | South Busway at South Hills Jct | Mount Washington | 521 → 374 (−28%) |
| 63.1 | Reedsdale St at Boyce St | Chateau | 181 → 96 (−47%) |
| 54.9 | Perrysville Ave at Burgess St | Perry South | 195 → 146 (−25%) |
| 45.0 | Waterfront Dr at AMC Theatre | West Homestead | 265 → 132 (−50%) |

### Method validation

The obvious worry is that counting real GTFS trips against published headways is
unfair to the proposal, because real schedules add trippers and taper within a
period while a published headway is flat. Tested directly: for each current
route, count its GTFS weekday trips per direction in the period each trip starts
in, and compare that against the headway-derived trips per direction summed over
every proposed route the frequency table lists as its successor.

| Period | Routes | Loses all | Cut >25% | Within ±25% | Better | Median ratio |
|---|---:|---:|---:|---:|---:|---:|
| Early 4–6a | 68 | 4 | 23 | 25 | 16 | 0.78 |
| AM peak | 73 | 0 | 7 | 44 | 22 | 1.09 |
| Midday | 65 | 5 | 6 | 38 | 16 | **1.00** |
| PM peak | 73 | 0 | 6 | 48 | 19 | **1.00** |
| Evening 6–8p | 64 | 4 | 4 | 43 | 13 | **1.00** |
| Late 8–11p | 62 | 2 | 17 | 38 | 5 | 0.86 |
| Owl | 45 | 23 | 5 | 12 | 5 | 0.00 |

A median ratio of exactly 1.00 across the midday, PM peak and evening periods,
with winners and losers either side, is what an unbiased method looks like in the
periods that carry most of the ridership. The two night rows behave differently
from each other in the way section C describes: 8–11pm is a broad stretch toward
hourly (median 0.86, only 2 withdrawals), while the owl median of 0.00 simply
records that more than half of the routes running tonight will not run at all.

Two rows deserve scepticism rather than citation. **Early 4–6a** is volatile
because both sides count very few trips — a route starting at 5:00am today and
5:30am under the proposal swings the ratio hard — so its 0.78 median sits oddly
beside the +52.4% system total, which is dominated by a handful of frequent trunk
routes. And the whole table is a **re-derivation**: no script in this repo
produces it (see `docs/answers/README.md` on the missing route-level rollup), and
these numbers do not reproduce the ones published here previously, so the method
above — not the earlier table — is what these figures mean.

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
| Kept, same stop id | 4,568 | 64,444 |
| Kept, stop within 150 m (renumbered/shifted) | 344 | 5,294 |
| **Lose all service** | **854** | **936** (1.3%) |
| Unverifiable | 16 | 211 |

The affected stops are overwhelmingly low-ridership; the worst carries 30
boardings a day. Distance to the nearest remaining stop matters more than the
boardings total:

| Distance | Stops |
|---|---:|
| 150–250 m | 171 |
| 250–400 m | 133 |
| 400–800 m | 223 |
| **over 800 m** | **343** |

Median 641 m, 90th percentile 1,688 m, max 3,338 m. **343 stops end up more than
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

## Caveats — read before citing

1. **Stop-level boardings are May 2025** and have not been refreshed since.
   Sections A and C inherit that vintage. Section B does not.
2. **PRT's own disclaimer:** stop ridership figures are "unadjusted, unofficial
   totals" that "may underestimate true system-wide ridership by as much as
   30%". Treat section A and C boardings as relative weights, not counts.
3. **Alightings have not been published since September 2023**, so everything
   here is boardings-only and understates alight-heavy stops.
4. **The Remix map is built on a 2023 base feed.** Stop identity carries three
   years of drift; 16 stops served today are absent from it and are flagged
   `unverifiable` rather than counted.
5. **The walk radius is a flat-earth proxy.** 400 m of map distance across a
   Pittsburgh hillside, busway, or river is not 400 m of walking. Both radii are
   reported precisely because the answer moves.
6. **Six routes have published headways but no geometry** (29S, 35S, 51S, 55S,
   69S, 78S — short-turn and school variants). They are excluded from the
   stop-level proposed counts and shown as a `_with_variants` sensitivity, which
   moves the system total from +1.2% to +5.0%. Corridors 29, 35, 51, 55, 69 and
   78 are understated in the main columns.
7. **The Remix map holds exactly one pattern per route-direction.** Real
   networks have short-turns and branches, so proposed service is an upper bound
   on outer segments of any route that will in practice run variants.
8. **No proposed timetables exist**, so headway × span is the best available
   proxy. It cannot capture trippers, school specials, or within-period tapering.
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
python3 analyze_service_loss.py     # -> data/stop_service_change.csv       (A)
python3 analyze_route_ridership.py  # -> data/discontinued_route_*.csv      (B)
python3 analyze_frequency_change.py # -> data/stop_frequency_change.csv     (C)
```

`data/stop_frequency_change.csv` has one row per location with current and
proposed trips at both radii, per-period breakdowns, boardings, the
short-turn-variant sensitivity, and the route lists on each side.
