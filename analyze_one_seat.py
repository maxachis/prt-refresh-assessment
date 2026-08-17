#!/usr/bin/env python3
"""
One-seat-ride change under the Bus Line Refresh.

Answers BASE_CAMP GAIN/LOSE-ONE-SEAT-DOWNTOWN and GAIN/LOSE-ONE-SEAT-OAKLAND:
which communities can reach an anchor destination without transferring today,
which can under the proposal, and the difference.

The unit of analysis is the **place** (city neighbourhood, else municipality),
not the stop. That is deliberate. Run this per stop and the answer is wrong: at
a corridor location adjacent stop ids split the route set, so Fifth Ave at
Chesterfield (stop 38) looks like it keeps only route 93 while its twin across
the intersection (stop 36) holds the other sixteen. A place is also the unit the
question actually asks about.

Four controls earn their keep here; all of them changed the answer:

1. **Reach is measured over every served stop**, not just the place-labelled
   ones. PRT's usage extract covers bus stops only, so restricting the anchor
   test to labelled stops silently dropped 61A's Downtown terminus and made
   Braddock look like it had no Downtown service today.
2. **Both networks are placed the same way.** Rail stations carry no bus-usage
   record, so labelling the current network from PRT's field while inheriting
   labels on the proposed side invented one-seat "gains" on the T.
3. **Boardings come from the `All Routes` row.** The extract is one row per
   stop *per route* plus a total row; summing every row double-counts, and
   taking the last row read picks an arbitrary single route.
4. **Geographic outliers are dropped.** PRT labels two stops on 6th St in
   Braddock as "Westwood" -- 16 km from every other Westwood stop -- which
   handed Westwood a phantom 61A/61B one-seat ride to Oakland to lose.

Everything reads from raw sources -- both GTFS feeds and the PRT stop-usage
extract -- so this does not depend on the other analysis scripts' outputs.
The proposed side came from the Remix map until PRT supplied a GTFS for the
proposed network; see gtfs.py for why that feed supersedes it.

    python3 analyze_one_seat.py   # -> data/oneseat_change.csv
"""

import csv
import math
import statistics
import sys
from collections import defaultdict
from pathlib import Path

import gtfs

DATA = Path("data")
RAW = DATA / "raw"
MONTH = "202505"

# A route "serves" an anchor if it stops within this far of a stop sitting in
# the anchor district today. Applied identically to both networks.
ANCHOR_RADIUS_M = 200

# A stop with no place label of its own inherits the place of the nearest
# labelled stop within this radius; beyond it, it stays unplaced.
PLACE_RADIUS_M = 400

# PRT's HOOD field carries occasional gross errors. A labelled stop is treated
# as mislabelled when it sits further from its place's median position than
# both of these allow -- a floor, so small neighbourhoods keep a sane margin,
# and a multiple of the place's own median spread, so genuinely large
# municipalities are not clipped at their edges.
OUTLIER_FLOOR_M = 1_500
OUTLIER_SPREAD_MULT = 3.0

# Anchor districts, defined by the HOOD labels PRT ships in the usage extract.
ANCHORS = {
    "Downtown": {"Central Business District"},
    "Oakland": {"West Oakland", "Central Oakland", "North Oakland", "South Oakland"},
}

M_PER_DEG_LAT = 111_320.0
M_PER_DEG_LON = 84_000.0  # at Pittsburgh's latitude


# --------------------------------------------------------------------------
# geometry
# --------------------------------------------------------------------------

def metres(lat1, lon1, lat2, lon2):
    return math.hypot((lat1 - lat2) * M_PER_DEG_LAT, (lon1 - lon2) * M_PER_DEG_LON)


def build_grid(points, cell_m):
    """points: iterable of (lat, lon, payload) -> dict keyed by integer cell."""
    grid = defaultdict(list)
    for lat, lon, payload in points:
        grid[(int(lat * M_PER_DEG_LAT // cell_m),
              int(lon * M_PER_DEG_LON // cell_m))].append((lat, lon, payload))
    return grid


def near(lat, lon, grid, cell_m, radius_m):
    """Every payload within radius_m, paired with its distance."""
    cx = int(lat * M_PER_DEG_LAT // cell_m)
    cy = int(lon * M_PER_DEG_LON // cell_m)
    span = int(radius_m // cell_m) + 1
    out = []
    for i in range(cx - span, cx + span + 1):
        for j in range(cy - span, cy + span + 1):
            for plat, plon, payload in grid.get((i, j), ()):
                d = metres(plat, plon, lat, lon)
                if d <= radius_m:
                    out.append((d, payload))
    return out


def nearest(lat, lon, grid, cell_m, radius_m):
    hits = near(lat, lon, grid, cell_m, radius_m)
    return min(hits, key=lambda h: h[0])[1] if hits else None


# --------------------------------------------------------------------------
# sources
# --------------------------------------------------------------------------

def load_current():
    """From the published GTFS: stop -> routes serving it, and stop -> lat/lon.

    All modes, not bus only -- control 2 below requires both networks to be
    built the same way, and the proposed side carries rail too.
    """
    return gtfs.stop_routes(gtfs.current(), bus_only=False)


def load_labels():
    """stop id -> place label, and stop id -> weekday boardings.

    Join key is `stop_code`, the GTFS stop id (`stop_id` in this extract is an
    internal prefixed id that matches nothing). The file holds one row per stop
    per route plus a `route_code == "All Routes"` total; only the total is a
    stop-level boardings figure.
    """
    path = RAW / f"stop_usage_{MONTH}.csv"
    if not path.exists():
        sys.exit(f"missing {path} -- run analyze_service_loss.py first")

    label, boardings = {}, {}
    for r in csv.DictReader(open(path, encoding="utf-8")):
        sid = (r.get("stop_code") or "").strip()
        if not sid:
            continue
        place = (r.get("HOOD") or "").strip() or (r.get("MUNI") or "").strip()
        if place:
            label[sid] = place
        if (r.get("route_code") or "").strip() == "All Routes":
            try:
                boardings[sid] = float(r.get(f"B_W_{MONTH}") or 0)
            except ValueError:
                pass
    return label, boardings


def load_proposed():
    """Proposed stops some route actually serves: (lat, lon, routes).

    From PRT's own GTFS for the proposed network, not the Remix map. Remix was
    close on inventory -- 5,513 of 5,515 served stops agree -- but it also
    carried 107 stops the proposal does not serve, and it is built on a 2023
    base feed. Its route labels were Remix `short_name`s rather than GTFS route
    ids, which is the join this analysis depends on.
    """
    stop_routes, coords = gtfs.stop_routes(gtfs.proposed(), bus_only=False)
    return [(*coords[sid], routes) for sid, routes in stop_routes.items()
            if sid in coords]


def drop_outliers(label, coords):
    """Discard place labels that sit absurdly far from the rest of their place."""
    grouped = defaultdict(list)
    for sid, place in label.items():
        if sid in coords:
            grouped[place].append(sid)

    cleaned, dropped = {}, []
    for place, sids in grouped.items():
        mlat = statistics.median(coords[s][0] for s in sids)
        mlon = statistics.median(coords[s][1] for s in sids)
        dists = {s: metres(*coords[s], mlat, mlon) for s in sids}
        limit = max(OUTLIER_FLOOR_M,
                    OUTLIER_SPREAD_MULT * statistics.median(dists.values()))
        for s, d in dists.items():
            if d > limit:
                dropped.append((s, place, d, limit))
            else:
                cleaned[s] = place
    return cleaned, dropped


# --------------------------------------------------------------------------

def main():
    print("Loading current GTFS...")
    cur_stop_routes, cur_coords = load_current()
    label, boardings = load_labels()
    print("Loading proposed network...")
    prop_served = load_proposed()

    label, dropped = drop_outliers(label, cur_coords)
    if dropped:
        print(f"  dropped {len(dropped)} mislabelled stops of {len(label)+len(dropped)}:")
        for sid, place, d, limit in sorted(dropped, key=lambda x: -x[2])[:6]:
            print(f"    {sid:8s} labelled {place!r} but {d/1000:.1f} km away "
                  f"(limit {limit/1000:.1f} km)")

    # Served current stops, with coordinates. Reach is computed over all of
    # these; place grouping only over the ones that can be placed.
    cur_served = [(lat, lon, cur_coords[sid], sid, routes)
                  for sid, routes in cur_stop_routes.items()
                  if sid in cur_coords
                  for lat, lon in [cur_coords[sid]]]
    print(f"  current: {len(cur_served)} served stops, "
          f"proposed: {len(prop_served)} served stops")

    # --- anchor point clouds, from the current network ----------------------
    anchor_grid = {}
    for anchor, hoods in ANCHORS.items():
        pts = [(*cur_coords[sid], None) for sid, place in label.items()
               if place in hoods and sid in cur_coords]
        if not pts:
            sys.exit(f"anchor {anchor!r} matched no stops -- check HOOD labels")
        anchor_grid[anchor] = build_grid(pts, ANCHOR_RADIUS_M)
        print(f"  anchor {anchor}: {len(pts)} stops")

    def serves(lat, lon, anchor):
        return bool(near(lat, lon, anchor_grid[anchor],
                         ANCHOR_RADIUS_M, ANCHOR_RADIUS_M))

    # --- which routes reach each anchor, in each network --------------------
    reaches = {"current": {a: set() for a in ANCHORS},
               "proposed": {a: set() for a in ANCHORS}}

    for net, stops in (("current", [(la, lo, r) for la, lo, _, _, r in cur_served]),
                       ("proposed", prop_served)):
        for lat, lon, routes in stops:
            for a in ANCHORS:
                if not routes <= reaches[net][a] and serves(lat, lon, a):
                    reaches[net][a] |= routes

    for a in ANCHORS:
        print(f"  routes reaching {a}: {len(reaches['current'][a])} today, "
              f"{len(reaches['proposed'][a])} proposed")

    # --- place assignment, identical for both networks ----------------------
    place_grid = build_grid([(*cur_coords[sid], place)
                             for sid, place in label.items()
                             if sid in cur_coords], PLACE_RADIUS_M)

    def place_of(lat, lon, sid=None):
        if sid is not None and sid in label:
            return label[sid]
        return nearest(lat, lon, place_grid, PLACE_RADIUS_M, PLACE_RADIUS_M)

    place_cur, place_prop = defaultdict(set), defaultdict(set)
    n_cur, n_prop = defaultdict(int), defaultdict(int)
    place_bd = defaultdict(float)
    unplaced = {"current": 0, "proposed": 0}

    for lat, lon, _, sid, routes in cur_served:
        p = place_of(lat, lon, sid)
        if p is None:
            unplaced["current"] += 1
            continue
        place_cur[p] |= routes
        n_cur[p] += 1
        place_bd[p] += boardings.get(sid, 0.0)

    for lat, lon, routes in prop_served:
        p = place_of(lat, lon)
        if p is None:
            unplaced["proposed"] += 1
            continue
        place_prop[p] |= routes
        n_prop[p] += 1

    print(f"  unplaced stops: {unplaced['current']} current, "
          f"{unplaced['proposed']} proposed (>{PLACE_RADIUS_M} m from any label)")

    # --- classify -----------------------------------------------------------
    rows = []
    for place in sorted(set(place_cur) | set(place_prop)):
        for anchor, hoods in ANCHORS.items():
            if place in hoods:
                continue  # a district needs no one-seat ride to itself
            now = place_cur.get(place, set()) & reaches["current"][anchor]
            prop = place_prop.get(place, set()) & reaches["proposed"][anchor]
            if now and prop:
                status = "keeps"
            elif prop:
                status = "gains"
            elif now:
                status = "loses"
            else:
                status = "none either way"
            rows.append({
                "place": place,
                "anchor": anchor,
                "status": status,
                "weekday_boardings": round(place_bd.get(place, 0.0), 2),
                "stops_now": n_cur.get(place, 0),
                "stops_proposed": n_prop.get(place, 0),
                "n_routes_now": len(now),
                "n_routes_proposed": len(prop),
                "routes_now": ";".join(sorted(now)),
                "routes_proposed": ";".join(sorted(prop)),
                "routes_kept": ";".join(sorted(now & prop)),
                "routes_lost": ";".join(sorted(now - prop)),
                "routes_gained": ";".join(sorted(prop - now)),
            })

    out = DATA / "oneseat_change.csv"
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    print(f"\nwrote {out} ({len(rows)} rows)")

    report(rows)


def report(rows):
    for anchor in ANCHORS:
        sub = [r for r in rows if r["anchor"] == anchor]
        counts = defaultdict(int)
        for r in sub:
            counts[r["status"]] += 1
        print(f"\n=== ONE-SEAT RIDE TO {anchor.upper()} ===")
        print("  " + ", ".join(f"{k}: {v}" for k, v in sorted(counts.items())))
        for status in ("gains", "loses"):
            hit = sorted((r for r in sub if r["status"] == status),
                         key=lambda r: -r["weekday_boardings"])
            if not hit:
                continue
            bd = sum(r["weekday_boardings"] for r in hit)
            print(f"\n  {status.upper()} ({len(hit)} places, "
                  f"{bd:,.0f} weekday boardings at their stops)")
            key = "routes_gained" if status == "gains" else "routes_lost"
            for r in hit[:15]:
                via = r[key].split(";")
                tail = ",".join(via[:4]) + ("..." if len(via) > 4 else "")
                print(f"    {r['place']:44s} {r['weekday_boardings']:8,.0f}  "
                      f"via {tail}")


if __name__ == "__main__":
    main()
