# A new stop the plan adds usually draws no dot of its own

400 of the 521 stops the Refresh adds had nothing in the Locations view at
their own kerb, because a proposed stop earns a dot only where nothing stops
within 400 m today. Three readers took that bare ground as the plan's new
service missing from the data.

Fixed, awaiting close. The threshold that decides whether a proposed stop is
its own place to measure is now 150 m rather than the walk radius, so the dot
appears at the stop and its colour says what changes there, and the dot carries
a ring saying no stop stands there today. A separate inventory layer of blue
rings was built first, on 2026-09-08, and removed the same day when the better
fix was found.

## What was happening

*This section describes the behaviour before 2026-09-08. The last column is
what the same stops draw now.*

The point set is `query.change_points`: every stop a bus calls at today, plus
proposed stops with no current stop of their own nearby. "Nearby" was
`PRIMARY_RADIUS`, the walk radius — see "What was built" below for why that
turned out to be the defect rather than the design.

The consequence was that infill is drawn as a **colour change on the
neighbouring dot**, with the new stop's own kerb left bare. Which of the two a
new stop got was decided by a straight-line distance to the nearest current
stop, so it turned on tens of metres:

| Proposed stop | Nearest current stop | Own dot at 400 m | at 150 m |
|---|---|---|---|
| Forsythe Rd opp Woodridge Dr | 697 m | yes | yes |
| Forsythe Rd + Woodridge Dr | 685 m | yes | yes |
| Forsythe Rd + Swallow Hill Rd | 337 m | no | yes |
| McMonagle Ave + N Meadowcroft Ave (both kerbs) | 388 m, 393 m | no | yes |
| McMonagle Ave + Banksville Rd (both kerbs) | 29 m, 39 m | no | no |
| McFarland Rd + Dell Ave (both kerbs) | 226 m, 251 m | no | yes |

That table is the consultant's report exactly: the Forsythe pair drew blue
without being clicked, the McMonagle stops on the same route did not, and the
McMonagle/Meadowcroft pair missed the threshold by 7 and 12 metres. The one
row still reading "no" is the pair 29 and 39 m from a stop on Banksville Road,
which genuinely is the same corner — that is the identity rule working, not
failing.

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
compete with the absence of a mark on the street the reader is looking at.

The sentence that stood here — that the reader's question is a stop-level one
"the Locations view is not answering and cannot be made to answer without
breaking what it does measure" — was **wrong in its second half**, and believing
it is what produced the ring layer instead of the fix. The Locations view can
answer it, because a stop the plan adds where no stop stands *is* a location,
and saying so breaks nothing it measures.

## What was built, and what replaced it

**First, an inventory layer** (b12f9e2, 81db1f2): `query.added_stops` served
the proposed feed's stops absent from the current one and `frontend/added.ts`
drew them as unfilled blue rings above the dots, switched from a row of the
key. It answered the complaint — the stops became visible — at the cost of
putting two units in one view, a locational criterion and a stop criterion side
by side, sharing a colour and separated only by shape.

**Then the threshold itself.** Max read the ring layer back and named the cost:
"technically resolves this, but now mixes locational criterion with stop
criterion." That reframing is what found the real defect. The 400 m in
`change_points` was doing two different jobs under one number — *access*, how
far a rider will walk, and *identity*, whether a pole is a distinct place to
measure — and only the first had ever been argued. The identity rule had simply
inherited the walk distance.

`query.UNIVERSE_DEDUP_M` now names it and sets it to **150 m**, convention 4's
strict same-corner test, which is the radius the identity question was written
for. The rings were removed entirely.

What the map does now at McMonagle: two dots appear where there were none,
coloured `doubled` — 20 weekday buses within a quarter mile becoming 45. That
is a true reading, drawn where the reader was looking, in the unit the view
already uses.

Measured before the change was made:

| Identity radius | New-coverage points |
|---|---:|
| 400 m (was) | 121 |
| 300 m | 152 |
| 250 m | 179 |
| 200 m | 217 |
| 150 m (is) | 260 |

Of the 139 points added, 105 sit on ground gaining service, 19 unchanged, and
**15 are losing it** — new poles on corridors the plan is thinning. The ring
layer drew those 15 as an unqualified gain; the dots read them correctly.
`test_new_coverage_points_are_not_all_a_gain` pins that the set can never be
read as the plan's gains.

Renumbering needs no special case any more. A renumbered stop stands at the
same pole as the current id it replaces, so a current stop is within 150 m of
it and it is not a new place. The 25 m rule and its 14 exclusions went with
`added_stops`.

> Max decided both on 2026-09-08: adopt the 150 m identity radius, and get rid
> of the rings.

**Then a third round, because the 400 m view still said nothing.** Max checked
the fix at both radii and found the remaining hole: at 150 m the new stops read
as new, at 400 m they did not. The rings had been the only thing separating "a
new pole" from "a stop that exists today", and removing them left the colour to
carry that on its own. At 150 m the colour appears to manage it — 260 of the
261 dots in the blue `new` bucket on a weekday are exactly the unpublished
points — but that is a coincidence of the two rules agreeing at one radius, not
a signal. At 400 m the same places sit in `more` or `doubled` with nothing to
mark them, which is precisely the view the consultant read McMonagle Avenue in.

So the ring came back, in the one place it costs nothing: **on the dot itself**,
not as a layer of its own. `published = 0` draws a detached outline round the
dot, which is one channel rather than a second unit, is the same mark at 400 m
and 150 m, and cannot be read as a separate inventory because there is nothing
underneath it to double-count. It follows the bucket filter, so a ring is never
left round a dot the reader has switched off, and its standoff scales with the
dot — a fixed one made 260 of 6,544 points the loudest mark on a county-wide
map whose subject is the other 6,284.

The key carries it as a swatch rather than a sentence: a ring, the label **New
stop location**, and the count in view, below the coloured rows and behind a
rule. Prose was where it started, and Max moved it — "let's have it so the ring
is viewable in the legend, rather than something mentioned in the description."
It is a key line, not a switch, because the ring annotates dots that stay on
screen and there is nothing for it to filter; and it disappears at zero rather
than sitting there as a row, because unlike the buckets above it there is no
"cannot happen here" reading to protect.

The label took three goes on 2026-09-08, and the two that failed both failed
for reasons worth keeping. **"New stop under Refresh"** overreaches: two of the
points are existing poles the plan moved more than 150 m, which are new
*places* without being new *stops*. **"New stop location"** collides with the
`new` bucket printed four rows above it. Those two marks answer different
questions — the bucket asks whether any bus comes within the walk radius, the
ring whether any pole stands within 150 m — but at 400 m the blue set is
strictly *inside* the ringed set (121 of 260), so the key offered a reader two
nested categories both called "new" and no way to tell which was which. Max
found that at Millvale's Grant Avenue, where five ringed dots read `more` and
`doubled` because today's buses pass a block away on Evergreen Avenue and East
Ohio Street while nothing stops on Grant itself.

> Max chose **"no stop here today"** on 2026-09-08: name the test the ring
> applies, and leave "new" to the bucket that is a published criterion.

What is still not marked: the 263 stops the plan adds at corners that already
have one. They change a dot's colour and nothing else, by design — that is
convention 2, and the footnote says so. A reader who wants the pole inventory
rather than the access change is not served by this view at all, and the
question of whether the site should answer that at all is still open.

## The cost that was accepted

At 400 m a new-coverage point could not fall inside a published point's circle,
which made the in-view key a partition of the ground. At 150 m it can, so
`change.countIn` may count overlapping ground under two identities. This is
convention 2's warning, and it is now a real exposure rather than a structural
impossibility.

It was weighed against the invisibility — 400 stops drawing no mark, reported
three times from outside — and the invisibility was judged worse. The trade is
written beside the constant so the next reader meets it before changing the
number.

`test_unpublished_points_have_no_bus_within_the_headline_radius` asserted the
old impossibility directly and had to be retired. Its replacement,
`test_unpublished_points_have_no_stop_of_their_own_today`, asserts the identity
rule that actually builds the set, and says in its own docstring why the
stronger claim is gone.

## The correction worth keeping

This entry previously rejected "widen the point set so every new stop earns a
dot" on the grounds that the published bucket counts are measured over that set
and would be restated. **That reasoning was wrong**, and it is what kept the
real fix out of reach for a day. Published counts filter on `published = 1`
(`tests/test_query.py`), and every point the identity radius governs is
`published = 0`; the weekday buckets at 400 m read 633/298/1420/1583/2113/237
before and after the change, verified by rebuild.

The shape of the error: a constraint that was true of *one* point set —
convention 4's, which really is fixed and really does have to stay comparable
across radii — was carried over to a different set that merely sits in the same
table, without checking which filter the published numbers actually use. The
second rejected approach ("shrink the selection radius") was closer to right
than its own reasoning allowed, and was dismissed as "moving an arbitrary
threshold" when the point was that the threshold had never been argued at all.

The remaining rejected approach stands:

- **Leave it at the key** (wording only). That was the state this entry was
  opened against, and the third report is the evidence against it.
