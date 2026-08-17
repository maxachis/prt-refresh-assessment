# GAIN-ONE-SEAT-DOWNTOWN

> What communities will gain one-seat-ride to Downtown?

**Eight places, carrying about 192 weekday boardings — almost all of it one
corridor.** This is the smallest of the four one-seat findings, because 167
places already have a one-seat ride Downtown and keep it. Downtown access is
the thing the proposal changes least.

## Result

| Place | Weekday boardings | Stops today | Gains via |
|---|---:|---:|---|
| Ambridge borough (Beaver) | 97 | 15 | 14 |
| Leetsdale borough | 60 | 20 | 14 |
| Allegheny West | 23 | 11 | 14 |
| Edgeworth borough | 6 | 13 | 14 |
| Glen Osborne borough | 3 | 11 | 14 |
| Glenfield borough | 2 | 2 | 14 |
| Ridgemont | 1 | 5 | 53 |
| Haysville borough | 0 | 1 | 14 |

Full detail, including every place that keeps its ride, is in
`data/oneseat_change.csv` (filter `anchor == "Downtown"`).

## What is actually happening

Seven of the eight gains are a single change: **route 14 Ohio Valley**
(Modified) is extended into Downtown, giving the Ohio River corridor —
Ambridge, Leetsdale, Edgeworth, Glen Osborne, Glenfield, Haysville — a
transfer-free ride it does not have today. Ambridge is the only one with
meaningful ridership behind it.

The remaining two are marginal: Ridgemont picks up route 53, and Allegheny West
picks up the extended 14.

Set against this, 167 places keep the Downtown one-seat ride they already have,
and 9 lose it (see [LOSE-ONE-SEAT-DOWNTOWN](LOSE-ONE-SEAT-DOWNTOWN.md)).

## Caveats

Boardings size the affected population — they are all-purpose boardings at
these places' stops, not counts of riders travelling Downtown. A gained
one-seat ride says nothing about frequency: no timetables exist for the
proposed network, so route 14 may serve this corridor hourly or better and the
data here cannot tell you which.

Full method and the four data controls that changed this answer:
[METHOD-one-seat.md](METHOD-one-seat.md).

## Reproduce

```bash
python3 analyze_one_seat.py   # -> data/oneseat_change.csv
```
