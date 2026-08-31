# Two scripts now name a place differently

**Observed:** `analyze_equity_places.py` names a block group by the county
boundary that contains it; `analyze_travel_time.py` still names one by the
nearest labelled PRT stop within 2 km. The same block group can therefore
carry two different place names in two published CSVs.
**Where it stands:** open, deliberate, and scoped. The divergence was created
knowingly on 2026-08-31 when the equity lineage moved to boundaries; converting
travel time needs a name reconciliation and a multi-hour re-run, and was filed
rather than rushed.

## What is observed

`ingest_boundaries.py` gave the repo its first place geometry — 130 Allegheny
municipalities and 90 Pittsburgh neighbourhoods — and
`analyze_equity_places.py` now asks which boundary contains a block group's
population-weighted centre. That moved 302 of the county's 1,062 block groups,
34% of its residents, and took the unnamed count from 133 to 0.

`analyze_travel_time.py` did not follow. It still calls its own
`label_for()` — the nearest-stop rule, moved into that file since it is now its
only consumer.

## Why it did not follow, which is the part worth keeping

Not inertia. Its place universe is **`oneseat_change.csv`'s `place` column**,
which is PRT's own label, and that join is what makes a travel-time row
comparable to a one-seat row for the same place. The county's boundary names
disagree with PRT's on real places:

| PRT's label (`oneseat_change.csv`) | County boundary `LABEL` |
|---|---|
| `Penn Hills township (Allegheny, PA)` | `Penn Hills Municipality` |
| `Baldwin borough (Allegheny, PA)` | `Baldwin Borough` *and* `Baldwin Township` |

Matching boundary names against PRT's would place **no** block groups in such a
place. The script would not fail: it would fall through to its stop-mean
fallback tier and publish a travel time for the place derived from one averaged
point, which is exactly the "one point cannot represent a township" failure
[`one-point-cannot-represent-a-township.md`](one-point-cannot-represent-a-township.md)
exists to prevent — reintroduced silently, in the script that entry was written
about.

The general shape: **two identifier systems that agree on most values and
disagree on a few are more dangerous than two that disagree on all of them.**
A total mismatch fails loudly on the first join; a 95% match fails on the 5%,
in a fallback path, with a plausible number coming out the other end.

## What converting it would take

1. A reconciliation between PRT's `HOOD`/`MUNI` labels and the county's
   boundary names — a mapping, checked by hand, not a string transform.
   `place_key()`-style suffix stripping is not enough; township/municipality
   and the two Baldwins are genuine semantic differences.
2. A re-run of `analyze_travel_time.py`, which is hours, not minutes (~7,700
   profiles).
3. Re-verification of every travel-time figure in `docs/answers/`.

## Approaches considered

**Convert it in the same change — rejected by the agent**, on the grounds
above: a silent fallback to a wrong-but-plausible number is worse than a
documented divergence, and the re-run cost meant the mistake would not have
surfaced for hours.

**Leave both on nearest-stop — rejected by Max on 2026-08-31**, who chose
boundaries for both drawing and assignment when the choropleth was scoped.

**Convert one-seat too, so PRT labels disappear from the repo — not
considered seriously.** `oneseat_change.csv` names places by the stops a route
calls at; a stop's place is reasonably PRT's own label for it. The unit there
is a stop, not a census polygon, so the boundary is not obviously the better
answer. This is worth a real decision rather than a drive-by.

## Scope of the harm today

Bounded, and not in a headline. The county totals did not move at all —
68,989 residents lose every bus, 20,095 gain one, before and after — because
only attribution between places changed. What differs is which place a given
block group is counted under, in `equity_places.csv` versus
`trip_time_origins.csv`. Anything comparing a place's travel time to its
coverage loss is comparing two slightly different footprints, and should say
so until this is closed.
