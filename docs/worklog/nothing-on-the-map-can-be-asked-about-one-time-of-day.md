# Nothing on the map can be asked about one time of day

**Observed:** every view answers for a whole day type, so a reader who wants to
know what the plan does to their morning rush, their evening, or their late bus
home has one place to look — the answer panel's seven-row period table — and no
way to see it across the map.
**Where it stands:** open, scoped, not started. Five views are candidates and
they are not equal: two can show a *published* per-period figure with no new
analysis, one is a query parameter the docs already flag as the missing control,
two need pipeline work first. Two views are deliberately not candidates.

> Raised by Max, 2026-09-17: "folks who are interested in, at least for some of
> the views, being able to also filter by certain times of day -- such as rush
> hour, mornings, evenings, etc."
> Stated by Max; who the folks are and which views they had in mind is not
> recorded.

## What is already there

The building blocks exist; the control does not.

- **The unit is already chosen.** PRT's Frequency & Hours PDFs publish seven
  periods on a 4:00–28:00 axis, and the pipeline uses them everywhere:
  `analyze_frequency_change.py:87` (`PERIODS`), `query.period_of`, the
  `periods` entry in `/api/meta`.

  | key | window |
  |---|---|
  | `early_4_6a` | 4–6am |
  | `am_6_9a` | 6–9am (morning rush) |
  | `mid_9a_3p` | 9am–3pm |
  | `pm_3_6p` | 3–6pm (evening rush) |
  | `eve_6_8p` | 6–8pm |
  | `late_8_11p` | 8–11pm |
  | `owl_11p_4a` | 11pm–4am |

- **The database stores departure minutes, not counts**, precisely so that a
  bucket can be chosen at query time (`build_webdb.py`, "WHY DEPARTURE LISTS
  RATHER THAN TRIP COUNTS"). `query.days_of_service` already returns a
  `periods` dict per day per side for any set of stops.
- **The per-period figures are published.** `data/coverage_change.csv` carries
  `cur_am_6_9a` … `prop_owl_11p_4a` per location and
  `data/stop_frequency_change.csv` the same per stop, and
  `docs/answers/README.md` already quotes a period-level finding (the late
  evening cut, caveat 9's −38.7% → −20.3% correction).
- **The panel prints them.** `frontend/place.ts:614` `periodTableHTML`, for
  both the kerb block and the walk-radius block.

## The five candidates, ranked by fit

### 1. Stop-by-stop dots and the Surface — best fit, and the number stays published

`query.compute_change` and `query.compute_surface` both call `side_at_place`,
which computes the per-period split for every dot and every 100 m cell, and
then write only the day total (`query.py:1219`, `query.py:1691`). So a
per-period layer costs no build time it does not already spend, only row
width: seven periods × two sides per (radius, day, point). The same ±10%
buckets and colours apply (`query.bucket`), and the result can be pinned
against `coverage_change.csv`'s period columns in `tests/test_query.py` exactly
the way the day totals are — which makes this *unlike* the one-seat day switch
(convention 13): the filtered figure is the published one, not a side
measurement.

Two things do not carry over and must be handled, not ignored:

- **The hourly tier has no per-period meaning.** It is a maximum-gap test over
  6am–6pm (`query.hourly`, rule 4 in `docs/WEBAPP.md`). Under a period the
  key's hourly row must go, or say "all day".
- **Boardings cannot be filtered by time.** The usage extract is per stop per
  *day type* only (`data/raw/stop_usage_202505.csv`: `B_W_202505`,
  `B_S_202505`, `B_U_202505`; no hour columns). The Riders reading under a
  period would be "all-day boardings at stops with no 6–9am bus" — a real
  at-risk framing, but one a screenshot will misquote. Recommendation:
  suppress it while a period is active, as the surface's Ground/People
  figures are suppressed under a brush selection (convention 17).

### 2. Travel time — the docs already name it as the missing control

`docs/WEBAPP.md:1946`: "The travel-time view is fixed to the morning peak …
a reader cannot ask what the same trip looks like at 8pm, which is where this
plan's evening headway changes live." The window is one constant,
`query.JOURNEY_WINDOW = (7*60, 9*60)`, and `journey.profile` already takes
`window` as an argument. What follows is the doc's own caveat: every number
then stops being the published one, so it needs the one-seat day switch's
treatment — opt-in, labelled on the card, never in `docs/answers/`. Two
constraints on the control's shape:

- Offer the seven periods, not free-form ranges. The router's cost is per
  ready-minute and it already collapses the two-hour window to ~40–75
  searches (`journey.py:96`); a six-hour midday window is three times the
  work per request on the site's only slow endpoint.
- The published 07:00–09:00 is not one of the seven (it sits inside
  `am_6_9a`). The default must stay the published window; "morning rush" as a
  filter would be 6–9am and needs to say so.

### 3. Street (corridor) view — the natural question, but pipeline work

"Does any bus run on this street after 8pm" is exactly the layer's question,
but `analyze_corridor_change.py` decides it per day only
(`data/corridor_change.csv`: `day,klass,length_m,geometry`). Per period means
that script emits a period column, the `corridor` table grows sevenfold, and
the per-period km figures get their own published cross-check before the map
draws them (convention 11's "never quote pavement as access" gets a time axis).

### 4. Route changes — possible, but against that view's own rule

Every figure on a route card is copied from `data/route_frequency_change.csv`
at build time and never recomputed (convention 18). That CSV has per-day trips
and hours, no periods. The per-route period counts exist in the loader
(`gtfs.load_service(...).route_periods`, used by `build_webdb.py:1074`), so
`analyze_route_hours.py` could publish them; until it does, the view must not
compute its own.

### 5. Answer panel — free

The period table is already there. A live period would highlight its row and
swap the block's headline to that row's number under a "6–9am" label, in both
the kerb and the radius block.

## Not candidates, and why

- **One-seat.** "A route serves a place or it does not" is the published
  method; a per-period version is buildable off `reach_stop_day` but would be
  a *third* one-seat measurement beside two that already need naming every
  time one is quoted (convention 13).
- **People and Places.** Coverage there is decided at each census block's own
  point, per day, and neither `data/equity_change.csv` nor
  `data/place_service_change.csv` has a period dimension, so a per-period
  people figure would have nothing to pin against — the trap convention 12 and
  `the-site-has-two-numbers-that-look-like-people.md` exist to prevent.

## Recommended shape

Agent's recommendation, 2026-09-17; nothing below is decided.

- **One control, one URL parameter (`period=`), beside `day=`**, threaded
  through `frontend/urlstate.ts` the way `oneseatday` is, so a link reproduces
  the filter. "All day" is the default and byte-identical to today. Friendly
  labels over PRT's keys ("Morning rush 6–9am", "Evening rush 3–6pm", "Late
  evening 8–11pm", "Overnight 11pm–4am").
- **Serve the dot and surface layers per period on demand**
  (`/api/change?radius=&period=`, `/api/surface?…`) rather than packing all
  periods into the layer the client holds. The dot layer is 205 KB gzipped for
  three day types (`query.py`, the `POINT_STRIDE` note); seven periods on top
  is roughly five times that for a control most readers will not touch. A
  per-period layer has the same shape as today's, so the client's decoder and
  colouring do not change — only the fetch key.
  *Considered and rejected by the agent:* a wider packed row shipping all
  periods at once, for the size reason above; revisit if switching periods
  turns out to be the common gesture rather than a one-off.
- **The key's head line names the period** the way it names "stops in view"
  (convention 17), because under `owl_11p_4a` most of the map is "no bus
  either way" on both sides — `query.bucket` returns `none` and draws nothing,
  the key's counts collapse, and a reader will take the collapse as a finding.
- **Pin before shipping**: extend the sampled-location check in
  `tests/test_query.py` to the seven period columns.
- **Order of delivery:** dots + surface + panel highlight (one change,
  published numbers); travel-time window (small change, caveat wording); the
  corridor layer (pipeline); route cards only if asked.

## Decisions owed

1. Which of the five to build, and in what order — the recommendation above
   is dots + surface first.
2. Whether the Riders reading is suppressed under a period or shown with an
   all-day label. Recommendation: suppressed.
3. Whether the travel-time control's periods are PRT's seven or a shorter list
   (say morning rush, midday, evening rush, evening). Recommendation: PRT's
   seven, so the whole site has one vocabulary for time of day.
