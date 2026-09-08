# A boardings figure the pipeline flags as wrong still gets counted

119 locations carry boardings the pipeline itself knows belong to a different
stop — PRT reissued the stop code, and the May 2025 usage extract still holds
the old corner, up to 41 km away. `analyze_coverage_change.py` flags every one
of them (`id_name_mismatch`) and drops them from its example tables, but the
figure stays in the CSV cell, and everything downstream adds it up.

Open, not fixed. Found 2026-09-08 while checking whether stop ids are ever
reused for a different stop — they are, though not between the two GTFS feeds.

## The evidence

The two GTFS feeds do **not** reuse ids. Of the 4,981 stop ids present in both,
the median coordinate move is 0 m and the largest is 178 m — a nudge along the
block, never a different place. 1,407 current ids are absent from the proposed
feed and 534 proposed ids are new, which is renumbering, not reuse.

The reuse is between the **usage extract and the GTFS**, which are different
vintages of PRT's own numbering. 5,782 stop codes appear in both; for 119 of
them the two sources put the stop more than 250 m apart, 108 of them more than
5 km apart:

| id | GTFS says | usage extract says | apart | weekday boardings |
|---|---|---|---|---|
| 45 | KINGS SCHOOL ROAD | LIBERTY AVE AT MARKET ST | 15 km | 788 |
| 22728 | CHURCH AVE AT DALZELL AVE | SMITHFIELD ST AT FIFTH AVE | 11 km | 627 |
| 22824 | MIFFLIN RD AT MOONEY RD FS | ROSS PARK MALL | 20 km | 84 |
| 22733 | CENTER AVE AT MILLER AVE | FORBES HOSPITAL | 31 km | 40 |

116 of the 119 sit in the 22600–22800 block, so the mechanism is visible: PRT
issued those codes to new stops after May 2025, and the extract's rows under
them describe whatever stood there before.

Reproduce with `analyze_service_loss.usage_by_stop`, comparing each by-id join
against the GTFS coordinate for the same id. The distance test and the repo's
existing name test agree exactly — both find the same 119 — which is worth
knowing, because it means the flag already in the CSV is a complete list and
nothing new has to be computed to act on this.

## Why it matters

The flag is consulted in three places and ignored in the rest.

Consulted: the tier report's example lists, the route-replace table
(`docs/answers/STOP-ROUTE-REPLACE.md`), and `query.nearest_place_label`, which
skips a flagged row rather than name a place from a label belonging to another
municipality.

Ignored: `build_webdb.py` copies `weekday_boardings` into `stop_place`
unconditionally, so the map's Riders switch (`query.point_boardings`), the
answer panel's per-radius total (`query.stop_boardings`) and
`analyze_removed_ridership.py`'s ranking all sum a number the repo has already
marked as describing somewhere else. In total 1,333 of the 73,408 weekday
boardings in `coverage_change.csv` — 1.8% — rest on a flagged row.

It bites hardest on the ranked removals, which `/findings` publishes in full.
15 of the 293 weekday clusters at 400 m contain a flagged id, carrying 72 of
the 580 boardings the page attributes to locations losing all service — 12%.
Five of those clusters are in the published top fifteen:

| rank | cluster | weekday boardings | flagged ids |
|---|---|---|---|
| 3 | PRESIDENTIAL DR AT BABCOCK BLVD FS | 19.6 | 22629 |
| 4 | BANK ST + WALNUT | 17.3 | 22618 |
| 6 | HOMEVILLE RD OPP DUQUESNE VILLAGE ENTRANCE #1 | 15.0 | 22613–22617, 22775 |
| 14 | MT TROY + CRONEMEYER AVE FS | 9.6 | 22620 |
| 15 | PERRY HWY OPP WASHINGTON BLVD | 9.5 | 22839 |

Rank 3 rests entirely on one flagged id. The convention that ranking exists to
serve is that the removals have **no head** — the flatness is the finding — so
a wrong figure here does not move a headline much, but it does put named
corners in a ranked public table on evidence that belongs to a different
corner, and a reader who checks one will find it does not hold.

The trip counts on these rows are sound. Geometry and service come from the
GTFS; only the boardings, the name and the place labels ride in on the reused
code.

## What is not yet decided

Whether a flagged row's boardings should be **blank** — the `unknown, never
zero` treatment `boardings_source` already gives a renumbering with no
unambiguous match — or whether the retired-code matcher
(`FORMER_ID_MAX_M`) should be run in reverse to recover the right figure where
the true stop can be identified. Blanking is the conservative move and matches
convention 15's rule that "nobody counted here" is not "nobody boards here";
it would remove ~1,333 weekday boardings from the map's Riders totals and drop
rank 3 out of the removals list rather than restating it.

Either way the flag has to reach `stop_place`, since three separate consumers
read the boardings out of that table and none of them can see the flag today.
