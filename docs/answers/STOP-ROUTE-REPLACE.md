# STOP-ROUTE-REPLACE

> What stops are seeing service from one route replaced with comparable service
> from a different route?

**371 locations, carrying 3,480 weekday boardings.** Their weekday trip count
barely moves — within 10% — but the route number at the pole changes. For these
riders nothing about the service gets worse; everything they know about how to use
it does.

## Result

Full list in `data/stop_route_replace.csv`. The busiest:

| Boardings | Stop | Place | Out | In | Trips |
|---:|---|---|---|---|---:|
| 141.1 | WALMART + SHELTER | North Versailles | 55, 59 | 66, 68 | −1.0% |
| 90.0 | PARK MANOR BLVD + IKEA | Robinson | 28X | 25 | −8.3% |
| 86.2 | BUTLER ST + 52ND ST | Upper Lawrenceville | 87, 93 | 81, 92 | −3.7% |
| 84.1 | PARK MANOR DR + ROBINSON PLAZA | Robinson | 28X | 25 | +7.7% |
| 73.8 | BROWNSVILLE RD + WYNOKA ST | Carrick | 51L, 54 | 45 | −8.5% |
| 68.9 | BROWNSVILLE RD + MCKINLEY ST | Mount Oliver | 51L, 54 | 45 | −9.5% |
| 67.3 | PERRYSVILLE AVE + PERRY ACADEMY | Perry North | 15 | 6 | −1.8% |
| 66.0 | CHARTIERS AVE + MCKEES ROCKS PLAZA | McKees Rocks | 20 | 27 | +9.8% |
| 60.5 | BRIGHTON RD + WOODS RUN | Brighton Heights | 17 | 14 | −6.2% |
| 55.5 | E CARSON ST + 14TH ST | South Side Flats | 54 | 45, 57 | +3.8% |

The clusters worth naming:

- **Robinson** — the 28X gives way to the new 25 at IKEA and Robinson Town Centre,
  three locations and 241 boardings between them, service within 8%.
- **Brighton Rd, Brighton Heights and Marshall-Shadeland** — the 17 becomes the
  14 across three stops, 177 boardings.
- **Butler St, Upper Lawrenceville** — 87 and 93 become 81 and 92.
- **Brownsville Rd, Carrick and Mount Oliver** — the 51L and 54 become the new 45.
- **The Walmart stop in North Versailles** — 55 and 59 become 66 and 68 at
  almost exactly the same trip count, the single busiest substitution in the plan.

## Renumbering is not replacement

The filters that make this answer meaningful cut the raw candidate set by 59%:

| Test | Locations | Boardings |
|---|---:|---:|
| Route sets differ, trips within 10% | 901 | 24,997 |
| …after translating current numbers to their final numbers | 749 | 22,244 |
| …and only where at most 4 routes serve the stop today | **371** | **3,480** |

The first row is dominated by Downtown, where the 61A–D become the 60X/61X/62X
and the P-flyers become L-limiteds: a stop swapping 38 route numbers for 27 is
not "one route replaced by another", it is the same buses with new labels. The
second row removes the renamings. The third removes the many-route stops where
"replacement" cannot be identified with any particular route.

Short-turn variants are folded into their parent for the same reason — otherwise
the 55S arriving where the 55 left looks like a substitution when it is the same
service ([METHOD-coverage.md](METHOD-coverage.md)).

## Why this matters even though service is unchanged

These 371 locations are where PRT's rider communication has to do the most work.
Nothing measurable gets worse, so they appear in no service-loss finding —
including every other file in `docs/answers/` — but a rider at Perrysville Ave who
has caught the 15 for years will find a 6 at the pole. Getting these stops
signed, and the trip planners updated, is a concrete comment-period ask that costs
PRT nothing in service hours.

## Caveats

**The 10% tolerance and the 4-route cap are judgment calls**, set in
`analyze_coverage_change.py` as `REPLACE_TOLERANCE_PCT` and
`REPLACE_MAX_ROUTES`. Move them and the count moves; the table above shows how
much.

"Comparable service" here means comparable **weekday trip count in both
directions**, not a comparable trip. The new route may go somewhere else entirely
— a stop keeping its frequency while losing its one-seat ride to Oakland appears
here as an unremarkable substitution. Pair with
[LOSE-ONE-SEAT-OAKLAND.md](LOSE-ONE-SEAT-OAKLAND.md) and
[LOSE-ONE-SEAT-DOWNTOWN.md](LOSE-ONE-SEAT-DOWNTOWN.md), which is where that harm
is measured.

Weekend service is not part of the test. A location can hold its weekday trips
under a new number and still lose Saturday
([STOP-LOST-SERVICE.md](STOP-LOST-SERVICE.md)).

Rows flagged `id_name_mismatch` — where PRT's usage extract and the GTFS disagree
about which stop an id refers to — stay in the CSV but are excluded from the table
above, since their names and boardings belong to a different stop.

Shared method and caveats: [METHOD-coverage.md](METHOD-coverage.md).

## Reproduce

```bash
python3 analyze_coverage_change.py   # -> data/stop_route_replace.csv
```
