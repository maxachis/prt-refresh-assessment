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

That is the characteristic trade of this proposal — concentrating service on
fewer, straighter corridors — and it means "gains a one-seat ride to Oakland"
and "loses walk-up access" are true of the same community at the same time.
Citing the gain without the stop count would misrepresent what these
neighbourhoods are being offered. The two numbers belong in the same sentence.

## Caveats

Boardings are all-purpose May 2025 weekday boardings at these places' stops, not
counts of riders travelling to Oakland. No origin-destination data is public, so
how many people actually want this trip is not knowable from open data.

**Frequency is unknown.** No timetables exist for the proposed network. A gained
one-seat ride running every 60 minutes is a materially different offer from one
running every 15, and nothing here distinguishes them — pair with
`service_levels.csv`, which has proposed headways by period.

"Oakland" here is the whole of the four Oakland neighbourhoods, which is broader
than the Fifth/Forbes hospital and university core most riders mean.

Full method and the four data controls that changed this answer:
[METHOD-one-seat.md](METHOD-one-seat.md).

## Reproduce

```bash
python3 analyze_one_seat.py   # -> data/oneseat_change.csv
```
