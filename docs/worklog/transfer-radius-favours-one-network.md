# The synthesised transfer radius is not neutral between the two networks

**Observed:** neither feed publishes transfers, so the router invents them from
stop coordinates — and because the Refresh asks riders to transfer more than
today's network does, any value chosen for the transfer walk tilts the
before-and-after comparison in a direction that is not visible in the output.
**Where it stands:** open, decision owed by Max, and the ground under it moved
on 2026-08-22: the radius is no longer a radius. Walks are now routed on a
pedestrian network ([[walks-are-drawn-and-timed-in-straight-lines]]), so
`MAX_TRANSFER_WALK_M` is a *walking* distance, which deletes about a third of
the connections it used to admit. The flip count that made the headline
quotable has been re-measured under the routed method and **survives**: 1
material flip of 337 comparable pairs, against 1 of 343 before.

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
- **Report the sensitivity, as convention 4 does for access distance.**
  Adopted, and it is what the Resolution below records: every pair is searched
  at a strict and a generous transfer radius, and what is reported is the count
  of pairs whose *direction* of change flips between the two, not just the
  spread. The test stated when this was written — near zero and the headline is
  safe, large and the flip count is the headline — is the one applied to the
  result.
- **Ask PRT what they assumed.** Not pursued. The plan's own service standards
  may state a transfer walking assumption, which would make this a sourced
  number rather than a chosen one — worth one question to PPT to relay, and it
  would settle the item outright.

*All three are agent judgements, not Max's decisions; a later session with
better information should feel free to overturn them.*

## What the pedestrian network changed here

The machinery survives; the numbers do not, and one part of the argument above
got sharper.

The sensitivity run still exists, `/api/journey` still carries both radii per
request, and `sign_flips` is still set where they disagree. What changed is
what a radius *means*. Since walks are routed rather than assumed,
`MAX_TRANSFER_WALK_M` is a distance along the ground: 48,320 of 70,430
candidate links on the current feed survive as a 400 m walk, so roughly a
third of the connections this entry worried about being too generous were
never makeable in the first place. That is a partial answer to the entry's own
question — some of the "invented connections nobody would make" have now been
identified and removed on evidence rather than by choosing a smaller constant.

It does not settle the entry, for two reasons. The remaining constant is still
untuned, and the asymmetry argument is unchanged: the Refresh leans on
transfers more, so deleting connections still hurts it more than it hurts
today's network. If anything the stake is higher, because the deletion is
large.

## Resolution

Open. The flip count under the routed method is **1 material flip (≥ 2.0 min
on the smaller side) out of 337 comparable pairs**, plus 9 noise-level flips
below that threshold — Hazelwood → Oakland, headline +2.2 min against strict
−2.0 min. By this entry's own test the published medians may still be quoted
with the transfer walk stated alongside them.

That the count barely moved while roughly a third of the candidate links
disappeared is itself worth noting: the connections the routing deleted were
mostly ones neither network's best itinerary depended on.

What is still owed is the constant, not the number: 400 m remains an untuned
judgement, now of a walking distance rather than a radius. The open question
is whether to ask PPT to relay it to PRT — the plan's service standards may
state a transfer walking assumption, which would make this sourced rather than
chosen and settle the entry outright.
