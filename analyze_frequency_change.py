#!/usr/bin/env python3
"""
How much bus service each location gains or loses under the Bus Line Refresh.

analyze_service_loss.py answers a binary question: does the stop keep a bus at
all? That understates the plan, because a stop can be retained and still lose
most of its trips. This puts a number on "how much".

METHOD -- and why it is not a route-to-route comparison.

The plan re-splits corridors, so comparing route N to route N is meaningless.
Carrick is the clean example: today one route 51 runs every ~7 min at peak;
the proposal publishes 51 at 20 min -- but also adds 51S at 20 min and a new
route 45 at 30 min over the same corridor, which combine to ~7.5 min. Read
route-by-route the 51 "loses half its trips"; read by corridor nothing changes.
Exhibit A, which must disclose any >30% service reduction, does not list the 51.

So the unit of analysis is a LOCATION, and both sides are measured the same way:

  service at a location = sum, over every (route, direction) that stops within
                          R metres of it, of that route-direction's trips

  current  trips: counted from GTFS stop_times (max over the stops in the
                  cluster, so consolidating two stops into one is not a cut)
  proposed trips: minutes of the period inside the route's span / its published
                  headway, from the Frequency & Hours PDFs

Measuring both sides over the same radius makes the comparison immune to stop
renumbering, stop consolidation, and corridor re-splitting alike.

R is reported at two values, because the answer genuinely depends on it. 400 m
is the standard quarter-mile bus access distance and is the headline. 150 m is
the strict same-corner test, and it is included because the plan consolidates
stops into "PRTX" stations: Fifth Ave at Chesterfield in West Oakland keeps
almost nothing within 150 m, while a 17-route station sits 219 m away. At 150 m
that reads as a 97% service cut; at 400 m it reads as a longer walk. Both are
true statements about different things, so both are printed.

Bus only: rail and the inclines are outside the Refresh and have no published
proposed headways, so they are dropped from both sides.

Run ingest_blr.py first.  Usage: python3 analyze_frequency_change.py
"""

import csv
import io
import re
import zipfile
from collections import defaultdict
from datetime import date
from pathlib import Path

from analyze_service_loss import MONTH, fnum, load_usage

# Quarter mile is the standard bus walk-access distance and carries the
# headline; the tight radius is kept as a sensitivity (see module docstring).
RADII = [400, 150]
PRIMARY = RADII[0]

DATA = Path("data")
RAW = DATA / "raw"

# The seven periods the Frequency & Hours PDFs publish, as minutes from
# midnight on a 4:00am-4:00am axis (so 28:00 == 4am the following day).
PERIODS = [
    ("early_4_6a", 4 * 60, 6 * 60),
    ("am_6_9a", 6 * 60, 9 * 60),
    ("mid_9a_3p", 9 * 60, 15 * 60),
    ("pm_3_6p", 15 * 60, 18 * 60),
    ("eve_6_8p", 18 * 60, 20 * 60),
    ("late_8_11p", 20 * 60, 23 * 60),
    ("owl_11p_4a", 23 * 60, 28 * 60),
]
PKEYS = [p[0] for p in PERIODS]
AXIS_LO, AXIS_HI = 4 * 60, 28 * 60

# A representative holiday-free week inside the feed's validity window
# (2026-06-28 to 2026-10-14). Service ids are resolved for these dates rather
# than read off calendar.txt columns, so calendar_dates exceptions apply.
SAMPLE_WEEKDAY = date(2026, 9, 16)  # Wednesday

# Routes with published headways but no geometry in the Remix map: short-turn
# and school variants. Their trips cannot be placed on stops, so the proposed
# side understates service on the parent corridors. Quantified as a sensitivity.
VARIANT_PARENT = {"29S": "29", "35S": "35", "51S": "51",
                  "55S": "55", "69S": "69", "78S": "78"}

RAIL = {"BLUE", "RED", "SILVER", "SLVR", "MI", "DQI"}


def parse_clock(s):
    """'5:00 AM' -> minutes from midnight."""
    m = re.match(r"(\d{1,2}):(\d{2})\s*([AP])M", s.strip(), re.I)
    if not m:
        return None
    h, mi, ap = int(m.group(1)), int(m.group(2)), m.group(3).upper()
    h = 0 if h == 12 else h
    return (h + (12 if ap == "P" else 0)) * 60 + mi


def to_axis(t):
    """Fold a GTFS time (minutes, may exceed 24h) onto the 4:00-28:00 axis."""
    while t >= AXIS_HI:
        t -= 1440
    while t < AXIS_LO:
        t += 1440
    return t


def period_of(axis_t):
    for key, p0, p1 in PERIODS:
        if p0 <= axis_t < p1:
            return key
    return None


def span_overlap(p0, p1, s, e):
    """Minutes of period [p0,p1) covered by a service span [s,e), any wrap."""
    tot = 0
    for shift in (-1440, 0, 1440):
        a, b = max(p0, s + shift), min(p1, e + shift)
        if b > a:
            tot += b - a
    return min(tot, p1 - p0)


class Grid:
    """Coarse lat/lon bucket index; 3x3 neighbourhood covers the radius."""

    def __init__(self, radius_m):
        self.r = radius_m
        self.cell = radius_m / 111_320 * 2
        self.buckets = defaultdict(list)

    def add(self, lat, lon, payload):
        self.buckets[(int(lat / self.cell), int(lon / self.cell))].append(
            (lat, lon, payload))

    def within(self, lat, lon):
        import math
        coslat = math.cos(math.radians(lat))
        lim = self.r * self.r
        ky, kx = int(lat / self.cell), int(lon / self.cell)
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                for plat, plon, payload in self.buckets.get((ky + dy, kx + dx), ()):
                    dla = (plat - lat) * 111_320
                    dlo = (plon - lon) * 111_320 * coslat
                    if dla * dla + dlo * dlo <= lim:
                        yield payload


# --------------------------------------------------------------------------
# current network, straight out of GTFS
# --------------------------------------------------------------------------

def weekday_services(z):
    cal = list(csv.DictReader(io.TextIOWrapper(z.open("calendar.txt"), "utf-8-sig")))
    exc = defaultdict(dict)
    for r in csv.DictReader(io.TextIOWrapper(z.open("calendar_dates.txt"), "utf-8-sig")):
        exc[r["service_id"]][r["date"]] = r["exception_type"]
    dows = ["monday", "tuesday", "wednesday", "thursday", "friday",
            "saturday", "sunday"]
    ds = SAMPLE_WEEKDAY.strftime("%Y%m%d")
    ids = set()
    for row in cal:
        on = (row["start_date"] <= ds <= row["end_date"]
              and row[dows[SAMPLE_WEEKDAY.weekday()]] == "1")
        e = exc[row["service_id"]].get(ds)
        on = True if e == "1" else (False if e == "2" else on)
        if on:
            ids.add(row["service_id"])
    return ids


def current_service():
    """Bus trips per (stop, route, direction, period), plus stop coordinates."""
    z = zipfile.ZipFile(RAW / "current_gtfs.zip")
    svc = weekday_services(z)

    bus = {r["route_id"] for r in
           csv.DictReader(io.TextIOWrapper(z.open("routes.txt"), "utf-8-sig"))
           if r["route_type"] == "3"}
    print(f"  weekday service_ids={sorted(svc)}  bus routes={len(bus)}")

    keep = {}
    for t in csv.DictReader(io.TextIOWrapper(z.open("trips.txt"), "utf-8-sig")):
        if t["service_id"] in svc and t["route_id"] in bus:
            keep[t["trip_id"]] = (t["route_id"], t["direction_id"])

    counts = defaultdict(lambda: defaultdict(float))  # stop -> (rt,dir,per) -> n
    for st in csv.DictReader(io.TextIOWrapper(z.open("stop_times.txt"), "utf-8-sig")):
        rd = keep.get(st["trip_id"])
        if not rd:
            continue
        t = st["departure_time"] or st["arrival_time"]
        try:
            h, m, _ = t.split(":")
        except ValueError:
            continue
        per = period_of(to_axis(int(h) * 60 + int(m)))
        if per:
            counts[st["stop_id"]][(rd[0], rd[1], per)] += 1

    coords = {}
    for s in csv.DictReader(io.TextIOWrapper(z.open("stops.txt"), "utf-8-sig")):
        try:
            coords[s["stop_id"]] = (float(s["stop_lat"]), float(s["stop_lon"]))
        except (ValueError, KeyError):
            pass
    return counts, coords


# --------------------------------------------------------------------------
# proposed network, from the PDFs + the Remix map
# --------------------------------------------------------------------------

def proposed_route_trips():
    """route short name -> {period: trips per direction} for weekdays."""
    out, unusable = {}, []
    for r in csv.DictReader(open(DATA / "service_levels.csv")):
        if r["day_type"] != "weekday":
            continue
        name = (r["final_route"] or "").strip()
        if not name:
            continue
        s, e = parse_clock(r["start_time"] or ""), parse_clock(r["end_time"] or "")
        if s is None or e is None:
            unusable.append(name)
            continue
        if e <= s:
            e += 1440
        per = {}
        for key, p0, p1 in PERIODS:
            hw = (r.get(key) or "").strip()
            per[key] = (span_overlap(p0, p1, s, e) / int(hw)
                        if hw.isdigit() and int(hw) > 0 else 0.0)
        out[name] = per
    if unusable:
        print(f"  WARNING: unparseable spans, skipped: {unusable}")
    return out


def proposed_stop_visits():
    """gtfs stop id -> {(route, direction)}, and proposed stop coordinates."""
    coords = {}
    uuid_to_gtfs = {}
    for s in csv.DictReader(open(DATA / "proposed_stops.csv")):
        uuid_to_gtfs[s["stop_uuid"]] = s["gtfs_stop_id"]
        if s["gtfs_stop_id"]:
            coords[s["gtfs_stop_id"]] = (float(s["lat"]), float(s["lon"]))

    visits = defaultdict(set)
    for r in csv.DictReader(open(DATA / "proposed_stop_sequences.csv")):
        sid = uuid_to_gtfs.get(r["stop_uuid"])
        if sid and r["short_name"] not in RAIL:
            visits[sid].add((r["short_name"], r["direction"]))
    return visits, coords


# --------------------------------------------------------------------------

def main():
    print("Loading sources...")
    usage = load_usage()
    cur_counts, cur_coords = current_service()
    route_trips = proposed_route_trips()
    prop_visits, prop_coords = proposed_stop_visits()

    totals = {r["stop_code"]: r for r in usage
              if r["route_code"] == "All Routes" and r["mode"] == "BUS"}
    print(f"  bus stops with ridership data: {len(totals):,}   "
          f"served today: {len(cur_counts):,}   proposed: {len(prop_visits):,}")

    grids = {}
    for radius in RADII:
        gcur, gprop = Grid(radius), Grid(radius)
        for sid in cur_counts:
            if sid in cur_coords:
                gcur.add(*cur_coords[sid], sid)
        for sid in prop_visits:
            if sid in prop_coords:
                gprop.add(*prop_coords[sid], sid)
        grids[radius] = (gcur, gprop)

    rows = []
    for code, u in totals.items():
        if code not in cur_counts or code not in cur_coords:
            continue
        lat, lon = cur_coords[code]
        row = {
            "stop_id": code,
            "stop_name": u["stop_name"],
            "muni": u["MUNI"] or "", "hood": u["HOOD"] or "",
            "lat": round(lat, 6), "lon": round(lon, 6),
            "weekday_boardings": round(fnum(u[f"B_W_{MONTH}"]), 2),
        }
        for radius in RADII:
            gcur, gprop = grids[radius]
            sfx = "" if radius == PRIMARY else f"_{radius}m"

            # --- current service inside the radius ---
            cur_rd = defaultdict(lambda: defaultdict(float))  # (rt,dir)->per->n
            for sid in gcur.within(lat, lon):
                for (rt, dr, per), n in cur_counts[sid].items():
                    # max, not sum: a route-direction stopping twice at one
                    # corner is one bus, and consolidating two stops into one
                    # must not read as a service cut.
                    d = cur_rd[(rt, dr)]
                    if n > d[per]:
                        d[per] = n
            cur_per = {k: sum(d.get(k, 0) for d in cur_rd.values()) for k in PKEYS}

            # --- proposed service inside the same radius ---
            prop_rd = set()
            for sid in gprop.within(lat, lon):
                prop_rd |= prop_visits[sid]
            prop_per = {k: 0.0 for k in PKEYS}
            var_per = {k: 0.0 for k in PKEYS}
            for rt, _dr in prop_rd:
                per = route_trips.get(rt)
                if not per:
                    continue
                for k in PKEYS:
                    prop_per[k] += per[k]
                # Sensitivity: short-turn/school variants have published
                # headways but no geometry, so credit them to their parent.
                for var, parent in VARIANT_PARENT.items():
                    if parent == rt and var in route_trips:
                        for k in PKEYS:
                            var_per[k] += route_trips[var][k]

            c_tot, p_tot = sum(cur_per.values()), sum(prop_per.values())
            v_tot = p_tot + sum(var_per.values())
            row[f"current_trips{sfx}"] = round(c_tot, 1)
            row[f"proposed_trips{sfx}"] = round(p_tot, 1)
            row[f"pct_change{sfx}"] = ("" if not c_tot
                                       else round((p_tot - c_tot) / c_tot * 100, 1))
            if radius == PRIMARY:
                row["proposed_trips_with_variants"] = round(v_tot, 1)
                row["pct_change_with_variants"] = (
                    "" if not c_tot else round((v_tot - c_tot) / c_tot * 100, 1))
                row["n_current_routes"] = len({r for r, _ in cur_rd})
                row["n_proposed_routes"] = len({r for r, _ in prop_rd})
                row["current_routes"] = ";".join(sorted({r for r, _ in cur_rd}))
                row["proposed_routes"] = ";".join(sorted({r for r, _ in prop_rd}))
                for k in PKEYS:
                    row[f"cur_{k}"] = round(cur_per[k], 1)
                    row[f"prop_{k}"] = round(prop_per[k], 1)
        rows.append(row)

    report(rows)
    for radius in RADII[1:]:
        sensitivity(rows, radius)

    out = DATA / "stop_frequency_change.csv"
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(sorted(rows, key=lambda x: -x["weekday_boardings"]))
    print(f"\nWrote {out} ({len(rows):,} rows)")


BUCKETS = [(-100, "loses all service"), (-50, "loses 50-99% of trips"),
           (-25, "loses 25-50%"), (-10, "loses 10-25%"),
           (10, "about the same (+/-10%)"), (25, "gains 10-25%"),
           (50, "gains 25-50%"), (10 ** 9, "gains >50%")]


def bucket(p, prop):
    if prop == 0:
        return "loses all service"
    for hi, label in BUCKETS[1:]:
        if p < hi:
            return label
    return BUCKETS[-1][1]


def report(rows):
    tot_b = sum(r["weekday_boardings"] for r in rows)
    tot_c = sum(r["current_trips"] for r in rows)
    tot_p = sum(r["proposed_trips"] for r in rows)
    tot_v = sum(r["proposed_trips_with_variants"] for r in rows)

    print("\n" + "=" * 76)
    print(f"WEEKDAY BUS TRIPS WITHIN {PRIMARY} m OF EACH STOP: NOW vs PROPOSED"
          .center(76))
    print("=" * 76)
    print(f"  locations analysed: {len(rows):,}    weekday boardings: {tot_b:,.0f}")
    # Summed over locations, so a corridor is counted once per stop along it.
    # Useful as a ratio, not as a count of buses.
    print(f"  summed trips across all locations: {tot_c:,.0f} -> {tot_p:,.0f} "
          f"({(tot_p - tot_c) / tot_c:+.1%});  "
          f"with short-turn variants {tot_v:,.0f} ({(tot_v - tot_c) / tot_c:+.1%})")

    by = defaultdict(list)
    for r in rows:
        by[bucket(r["pct_change"] if r["pct_change"] != "" else 0,
                  r["proposed_trips"])].append(r)

    print(f"\n  {'change in service at the stop':30s} {'stops':>7s} "
          f"{'boardings':>11s} {'share':>7s}")
    order = ["loses all service", "loses 50-99% of trips", "loses 25-50%",
             "loses 10-25%", "about the same (+/-10%)", "gains 10-25%",
             "gains 25-50%", "gains >50%"]
    for k in order:
        g = by.get(k, [])
        if not g:
            continue
        b = sum(r["weekday_boardings"] for r in g)
        print(f"  {k:30s} {len(g):7,d} {b:11,.0f} {b / tot_b:7.1%}")

    worse = [r for r in rows if r["pct_change"] != "" and r["pct_change"] <= -10]
    better = [r for r in rows if r["pct_change"] != "" and r["pct_change"] >= 10]
    wb = sum(r["weekday_boardings"] for r in worse)
    bb = sum(r["weekday_boardings"] for r in better)
    print(f"\n  {bb:,.0f} boardings ({bb / tot_b:.0%}) sit where service grows by 10%+;"
          f"  {wb:,.0f} ({wb / tot_b:.0%}) where it shrinks by 10%+")

    print("\n  Busiest stops losing a quarter or more of their trips:")
    hits = sorted((r for r in rows if r["pct_change"] != ""
                   and r["pct_change"] <= -25 and r["proposed_trips"] > 0),
                  key=lambda x: -x["weekday_boardings"])[:15]
    for r in hits:
        place = r["hood"] or r["muni"].split("(")[0].strip()
        print(f"    {r['weekday_boardings']:8.1f}  {r['stop_name'][:36]:36s} "
              f"{place[:18]:18s} {r['current_trips']:6.0f} -> "
              f"{r['proposed_trips']:6.0f} {r['pct_change']:7.0f}%")

    print("\n  Time-of-day, system-wide stop-visits:")
    for label, keys in (("early 4-6a", ["early_4_6a"]),
                        ("AM peak 6-9a", ["am_6_9a"]),
                        ("midday 9a-3p", ["mid_9a_3p"]),
                        ("PM peak 3-6p", ["pm_3_6p"]),
                        ("evening 6-8p", ["eve_6_8p"]),
                        ("late 8-11p", ["late_8_11p"]),
                        ("owl 11p-4a", ["owl_11p_4a"])):
        c = sum(sum(r[f"cur_{k}"] for k in keys) for r in rows)
        p = sum(sum(r[f"prop_{k}"] for k in keys) for r in rows)
        pct = f"{(p - c) / c:+.1%}" if c else "n/a"
        print(f"    {label:14s} {c:10,.0f} -> {p:10,.0f}   {pct:>8s}")

    # Boardings-weighted average change: the number that answers "what does the
    # typical rider experience", rather than "what does the typical stop".
    wsum = sum(r["weekday_boardings"] for r in rows if r["pct_change"] != "")
    wavg = sum(r["weekday_boardings"] * r["pct_change"]
               for r in rows if r["pct_change"] != "") / wsum
    savg = (sum(r["pct_change"] for r in rows if r["pct_change"] != "")
            / sum(1 for r in rows if r["pct_change"] != ""))
    print(f"\n  Average change in trips, weighted by boardings: {wavg:+.1f}%")
    print(f"  Average change in trips, unweighted per stop:    {savg:+.1f}%")
    print("  (weighted below unweighted = the gains land at quieter stops)"
          if wavg < savg else
          "  (weighted above unweighted = the gains land where riders already are)")


def sensitivity(rows, radius):
    """Same analysis at a tighter radius: how much rides on the walk distance."""
    sfx = f"_{radius}m"
    tot_b = sum(r["weekday_boardings"] for r in rows)
    print("\n" + "-" * 76)
    print(f"  SENSITIVITY: the same comparison at {radius} m instead of {PRIMARY} m")
    print("-" * 76)

    def share(key, test):
        g = [r for r in rows if r[key] != "" and test(r[key])]
        return len(g), sum(r["weekday_boardings"] for r in g)

    for label, test in (("loses 25%+ of trips", lambda p: p <= -25),
                        ("loses 10%+ of trips", lambda p: p <= -10),
                        ("gains 10%+ of trips", lambda p: p >= 10)):
        n1, b1 = share("pct_change", test)
        n2, b2 = share(f"pct_change{sfx}", test)
        print(f"    {label:22s} {PRIMARY}m: {n1:5,d} stops / {b1:7,.0f} bdgs"
              f"    {radius}m: {n2:5,d} / {b2:7,.0f}")

    moved = [r for r in rows
             if r["pct_change"] != "" and r[f"pct_change{sfx}"] != ""
             and r["pct_change"] - r[f"pct_change{sfx}"] >= 25]
    mb = sum(r["weekday_boardings"] for r in moved)
    print(f"\n    {len(moved):,} stops ({mb:,.0f} boardings, {mb / tot_b:.0%}) look "
          f"materially better at {PRIMARY} m than at {radius} m:")
    print(f"    their service is being consolidated onto a stop {radius}-{PRIMARY} m "
          f"away, so the\n    change they face is a longer walk rather than fewer buses.")
    for r in sorted(moved, key=lambda x: -x["weekday_boardings"])[:8]:
        place = r["hood"] or r["muni"].split("(")[0].strip()
        print(f"      {r['weekday_boardings']:7.1f}  {r['stop_name'][:34]:34s} "
              f"{place[:16]:16s} {r[f'pct_change{sfx}']:6.0f}% -> "
              f"{r['pct_change']:6.0f}%")


if __name__ == "__main__":
    main()
