# The map counts places, not riders

**Observed:** every layer on the map counts locations, cells, kilometres or
connections, so a reader who asks "how many people does this loss actually
touch?" gets no answer — while the stop-level boardings that would answer it
are already sitting unused in `refresh.db`.
**Where it stands:** built 2026-08-28 as a Locations/Riders switch inside the
change legend, and awaiting close. Max decided both of the questions this
entry was filed to ask — publish it, and ship it as a weighting rather than a
view of its own. One thing is still owed: the BASE_CAMP question ID it answers
to.

## What is being asked for

Weight the change map by ridership: instead of "593 locations lose all
service", let the reader see "the locations losing all service carry 488
weekday boardings — 0.7% of the system's 67,619."

The unit of analysis does not change. This is still convention 1's location,
still bucketed by the same circle on the ground in both networks. What changes
is the **denominator**: places become people-who-board-there. That is a smaller
change than the travel-time layer was — no new router, no new feed reading, no
new precompute — and a larger change in how the site can be quoted.

## The data is already in the serving database

Measured 2026-08-28 against `data/refresh.db` (127 MB).

`stop_place` carries `weekday_boardings`, `saturday_boardings` and
`sunday_boardings` for 5,751 stops, brought over from
`data/coverage_change.csv` by `build_webdb.py:178`. Nothing read those three
columns when this was filed — not `query.py`, not `app.py`, not the frontend;
the only trace of them in the app was a caveat nothing rendered and a comment
in the legend explaining why it deliberately counted locations instead. They
are what the switch now counts.

**The join is exact, which is the part that could have gone wrong.** The
change layer's published points are built *from* `stop_place`
(`query.change_points`, `query.py:489`), so all 5,751 published points carry a
boardings figure and none is missing. Summing over points is therefore summing
over distinct stops — each boarding counted once, no overlap arithmetic to get
wrong. The 121 unpublished points are new-service locations where nothing stops
today; they have no boardings by construction, not by accident. See the
asymmetry section below, because that is not a small detail.

## The number it produces

Citywide, weekday, 400 m, published points only:

| bucket | locations | weekday boardings | share |
|---|---:|---:|---:|
| more | 1,894 | 25,686 | 38.0% |
| same | 1,469 | 29,214 | 43.2% |
| less | 1,294 | 10,490 | 15.5% |
| doubled | 217 | 912 | 1.3% |
| halved | 284 | 829 | 1.2% |
| **gone** | **593** | **488** | **0.7%** |

The same figure holds on weekends (Saturday 246 of 40,659 boardings, Sunday 187
of 28,845 — 0.6% each) and roughly triples under the strict same-corner test
(150 m: 900 locations, 1,270 boardings, 1.9%).

That is the ridership-over-coverage thesis stated in the plan's own preferred
currency: a location that loses all service averages 0.8 daily boardings, one
that gains service averages 13.6. It is the most quotable number on the site,
and it is an argument *for* the Refresh.

## Four traps, and the third one was the reason to hesitate

**1. There is no proposed-side ridership, and there never will be.** Boardings
are observed counts from the May 2025 usage extract; the proposed network has
not run. So the layer can weight losses precisely and cannot weight gains at
all — the 121 places the plan adds a bus to score zero riders, not because
nobody will use them but because nobody can have. A rider-weighted map is
therefore *structurally* a map of what is at risk, and reading it as a balance
sheet gets the plan wrong in the plan's favour. Any presentation has to say
this on the surface, not in a caveat list.

**2. A boarding is not a rider.** These are unlinked, unweighted May 2025
averages. One person's round trip with a transfer is up to four boardings, so
the totals cannot be read as people. PRT's own disclaimer calls them
unadjusted, unofficial totals that may understate ridership by up to 30% — the
text is already written at `app.py:389` and would need to travel with every
figure the layer shows.

**3. The measure is circular.** This was the decision this entry was filed to
ask for, and Max answered it on 2026-08-28: publish. The Refresh is
explicitly a redesign that concentrates service where ridership already is.
Scoring it against today's boardings asks whether it kept the stops people
currently use, which is the thing it was optimised to do — so it will
essentially always return a flattering answer, and a critic could fairly say
the site adopted PRT's own objective function as its yardstick. The counter,
and the reason it ships: publishing it is honest precisely *because* it
favours the plan, and `FINDINGS.md` already commits to reporting gains as
plainly as losses.

The shape of the trap is convention 10 one unit further down — the location
view says roughly service-neutral, the area view says 12% less ground, the
street view says 22% less pavement, and this would say 99.3% of boardings
untouched. All four are true and any one alone is a talking point. The number
must not be quoted without at least one of the others beside it — this is what
convention 15's closing paragraph is for.

**4. Boardings are the most skewed quantity in the repo, which constrains the
drawing.** The median stop has 1.95 weekday boardings; the top 10% of stops
carry 73% of the total. A dot map with radius proportional to boardings is
5,000 invisible specks and a dozen discs — unreadable, and misleading in the
direction of "nothing is happening out here." This is an argument for putting
ridership in the *counts* rather than in the *symbols*.

## What was built

A Locations/Riders switch inside the change legend, at `?weight=riders`. Every
count in the key flips from dots to the boardings observed at them, for
whichever day type and radius the map is already showing.

- The change payload carries a fourth field per day type
  (`weekday_riders`, …), from `query.point_boardings`. `null`, never 0, at the
  121 locations the plan adds a bus to.
- `change.sumRidersInBounds` sums in view by bucket and counts the unmeasured
  locations separately; the legend renders those as a sentence and shows an em
  dash rather than a zero for a bucket with nothing measured in it.
- The one-sidedness and PRT's two disclaimers are rendered under the counts,
  not left to the methods list.
- `tests/test_query.py::test_boardings_reproduce_the_published_shares` pins
  488 of 67,619 the way the bucket counts are pinned.
- `CLAUDE.md` convention 15 and `docs/WEBAPP.md` carry the reasoning.

Dots are still drawn at their existing sizes — trap 4 stands, and the
compressed-scale alternative was not built.

## Why a weighting rather than a sixth view

Not a new entry in `VIEW_LABEL`. A switch on the existing Locations view keeps
trap 4 out of the geometry, reuses the bucket colours, and puts the figure
where readers already screenshot it — while a sixth view would imply a sixth
question, and this is the same question under a second denominator.

Sizing dots by a compressed (log or square-root) scale remains the unbuilt
alternative: a real map rather than a number in a box, at the cost of a second
key and an explanation of why the scale is compressed. Worth prototyping only
if the counts-in-the-legend version turns out to be too easy to miss.

The plumbing was small, as expected: one field per day type added to the
change payload, a boardings-aware tally beside `countInBounds`, and the legend
that renders it. No pipeline change, no rebuild of `refresh.db`, no new
precompute — and, as estimated, most of the work was in the wording rather
than the code.

## Approaches considered and rejected

- **Weighting the surface, street or one-seat layers too.** Rejected here
  (agent-derived, overturnable): boardings attach to a stop, and only the
  Locations view has stops as its unit. Spreading a stop's riders over 100 m
  cells or kilometres of pavement invents a distribution the data does not
  carry.
- **Filing it under `RIDERSHIP-PROJECTIONS` in `docs/BASE_CAMP.md`.** That
  question asks for projections of *future* ridership under scenarios, which
  this cannot do — it reports observed boardings at affected places. If the
  layer ships it needs its own question ID, the same debt the travel-time
  layer left open in
  [`origin-destination-travel-time.md`](origin-destination-travel-time.md).
- **Silently adding the number to the existing legend.** Rejected: trap 1 makes
  an unlabelled rider count actively misleading, and the legend's own comment
  already records that weighting by boardings is "a different map with a
  different caveat."

## What was decided, and what is still owed

1. **Publish it, given trap 3.** Max's call, 2026-08-28.
2. **A weighting toggle, not a view with sized dots.** Max's call, same day,
   taking the recommendation above.
3. **It became convention 15 rather than an amendment to convention 10.**
   Agent-derived and overturnable: the argument for a convention of its own is
   that the `null`-not-zero rule is a *drawing* rule nothing in convention 10
   implies, and it is the rule most likely to be undone by someone tidying a
   nullable column. The argument against is that this is not a new unit of
   analysis, which is what 10–14 are each about.
4. **Still owed: which BASE_CAMP question it answers to.** Not
   `RIDERSHIP-PROJECTIONS` — see above. The same debt the travel-time layer
   left open.
