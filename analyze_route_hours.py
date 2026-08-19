#!/usr/bin/env python3
"""
Service hours and trips gained or lost, per corridor group, per day type.

Answers BASE_CAMP LOSE-SERVICE-HOURS and GAIN-SERVICE-HOURS -- "what routes are
losing / gaining service hours overall" -- and gives the route-level reading of
LOSE-FREQUENCY-HALF and GAIN-FREQUENCY-DOUBLE alongside the location-level one
in analyze_frequency_change.py.

This file is the one the repo has been missing: `data/route_frequency_change.csv`
was referenced by the answers index but no script wrote it, and the stale copy
predated the frequency-PDF column fix. It is now regenerated from timetables on
both sides.

WHY GROUPS, NOT ROUTES -- AND WHY A GROUP IS STILL NOT A CORRIDOR

The repo's first convention is that route N must never be compared to route N,
because the plan re-splits corridors. So the unit here is a GROUP: the connected
component joining current route numbers to the proposed numbers PRT maps them
to. That fixes the renumbering half of the problem. Today's 61B and the proposed
62X are one group, not a route that vanished and a route that appeared.

Groups are built from three edge types:
  * `route_crosswalk.csv` "Modified" rows, current <-> final. PRT packs several
    routes into one cell ("86, 77"), so the cell is split rather than tokenised
    -- route 77's fate is invisible otherwise, and it is real: 77 and 86 merge
    into the proposed 86.
  * "Discontinued" rows: a current route with no proposed side. Note that a
    discontinued NUMBER may be reused for different service -- today's 65
    (Squirrel Hill) is discontinued while the proposed 65 is today's 60 -- so
    the two sides are namespaced and never matched on the number alone.
  * Short-turn and school variants (51S -> 51, 89S -> 89), which the crosswalk
    does not list at all. Without them a corridor whose weekend service moved
    to its S-variant reads as a total weekend loss.

READ THE OUTPUT WITH THIS LIMIT IN MIND. A group is not a corridor. Where the
plan covers a corridor with a route PRT records as NEW, the new route forms its
own group and the incumbent's group looks cut. Carrick is exactly that case:
today's 51 groups with the proposed 51 and 51S and reads as -10% weekday trips,
while the new route 45 -- 70 weekday trips over much of the same corridor --
sits in a separate "new" group. Nothing here adds them together.

They are not merged because the crosswalk's `related_routes` column, which is
the only thing that names such corridor relationships, chains: route 1 relates
to 5 and 91, 39 relates to 34 and 35, and unioning on it collapses most of the
network into a single component. A wrong grouping is worse than a coarse one.

So: this file answers "what happened to this service" and is the right unit for
LOSE/GAIN-SERVICE-HOURS. It is NOT the authority on whether a place lost buses.
That is `analyze_frequency_change.py` and `analyze_coverage_change.py`, which
measure locations and are immune to all of this by construction.

WHAT IS COUNTED

  trips         whole trips in the feed on that day type
  revenue hours summed trip durations, first stop to last

Revenue hours are IN-SERVICE time only. Layover, deadhead and pull-in/pull-out
are not in a GTFS, so this is a floor on platform hours and emphatically not a
cost figure -- do not compare it to PRT's own service-hour budget.

Both sides come from real timetables: the current published feed and the
proposed feed obtained from PRT (see gtfs.py). The Frequency & Hours PDFs cannot
answer this question at all -- a headway divided into a span gives trips, but
nothing in the PDFs gives trip duration.

Run ingest_blr.py first.
    python3 analyze_route_hours.py   # -> data/route_frequency_change.csv
"""

import csv
from collections import defaultdict
from pathlib import Path

import gtfs
from analyze_frequency_change import period_of, to_axis

DATA = Path("data")
RAW = DATA / "raw"
DAYS = gtfs.DAYS

# A group whose trips change by at least this much is worth printing.
MATERIAL_PCT = 10.0


# --------------------------------------------------------------------------
# grouping
# --------------------------------------------------------------------------

def crosswalk_edges():
    """(current, final) pairs, plus the routes PRT marks new or discontinued."""
    edges, discontinued, new = [], set(), set()
    for c in csv.DictReader(open(DATA / "route_crosswalk.csv")):
        cat = (c["category"] or "").strip()
        finals = ([] if c["final_route"] in ("-", "")
                  else [c["final_route"].split()[0]])
        # "86, 77" is two current routes in one cell; splitting on whitespace
        # alone silently drops the second.
        currents = [p.strip().split()[0] for p in c["current_route"].split(",")
                    if p.strip() and p.strip() not in ("-",)]
        if cat.startswith("Discont"):
            discontinued.update(currents)
            continue
        if not currents:
            new.update(finals)
            continue
        for cu in currents:
            for fi in finals:
                edges.append((cu, fi))
    return edges, discontinued, new


def variant_edges(prop_routes):
    """51S -> 51 and friends, derived rather than hard-coded.

    A variant is a proposed route whose name is another proposed route's name
    plus a trailing S. Derived from the feed so a variant PRT adds later is
    picked up without editing this file.
    """
    return [(v, v[:-1]) for v in prop_routes
            if v.endswith("S") and v[:-1] in prop_routes]


def build_groups(cur_routes, prop_routes):
    """Connected components over current and proposed route ids.

    Nodes are namespaced ("cur:51", "prop:51S") because a number can mean
    different things on the two sides -- route 77 is discontinued as a current
    route while 77L is the renumbered P16.
    """
    parent = {}

    def find(x):
        parent.setdefault(x, x)
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb

    for r in cur_routes:
        find(f"cur:{r}")
    for r in prop_routes:
        find(f"prop:{r}")

    edges, discontinued, _new = crosswalk_edges()
    for cu, fi in edges:
        if f"cur:{cu}" in parent and f"prop:{fi}" in parent:
            union(f"cur:{cu}", f"prop:{fi}")
    for v, p in variant_edges(prop_routes):
        union(f"prop:{v}", f"prop:{p}")

    groups = defaultdict(lambda: {"cur": set(), "prop": set()})
    for node in parent:
        side, name = node.split(":", 1)
        groups[find(node)][side].add(name)
    return list(groups.values()), discontinued


# --------------------------------------------------------------------------

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
            try:
                out[r["Route"]][day] = float(r["Avg_Riders"] or 0)
            except ValueError:
                pass
    return out, files[-1].stem.split("_")[-1]


def pct(now, prop):
    return "" if not now else round((prop - now) / now * 100, 1)


def main():
    print("Loading both networks...")
    cur = gtfs.load_service(gtfs.current(), gtfs.SAMPLE["current"],
                            period_of=period_of, to_axis=to_axis)
    prop = gtfs.load_service(gtfs.proposed(), gtfs.SAMPLE["proposed"],
                             period_of=period_of, to_axis=to_axis)
    riders, month = route_riders()

    cur_routes = set(cur.route_days)
    prop_routes = set(prop.route_days)
    groups, discontinued = build_groups(cur_routes, prop_routes)
    print(f"  current bus routes={len(cur_routes)}  "
          f"proposed={len(prop_routes)}  corridor groups={len(groups)}")

    rows = []
    for g in groups:
        cu, pr = sorted(g["cur"]), sorted(g["prop"])
        if not cu and not pr:
            continue
        row = {
            "current_routes": ";".join(cu),
            "proposed_routes": ";".join(pr),
            "n_current_routes": len(cu),
            "n_proposed_routes": len(pr),
            "status": ("discontinued" if cu and not pr else
                       "new" if pr and not cu else
                       "split" if len(pr) > len(cu) else
                       "merged" if len(cu) > len(pr) else "one-to-one"),
        }
        for day in DAYS:
            ct = sum(sum(cur.route_periods[day].get(r, {}).values()) for r in cu)
            pt = sum(sum(prop.route_periods[day].get(r, {}).values()) for r in pr)
            ch = sum(cur.route_hours[day].get(r, 0.0) for r in cu)
            ph = sum(prop.route_hours[day].get(r, 0.0) for r in pr)
            row[f"cur_{day}_trips"] = round(ct, 1)
            row[f"prop_{day}_trips"] = round(pt, 1)
            row[f"cur_{day}_hours"] = round(ch, 1)
            row[f"prop_{day}_hours"] = round(ph, 1)
            row[f"pct_{day}_trips"] = pct(ct, pt)
            row[f"pct_{day}_hours"] = pct(ch, ph)
        row["riders_weekday"] = round(
            sum(riders.get(r, {}).get("weekday", 0.0) for r in cu), 1)
        rows.append(row)

    report(rows, cur, prop, month)

    out = DATA / "route_frequency_change.csv"
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(sorted(rows, key=lambda r: -(r["riders_weekday"] or 0)))
    print(f"\nWrote {out} ({len(rows)} rows)")
    print("\nNOTE: revenue hours are in-service time only -- first stop to last,\n"
          "      summed over trips. Layover, deadhead and pull-in/pull-out are\n"
          "      not in a GTFS, so this is a floor on platform hours and is not\n"
          "      comparable to PRT's own service-hour budget.")


def report(rows, cur, prop, month):
    print("\n" + "=" * 76)
    print("SYSTEM TOTALS: trips and in-service hours".center(76))
    print("=" * 76)
    print(f"  {'day':10s} {'trips now':>10s} {'proposed':>10s} {'change':>9s}"
          f" {'hours now':>11s} {'proposed':>10s} {'change':>9s}")
    for day in DAYS:
        ct = sum(r[f"cur_{day}_trips"] for r in rows)
        pt = sum(r[f"prop_{day}_trips"] for r in rows)
        ch = sum(r[f"cur_{day}_hours"] for r in rows)
        ph = sum(r[f"prop_{day}_hours"] for r in rows)
        print(f"  {day:10s} {ct:10,.0f} {pt:10,.0f} {(pt-ct)/ct:+9.1%}"
              f" {ch:11,.0f} {ph:10,.0f} {(ph-ch)/ch:+9.1%}")

    # System-wide the average trip barely changes length, but individual
    # groups move a great deal, which is why a group's hours and trips can
    # point in opposite directions. Without this line, a group whose hours
    # fall while its trips rise reads as a cut when it is a shortening.
    print("\n  Mean in-service minutes per trip (system-wide, near-flat):")
    for day in DAYS:
        ct = sum(r[f"cur_{day}_trips"] for r in rows)
        pt = sum(r[f"prop_{day}_trips"] for r in rows)
        ch = sum(r[f"cur_{day}_hours"] for r in rows)
        ph = sum(r[f"prop_{day}_hours"] for r in rows)
        print(f"    {day:10s} {ch * 60 / ct:5.1f} min -> {ph * 60 / pt:5.1f} min"
              f"   ({(ph / pt) / (ch / ct) - 1:+.1%})")
    print("    The system average is flat, but individual groups are not, so a\n"
          "    group can lose in-service hours while gaining trips: route 59\n"
          "    averages 129 minutes a trip today and 67 proposed, over 52 trips\n"
          "    then and 66 now -- a route split in half, not a service cut.\n"
          "    Hours are therefore a poor proxy for what a rider gets; the\n"
          "    location-level scripts are the authority on that.")

    for day in DAYS:
        # Discontinued groups are -100% by definition and are counted on their
        # own line; listing them among the cuts would crowd out the groups that
        # keep service and still lose a lot of it.
        losers = sorted((r for r in rows
                         if r[f"pct_{day}_hours"] != ""
                         and r[f"pct_{day}_hours"] <= -MATERIAL_PCT
                         and r[f"prop_{day}_hours"] > 0),
                        key=lambda r: r[f"pct_{day}_hours"])
        gainers = sorted((r for r in rows
                          if r[f"pct_{day}_hours"] != ""
                          and r[f"pct_{day}_hours"] >= MATERIAL_PCT),
                         key=lambda r: -r[f"pct_{day}_hours"])
        gone = [r for r in rows if r["status"] == "discontinued"
                and r[f"cur_{day}_hours"] > 0]
        new = [r for r in rows if r["status"] == "new"
               and r[f"prop_{day}_hours"] > 0]

        print("\n" + "=" * 76)
        print(f"{day.upper()}: SERVICE HOURS BY CORRIDOR GROUP".center(76))
        print("=" * 76)
        print(f"  groups losing 10%+ of hours: {len(losers)}    "
              f"gaining 10%+: {len(gainers)}    "
              f"discontinued: {len(gone)}    new: {len(new)}")
        gone_h = sum(r[f"cur_{day}_hours"] for r in gone)
        new_h = sum(r[f"prop_{day}_hours"] for r in new)
        print(f"  {gone_h:,.0f} {day} hours are on discontinued routes; "
              f"{new_h:,.0f} are on new ones. Those two are not a like-for-like\n"
              f"  swap -- a new route may or may not cover the discontinued "
              f"one's corridor. See the module docstring.")

        print(f"\n  LOSE-SERVICE-HOURS -- biggest {day} cuts "
              f"(groups that keep some service):")
        print(f"    {'corridor':28s} {'hours':>14s} {'trips':>13s} "
              f"{'riders/day':>10s}")
        for r in losers[:12]:
            label = f"{r['current_routes']} -> {r['proposed_routes']}"
            print(f"    {label[:28]:28s} "
                  f"{r[f'cur_{day}_hours']:6.0f}->{r[f'prop_{day}_hours']:6.0f} "
                  f"{r[f'cur_{day}_trips']:6.0f}->{r[f'prop_{day}_trips']:5.0f} "
                  f"{r['riders_weekday']:10,.0f}")

        print(f"\n  GAIN-SERVICE-HOURS -- biggest {day} gains:")
        print(f"    {'corridor':28s} {'hours':>14s} {'trips':>13s} "
              f"{'riders/day':>10s}")
        for r in gainers[:12]:
            label = f"{r['current_routes']} -> {r['proposed_routes']}"
            print(f"    {label[:28]:28s} "
                  f"{r[f'cur_{day}_hours']:6.0f}->{r[f'prop_{day}_hours']:6.0f} "
                  f"{r[f'cur_{day}_trips']:6.0f}->{r[f'prop_{day}_trips']:5.0f} "
                  f"{r['riders_weekday']:10,.0f}")

        if day == "weekday":
            half = [r for r in rows if r[f"pct_{day}_trips"] != ""
                    and r[f"pct_{day}_trips"] <= -50 and r[f"prop_{day}_trips"] > 0]
            dbl = [r for r in rows if r[f"pct_{day}_trips"] != ""
                   and r[f"pct_{day}_trips"] >= 100]
            print(f"\n  LOSE-FREQUENCY-HALF -- {len(half)} groups keep service and "
                  f"lose half or more of their {day} trips:")
            for r in sorted(half, key=lambda r: r[f"pct_{day}_trips"]):
                print(f"    {r['current_routes']:14s} -> "
                      f"{r['proposed_routes']:14s} "
                      f"{r[f'cur_{day}_trips']:5.0f} -> "
                      f"{r[f'prop_{day}_trips']:5.0f} trips "
                      f"({r[f'pct_{day}_trips']:+.0f}%)")
            print(f"\n  GAIN-FREQUENCY-DOUBLE -- {len(dbl)} groups at least double "
                  f"their {day} trips:")
            for r in sorted(dbl, key=lambda r: -r[f"pct_{day}_trips"])[:15]:
                print(f"    {r['current_routes'] or '(new)':14s} -> "
                      f"{r['proposed_routes']:14s} "
                      f"{r[f'cur_{day}_trips']:5.0f} -> "
                      f"{r[f'prop_{day}_trips']:5.0f} trips "
                      f"({r[f'pct_{day}_trips']:+.0f}%)")

    if month:
        print(f"\n  riders/day: WPRDC route-level averages, {month}, summed over "
              f"the group's current routes.")


if __name__ == "__main__":
    main()
