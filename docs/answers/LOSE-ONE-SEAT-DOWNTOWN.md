# LOSE-ONE-SEAT-DOWNTOWN

> What communities will lose one-seat-ride to downtown?

**Nine places, carrying about 166 weekday boardings.** The headline number is
small, and on its own it undersells the finding: **four of the nine lose bus
service entirely**, not merely their transfer-free ride Downtown.

## Result

`stops after` is the number of stops in the place any proposed route serves.
Zero means the place is left with no bus service at all.

| Place | Weekday boardings | Stops now | Stops after | Loses via |
|---|---:|---:|---:|---|
| West Homestead borough | 86 | 4 | 4 | 53L |
| Chartiers City | 21 | 6 | **0** | 27 |
| Reserve township | 16 | 46 | **0** | 4, 7 |
| Trafford borough (Westmoreland) | 15 | 7 | **0** | 69, P69 |
| Harrison township | 12 | 37 | 32 | P10 |
| Versailles borough | 10 | 16 | 15 | P76 |
| Brackenridge borough | 4 | 17 | 13 | P10 |
| South Park township | 2 | 14 | **0** | Y45 |
| Trafford borough (Allegheny) | 0 | 1 | **0** | 69, P69 |

Full detail in `data/oneseat_change.csv` (filter `anchor == "Downtown"`).

## What is actually happening

Three distinct mechanisms, which matter separately for comment-period framing:

**1. The place loses all service.** Chartiers City, Reserve township, Trafford,
and South Park township end up with no proposed route serving any stop. Reserve
township is the largest of these — 46 stops served today by routes 4 and 7,
none after. For these communities "loses one-seat ride Downtown" is the least of
it; they belong in the REGION-LOSS answer, and this row should never be cited
without that context.

**2. The route is discontinued outright.** West Homestead loses the 53L
Homestead Park Limited, one of the 20 discontinued routes. It keeps its four
stops and local service; what it loses is the direct ride.

**3. The successor route survives but no longer comes here.** The subtlest case,
and the easiest to miss. The P10 Allegheny Flyer becomes 1L, and the P76 North
Versailles Flyer becomes 76L — **both still run Downtown**, but neither still
serves Harrison township, Brackenridge, or Versailles. Those communities are
handed local routes instead: route 3 in Harrison and Brackenridge, routes 63 and
65 in Versailles, none of which reach Downtown. The Flyer was not cut; it was
moved off them.

Against these nine, 167 places keep their Downtown one-seat ride and 8 gain one
(see [GAIN-ONE-SEAT-DOWNTOWN](GAIN-ONE-SEAT-DOWNTOWN.md)). Downtown access is
the dimension this proposal disturbs least — the Oakland picture is far larger
in both directions.

## Caveats

Boardings are all-purpose May 2025 weekday boardings at these places' stops, not
counts of riders travelling Downtown, and the four places losing all service
have low boardings partly *because* their service is already thin — the same
argument `FINDINGS.md` makes about stop closures. Treat 166 as a floor on the
harm, not a measure of it.

Full method and the four data controls that changed this answer:
[METHOD-one-seat.md](METHOD-one-seat.md).

## Reproduce

```bash
python3 analyze_one_seat.py   # -> data/oneseat_change.csv
```
