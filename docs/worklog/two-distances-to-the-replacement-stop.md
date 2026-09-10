# Two distances to the replacement stop

The map now tells a reader how far the nearest surviving stop is as a **walk**;
`data/stop_service_change.csv` has always told them as a **straight line**, and
the two numbers differ at the same stop by a median 1.22×.
Open, decision owed: whether the published file should carry the walked figure
too, or whether the two labels are enough to keep them apart.

## What the two numbers are

`analyze_service_loss.py` writes `metres_to_nearest_proposed_stop` — the
straight-line distance from a stop that vanishes to the nearest stop the
proposal actually serves, the check convention 3 requires. It is computed on a
grid of proposed stops (`nearest_m`, `near_grid`) and needs nothing but the two
feeds.

`build_webdb.py:write_stop_fates` writes `stop_place.replacement_walk_m` — the
same question answered over the pedestrian network (`refresh.walking`), bounded
at an 800 m walk. The Stop-by-stop view's hover line and the answer panel's
"stops the plan removes" row both read it, and both say **walk**: "nearest stop
is a 189 m walk".

Since 2026-09-09 the hover also carries the straight line where the two diverge
sharply: `stop_place.nearest_straight_m`, printed as "; the nearest in a
straight line is 301 m" when the walk exceeds 1.5× it
(`change.STRAIGHT_LINE_NOTE_RATIO`). That number **is** the CSV's measurement —
nearest proposed stop as the crow flies — recomputed here and bounded at the
same 800 m the walk uses, so a reader who joins the two now meets the CSV's
figure on the map instead of only a walk that seems to contradict it. Note that
the two distances on one hover usually name **different stops**: the nearest
stop on foot is often not the nearest on the map, which is why the wording is
"the nearest in a straight line" rather than a parenthetical beside the walk.
This narrows the exposure below; it does not close the question.

At Fifth Avenue and Gist Street the two read 153 m and 189 m. Countywide the
routed walk is a median 1.22× its own straight line, with a tail past 4× where
a river, a rail cut or a hillside is in the way (convention 14).

## Why this is not simply a bug

Convention 14 already splits one radius in two on purpose: a **claim about how
far a rider will walk** is a walking distance, and a **published access radius
shared with every coverage number on the site** stays straight-line so one
point cannot read as served by one layer and unserved by another. The panel's
sentence is the first kind; the CSV column is closer to the second — it is the
audit trail behind "this stop's loss was checked against the nearest surviving
stop", not a claim about a rider's legs.

Both are labelled for what they are. The exposure is a reader who joins the CSV
to the map and finds the same stop carrying two figures, with nothing on either
surface saying why.

## Approaches considered

- **Change the CSV column to a walked distance.** Rejected by the agent, not by
  Max, and worth overturning if the audit trail matters more than the pipeline's
  independence: it would make a core pipeline script depend on
  `ingest_osm_walk.py`'s 16 MB cache and on a graph rebuild, which today only
  `analyze_travel_time.py` and the app require. It would also silently restate
  every published number in that column.
- **Add a second column beside it** (`walk_metres_to_nearest_proposed_stop`).
  The honest version, and the same dependency cost. Not done: it is a change to
  a published file inside the public-comment window, and Max has not asked for
  it.
- **Say nothing and rely on the two labels** — where this stands now. The map
  says "walk" in every sentence that carries the number; the CSV's column name
  says "metres to nearest proposed stop" and its docstring says straight line.

## What would settle it

Whether anyone is expected to read `stop_service_change.csv` beside the map. If
the CSV is the audit trail for convention 3 and nothing else, the straight line
is the right measure and the labels are enough. If it is meant to be quotable
about how far a rider has to go, it needs the walked figure and the dependency
that comes with it.
