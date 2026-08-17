#!/usr/bin/env python3
"""
Does PRT's proposed-network GTFS describe the same plan as its published PDFs?

This exists because the feed came from PRT directly rather than from a URL, and
its own `feed_info.txt` stamps it 2026-08-11, six days before the Proposed Final
Network was published. Nothing on the feed proves it is the final plan rather
than a working draft, so the claim has to be earned against the documents PRT
did publish. Every number quoted in `gtfs.py`'s docstring and in DATA_SOURCES.md
is printed here.

This check is not a substitute for recording where the feed came from -- see
DATA_SOURCES.md, where that is still open.

Four checks, in increasing order of how much they would hurt to fail:

  1. ROUTE SET      -- the bus routes in the feed vs the Frequency & Hours PDFs
                       and the Find My Route crosswalk.
  2. DAY TYPES      -- which of weekday/Saturday/Sunday each route runs.
  3. SPAN           -- first and last departure vs the published span.
  4. SERVICE VOLUME -- trips the feed actually runs vs trips the PDFs imply.

Checks 1-3 are agreement tests: a failure means the feed is a different plan
and must not be used. Check 4 is a measurement, not a test -- it is *expected*
to disagree, and the size and direction of the disagreement is the reason the
feed supersedes the PDFs. Read it as "here is what modelling span x headway got
wrong", not as "here is a discrepancy to reconcile".

Run ingest_blr.py first (this needs data/service_levels.csv).
    python3 verify_proposed_gtfs.py
"""

import csv
import sys
from collections import defaultdict
from pathlib import Path

import gtfs
from analyze_frequency_change import (PERIODS, PKEYS, parse_clock, period_of,
                                      span_overlap, to_axis)

DATA = Path("data")
PERIOD_MINUTES = {k: p1 - p0 for k, p0, p1 in PERIODS}


def published():
    """{day: {route: {'span': (s, e), 'headway': {period: minutes}}}} from PDFs."""
    out = {d: {} for d in gtfs.DAYS}
    for r in csv.DictReader(open(DATA / "service_levels.csv")):
        day = r["day_type"]
        name = (r["final_route"] or "").strip()
        if day not in out or not name:
            continue
        s, e = parse_clock(r["start_time"] or ""), parse_clock(r["end_time"] or "")
        if s is None or e is None:
            continue
        if e <= s:
            e += 1440
        out[day][name] = {
            "span": (s, e),
            "headway": {k: int(r[k]) for k in PKEYS
                        if (r.get(k) or "").strip().isdigit()
                        and int(r[k]) > 0},
        }
    return out


def modelled_trips(entry):
    """Trips per direction per period the PDF implies -- the old proposed side.

    This is `proposed_route_trips()` as analyze_frequency_change.py used to
    compute it, kept here so the comparison is against what the repo actually
    published rather than against a fresh interpretation of the PDFs.
    """
    s, e = entry["span"]
    return {k: (span_overlap(p0, p1, s, e) / entry["headway"][k]
                if k in entry["headway"] else 0.0)
            for k, p0, p1 in PERIODS}


def main():
    pdf = published()
    feed = gtfs.proposed()
    svc = gtfs.load_service(feed, gtfs.SAMPLE["proposed"],
                            period_of=period_of, to_axis=to_axis, quiet=True)
    route_days, route_periods, spans = svc.route_days, svc.route_periods, svc.route_spans
    bus = set(route_days)

    print(f"proposed GTFS feed_version: {svc.version}")
    print(f"bus routes in feed: {len(bus)}\n")

    failures = []

    # --- 1. route set ------------------------------------------------------
    pdf_routes = {r for day in pdf.values() for r in day}
    print("=" * 72)
    print("1. ROUTE SET".center(72))
    print("=" * 72)
    only_pdf = sorted(pdf_routes - bus)
    only_gtfs = sorted(bus - pdf_routes)
    print(f"  bus routes in PDFs: {len(pdf_routes)}   in GTFS: {len(bus)}")
    print(f"  in PDFs but not GTFS: {only_pdf or 'none'}")
    print(f"  in GTFS but not PDFs: {only_gtfs or 'none'}")
    if only_pdf or only_gtfs:
        failures.append("route sets differ")

    cw = set()
    for c in csv.DictReader(open(DATA / "route_crosswalk.csv")):
        if c["final_route"] and c["final_route"] != "-":
            cw.add(c["final_route"].split()[0])
    print(f"\n  in GTFS but not the crosswalk: {sorted(bus - cw)}")
    print("    (the crosswalk lists no short-turn/school variants; the PDFs do)")

    # --- 2. day types ------------------------------------------------------
    print("\n" + "=" * 72)
    print("2. DAY TYPES PER ROUTE".center(72))
    print("=" * 72)
    disagree = []
    for r in sorted(bus):
        pdf_days = {d for d in gtfs.DAYS if pdf[d].get(r, {}).get("headway")}
        gtfs_days = route_days.get(r, set())
        if pdf_days and pdf_days != gtfs_days:
            disagree.append((r, sorted(gtfs_days), sorted(pdf_days)))
    print(f"  routes compared: {len(bus)}   disagreements: {len(disagree)}")
    for r, g, p in disagree:
        print(f"    {r:6s} gtfs={g} pdf={p}")
    if disagree:
        failures.append(f"{len(disagree)} routes disagree on day types")

    # --- 3. span -----------------------------------------------------------
    print("\n" + "=" * 72)
    print("3. SPAN OF SERVICE".center(72))
    print("=" * 72)
    start_off, end_off = [], []
    for day in gtfs.DAYS:
        for r, entry in pdf[day].items():
            got = spans.get(day, {}).get(r)
            if not got or got[0] is None:
                continue
            start_off.append((abs(got[0] - entry["span"][0]), day, r,
                              entry["span"][0], got[0]))
            end_off.append((got[1] - entry["span"][1], day, r,
                            entry["span"][1], got[1]))
    exact = sum(1 for d, *_ in start_off if d == 0)
    print(f"  first departure matches the published start exactly: "
          f"{exact} of {len(start_off)} route-days")
    for d, day, r, p, g in sorted(start_off, reverse=True)[:5]:
        if d:
            print(f"    {r:6s} {day:9s} published {p//60:02d}:{p%60:02d} "
                  f"first departure {g//60:02d}:{g%60:02d}")
    if exact < 0.9 * len(start_off):
        failures.append("published start times do not match the feed")

    later = [e for e in end_off if e[0] > 0]
    print(f"\n  last departure is LATER than the published end on "
          f"{len(later)} of {len(end_off)} route-days")
    if later:
        med = sorted(e[0] for e in later)[len(later) // 2]
        print(f"    median overrun: {med} minutes")
    print("    The published end is the last departure from the anchor; the "
          "feed's is the\n    last departure anywhere on the route. This is a "
          "definition gap, not a conflict,\n    and it is why the PDFs "
          "undercount late-evening and owl service.")

    # --- 4. service volume -------------------------------------------------
    print("\n" + "=" * 72)
    print("4. SERVICE VOLUME: what modelling span x headway got wrong".center(72))
    print("=" * 72)
    print("  Trips are whole-route totals (both directions), so the PDF side is")
    print("  doubled from its per-direction figure.\n")
    print(f"  {'day':10s} {'PDF-modelled':>13s} {'GTFS actual':>12s} {'diff':>9s}")
    for day in gtfs.DAYS:
        m = sum(sum(modelled_trips(e).values()) * 2 for e in pdf[day].values())
        a = sum(sum(p.values()) for r, p in route_periods[day].items())
        print(f"  {day:10s} {m:13,.0f} {a:12,.0f} {(a - m) / m:+9.1%}")

    print(f"\n  Weekday, by period:")
    print(f"  {'period':14s} {'PDF-modelled':>13s} {'GTFS actual':>12s} {'diff':>9s}")
    for k in PKEYS:
        m = sum(modelled_trips(e)[k] * 2 for e in pdf["weekday"].values())
        a = sum(p.get(k, 0) for p in route_periods["weekday"].values())
        pct = f"{(a - m) / m:+.1%}" if m else "n/a"
        print(f"  {k:14s} {m:13,.0f} {a:12,.0f} {pct:>9s}")
    print("\n    The late and owl rows are the span definition above, cashed out.")

    print(f"\n  Routes the PDF model most overstates (weekday, both directions):")
    diff = []
    for r, e in pdf["weekday"].items():
        m = sum(modelled_trips(e).values()) * 2
        a = sum(route_periods["weekday"].get(r, {}).values())
        if m:
            diff.append((a - m, r, m, a))
    for d, r, m, a in sorted(diff)[:8]:
        print(f"    {r:6s} modelled {m:6.0f}  actual {a:6.0f}  {d:+7.0f}")
    print("    Peak-only routes: span x headway cannot express a midday gap, so")
    print("    the model runs them all day.")

    print(f"\n  Routes the PDF model most understates:")
    for d, r, m, a in sorted(diff, reverse=True)[:8]:
        print(f"    {r:6s} modelled {m:6.0f}  actual {a:6.0f}  {d:+7.0f}")

    # --- verdict -----------------------------------------------------------
    print("\n" + "=" * 72)
    if failures:
        print("VERDICT: DISAGREEMENT -- do not treat this feed as the final plan")
        for f in failures:
            print(f"  - {f}")
        return 1
    print("VERDICT: the feed agrees with the published plan on route set, day")
    print("types and service start times. It is safe to treat as the Proposed")
    print("Final Network, and it supersedes the PDFs for service volume.")
    print("=" * 72)
    return 0


if __name__ == "__main__":
    sys.exit(main())
