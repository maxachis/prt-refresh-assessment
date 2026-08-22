# The synthesised transfer radius is not neutral between the two networks

**Observed:** neither feed publishes transfers, so the router invents them from
stop coordinates — and because the Refresh asks riders to transfer more than
today's network does, any value chosen for the transfer walk tilts the
before-and-after comparison in a direction that is not visible in the output.
**Where it stands:** open, decision owed by Max. The router ships with a
published 400 m and no sensitivity run yet, which is the weaker half of
convention 4.

## What is being decided

`journey.MAX_TRANSFER_WALK_M` — how far a rider will walk between two stops for
a connection — together with `MIN_TRANSFER_BUFFER_MIN` and the walking speed.
All three are in `journey.CONSTANTS` so a finding can quote them, which is
necessary and is not sufficient.

## Why it is not a symmetric choice

The naive reading is that an arbitrary constant applied identically to both
networks cancels out. It does not, because **the two networks do not depend on
transfers equally**. The Refresh is a ridership-over-coverage redesign: it
concentrates service on fewer corridors, which is precisely the trade that
converts some of today's one-seat rides into two-seat ones. The repo already
measures that conversion — it is what `analyze_one_seat.py` and the site's
one-seat layer exist to count.

So the error runs one way on each side:

- **Too generous** invents connections nobody would make. Invented connections
  can only help a network that requires more of them, so the Refresh comes out
  looking better than it is.
- **Too strict** discards connections riders really would make. Discarded
  connections can only hurt the network that requires more of them, so the
  Refresh comes out looking worse than it is.

There is no value that is neutral; there is only a value that is published
alongside the number it produced. A reader who is told "the median trip goes
from 35 to 41 minutes" and not told the transfer radius has been handed a
figure whose sign could move.

## Why this is worse here than for the radii already in the repo

Convention 4 already governs walk radius: 400 m headline, 150 m strict, and
where they disagree **both numbers are printed**. That convention exists for
access distance, where the sensitivity is a spread around one answer.

Here the sensitivity can cross zero. A transfer-dependent network compared at
two transfer radii does not merely get a wider or narrower margin; it can
change which network is faster for a given pair. That makes the sensitivity run
not a nice-to-have but the thing that decides whether the number may be quoted
at all.

## Evidence

- Neither `data/raw/current_gtfs.zip` nor `data/raw/proposed_gtfs/` contains
  `transfers.txt` — the reason the graph is synthesised at all
  (`journey._build_transfer_graph`).
- The constant was originally set to 400 m by an implementing agent as an
  untuned judgement, flagged as such by that agent rather than derived from
  anything. It is not traceable to a PRT assumption, a walking-distance
  literature value, or another number in this repo.
- The tests pin the *arithmetic* of the buffer and the radius
  (`tests/test_journey.py::test_a_transfer_needs_the_walk_and_the_buffer`) but
  cannot pin the values, because any positive value satisfies them. So nothing
  in CI will notice if these are wrong.

## Approaches considered

- **Pick a defensible single value and publish it.** Insufficient on its own,
  for the reason above: publishing a constant does not tell a reader whether
  the answer is robust to it.
- **Report the sensitivity, as convention 4 does for access distance.** The
  likely answer: run the published origin–destination sample at a strict and a
  generous transfer radius, and report the spread — and, more importantly,
  report the count of pairs whose *direction* of change flips between the two.
  If that count is near zero the headline is safe; if it is large the headline
  is the flip count, not the median.
- **Ask PRT what they assumed.** Not pursued. The plan's own service standards
  may state a transfer walking assumption, which would make this a sourced
  number rather than a chosen one — worth one question to PPT to relay, and it
  would settle the item outright.

*All three are agent judgements, not Max's decisions; a later session with
better information should feel free to overturn them.*

## Resolution

Open. The router is built and the constants are published; no sensitivity run
exists yet, and no number from this layer should be quoted publicly until one
does.
