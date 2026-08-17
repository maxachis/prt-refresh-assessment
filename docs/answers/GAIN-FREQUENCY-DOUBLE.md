# GAIN-FREQUENCY-DOUBLE

> What routes are doubling frequency or better?

**221 locations at least double their weekday trips, 342 double on Saturday and
373 on Sunday.** The weekend gains are the story: they outnumber weekend halvings
by roughly three to one, and Saturday doubling reaches 1,404 boardings against
291 at halving locations.

As with the losses, this is answered by location rather than by route — the plan
re-splits corridors, so route-to-route deltas are meaningless
([METHOD-coverage.md](METHOD-coverage.md)).

## Result

| Day | Doubled or better | Boardings | Halved or worse | Boardings |
|---|---:|---:|---:|---:|
| Weekday | **221** | 917 | 282 | 822 |
| Saturday | **342** | 1,404 | 123 | 291 |
| Sunday | **373** | 905 | 112 | 198 |

Detail in `data/coverage_change.csv` — compare `cur_{day}_trips` against
`prop_{day}_trips`.

## The busiest weekday doublings

| Boardings | Stop | Place | Weekday trips |
|---:|---|---|---|
| 82.0 | WEST BUSWAY + CARNEGIE STATION | Carnegie | 102 → 300 |
| 60.0 | E CARSON ST + 27TH ST | South Side Flats | 168 → 350 |
| 57.4 | 26TH ST + E CARSON | South Side Flats | 168 → 350 |
| 49.4 | E CARSON ST + 26TH | South Side Flats | 168 → 350 |
| 44.3 | E CARSON ST + S 28TH ST | South Side Flats | 168 → 350 |
| 39.7 | SUMMIT PARK DR + ANDREW (WAL-MART) | North Fayette | 43 → 136 |
| 39.5 | BEDFORD AVE + CHAUNCEY DR | Bedford Dwellings | 56 → 132 |

Two corridors dominate, and both are dense and already well-used:

- **East Carson St, South Side Flats** — 168 weekday trips to 350, at half a
  dozen consecutive stops. This is the largest concentrated frequency gain in the
  plan.
- **West Busway at Carnegie Station** — 102 to 300, nearly tripling.

**Bedford Dwellings** (56 → 132) is worth naming separately: a public-housing
community more than doubling its weekday service. Together with the new **84
Wylie**, which runs 68 Saturday trips against 66 on weekdays, the Hill District
corridors are among the plan's clearest winners.

Note the Walmart stop on Summit Park Dr in North Fayette: 43 weekday trips to 136,
in the same township where eleven locations lose all weekend service
([STOP-LOST-SERVICE.md](STOP-LOST-SERVICE.md)). Gains and losses land a mile
apart, and citing either alone misrepresents the place.

## Where hourly service appears

Doubling is not the only gain that matters. **753 locations gain
hourly-or-better weekend service** against 338 losing it, a net +415, and 462
gain it on weekdays ([COVERAGE-CHANGE.md](COVERAGE-CHANGE.md)). Busiest weekday
arrivals into that tier:

| Boardings | Stop | Place | Weekday trips |
|---:|---|---|---|
| 57.4 | UNIVERSITY BLVD PARK AND RIDE | Moon | 44 → 68 |
| 36.5 | PRIVATE DR + BRINTON TOWERS | Braddock Hills | 42 → 92 |
| 29.9 | KEEPORT DR + TRAVIS DR | Baldwin | 34 → 64 |
| 23.1 | LAKETON RD + DOUGLAS DR | Wilkinsburg | 44 → 68 |
| 22.4 | WEST LIBERTY AVE + ILLINOIS | Dormont | 44 → 92 |
| 20.5 | MONONGAHELA AVE + 6TH ST | Glassport | 35 → 56 |

Crossing into hourly-or-better is often a bigger change in usefulness than
doubling from a low base: it is the difference between planning a day around the
bus and not having to. Note that two of these — Coraopolis's 5th Ave stops, 59
trips down to 54 — clear the tier with *fewer* trips, because the proposal spreads
them evenly instead of bunching them at the peaks. That is the case for reading
frequency as a gap rather than a total.

## Caveats

**"Trips" counts scheduled bus departures in both directions at the location,
combined across routes** — not revenue-hours, not capacity. A corridor gaining
trips while shortening buses would still read as a gain.

A doubling from 6 trips to 12 and one from 168 to 350 are both in the 221 and are
not comparable. Filter by `cur_weekday_trips` before quoting the count.

Boardings are May 2025 averages, so they describe who uses these stops **today**,
under today's service — not who will use the improved service.

119 rows carry a stop id PRT's two sources disagree about, so their names and
boardings describe a different stop; they are flagged `id_name_mismatch` in the
CSV and excluded from the tables above.

Shared method and caveats: [METHOD-coverage.md](METHOD-coverage.md).

## Reproduce

```bash
python3 analyze_coverage_change.py   # -> data/coverage_change.csv
```

```bash
python3 -c "
import csv
rows = list(csv.DictReader(open('data/coverage_change.csv')))
dbl = [r for r in rows if int(r['cur_weekday_trips']) > 0
       and int(r['prop_weekday_trips']) >= 2 * int(r['cur_weekday_trips'])]
print(len(dbl), sum(float(r['weekday_boardings']) for r in dbl))"
```
