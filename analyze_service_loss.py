#!/usr/bin/env python3
"""
Which stops lose service under the Bus Line Refresh, weighted by boardings.

Joins three sources on the numeric GTFS stop id:
  - current GTFS stop_times  -> which stops are served today
  - proposed GTFS stop_times -> which stops are served in the proposal
  - PRT stop usage, May 2025 -> average daily boardings per stop and per route

Two questions, deliberately kept separate:
  A. Which stops lose ALL service, and how many boardings sit at them?
  B. Which riders lose THEIR route, even where the stop keeps other service?

THE CONFIDENCE TIER IS GONE, and that is the point of this revision.

The proposed side used to come from the Remix public map, whose base feed is
2023. A stop served today and absent from Remix could therefore be either a
stop the plan drops or a stop built after 2023, and the two were
indistinguishable from inside the repo -- so anything in that position went
into an "unverifiable" bucket and was kept out of the headline. Sixteen stops
sat there.

PRT's own GTFS for the proposed network settles it: the feed is authoritative
about which stops the proposal serves, so absence is absence. All 16 formerly
unverifiable stops are genuine losses. Remix turns out to have been close --
5,513 of its 5,515 served stops are in PRT's feed -- but it also carried 107
stops the proposal does not serve, which is exactly the error the tier existed
to absorb.

What has NOT changed is the walk-radius check below. Stop ids are still
renumbered, consolidated and nudged across intersections between feeds, so a
vanished id is still not a lost bus, and every stop flagged as losing service
is still checked against the nearest stop the proposal actually serves.

Run ingest_blr.py first.  Usage: python3 analyze_service_loss.py
"""

import csv
import json
import urllib.request
import urllib.parse
from collections import defaultdict
from pathlib import Path

import gtfs

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
    """Stop ids that actually have trips in the current feed, and their routes.

    All modes, not bus only: the question is whether the corner keeps a
    vehicle, and a stop that keeps only the T has not lost all service.
    """
    routes, _coords = gtfs.stop_routes(gtfs.current(), bus_only=False)
    return set(routes), routes


def main():
    print("Loading sources...")
    usage = load_usage()
    stops_now, stop_routes_now = served_today()

    # The proposed side, from PRT's own feed. All modes, to match served_today().
    prop_routes, prop_coords = gtfs.stop_routes(gtfs.proposed(), bus_only=False)
    prop_served = set(prop_routes)

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
    served_pts = [prop_coords[c] for c in prop_served if c in prop_coords]
    cell = WALK_RADIUS_M / 111_320 * 2
    grid = build_grid(served_pts, cell)

    rows = []
    for code, u in totals.items():
        if code not in stops_now:
            continue  # not served today; nothing to lose
        lat, lon = fnum(u["stop_lat"]), fnum(u["stop_lon"])
        if code in prop_served:
            status, dist = "kept", 0.0
        elif not (lat and lon):
            # No coordinates in the usage extract, so the walk-radius test
            # cannot run. The proposed feed still says the stop is unserved.
            status, dist = "loses_all_service_unplaced", float("inf")
        else:
            # Fast path first; fall back to an exact scan so the reported
            # distance is real rather than "somewhere beyond the grid".
            dist = nearest_m(lat, lon, near_grid(lat, lon, grid, cell))
            if dist > WALK_RADIUS_M:
                dist = nearest_m(lat, lon, served_pts)
            # Another served stop right there means the stop id changed, not
            # that the service went away.
            status = ("kept_nearby" if dist <= WALK_RADIUS_M
                      else "loses_all_service")
        rows.append({
            "stop_id": code,
            "stop_name": u["stop_name"],
            "muni": u["MUNI"] or "",
            "hood": u["HOOD"] or "",
            "lat": u["stop_lat"], "lon": u["stop_lon"],
            "status": status,
            "metres_to_nearest_proposed_stop": (
                "" if dist == float("inf") else round(dist)),
            "weekday_boardings": round(fnum(u[f"B_W_{MONTH}"]), 2),
            "saturday_boardings": round(fnum(u[f"B_S_{MONTH}"]), 2),
            "sunday_boardings": round(fnum(u[f"B_U_{MONTH}"]), 2),
            "current_routes": ";".join(sorted(stop_routes_now.get(code, ()))),
        })

    lost = [r for r in rows if r["status"] == "loses_all_service"]
    unplaced = [r for r in rows if r["status"] == "loses_all_service_unplaced"]
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
    if unplaced:
        print(f"  unplaced (no coords):    {len(unplaced):5d}  "
              f"{sum(r['weekday_boardings'] for r in unplaced):10,.0f} wkdy "
              f"boardings  <- unserved, but the walk test could not run")

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
    print("\nNOTE: boardings are May 2025 daily averages - the most recent month\n"
          "      PRT has published at stop level, and 'unadjusted, unofficial\n"
          "      totals' by PRT's own disclaimer, which may understate ridership\n"
          "      by up to 30%. Both networks' stop inventories now come from\n"
          "      GTFS, so a stop absent from the proposal is absent: the\n"
          "      'unverifiable' tier the Remix 2023 base map forced is retired.")


if __name__ == "__main__":
    main()
