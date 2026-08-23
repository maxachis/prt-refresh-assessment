# A stairway is timed as though it were level ground

**Observed:** the pedestrian network now routes riders up Pittsburgh's public
stairways, which is right — on the slopes they are the only route — but it
charges them 80 m/min of horizontal distance, the same as a flat sidewalk, and
counts no vertical rise at all.
**Where it stands:** open, decision owed by Max. Newly created by the walk
routing that landed 2026-08-22; nothing was wrong here before, because before
that no walk followed a stairway.

## What is happening

`journey.WALK_SPEED_M_PER_MIN = 80.0` is described in its own comment as "an
unhurried adult walking pace", and it is a fair one for level ground. Every
walk distance now comes from `refresh.walking`, whose graph deliberately
includes `highway=steps` — see `ingest_osm_walk.py`, which keeps them on the
grounds that dropping them "would make the North Side and Hazelwood read as
unwalkable".

Both halves of that are defensible and they do not compose. The extract has no
elevation in it: Overpass `out skel` returns latitude and longitude and
nothing else, so a 60 m run of steps climbing 25 m is indistinguishable from
60 m of pavement, and the router bills both at 45 seconds. A person climbing
that flight takes two to three minutes.

## Why it matters

The error is not uniform, and it concentrates exactly where the routing work
was most needed. A trip in the Strip District grid is unaffected — there are
no steps in it. A trip on the North Side slopes, in Hazelwood, in Beechview or
up from the Mon flats is understated, and those are the places where the
straight-line assumption was already worst. So the layer went from "wrong
everywhere on the slopes" to "right about the route and optimistic about the
time on the slopes", which is better but is not the same as right.

Whether it **biases the comparison** is the question that decides how much it
matters, and the answer is probably less than it first appears: both networks
are walked over the same ground at the same speed, so a shared optimism
largely cancels in the change figure. It stops cancelling where the two
networks put a rider on opposite sides of a hillside — which, as with every
other geometry assumption in this layer, is precisely what a network redesign
does.

## Approaches considered

- **Fetch elevation and apply a slope penalty** (Tobler's hiking function, or
  the simpler Naismith rule: add a fixed time per unit of climb). The honest
  fix. It needs a seventh upstream source — a DEM, or OSM's sparse `ele` tags,
  which are far too sparse for this — and a per-node elevation lookup over a
  million nodes. Large.
- **Charge `highway=steps` a flat penalty per metre.** Cheap and much better
  than nothing: steps are tagged in the extract even though elevation is not,
  so the multiplier could be applied at build time with no new source. It puts
  a chosen constant on screen, which is the objection that killed the detour
  factor in [[walks-are-drawn-and-timed-in-straight-lines]] — but the
  situation is not the same. There the constant would have stood in for a
  route that is now actually known; here it would stand in for a gradient that
  is genuinely unknown, and applying it *only to ways tagged as steps* is far
  better targeted than a city-wide circuity factor.
- **Exclude steps from the network.** Rejected: it would route riders around
  the only connection that exists in the places this matters most, and would
  reintroduce enormous phantom detours on the slopes.
- **Leave it, and say so.** What ships today, and the reason this entry exists
  rather than a commit.

*All agent judgements, not Max's decisions.*

## Resolution

Open. Related: [[walks-are-drawn-and-timed-in-straight-lines]] is what created
this, and its own "known approximations" are the ones to read alongside it.
