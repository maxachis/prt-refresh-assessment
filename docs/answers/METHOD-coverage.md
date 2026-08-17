# Method: days of service, coverage tiers, frequency change

Shared method for `LOSE-SERVICE-DAYS`, `GAIN-SERVICE-DAYS`, `COVERAGE-CHANGE`,
`STOP-LOST-SERVICE`, `LOSE-FREQUENCY-HALF`, `GAIN-FREQUENCY-DOUBLE` and
`STOP-ROUTE-REPLACE`. Full version in the `analyze_coverage_change.py` module
docstring, which is the primary method documentation.

## There is now a GTFS for the proposed network

`data/raw/proposed_gtfs/` is a real feed — `Future_BLR_Service-Weekday/-Sa/-Su`
calendars over 2027, 5,515 stops with coordinates, 14,488 trips, 698,865
`stop_times` rows, `feed_version` "Updated: Aug 11, 2026". Every answer here is
counted from it.

That matters because the rest of this repo predates it and derives proposed
service from the Frequency & Hours PDFs instead. Two things were wrong as a
result, and both changed answers:

1. **The S-variants had no geometry.** 29S, 53S, 55S, 69S, 78S and 89S are in
   the PDFs but absent from the Remix map, so a Remix-based analysis drops them
   entirely. They are exactly where weekend service on those corridors went: the
   55 is weekday-only in the proposal while the 55S runs 34 Saturday and 30
   Sunday trips. Reading route numbers alone turns Clairton and Glassport into
   total weekend losses the plan does not inflict.
2. **Frequency was divided, not counted.** Span ÷ published headway lands within
   **1.4%** of the feed system-wide (5,480 estimated vs 5,559 actual weekday
   trips, median per-route error 5.6%), but it doubles the peak-only limiteds —
   1L, 2L, 12L, 19L, 23L, 46L, 52L, 73L, 76L and 77L each run one peak
   direction, so applying a headway to both invents a return trip.

The PDFs are kept as a cross-check rather than discarded. On day types the two
sources now agree for all 95 routes present in both; before `ingest_blr.py`'s
column fix they did not (`DATA_SOURCES.md` trap 4).

## The unit of analysis is a location

Never route N versus route N: the plan re-splits corridors, so route-to-route
deltas are meaningless. Each of the 5,751 locations is a stop served today that
carries a PRT ridership record, and **both networks are measured inside the same
radius around it** — which makes the comparison immune to stop renumbering, stop
consolidation and corridor re-splitting alike.

  trips at a location = for each (route, direction) stopping within R metres,
                        the departures at whichever stop in the cluster carries
                        the most of them

Max, not sum, over the cluster: adjacent stop ids on a corridor are the same bus
passing once, and consolidating two stops into one must not read as a cut.

**400 m carries the headline** (the standard quarter-mile bus access distance)
and **150 m is reported as a sensitivity**, because the plan consolidates stops
into "PRTX" stations and the two radii genuinely disagree there. A location that
loses a tier at 150 m but not at 400 m is facing a longer walk, not fewer buses.

## Hourly means a maximum gap

Because both networks now have timetables, "hourly or better" is a gap test, not
an average: a location clears it when its **better direction** has no gap over
60 minutes anywhere in the **6am–6pm** window, counting the wait from 6am to the
first departure and from the last departure to 6pm. Peak-only service therefore
fails on the midday gap instead of passing on a period average.

Frequency is combined across routes at the location and taken over the better
direction rather than summed across both. Three hourly routes on one corridor is
a bus every 20 minutes for the rider standing there; summing directions would
let an hourly inbound-only stop clear a bar it does not deserve.

## Day types are resolved for real dates

Sample dates are a holiday-free week in each feed's window: 2026-09-16/19/20 for
the current feed, 2027-09-15/18/19 for the proposed one.

This is not fussiness. Current service id `4` has `monday=1` and looks like a
weekday calendar, but `calendar_dates` suppresses it on every Monday in the
window except **2026-09-07** — it is Labor Day service, and service `2`, the
real weekday calendar, is suppressed that day. Service `1` is the same for July 4
against Saturday service `3`. Counting either as a day type credits **70 routes**
with a schedule they do not run. Every calendar's operating-date count is printed
so the special ones are visible rather than inferred.

Route 53 is the case this decides: its only non-weekend trips are Labor Day
trips, so on the feed's evidence it runs weekends today and the Refresh moves it
to weekdays. WPRDC still shows 93 weekday riders in April 2026, so its weekday
service was pared back before the Refresh rather than by it. Routes in that
position are flagged, never left to read as an ordinary gain.

## Two readings of a route-level day change

`route_service_days.csv` carries both, and they differ:

- **By route number** — the current number's days against its final number's.
- **By corridor** — variants credited to their parent, so 55S counts as the 55.

"The 55 no longer runs Saturdays" and "nothing runs Saturdays on the 55's
corridor" are different claims, and only the second is a service cut. The
corridor reading is the headline everywhere in `docs/answers/`.

## PRT's two sources disagree about 119 stop ids

Trips and geometry are joined by stop id from the GTFS; boardings and the
`HOOD`/`MUNI` labels come from the ArcGIS usage extract on the same id. For **119
of the 5,751 locations** those are different physical stops — id `22728` is
`SMITHFIELD ST AT FIFTH AVE` in the extract and `CHURCH AVE AT DALZELL AVE` in the
feed, and almost all of them sit in the 22600–22800 id block. Between them they
carry 1,333 weekday boardings.

Every row carries `stop_name` (from the GTFS, matching the geometry the trips were
counted at), `usage_stop_name`, and an `id_name_mismatch` flag, set when the two
names share no meaningful token. Tier counts and trip counts are unaffected, since
neither depends on names — but the boardings and place labels on flagged rows are
attached to the wrong stop, so they are excluded from every example table in
`docs/answers/` and should never be quoted per-stop.

## Caveats that apply to all of these answers

- **Boardings are May 2025 daily averages**, the most recent month PRT publishes
  at stop level, and are "unadjusted, unofficial totals" by PRT's own disclaimer,
  possibly understating ridership by up to 30%. Route-level rider figures come
  from WPRDC and run to April 2026.
- Boardings are **unlinked and unweighted**, and alightings stopped in September
  2023, so destination-side effects are invisible.
- **A thin ridership base partly reflects thin service.** Weekend boardings at a
  stop with two Saturday buses are not evidence that nobody wants the trip.
- The proposed feed's provenance is not recorded in this repo; it is not
  published at `rideprt.org/developerresources`. Note where it came from before
  citing it publicly.
- `data/raw/remix_project.json` holds **10 `onDemandZones` polygons** — proposed
  microtransit areas. No answer here accounts for them, so losses in places
  slated for on-demand service may be overstated.

## Reproduce

```bash
python3 ingest_blr.py               # must run first
python3 analyze_coverage_change.py  # -> data/coverage_change.csv,
                                    #    data/route_service_days.csv,
                                    #    data/stop_route_replace.csv
```
