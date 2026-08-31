#!/usr/bin/env python3
"""How much bus service touches each named place, today and under the plan.

A sixth unit, and the first one in this repo whose denominator is *service*
rather than ground, people, stops or streets. Every other place-level answer
here counts residents; this one counts buses, so the Places map can be read
as "where does the plan add and remove service" beside "whose service does it
remove".

    python3 analyze_place_service.py   -> data/place_service_change.csv

Needs `ingest_boundaries.py` to have run: a place is the municipal or
neighbourhood polygon a stop sits inside (convention 6), never PRT's own
`HOOD`/`MUNI` label.

## THE UNIT IS A TRIP THAT TOUCHES THE PLACE, AND THIS IS THE WHOLE METHOD

A trip is counted **once per place it calls at, on each day type it runs**.
Not once per stop.

The naive count -- sum departures over every stop inside the boundary -- draws
stop spacing, not service. One bus down Brownsville Road through Carrick calls
at a dozen stops inside the neighbourhood and would count twelve times, while
the same bus clipping a borough at one stop counts once. The resulting map
would say Carrick has twelve times the service, which is a statement about
where PRT put its poles. This is convention 2 ("aggregate above the stop id")
arriving at a new unit: the stop is an intermediate here, never the finding.

Two consequences ship with that choice and must be quoted with the number.

**The column does not sum to the network's trips.** A trip from Downtown to
McKeesport touches every place along the way and is counted in all of them.
That is deliberate -- the question is "how much bus service does this place
have", not "how are the system's trips divided between places", which is not a
question a place-level map can answer. Adding the column up double-counts by
roughly the number of places an average trip crosses.

**A place is not a rider's access to it.** A trip passing through a corner of a
township counts for that township exactly as much as one that runs its whole
length. Service touching a place is an upper bound on the service available in
it, and coverage -- how many residents are within a walk of any of it -- stays
`analyze_coverage_change.py`'s question, per convention 10. Neither figure
substitutes for the other, and this one alone would say a place is well served
when one bus grazes its edge.

## BUSES ONLY -- AND THE RAIL FLAG THAT KEEPS THAT HONEST

The counts are buses. Conventions 13 and 14 widen the universe to rail for the
one-seat and journey questions because those ask whether a ride exists at all;
this asks how much service there is, and every service figure on the site
drops rail.

Which produces a sentence that is true and reads as a lie. **Bethel Park
municipality goes from 46 weekday bus trips to none** -- the plan withdraws
routes 36 and Y45 -- and the Blue, Red and Silver lines go on calling there
all day. A map colouring it -100% with no further word would tell a reader
Bethel Park loses its transit, which is convention 13's Beechview trap one
unit further down.

So each place-day also carries `rail_now` and `rail_proposed`: does any
non-bus route call here at all. A flag, never a count, because one T trip is
not one bus trip and a shared column would let rail service refill a hole the
buses left. Seven places lose their last weekday bus; anything drawing them
has to be able to say which of them still have a train.

## THE PERCENT CHANGE HAS A ONE-SIDED HOLE

A place with no bus today and buses proposed has an undefined percent change,
not an infinite one, and it is written as an empty cell. This is the same
asymmetry convention 15 names for boardings, in the opposite direction: there
the plan's gains cannot be scored, here its gains cannot be scaled. The count
columns carry those places; the percentage cannot, and a map coloured by
percentage has to name them in words instead of shading them.

## DAY TYPES ARE THE FEEDS' OWN

Resolved by `gtfs.resolve_calendars` against real sample dates, so the current
feed's two holiday calendars -- Labor Day service that reads as an ordinary
weekday -- do not become weekday service. Both feeds go through the same
loader, so neither side can drift.
"""
import csv
import json
import sys
from collections import defaultdict
from pathlib import Path

import gtfs

sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))
from refresh import geometry  # noqa: E402

DATA = Path(__file__).resolve().parent / "data"
BOUNDARIES = DATA / "place_boundaries.json"
OUT = DATA / "place_service_change.csv"


def place_index():
    if not BOUNDARIES.exists():
        sys.exit(f"missing {BOUNDARIES} -- run ingest_boundaries.py first")
    return geometry.PlaceIndex([
        geometry.Place(name=p["place"], kind=p["kind"], polygons=p["polygons"])
        for p in json.loads(BOUNDARIES.read_text(encoding="utf-8"))])


def assign_stops(coords, index):
    """{stop_id: place} for every stop inside some Allegheny boundary.

    A stop in neither -- the feeds reach into Beaver and Westmoreland -- is
    dropped rather than bucketed as nameless. Unlike a block group, whose
    namelessness was a finding worth reporting, a stop outside the county is
    simply outside this analysis's universe.
    """
    out = {}
    for sid, (lat, lon) in coords.items():
        hit = index.place_at(lat, lon)
        if hit:
            out[sid] = hit.name
    return out


def count_trips(visits, stop_place, trip_days):
    """{day: {place: trips}} from (trip_id, stop_id) visits.

    The set is what makes this trips rather than stop events: a trip calling
    twelve times inside one borough contributes one. See the module docstring.
    """
    places_of = defaultdict(set)
    for trip_id, stop_id in visits:
        place = stop_place.get(stop_id)
        if place:
            places_of[trip_id].add(place)

    counts = {d: defaultdict(int) for d in gtfs.DAYS}
    for trip_id, places in places_of.items():
        for day in trip_days.get(trip_id, ()):
            for place in places:
                counts[day][place] += 1
    return {d: dict(v) for d, v in counts.items()}


def places_served(visits, stop_place, trip_days):
    """{day: {place}} -- which places any of these trips touches at all.

    The rail companion to `count_trips`. It answers a yes/no, not a volume,
    because a rail count would invite exactly the comparison convention 13
    forbids: one T trip is not one bus trip, and putting them in the same
    column would let a place's rail service refill a hole its buses left.
    """
    served = {d: set() for d in gtfs.DAYS}
    for trip_id, stop_id in visits:
        place = stop_place.get(stop_id)
        if place:
            for day in trip_days.get(trip_id, ()):
                served[day].add(place)
    return served


def route_ids_by_mode(route_rows):
    """{"bus": {...}, "rail": {...}} -- everything that is not a bus is rail.

    Deliberately a two-way split rather than an enumeration of GTFS mode
    codes: the current feed calls the T route_type 2 and the proposed feed
    calls it 0, and the inclines are a third code again. What this analysis
    needs to know is only "is this the mode every service figure counts, or
    the mode they all exclude", and that question is stable across both.
    """
    modes = {"bus": set(), "rail": set()}
    for r in route_rows:
        key = "bus" if r["route_type"] == gtfs.BUS_ROUTE_TYPE else "rail"
        modes[key].add(r["route_id"])
    return modes


def pct_change(now, proposed):
    """Percent change, or None where there is no denominator to change from."""
    if not now:
        return None
    return (proposed - now) / now * 100.0


def trip_days(feed, samples, mode="bus"):
    """{trip_id: [day types it runs]} for one mode, holiday service excluded."""
    by_day, occasional, _, _ = gtfs.resolve_calendars(feed, samples)
    keep = route_ids_by_mode(feed.rows("routes.txt"))[mode]
    out = {}
    for t in feed.rows("trips.txt"):
        if t["route_id"] not in keep or t["service_id"] in occasional:
            continue
        days = [d for d in gtfs.DAYS if t["service_id"] in by_day[d]]
        if days:
            out[t["trip_id"]] = days
    return out


def stop_coords(feed):
    return {s["stop_id"]: (float(s["stop_lat"]), float(s["stop_lon"]))
            for s in feed.rows("stops.txt")
            if s.get("stop_lat") and s.get("stop_lon")}


def service_by_place(feed, samples, index):
    """({day: {place: bus trips}}, {day: {places with any rail}}) for one feed."""
    stop_place = assign_stops(stop_coords(feed), index)

    def visits():
        return ((st["trip_id"], st["stop_id"])
                for st in feed.rows("stop_times.txt"))

    buses = count_trips(visits(), stop_place, trip_days(feed, samples, "bus"))
    rail = places_served(visits(), stop_place,
                         trip_days(feed, samples, "rail"))
    return buses, rail


def write(rows):
    with open(OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["place", "kind", "day", "trips_now", "trips_proposed",
                    "pct_change", "rail_now", "rail_proposed"])
        for r in rows:
            w.writerow([r["place"], r["kind"], r["day"], r["trips_now"],
                        r["trips_proposed"],
                        "" if r["pct_change"] is None
                        else f"{r['pct_change']:.1f}",
                        int(r["rail_now"]), int(r["rail_proposed"])])


def main():
    print("Loading boundaries and both feeds...")
    index = place_index()
    kinds = {p.name: p.kind for p in index.places}

    now, rail_now = service_by_place(
        gtfs.current(), gtfs.SAMPLE["current"], index)
    prop, rail_prop = service_by_place(
        gtfs.proposed(), gtfs.SAMPLE["proposed"], index)

    rows = []
    for day in gtfs.DAYS:
        for place in sorted(set(now[day]) | set(prop[day])
                            | rail_now[day] | rail_prop[day]):
            a, b = now[day].get(place, 0), prop[day].get(place, 0)
            rows.append({"place": place, "kind": kinds.get(place, ""),
                         "day": day, "trips_now": a, "trips_proposed": b,
                         "pct_change": pct_change(a, b),
                         "rail_now": place in rail_now[day],
                         "rail_proposed": place in rail_prop[day]})
    write(rows)

    print(f"\n  wrote {OUT.relative_to(DATA.parent)} -- {len(rows)} place-days")
    for day in gtfs.DAYS:
        d = [r for r in rows if r["day"] == day]
        gained = sum(1 for r in d if r["trips_proposed"] > r["trips_now"])
        lost = sum(1 for r in d if r["trips_proposed"] < r["trips_now"])
        newly = sum(1 for r in d if not r["trips_now"] and r["trips_proposed"])
        gone = sum(1 for r in d if r["trips_now"] and not r["trips_proposed"])
        print(f"  {day:9s} {len(d):3d} places with a bus on either network: "
              f"{gained:3d} gain service, {lost:3d} lose service, "
              f"{newly} get a first bus, {gone} lose their last")

    worst = sorted((r for r in rows
                    if r["day"] == "weekday" and r["pct_change"] is not None),
                   key=lambda r: r["pct_change"])
    print("\n  weekday, largest falls:")
    for r in worst[:8]:
        print(f"    {r['place']:<32}{r['trips_now']:6d} -> "
              f"{r['trips_proposed']:6d}  {r['pct_change']:+7.1f}%")
    print("  weekday, largest rises:")
    for r in worst[-8:][::-1]:
        print(f"    {r['place']:<32}{r['trips_now']:6d} -> "
              f"{r['trips_proposed']:6d}  {r['pct_change']:+7.1f}%")
    print("\n  Trips touching a place, counted once per place per trip. The "
          "column does not\n  sum to the network's trips, and service touching "
          "a place is not access to it:\n  quote it beside the coverage "
          "figures, never alone (convention 10).")


if __name__ == "__main__":
    main()
