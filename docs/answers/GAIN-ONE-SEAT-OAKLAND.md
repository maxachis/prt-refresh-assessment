# GAIN-ONE-SEAT-OAKLAND

> What communities will gain one-seat-ride to Oakland?

**Twelve places, carrying about 3,556 weekday boardings** — an order of
magnitude larger than the Downtown gains, and the clearest single benefit in
the proposal. Oakland access is where this network redesign does its real work.

## Result

`stops after` is the number of stops in the place any proposed route serves.

| Place | Weekday boardings | Stops now | Stops after | Gains via |
|---|---:|---:|---:|---|
| Carrick | 932 | 42 | 29 | 45 |
| Brentwood borough | 673 | 36 | 33 | 45 |
| Ross township | 459 | 153 | 92 | 9 |
| Brookline | 418 | 71 | 72 | 35 |
| Beechview | 243 | 26 | 27 | 35 |
| McCandless township | 230 | 100 | 26 | 9 |
| Scott township | 219 | 100 | 51 | 35 |
| Mount Lebanon township | 191 | 98 | 68 | 35 |
| Dormont borough | 100 | 19 | 21 | 35 |
| Millvale borough | 84 | 10 | 15 | 9 |
| Swisshelm Park | 6 | 3 | 2 | 58 |
| Ridgemont | 1 | 5 | 6 | 53 |

Full detail in `data/oneseat_change.csv` (filter `anchor == "Oakland"`).

## What is actually happening

Three routes do essentially all of it, and two of them are new:

- **45 Carrick – Oakland – East Liberty** (new) connects Carrick and Brentwood
  — 1,605 weekday boardings between them, the two biggest gainers on this list.
- **9 McCandless – Oakland** (new) brings the North Hills in: Ross, McCandless,
  Millvale.
- **35 Bower Hill – Oakland** (the modified 41) serves the South Hills corridor:
  Brookline, Beechview, Scott, Mount Lebanon, Dormont.

## Read this against the stop counts

Four of these places gain a one-seat ride to Oakland while losing a large share
of their stops. **McCandless goes from 100 served stops to 26**; Ross from 153
to 92; Scott from 100 to 51; Mount Lebanon from 98 to 68. Carrick drops from 42
to 29.

**The mechanism is routing, not stop thinning.** Take McCandless. Today five
routes serve it — O5 (50 stops), 2 (25), 12 (24), P13 (24), O12 (14). Under the
proposal it still has five — 12 (19), 9 (16), 18 (11), 12L (10), 17 (2). What
changed is where they run. The discontinued **O5 Thompson Run Flyer** carried
the residential loops: Remington Dr, Peebles Rd, Sample Rd, Springfield Dr.
Service is not being thinned along a retained alignment; buses stop running down
those streets at all, and are concentrated on the McKnight Rd and Perry Hwy
corridors.

That consequence is real rather than an artifact of stop renumbering. Applying
the 150 m proximity control from `stop_service_change.csv`, 60 of the 85
McCandless stops in that file lose all service, with several ending 1.5–1.8 km
from the nearest remaining stop. They carry about 21 weekday boardings between
them — a large footprint reduction over a very small ridership base, with the
usual caveat that thin ridership partly reflects thin service.

So "gains a one-seat ride to Oakland" and "loses coverage across its residential
streets" are both true of the same community. Citing the gain without the
footprint would misrepresent what these neighbourhoods are being offered; the
two belong in the same sentence.

(The 100 → 26 counts here and the 85 stops in `stop_service_change.csv` use
different denominators — this file counts every GTFS-served stop with an
inherited place label, that one counts only stops carrying a usage record.)

## Caveats

Boardings are all-purpose May 2025 weekday boardings at these places' stops, not
counts of riders travelling to Oakland. No origin-destination data is public, so
how many people actually want this trip is not knowable from open data.

**Frequency is unknown.** No timetables exist for the proposed network. A gained
one-seat ride running every 60 minutes is a materially different offer from one
running every 15, and nothing here distinguishes them — pair with
`service_levels.csv`, which has proposed headways by period.

"Oakland" here is West, Central and South Oakland — the Fifth/Forbes hospital
and university core — and not North Oakland, whose northern edge is a mile away
from it. None of the twelve gains in this table depends on that choice; the
losing side does, and [LOSE-ONE-SEAT-OAKLAND](LOSE-ONE-SEAT-OAKLAND.md) says
where.

Full method and the four data controls that changed this answer:
[METHOD-one-seat.md](METHOD-one-seat.md).

## Reproduce

```bash
python3 analyze_one_seat.py   # -> data/oneseat_change.csv
```
