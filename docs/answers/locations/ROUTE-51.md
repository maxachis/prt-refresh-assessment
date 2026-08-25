# ROUTE-51

> What is happening to the route 51 corridor?

**Not a BASE_CAMP question ID.** It is a place question, and it feeds
`COVERAGE-CHANGE`, `LOSE-FREQUENCY-HALF`, `STOP-LOST-SERVICE`,
`LOSE-SERVICE-DAYS` and `GAIN-ONE-SEAT-OAKLAND` rather than standing alone.

## What "the 51 corridor" was taken to mean

Two different things in Pittsburgh carry the number 51, and **the plan does
opposite things to them**. Answering the question without saying which one is
meant is the failure mode here, so both are answered.

1. **The 51 bus — Brownsville Rd**, Downtown ↔ South Side ↔ Mount Oliver ↔
   Carrick ↔ Brentwood ↔ West Mifflin. This corridor **gains** service.
2. **PA Route 51 the highway** — Saw Mill Run Blvd, Clairton Blvd and Lebanon
   Church Rd, from Overbrook out through Whitehall, Pleasant Hills, Jefferson
   Hills, Clairton and Elizabeth. This corridor **loses** service, and is one of
   the three corridors that carry the plan's weekend losses.

They touch at exactly one place — Brentwood, where Brownsville Rd crosses Route
51 — and the numbers there are the average of a gain and a loss, which is why
they must be read apart.

Both are cut by **stop name**, not by the `HOOD`/`MUNI` labels, because those
labels contain gross errors (caveat 4).

## Result

| Corridor | Locations | Weekday boardings | Weekday trips | Saturday | Sunday |
|---|---:|---:|---|---|---|
| **Brownsville Rd** (the 51 bus) | 76 | 2,034 | 13,612 → 14,676 (**+7.8%**) | 8,841 → 10,512 (**+18.9%**) | 5,463 → 7,442 (**+36.2%**) |
| **PA Route 51 south** (the flyers) | 97 | 457 | 11,308 → 9,584 (**−15.2%**) | 8,808 → 6,500 (**−26.2%**) | 6,594 → 5,693 (**−13.7%**) |

Trip figures are the sum, over each stop in the cut, of trips within 400 m of
it, measured identically on both networks. They are a **corridor index, not a
trip count** — adjacent stops overlap — so read the percentage, not the total.

---

# Part 1 — Brownsville Rd, the 51 bus

## The route-level number is wrong here, and it is the repo's canonical case

`data/route_frequency_change.csv` reports the 51's group — today's 51 against
the proposed 51 and 51S — at **−10.5% weekday trips**. That figure is correctly
computed and badly misleading, for the reason `analyze_route_hours.py` states in
its own docstring: **a group is not a corridor.** The new route 45 covers the
same street and forms its own group, and nothing adds them together.

What actually happens, counted from `stop_times` on both feeds:

| Service | Today (weekday trips, per direction) | Proposed |
|---|---|---|
| 51 | 105 — **60 short-turning at Brentwood Loop**, 45 running through to Lebanon Rd/Noble Dr in West Mifflin | 53, all full-length to West Mifflin |
| 51S Carrick Short (new number) | — | 41, turning at Brentwood Loop |
| 45 Carrick–Oakland–East Liberty (new) | — | 35 |
| 51L Carrick Limited | 7 | **discontinued** |
| **Total over Carrick** | **112** | **129 (+15.2%)** |

The short-turn pattern **already exists today**; the plan gives it its own
number. So "the 51 loses half its trips" describes a renumbering, not a service
cut. Exhibit A, which must disclose any reduction over 30%, does not list the 51.

Whole-trip and revenue-hour totals, both days and both directions:

| | Weekday trips / hours | Saturday | Sunday |
|---|---|---|---|
| Today: 51 + 51L | 224 / 169.5 h | 134 / 107.4 h | 86 / 73.1 h |
| Proposed: 51 + 51S + 45 | **258 / 221.9 h** | **188 / 161.2 h** | **122 / 111.4 h** |

Revenue hours are in-service time only — first stop to last, summed over trips.
Layover, deadhead and pull-in/pull-out are not in a GTFS, so this is a floor on
platform hours and **not** comparable to PRT's service-hour budget.

## What that means on the street

At **Brownsville Rd + Parkfield St** in Carrick (104.6 weekday boardings), one
direction:

| | Weekday AM peak | Weekday midday | Saturday midday | Sunday midday | Last trip |
|---|---|---|---|---|---|
| Today | ~7 min | ~12 min | ~15 min | ~25–30 min | 12:26 am |
| Proposed | ~4 min | ~3–7 min | ~3–6 min | ~16–17 min | 2:23 am |

Spans lengthen at both ends of the day: the 51's last outbound trip moves from
12:51 am to **2:01 am**, and the 45 runs 5:00 am to 1:01 am. Combined headways
on a three-route overlay are uneven — the 45 and the 51 are scheduled close
together at some hours — so read these as the range they are.

## The real change is the 45

**Route 45 Carrick–Oakland–East Liberty is new**, 70 weekday trips, and it runs
the whole of Brownsville Rd from Brentwood Loop to Walnut St before turning down
S 18th St and E Carson St to Oakland, Shadyside and East Liberty. As far as the
South Side it is today's 51 alignment; at 22nd St it goes east instead of
Downtown.

That gives **Carrick and Brentwood a one-seat ride to Oakland** — 1,605 weekday
boardings between them, the two largest gainers in
[GAIN-ONE-SEAT-OAKLAND](../GAIN-ONE-SEAT-OAKLAND.md), which calls Oakland access
the clearest single benefit in the proposal.

The cost is Downtown-bound frequency: **112 → 94 Downtown trips per direction
(−16%)**, because a quarter of the corridor's buses now go to Oakland instead.
Riders bound Downtown see less; riders bound for Oakland gain a service that did
not exist. Both should be said.

Of the 115 stop names the 51 serves today, **110 are served by the 51, 51S or
45**. The five that are not are S 18th St + Edwards Way, E Carson St + 18th St,
and three at the West Mifflin end (Noble Dr + Lebanon Rd, which is renamed
rather than dropped; Lebanon Church Rd + Ceco Dr; Mountainview Dr + Pool City
Dr).

## What loses on this corridor

**1. The north end — Mount Oliver, Knoxville, Bausman.** The **54** is rerouted
off Brownsville Rd there. At Brownsville Rd + Walnut St FS (121.4 weekday
boardings) the route set goes `44;48;51;51L;54` → `44;45;48;51;51S`, and weekday
trips fall 453 → 410. Mount Oliver is **−10.9%** weekday, Knoxville **−8.0%**.
The 45 replaces some but not all of what the 54 took away.

**2. The 44's southern branch is cut, and this is the corridor's real loss.**
Today the 44 Knoxville splits — 61 weekday trips to Kohne St, 20 out to
Churchview Garden Apartments in North Baldwin via Spencer Ave, Custer Ave and
Churchview Ave. The proposed 44 runs only the Kohne St pattern.

**51 locations lose all service**, carrying **53.7 weekday boardings** — 40 in
Baldwin, 9 in Carrick, 2 in Brentwood. Median walk to the nearest stop the
proposal actually serves is **1,005 m**, and the worst is **1,762 m**. These are
`loses_all_service` in `data/stop_service_change.csv`, checked against proposed
stop positions rather than stop ids, so renumbering is not manufacturing them.

This is why Carrick can gain 4% of its trips and still show 9 locations at zero:
the avenue gains, the hillside streets east of it lose their only bus.

## Places

| Place | Locations | Weekday boardings | Weekday | Saturday | Sunday | Lose all service (400 m / 150 m) |
|---|---:|---:|---|---|---|---|
| Carrick | 41 | 932 | 7,986 → 8,308 (**+4.0%**) | +38.9% | +41.1% | 9 / 12 |
| Brentwood borough | 35 | 673 | 5,656 → 6,192 (**+9.5%**) | +15.1% | +28.7% | 2 / 3 |
| Mount Oliver borough | 9 | 454 | 3,712 → 3,306 (−10.9%) | −8.5% | +2.2% | 0 / 0 |
| Knoxville | 23 | 306 | 6,719 → 6,180 (−8.0%) | −5.5% | +2.0% | 0 / 9 |

Ridership context, WPRDC through Apr 2026: the **51 carries 6,013 weekday
riders**, 4,307 Saturday and 2,857 Sunday — one of the busiest routes in the
system. The discontinued **51L carries 250 weekday riders**, all of whom keep
the corridor at higher frequency, minus the limited-stop running time.

---

# Part 2 — PA Route 51 south, the flyer corridor

## What changes

Three of the four Y-flyers on this corridor end, and the survivor becomes
peak-only.

| Today | Weekday riders | Becomes | Weekday trips |
|---|---:|---|---|
| Y46 Elizabeth Flyer | 882.8 | **46L**, peak-only weekday limited | 50 → **14** (−72%) |
| Y47 Curry Flyer | 549.5 | **discontinued** | 34 → 0 |
| Y45 Baldwin Manor Flyer | 48.5 | **discontinued** | 6 → 0 |
| Y1 Large Flyer | 82.5 | **discontinued** | 6 → 0 |
| Y49 Prospect Flyer | 688.7 | **49**, upgraded | 36 → **50** (+38.9%) |

The 46L is peak-only by construction: seven inbound trips, 5:00–8:00 am, and
seven outbound, 3:00–6:00 pm. **A peak-only weekday limited cannot carry a
weekend**, which is the whole mechanism behind the losses below.

## Result

The 97 stops on Saw Mill Run Blvd, Clairton Blvd, Hwy Rt 51 and Lebanon Church
Rd, by place:

| Place | Locations | Weekday boardings | Weekday | Saturday | Sunday |
|---|---:|---:|---|---|---|
| Brentwood borough | 13 | 145 | 2,081 → 1,914 (−8.0%) | −14.5% | −1.9% |
| Pleasant Hills borough | 17 | 119 | 1,899 → 1,586 (−16.5%) | −39.2% | −25.4% |
| West Mifflin borough | 22 | 56 | 3,006 → 3,085 (**+2.6%**) | −5.2% | +9.0% |
| Baldwin borough | 6 | 55 | 910 → 701 (−23.0%) | −31.3% | −14.0% |
| Elizabeth borough | 1 | 33 | 50 → **14** (−72.0%) | **32 → 0** | **28 → 0** |
| Whitehall borough | 11 | 17 | 1,535 → 1,234 (−19.6%) | −28.7% | −13.9% |
| Jefferson Hills borough | 16 | 13 | 820 → 224 (**−72.7%**) | **512 → 0** | **448 → 0** |
| Overbrook | 3 | 3 | 385 → 306 (−20.5%) | −39.4% | +3.7% |

And the same places measured whole, not just their Route 51 frontage:

| Place | Locations | Weekday boardings | Weekday | Saturday | Sunday | Lose weekends |
|---|---:|---:|---|---|---|---:|
| Whitehall borough | 85 | 220 | −16.1% | **−41.7%** | −8.2% | 23 |
| Jefferson Hills borough | 42 | 49 | −25.3% | **−44.4%** | **−49.1%** | 24 |
| Baldwin borough | 89 | 243 | **−41.7%** | −15.5% | +47.5% | 0 |
| Overbrook | 13 | 75 | −26.9% | −45.3% | −7.6% | 0 |

Whitehall's weekend hourly-or-better coverage falls from **37 locations to 13**;
Overbrook's from **13 to 1**.

## The single worst stop in the plan is on this corridor

**Third Ave at the Rt 51 overpass, Elizabeth** — 50 weekday trips to 14, and all
32 Saturday and 28 Sunday trips to zero, on 32.6 weekday boardings. It is the
busiest weekday halving anywhere in the proposal
([LOSE-FREQUENCY-HALF](../LOSE-FREQUENCY-HALF.md)) and the single largest
weekend loss at one stop ([STOP-LOST-SERVICE](../STOP-LOST-SERVICE.md)).

"Route 51 south" is already named there as one of the three corridors carrying
the plan's weekend losses — **52 locations, 65.4 weekend boardings**, across
Jefferson Hills (24), Whitehall (23), Clairton (4) and Elizabeth (1).

## Stranded segments

Where the flyers ran residential loops off the highway, the loops go to zero:

| Segment | Stops losing all service | Weekday boardings | Walk to nearest proposed stop (median / max) |
|---|---:|---:|---|
| **Y45 Baldwin Manor** — Blossom Dr, Baptist Rd, Gardenville Rd, Windvale | 29 | 10.2 | **1,095 m / 1,688 m** |
| **Y47 Curry** — Provost Rd | 12 | 7.1 | 367 m / 485 m |

Thirteen Whitehall locations lose all service at the 400 m radius, **24 at the
strict 150 m test** — the two numbers are printed because they disagree, per the
repo's radius convention.

## Report the gains too

This corridor is not a uniform loss, and citing only the losses would misstate
it:

- **Keeport Dr and Knoedler Rd, Baldwin** — the Y47's busiest segment, 135.1
  weekday boardings across twelve stops — **gains on weekdays**: 34 → 64 trips,
  as the 46L and the upgraded 49 both serve it. The Y47 is discontinued and its
  best-used street comes out ahead Monday to Friday. Saturday slips 36 → 30.
- **The 49 (today's Y49) gains 38.9% of its weekday trips** and keeps Saturday
  and Sunday, covering Prospect, Parkline Dr and Skyline Dr in Whitehall.
- **West Mifflin's Route 51 frontage gains 2.6%** on weekdays, and its Sunday
  service rises 9%.
- **Clairton comes out flat on weekdays** (2,915 → 2,906 trips over 47
  locations, 280.5 weekday boardings) and gains the 55S alongside the 55. Its
  weekends do not: Saturday −29.7%, Sunday −34.2%, as the Y46 becomes the 46L.

The shape is the repo's headline finding in miniature, twice over: a
ridership-over-coverage redesign. Brownsville Rd — dense, walkable, 2,034
weekday boardings — gets more buses, later, seven days a week, plus a new ride
to Oakland. The Route 51 expressway loops — 457 weekday boardings over a longer
corridor — lose their all-week flyers and keep a peak-only limited.

## Caveats

1. **Proposed-side figures come from the proposed network's own GTFS**
   (`data/raw/proposed_gtfs/`). Its `feed_info.txt` names PRT as publisher and
   is stamped 2026-08-11, and `verify_proposed_gtfs.py` establishes it is the
   published plan rather than a draft. **PRT sent it to PPT on request and PPT
   passed it on** — it is at no URL, so cite it that way rather than as a
   download. See `DATA_SOURCES.md`.
2. **Boardings are PRT's May 2025 unweighted extract**, which PRT describes as
   "unadjusted, unofficial totals" that may understate ridership by up to 30%.
   They are all-purpose boardings, not counts of riders bound anywhere in
   particular. Route ridership is Apr 2026 from WPRDC.
3. **Corridor trip totals are an index, not a count.** Each is the sum over the
   stops in the cut of all trips within 400 m of each stop, so adjacent stops
   overlap and the totals double-count. The percentage change is the figure to
   quote; both sides are measured by identical code, so the comparison holds.
4. **The place labels in these CSVs are PRT's `HOOD`/`MUNI` fields and contain
   gross errors** — up to 40 km, per `analyze_one_seat.py`. Three rows in the
   Route 51 cut are visibly mislabelled: Lebanon Church Rd stops tagged
   "Crawford-Roberts" (the Hill District), and Rt 51 stops tagged "Moon
   township" and "Kennedy township". They are excluded from the place tables
   above. Both corridors were cut by **stop name** for this reason.
5. **The 45's Oakland end uses the consolidated "PRTX" stations** — West
   Oakland, McKee, Central Oakland, Bigelow. Those are exactly the
   consolidations where the 400 m and 150 m radii disagree, so any claim about
   Oakland-end walk distances should print both, as this file does for
   Whitehall and Carrick.
6. **`data/route_frequency_change.csv` is regenerated** by
   `analyze_route_hours.py`, and `LOSE/GAIN-SERVICE-HOURS` are answered from it
   ([LOSE](../LOSE-SERVICE-HOURS.md), [GAIN](../GAIN-SERVICE-HOURS.md)). Its
   limit is different from the retired staleness note and still stands: a group
   is not a corridor, so its −10.5% for the 51 must not be quoted without the 45.
7. **The stranded segments are safe to quote — the microtransit worry is
   resolved.** This item asked whether one of 10 `onDemandZones` polygons in
   `data/raw/remix_project.json` covered the Y45's Baldwin Manor loop or the
   44's Churchview branch, which would have meant the stranded-stop figures
   overstate the outcome. They do not, because the zones are **retracted**: PPT
   reports PRT is not including microtransit in this proposal, and the polygons
   are flagged hidden in PRT's own project file
   ([worklog](../../worklog/the-on-demand-zones-are-retracted.md)).

## Reproduce

```bash
python3 ingest_blr.py                # sources -> data/*.csv
python3 analyze_coverage_change.py   # -> data/coverage_change.csv
python3 analyze_service_loss.py      # -> data/stop_service_change.csv
python3 analyze_route_hours.py       # -> data/route_frequency_change.csv
```

Then:

- **Brownsville Rd corridor** — filter `data/coverage_change.csv` on
  `stop_name` containing `BROWNSVILLE RD`, sort by `lat` descending to read the
  corridor north to south. `cur_*`/`prop_*` trip columns are the before/after.
- **Route 51 south corridor** — the same file, `stop_name` containing any of
  `SAW MILL RUN`, `CLAIRTON BLVD`, `RT 51`, `ROUTE 51`, `LEBANON CHURCH`.
- **Stranded stops and walk distances** — `data/stop_service_change.csv`, where
  `status == loses_all_service`; `metres_to_nearest_proposed_stop` is the walk.
  The 44's branch is the `SPENCER AVE` / `CUSTER AVE` / `AGNEW RD` /
  `CHURCHVIEW` names; the Y45's loop is `BLOSSOM` / `BAPTIST RD` /
  `GARDENVILLE` / `WINDVALE`; the Y47's is `PROVOST`.
- **Which proposed route replaces what, per stop** —
  `data/stop_route_replace.csv`, columns `routes_lost` and `routes_gained`.
- **Route patterns, spans and headways** — both feeds through `gtfs.py`:

  ```python
  import gtfs
  to_axis = lambda m: m + 1440 if m < 240 else m
  cur = gtfs.load_service(gtfs.Feed(gtfs.CURRENT_GTFS).check(),
                          gtfs.SAMPLE["current"], to_axis=to_axis,
                          period_of=lambda m: "all")
  pro = gtfs.load_service(gtfs.Feed(gtfs.PROPOSED_GTFS).check(),
                          gtfs.SAMPLE["proposed"], to_axis=to_axis,
                          period_of=lambda m: "all")
  # cur.times["weekday"][stop_id][(route, direction)] -> departure minutes
  ```

  The pattern table comes from grouping `trips.txt` by `trip_headsign` and
  reading the first and last `stop_times` row of each trip; that is what shows
  today's 51 already running 60 Brentwood Loop short-turns and the proposed 44
  dropping its Churchview branch.
