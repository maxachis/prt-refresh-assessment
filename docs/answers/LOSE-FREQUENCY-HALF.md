# LOSE-FREQUENCY-HALF

> What routes are seeing frequency halve or worse?

**282 locations keep a bus and lose at least half their weekday trips**, carrying
822 weekday boardings. On weekends the picture reverses: 123 locations lose half
their Saturday trips while 342 at least double them.

The question asks about routes; the answer has to be given by location. The plan
re-splits corridors, so "route 51 halves" is an artifact of the 51 being divided
into the 51, 51S and 45 — read by corridor nothing changed. Comparing route N to
route N produces confident nonsense here, so the unit is a location with the same
walk radius applied to both networks
([METHOD-coverage.md](METHOD-coverage.md)).

## Result

Locations that keep some service and lose half or more of their trips, against
those that double:

| Day | Halved or worse | Boardings | Doubled or better | Boardings |
|---|---:|---:|---:|---:|
| Weekday | **282** | 822 | 221 | 917 |
| Saturday | **123** | 291 | 342 | 1,404 |
| Sunday | **112** | 198 | 373 | 905 |

Detail in `data/coverage_change.csv` — compare `cur_{day}_trips` against
`prop_{day}_trips`.

## The busiest weekday halvings

| Boardings | Stop | Place | Trips | Routes out → in |
|---:|---|---|---|---|
| 32.6 | THIRD AVE AT RT 51 OVERPASS | Elizabeth | 50 → 14 | Y46 → 46L |
| 30.7 | BOYCE CAMPUS EAST PKG LOT | Monroeville | 102 → 32 | 67, 77 → 89 |
| 27.5 | ARDMORE BLVD + SUMNER | Forest Hills | 123 → 50 | 59, 69, P69, P76 → 69, 69S, 76L |
| 24.1 | ARDMORE BLVD AT AVE B | Forest Hills | 123 → 50 | 59, 69, P69, P76 → 69, 69S, 76L |
| 22.3 | YOST BLVD + ARDMORE | Forest Hills | 123 → 50 | 59, 69, P69, P76 → 69, 69S, 76L |
| 22.2 | OLD FREEPORT TERMINUS + FREEPORT | O'Hara | 178 → 89 | 1, 91 → 1L, 91 |
| 20.9 | WASHINGTON AVE + JAMES ST | Bridgeville | 110 → 54 | 31, 41, G31 → 31 |
| 19.4 | RAILROAD ST + #435 (STATION) | Bridgeville | 110 → 54 | 31, 41, G31 → 31 |

Three corridors account for most of the weekday harm, and each has the same
shape — a stop served by several overlapping routes today, served by one or two
tomorrow:

- **Ardmore Blvd / Yost Blvd, Forest Hills** — four routes (59, 69, P69, P76)
  become two plus a variant. 123 weekday trips to 50, and these locations also
  drop below hourly on both weekdays and weekends.
- **Bridgeville** — the 31, 41 and G31 become the 31 alone: 110 trips to 54 on
  Washington Ave and at the station.
- **Third Ave, Elizabeth** — the Y46 becomes the peak-only 46L: 50 trips to 14,
  and all Saturday and Sunday service ends
  ([LOSE-SERVICE-DAYS.md](LOSE-SERVICE-DAYS.md)).

## Put it beside the gains

System-wide, trips **rise**: +3.7% on weekdays, +15.6% Saturday, +17.1% Sunday
([COVERAGE-CHANGE.md](COVERAGE-CHANGE.md)). On weekends, locations that double
outnumber those that halve by nearly three to one. These 282 weekday locations are
real losses inside a plan that adds service overall, and they are worth raising
in the comment period precisely because they are exceptions — not because they
represent the plan's direction.

## Caveats

**"Trips" counts scheduled bus departures in both directions at the location,
combined across routes.** It is not revenue-hours and not seat-miles; a corridor
losing four 40-foot buses and gaining two articulated ones would read as a cut.
`LOSE-SERVICE-HOURS` remains unanswered for that reason — see
[README.md](README.md).

A halving from 8 trips to 4 and one from 120 to 58 are both in the 282, and they
are not comparable harms. Filter `data/coverage_change.csv` by
`cur_weekday_trips` before quoting the count.

Percentages at low-frequency locations are volatile: one trip either way moves
them across the 50% line.

119 rows carry a stop id PRT's two sources disagree about, so their names and
boardings describe a different stop; they are flagged `id_name_mismatch` in the
CSV and excluded from the table above.

Shared method and caveats: [METHOD-coverage.md](METHOD-coverage.md).

## Reproduce

```bash
python3 analyze_coverage_change.py   # -> data/coverage_change.csv
```

```bash
python3 -c "
import csv
rows = list(csv.DictReader(open('data/coverage_change.csv')))
half = [r for r in rows if int(r['cur_weekday_trips']) > 0
        and 0 < int(r['prop_weekday_trips']) <= 0.5 * int(r['cur_weekday_trips'])]
print(len(half), sum(float(r['weekday_boardings']) for r in half))"
```
