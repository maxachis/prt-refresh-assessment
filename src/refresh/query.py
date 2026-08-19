"""Place queries over `data/refresh.db` -- pure functions, read-only.

This module is the analysis, not a convenience layer over it. Every number the
web app shows comes from here, and the rules below are ports of
`analyze_coverage_change.py`, function for function, so that clicking a corner
in the browser and reading the row for that corner out of
`data/coverage_change.csv` give the same answer. `tests/test_query.py` pins that
equality against the real CSV; if you change an aggregation here and not there,
that test fails, which is the point.

THE THREE RULES, and what each is protecting against:

1. A LOCATION IS A RADIUS, NOT A STOP. Both networks are measured inside the
   same circle around the same point (convention 1). Route numbers and stop ids
   are not comparable across the two networks -- the plan re-splits corridors
   and renumbers everything -- but a corner is a corner in both.

2. TRIPS AT A LOCATION TAKE THE MAX ACROSS THE CLUSTER, NEVER THE SUM
   (convention 2). Adjacent stop ids on a corridor are one bus passing once;
   summing them doubles it, and consolidating two stops into one would read as
   a service cut. `cluster_trips` maxes per (route, direction, period);
   `departures_by_direction` picks, per (route, direction), the single stop
   carrying the most departures.

3. TIES BREAK ON THE LOWEST STOP ID. Stops are visited in sorted order, so the
   answer does not depend on set iteration order -- which Python randomises per
   process, and which moved ~20 borderline locations between runs of the
   original script before it was pinned.

The distance metric is the equirectangular one `analyze_frequency_change.Grid`
uses (111,320 m per degree, longitude scaled by cos(lat)), not haversine, so
membership of a radius is decided identically on both sides of the pipeline.
"""
from __future__ import annotations

import math
import sqlite3
from pathlib import Path

DAYS = ("weekday", "saturday", "sunday")
SIDES = ("current", "proposed")

# The seven periods the Frequency & Hours PDFs publish, as minutes on the
# 4:00-28:00 axis. Mirrors analyze_frequency_change.PERIODS; the DB carries the
# same list in `meta` so a served number can be traced to the build.
PERIODS = (
    ("early_4_6a", 4 * 60, 6 * 60),
    ("am_6_9a", 6 * 60, 9 * 60),
    ("mid_9a_3p", 9 * 60, 15 * 60),
    ("pm_3_6p", 15 * 60, 18 * 60),
    ("eve_6_8p", 18 * 60, 20 * 60),
    ("late_8_11p", 20 * 60, 23 * 60),
    ("owl_11p_4a", 23 * 60, 28 * 60),
)
PKEYS = tuple(p[0] for p in PERIODS)

# The hourly tier's window and threshold: no gap over 60 minutes anywhere
# between 6am and 6pm, counting the wait from 6am to the first departure and
# from the last departure to 6pm.
HOURLY_LO, HOURLY_HI = 6 * 60, 18 * 60
MAX_GAP = 60

METERS_PER_DEGREE = 111_320.0

# Slack added to the r-tree prefilter box, in metres. Covers 32-bit float
# rounding in the index by a wide margin -- see `stops_within` -- and is not a
# tolerance on the radius itself, which stays exact.
RTREE_PAD_M = 10.0

# 400 m is the headline quarter-mile access distance; 150 m is the strict
# same-corner sensitivity test. Convention 4: radius is reported, not chosen,
# so the API exposes it and the UI shows both.
PRIMARY_RADIUS = 400
RADII = (400, 150)

# --- the lattice the magnitude surface is drawn on ------------------------
#
# THESE THREE NUMBERS ARE NOT FREE. They are `analyze_coverage_area.py`'s
# lattice, repeated here so the surface's cells are the same squares that
# script measured `data/coverage_area.csv` on -- move the origin or the cell
# size and the served-cell count stops being comparable to the published km2,
# while still looking like a plausible map.
# `test_lattice_agrees_with_the_area_analysis` imports that script and checks
# the agreement cell for cell rather than trusting this comment.
#
# The projection is local equirectangular about the county's centre. Note it is
# used ONLY to index cells; every distance the surface actually measures goes
# through `stops_within`, on the app's own metric. See `cell_metres`.
CELL_M = 100
LAT0, LON0 = 40.45, -79.98
M_PER_DEG_LON = METERS_PER_DEGREE * math.cos(math.radians(LAT0))


def connect(db_path: str | Path) -> sqlite3.Connection:
    """Open the serving DB read-only. The app never writes to it."""
    path = Path(db_path)
    if not path.exists():
        raise FileNotFoundError(
            f"{path} not found -- run `python3 build_webdb.py` first")
    con = sqlite3.connect(f"file:{path}?mode=ro", uri=True, check_same_thread=False)
    con.row_factory = sqlite3.Row
    return con


def period_of(axis_t: float) -> str | None:
    for key, p0, p1 in PERIODS:
        if p0 <= axis_t < p1:
            return key
    return None


# --------------------------------------------------------------------------
# spatial
# --------------------------------------------------------------------------

def stops_within(con, lat: float, lon: float, radius: float, side: str):
    """[(stop_id, name, lat, lon, metres)] for one side, inside the radius.

    The r-tree gives a bounding box; the equirectangular test then trims it to
    a true circle, matching `analyze_frequency_change.Grid.within`.

    THE BOX IS PADDED, AND HAS TO BE. SQLite's r-tree stores its coordinates as
    32-bit floats, which at Pittsburgh's longitude resolve to about 0.4 m -- so
    a box edge asked for in double precision is compared against a value that
    has been rounded, and a stop within a metre of the radius decides its own
    membership on that rounding rather than on its distance. That is not
    hypothetical: stop 11056 sits 399.895 m from MIFFLIN RD + GLENHURST and was
    dropped from a 400 m query, taking 19 weekday trips with it and putting the
    app 19 trips below the figure `data/coverage_change.csv` publishes for that
    location.

    Padding costs a handful of extra candidate rows and nothing else: the
    r-tree is only a prefilter, and the exact equirectangular test below is
    what actually decides membership. It must never be the tighter of the two.
    """
    coslat = math.cos(math.radians(lat)) or 1e-9
    dlat = (radius + RTREE_PAD_M) / METERS_PER_DEGREE
    dlon = (radius + RTREE_PAD_M) / (METERS_PER_DEGREE * coslat)

    rows = con.execute(
        """
        SELECT s.stop_id, s.name, s.lat, s.lon
        FROM stops_rtree r
        JOIN stop_key k ON k.id = r.id
        JOIN stops s ON s.side = k.side AND s.stop_id = k.stop_id
        WHERE r.min_lat >= ? AND r.max_lat <= ?
          AND r.min_lon >= ? AND r.max_lon <= ?
          AND k.side = ?
        """,
        (lat - dlat, lat + dlat, lon - dlon, lon + dlon, side),
    ).fetchall()

    lim = radius * radius
    out = []
    for r in rows:
        dla = (r["lat"] - lat) * METERS_PER_DEGREE
        dlo = (r["lon"] - lon) * METERS_PER_DEGREE * coslat
        d2 = dla * dla + dlo * dlo
        if d2 <= lim:
            out.append((r["stop_id"], r["name"], r["lat"], r["lon"], math.sqrt(d2)))
    out.sort(key=lambda x: x[0])          # rule 3: deterministic, lowest id first
    return out


# --------------------------------------------------------------------------
# aggregation -- ports of analyze_coverage_change.py
# --------------------------------------------------------------------------

def _departures(con, side: str, day: str, stop_ids: list[str]):
    """{stop_id: {(route, direction): [axis minutes]}} for a cluster."""
    if not stop_ids:
        return {}
    qs = ",".join("?" * len(stop_ids))
    rows = con.execute(
        f"SELECT stop_id, route, direction, times FROM departures "
        f"WHERE side = ? AND day = ? AND stop_id IN ({qs})",
        (side, day, *stop_ids),
    ).fetchall()
    out: dict[str, dict[tuple[str, str], list[int]]] = {}
    for r in rows:
        times = [int(t) for t in r["times"].split(",") if t]
        out.setdefault(r["stop_id"], {})[(r["route"], r["direction"])] = times
    return out


def departures_by_direction(by_stop, stop_ids):
    """{direction: sorted departure minutes} for one network at one location.

    Per (route, direction), take the stop in the cluster carrying the most
    departures rather than pooling all of them -- rule 2.

    The sort is inside the function, not assumed of the caller: ties go to the
    lowest stop id, and making that a caller obligation is how it silently
    stops holding. `stops_within` sorts too, so this costs nothing in practice.
    """
    best: dict[tuple[str, str], list[int]] = {}
    for sid in sorted(stop_ids):
        for rd, times in by_stop.get(sid, {}).items():
            if len(times) > len(best.get(rd, ())):
                best[rd] = times
    by_dir: dict[str, list[int]] = {}
    for (_route, direction), times in best.items():
        by_dir.setdefault(direction, []).extend(times)
    return {d: sorted(t) for d, t in by_dir.items()}


def cluster_trips(by_stop, stop_ids):
    """{period: trips} at a location, per-period max across the cluster.

    Maxed per (route, direction, period) rather than per (route, direction) for
    the whole day: where a cluster's stops carry different patterns, one stop
    may hold a route's morning trips and its neighbour the afternoon's, and the
    rider on that corner has both. Choosing one stop for the whole day
    understates it -- by 0.4 percentage points system-wide on weekdays.
    """
    best: dict[tuple[str, str, str], float] = {}
    for sid in sorted(stop_ids):
        counts: dict[tuple[str, str, str], float] = {}
        for (route, direction), times in by_stop.get(sid, {}).items():
            for t in times:
                p = period_of(t)
                if p:
                    key = (route, direction, p)
                    counts[key] = counts.get(key, 0) + 1
        for key, n in counts.items():
            if n > best.get(key, 0):
                best[key] = n
    out = {k: 0.0 for k in PKEYS}
    for (_route, _direction, period), n in best.items():
        out[period] += n
    return out


def hourly(by_dir) -> bool:
    """Is the better direction hourly-or-better right across 6am-6pm?

    Gaps are measured from the window's start to the first departure and from
    the last departure to its end, so peak-only service fails on the midday gap
    rather than passing on a technicality. "Better direction", not summed
    across directions: an hourly inbound-only stop must not clear a bar on the
    strength of its outbound trips.
    """
    for times in by_dir.values():
        window = [t for t in times if HOURLY_LO <= t <= HOURLY_HI]
        if not window:
            continue
        edges = [HOURLY_LO, *window, HOURLY_HI]
        if max(b - a for a, b in zip(edges, edges[1:])) <= MAX_GAP:
            return True
    return False


def headways(by_dir):
    """{direction: {'median': m, 'max_gap_6a_6p': g}} -- descriptive only.

    Not a tier and not used by any published figure. The app shows it because
    "a bus every 12 minutes" is what a rider asked, and the tier flag alone
    ("hourly: yes") throws away the difference between 12 minutes and 55.
    """
    out = {}
    for direction, times in by_dir.items():
        window = sorted(t for t in times if HOURLY_LO <= t <= HOURLY_HI)
        if len(window) < 2:
            out[direction] = {"median": None, "max_gap_6a_6p": None}
            continue
        gaps = sorted(b - a for a, b in zip(window, window[1:]))
        edges = [HOURLY_LO, *window, HOURLY_HI]
        out[direction] = {
            "median": gaps[len(gaps) // 2],
            "max_gap_6a_6p": max(b - a for a, b in zip(edges, edges[1:])),
        }
    return out


# --------------------------------------------------------------------------
# the place query
# --------------------------------------------------------------------------

def side_at_place(con, side: str, lat: float, lon: float, radius: float):
    """Everything one network offers at one location, all three day types."""
    stops = stops_within(con, lat, lon, radius, side)
    stop_ids = [s[0] for s in stops]

    days = {}
    for day in DAYS:
        by_stop = _departures(con, side, day, stop_ids)
        per = cluster_trips(by_stop, stop_ids)
        by_dir = departures_by_direction(by_stop, stop_ids)
        routes = sorted({rt for sid in stop_ids
                         for rt, _d in by_stop.get(sid, {})})
        days[day] = {
            "trips": round(sum(per.values())),
            "periods": {k: round(v) for k, v in per.items()},
            "hourly": hourly(by_dir),
            "headways": headways(by_dir),
            "routes": routes,
            "first": min((min(t) for t in by_dir.values() if t), default=None),
            "last": max((max(t) for t in by_dir.values() if t), default=None),
        }

    return {
        "side": side,
        "stops": [{"stop_id": s[0], "name": s[1], "lat": s[2], "lon": s[3],
                   "metres": round(s[4])} for s in stops],
        "days": days,
    }


def place(con, lat: float, lon: float, radius: float = PRIMARY_RADIUS):
    """Before and after at one point, measured identically on both sides.

    The response deliberately carries both sides' full detail rather than only
    a delta: the repo's standing instruction is to report gains as plainly as
    losses, and a UI handed only a signed number tends to render the minus
    signs louder.
    """
    out = {
        "lat": lat, "lon": lon, "radius": radius,
        "current": side_at_place(con, "current", lat, lon, radius),
        "proposed": side_at_place(con, "proposed", lat, lon, radius),
    }
    out["change"] = {
        day: {
            "trips": (out["proposed"]["days"][day]["trips"]
                      - out["current"]["days"][day]["trips"]),
            "hourly": (out["proposed"]["days"][day]["hourly"],
                       out["current"]["days"][day]["hourly"]),
        }
        for day in DAYS
    }
    out["place"] = nearest_place_label(con, lat, lon)
    return out


# --------------------------------------------------------------------------
# the citywide change layer
# --------------------------------------------------------------------------

# The buckets the map paints, worst to best. Four of them are not display
# choices -- they are published criteria, restated:
#
#   gone     COVERAGE-CHANGE / STOP-LOST-SERVICE: served today, not proposed
#   halved   LOSE-FREQUENCY-HALF, verbatim: cur > 0 and 0 < prop <= cur/2
#   doubled  GAIN-FREQUENCY-DOUBLE, verbatim: cur > 0 and prop >= 2*cur
#   new      their mirror -- no bus today, a bus proposed (weekend day types)
#
# `test_change_buckets_reproduce_the_published_counts` pins those four against
# the figures docs/answers/ prints (593 / 284 / 217 on a weekday at 400 m), so
# a bucket edge cannot be nudged without the published answer moving with it.
#
# `less`/`same`/`more` split what is left, and the +/-10% dead band around no
# change is the one arbitrary edge here. It is a display choice and nothing
# published rests on it: without a dead band a near service-neutral redesign
# renders as a field of faint red and green in which nothing stands out.
SAME_BAND = 0.10

BUCKETS = (
    ("gone", "loses all service"),
    ("halved", "halved or worse"),
    ("less", "less service"),
    ("same", "about the same"),
    ("more", "more service"),
    ("doubled", "doubled or better"),
    ("new", "new service"),
    ("none", "no service either way"),
)
BUCKET_KEYS = tuple(k for k, _ in BUCKETS)


def bucket(cur: float, prop: float) -> str:
    """Which change bucket a location falls in, from its two trip counts.

    Order matters: the total-loss and total-gain cases are decided before the
    ratio tests, because `prop == 0` would otherwise satisfy "halved or worse"
    and hide the plainest finding on the map inside a frequency bucket.
    """
    if cur <= 0 and prop <= 0:
        return "none"
    if cur <= 0:
        return "new"
    if prop <= 0:
        return "gone"
    if prop <= 0.5 * cur:
        return "halved"
    if prop >= 2 * cur:
        return "doubled"
    if prop < cur * (1 - SAME_BAND):
        return "less"
    if prop > cur * (1 + SAME_BAND):
        return "more"
    return "same"


def change_points(con, radius: float = PRIMARY_RADIUS):
    """The locations the citywide layer paints: (point_id, lat, lon, published).

    Two sets, and the distinction is carried through to the client rather than
    blurred:

    `published` points are the 5,751 locations `data/coverage_change.csv`
    measures -- stops served today that carry a PRT ridership record. Counts
    over this set are the published counts, which is the point of keeping it
    identifiable.

    The rest are places the proposed network serves where nothing stops within
    PRIMARY_RADIUS today. That denominator cannot see them -- it can only
    measure change where a bus stops now -- so on the published set alone every
    genuinely new piece of coverage is invisible, and a map that can only draw
    losses in the places the plan adds service is not an honest one.

    Note they are selected at PRIMARY_RADIUS whatever radius is asked for. The
    point set has to be the same at 400 m and 150 m or the two radii stop being
    comparable: at 150 m most of the proposed network is "more than a radius
    from a current stop", and the layer would fill with new-service dots that
    are the smaller circle's artefact rather than the plan's doing.
    """
    pts = [(f"c:{r['stop_id']}", r["lat"], r["lon"], 1) for r in con.execute(
        "SELECT p.stop_id, s.lat, s.lon FROM stop_place p "
        "JOIN stops s ON s.stop_id = p.stop_id AND s.side = 'current' "
        "ORDER BY p.stop_id")]

    for r in con.execute("SELECT stop_id, lat, lon FROM stops "
                         "WHERE side = 'proposed' ORDER BY stop_id"):
        if not stops_within(con, r["lat"], r["lon"], PRIMARY_RADIUS, "current"):
            pts.append((f"p:{r['stop_id']}", r["lat"], r["lon"], 0))
    return pts


def compute_change(con, radius: float = PRIMARY_RADIUS):
    """Rows for the `change` table: every point, every day type, at one radius.

    This is the same measurement `place()` makes when a reader clicks, run
    ahead of time over a fixed point set, and it goes through `side_at_place`
    rather than a faster bespoke query so that the dot and the panel behind it
    cannot disagree. Roughly 20 seconds per radius; `build_webdb.py` calls it.
    """
    out = []
    for point_id, lat, lon, published in change_points(con, radius):
        cur = side_at_place(con, "current", lat, lon, radius)["days"]
        prop = side_at_place(con, "proposed", lat, lon, radius)["days"]
        for day in DAYS:
            c, p = cur[day], prop[day]
            out.append((int(radius), point_id, day, lat, lon, published,
                        c["trips"], p["trips"],
                        int(c["hourly"]), int(p["hourly"]),
                        bucket(c["trips"], p["trips"])))
    return out


def change_layer(con, radius: float = PRIMARY_RADIUS):
    """The citywide layer at one radius, all three day types, packed for the wire.

    Columnar on purpose. The same content as GeoJSON is several megabytes of
    repeated key names for ~5,900 points; as fixed-width rows it is a few
    hundred kilobytes, and the client assembles the GeoJSON itself. All three
    day types ship together so switching Weekday/Saturday/Sunday repaints from
    memory instead of refetching -- 152 locations keep their weekday buses and
    lose the weekend entirely, and that comparison should cost nothing.

    Each row is [lat, lon, published, then per day: cur, prop, bucket index].
    """
    rows = con.execute(
        "SELECT point_id, day, lat, lon, published, cur_trips, prop_trips, "
        "  bucket FROM change WHERE radius = ? ORDER BY point_id",
        (int(radius),)).fetchall()

    idx = {k: i for i, k in enumerate(BUCKET_KEYS)}
    packed: dict[str, list] = {}
    for r in rows:
        p = packed.setdefault(
            r["point_id"], [round(r["lat"], 6), round(r["lon"], 6),
                            r["published"], 0, 0, 0, 0, 0, 0, 0, 0, 0])
        at = 3 + 3 * DAYS.index(r["day"])
        p[at:at + 3] = [r["cur_trips"], r["prop_trips"], idx[r["bucket"]]]

    return {
        "radius": int(radius),
        "days": list(DAYS),
        "buckets": [{"key": k, "label": lab} for k, lab in BUCKETS],
        "fields": ["lat", "lon", "published",
                   *[f"{d}_{f}" for d in DAYS
                     for f in ("cur", "prop", "bucket")]],
        "points": list(packed.values()),
    }


# --------------------------------------------------------------------------
# the magnitude surface
# --------------------------------------------------------------------------
#
# The change layer can only paint places where a stop stands today, so it
# renders as a scatter of dots and it cannot show ground the plan adds a bus
# to. The surface answers the same question -- what happens to the buses within
# a walk of here -- at every point in space instead, by treating a lattice cell
# as a location that need not have a stop on it. That is not a new method:
# `analyze_coverage_area.py` already measures the published area figures this
# way, and its docstring is where the reasoning lives ("a rider stands in a
# place, not at a stop id").
#
# Two rules this shares with the change layer, for the same reasons:
#
#   - PRECOMPUTED THROUGH `side_at_place`, the same function a click calls, so
#     a cell and the panel a reader opens on it cannot disagree.
#   - THE CELL SET IS FIXED AT PRIMARY_RADIUS for both radii. At 150 m the
#     covered area is a third of the 400 m one, and choosing cells per radius
#     would change what ground is on the map rather than what the plan does
#     to it.


def cell_of(lat: float, lon: float) -> tuple[int, int]:
    """The lattice cell containing a point, as (ix, iy)."""
    return (int(math.floor((lon - LON0) * M_PER_DEG_LON / CELL_M)),
            int(math.floor((lat - LAT0) * METERS_PER_DEGREE / CELL_M)))


def cell_centre(ix: int, iy: int) -> tuple[float, float]:
    """The (lat, lon) at the centre of a cell -- where it is measured."""
    return (LAT0 + (iy + 0.5) * CELL_M / METERS_PER_DEGREE,
            LON0 + (ix + 0.5) * CELL_M / M_PER_DEG_LON)


def cell_metres(lat: float, lon: float, plat: float, plon: float) -> float:
    """Distance on the app's metric -- cosine of the QUERY point's latitude.

    Deliberately not the lattice projection above, which fixes that cosine at
    the county centre. `stops_within` scales by the query point's own latitude,
    and a cell whose membership was decided on one metric while the panel
    behind it used the other would show a stop outside the circle it is
    supposedly inside. The lattice indexes; this measures.
    """
    coslat = math.cos(math.radians(lat)) or 1e-9
    dla = (plat - lat) * METERS_PER_DEGREE
    dlo = (plon - lon) * METERS_PER_DEGREE * coslat
    return math.sqrt(dla * dla + dlo * dlo)


def surface_cells(con, radius: float = PRIMARY_RADIUS):
    """Sorted (ix, iy) for every cell within `radius` of a stop on either side.

    Rasterising a union of discs: a cell counts when its CENTRE is covered,
    which is unbiased and is what the published area figures do. Candidates
    come from each stop's bounding box in lattice space and are then trimmed by
    the true circular test, so the box is a prefilter and never the decision --
    the same shape as `stops_within`.
    """
    span = int(math.ceil(radius / CELL_M)) + 1
    cells: set[tuple[int, int]] = set()
    for r in con.execute("SELECT DISTINCT lat, lon FROM stops"):
        cx, cy = cell_of(r["lat"], r["lon"])
        for ix in range(cx - span, cx + span + 1):
            for iy in range(cy - span, cy + span + 1):
                if (ix, iy) in cells:
                    continue
                clat, clon = cell_centre(ix, iy)
                if cell_metres(clat, clon, r["lat"], r["lon"]) <= radius:
                    cells.add((ix, iy))
    return sorted(cells)


def compute_surface(con, radius: float = PRIMARY_RADIUS):
    """Rows for the `surface` table: every covered cell, every day type.

    Cells with no bus on either side on any day are dropped rather than stored
    as zeros. At 150 m that is most of the 400 m cell set, and they would
    triple the payload to draw nothing.

    Roughly three minutes per radius; `build_webdb.py` calls it, and the note
    there about opening a fresh connection applies with more force here than
    anywhere else in the build.
    """
    out = []
    for ix, iy in surface_cells(con, PRIMARY_RADIUS):
        lat, lon = cell_centre(ix, iy)
        cur = side_at_place(con, "current", lat, lon, radius)["days"]
        prop = side_at_place(con, "proposed", lat, lon, radius)["days"]
        if not any(cur[d]["trips"] or prop[d]["trips"] for d in DAYS):
            continue
        for day in DAYS:
            out.append((int(radius), ix, iy, day,
                        cur[day]["trips"], prop[day]["trips"]))
    return out


def surface_layer(con, radius: float = PRIMARY_RADIUS):
    """The surface at one radius, all three day types, packed for the wire.

    Cells travel as lattice indices rather than coordinates: the lattice is
    regular, so `origin` plus (ix, iy) reconstructs the square exactly, and
    shipping four corners per cell would multiply a payload that is already the
    largest thing this app sends.

    Each row is [ix, iy, then per day: cur, prop]. No bucket is sent, and that
    is deliberate -- the surface is drawn on a continuous ramp, while the
    BUCKETS above are published criteria whose counts the legend reports. A
    ramp is a display choice; those counts are not, and blurring the two would
    let a reader quote a figure off the surface as though `docs/answers/`
    published it.
    """
    rows = con.execute(
        "SELECT ix, iy, day, cur_trips, prop_trips FROM surface "
        "WHERE radius = ? ORDER BY ix, iy", (int(radius),)).fetchall()

    packed: dict[tuple[int, int], list] = {}
    for r in rows:
        c = packed.setdefault((r["ix"], r["iy"]),
                              [r["ix"], r["iy"], 0, 0, 0, 0, 0, 0])
        at = 2 + 2 * DAYS.index(r["day"])
        c[at:at + 2] = [r["cur_trips"], r["prop_trips"]]

    return {
        "radius": int(radius),
        "cell_m": CELL_M,
        "days": list(DAYS),
        # Enough to rebuild any cell's square client-side: the south-west
        # corner of cell (ix, iy) is (lat0 + iy*dlat, lon0 + ix*dlon).
        "origin": {
            "lat0": LAT0, "lon0": LON0,
            "dlat": CELL_M / METERS_PER_DEGREE,
            "dlon": CELL_M / M_PER_DEG_LON,
        },
        "fields": ["ix", "iy",
                   *[f"{d}_{f}" for d in DAYS for f in ("cur", "prop")]],
        "cells": list(packed.values()),
    }


def nearest_place_label(con, lat: float, lon: float):
    """(muni, hood) from the closest labelled stop, or None.

    PRT's HOOD/MUNI labels contain gross errors -- stops mislabelled by up to
    40 km (caveat 4) -- so this is a display hint only. Nothing computed
    depends on it, and rows flagged `id_name_mismatch` are skipped because
    their labels belong to a different physical stop entirely (caveat 10).
    """
    for _sid, _name, slat, slon, _m in stops_within(con, lat, lon, 600, "current"):
        row = con.execute(
            "SELECT muni, hood FROM stop_place WHERE stop_id = ? "
            "AND id_name_mismatch = 0", (_sid,)).fetchone()
        if row and (row["muni"] or row["hood"]):
            return {"muni": row["muni"], "hood": row["hood"]}
    return None


# --------------------------------------------------------------------------
# routes and metadata
# --------------------------------------------------------------------------

def routes(con, side: str):
    rows = con.execute(
        "SELECT r.route_id, r.short_name, r.long_name, r.color, "
        "  rs.day, rs.trips, rs.hours, rs.first_min, rs.last_min "
        "FROM routes r LEFT JOIN route_service rs "
        "  ON rs.side = r.side AND rs.route_id = r.route_id "
        "WHERE r.side = ? ORDER BY r.route_id", (side,)).fetchall()
    out: dict[str, dict] = {}
    for r in rows:
        entry = out.setdefault(r["route_id"], {
            "route_id": r["route_id"], "short_name": r["short_name"],
            "long_name": r["long_name"], "color": r["color"], "days": {}})
        if r["day"]:
            entry["days"][r["day"]] = {
                "trips": r["trips"], "hours": round(r["hours"], 1),
                "first_min": r["first_min"], "last_min": r["last_min"]}
    return list(out.values())


def crosswalk(con):
    return [dict(r) for r in con.execute(
        "SELECT * FROM crosswalk ORDER BY current_route").fetchall()]


def meta(con):
    return {r["key"]: r["value"] for r in con.execute("SELECT * FROM meta")}
