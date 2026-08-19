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
at today's stops or as a continuous 100 m surface — see
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
python3 build_webdb.py              # -> data/refresh.db, for the web app only
```

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

uv run pytest                        # 49 tests, incl. served == published
npx vitest run && npx tsc --noEmit   # 37 frontend tests
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
`analyze_frequency_change.py` takes `MONTH`, `fnum` and `load_usage` from
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

`DATA_SOURCES.md` is the full inventory, with live-verified endpoints, per-file
row counts, and the PDF parsing traps. Read it before touching `ingest_blr.py`.

**PRT does not publish a GTFS for the proposed network, but one is in this repo**
at `data/raw/proposed_gtfs/` (real timetables: 698,865 `stop_times` rows,
`Future_BLR_Service-Weekday/-Sa/-Su`). Prefer it for anything on the proposed
side. Everything that counts service now reads it through `gtfs.py` —
`analyze_service_loss.py`, `analyze_frequency_change.py`,
`analyze_coverage_change.py`, `analyze_coverage_area.py`, `analyze_route_hours.py`,
`analyze_one_seat.py`. The PDFs survive as a published cross-check only: deriving
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
