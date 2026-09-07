# A renumbered stop falls out of the measured universe

533 of the 6,284 stops a bus actually calls at today — 8.5% of them — appeared
in no stop-level output: not `stop_service_change.csv`, not
`coverage_change.csv`, and so not as a dot in the map's Locations view. They are
stops PRT renumbered between the May 2025 usage extract and the current GTFS,
and the universe was built by joining the two on the id.

Fixed, awaiting close. Found 2026-09-07 while checking a Pittsburghers for
Public Transit report that Friendship and Penn Avenue were "missing bus stops" —
which is exactly what a reader saw on the map, and was a defect in our drawing
rather than anything in the plan.

> The count in the lede was first written as 637 (10%). That figure counted the
> T stations and the inclines, which the usage extract excludes by design and
> which every service figure here drops (convention 13). Measured the way the
> analyses actually measure — `gtfs.load_service`, buses only — it is 533. The
> shape of the mistake is worth more than the correction: the first pass
> reproduced the defect it was diagnosing, by building its own universe with a
> different filter from the code under inspection. Re-derive against the
> repo's own loader, not against a hand-rolled read of the same feed.

## What was happening

`analyze_coverage_change.py` built the measured locations as the usage extract's
`All Routes` bus rows keyed by `stop_code`, then kept only those the current
GTFS also serves:

```python
totals = {r["stop_code"]: r for r in usage if r["route_code"] == "All Routes" ...}
served = {sid for d in DAYS for sid in cur_counts[d]}
...
for code, u in totals.items():
    if code not in served or code not in cur_coords:
        continue
```

Both halves of a renumbering fall through that gate. Friendship Avenue at
Winebiddle is the clean case. The usage extract carries it as stop codes 14850
and 14869; the current GTFS carries it as 21905 and 22075, at coordinates
matching to five decimal places, with 88 scheduled trips each on route 87. The
old codes have ridership but no service, so they failed `code not in served`;
the new ids had service but no ridership row, so they never entered `totals`.
The location was measured by neither.

That was not a stray pair. Of the 533, **415 had a retired usage row within
25 m** — the signature of renumbering in place rather than of new construction.

## Evidence

```bash
python3 - <<'PY'
import gtfs, csv
from analyze_coverage_change import DAYS, period_of, to_axis
cur = gtfs.load_service(gtfs.current(), gtfs.SAMPLE["current"],
                        period_of=period_of, to_axis=to_axis)
served = {s for d in DAYS for s in cur.times[d]} & set(cur.coords)
covered = {r["stop_id"] for r in csv.DictReader(open("data/coverage_change.csv"))}
print(len(served), len(covered), len(served - covered))
PY
```

Before the fix: `6284 5751 533`. `tests/test_stop_universe.py` now pins this at
zero, for both `coverage_change.csv` and `stop_frequency_change.csv`.

In the Friendship Avenue stretch between Negley and Gross — 21 stops in each
feed, all of them served, route 87 running the length of it — the Locations view
drew **five** dots. Penn Avenue through Garfield and Bloomfield was missing
wholesale: Penn at Fairmount, Aiken, Atlantic, Evaline, Winebiddle, Millvale,
Mathilda, Pearl, 45th, and Penn at Negley, all served today by the 88.

## Why it mattered

**The coverage figures at the surviving points were never wrong.** Service
inside a radius is counted from the full GTFS through `gtfs.load_service`, not
from the universe, so a missing point did not make a bus invisible to its
neighbours. What was thin was the set of *measurement points*.

**The removal count was wrong, and that is the finding PPT quotes.** Running the
location test at the 533 unmeasured points: **40 of them lose all service at
400 m, and 74 at 150 m.** They could not appear in `analyze_removed_ridership.py`
or in the ranked removals on `/findings`, because a location outside the
universe cannot be ranked. The published counts understated the removals.

Unaffected: anything whose unit is not a usage-extract stop — the corridor layer
(GTFS shapes), `analyze_place_service.py`, the equity block work, the journey
router. `analyze_one_seat.py` also escapes: it builds its universe from
`gtfs.stop_routes` and reads the extract only for place labels and boardings, so
a renumbered stop was always present there, merely unlabelled.

## The fix, and the one judgement inside it

The universe is now the GTFS: every stop some bus calls at is a measured
location. Boardings attach by id where the id survived, and are **carried across
a renumbering only where the match can only mean one thing** — exactly one
retired code within `FORMER_ID_MAX_M` (25 m), wanted by exactly one current
stop. The extract publishes coordinates to four decimals, about 11 m, so the
radius is tight enough that only the same pole clears it and loose enough to
absorb that rounding. Opposite kerbs of one corner usually both clear it, which
is the ambiguity that disqualifies them. A new `boardings_source` column
(`id` / `former_id` / `none`) makes every published figure traceable to which
rule produced it.

Where nothing unambiguous is available, the location is measured and its
boardings are **unknown, not zero** — convention 15's distinction arriving on the
current side.

> Max chose the carry-across on 2026-09-07, over the alternative of leaving all
> 533 blank. What decided it: blanking them would have held the headline
> "riders at risk at removed locations" at 488 weekday boardings when the
> retired ids put it at 580 once rebuilt, a ~16% understatement of a number PPT
> quotes. The agent's contrary worry — that any proximity join weakens the repo's rule
> of joining boardings on the id — is answered by the uniqueness test and the
> `boardings_source` column rather than dismissed, and a later session should
> feel free to reopen it if the column shows the `former_id` rule reaching
> further than intended.

Two approaches were rejected, both by the agent, both re-openable:

- **Match every renumbering by nearest retired code.** Rejected because 82 of
  the 533 have two retired codes inside 25 m, typically the two kerbs of one
  corner, whose boardings differ; nearest-wins would have been a coin flip
  published as an observation.
- **Fix only the drawing** — draw today's stops from the GTFS while continuing
  to measure at the usage-extract points. Rejected because the panel would then
  offer a dot the change layer has no reading for, and because it would have
  left the 40 missing removals missing.
