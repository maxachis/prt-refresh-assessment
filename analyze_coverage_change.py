#!/usr/bin/env python3
"""
Coverage change under the Bus Line Refresh, by day of week and by frequency tier.

Answers BASE_CAMP LOSE-SERVICE-DAYS / GAIN-SERVICE-DAYS per route, and the five
coverage tiers -- WEEK-ANY-MINIMUM, WEEKDAYS-ANY-MINIMUM, WEEKENDS-ANY-MINIMUM,
WEEK-ANY-HOURLY, WEEKEND-ANY-HOURLY -- per location, which together are the
day-of-week half of COVERAGE-CHANGE and all five criteria of STOP-LOST-SERVICE.
Every other script here is weekday-only, so a place that keeps its weekday buses
and loses Saturday and Sunday reads as untouched everywhere else.

THERE IS NOW A GTFS FOR THE PROPOSED NETWORK, and this script uses it.

`data/raw/proposed_gtfs/` is a real feed: `Future_BLR_Service-Weekday/-Sa/-Su`
calendars over 2027, 5,515 stops with coordinates, 14,488 trips and 698,865
stop_times rows. That retires two compromises the rest of the repo still lives
with, and both of them were changing answers:

1. **The S-variants now have geometry.** 29S, 53S, 55S, 69S, 78S and 89S appear
   in the Frequency & Hours PDFs but not in the Remix map, so any analysis built
   on Remix drops them. They are precisely where weekend service on the 29, 53,
   55, 69 and 89 corridors went: the 55 is weekday-only in the proposal while
   55S runs 34 Saturday and 30 Sunday trips. Reading the route numbers alone
   turns Clairton and Glassport into total weekend losses that the plan does not
   actually inflict.
2. **Frequency is counted, not divided.** Deriving proposed trips as span /
   published headway lands within 1.4% of this feed system-wide, but it doubles
   the peak-only limiteds -- 1L, 2L, 12L, 19L, 23L, 46L, 52L, 73L, 76L, 77L all
   run one peak direction, so a headway applied to both directions invents a
   return trip. The error is small in aggregate and concentrated exactly where
   the limiteds run.

The PDFs are kept as a cross-check rather than discarded: section A prints any
route where the two sources disagree about which days it runs. They agree today.

METHOD

The unit is a LOCATION, and both networks are measured identically inside the
same radius -- what makes the comparison immune to stop renumbering, stop
consolidation and corridor re-splitting. 400 m carries the headline, 150 m is
the sensitivity. Both sides are now real departure times out of a GTFS:

  trips at a location = for each (route, direction) stopping within R metres,
                        the departures at whichever stop in the cluster carries
                        the most of them -- max, not sum, so consolidating two
                        stops into one is not a service cut

HOURLY means a maximum gap, not an average. Because both networks now have
timetables, a location clears the tier when its better direction has no gap over
60 minutes anywhere in the 6am-6pm window, counting the wait from 6am to the
first departure and from the last departure to 6pm. That fails peak-only
service, which an average-over-the-period test would have passed. Frequency is
combined across routes at the location and taken over the better direction, not
summed across both: three hourly routes on one corridor is a bus every 20
minutes for the rider standing there, while summing directions would let an
hourly inbound-only stop clear a bar it does not deserve.

WEEKENDS-ANY-MINIMUM and WEEKEND-ANY-HOURLY read "on weekends" as EITHER
weekend day. Saturday and Sunday are stored separately, so the stricter
both-days reading is available from the CSV.

Bus only: rail and the inclines are outside the Refresh, and are dropped from
both sides.

One trap in the CURRENT feed, and the reason day types are resolved for real
dates rather than read off calendar.txt columns. Service id 4 has monday=1 and
looks like an ordinary weekday calendar, but calendar_dates suppresses it on
every Monday in the window except 2026-09-07 -- it is Labor Day service, and
service 2, the real weekday calendar, is suppressed that day. Counting service 4
as weekday service credits 70 routes with a schedule they do not run. Route 53
is the visible casualty of getting this right: its only non-weekend trips are
Labor Day trips, so on the feed's own evidence it runs weekends today, and the
Refresh moves it to weekdays. Routes in that position are flagged rather than
left to read as an ordinary gain.

Run ingest_blr.py first.  Usage: python3 analyze_coverage_change.py
    -> data/route_service_days.csv, data/coverage_change.csv
"""

import csv
import re
from collections import defaultdict
from pathlib import Path

import gtfs
from gtfs import DAYS, SAMPLE
from analyze_frequency_change import (PERIODS, PKEYS, PRIMARY, RADII, Grid,
                                      period_of, to_axis)
from analyze_service_loss import MONTH, fnum, load_usage

DATA = Path("data")
RAW = DATA / "raw"

BOARDINGS = {"weekday": f"B_W_{MONTH}",
             "saturday": f"B_S_{MONTH}",
             "sunday": f"B_U_{MONTH}"}

# The hourly tier's window, in minutes on the 4:00-28:00 axis: 6am to 6pm.
HOURLY_LO, HOURLY_HI = 6 * 60, 18 * 60
MAX_GAP = 60

TIERS = [
    ("WEEK-ANY-MINIMUM", DAYS, False),
    ("WEEKDAYS-ANY-MINIMUM", ["weekday"], False),
    ("WEEKENDS-ANY-MINIMUM", ["saturday", "sunday"], False),
    ("WEEK-ANY-HOURLY", ["weekday"], True),
    ("WEEKEND-ANY-HOURLY", ["saturday", "sunday"], True),
]

TIER_WEIGHT = {"WEEK-ANY-MINIMUM": ["weekday"],
               "WEEKDAYS-ANY-MINIMUM": ["weekday"],
               "WEEKENDS-ANY-MINIMUM": ["saturday", "sunday"],
               "WEEK-ANY-HOURLY": ["weekday"],
               "WEEKEND-ANY-HOURLY": ["saturday", "sunday"]}


# --------------------------------------------------------------------------
# stop names, the one thing gtfs.py does not carry
# --------------------------------------------------------------------------


def stop_names(feed):
    """stop_id -> stop_name, for the id-collision check below."""
    return {s["stop_id"]: s["stop_name"] for s in feed.rows("stops.txt")}


# --------------------------------------------------------------------------
# A. route-level day-of-week change
# --------------------------------------------------------------------------

def crosswalk_pairs():
    """(current route id, final route id) for routes neither added nor removed.

    PRT packs several routes into one cell -- "86, 77" -- so a naive split on
    whitespace silently loses route 77. Both members map to the same final route.
    """
    pairs = []
    for c in csv.DictReader(open(DATA / "route_crosswalk.csv")):
        if c["category"] != "Modified":
            continue
        final = c["final_route"].split()[0] if c["final_route"] != "-" else ""
        for part in c["current_route"].split(","):
            tok = part.strip().split()
            if tok and tok[0] not in ("-", ""):
                pairs.append((tok[0], final))
    return pairs


def variant_parents(routes):
    """{variant: parent} for short-turn and school variants -- 55S -> 55.

    Derived from the route list rather than hard-coded, so a variant PRT adds
    later is picked up. These carry weekend service on several corridors whose
    parent number is weekday-only, so a route-number reading of the day-type
    change is wrong without them.
    """
    return {r: r[:-1] for r in routes if r.endswith("S") and r[:-1] in routes}


def pdf_route_days():
    """{route: day types} as published in the Frequency & Hours PDFs.

    Kept only to cross-check the proposed GTFS. A row with a span but no headway
    in any period is not service.
    """
    out = defaultdict(set)
    for r in csv.DictReader(open(DATA / "service_levels.csv")):
        name = (r["final_route"] or "").strip()
        if r["day_type"] in DAYS and name and any(
                (r.get(k) or "").strip().isdigit() and int(r[k]) > 0 for k in PKEYS):
            out[name].add(r["day_type"])
    return out


def route_riders():
    """{route: {day type: average riders}} from the WPRDC route-level table."""
    files = sorted(RAW.glob("route_ridership_*.csv"))
    if not files:
        return {}, ""
    label = {"WEEKDAY": "weekday", "SAT.": "saturday", "SUN.": "sunday"}
    out = defaultdict(dict)
    for r in csv.DictReader(open(files[-1], encoding="utf-8")):
        day = label.get(r["Day_Type"].strip().upper())
        if day:
            out[r["Route"]][day] = fnum(r["Avg_Riders"])
    return out, files[-1].stem.split("_")[-1]


def route_days_report(cur_days, prop_days, holiday_only):
    """LOSE-SERVICE-DAYS and GAIN-SERVICE-DAYS, per route.

    Reported two ways. The route-number reading compares the current number to
    its final number. The corridor reading credits a route with its own
    variants' days, because "the 55 no longer runs Saturdays" and "nothing runs
    Saturdays on the 55's corridor" are different claims and only the second is
    a service cut.
    """
    riders, month = route_riders()
    variants = variant_parents(set(prop_days))
    with_variants = defaultdict(set)
    for rt, days in prop_days.items():
        with_variants[variants.get(rt, rt)] |= days

    rows, unmatched = [], []
    for cu, fi in crosswalk_pairs():
        if cu not in cur_days or fi not in prop_days:
            unmatched.append((cu, fi))
            continue
        now, prop = cur_days[cu], prop_days[fi]
        corr = with_variants[variants.get(fi, fi)]
        rows.append({
            "current_route": cu, "final_route": fi,
            "current_days": ";".join(d for d in DAYS if d in now),
            "proposed_days": ";".join(d for d in DAYS if d in prop),
            "proposed_days_with_variants": ";".join(d for d in DAYS if d in corr),
            "days_lost": ";".join(d for d in DAYS if d in now - prop),
            "days_gained": ";".join(d for d in DAYS if d in prop - now),
            "days_lost_corridor": ";".join(d for d in DAYS if d in now - corr),
            "days_gained_corridor": ";".join(d for d in DAYS if d in corr - now),
            "holiday_only_today": ";".join(d for d in DAYS
                                           if d in holiday_only.get(cu, ())),
            **{f"riders_{d}": round(riders.get(cu, {}).get(d, 0), 1) for d in DAYS},
        })

    print("\n" + "=" * 76)
    print("A. DAYS OF SERVICE, PER ROUTE (routes neither added nor removed)"
          .center(76))
    print("=" * 76)
    print(f"  routes compared: {len(rows)}"
          + (f"   unmatched: {unmatched}" if unmatched else ""))
    print(f"  variants credited to their parent: "
          f"{', '.join(f'{k}->{v}' for k, v in sorted(variants.items()))}")
    if riders:
        print(f"  riders: WPRDC route-level averages, {month}")

    def note(route, days):
        v = sum(riders.get(route, {}).get(d, 0) for d in days.split(";") if d)
        return f"  [{v:,.0f} riders/day on those days today]" if v else ""

    lost = [r for r in rows if r["days_lost"]]
    print(f"\n  LOSE-SERVICE-DAYS, by route number -- {len(lost)} routes:")
    for r in sorted(lost, key=lambda x: x["current_route"]):
        arrow = ("" if r["current_route"] == r["final_route"]
                 else f" (becomes {r['final_route']})")
        covered = (" -- but its variant still runs them"
                   if not r["days_lost_corridor"] else "")
        print(f"    {r['current_route']:5s} loses {r['days_lost']:20s}"
              f"{arrow}{note(r['current_route'], r['days_lost'])}{covered}")

    real = [r for r in rows if r["days_lost_corridor"]]
    print(f"\n  LOSE-SERVICE-DAYS, corridor reading (variants credited) -- "
          f"{len(real)} routes:")
    for r in sorted(real, key=lambda x: x["current_route"]):
        print(f"    {r['current_route']:5s} loses {r['days_lost_corridor']:20s}"
              f" keeps {r['proposed_days_with_variants'] or 'nothing'}"
              f"{note(r['current_route'], r['days_lost_corridor'])}")
    if not real:
        print("    none -- every weekend day dropped by a route number is still "
              "run by that route's variant")

    gained = [r for r in rows if r["days_gained_corridor"]]
    print(f"\n  GAIN-SERVICE-DAYS -- {len(gained)} routes:")
    for r in sorted(gained, key=lambda x: x["current_route"]):
        print(f"    {r['current_route']:5s} gains {r['days_gained_corridor']:20s}"
              f" (today {r['current_days'] or 'nothing'})")

    flagged = [r for r in rows if r["holiday_only_today"]]
    if flagged:
        print("\n  Read those gains with this caveat -- these routes reach a day "
              "type today\n  only on a holiday calendar, so the feed shows them "
              "without it as ordinary service:")
        for r in flagged:
            v = riders.get(r["current_route"], {}).get("weekday", 0)
            print(f"    {r['current_route']:5s} {r['holiday_only_today']} exists "
                  f"only on the Labor Day calendar; WPRDC {month} still shows "
                  f"{v:,.0f} weekday riders")

    # The PDFs are the only proposed-frequency source the rest of the repo has,
    # so it matters whether they agree with the feed about day types.
    pdf = pdf_route_days()
    diff = [(rt, sorted(pdf.get(rt, ())), sorted(days))
            for rt, days in sorted(prop_days.items())
            if rt in pdf and pdf[rt] != days]
    missing = sorted(set(prop_days) - set(pdf))
    print(f"\n  Cross-check against the Frequency & Hours PDFs: "
          f"{len(prop_days) - len(missing)} routes in both, "
          f"{len(diff)} disagreeing on day types.")
    for rt, a, b in diff:
        print(f"    {rt:5s} PDFs {a}  feed {b}")
    if missing:
        print(f"    in the feed, absent from the PDFs: {missing}")

    out = DATA / "route_service_days.csv"
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(sorted(rows, key=lambda x: x["current_route"]))
    print(f"\n  Wrote {out} ({len(rows)} rows)")


# --------------------------------------------------------------------------
# B. location-level coverage tiers
# --------------------------------------------------------------------------

def departures_by_direction(counts_day, stop_ids):
    """{direction: sorted departure minutes} for one network at one location.

    Per (route, direction), take the stop in the cluster carrying the most
    departures rather than pooling all of them: adjacent stop ids on a corridor
    are the same bus passing once, and consolidating two stops into one must not
    read as a service cut.

    Stops are visited in sorted order and ties go to the lowest stop id, so the
    result does not depend on set iteration order -- which Python randomises per
    process, and which silently moved ~20 borderline locations between runs
    before this was pinned down.
    """
    best = {}
    for sid in sorted(stop_ids):
        for rd, times in counts_day[sid].items():
            if len(times) > len(best.get(rd, ())):
                best[rd] = times
    by_dir = defaultdict(list)
    for (_rt, direction), times in best.items():
        by_dir[direction] += times
    return {d: sorted(t) for d, t in by_dir.items()}


# Tokens too generic to prove two names describe the same corner.
NAME_STOPWORDS = {"AT", "OPP", "FS", "NS", "ST", "AVE", "RD", "DR", "BLVD",
                  "THE", "OF", "AND", "N", "S", "E", "W"}


def name_tokens(s):
    return set(re.findall(r"[A-Z0-9]+", (s or "").upper())) - NAME_STOPWORDS


def name_mismatch(usage_name, gtfs_name):
    """Do these two names, sharing a stop id, describe different places?

    PRT's usage extract and the GTFS disagree about what 116 stop ids refer to,
    almost all in the 22600-22800 block: id 22728 is SMITHFIELD ST AT FIFTH AVE
    in the extract and CHURCH AVE AT DALZELL AVE in the feed. Trips and geometry
    are joined by id from the GTFS, so for those rows the boardings and the
    HOOD/MUNI labels belong to a different physical stop. Sharing no meaningful
    token is the test; abbreviation differences still share one.
    """
    a, b = name_tokens(usage_name), name_tokens(gtfs_name)
    return bool(a and b and not (a & b))


def routes_at(counts_day, stop_ids):
    """Route ids stopping at any stop in the cluster on this day type."""
    return {rt for sid in stop_ids for rt, _d in counts_day[sid]}


def hourly(by_dir):
    """Is the better direction hourly-or-better right across 6am-6pm?

    Gaps are measured from the window's start to the first departure and from
    the last departure to its end, so peak-only service fails on the midday gap
    rather than passing on a technicality.
    """
    for times in by_dir.values():
        window = [t for t in times if HOURLY_LO <= t <= HOURLY_HI]
        if not window:
            continue
        edges = [HOURLY_LO] + window + [HOURLY_HI]
        if max(b - a for a, b in zip(edges, edges[1:])) <= MAX_GAP:
            return True
    return False


def cluster_trips(counts_day, stop_ids):
    """{period: trips} at a location, per-period max across the cluster.

    The same aggregation `analyze_frequency_change.py` uses, so trip counts here
    and in FINDINGS.md are the same statistic. Taking the maximum per period
    rather than per day matters where a cluster's stops carry different patterns:
    one stop may hold a route's morning trips and its neighbour the afternoon's,
    and the rider on that corner has both. Choosing one stop for the whole day
    understates it -- by 0.4 percentage points on the system-wide weekday total.
    """
    best = defaultdict(float)
    for sid in sorted(stop_ids):
        for (rt, dr, per), n in counts_day[sid].items():
            if n > best[(rt, dr, per)]:
                best[(rt, dr, per)] = n
    out = {k: 0.0 for k in PKEYS}
    for (_rt, _dr, per), n in best.items():
        out[per] += n
    return out


def period_trips(by_dir):
    """{period: departures}, summed over directions -- for the CSV, not a tier."""
    out = {k: 0 for k in PKEYS}
    for times in by_dir.values():
        for t in times:
            p = period_of(t)
            if p:
                out[p] += 1
    return out


def tier_value(day_flags, days, want_hourly):
    """Whether a location clears one BASE_CAMP tier: any of `days` qualifies."""
    return any(day_flags[d][1] if want_hourly else day_flags[d][0] > 0
               for d in days)


def main():
    print("Loading sources...")
    usage = load_usage()
    # Both feeds through gtfs.load_service, so this analysis and
    # analyze_frequency_change.py cannot drift apart on sample dates, holiday
    # calendars, the time axis or the bus-only filter.
    cur_feed = gtfs.current()
    cur = gtfs.load_service(cur_feed, SAMPLE["current"],
                            period_of=period_of, to_axis=to_axis)
    prop = gtfs.load_service(gtfs.proposed(), SAMPLE["proposed"],
                             period_of=period_of, to_axis=to_axis)
    cur_counts, prop_counts = cur.times, prop.times
    cur_coords, prop_coords = cur.coords, prop.coords
    cur_days, prop_days = cur.route_days, prop.route_days
    cur_names = stop_names(cur_feed)
    cur_period_counts = {d: cur.counts(d, period_of) for d in DAYS}
    prop_period_counts = {d: prop.counts(d, period_of) for d in DAYS}

    route_days_report(cur_days, prop_days, cur.holiday_only)

    totals = {r["stop_code"]: r for r in usage
              if r["route_code"] == "All Routes" and r["mode"] == "BUS"}
    served = {sid for d in DAYS for sid in cur_counts[d]}
    prop_served = {sid for d in DAYS for sid in prop_counts[d]}
    print(f"\n  bus stops with ridership data: {len(totals):,}   "
          f"served today: {len(served):,}   proposed: {len(prop_served):,}")

    grids = {}
    for radius in RADII:
        gcur, gprop = Grid(radius), Grid(radius)
        for sid in sorted(served):
            if sid in cur_coords:
                gcur.add(*cur_coords[sid], sid)
        for sid in sorted(prop_served):
            if sid in prop_coords:
                gprop.add(*prop_coords[sid], sid)
        grids[radius] = (gcur, gprop)

    rows = []
    for code, u in totals.items():
        if code not in served or code not in cur_coords:
            continue
        lat, lon = cur_coords[code]
        # Geometry and trips come from the GTFS, so its name is the one that
        # describes this location; the usage extract's name and place labels ride
        # along on the same id and disagree for 116 of them (see id_name_mismatch).
        row = {"stop_id": code, "stop_name": cur_names.get(code, u["stop_name"]),
               "usage_stop_name": u["stop_name"],
               "id_name_mismatch": int(name_mismatch(u["stop_name"],
                                                     cur_names.get(code))),
               "muni": u["MUNI"] or "", "hood": u["HOOD"] or "",
               "lat": round(lat, 6), "lon": round(lon, 6)}
        for day in DAYS:
            row[f"{day}_boardings"] = round(fnum(u[BOARDINGS[day]]), 2)

        for radius in RADII:
            gcur, gprop = grids[radius]
            sfx = "" if radius == PRIMARY else f"_{radius}m"
            cur_ids = list(gcur.within(lat, lon))
            prop_ids = list(gprop.within(lat, lon))

            cur_flags, prop_flags = {}, {}
            for day in DAYS:
                # Trip totals use the per-period cluster maximum, matching
                # analyze_frequency_change.py; the hourly tier needs a time
                # series, so it reads departures for one stop per route-direction.
                cper = cluster_trips(cur_period_counts[day], cur_ids)
                pper = cluster_trips(prop_period_counts[day], prop_ids)
                cd = departures_by_direction(cur_counts[day], cur_ids)
                pd = departures_by_direction(prop_counts[day], prop_ids)
                cur_flags[day] = (sum(cper.values()), hourly(cd))
                prop_flags[day] = (sum(pper.values()), hourly(pd))
                if radius == PRIMARY:
                    row[f"cur_{day}_trips"] = round(cur_flags[day][0])
                    row[f"prop_{day}_trips"] = round(prop_flags[day][0])
                    row[f"cur_{day}_hourly"] = int(cur_flags[day][1])
                    row[f"prop_{day}_hourly"] = int(prop_flags[day][1])
                    if day == "weekday":
                        for k, v in cper.items():
                            row[f"cur_{k}"] = round(v)
                        for k, v in pper.items():
                            row[f"prop_{k}"] = round(v)
                        # Route lists carry STOP-ROUTE-REPLACE and let the
                        # frequency questions be answered off counted trips
                        # rather than headways divided into a span.
                        cr = routes_at(cur_counts[day], cur_ids)
                        pr = routes_at(prop_counts[day], prop_ids)
                        row["current_routes"] = ";".join(sorted(cr))
                        row["proposed_routes"] = ";".join(sorted(pr))
                        row["n_current_routes"] = len(cr)
                        row["n_proposed_routes"] = len(pr)
            for label, days, want_hourly in TIERS:
                key = label.replace("-", "_").lower()
                row[f"cur_{key}{sfx}"] = int(tier_value(cur_flags, days, want_hourly))
                row[f"prop_{key}{sfx}"] = int(tier_value(prop_flags, days, want_hourly))
        rows.append(row)

    tier_report(rows)
    replacement_report(rows, set(prop_days))
    for radius in RADII[1:]:
        sensitivity(rows, radius)

    out = DATA / "coverage_change.csv"
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(sorted(rows, key=lambda x: -x["weekday_boardings"]))
    print(f"\nWrote {out} ({len(rows):,} rows)")
    print("\nNOTE: boardings are May 2025 daily averages, the most recent month\n"
          "      PRT publishes at stop level, and are 'unadjusted, unofficial\n"
          "      totals' by PRT's own disclaimer. Both service sides are counted\n"
          "      from GTFS timetables: the current feed (valid 2026-06-28) and\n"
          "      the proposed feed in data/raw/proposed_gtfs/ (valid 2027).")


def weight(r, label):
    return sum(r[f"{d}_boardings"] for d in TIER_WEIGHT[label])


def tier_report(rows):
    print("\n" + "=" * 76)
    print(f"B. COVERAGE TIERS WITHIN {PRIMARY} m OF EACH STOP: NOW vs PROPOSED"
          .center(76))
    print("=" * 76)
    mism = [r for r in rows if r["id_name_mismatch"]]
    print(f"  locations analysed: {len(rows):,}    "
          f"of which the usage extract and the GTFS disagree about the stop id: "
          f"{len(mism)}\n  ({sum(r['weekday_boardings'] for r in mism):,.0f} "
          f"weekday boardings; their trip counts are sound, their names, place "
          f"labels\n  and boardings are not, so they are left out of the example "
          f"lists below)")

    print(f"\n  {'tier':24s} {'now':>7s} {'proposed':>9s} {'net':>7s}"
          f" {'lost':>6s} {'gained':>7s} {'boardings at risk':>18s}")
    for label, _days, _h in TIERS:
        key = label.replace("-", "_").lower()
        now = sum(1 for r in rows if r[f"cur_{key}"])
        prop = sum(1 for r in rows if r[f"prop_{key}"])
        lost = [r for r in rows if r[f"cur_{key}"] and not r[f"prop_{key}"]]
        gained = sum(1 for r in rows if not r[f"cur_{key}"] and r[f"prop_{key}"])
        b = sum(weight(r, label) for r in lost)
        print(f"  {label:24s} {now:7,d} {prop:9,d} {prop - now:+7,d} "
              f"{len(lost):6,d} {gained:7,d} {b:18,.0f}")

    print("\n  Weekend loss, split by whether the location keeps any service:")
    for day in ("saturday", "sunday"):
        lost = [r for r in rows
                if r[f"cur_{day}_trips"] > 0 and r[f"prop_{day}_trips"] == 0]
        all_gone = sum(1 for r in lost if not r["prop_week_any_minimum"])
        day_only = [r for r in lost if r["prop_week_any_minimum"]]
        bd = sum(r[f"{day}_boardings"] for r in day_only)
        print(f"    {day:9s} {len(lost):5,d} locations lose it"
              f"   {all_gone:5,d} lose all service entirely"
              f"   {len(day_only):5,d} keep weekday service but lose {day}"
              f" ({bd:,.0f} {day} boardings)")

    print("\n  Places losing the most weekend service while keeping weekdays:")
    place = defaultdict(float)
    for r in rows:
        if not r["prop_week_any_minimum"] or r["id_name_mismatch"]:
            continue  # counted by analyze_service_loss.py, not a weekend story
        if r["cur_weekends_any_minimum"] and not r["prop_weekends_any_minimum"]:
            place[r["hood"] or r["muni"].split("(")[0].strip() or "?"] += (
                r["saturday_boardings"] + r["sunday_boardings"])
    for p, v in sorted(place.items(), key=lambda x: -x[1])[:12]:
        print(f"    {v:8.1f}  {p}")
    if not place:
        print("    none")

    for label, key, day in (("weekdays", "week_any_hourly", "weekday"),
                            ("weekends", "weekend_any_hourly", "saturday")):
        hits = [r for r in rows if r[f"cur_{key}"] and not r[f"prop_{key}"]
                and r[f"prop_{day}_trips"] > 0 and not r["id_name_mismatch"]]
        print(f"\n  Busiest locations dropping below hourly on {label}, while "
              f"keeping some service (6am-6pm, max 60-minute gap):")
        for r in sorted(hits, key=lambda x: -x[f"{day}_boardings"])[:12]:
            p = r["hood"] or r["muni"].split("(")[0].strip()
            print(f"    {r[f'{day}_boardings']:8.1f}  {r['stop_name'][:38]:38s} "
                  f"{p[:18]:18s} {r[f'cur_{day}_trips']:6d} -> "
                  f"{r[f'prop_{day}_trips']:6d} {day} trips")

    print("\n  Busiest locations rising to hourly on weekdays:")
    hits = [r for r in rows if not r["cur_week_any_hourly"]
            and r["prop_week_any_hourly"] and not r["id_name_mismatch"]]
    for r in sorted(hits, key=lambda x: -x["weekday_boardings"])[:10]:
        p = r["hood"] or r["muni"].split("(")[0].strip()
        print(f"    {r['weekday_boardings']:8.1f}  {r['stop_name'][:38]:38s} "
              f"{p[:18]:18s} {r['cur_weekday_trips']:6d} -> "
              f"{r['prop_weekday_trips']:6d} weekday trips")

    tot = {d: sum(r[f"cur_{d}_trips"] for r in rows) for d in DAYS}
    prp = {d: sum(r[f"prop_{d}_trips"] for r in rows) for d in DAYS}
    print("\n  Summed trips across all locations (a ratio, not a bus count):")
    for d in DAYS:
        pct = f"{(prp[d] - tot[d]) / tot[d]:+.1%}" if tot[d] else "n/a"
        print(f"    {d:9s} {tot[d]:9,d} -> {prp[d]:9,d}   {pct:>8s}")


# --------------------------------------------------------------------------
# C. STOP-ROUTE-REPLACE
# --------------------------------------------------------------------------

# A location is a substitution candidate when its trips barely move but its
# route set changes. Both bounds matter: without the tolerance it is just a
# service cut, and without the route cap a Downtown stop swapping 38 routes for
# 27 renumbered ones dominates the answer.
REPLACE_TOLERANCE_PCT = 10
REPLACE_MAX_ROUTES = 4


def replacement_report(rows, prop_route_ids):
    """STOP-ROUTE-REPLACE: stops whose service is comparable but whose route
    number changed.

    Renumbering is not replacement. Downtown stops appear to swap nearly their
    whole route list because the 61A-D become the 60X/61X/62X and the P-flyers
    become L-limiteds, so current numbers are translated through the crosswalk
    and short-turn variants are folded into their parent before comparing.
    """
    xwalk = {}
    for cu, fi in crosswalk_pairs():
        xwalk[cu] = fi
    variants = variant_parents(prop_route_ids)

    def canon(routes, translate):
        out = set()
        for r in routes:
            r = xwalk.get(r, r) if translate else r
            out.add(variants.get(r, r))
        return {r for r in out if r}

    hits = []
    for r in rows:
        cur_raw = set(filter(None, r["current_routes"].split(";")))
        pro_raw = set(filter(None, r["proposed_routes"].split(";")))
        cur, pro = canon(cur_raw, True), canon(pro_raw, False)
        lost, gained = cur - pro, pro - cur
        c, p = r["cur_weekday_trips"], r["prop_weekday_trips"]
        if not (lost and gained and c and p):
            continue
        pct = (p - c) / c * 100
        if abs(pct) <= REPLACE_TOLERANCE_PCT and len(cur) <= REPLACE_MAX_ROUTES:
            hits.append({
                "stop_id": r["stop_id"], "stop_name": r["stop_name"],
                "id_name_mismatch": r["id_name_mismatch"],
                "muni": r["muni"], "hood": r["hood"],
                "weekday_boardings": r["weekday_boardings"],
                "cur_weekday_trips": c, "prop_weekday_trips": p,
                "pct_change": round(pct, 1),
                "routes_lost": ";".join(sorted(lost)),
                "routes_gained": ";".join(sorted(gained)),
                "current_routes": r["current_routes"],
                "proposed_routes": r["proposed_routes"],
            })

    print("\n" + "=" * 76)
    print("C. STOPS WHERE ONE ROUTE REPLACES ANOTHER AT COMPARABLE SERVICE"
          .center(76))
    print("=" * 76)
    b = sum(h["weekday_boardings"] for h in hits)
    print(f"  {len(hits):,} of {len(rows):,} locations, {b:,.0f} weekday "
          f"boardings: weekday trips within "
          f"{REPLACE_TOLERANCE_PCT}%, at most {REPLACE_MAX_ROUTES} routes today,"
          f"\n  and a genuine route change after translating renumbering away.")
    print("\n  Busiest (excluding rows whose stop id the two feeds disagree on):")
    clean = [h for h in hits if not h["id_name_mismatch"]]
    for h in sorted(clean, key=lambda x: -x["weekday_boardings"])[:15]:
        place = h["hood"] or h["muni"].split("(")[0].strip()
        print(f"    {h['weekday_boardings']:7.1f}  {h['stop_name'][:34]:34s} "
              f"{place[:18]:18s} -{h['routes_lost']:14s} +{h['routes_gained']:14s}"
              f" {h['pct_change']:+6.1f}%")

    out = DATA / "stop_route_replace.csv"
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(hits[0].keys()))
        w.writeheader()
        w.writerows(sorted(hits, key=lambda x: -x["weekday_boardings"]))
    print(f"\n  Wrote {out} ({len(hits)} rows)")


def sensitivity(rows, radius):
    """The same tiers at a tighter radius: how much rides on the walk distance."""
    sfx = f"_{radius}m"
    print("\n" + "-" * 76)
    print(f"  SENSITIVITY: the same tiers at {radius} m instead of {PRIMARY} m")
    print("-" * 76)
    print(f"    {'tier':24s} {'lost at ' + str(PRIMARY) + 'm':>16s} "
          f"{'lost at ' + str(radius) + 'm':>16s}")
    for label, _d, _h in TIERS:
        key = label.replace("-", "_").lower()
        a = sum(1 for r in rows if r[f"cur_{key}"] and not r[f"prop_{key}"])
        b = sum(1 for r in rows
                if r[f"cur_{key}{sfx}"] and not r[f"prop_{key}{sfx}"])
        print(f"    {label:24s} {a:16,d} {b:16,d}")
    print(f"\n    A location counted as losing a tier at {radius} m but not at "
          f"{PRIMARY} m is having\n    its service consolidated onto a stop "
          f"{radius}-{PRIMARY} m away: a longer walk, not fewer buses.")


if __name__ == "__main__":
    main()
