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

THE UNIVERSE IS THE GTFS, not the usage extract. Every stop the current feed
serves -- all modes, since the question here is whether the corner keeps a
vehicle at all -- is a measured location, whether or not the usage extract has
a row for it under that id. Boardings are then joined onto that location by
id, and carried across a renumbering only where the match is unambiguous (see
FORMER_ID_MAX_M and usage_by_stop below); everywhere else boardings are
UNKNOWN, written as an empty CSV cell and never coerced to zero, because
"nobody boards here" and "nobody can have boarded here under this id" are
different claims. `boardings_source` on every output row says which of the
three applies. Building the universe from the usage extract instead used to
drop 533 stops a bus calls at every day -- the whole of Friendship Avenue and
Penn Avenue through Garfield among them -- because a renumbering leaves the
retired id with ridership and no service and the current id with service and
no ridership, and neither survives a "served and has boardings" gate.

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

# The same renumbering, read from the other end. PRT reissues a stop's id and
# the boardings extract keeps the old one, so a join on the id alone drops the
# location from both sides at once: the retired code has ridership but no
# service, the current code has service but no ridership, and neither survives
# a `served and has boardings` gate. That is how 533 stops a bus calls at every
# day -- the whole of Friendship Avenue and Penn Avenue through Garfield among
# them -- came to be measured nowhere and drawn nowhere.
#
# So the universe is the GTFS: every stop some bus actually calls at is a
# measured location. Boardings are then attached by id where the id survived,
# and carried across a renumbering only where the match can only mean one
# thing -- exactly one retired code within this radius, wanted by exactly one
# current stop. The extract's coordinates are published to four decimals, about
# 11 m, so this is tight enough that only the same pole clears it and loose
# enough to absorb that rounding; opposite kerbs of one corner usually both
# clear it, which is precisely the ambiguity that disqualifies them.
#
# Everywhere else the location is still measured and its boardings are UNKNOWN,
# never zero. Convention 15 draws that line on the proposed side, where a stop
# that has never run can have no observed count; a renumbered stop is the same
# gap arriving on the current side, and writing 0 would state a finding about
# riders that no observation supports.
FORMER_ID_MAX_M = 25

BOARDINGS_BY_ID = "id"
BOARDINGS_BY_FORMER_ID = "former_id"
BOARDINGS_UNKNOWN = "none"


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


def usage_by_stop(usage, coords, *, bus_only=True):
    """Every served stop -> (its boardings row or None, where the row came from).

    `coords` is the universe: GTFS stop id -> (lat, lon) for the stops some
    vehicle calls at. Every one of them comes back, so no caller can silently
    drop a location by iterating the boardings extract instead. See
    FORMER_ID_MAX_M for why a retired id may donate its boardings and when it
    may not.
    """
    totals = {r["stop_code"]: r for r in usage
              if r["route_code"] == "All Routes"
              and (not bus_only or r["mode"] == "BUS")}

    joined = {sid: (totals[sid], BOARDINGS_BY_ID) for sid in coords
              if sid in totals}
    unclaimed = {sid: coords[sid] for sid in coords if sid not in joined}

    retired = [(fnum(r["stop_lat"]), fnum(r["stop_lon"]), code)
               for code, r in totals.items() if code not in coords]
    cell = FORMER_ID_MAX_M / 111_320 * 2
    grid = defaultdict(list)
    for lat, lon, code in retired:
        grid[(int(lat / cell), int(lon / cell))].append((lat, lon, code))

    # Resolve the two ambiguities in one pass: a stop wanting more than one
    # retired code, and a retired code wanted by more than one stop.
    wanted = {}
    for sid, (lat, lon) in unclaimed.items():
        near = [code for plat, plon, code in near_grid(lat, lon, grid, cell)
                if nearest_m(lat, lon, [(plat, plon)]) <= FORMER_ID_MAX_M]
        if len(near) == 1:
            wanted.setdefault(near[0], []).append(sid)

    inherited = {sids[0]: code for code, sids in wanted.items() if len(sids) == 1}
    for sid in unclaimed:
        code = inherited.get(sid)
        joined[sid] = ((totals[code], BOARDINGS_BY_FORMER_ID) if code
                       else (None, BOARDINGS_UNKNOWN))
    return joined


def served_today():
    """Stop ids that actually have trips in the current feed, their routes,
    their coordinates, and their GTFS names.

    All modes, not bus only: the question is whether the corner keeps a
    vehicle, and a stop that keeps only the T has not lost all service. Coords
    and names come from here too, rather than from the usage extract, because
    the extract is no longer the universe -- see usage_by_stop above.
    """
    feed = gtfs.current()
    routes, all_coords = gtfs.stop_routes(feed, bus_only=False)
    coords = {sid: all_coords[sid] for sid in routes if sid in all_coords}
    names = {s["stop_id"]: s["stop_name"] for s in feed.rows("stops.txt")}
    return set(routes), routes, coords, names


def main():
    print("Loading sources...")
    usage = load_usage()
    stops_now, stop_routes_now, stops_coords, stop_names_now = served_today()

    # The proposed side, from PRT's own feed. All modes, to match served_today().
    prop_routes, prop_coords = gtfs.stop_routes(gtfs.proposed(), bus_only=False)
    prop_served = set(prop_routes)

    cross = list(csv.DictReader(open(DATA / "route_crosswalk.csv")))
    discontinued = {r["current_route"].split()[0] for r in cross
                    if r["category"] == "Discontinued" and r["current_route"] != "-"}

    # The universe is every stop the current GTFS serves, not every stop with
    # a row in the usage extract -- see usage_by_stop's docstring. All modes,
    # matching served_today(), since a retired code can belong to a T stop
    # exactly as it can a bus stop.
    joined = usage_by_stop(usage, stops_coords, bus_only=False)
    unknown = sum(1 for _u, source in joined.values()
                  if source == BOARDINGS_UNKNOWN)

    by_route = defaultdict(dict)
    for r in usage:
        if r["route_code"] != "All Routes":
            by_route[r["stop_code"]][r["route_code"]] = r

    print(f"  served today={len(stops_now)}  proposed-served={len(prop_served)}  "
          f"boardings unknown for {unknown} of them\n")

    # ---- A. stops losing all service ------------------------------------
    # Coordinates of every stop the proposal actually serves, for the
    # walk-radius test below.
    served_pts = [prop_coords[c] for c in prop_served if c in prop_coords]
    cell = WALK_RADIUS_M / 111_320 * 2
    grid = build_grid(served_pts, cell)

    # Coordinates now come from the GTFS for every row (see served_today()),
    # so unlike the old usage-extract universe there is no longer a stop with
    # no coordinates to test the walk radius against.
    rows = []
    for code in sorted(stops_now):
        lat, lon = stops_coords[code]
        if code in prop_served:
            status, dist = "kept", 0.0
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
        u, source = joined[code]
        rows.append({
            "stop_id": code,
            "stop_name": u["stop_name"] if u else stop_names_now.get(code, ""),
            "muni": (u["MUNI"] or "") if u else "",
            "hood": (u["HOOD"] or "") if u else "",
            "lat": round(lat, 6), "lon": round(lon, 6),
            "status": status,
            "metres_to_nearest_proposed_stop": (
                "" if dist == float("inf") else round(dist)),
            "weekday_boardings": (
                "" if u is None else round(fnum(u[f"B_W_{MONTH}"]), 2)),
            "saturday_boardings": (
                "" if u is None else round(fnum(u[f"B_S_{MONTH}"]), 2)),
            "sunday_boardings": (
                "" if u is None else round(fnum(u[f"B_U_{MONTH}"]), 2)),
            "current_routes": ";".join(sorted(stop_routes_now.get(code, ()))),
            "boardings_source": source,
        })

    lost = [r for r in rows if r["status"] == "loses_all_service"]
    kept = [r for r in rows if r["status"].startswith("kept")]
    nearby = [r for r in rows if r["status"] == "kept_nearby"]
    unknown_rows = [r for r in rows if r["boardings_source"] == BOARDINGS_UNKNOWN]
    tot_wk = sum(fnum(r["weekday_boardings"]) for r in rows)

    print("=" * 68)
    print("A. STOPS LOSING ALL SERVICE".center(68))
    print("=" * 68)
    print(f"  stops analysed (every stop the current GTFS serves): {len(rows)}")
    print(f"  boardings unknown (renumbered, no unambiguous match): "
          f"{len(unknown_rows)}  <- never counted as zero")
    print(f"  kept, same stop id:      {len(kept) - len(nearby):5d}  "
          f"{sum(fnum(r['weekday_boardings']) for r in kept) - sum(fnum(r['weekday_boardings']) for r in nearby):10,.0f} wkdy boardings")
    print(f"  kept, stop within {WALK_RADIUS_M}m: {len(nearby):5d}  "
          f"{sum(fnum(r['weekday_boardings']) for r in nearby):10,.0f} wkdy boardings"
          f"   <- renumbered/shifted, not lost")
    print(f"  lose all service:        {len(lost):5d}  "
          f"{sum(fnum(r['weekday_boardings']) for r in lost):10,.0f} wkdy boardings"
          f"  ({sum(fnum(r['weekday_boardings']) for r in lost) / tot_wk:.1%} of system)")

    print("\n  Highest-ridership stops losing all service "
          f"(no proposed stop within {WALK_RADIUS_M}m):")
    for r in sorted(lost, key=lambda x: -fnum(x["weekday_boardings"]))[:15]:
        place = r["hood"] or r["muni"].split("(")[0].strip()
        print(f"    {fnum(r['weekday_boardings']):8.1f}  {r['stop_name'][:42]:42s} "
              f"{place[:20]:20s} {r['metres_to_nearest_proposed_stop']:>6}m "
              f"[{r['current_routes'][:18]}]")

    print("\n  Most-affected places (weekday boardings at stops losing service):")
    place_tot = defaultdict(float)
    for r in lost:
        place_tot[r["hood"] or r["muni"].split("(")[0].strip() or "?"] += \
            fnum(r["weekday_boardings"])
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
        w.writerows(sorted(rows, key=lambda x: -fnum(x["weekday_boardings"])))
    print(f"\nWrote {out} ({len(rows)} rows)")
    print("\nNOTE: boardings are May 2025 daily averages - the most recent month\n"
          "      PRT has published at stop level, and 'unadjusted, unofficial\n"
          "      totals' by PRT's own disclaimer, which may understate ridership\n"
          "      by up to 30%. Both networks' stop inventories now come from\n"
          "      GTFS, so a stop absent from the proposal is absent: the\n"
          "      'unverifiable' tier the Remix 2023 base map forced is retired.")


if __name__ == "__main__":
    main()
