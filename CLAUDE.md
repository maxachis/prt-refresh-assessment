# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A pro-bono analysis of Pittsburgh Regional Transit's **Bus Line Refresh** — the
Proposed Final Network published 2026-08-17, in public comment until 2026-09-30.
It is a reproducible data pipeline plus written findings, whose purpose is to
let Pittsburghers for Public Transit answer the questions in `docs/BASE_CAMP.md`
with evidence PRT has not itself published.

Since both networks gained a real GTFS it also carries **a web app** (`src/refresh/`,
`frontend/`) that answers "what changes here?" at an arbitrary point, as dots
at today's stops, as a continuous 100 m surface, as the street network
itself gaining and losing buses, or as who keeps a one-seat ride to Downtown,
Oakland or a point you pick — see
[`docs/WEBAPP.md`](docs/WEBAPP.md). The pipeline remains the primary artifact and
stays standard-library only; the app is an optional extra that only reads what
the pipeline builds. It is deployed at
<https://prt-refresh.lemaliconsulting.com> (`deploy/README.md`), though nobody
has been pointed at that URL yet — one permission question to PPT is open before
it is announced.

`docs/BASE_CAMP.md` is human-authored and is **ground truth for intent**; every
other document is secondary to it. Work is organised around its question IDs
(`REGION-LOSS`, `LOSE-ONE-SEAT-OAKLAND`, `COVERAGE-CHANGE`, …), and
`docs/answers/README.md` tracks which are answered, feasible, or blocked.

## Commands

**The pipeline** has no build, no linter and no third-party Python packages.
Requires Python 3 and `pdftotext` (poppler-utils). Scripts are run directly from
the repo root, in this order:

```bash
python3 ingest_blr.py               # must run first -> data/*.csv from remote sources
python3 analyze_service_loss.py     # -> data/stop_service_change.csv
python3 analyze_route_ridership.py  # -> data/discontinued_route_ridership_*.csv
python3 analyze_frequency_change.py # -> data/stop_frequency_change.csv
python3 analyze_one_seat.py         # -> data/oneseat_change.csv
python3 analyze_coverage_change.py  # -> data/coverage_change.csv, route_service_days.csv
python3 analyze_coverage_area.py    # -> data/coverage_area*.csv (coverage as km2)
python3 analyze_route_hours.py      # -> data/route_frequency_change.csv
python3 analyze_corridor_change.py  # -> data/corridor_change.csv
python3 analyze_travel_time.py      # -> data/trip_time_change.csv (the pooled
                                    #    answer) + data/trip_time_origins.csv
                                    #    (the per-block-group evidence).
                                    #    SLOW: ~7,700 profiles, hours not
                                    #    minutes, because every place is
                                    #    searched from all of its block groups.
                                    #    Needs analyze_one_seat.py and
                                    #    ingest_census.py to have run.
python3 build_webdb.py              # -> data/refresh.db, for the web app only
```

**The equity questions** are a second, independent ingest-then-analyse pair,
because they read the census rather than PRT:

```bash
python3 ingest_census.py            # -> data/census_blocks.csv, census_block_groups.csv
python3 analyze_equity_change.py    # -> data/equity_*.csv
python3 analyze_equity_places.py    # -> data/equity_places.csv (needs PRT stop labels)
python3 build_equity_brief.py       # -> docs/equity-brief.html + the app's /findings page
                                    #    prose lives in equity_brief_body.html
```

`ingest_census.py` is the only script that ever wants a credential: the Census
API now rejects unauthenticated requests. Every response is cached under
`data/raw/census/` and committed, so a clone reproduces every published number
with no key; a key (`CENSUS_API_KEY` in the environment or `.env`) is needed
only to fetch something not already cached. The centre-of-population file needs
none at any time.

**The web app** is the only part with dependencies, and they are an optional
extra so the pipeline install stays empty. `build_webdb.py` is deliberately a
pipeline script rather than a CLI subcommand — putting it behind the package
would make the pipeline require an install. It does import `refresh.query` off
`src/` to precompute the map's change layer with the app's own code, which
needs no install because `query.py` is standard library like everything else.

```bash
uv sync --extra web && npm install   # one-time
npm run build                        # frontend/*.ts -> static/app.js
uv run refresh serve                 # http://127.0.0.1:8000

uv run pytest                        # 146 tests, incl. served == published
npx vitest run && npx tsc --noEmit   # 82 frontend tests
```

**Hosting** is `deploy/` — a Hetzner VM behind Caddy, live at
<https://prt-refresh.lemaliconsulting.com>. `./deploy/provision.sh` creates or
redeploys it; re-running is the redeploy, and is a no-op when the box already
serves the commit you asked for. It deploys a *pushed commit*, not the working
tree, and builds `refresh.db` on the box. See `deploy/README.md`.

Each script prints a human-readable report to stdout alongside writing its CSV;
that printed report is the draft material for `FINDINGS.md` and `docs/answers/`.

`analyze_one_seat.py` reads only raw sources, so it runs independently of the
other analyses. The cross-script imports are few and deliberate:
`analyze_equity_places.py` takes the HOOD/MUNI labels and the outlier filter
from `analyze_one_seat.py`, so a block group is named by the same cleaned
labels the place-level one-seat answer uses (convention 6); it therefore has to
run after `ingest_blr.py` and `analyze_service_loss.py`, unlike the rest of the
equity pair. `build_equity_brief.py` reads only published CSVs and re-uses
`analyze_equity_places.by_place`, so the charts cannot drift from the files
`docs/answers/` cites. `build_webdb.py` takes the anchor definitions, the HOOD
labels and the outlier filter from `analyze_one_seat.py`, so the app's Downtown
and Oakland are the districts `data/oneseat_change.csv` publishes.
`analyze_equity_change.py` takes the tiers and the whole location test from
`analyze_coverage_change.py` and the dimension definitions from
`ingest_census.py`, so a rider's coverage is decided the same way at a house as
at a stop. Otherwise: `analyze_frequency_change.py` takes `MONTH`, `fnum` and `load_usage` from
`analyze_service_loss.py`; `analyze_coverage_change.py` takes the periods, radii
and `Grid` from `analyze_frequency_change.py`; and `analyze_coverage_area.py`
takes the tier list and the hourly test from `analyze_coverage_change.py` plus
the place-label outlier filter from `analyze_one_seat.py`, so the area answer
cannot drift from the location answer it complements. Both feeds always load
through `gtfs.py`.

## Data flow and caching

```
remote sources  ->  data/raw/ (cached verbatim)  ->  data/*.csv (tidy)  ->  FINDINGS.md, docs/answers/
```

Every fetch helper checks `data/raw/` first and only downloads on a miss, so
re-running is cheap and analysis stays reproducible against a moving upstream.
**Both `data/` and `data/raw/` are committed** — including the 9 MB Remix dump
and the current GTFS zip. To force a refresh, delete the specific cached file;
do not add cache-busting flags.

The five upstream sources, and what each is the authority for:

| Source | Authority for |
|---|---|
| Remix public API (`platform.remix.com`, anonymous) | The proposed network: stops, routes, ordered stop sequences |
| Frequency & Hours PDFs (weekday/sat/sun) | *How much* proposed service — span + headway by period. The only proposed-frequency source. |
| Current GTFS (`rideprt.org`) | The before-side baseline, including real `stop_times` trip counts |
| ArcGIS `PRT_Bus_Stop_Usage_Unweighted` | Stop-level boardings, May 2025, boardings-only |
| WPRDC route ridership (CKAN SQL) | Route-level riders, current through Apr 2026 — preferred over stop-level for route totals |
| Census: 2020 blocks + centres of population + ACS 5-year (`census.gov`) | Who lives where. The population denominator behind every `EQUITY-*` answer, and the only source in the repo that is not about transit. Blocks say where inside a block group people live; ACS says who they are |

`DATA_SOURCES.md` is the full inventory, with live-verified endpoints, per-file
row counts, and the PDF parsing traps. Read it before touching `ingest_blr.py`.

**PRT does not publish a GTFS for the proposed network, but one is in this repo**
at `data/raw/proposed_gtfs/` (real timetables: 698,865 `stop_times` rows,
`Future_BLR_Service-Weekday/-Sa/-Su`). Prefer it for anything on the proposed
side. Everything that counts service now reads it through `gtfs.py` —
`analyze_service_loss.py`, `analyze_frequency_change.py`,
`analyze_coverage_change.py`, `analyze_coverage_area.py`, `analyze_route_hours.py`,
`analyze_one_seat.py`, `analyze_corridor_change.py`. The PDFs survive as a published cross-check only: deriving
proposed service from them drops the S-variants (absent from Remix) and doubles
the peak-only limiteds. The Remix trips endpoint returns `[]`, so Remix itself
remains timetable-free — but it is still the only source for the 10 on-demand
microtransit zones, which `analyze_coverage_area.py` reads from
`remix_project.json`.

Be exact about that feed's provenance, because three separate claims get run
together if you are careless. What the feed evidences: `feed_info.txt` names PRT
as publisher and stamps it 2026-08-11. What `verify_proposed_gtfs.py` earns:
that it is the published plan, not a draft. How it reached this repo: PRT
supplied it to Pittsburghers for Public Transit by email at PPT's request, and
PPT passed it on. That last one is Max's account, recorded in `DATA_SOURCES.md`;
**no date is known for PRT's email**, so do not write one, and do not describe
the feed as published, downloadable, or fetchable — it is none of those.

## Analytical conventions that must be preserved

These are not style preferences; each was arrived at because the naive version
produced a wrong answer with a confident face on it. Breaking one silently
changes published findings.

1. **Never compare route N to route N.** The plan re-splits corridors, so
   route-to-route deltas are meaningless (Carrick's 51 is the canonical case:
   "loses half its trips" route-wise, unchanged corridor-wise). The unit of
   analysis is a **location** or a **place**, with the same walk radius applied
   identically to both networks.
2. **Aggregate above the stop id.** Adjacent stop ids split a route set at
   corridor locations, manufacturing losses that do not exist. Stop-level output
   is an intermediate, not a finding.
3. **A vanished stop id is not a lost bus.** Stops get renumbered, consolidated,
   and nudged across intersections; anything flagged as losing service is
   checked against the nearest stop the proposal actually serves.
4. **Radius sensitivity is reported, not chosen.** 400 m is the headline
   quarter-mile access distance, 150 m the strict same-corner test. Where they
   disagree — the "PRTX" station consolidations — both numbers are printed.
5. **Tier by confidence.** The Remix map's base feed is 2023, so a stop served
   today and absent from Remix may postdate the base feed rather than be cut.
   Those go in an "unverifiable" bucket and never into a headline.
6. **Filter PRT's `HOOD`/`MUNI` labels.** They contain gross errors — stops
   mislabelled by up to 40 km. Any place-level work needs the outlier filter in
   `analyze_one_seat.py`.
7. **Take boardings from the `All Routes` row.** The usage extract is one row
   per stop *per route* plus a total; summing rows double-counts.
8. **Parse the crosswalk's multi-route cells.** One cell may read `"86, 77"`;
   a naive split loses routes silently.
9. **Measure the frequency PDFs' columns on every page.** The header repeats per
   page at a drifting offset, so centres measured once misassign later pages —
   this cost 16 routes their 8–11pm headway and inflated the late-evening cut to
   −38.7% (`FINDINGS.md` caveat 9). Two cells landing in one column now raises.

10. **Area and locations are complements; never quote one alone.** The
    per-location tiers are measured at stops that exist today, so they cannot
    see ground the plan adds a bus to and they weight a downtown block like a
    mile of Route 51. Area fixes both and introduces its own bias — a square
    kilometre of hillside counts like a square kilometre of Brookline. The plan
    reads as roughly service-neutral by location and as a 12% loss of covered
    ground; both are true, and either alone is a talking point rather than a
    finding.

11. **Pavement is not access, and the corridor layer must never be quoted as
    if it were.** `analyze_corridor_change.py` asks a third question — does
    ANY bus run on this piece of street — and it is the only analysis whose
    unit is the street itself rather than a location or an area. A street can
    lose its only bus while a parallel street a block away keeps one: real
    pavement lost, no access lost, and the location and surface views will
    correctly show no change there. The weekday network drops from 1,156 km of
    street carrying a bus to 981 km, a 22.4% loss against 7.2% added. That is
    a larger-sounding number than the 12% area loss and it measures something
    narrower; quoting it without the access figures beside it would be the
    same error convention 10 forbids, one unit further down.

12. **Population is a third denominator, and it needs its own scope stated.**
    `analyze_equity_change.py` runs the identical location test at the
    population-weighted centre of every census block group, so the five tiers
    can be reported as people rather than stops or square kilometres. Two
    traps. First, *which people*: two thirds of the three-county population
    lives where PRT has never run a bus, so dividing by all of it makes every
    change look small; Allegheny County is the headline denominator and the
    script writes all three so the choice is visible. Second, it is an
    **ecological** measure — it describes the places a group lives, not its
    members — and a block group is covered or not at a single point. Quote it
    beside the location and area figures, per convention 10, never alone.

13. **A one-seat ride is a fourth unit, and it is the only measure in this
    repo that counts rail.** `analyze_one_seat.py` and the app's one-seat view
    ask whether some single route serves both a location and a destination —
    connectivity, not volume. Three things follow that look like bugs and are
    not. It is **route-based**, which convention 1 otherwise forbids: it never
    compares route N to route N, it intersects two independently recomputed
    route sets, so renumbering moves both sides together. It has **no day type
    and no travel time**: a route serves a place or it does not, so a surviving
    one-seat ride may be hourly on a Sunday or take an hour to make, and that
    caveat has to ship with the number. And it **includes the T and the
    inclines**, where every service figure here drops them — drop them from
    this question and Beechview reads as losing a Downtown ride the Blue Line
    still runs. Do not "fix" that inconsistency; it is control 2 of
    `analyze_one_seat.py`, and the app keeps its all-mode index in separate
    tables (`reach_stop`, `point_reach`) precisely so that widening the
    universe here can never widen it under a published service number.

14. **A journey is a fifth unit, and it is the only one with a clock.**
    `analyze_travel_time.py` and the app's journey view ask how long a
    rider's actual trip takes, origin to destination — the only measure here
    that involves waiting, transferring, or the time of day. Six things
    follow, and the first three look like inconsistencies and are not.

    The clock starts **when the rider is ready at the origin, not when they
    board**. Waiting is part of a trip, and it is the only place the headway
    changes the rest of the site measures actually reach a person. A router
    that timed from boarding would flatter a network whose headways doubled.

    The answer is a **profile, not a departure**. Leaving at 8:03 rather than
    8:07 is the whole answer when a headway goes from 15 to 30, so the unit
    is the distribution of trip times across a window, with the fraction of
    minutes that can be made at all reported beside it. A single chosen
    departure produces a quotable number with no denominator behind it.

    Like the one-seat ride, it **includes rail** (convention 13) and it is
    **route-based** (against convention 1) — for the same reasons, and with
    the same protection: the router's index is built from `gtfs.load_patterns`,
    which is separate from the `load_service` every service figure uses, so
    widening the universe here can never widen it under a published service
    number.

    **Transfers are invented, and the invention is not neutral.** Neither
    feed publishes `transfers.txt`, so connections are synthesised from stop
    coordinates, governed by the three numbers in `journey.CONSTANTS`. The
    Refresh depends on transferring more than today's network does, so a
    generous transfer radius can only help it and a strict one can only hurt
    it. Unlike the access radii in convention 4, this sensitivity can change
    a pair's **sign**, not just its magnitude. Publish the flip count — how
    many pairs reverse direction between a strict and a headline radius —
    or do not publish the times. See
    `docs/worklog/transfer-radius-favours-one-network.md`.

    **A place is its residents, not its centre.** This is convention 12's
    ecological trap arriving one unit further down, and it bites harder here
    because a journey has a single origin where coverage has a whole
    surface. Searching a place from one point made six suburban townships
    read as losing *all* morning-peak access to Downtown, when what was true
    is that one arbitrary coordinate in each had no stop within a quarter
    mile — a false sentence a reader would happily repeat. So a place is
    searched from **every populated census block group that labels to it**
    and the profiles are pooled by population, the published median being
    the median *resident-minute*. Two things ship with that: the share of a
    place's residents the answer speaks for (`origin_coverage_fraction` —
    coverage stays `analyze_coverage_change.py`'s to own, per convention 10,
    and appears here only as a denominator), and the **spread** across a
    place's own block groups, which is routinely tens of minutes. Where the
    spread is wide there is no single travel time for the place, and a "this
    place gets N minutes slower" sentence is hiding that. See
    `docs/worklog/one-point-cannot-represent-a-township.md`.

    **It is schedule against schedule.** Today's side is compared at its
    scheduled times, not its observed ones, because the proposed side has no
    observed times and never will. Symmetric, and not the same as saying a
    trip will take that long. Say so wherever a number is quoted.

State data vintage and PRT's own accuracy disclaimer (stop figures are
"unadjusted, unofficial totals" that may understate ridership by up to 30%)
wherever these numbers are quoted. Report gains as plainly as losses — the
current headline finding is a ridership-over-coverage redesign that is roughly
service-neutral per location while covering 12% less ground, and overstating
either half would discredit the other.

## Writing conventions

- Each script's module docstring carries its full method and the reasoning for
  it, including which controls changed the answer. Keep that current when the
  method changes — the docstrings are the primary method documentation and
  `docs/answers/METHOD-one-seat.md` is derived from one.
- `FINDINGS.md` holds the cross-cutting results (sections A/B/C, matching the
  three analysis questions). `docs/answers/<QUESTION-ID>.md` holds one
  BASE_CAMP question each, with question, method, result, caveats, and
  reproduction. Update the status table in `docs/answers/README.md` when a
  question's state changes.
- Findings are for a public-comment audience: lead with the number, state the
  caveat inline, and name the file that reproduces it.
- `docs/worklog/` holds open items that outlive the session that found them —
  an unbuilt feature scoped but not started, a defect deliberately not fixed, a
  decision owed. One file per item, opening with a two-line lede; see
  `docs/worklog/README.md`. This is not the place for anything found and fixed
  in the same change.
