# A pole the plan drops quietly has no mark of its own

434 poles that ran today were dropped by the plan without being crossed out,
because a proposed stop stood within 150 m of them — so they drew as ordinary
coloured dots, and the only thing distinguishing them from their neighbours was
a golden ring that wasn't there.
Fixed, awaiting close: Max ruled on 2026-09-10 that a retired pole is a removal
however near the plan stops, and the cross now asks at the same 25 m the
added-stop ring asks at. The countywide removal figure moves 972 → 1,308.

## What was observed

> Max, 2026-09-10, at Lincoln Avenue in West View
> (`?view=dots&radius=400&at=40.49357,-80.04924`): "some dots appear to have the
> golden circle while other dots right next to them and with the same labels do
> not. Why?"

The reading was correct and every mark on screen was true. With the pin down,
nine of the eleven stops inside the walk radius carried the proposed mark; two
did not:

| Stop | Ring? | Crossed then? | Weekday bucket at 400 m | Nearest stop the plan serves |
|---|---|---|---|---|
| 1671 GRANT ST + WASHINGTON FS | yes | no | about the same, 203 → 213 | itself, 0 m |
| **1670 GRANT ST + DAVIS** | **no** | no | about the same, 203 → 213 | KENDALL AVE + DAVIS, 95 m |
| **1672 GRANT ST + LINCOLN** | **no** | no | about the same, 205 → 213 | LINCOLN AVE + BRYANT AVE FS, 74 m |

Both are genuinely retired: the ids are absent from the proposed feed and no
pole stands on either kerb. They were not crossed, because the cross then meant
*no bus near here any more* — `query.is_removed_stop` asked at 150 m and the
plan serves a stop 95 m and 74 m away. Their colour is the walk radius's answer,
which has not moved. So three separate statements were each true — the colour,
the absent cross, the absent ring — and the third was the only one carrying the
fact the reader was looking at, with nothing on screen saying so. Their hover
text was word-for-word what 1671's is. **Both now carry a cross.**

What made them unlike the crossed stops is that **the route is not going
anywhere**. The 19L (Emsworth Limited, becoming the Emsworth Flyer) is the only
route calling at either — six PM-peak outbound departures on a weekday — and it
still runs Grant Street in the plan, calling at GRANT ST + JEFFERSON, GRANT ST
+ WASHINGTON FS and GRANT ST + LAUREL, and gaining a trip countywide (13
weekday trips today, 14 proposed). PRT is thinning the poles on a corridor it
keeps: a rider at Davis walks 99 m up Grant to Washington for the same bus.
That reading survives the fix — it is now a cross on a dot coloured "about the
same", which is two true sentences about one corner rather than one sentence
told by an absence.

## How many were in this position

Countywide, of the 1,406 ids that run today and are absent from the plan:

- **972** drew a cross — nothing proposed within 150 m.
- **434** drew nothing — the quiet drops. By distance to the nearest stop the
  plan serves: 4 under 5 m, 94 at 5–25 m, 89 at 25–50 m, 115 at 50–100 m, 132
  at 100–150 m.

The 98 inside 25 m are kerbs PRT renumbered, and they already read as two marks
a few metres apart — the pin key's "two marks with no line are a renumbering"
covers them. **The 336 beyond 25 m were the exposure**: far enough that the
missing ring was plainly a gap rather than a pair, close enough that no cross
appeared. Those 336 are what the fix crossed.

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

That splits the 434 quiet drops in two, and the larger half was the honest
no-line case:

| | Count | What the map draws |
|---|---|---|
| Id retired, everything nearby already ran today | **376** | a cross since the fix; still no line — nothing to pair with |
| Id retired, an id new to the plan stands nearby | 58 | a cross where that id is more than 25 m off; two marks and no line where it is closer |
| Id kept, pole moved more than 5 m | 225 | both marks and a dashed leader |

Both West View stops are in the first row. The leader question is settled and
stays settled: the fix gives these poles a mark of their own, it does not
invent a pairing.

## How it was settled

> Max, 2026-09-10: "No, if it's a retired stop that is not simply moved, it
> should be marked as removed. The user can infer a nearby stop by looking at
> the map."

That is a ruling on the *rule*, not on the drawing, and it overturned the agent's
recommendation (a hover line, the last bullet below). `query.is_removed_stop`
is again the exact mirror of `is_new_place`, both asking at
`STOP_SAME_POLE_M` — 25 m, the same kerb. The plan still stopping on this kerb
is what spares a pole its cross, symmetric with a bus already stopping on a kerb
being what stops the plan's stop there reading as an addition.

What moved:

| | Before | After |
|---|---|---|
| Stops the plan removes | 972 | **1,308** |
| Retired ids spared as renumberings | 434 | 98 |
| Removals with a replacement within a 400 m walk | 245 | 578 |
| …within 800 m | 193 | 194 |
| …stranded, nothing inside an 800 m walk | 534 | 536 |
| Removals sitting in a bucket other than "loses all service" (weekday, 400 m) | 339 | 675 |
| Corners drawing a cross and a ring at once | 0 | 0 |

The collision worry that had kept the two distances apart did not materialise:
with one threshold, a renumbered kerb has a proposed pole within 25 m (no cross)
*and* a current pole within 25 m (no ring), so both marks go quiet together and
the count is zero by construction rather than by a gap between two constants.
`tests/test_query.py::test_no_corner_is_both_removed_and_added` pins it.

`UNIVERSE_DEDUP_M` had no callers left after this and was deleted; the identity
question the marks ask is now `STOP_SAME_POLE_M`'s alone.

**1,308 is a quotable figure and it has changed.** It appears in the map's key
at every scope, in `docs/WEBAPP.md`, and in this directory. Nothing has been
deployed with it.

## Approaches considered

- **Fold the quiet drops into the cross (taken — Max's ruling).** The map now
  says "the plan takes this stop away" of every retired pole the plan does not
  re-serve on the same kerb, and leaves the reader to see the surviving stop
  nearby, which is drawn.
- **Say nothing; explain it in the pin key** — where this stood. Cheapest, and
  it did nothing for a reader who does not click a pin, since the ring only
  exists while one is down.
- **A third mark: "the plan moves this stop"** (agent's suggestion, not put to
  Max). Honest and symmetric with the other two, and it would show without a
  pin. The cost was a third mark on a key Max has twice asked to shorten, and it
  needed a distance in its label or it claimed more than the data supports.
- **Leave the mark alone and put the fact in the hover** — the agent's
  recommendation, **rejected by Max**. Narrower than a new mark, and invisible
  until pointed at, which was both the merit and the limit.
- **Fold them in and print the replacement distance on the cross row** —
  rejected by the agent at the time on the grounds that the cross row would
  become unquotable. Overtaken: the row already carries the countywide walk
  split ("578 have another stop within a 400 m walk…"), which is that objection
  answered rather than avoided.

Related: [`consolidation-is-not-counted-apart-from-loss.md`](consolidation-is-not-counted-apart-from-loss.md)
is the same poles as a *counting* question — the map now counts the split, the
published CSV and the answer documents still do not, and that entry stays open.
