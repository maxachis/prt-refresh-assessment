# A new stop the plan adds usually draws no dot of its own

414 of the 535 stops the Refresh adds have nothing in the Locations view at
their own kerb, because a proposed stop earns a dot only where nothing stops
within 400 m today. Three readers have now taken that bare ground as the plan's
new service missing from the data.

Fixed, awaiting close. The added stops are now a layer of their own — blue
rings over the dots, on by default in Locations and Both — after the wording
fix shipped for the second report (e07f592) failed to answer the third, which
came from a PRT consultant looking at the deployed build that contains it.

## What is happening

The point set is `query.change_points` (`src/refresh/query.py:511`): every stop
a bus calls at today, plus proposed stops with no current stop inside
`PRIMARY_RADIUS`. That is the right universe for a walk-access question — a
stop added 200 m from one that already exists changes how much service that
location has, not whether it has any — and it is the universe the published
bucket counts are measured over.

The consequence is that infill is drawn as a **colour change on the
neighbouring dot**, and the new stop's own kerb stays bare. Which of the two a
new stop gets is decided by a straight-line distance to the nearest current
stop, so it turns on tens of metres:

| Proposed stop | Nearest current stop | Own dot? |
|---|---|---|
| Forsythe Rd opp Woodridge Dr | 697 m | yes |
| Forsythe Rd + Woodridge Dr | 685 m | yes |
| Forsythe Rd + Swallow Hill Rd | 337 m | no |
| McMonagle Ave + N Meadowcroft Ave (both kerbs) | 388 m, 393 m | no |
| McMonagle Ave + Banksville Rd (both kerbs) | 29 m, 39 m | no |
| McFarland Rd + Dell Ave (both kerbs) | 226 m, 251 m | no |

That table is the consultant's report exactly: the Forsythe pair draws blue
without being clicked, the McMonagle stops on the same route do not, and the
McMonagle/Meadowcroft pair misses the threshold by 7 and 12 metres.

Reproduce:

```bash
python3 - <<'PY'
import sqlite3, sys; sys.path.insert(0, "src")
from refresh import query
con = sqlite3.connect("data/refresh.db"); con.row_factory = sqlite3.Row
cur = {r["stop_id"] for r in con.execute(
    "SELECT stop_id FROM stops WHERE side='current'")}
new = [r for r in con.execute(
    "SELECT stop_id, lat, lon FROM stops WHERE side='proposed'")
    if r["stop_id"] not in cur]
drawn = sum(1 for r in new
            if not query.stops_within(con, r["lat"], r["lon"], 400, "current"))
print(len(new), drawn, len(new) - drawn)   # 535 121 414
PY
```

## Nothing is measured wrong

The four McMonagle stops carry 19 weekday, 15 Saturday and 14 Sunday calls each
on route 34 in the proposed feed, and the gain reaches the map: the dot at
Banksville Rd + McMonagle reads 40 → 52 weekday trips (`more`) and 14 → 28 on a
Sunday (`doubled`). Streets draws McMonagle Avenue itself as `added`. The panel
names the new stops when the point is clicked. Every layer that should show the
gain shows it — except the one a reader scans first.

## Why the wording fix was not enough

e07f592 added a line to the Locations key: *"Dots mark the places a bus stops
today, plus the ground the plan adds a bus to where nothing stops within the
walk radius now. So a stop the plan adds beside one that already exists changes
a dot's colour rather than adding one. Streets colours the pavement itself, and
shows the rest."* It is in the deployed build
(`curl -s https://prt-refresh.lemaliconsulting.com/app.js | grep -c "changes a dot"`
→ 1, checked 2026-09-08).

The third report arrived against that build. A caveat under the key does not
compete with the absence of a mark on the street the reader is looking at, and
the reader's question — *where does the plan add stops?* — is a stop-level
question the Locations view is not answering and cannot be made to answer
without breaking what it does measure.

## What is not yet decided

Whether the map grows a way to see the added stops as stops. Sketch, for Max to
take or reject: a **thin layer of the proposed network's new stops**, drawn as
small open marks distinct from the change dots, off by default with its own
legend row, reading straight off `stops` where `side='proposed'` and the id is
absent from the current feed. It changes no measurement and enters no count —
convention 15's rule that a location the plan adds has no observed boardings
still holds, and these marks would carry no reading at all, only a name and its
scheduled calls on click.

Rejected here, by the agent, and re-openable:

- **Widen the point set so every new stop earns a dot.** Rejected because the
  bucket counts published in `docs/answers/` and on `/findings` are measured
  over this set, and because `change_points` selects at `PRIMARY_RADIUS` at
  every radius precisely so that 400 m and 150 m stay comparable; adding 414
  points would make the two radii measure different universes.
- **Shrink the selection radius so near-misses like Meadowcroft qualify.**
  Rejected because it moves an arbitrary threshold rather than removing the
  cliff — some stop is always 5 m the wrong side of it — and because that
  radius is convention 4's published quarter mile.
- **Leave it at the key.** That was the state this entry was opened against,
  and the third report is the evidence against it.

## What is still open

Whether the rings should be drawn in the **Streets** view too. They are not:
that view already draws the same gain as pavement, and the two marks would say
the same thing twice. But Streets is where the key sends a reader who wants
the rest of the gain, and arriving to no stops is its own small gap.
