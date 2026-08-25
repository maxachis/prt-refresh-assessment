# OUTER-CHARTIERS

> What is the status of Outer Chartiers in the redesign?

> **Proposed-side figures below were re-derived from the proposed network's own
> GTFS** (`data/raw/proposed_gtfs/`, see
> [../METHOD-coverage.md](../METHOD-coverage.md)) after this file was written
> against headway estimates. **Every conclusion holds** — both segments still go
> from service to zero (Chartiers Ave hillside 60 → 0 weekday trips, the Extension
> 36 → 0) — but the place-level percentages move, and the gains are larger than
> reported:
>
> | Place | Weekday | Saturday | Sunday | was |
> |---|---|---|---|---|
> | Chartiers City | 422 → 54 (−87%) | 240 → 34 | 220 → 28 | −88% |
> | Windgap | 1,485 → 1,026 (−31%) | 848 → 646 | 754 → 532 | −38% |
> | Sheraden | 5,440 → 4,212 (−23%) | 3,471 → 2,960 | 3,068 → 2,552 | −27% |
> | Esplen | 1,097 → 1,119 (+2%) | 710 → 740 | 556 → 568 | −5% |
> | McKees Rocks borough | 4,291 → 4,535 (**+6%**) | 2,804 → 2,973 | 2,140 → 2,308 | −1% |
> | Stowe township | 3,630 → 3,650 (+1%) | 2,322 → 2,394 | 1,692 → 1,836 | −6% |
> | Kennedy township | 4,272 → 2,886 (−32%) | 2,880 → 1,946 | 1,926 → 1,452 | −38% |
> | Crafton borough | 5,488 → 7,793 (**+42%**) | 3,846 → 6,120 | 3,248 → 4,928 | +25% |
>
> Caveat 5's stop-id collision is now handled in `analyze_coverage_change.py`
> (`id_name_mismatch`), and the route-level table has been re-derived from both
> networks' timetables — which raised three of its four surviving routes, the 22
> from −4.8% to +3.8%.

**Not a BASE_CAMP question ID.** It is a place question, and it feeds
`COVERAGE-CHANGE`, `REGION-LOSS` and `LOSE-ONE-SEAT-DOWNTOWN` rather than
standing alone.

## What "Outer Chartiers" was taken to mean

The phrase is not a label PRT uses. It appears nowhere in `docs/BASE_CAMP.md`,
the Remix network data, PRT's route names, or the `HOOD`/`MUNI` fields — the only
`outer` strings anywhere in the repo are "Ross Park Outer Parking Lot" and an
unrelated sentence in `FINDINGS.md`.

It is read here as **the outer end of the Chartiers Avenue corridor**: Chartiers
Ave and Chartiers Ave Extension west of Sheraden, through Chartiers City,
Windgap, McKees Rocks, Stowe and Kennedy. If a reader means something narrower —
the 26 Chartiers as a route, or Chartiers City as a neighbourhood — the relevant
rows are called out separately below.

## Result

**Two segments of the corridor go from service to zero.** They carry **33
weekday boardings** between them and are the sharpest losses in the West End.
The through-corridor keeps a bus, at about 20% fewer trips.

| Segment | Served today by | Current wkdy / Sat / Sun trips | Proposed | Boardings | Nearest proposed service |
|---|---|---|---|---:|---|
| Chartiers Ave hillside — Middletown Rd, Krupp, Harlow, Oltman | 27 | 60 / 35 / 33 | **0** | 26.4 | 403–558 m, the 26 on Allendale Cir |
| Chartiers Ave Ext — State St, #1536, Howard St | 20 | 36 / 26 / 18 | **0** | 6.5 | 526–690 m, the 27 at Singer or the 22/24 on McKees Rocks Rd |
| Chartiers Ave opp Oetting St | 27 | 125 | 50 | 2.6 | on-corridor |

Trip counts are per location inside a 400 m radius, measured identically on both
networks, so stop renumbering is not manufacturing these. All eleven stranded
stop records are `confidence == confirmed` in `data/stop_service_change.csv` —
none of them are in the 2023-base-feed unverifiable bucket.

At the place level:

| Place | Weekday trips | Saturday | Sunday |
|---|---|---|---|
| Chartiers City | 425 → 50 (**−88%**) | 245 → 32 | 225 → 26 |
| Windgap | 1,508 → 940 (−38%) | 855 → 608 | 761 → 494 |
| Sheraden | 5,550 → 4,072 (−27%) | 3,534 → 2,779 | 3,131 → 2,389 |
| Esplen | 1,103 → 1,048 (−5%) | 714 → 690 | 560 → 529 |
| McKees Rocks borough | 4,314 → 4,254 (−1%) | 2,810 → 2,742 | 2,144 → 2,121 |
| Stowe township | 3,639 → 3,416 (−6%) | 2,322 → 2,232 | 1,695 → 1,710 |
| Kennedy township | 4,318 → 2,696 (−38%) | 2,923 → 1,808 | 1,966 → 1,354 |

Chartiers City goes from six served stops to effectively one. It is one of the
four places in [LOSE-ONE-SEAT-DOWNTOWN](../LOSE-ONE-SEAT-DOWNTOWN.md) that lose
bus service entirely rather than merely their transfer-free ride Downtown.

## What is actually happening

Three moves, which matter separately for comment-period framing.

**1. Route 20 Kennedy is discontinued outright.** 333 weekday riders, 281
Saturday, 110 Sunday (WPRDC, Apr 2026); one of the 20 discontinued routes. Most
of its Chartiers Ave work through McKees Rocks is picked up by the rerouted 27,
so this is not a corridor abandonment. What is dropped is its outer tail on
Chartiers Ave Extension — State St, #1536 and Howard St — where nothing proposed
comes within 400 m. Its other leg, on Coraopolis Rd and Forest Grove Rd in
Kennedy township, strands a further 12 stops carrying 6.7 boardings, and is the
bulk of Kennedy's −38%.

**2. Route 27 Fairywood moves off the Chartiers City hillside onto the McKees
Rocks alignment.** The 27 survives as "Modified" in PRT's crosswalk, which makes
this the easiest change in the corridor to miss: the route is not cut, it is
moved. Today it climbs Chartiers Ave through Chartiers City — Middletown Rd,
Krupp, Harlow, Oltman, Oetting. Under the proposal it takes the 20's path
instead — Crawford, Amelia, Singer, Broadway, Margaret, Island. The hillside
loses every bus it has.

This is the mechanism `LOSE-ONE-SEAT-DOWNTOWN` calls "the successor route
survives but no longer comes here", and it is why Chartiers City reads as a
whole-place loss while McKees Rocks reads as roughly flat.

**3. Route 26 Chartiers leaves Chartiers Ave earlier.** Today it runs the avenue
from the West End out to Furman Way and Fairdale. Under the proposal it turns up
Middletown Rd, Jeffers and Allendale into Windgap and Sheraden, running Downtown
↔ Crafton–Ingram. That reroute, plus the 20's removal, is what drives Sheraden's
−27% and Windgap's −38%.

Route totals, now counted from **both** networks' timetables via
`analyze_route_hours.py` rather than estimated from the frequency PDFs:

| Route | Category | Current wkdy trips | Proposed | Change |
|---|---|---:|---:|---:|
| 20 Kennedy | Discontinued | 36 | 0 | **−100%** |
| 21 Coraopolis | Modified | 60 | 54 | −10.0% |
| 22 McCoy | Modified | 52 | 54 | **+3.8%** |
| 24 West Park | Modified | 62 | 66 | +6.5% |
| 26 Chartiers | Modified | 62 | 54 | −12.9% |
| 27 Fairywood | Modified | 60 | 54 | −10.0% |

**These figures replace PDF-derived ones and they moved the answer.** The
proposed feed puts all four surviving routes at 54 weekday trips where span ÷
headway gave 49.5–51, so the earlier table overstated the corridor's route-level
losses: the 22 flips from −4.8% to **+3.8%**, the 26 from −20.2% to −12.9%, the
27 from −17.5% to −10.0%. Nothing above this table changes — the stranded
segments are location-level findings from `coverage_change.csv` and never
depended on these numbers.

## Report the gains too

The corridor is not a one-way loss, and citing only the losses would misstate it.

- **McKees Rocks borough comes out roughly flat on trips** (−1.4%) and **gains
  weekend hourly-or-better coverage at 14 locations** (30 → 44). Stowe gains at
  11, Westwood at 19, Oakwood at 6, Crafton borough at 5.
- **Crafton borough gains 25% more weekday trips** (5,505 → 6,900).
- Both surviving Chartiers routes get a cleaner published product than today's
  uneven schedule: the 26 and the 27 each run **40-minute weekday headways
  5:30 AM–11:00 PM, hourly Saturday 6 AM–10 PM and hourly Sunday 7 AM–8 PM**.

This is the repo's headline finding in miniature — a ridership-over-coverage
redesign. The avenue keeps a legible all-day bus; the hillside and the far
Extension pay for it.

## Caveats

1. **Boardings are PRT's May 2025 unweighted extract**, described by PRT as
   "unadjusted, unofficial totals" that may understate ridership by up to 30%.
   They are all-purpose boardings, not counts of riders bound anywhere in
   particular. Route ridership is Apr 2026 from WPRDC.
2. **The 33 stranded boardings are a floor on the harm, not a measure of it.**
   These segments have low boardings partly *because* their service is already
   thin — 60 weekday trips on the hillside, 36 on the Extension. The same
   argument `FINDINGS.md` makes about stop closures applies.
3. **Route-level percentages come from `data/route_frequency_change.csv`, which
   `analyze_route_hours.py` now regenerates from both timetables**
   ([LOSE-SERVICE-HOURS.md](../LOSE-SERVICE-HOURS.md)). That retires the caveat
   this entry used to carry — the figures are no longer hand-derived from
   `service_levels.csv`, and the 8–11pm header-drift bug (`FINDINGS.md` caveat 9)
   cannot reach them at all. Read them as **corridor groups**, not routes: the
   six above happen to be one-to-one or discontinued, so route and group coincide
   here, which is not true generally.
4. **Nothing softens the losses above.** A note here checked this corridor
   against 10 proposed on-demand zones and found it outside all of them; the
   check is now moot, because the zones themselves are **retracted** — PPT
   reports PRT is not including microtransit in this proposal, and they exist
   only as hidden polygons in PRT's Remix project file
   ([worklog](../../worklog/the-on-demand-zones-are-retracted.md)).
   The conclusion is unchanged and now holds everywhere, not just here.
5. **One row in the corridor profile is spurious and should be ignored:**
   `CHARTIERS AVE AT ST JOHN ST`, which plots at longitude −79.85, in Turtle
   Creek. This is not the known `HOOD`/`MUNI` labelling error — it is a
   **stop_id collision** between the two feeds. Stop `22774` is a Chartiers Ave
   stop in the usage extract and `NORMAN ST + GRANT AVE` in the GTFS, and
   `analyze_coverage_change.py` joins the usage name onto the GTFS geometry.
   **119 of 5,751 rows are affected, carrying 1,333 weekday boardings**, almost
   all in the 22600–22800 id block. The largest is `22728`, `SMITHFIELD ST AT
   FIFTH AVE` in the usage extract and `CHURCH AVE AT DALZELL AVE` in GTFS,
   carrying 627 boardings. None of the stranded stops in this file are affected —
   every one of them matches by name across both feeds.

## Reproduce

```bash
python3 ingest_blr.py                # sources -> data/*.csv
python3 analyze_coverage_change.py   # -> data/coverage_change.csv
python3 analyze_service_loss.py      # -> data/stop_service_change.csv
```

Then:

- **Corridor profile** — filter `data/coverage_change.csv` on `stop_name`
  containing `CHARTIERS AVE`, sort by `lon`. The `cur_*`/`prop_*` trip columns
  and the `*_any_minimum` tier flags are the before/after.
- **Stranded stops** — the same file, where `cur_week_any_minimum` is true and
  `prop_week_any_minimum` is false, inside lat 40.44–40.49, lon −80.11 to −80.03.
- **Confidence tier and walk distance** — `data/stop_service_change.csv`, columns
  `confidence` and `metres_to_nearest_proposed_stop`.
- **Which proposed route replaces what** — join
  `data/proposed_stop_sequences.csv` to `data/proposed_stops.csv` on `stop_uuid`
  and filter to the bounding box; that is what shows the 27 on Crawford/Amelia
  and the 26 on Middletown/Jeffers/Allendale.
- **Route totals** — `data/route_frequency_change.csv`, with caveat 3 above.
