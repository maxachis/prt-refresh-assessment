# The service map has findings nothing publishes

**Observed:** `analyze_place_service.py` produces per-place results that no
`docs/answers/` page, no `FINDINGS.md` section and no BASE_CAMP question ID
currently carries — most sharply, that seven named places lose their last
weekday bus and four of them have no rail either.
**Where it stands:** open, and it is a decision for Max, not a defect. The
measure exists and the app draws it; whether it becomes a published answer,
and under which question, has not been decided.

## What is observed

Built 2026-08-31 to colour the Places choropleth by service rather than by
residents. It counts bus trips touching each named place, per day type, on
both networks (`data/place_service_change.csv`, 555 place-days). Convention 16
in `CLAUDE.md` records the method.

The results are not small, and some are quotable in a way nothing else on the
site is:

| weekday | places |
|---|---|
| lose their last bus | 7 |
| …of which no rail either | 4 — Chartiers City, Reserve township, Trafford borough, Upper St. Clair |
| …of which a train still calls | 3 — Bethel Park, Bon Air, South Park township |
| gain a first bus | 1 — Pine township, 0 → 19 trips |
| gain service | 97 |
| lose service | 82 |

Reserve township is the case that lines up across every unit this repo has:
85.1% of its residents lose all buses (the highest share in the county), its
bus service goes 56 → 0, and it has no rail. Nothing else in the repo says all
three of those things about one place in one place.

## Why it matters, and why it might not

It matters because "this borough loses every bus it has and has no train"
is the most directly testifiable sentence the project has produced, and it is
currently reachable only by hovering a map.

It might not, for a reason worth stating before anyone quotes it: **service
touching a place is not access to it.** A bus grazing one corner of a township
counts the same as one running its length, so a place can read as well served
on this measure while most of its residents are nowhere near the route. That
is convention 16's third rule and convention 10's "never quote one alone",
and it is why this was built as a map layer rather than a headline. Reserve
township survives the objection because the coverage answer agrees with it
independently; a place where only this measure fires would not.

## The decision owed

1. Does this get a BASE_CAMP question ID, or stay an app-only layer? The
   existing IDs are about coverage, one-seat rides and travel time; none of
   them asks "how much service does this place have".
2. If it is published, the seven-places finding needs the rail column beside
   it in the same table, every time. Publishing the count without the flag
   would say Bethel Park loses its transit, which is false.

## Approaches considered

**Fold it into `COVERAGE-CHANGE` — rejected by the agent.** Coverage is
measured at residents' locations with a walk radius; this is measured at the
place boundary with none. Putting them under one question would invite exactly
the substitution the method forbids.

**Publish nothing and leave it as a map layer — not rejected, just not
chosen.** This is the status quo and may be right; the layer is honest about
its own limits in the legend and tooltip. Recording it so the choice is
visible rather than defaulted into.
