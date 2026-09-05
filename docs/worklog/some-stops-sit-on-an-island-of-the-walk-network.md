# 122 stops sit on an island of the walk network

**Observed:** 122 of the 6,922 stops in the two feeds snap onto disconnected
fragments of the OpenStreetMap pedestrian graph — from them no other stop is
reachable on foot at any bound, so every transfer through them is impossible and
every walk to them is `None`. Waterworks Mall (305 weekday boardings), First
Avenue Station (271) and Fourth Ave at PPG Entrance (169) are the largest.
**Where it stands:** open, not fixed — found 2026-09-01 while measuring walked
distances between the two stop inventories.

## Evidence

```python
# PYTHONPATH=.:src
import gtfs, ingest_osm_walk
from refresh import walking
net = walking.load(ingest_osm_walk.EXTRACT)
a = net.snap((40.440204, -80.003579))     # FOURTH AVE AT PPG ENTRANCE
dist, _ = net._settled_within(a, 800)     # -> 2 nodes settled
```

The stop snaps fine (5.3 m offset); it is the component behind the snap that is
two nodes long. Sweeping every stop in either feed and counting nodes settled
within 800 m: 0 stops fail to snap, and 122 settle fewer than 100 nodes,
carrying 1,034 weekday boardings between them.

## Why it matters

`refresh.walking` is the only source of walking distance for published travel
times (convention 14), and `MAX_TRANSFER_WALK_M` is a *walked* distance, so a
stop on an island can be connected to nothing. The bounded search returns
nothing rather than erring, and `journey.py` deliberately has no straight-line
fallback, so the effect is silent: an itinerary that should transfer at First
Avenue Station simply never appears, and a place whose only stop is one of these
reads as having no access at all rather than as a data gap.

The direction of the error is not neutral in the way routing generally is.
Routing can only make both networks look slower; an island removes a stop's
connections entirely, and if the island is on one network's side of a corridor
the pair's *sign* can move — the same failure mode as
[`transfer-radius-favours-one-network.md`](transfer-radius-favours-one-network.md).

## Where the fault probably is

Most likely upstream in OSM (a parking-aisle or plaza way tagged so the extract
keeps it but its connection to the street does not survive the pedestrian
filter in `ingest_osm_walk.py`), not in `walking.build`. Three of the biggest
four are a mall, a busway station and a plaza entrance, which is the profile of
a way whose only link to the sidewalk is through something filtered out —
`access=private`, or a road class a pedestrian may not use.

## Approaches considered

- **A straight-line fallback when the network returns nothing.** Rejected — it
  is precisely what `walking.py`'s docstring forbids, and it would restore the
  defect the module exists to remove in exactly the worst cases.
- **Snapping to the largest component within `MAX_SNAP_M` rather than the
  nearest node.** Not rejected; not tried. It fixes the symptom without touching
  the extract, at the cost of a stop being charged from a node up to 50 m away
  from where it is.
- **Widening the pedestrian filter to keep service roads and plazas.** Would
  need re-running `ingest_osm_walk.py`, which restates every published travel
  time against a moved upstream — the reason the 16 MB cache is committed.

Nothing here should be changed without re-running `analyze_travel_time.py` and
comparing the published profiles.
