# A pole the plan drops quietly has no mark of its own

434 poles that run today are dropped by the plan without being crossed out,
because a proposed stop stands within 150 m of them — so they draw as ordinary
coloured dots, and the only thing distinguishing them from their neighbours is
a golden ring that isn't there.
Open, decision owed: whether the absence of the ring should become a mark of
its own, and if so what it may claim.

## What was observed

> Max, 2026-09-10, at Lincoln Avenue in West View
> (`?view=dots&radius=400&at=40.49357,-80.04924`): "some dots appear to have the
> golden circle while other dots right next to them and with the same labels do
> not. Why?"

The reading is correct and every mark on screen is true. With the pin down,
nine of the eleven stops inside the walk radius carry the proposed mark; two do
not:

| Stop | Ring? | Crossed? | Weekday bucket at 400 m | Nearest stop the plan serves |
|---|---|---|---|---|
| 1671 GRANT ST + WASHINGTON FS | yes | no | about the same, 203 → 213 | itself, 0 m |
| **1670 GRANT ST + DAVIS** | **no** | no | about the same, 203 → 213 | KENDALL AVE + DAVIS, 95 m |
| **1672 GRANT ST + LINCOLN** | **no** | no | about the same, 205 → 213 | LINCOLN AVE + BRYANT AVE FS, 74 m |

Both are genuinely retired: the ids are absent from the proposed feed and no
pole stands on either kerb. They are not crossed, because the cross means *no
bus near here any more* (`query.is_removed_stop`) and the plan serves a stop
95 m and 74 m away; their colour is the walk radius's answer, which has not
moved. So three separate statements are each true — the colour, the absent
cross, the absent ring — and the third is the only one carrying the fact the
reader is looking at, with nothing on screen saying so. Their hover text is
word-for-word what 1671's is.

What makes them unlike the 972 crossed stops is that **the route is not going
anywhere**. The 19L (Emsworth Limited, becoming the Emsworth Flyer) is the only
route calling at either — six PM-peak outbound departures on a weekday — and it
still runs Grant Street in the plan, calling at GRANT ST + JEFFERSON, GRANT ST
+ WASHINGTON FS and GRANT ST + LAUREL, and gaining a trip countywide (13
weekday trips today, 14 proposed). PRT is thinning the poles on a corridor it
keeps: a rider at Davis walks 99 m up Grant to Washington for the same bus.

## How many are in this position

Countywide, of the 1,406 ids that run today and are absent from the plan:

- **972** draw a cross — nothing proposed within `UNIVERSE_DEDUP_M`.
- **434** draw nothing — the quiet drops. By distance to the nearest stop the
  plan serves: 4 under 5 m, 94 at 5–25 m, 89 at 25–50 m, 115 at 50–100 m, 132
  at 100–150 m.

The 98 inside 25 m are kerbs PRT renumbered, and they already read as two marks
a few metres apart — the pin key's "two marks with no line are a renumbering"
covers them. **The 336 beyond 25 m are the exposure**: far enough that the
missing ring is plainly a gap rather than a pair, close enough that no cross
appears.

> Those bands were first written as 53 / 61 / 116 / 204 with none under 5 m,
> which overstated every distance. `query.stops_within` returns its rows sorted
> by **stop id**, not by distance — convention 3's determinism rule, documented
> in the function — and the first pass read `rows[0]` as the nearest. The
> counts above it never depended on the order and did not move. The general
> lesson is the one worth keeping: in this repo a list of stops is ordered for
> reproducibility, never for proximity, so anything calling a stop "nearest"
> has to sort for itself.

## Why no dashed leader either

> Max, 2026-09-10: "Why don't these have dashed lines indicating they've been
> moved, as is the case with others?"

Because nothing was moved, and the map can only say so where a feed says so.
The leader (`query.moved_pole`, `mapview.movedLeaders`) is decided **by the
stop id alone**: PRT keeping an id is the agency stating "this is that stop",
and 225 poles countywide are kept and shifted more than `STOP_MOVED_M`. Those
get a line.

1670 and 1672 keep no id, so there is no pairing to draw — and here it is
weaker than that. Every stop the plan serves near either of them **already runs
today**: 1658, 1671 and 1669 around Davis; 1518, 1625, 1626 and 1519 around
Lincoln. Nothing appeared; something went. A line from Davis to Washington
would assert a relocation neither feed states, and would be wrong in substance
too — Washington is not a replacement, it is a stop that has been there all
along.

That splits the 434 quiet drops in two, and the larger half is the honest
no-line case:

| | Count | What the map draws |
|---|---|---|
| Id retired, everything nearby already ran today | **376** | one mark short, no line — nothing to pair with |
| Id retired, an id new to the plan stands nearby | 58 | two marks, no line — a renumbering the map can see but cannot prove |
| Id kept, pole moved more than 5 m | 225 | both marks and a dashed leader |

Both West View stops are in the first row. The pin key's "two marks with no
line are a renumbering" speaks only to the second, which is the smaller group;
the first has no sentence anywhere.

## Why this is not simply a bug

It is the deliberate asymmetry recorded in `query.is_removed_stop`, arrived at
on 2026-09-10 and load-bearing: the cross asks at 150 m while the added-stop
mark asks at 25 m, and that gap is what stops 58 corners drawing a cross and an
added-stop mark at once. Narrowing the cross to 25 m to give these 434 poles a
mark would re-create exactly that collision. Convention 3 is the other half —
a vanished stop id is not a lost bus, and a cross on all 1,406 would overstate
the removals by 45%.

So the gap is not in the rules; it is that the map has two marks (added,
removed) for a stop-level question with three answers, and the third answer is
currently spelled as the absence of a mark.

## Approaches considered

- **Say nothing; explain it in the pin key** — where this stands. The key
  already carries a note for the renumbering case, and one more clause would
  cover this one. Cheapest, and it does nothing for a reader who does not click
  a pin, since the ring only exists while one is down.
- **A third mark: "the plan moves this stop"** (agent's suggestion, not put to
  Max). Honest and symmetric with the other two, and it would show without a
  pin. The cost is a third mark on a key Max has twice asked to shorten, and it
  needs a distance in its label or it claims more than the data supports — no
  feed says 1672's service moved to 1625, only that one id went and another
  stands 74 m off.
- **Fold them into the cross and print the replacement distance** — rejected by
  the agent: the cross is defined as "no bus near here", 339 of the current 972
  already sit in radii the plan is strengthening, and adding 434 poles whose
  replacement is under 150 m would make the row unquotable.
- **Leave the mark alone and put the fact in the hover** — a line on those 434
  dots saying the id is retired and the nearest stop the plan serves is N m
  away. Narrower than a new mark, reuses `stop_place.replacement_walk_m`, and
  is invisible until pointed at, which is both the merit and the limit.

## What would settle it

Whether a reader needs to know a pole is going when the bus is not. If the
Stop-by-stop view's subject is the stop itself — which is what Max settled on
2026-09-10 in making the added-stop mark a pole question — then the symmetric
fact deserves a mark and this is a gap. If the view's job is to say what
happens to a rider's service, these 434 are correctly silent and the pin key
should say so in a clause.

Related: [`consolidation-is-not-counted-apart-from-loss.md`](consolidation-is-not-counted-apart-from-loss.md)
is the same 434 poles as a *counting* question — the map now counts the split,
the published CSV and the answer documents still do not. This entry is only
about whether they are drawn.
