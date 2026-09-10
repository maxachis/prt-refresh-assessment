# A new stop the plan adds usually draws no dot of its own

400 of the 521 stops the Refresh adds had nothing in the Locations view at
their own kerb, because a proposed stop earns a dot only where nothing stops
within 400 m today. Three readers took that bare ground as the plan's new
service missing from the data.

Fixed, awaiting close. The mark is no longer decided by a distance at all: it
asks whether the plan adds a POLE, so all 481 of the plan's added stops draw a
hollow dot keyed as "the plan adds a stop here", with no pin down and at every
zoom. The 150 m half-measure below narrowed the problem from 400 stops to 496
poles and did not close it; see **Two more narrowings, and then the unit
changed** at the bottom. Four drawings were tried on 2026-09-08 — a separate
blue rings layer, a ring on the coloured dot, a two-row key splitting new
service from new pole, and the hollow dot — and the first three are described
below because each failed for a reason worth keeping.

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

*The three paragraphs that follow describe the ring on the dot, which stood for
part of 2026-09-08 and is gone. Its reasoning survives it: the mark had to be a
channel on the dot rather than a layer of its own, and it had to be keyed as a
swatch. What it got wrong was leaving the bucket colour underneath — see "The
colour said one thing and the ring said another" below.*

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
> applies, and leave "new" to the bucket that is a published criterion. Made
> explicit as **"no stop within 150 m today"** at his prompting, then withdrawn
> the same day with the ring itself: the wording was accurate and the collision
> was never in the words.

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

## The colour said one thing and the ring said another

Max, 2026-09-08, on the ringed dots: *"you have 'New Stop Location' that is
also 'Doubled Or Better'. That seems incongruous, and likely to be confusing."*
It is, and the reason is not the wording. The two marks measure different
footprints — the colour counts every bus within a **quarter mile**, the ring is
about the **pole** — and the key named only one distance, so a reader met two
true statements that look like a contradiction and had no way to resolve it.
Millvale's Grant Avenue is the case that surfaced it: nothing stops on Grant
above East Ohio Street, but buses pass a block away, so five added poles read
`more` and `doubled` while claiming no stop stands there.

An earlier proposal from Max — drop the new-stop mark entirely and let those
dots simply be blue "new service" — was measured and rejected on the evidence:
blue is not the same set. On a Saturday at 400 m the `new` bucket holds 163
stops that stand today, on a Sunday 179, and at 150 m 174 and 190; even on a
weekday two published stops (Kohne St, Fisher St) are blue at 150 m. Merging
would have relabelled those as stops the plan adds.

> Max chose the separate category on 2026-09-08: take the added places out of
> the service buckets entirely, label the row **"the plan adds a stop here"**,
> and fold in the relocated-pole fix at the same time.

So a place the plan adds a stop to is no longer counted in `countIn` or
`sumRidersIn` and no longer takes a bucket colour. It has no service today to
compare against, which is exactly what the buckets compare; it is a category of
dot, not a seventh outcome. It gets its own key row, its own switch, and its
own place in the head line's total.

**What that gives up, stated rather than hidden.** Those dots no longer show
what happens to the buses within a walk of them. At 400 m on a weekday 137 of
the 258 would have been in `more`, `same`, `less` or `halved`, and 14 of those
sit where the plan is thinning service — Mt Royal Blvd opposite Ebonhurst Manor
goes from 42 weekday buses within a quarter mile to 10. Streets and the answer
panel still carry that reading. The trade is that it was never legible while it
contradicted the mark beside it.

## The eighth colour does not exist

The intended fix was a colour of its own, and it does not survive measurement.
Searching candidates inside the contrast band the ramp holds against Positron
(2.9–4.2), the best separation any of them reaches from all seven existing inks
— across normal vision and the three dichromacies, `frontend/cvd.ts` — is ΔE
14.6, where the ramp's own sign-crossing pairs are held to 40, and its nearest
neighbour is the `new` blue: the one dot it must never be confused with. Going
darker buys the separation (a near-black navy reaches 37.9) at 15:1 contrast,
which would make the plan's added stops the loudest mark on a map that also
shows 633 locations losing every bus. Overstating gains is the failure this
repo guards hardest against, so that was not available either.

The fill channel was free. A filled dot is a stop that stands today; a hollow
one — ink outline, no centre — is a stop the plan adds. It carries no position
on a loss–gain ramp and it survives every colour deficiency, because it is not
a colour.

## Two poles PRT moved, which the distance rule called new

`query.is_new_place` now asks PRT's stop id first and the 150 m distance
second. An agency keeping a stop's id is the agency saying "this is that stop",
which outranks a threshold that is only a guess about when two coordinates are
the same corner. Two stops disagreed, both relocations down the block: 20918
(Churchill Rd + Holland) at 152 m and 18627 (Hwy Rt 286 + Royal Oak Dr FS, now
Old Frankstown Rd) at 178 m. The point set is 258 added places rather than 260.

This is also the honest answer to a question Max asked on 2026-09-08 — whether
the site can identify when two poles are the *same stop*. It can for the 4,878
ids both feeds share (93% within 1 m). It infers it for 54 renumbered poles
within 25 m, where the names corroborate only 8. Between 25 and 150 m, 223
stops are *decided* rather than identified — the threshold is a convention, not
a measurement. And in the two cases above the id and the geometry disagreed
outright. Nothing on the map distinguishes an inference from an observation,
and nothing needs to for the access question it answers; anyone using this to
make a claim about individual poles should know which rung they are standing
on.

## Two more narrowings, and then the unit changed

Moving the threshold from 400 m to 150 m on 2026-09-08 took the invisible
stops from 400 to 496 poles (a different denominator: poles rather than the
521 added ids). It did not stop the reports. Max hit the same bare ground
three times on the morning of 2026-09-10 — Northview Heights, Millvale,
Homewood North — each time seeing the plan's stops appear only while a pin was
down, because until then the only place a proposed pole was drawn without a
dot of its own was inside a click's walk radius.

The first fix tried was another layer: every stop the plan runs, as a small
orange ring from street zoom up, switchable from the key. Max asked the
question that ended it — how is "every stop the plan runs" different from "the
plan adds a stop here"? — and then settled the underlying one.

> Max, 2026-09-10: "treat 'Stops added' as location-agnostic. Every stop on the
> map should be displayed, and those that are added should be labeled as 'the
> plan adds a stop here' and always displayed, regardless of pin. Get rid of
> 'Every stop the plan runs', which is confusing. Location as we've defined it
> is not relevant to the stop-by-stop view."

So `query.is_new_place` became a question about a pole: the plan's own stop id
first, then `STOP_SAME_POLE_M` (25 m) as convention 3's mirror and nothing
more — PRT renumbers 54 kerbs in place among the 535 ids new to the plan, 9 of
them within 10 m, and drawing those as additions would credit the plan with a
stop it is not adding. 481 added stops, and the point universe went from 6,542
locations to 6,765. No published figure moved: they filter on `published = 1`
and the weekday buckets at 400 m read 633/298/1420/1583/2113/237 either way.

Two consequences worth keeping. `is_removed_stop` deliberately **stopped
being the mirror** — it still asks at 150 m, and the asymmetry is what keeps 58
corners, three of them Downtown PRTX stations, from drawing a cross and an
added-stop mark at once. And overlapping ground is now routinely counted
twice by the in-view key, where at 400 m it could not be by construction;
that was accepted rather than solved.

The shape of the mistake, across all three narrowings: the map's unit of
analysis was inherited from the coverage question (a location, conventions 1
and 2) and applied to a view whose subject is the stop itself. Each move of
the threshold treated a symptom of that mismatch. The one line to flip if the
carve-out is ever unwanted is `query.STOP_SAME_POLE_M`; at 0 it would draw all
535.
