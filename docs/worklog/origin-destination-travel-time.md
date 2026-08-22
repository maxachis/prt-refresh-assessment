# Origin-to-destination travel time, before and after

**Observed:** riders want the one question the site cannot answer — "I go from
here to there; how does *my trip* change?" — and both feeds carry complete
scheduled times at every stop, so it is computable rather than estimable.
**Where it stands:** open, unstarted, and deliberately so. Scoped 2026-08-22 at
Max's request; the blocking item is not routing code but the absence of a
BASE_CAMP question for it.

## What is being asked for

Pick an origin and a destination, get an overview of how travel time and the
route taken change between today's network and the Refresh: total door-to-door
time, time on the bus, time waiting, number of transfers, and which routes
carry the trip on each side.

This is a **fifth unit of analysis**, alongside the location, the area, the
street and the one-seat ride. The first three measure a quantity of service and
the fourth a connection; this one measures a *journey*, and it is the only one
that involves waiting, transferring, or the clock. If it is built, it needs its
own convention entry in `CLAUDE.md` in the shape of conventions 10–13, because
it will produce a bigger, more quotable number than any of them and it measures
something narrower than all of them.

## Why it is feasible: the data is real on both sides

Measured 2026-08-22 against the committed feeds.

| | current | proposed |
|---|---|---|
| `stop_times` rows | 1,005,348 | 698,865 |
| trips | 18,817 | 14,488 |
| stops called at | 6,388 | ~48 per trip avg |
| blank arrival times | 0 of 200,000 sampled | 0 of 698,865 |
| time granularity | seconds (`11:04:11`) | whole minutes (`08:01:00`) |

Every stop of every trip carries a scheduled time on both sides. There are no
timepoint-only rows needing interpolation, which is the usual thing that kills
a travel-time comparison before it starts.

**The proposed timetable models peak congestion.** Grouping weekday trips by
route/pattern and plotting elapsed end-to-end time against departure hour:

```
('39','A','DO')  05:30 → 32 min   13:00 → 32   15:00 → 36   17:00 → 36   21:00 → 29
('48','A','DO')  04:30 → 31 min   13:00 → 36   15:20 → 38   17:00 → 40   23:00 → 32
```

Running times widen at the PM peak and shrink late at night, so a peak-hour
before/after difference is measuring the plan rather than an artefact of a flat
synthetic schedule. This was the first thing checked and the result could
easily have gone the other way — the trip ids look generated
(`Future_BLR_Service-Weekday-39-A-DO-2100-f8272b9`) and the whole-minute
granularity suggests a template.

## What is missing

**The web database cannot answer this, by design.** `departures` stores one row
per (side, stop, route, direction, day) carrying that combination's departure
minutes — no trip identity, no arrival times, no stop order
(`build_webdb.py:111`, and the reasoning in `docs/WEBAPP.md`, "Why departure
times are stored, not trip counts"). That collapse is what lets the walk radius
be a live UI control. A router needs the trip dimension back: trips grouped
into patterns with their time arrays, built fresh from the raw feeds.

**The trip dimension is far cheaper than it looks.** Measured 2026-08-22: the
1.7 million stop calls across both feeds collapse to **471 distinct stop
sequences** — 273 current, 198 proposed, averaging ~70 trips each. So the
router's data is one row per pattern-stop (25,647 rows) plus one row per trip
(33,305) carrying a pattern id, a day type, a start minute, and its running
times as offsets from that start. Offsets are monotonic on every one of the
33,305 trips and top out at 171 minutes, so the whole time dimension is 4.5 MB
of text. Against a `refresh.db` that is **35 MB today**, that is roughly +20%,
not the doubling first assumed here. Per-pattern offsets would be smaller still
and are wrong: running times widen at the peak, which is the effect worth
measuring.

> An earlier version of this entry said "expect roughly to double the
> database", off a 14 MB figure taken from `docs/WEBAPP.md` — itself stale by
> two layers. The root of that error was quoting a written-down size instead of
> measuring the file, and estimating a table's cost before checking whether its
> rows deduplicate.

**Neither feed publishes transfers.** No `transfers.txt` on either side, so
every transfer connection has to be synthesised from stop coordinates. Three
constants then decide the answer — walking speed, maximum transfer walk,
minimum connection buffer — and generous values will invent connections no
rider would make. These are choices to publish, not defaults to pick quietly.

**Nothing in the pipeline computes travel time,** so there is no CSV to pin the
app against. Every other layer is checked against the file `docs/answers/`
cites (`tests/test_query.py`), and that guarantee is the reason the map can be
trusted. This layer would ship unpinned unless a companion pipeline script
computes journeys over a sample of origin–destination pairs and writes
something like `data/trip_time_change.csv` for the app to be tested against.

## The traps

1. **Endpoints must be points, not stop ids.** This is how the request arrived
   ("specify one bus stop as the start, another as the end") and it is the one
   part that should not be built as asked. Stop ids are not comparable across
   the two networks — conventions 1–3 exist because of exactly this — so a
   renumbered or consolidated stop would read as an infinite travel time when
   the bus stops 80 m away. Endpoints should be dropped pins snapped
   independently on each side, like the one-seat destinations.

2. **A single departure time is a number you chose.** Leaving at 8:03 versus
   8:07 is the difference between catching and missing a bus whose headway just
   went from 15 to 30 minutes. The honest output is a profile query — every
   departure across a window, reporting median and spread of door-to-door time
   — which is also the only way *waiting* enters the answer at all. This is
   where the frequency changes the rest of the site measures actually reach a
   rider, and it is the half most likely to be skipped as a refinement.

3. **Rail must be included, and the two feeds label it differently.** A journey
   is not a service quantity, so convention 13's carve-out applies and dropping
   the T would route Beechview absurdly. Route types: current feed has 97
   type 3, 3 type **2**, 2 type 7; proposed has 95 type 3, 3 type **0**, 2
   type 7. A rail filter written once against today's feed silently drops the T
   from the future network. `bus_only` in `gtfs.py` keys on `"3"` and is
   therefore safe; anything keying on `"2"` is not.

4. **On-demand zones cannot be routed.** A trip the plan expects one of the 10
   microtransit vans to serve reads as unreachable — the same gap already open
   for the surface layer (`docs/WEBAPP.md`, "Before it goes public", item 2),
   but worse here, because "no trip exists" is a stronger claim than "this
   ground lost fixed-route service".

5. **Scheduled, not observed, on both sides.** Today's side could in principle
   be compared against real vehicle history (`pgh-ghost-bus` sits alongside as
   a reference checkout), but the proposed side has no such thing and never
   will. Comparing schedule to schedule is the only symmetric choice; it needs
   saying wherever a number is quoted.

## Approaches considered

- **Reuse the existing database.** Ruled out — the departure-minute packing is
  lossy in exactly the dimension a router needs, and un-collapsing it at query
  time is not possible.
- **Precompute, like `point_reach` does for the one-seat layer.** Ruled out —
  the one-seat layer is affordable because its expensive half doesn't depend on
  the destination. An arbitrary origin *and* destination is a quadratic space.
  Live query instead: a round-based search (RAPTOR) over ~15k trips per side is
  milliseconds in pure Python, so per-request is fine.
- **Ship a single-departure-time answer first, add the profile later.** Not
  ruled out, but flagged: the single-time version is the version that produces
  a screenshot-ready number with no honest denominator behind it. If only one
  gets built, the profile is the one worth having.

*All four of these are agent judgements, not Max's decisions — a later session
with better information should feel free to overturn them.*

## The non-technical blocker

There is no travel-time question in `docs/BASE_CAMP.md`. Every feature on this
site traces to a question ID there, and that file is ground truth for intent.
This would be the first that does not — while also being the most quotable
thing the site could produce ("my commute goes from 35 minutes to 58"), which
cuts both ways. The question should be added to BASE_CAMP, with PPT's buy-in,
*before* building rather than after.

## Rough size

About a week. The routing engine is maybe two days of it; the rest is the
profile query, the caveat surface, the UI for two pins and an itinerary
comparison, and the pipeline script that gives the layer something published to
be tested against.

## Resolution

Open. Nothing built.
