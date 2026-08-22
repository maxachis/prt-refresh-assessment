# The last walk doglegs via a bus stop the rider never uses

**Observed:** a rider who gets off 568 m from their destination is routed on
foot to a bus stop 389 m away and then walks another 274 m from it — 663 m of
walking, and a visible bend on the map, to reach somewhere they could have
walked to directly.
**Where it stands:** open, decision owed by Max. It inflates both networks by
about the same minute, so the published *change* figures are near-unaffected;
the drawn itinerary and the absolute times are not.

## What is happening

The final walk can only start at a stop inside the destination's own access
radius. `journey.earliest_arrival` computes
`egress = tt.stop_grid.stops_within(dest, access_walk_m)` — 400 m — once, up
front, and a stop outside that set can never be the last alighting point. A
rider who alights further out therefore has to reach an egress stop the only
way the router knows: a stop-to-stop *transfer* walk.

Reproduced with the pair Max pinned on 2026-08-22, Lawrenceville to
Crawford-Roberts, weekday morning:

```
ride 87 to LIBERTY AVE + 17TH ST      40.449248, -79.985329
walk 5 min to BEDFORD AVE + DEVILLIERS 40.446551, -79.982401
walk 3 min to the destination          40.4443,   -79.9837
```

```
alight -> destination   568 m   (7.1 min, and nothing forbids it)
alight -> Bedford stop  389 m   (just inside MAX_TRANSFER_WALK_M)
Bedford stop -> dest    274 m
modelled total          663 m   8.3 min
```

Both networks do it here, via near-identical Bedford Avenue stops, so the
1.2 minutes lands on both sides of the comparison.

## Why it matters, and why it might not

The `change_min` figure — the one the panel leads with and the one
`analyze_travel_time.py` publishes — is a difference, so a penalty applied to
both sides largely cancels. What does not cancel:

- **The drawn trip.** A reader following the map sees a walk bend at a bus
  stop for no reason, right next to a legend claiming the dashes are walks.
  This is what Max was looking at when he asked why the walk went through the
  middle of blocks; it is a different defect from
  [[walks-are-drawn-and-timed-in-straight-lines]] and shows up in the same
  picture.
- **The absolute medians.** "23.3 minutes today" is quotable on its own and is
  over-stated by roughly a minute wherever the alighting stop is 400–800 m out.
- **The symmetry is not guaranteed.** It cancels when both networks alight at
  a similar distance. Where the Refresh moves a stop from just inside 400 m to
  just outside it, one side takes the dogleg and the other does not, and the
  penalty lands entirely on one network.

## Approaches considered

- **Let any reached stop walk directly to the destination**, capped at some
  final-walk maximum. The straightforward fix, and it changes published
  numbers in `data/trip_time_change.csv`, so it is a method change and not a
  bug fix — hence this entry rather than a commit. It also needs a stated cap:
  an uncapped final walk would let the router answer "walk 40 minutes" and
  call it a trip.
- **Raise `MAX_ACCESS_WALK_M`.** Rejected: 400 m is the site's published
  quarter-mile radius (convention 4) and is shared with every coverage number
  here. Moving it to fix a routing artifact would silently move the coverage
  answers with it.
- **Suppress the dogleg in the drawing only** — draw the last two walks as one
  straight line to the destination. Rejected: it would draw a walk shorter
  than the one the clock charges for, which is the same dishonesty as drawing
  a street route for a straight-line time.

*All three are agent judgements, not Max's decisions; a later session should
feel free to overturn them.*

## Resolution

Open. Nothing changed in the router.
