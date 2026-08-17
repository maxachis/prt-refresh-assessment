#!/usr/bin/env python3
"""
Which stops lose service under the Bus Line Refresh, weighted by boardings.

Joins three sources on the numeric GTFS stop id:
  - current GTFS stop_times  -> which stops are served today
  - proposed_stop_sequences  -> which stops are served in the proposal (Remix)
  - PRT stop usage, May 2025 -> average daily boardings per stop and per route

Two questions, deliberately kept separate:
  A. Which stops lose ALL service, and how many boardings sit at them?
  B. Which riders lose THEIR route, even where the stop keeps other service?

Confidence tiering matters here. The Remix map is built on a 2023 base feed, so
a stop that is served today but missing from Remix entirely may have been added
after 2023 rather than dropped by the plan. Those are reported separately as
"unverifiable" and are never mixed into the headline.

Run ingest_blr.py first.  Usage: python3 analyze_service_loss.py
"""

import csv
import io
import json
import urllib.request
import urllib.parse
import zipfile
from collections import defaultdict
from pathlib import Path

DATA = Path("data")
RAW = DATA / "raw"
MONTH = "202505"  # latest month with published stop-level boardings

USAGE_URL = ("https://services3.arcgis.com/544gNI3xxlFIWuTc/arcgis/rest/"
             "services/PRT_Bus_Stop_Usage_Unweighted/FeatureServer/0/query")
USAGE_FIELDS = ("stop_id,stop_code,stop_name,stop_lat,stop_lon,mode,mode_type,"
                f"route_code,MUNI,HOOD,B_W_{MONTH},B_S_{MONTH},B_U_{MONTH}")


# A stop id that vanishes does not mean the corner loses its bus: stops get
# renumbered, consolidated, or nudged across an intersection. Any stop flagged
# as losing service is therefore checked against the nearest stop the proposal
# actually serves, and only counted if no proposed stop is within this radius.
WALK_RADIUS_M = 150


def fnum(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return 0.0


def nearest_m(lat, lon, points):
    """Metres to the closest point in `points` (an iterable of lat/lon)."""
    import math
    coslat = math.cos(math.radians(lat))
    best = float("inf")
    for plat, plon in points:
        dlat = (plat - lat) * 111_320
        dlon = (plon - lon) * 111_320 * coslat
        d = dlat * dlat + dlon * dlon
        if d < best:
            best = d
    return math.sqrt(best)


def near_grid(lat, lon, grid, cell):
    """Candidate points from the cell containing (lat, lon) and its neighbours."""
    ky, kx = int(lat / cell), int(lon / cell)
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            yield from grid.get((ky + dy, kx + dx), ())


def build_grid(points, cell):
    grid = defaultdict(list)
    for lat, lon in points:
        grid[(int(lat / cell), int(lon / cell))].append((lat, lon))
    return grid


def load_usage():
    """Stop-level boardings, paginated out of the ArcGIS feature service."""
    cache = RAW / f"stop_usage_{MONTH}.csv"
    if cache.exists():
        return list(csv.DictReader(open(cache, encoding="utf-8")))

    rows, offset = [], 0
    while True:
        q = urllib.parse.urlencode({
            "where": "1=1", "outFields": USAGE_FIELDS, "returnGeometry": "false",
            "resultOffset": offset, "resultRecordCount": 2000, "f": "json"})
        req = urllib.request.Request(f"{USAGE_URL}?{q}",
                                     headers={"User-Agent": "Mozilla/5.0"})
        feats = json.loads(urllib.request.urlopen(req, timeout=180).read()).get(
            "features", [])
        rows += [f["attributes"] for f in feats]
        if len(feats) < 2000:
            break
        offset += 2000

    cache.parent.mkdir(parents=True, exist_ok=True)
    with open(cache, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=USAGE_FIELDS.split(","))
        w.writeheader()
        w.writerows(rows)
    return rows


def served_today():
    """Stop ids that actually have trips in the current feed, and their routes."""
    z = zipfile.ZipFile(RAW / "current_gtfs.zip")
    trip_route = {t["trip_id"]: t["route_id"]
                  for t in csv.DictReader(
                      io.TextIOWrapper(z.open("trips.txt"), "utf-8-sig"))}
    stops, stop_routes = set(), defaultdict(set)
    for st in csv.DictReader(io.TextIOWrapper(z.open("stop_times.txt"), "utf-8-sig")):
        sid = st["stop_id"]
        stops.add(sid)
        r = trip_route.get(st["trip_id"])
        if r:
            stop_routes[sid].add(r)
    return stops, stop_routes


def main():
    print("Loading sources...")
    usage = load_usage()
    stops_now, stop_routes_now = served_today()

    prop_stops = list(csv.DictReader(open(DATA / "proposed_stops.csv")))
    uuid_to_gtfs = {s["stop_uuid"]: s["gtfs_stop_id"] for s in prop_stops}
    remix_inventory = {s["gtfs_stop_id"] for s in prop_stops if s["gtfs_stop_id"]}

    seqs = list(csv.DictReader(open(DATA / "proposed_stop_sequences.csv")))
    prop_served = {uuid_to_gtfs.get(r["stop_uuid"]) for r in seqs}
    prop_served.discard("")
    prop_served.discard(None)

    cross = list(csv.DictReader(open(DATA / "route_crosswalk.csv")))
    discontinued = {r["current_route"].split()[0] for r in cross
                    if r["category"] == "Discontinued" and r["current_route"] != "-"}

    # Boardings per stop (the "All Routes" row) and per stop x route.
    totals = {r["stop_code"]: r for r in usage if r["route_code"] == "All Routes"}
    by_route = defaultdict(dict)
    for r in usage:
        if r["route_code"] != "All Routes":
            by_route[r["stop_code"]][r["route_code"]] = r

    print(f"  usage stops={len(totals)}  served today={len(stops_now)}  "
          f"proposed-served={len(prop_served)}\n")

    # ---- A. stops losing all service ------------------------------------
    # Coordinates of every stop the proposal actually serves, for the
    # walk-radius test below.
    coords = {s["gtfs_stop_id"]: (float(s["lat"]), float(s["lon"]))
              for s in prop_stops if s["gtfs_stop_id"]}
    served_pts = [coords[c] for c in prop_served if c in coords]
    cell = WALK_RADIUS_M / 111_320 * 2
    grid = build_grid(served_pts, cell)

    rows = []
    for code, u in totals.items():
        if code not in stops_now:
            continue  # not served today; nothing to lose
        lat, lon = fnum(u["stop_lat"]), fnum(u["stop_lon"])
        if code in prop_served:
            status, tier, dist = "kept", "confirmed", 0.0
        elif not (lat and lon):
            status, tier, dist = "loses_all_service", "unverifiable", float("inf")
        else:
            # Fast path first; fall back to an exact scan so the reported
            # distance is real rather than "somewhere beyond the grid".
            dist = nearest_m(lat, lon, near_grid(lat, lon, grid, cell))
            if dist > WALK_RADIUS_M:
                dist = nearest_m(lat, lon, served_pts)
            if dist <= WALK_RADIUS_M:
                # Another served stop is right there - the stop id changed,
                # the service did not go away.
                status, tier = "kept_nearby", "confirmed"
            elif code in remix_inventory:
                status, tier = "loses_all_service", "confirmed"
            else:
                status, tier = "loses_all_service", "unverifiable"
        rows.append({
            "stop_id": code,
            "stop_name": u["stop_name"],
            "muni": u["MUNI"] or "",
            "hood": u["HOOD"] or "",
            "lat": u["stop_lat"], "lon": u["stop_lon"],
            "status": status,
            "confidence": tier,
            "metres_to_nearest_proposed_stop": (
                "" if dist == float("inf") else round(dist)),
            "weekday_boardings": round(fnum(u[f"B_W_{MONTH}"]), 2),
            "saturday_boardings": round(fnum(u[f"B_S_{MONTH}"]), 2),
            "sunday_boardings": round(fnum(u[f"B_U_{MONTH}"]), 2),
            "current_routes": ";".join(sorted(stop_routes_now.get(code, ()))),
        })

    lost = [r for r in rows if r["status"] == "loses_all_service"
            and r["confidence"] == "confirmed"]
    unver = [r for r in rows if r["status"] == "loses_all_service"
             and r["confidence"] == "unverifiable"]
    kept = [r for r in rows if r["status"].startswith("kept")]
    nearby = [r for r in rows if r["status"] == "kept_nearby"]
    tot_wk = sum(r["weekday_boardings"] for r in rows)

    print("=" * 68)
    print("A. STOPS LOSING ALL SERVICE".center(68))
    print("=" * 68)
    print(f"  stops analysed (served today, with ridership data): {len(rows)}")
    print(f"  kept, same stop id:      {len(kept) - len(nearby):5d}  "
          f"{sum(r['weekday_boardings'] for r in kept) - sum(r['weekday_boardings'] for r in nearby):10,.0f} wkdy boardings")
    print(f"  kept, stop within {WALK_RADIUS_M}m: {len(nearby):5d}  "
          f"{sum(r['weekday_boardings'] for r in nearby):10,.0f} wkdy boardings"
          f"   <- renumbered/shifted, not lost")
    print(f"  lose all service:        {len(lost):5d}  "
          f"{sum(r['weekday_boardings'] for r in lost):10,.0f} wkdy boardings"
          f"  ({sum(r['weekday_boardings'] for r in lost) / tot_wk:.1%} of system)")
    print(f"  unverifiable (see note): {len(unver):5d}  "
          f"{sum(r['weekday_boardings'] for r in unver):10,.0f} wkdy boardings")

    print("\n  Highest-ridership stops losing all service "
          f"(no proposed stop within {WALK_RADIUS_M}m):")
    for r in sorted(lost, key=lambda x: -x["weekday_boardings"])[:15]:
        place = r["hood"] or r["muni"].split("(")[0].strip()
        print(f"    {r['weekday_boardings']:8.1f}  {r['stop_name'][:42]:42s} "
              f"{place[:20]:20s} {r['metres_to_nearest_proposed_stop']:>6}m "
              f"[{r['current_routes'][:18]}]")

    print("\n  Most-affected places (weekday boardings at stops losing service):")
    place_tot = defaultdict(float)
    for r in lost:
        place_tot[r["hood"] or r["muni"].split("(")[0].strip() or "?"] += \
            r["weekday_boardings"]
    for p, v in sorted(place_tot.items(), key=lambda x: -x[1])[:12]:
        print(f"    {v:8.1f}  {p}")

    # ---- B. riders losing their route ------------------------------------
    print("\n" + "=" * 68)
    print("B. RIDERS LOSING THEIR ROUTE (stop may keep other service)".center(68))
    print("=" * 68)
    route_tot = defaultdict(float)
    route_stops = defaultdict(int)
    for code, routes in by_route.items():
        for rc, r in routes.items():
            if rc in discontinued:
                b = fnum(r[f"B_W_{MONTH}"])
                route_tot[rc] += b
                route_stops[rc] += 1
    print(f"  discontinued routes with ridership data: {len(route_tot)} "
          f"of {len(discontinued)}")
    print(f"  total weekday boardings on discontinued routes: "
          f"{sum(route_tot.values()):,.0f}\n")
    print(f"    {'route':6s} {'wkdy boardings':>15s} {'stops':>7s}")
    for rc, v in sorted(route_tot.items(), key=lambda x: -x[1]):
        print(f"    {rc:6s} {v:15,.0f} {route_stops[rc]:7d}")

    out = DATA / "stop_service_change.csv"
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(sorted(rows, key=lambda x: -x["weekday_boardings"]))
    print(f"\nWrote {out} ({len(rows)} rows)")
    print(f"\nNOTE: boardings are May 2025 daily averages - the most recent month\n"
          f"      PRT has published at stop level. 'unverifiable' stops are served\n"
          f"      today but absent from the Remix 2023 base map, so a drop cannot\n"
          f"      be distinguished from a post-2023 stop addition. Verify those\n"
          f"      individually before citing them.")


if __name__ == "__main__":
    main()
