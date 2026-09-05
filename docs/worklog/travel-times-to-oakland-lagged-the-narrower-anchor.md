# The published travel times to Oakland lagged a build behind the anchor

`data/trip_time_change.csv` and `data/trip_time_origins.csv` measure every trip
to Oakland against a destination 700 m north-east of the one the rest of the
repo now uses, because they were built before North Oakland was dropped from
the anchor. Rebuilt on 2026-09-05 — both files now aim at 40.439223,
-79.964103, carry a North Oakland origin, and pass
`tests/test_travel_time.py` — so this is fixed and awaiting Max's close.

> Max asked for North Oakland to stop counting as Oakland (2026-09-04); the
> narrowing itself is his decision, not an inference from the data.

## What is stale

`analyze_one_seat.ANCHORS["Oakland"]` is now West, Central and South Oakland.
Everything that reads it followed in the same change — `data/oneseat_change.csv`,
the answer documents, and `data/refresh.db`, whose Oakland district is 52 seed
stops centred at 40.439223, -79.964103.

`analyze_travel_time.py` reads the same constant, for the destination point it
searches to:

    grep -n "ANCHORS" analyze_travel_time.py     # line 199, anchor_destinations()

Its two published CSVs went one build behind: the 183 Oakland rows carried
`dest_lat, dest_lon = 40.443719, -79.958853` — the mean of the four
neighbourhoods' labelled stops, up by Craig St, about 700 m from the mean of
three — so every Oakland travel time was measured to a point the site no
longer called Oakland, and North Oakland itself was missing as an origin. The
re-run (21 minutes, not the hours the script's reputation suggests) fixed
both: 184 Oakland rows to 40.439223, -79.964103.

What it moved is small and one-directional, because the new destination sits
deeper in the core: the median Oakland trip is about a minute longer on both
networks (65.1 vs 64.1 current, 60.3 vs 58.4 proposed) and the median
before/after change barely shifts, -3.0 to -2.7 minutes. Eight places move by
more than 3 minutes; Homestead swings furthest, from -0.6 to -6.5.

Nothing is *wrong* on screen: the app's travel-time view takes its destination
from the rebuilt database (`destination.lat/lon`), so what a reader sees is
already the new point. The staleness is confined to the two CSVs and to
anything quoting them.

## Why the entry survives the fix

Two things worth keeping. First, the coupling that caught this is one test —
`test_the_published_pairs_match_oneseat_exactly` — and it catches a *missing
row*, not a moved destination point: had North Oakland not become an origin,
nothing in the suite would have noticed 183 travel times aimed at the wrong
Oakland. Anything that narrows or widens an anchor again should check the
destination coordinate against the built database by hand.

Second, `CLAUDE.md` bills this script as "hours, not minutes". It took 21
minutes on this machine, and that overstatement is why the re-run was nearly
deferred to another session.

## Resolution

    python3 analyze_travel_time.py    # 21 min; needs analyze_one_seat.py and
                                      # ingest_census.py to have run

Ran 2026-09-05. `data/trip_time_change.csv` is 370 rows again, its Oakland
half aimed at the same point `query.destinations()` reports out of
`data/refresh.db`, and `tests/test_travel_time.py` is 40 passed. Closing the
entry is Max's.
