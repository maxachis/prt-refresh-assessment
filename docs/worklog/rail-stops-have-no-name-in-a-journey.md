# A T station reads as a bare number in a drawn itinerary

**Observed:** a journey that uses the T shows its rail stops as ids — "ride RED
10 min to stop 99998" — because the only stop-name table in the serving
database is bus-only, and the journey layer that counts rail was deliberately
kept out of it.
**Where it stands:** open, defect deliberately not fixed. The travel-time view
ships with the id shown as an id rather than as a bare number; the fix is a
column in `journey_stop` and is not a frontend change.

## What a reader sees

Pick a South Hills origin and Downtown as the destination in the **Travel
time** view, and the proposed itinerary reads:

```
walk 1 min   to stop 99997
ride RED 10 min  to stop 99998
```

Bus legs in the same itinerary name their stops ("to BLVD OF ALLIES + CHERRY
WAY FS"), so the rail legs read as missing data rather than as a different
class of stop.

## Why it is like this

`query.stop_names` looks names up in `stops`, which `build_webdb.py` fills from
`gtfs.load_service` — bus only, because every published service figure on this
site excludes the T and the inclines. Convention 13 keeps the rail-carrying
tables (`journey_stop`, `reach_stop`, `point_reach`) separate precisely so that
widening the universe for a connectivity or travel-time question can never
widen it under a service number. `journey_stop` therefore holds `stop_id`, `lat`
and `lon` and nothing else, and coordinates are all an itinerary can place.

The separation is right; the missing column is an oversight rather than a
consequence of it. A **name** is not a quantity of service, so carrying rail
names in `journey_stop` would not put a rail trip inside any published figure —
the leak convention 13 forbids is a rail trip counted as service, not a rail
station named on screen.

## Why it matters, and why it might not

It is cosmetic in the sense that no number is wrong. It is not cosmetic in the
sense that the South Hills is exactly where the T carries the trips the buses
do not, so the itineraries most likely to hit this are the ones where rail is
the whole point of the answer — and an unlabelled leg is the one a reader would
most want to check.

## Approaches considered

- **Join `stops` for rail too.** Rejected: `stops` is the bus-only service
  table by construction, and widening it is the leak convention 13 exists to
  prevent.
- **Add a `name` column to `journey_stop`.** The fix. `gtfs.load_patterns`
  already reads the feeds' `stops.txt`, so the name is in hand at build time;
  the cost is a column on ~14,000 rows per side and a rebuild of `refresh.db`.
  Not done here because this was a frontend task and a schema change is not a
  frontend change.
- **Label unnamed stops by mode instead ("a station on the RED line").** Not
  pursued: the route is already on the leg, and inventing a phrase where a real
  name exists in the feed is worse than showing the id.

*All three are agent judgements, not Max's decisions; a later session should
feel free to overturn them.*

## Resolution

Open. Mitigated only: `frontend/journey.ts` renders an unnamed stop as
`stop <id>` rather than as a bare number, so a reader can tell an id from a
name. The real fix is the `journey_stop` column above.
