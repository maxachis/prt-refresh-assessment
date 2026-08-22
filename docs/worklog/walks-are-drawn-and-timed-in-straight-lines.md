# A walk is drawn — and timed — straight through the blocks

**Observed:** the travel-time view draws every walk leg as a straight line
between two points, so a 570 m walk out of the Strip District crosses the
Allegheny valley, Bigelow Boulevard and the busway on a diagonal no pedestrian
can take; the same straight line is what the clock charges the rider for.
**Where it stands:** open, decision owed by Max. The drawing is deliberate and
labelled; whether the *timing* should keep assuming straight-line walking is
the real question, and answering it needs a pedestrian street network this repo
does not have.

## What a reader sees

Time a weekday morning trip from `40.46106, -79.95775` (Lawrenceville) to
`40.4443, -79.9837` (Crawford-Roberts):

```bash
curl -s "http://127.0.0.1:8000/api/journey?lat=40.461060&lon=-79.957750\
&dest_lat=40.444300&dest_lon=-79.983700&day=weekday"
```

Both networks ride the 87 down Liberty Avenue and then walk into the Hill
District. The rides now follow the street the bus drives; the walks are two
long dashes cutting across a river valley, a limited-access boulevard and a
rail corridor. Max raised this on 2026-08-22 as the first of three
observations, and it is the one a reader is most likely to notice, because at
the Hill District end the walk is longer on screen than the part of the ride
that fits in the same view.

## Why it is like this

`journey.py` has no street network. Access, egress and transfer walks are all
`metres_between(a, b) / WALK_SPEED_M_PER_MIN` — a straight-line distance at a
constant speed — and `query.itinerary_of` gives a walk leg no `path`, so
`frontend/journey.ts` falls back to the two-point line. The dashes and the
legend ("dashed sections are walks, drawn straight") say so on screen.

The drawing is defensible on its own: a dashed straight line reads as "there is
a walk here", not as "walk down this street". The timing is the part that is
not obviously defensible. Pittsburgh is the worst American city in which to
assume a straight-line walk — hillsides, rivers, a busway, and public stairways
that are the actual route — so the error is not a uniform underestimate; it is
near zero in the Strip District grid and very large on the North Side slopes.

Whether it *biases the comparison* is a separate question, and probably the
important one. Both networks are walked the same way, so a symmetric
underestimate cancels in the change figure. It stops cancelling where the two
networks put a rider on different sides of a barrier — which is precisely what
a network redesign does.

## Approaches considered

- **Route the walk on an OSM pedestrian network.** The honest fix, and a large
  one: a sixth upstream source, a graph build, and a snapping problem at every
  stop. It would also end the "no third-party packages" property of the
  pipeline unless the graph were built by hand from an OSM extract.
- **Apply a detour factor** (multiply straight-line distance by ~1.3, the usual
  urban circuity constant). Cheap, and it would make every walk time closer on
  average — but it is a single number applied to a city whose circuity varies
  from 1.0 to unbounded, and it would put a *sourced-looking* number on screen
  that is no better informed than the current one at any specific pair.
- **Draw walks on the street while still timing them straight.** Rejected:
  drawing a route the clock does not charge for is worse than drawing an
  obviously schematic line. The dash is currently honest.
- **Leave it, and say so louder.** What ships today.

*All four are agent judgements, not Max's decisions; a later session should
feel free to overturn them.*

## Resolution

Open. Related: [[one-point-cannot-represent-a-township]] is the same class of
problem one unit up — a geometry assumption that is fine in aggregate and
wrong at a specific point a reader can pin — and
[[the-last-walk-doglegs-via-a-stop-nobody-boards]] is a second walk defect
visible in the same itinerary.
