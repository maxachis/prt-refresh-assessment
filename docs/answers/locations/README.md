# Location-level answers

`docs/answers/` holds one file per question ID in `docs/BASE_CAMP.md`. This
subdirectory holds the other kind of answer: **"what happens to *here*?"** — a
corridor, a neighbourhood, a municipality — asked by someone who lives there
rather than by the assessment's own question list.

These are not new analysis. Each one is a cut of the same CSVs in `data/`,
filtered to a place and written for a reader who cares about that place only.
They exist because that is the question the public comment period actually
generates, and because a corridor answer needs a narrative the cross-cutting
findings cannot carry: which route moved, which street lost its bus, and how far
the nearest replacement is.

## Files

| Place | Headline | Backing data |
|---|---|---|
| [OUTER-CHARTIERS](OUTER-CHARTIERS.md) | Two segments of the Chartiers Ave corridor go to zero service — the Chartiers City hillside and the far Chartiers Ave Extension — while the through-corridor keeps a bus at ~20% fewer trips | `data/coverage_change.csv`, `data/stop_service_change.csv`, `data/route_frequency_change.csv` |
| [ROUTE-51](ROUTE-51.md) | Two corridors share the number and move in opposite directions: Brownsville Rd gains (+7.8% weekday, +36% Sunday, plus a new one-seat ride to Oakland) while PA Route 51 south loses (−15.2% weekday, −26.2% Saturday) as three flyers end and the fourth goes peak-only | `data/coverage_change.csv`, `data/stop_service_change.csv`, `data/route_frequency_change.csv`, both GTFS feeds via `gtfs.py` |

## Conventions these files follow

The same ones as everything else in the repo, and two that matter especially
here because place questions invite the errors they guard against:

- **The unit is a location, not a stop id and not a route.** Every before/after
  number is measured inside the same walk radius on both networks (400 m
  headline, 150 m sensitivity). A stop id that vanishes is not a lost bus; the
  test is whether anything the proposal actually runs comes within the radius.
- **Name the replacement and its distance.** "Loses service" is only usable in
  a comment if it says what the nearest proposed service is and how far the walk
  became. Where the answer is "nothing within 400 m", say that explicitly.

If the place a reader names is not a label PRT uses — "Outer Chartiers" is not,
and neither are most corridor names people say out loud — the file should open
by saying so and stating what it was mapped to. Silently answering a slightly
different question is the failure mode here.
