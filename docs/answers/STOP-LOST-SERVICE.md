# STOP-LOST-SERVICE

> What stops have lost service by one of the given service criteria?

**593 locations lose all bus service at 400 m, 900 at 150 m**, carrying 488 and
1,270 weekday boardings. Beyond those, **152 locations keep their weekday buses
and lose the weekend entirely**, and **490 fall below hourly-or-better on
weekdays** while keeping a bus.

The weekend losses have one mechanism behind almost all of them: **an all-week
flyer becomes a peak-only weekday limited.**

## Result, by criterion

Per-location detail is in `data/coverage_change.csv`; the columns are `cur_*` /
`prop_*` per tier at both radii.

| Criterion | Losing it at 400 m | at 150 m | Boardings at risk |
|---|---:|---:|---:|
| WEEK-ANY-MINIMUM (any bus at all) | 593 | 900 | 488 weekday |
| WEEKDAYS-ANY-MINIMUM | 593 | 900 | 488 weekday |
| WEEKENDS-ANY-MINIMUM | 399 | 637 | 434 weekend |
| WEEK-ANY-HOURLY | 490 | 679 | 1,195 weekday |
| WEEKEND-ANY-HOURLY | 338 | 482 | 1,232 weekend |

Of the 399 losing weekend service, **246 lose all service in any case** and
belong to the first row rather than to a weekend story. The genuinely
weekend-specific losses are **152 locations** (153 for Saturday, 130 for Sunday),
carrying about 167 weekend boardings between them.

## The weekend losses are three corridors

| Corridor | Locations | Weekend boardings | What changes |
|---|---:|---:|---|
| **Mount Royal Blvd** — Shaler (47), Etna (10), Hampton (5) | 62 | 40.4 | the 2 is discontinued and the P13 becomes the peak-only **2L** |
| **Route 51 south** — Jefferson Hills (24), Whitehall (23), Clairton (4), Elizabeth (1) | 52 | 65.4 | the Y45, Y46 and Y47 flyers become the peak-only **46L** |
| **Banksville Rd** — Banksville (9), Beechview (5), Mount Lebanon (4) | 18 | 24.8 | the 36 becomes the peak-only **36L** |
| **Summit Park Dr**, North Fayette | 11 | 22.4 | the 29 keeps weekdays here; the 29S, which runs weekends, does not come |

A peak-only limited is weekday-only by construction, so every stop whose only
service was a flyer loses Saturday and Sunday outright. The single largest
weekend loss at one stop is **Third Ave at the Rt 51 overpass in Elizabeth** —
32 Saturday trips to zero, 39.4 weekend boardings — where the Y46 becomes the
46L.

The North Fayette case is the one to understand before quoting any route-level
answer. At route level "the 29 keeps its weekends" is true, because the 29S runs
68 Saturday trips — but not over Summit Park Dr. **A variant covering a corridor
is not the same as covering every street its parent served.**

Note also that two of these corridors are driven by *discontinued* routes (the 2,
Y45, Y47), which never appear in
[LOSE-SERVICE-DAYS.md](LOSE-SERVICE-DAYS.md)'s route-level answer. Only the
stop-level view catches them.

## The removals that take the most riders

Ranked by the boardings observed at them today (`analyze_removed_ridership.py`
→ `data/removed_ridership.csv`; the same table is on the site at `/findings`).
The unit is a **cluster** of removed locations within 150 m of one another, not
a stop id: PRT splits one corner into two ids and a corridor into a dozen, so a
stop-level ranking lists a single loss twice at half its weight and drops a
corridor below its own halves. The place is the boundary that *contains* the
cluster's busiest stop, because PRT's own labels put five of the twenty-five
largest removals in the wrong municipality — Presidential Dr, the second-largest
loss here, is labelled Duquesne and is in McCandless, 25 km away.

| Weekday boardings | What loses its bus | Place | Stops | Span | Routes today |
|---:|---|---|---:|---:|---|
| 30.5 | HIGHLAND DR + JOB CORPS DR | Lincoln-Lemington-Belmar | 1 | — | 74 |
| 19.6 | PRESIDENTIAL DR | McCandless township | 3 | 139 m | O5 |
| 17.3 | BANK ST | Sewickley borough | 3 | 201 m | 21 |
| 16.3 | CHARTIERS AVE | Chartiers City | 4 | 155 m | 27 |
| 15.0 | HOMEVILLE RD | West Mifflin borough | 14 | 681 m | 52L |
| 11.9 | CHARLES ST | Perry South | 2 | 15 m | 15 |
| 11.1 | KATHLEEN | Mount Washington | 6 | 268 m | 43 |
| 11.0 | OXFORD DR | Bethel Park municipality | 2 | 30 m | 36 |
| 10.5 | 5TH ST | Trafford borough | 2 | 80 m | 69, P69 |
| 10.1 | CHARTIERS AVE | Windgap | 2 | 52 m | 27 |
| 9.9 | CUSTER AVE | Carrick | 10 | 624 m | 44 |
| 9.8 | BLAZIER + GIANT EAGLE | McCandless township | 1 | — | 12, O12 |
| 9.5 | PERRY HWY OPP WASHINGTON BLVD | Ross township | 1 | — | O12 |
| 8.8 | VILLAGE DR + GROVETON DR | Robinson township | 1 | — | 20 |
| 8.7 | VILLAGE DR + LEWIS | Robinson township | 1 | — | 20 |

**The ranking has no head, and that is the finding.** The 593 removed locations
are 286 clusters; these fifteen hold 200 of the 488 weekday boardings at stake
and the largest single one is about thirty a day. **233 of the 593 board nobody
at all.** The losses are broad and thin rather than concentrated — the opposite
shape from the frequency changes, where a few busy corridors move a great deal
([LOSE-FREQUENCY-HALF.md](LOSE-FREQUENCY-HALF.md)).

Three caveats travel with every figure in this table, per convention 15.
Boardings are **one-sided**: they are observed May 2025 counts, so they exist
for service that runs today and never for a network that has not run — this
ranks what is at risk and can never score what the plan adds. They are **not
people**: unlinked and unweighted, so one round trip with a transfer is up to
four of them, and PRT calls its own figures unadjusted, unofficial totals that
may understate ridership by up to 30%. And the measure is **circular** — the
Refresh concentrates service where ridership already is, so scoring it against
today's riders asks whether it did the thing it was built to do. Trafford
borough is in Westmoreland County, outside the boundary file, so it alone in
this table is named by PRT's own label.

## Cross-validation

Two pipelines answer "loses all service" and they agree.
`analyze_service_loss.py` asks which stop ids served today have no proposed stop
within 150 m and finds **880 stops**; this analysis counts real trips in both
GTFS feeds at 150 m and finds **900 locations**, with **876 in common** — a 2.2%
difference in the total. The agreement is no longer between two *sources*: both
now read PRT's proposed feed, and the earlier version of this paragraph, in
which the stop-level side came from the Remix map and carried 16 stops that map
could not settle, describes a method the script retired when the feed arrived.

## Caveats

**A stop id disappearing is not a lost bus** — stops are renumbered, consolidated
and nudged across intersections. Both networks are therefore measured by
proximity, and both radii are reported: the gap between the 400 m and 150 m
columns is stop consolidation, not service loss.

**`stop_service_change.csv`'s `status` column is a 150 m verdict, and its name
does not say so.** It is the file to reach for when a reader wants to check one
pole rather than one location, and it is cited that way in
[GAIN-ONE-SEAT-OAKLAND.md](GAIN-ONE-SEAT-OAKLAND.md) and
[locations/ROUTE-51.md](locations/ROUTE-51.md). Of the 880 rows it flags
`loses_all_service`, **217 — carrying 661 of the 1,200 weekday boardings, 55% —
have a stop the proposal serves within a 400 m walk**, which is the radius every
headline on this site uses. Read that column as "no bus within the strict
same-corner radius", never as the headline answer, and take the 400 m figure
from the table above. Whether the column should carry the walked distance and a
400 m verdict of its own is open —
[worklog](../worklog/consolidation-is-not-counted-apart-from-loss.md).

**119 of the 5,751 rows carry a stop id the two PRT sources disagree about.**
Trips and geometry come from the GTFS; boardings and the `HOOD`/`MUNI` labels come
from the usage extract on the same id, and for those rows they describe a
different physical stop — id 22728 is `SMITHFIELD ST AT FIFTH AVE` in the extract
and `CHURCH AVE AT DALZELL AVE` in the feed. They are flagged as
`id_name_mismatch` and excluded from every example table here. Tier counts are
unaffected (they do not depend on names), but the 1,333 weekday boardings on
those rows should not be attributed to a place.

Boardings at these locations are small partly *because* service there is already
thin. Low boardings are not evidence that nobody is affected — 30 boardings a day
is 30 people whose trip changes.

The 5,751 locations are stops served today **with a ridership record**, so stops
without one are not in the denominator.

**No loss counted here is softened by an on-demand zone.** A caveat published
until 2026-08-25 said some of these losses would be offered microtransit
instead of nothing, citing a 23% area figure that is now **retracted**: the
zones exist only as hidden polygons in PRT's Remix project file, and PPT reports
PRT is not including microtransit in this proposal
([worklog](../worklog/the-on-demand-zones-are-retracted.md)).

Shared method and caveats: [METHOD-coverage.md](METHOD-coverage.md).

## Reproduce

```bash
python3 analyze_coverage_change.py   # -> data/coverage_change.csv
python3 analyze_service_loss.py      # -> data/stop_service_change.csv (the
                                     #    independent Remix-based comparison)
python3 analyze_removed_ridership.py # -> data/removed_ridership.csv (the
                                     #    ranking above; needs
                                     #    ingest_boundaries.py to have run)
```
