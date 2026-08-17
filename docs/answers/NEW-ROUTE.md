# NEW-ROUTE

> What new routes are added?

**Fourteen**, and twelve of them run all seven days from the start. Three route
numbers are recycled from routes being discontinued, which makes the list read
oddly against today's map: the new 17, 18 and 25 have nothing to do with the 17
Shadeland, 18 Manchester or the current 25.

## Result

Trips are one weekday, one Saturday and one Sunday, counted from the proposed
GTFS, both directions.

| Route | Weekday | Sat | Sun | Notes |
|---|---:|---:|---:|---|
| **70** Wilkins | 98 | 72 | 60 | the largest new route |
| **45** Carrick – Oakland – East Liberty | 70 | 68 | 46 | the Oakland connection for Carrick and Brentwood |
| **92** Stanton Heights | 70 | 66 | 46 | |
| **5** Aspinwall | 66 | 48 | 32 | |
| **84** Wylie | 66 | 68 | 46 | more Saturday than weekday trips |
| **25** Robinson | 60 | 48 | 32 | number recycled |
| **17** Avalon – McKnight Rd | 38 | 30 | 28 | number recycled from the 17 Shadeland |
| **34** Carnegie – Brentwood | 38 | 30 | 28 | |
| **66** Homestead – McKeesport | 38 | 30 | 28 | |
| **9** McCandless – Oakland | 34 | 30 | 28 | the North Hills Oakland connection |
| **3** Natrona Heights – New Kensington | 32 | 30 | 26 | |
| **63** Renzie Park – Olympia | 32 | 30 | 26 | |
| **89** Penn Hills – CCAC Boyce | 32 | — | — | weekends run by the 89S: 30 Sat, 26 Sun |
| **18** Wexford | 19 | — | — | **weekday only**, number recycled from the 18 Manchester |

Source: `data/route_crosswalk.csv` for the inventory, `data/raw/proposed_gtfs/`
for the trip counts.

## What to read into it

**Only the 18 Wexford is genuinely weekday-only.** The 89 looks weekday-only by
number but its weekend service runs as the 89S (30 Saturday, 26 Sunday trips) —
the same variant pattern that hides weekend service on four existing corridors
([LOSE-SERVICE-DAYS.md](LOSE-SERVICE-DAYS.md)).

Two of these are the plan's headline Oakland connections, and they are the
substance behind [GAIN-ONE-SEAT-OAKLAND.md](GAIN-ONE-SEAT-OAKLAND.md): the **45**
brings Carrick and Brentwood (1,605 weekday boardings between them), the **9**
brings Ross, McCandless and Millvale.

The **84 Wylie** and **45** run more or nearly as many Saturday trips as weekday
trips, which is unusual for this system and worth noting as a deliberate weekend
investment.

## Caveats

A new route number is not new service on the ground. Most of these are
recombinations of existing corridors — the 45 largely follows streets the 51 and
54 use today — so "14 new routes" should never be presented as 14 corridors
gaining a bus. The location-level question of who actually gains service is
[COVERAGE-CHANGE.md](COVERAGE-CHANGE.md) and
[GAIN-FREQUENCY-DOUBLE.md](GAIN-FREQUENCY-DOUBLE.md).

The recycled numbers (17, 18, 25) are a public-communication hazard more than an
analytical one, but they will confuse riders comparing an old timetable to a new
one, and they make naive route-number joins wrong.

Trip counts are for one representative day in each day type from the proposed
feed's 2027 calendar; the feed's provenance is not recorded in this repo
(see [METHOD-coverage.md](METHOD-coverage.md)).

## Reproduce

```bash
python3 ingest_blr.py    # -> data/route_crosswalk.csv (category == "New")
```

Trip counts are `data/raw/proposed_gtfs/trips.txt` grouped by route and service
id:

```bash
python3 -c "
import csv, collections
c = collections.Counter()
for t in csv.DictReader(open('data/raw/proposed_gtfs/trips.txt')):
    c[(t['route_id'], t['service_id'])] += 1
for (r, s), n in sorted(c.items()): print(r, s, n)"
```
