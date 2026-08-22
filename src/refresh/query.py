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

from . import journey

DAYS = ("weekday", "saturday", "sunday")
SIDES = ("current", "proposed")

# The corridor layer's classes -- mirrors analyze_corridor_change.py's
# KLASS_KEPT/KLASS_LOST/KLASS_ADDED verbatim (that script stays self-contained
# pipeline code, so the strings are repeated here rather than imported).
KLASS_KEPT = "kept"
KLASS_LOST = "lost"
KLASS_ADDED = "added"

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

def _bbox(lat: float, lon: float, radius: float):
    """(cos(lat), dlat, dlon) for a padded r-tree query box.

    Shared by the two spatial indexes -- `stops_within` over the bus-only
    service universe and `reach_stops_within` over every mode -- so that a
    radius means the same thing in both. The padding is explained at length in
    `stops_within`; it is not a tolerance on the radius, which stays exact.
    """
    coslat = math.cos(math.radians(lat)) or 1e-9
    return (coslat,
            (radius + RTREE_PAD_M) / METERS_PER_DEGREE,
            (radius + RTREE_PAD_M) / (METERS_PER_DEGREE * coslat))


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
    coslat, dlat, dlon = _bbox(lat, lon, radius)

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


def place(con, lat: float, lon: float, radius: float = PRIMARY_RADIUS,
          dest_lat: float | None = None, dest_lon: float | None = None):
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
    # The one-seat verdicts ride along with the panel rather than sitting
    # behind their own request: they answer a question about this same point,
    # and two round trips would let the panel show a corner's trip counts
    # while its "can I still get Downtown" line was still loading.
    out["oneseat"] = oneseat_named(con, lat, lon, radius)
    # A dropped pin joins the named destinations rather than replacing them.
    # The reader picked it, so it goes first; Downtown and Oakland stay because
    # they are the two the published answers cover and the two most people are
    # actually travelling to.
    if dest_lat is not None and dest_lon is not None:
        out["oneseat"].insert(0, pin_verdict(con, lat, lon, radius,
                                             dest_lat, dest_lon))
    return out


def pin_verdict(con, lat: float, lon: float, radius: float,
                dest_lat: float, dest_lon: float):
    """One dropped-pin destination, shaped like a named one for the panel."""
    got = oneseat_at_place(con, lat, lon, radius,
                           dest_lat=dest_lat, dest_lon=dest_lon)
    return {
        "key": None,
        "name": f"the point you picked ({dest_lat:.4f}, {dest_lon:.4f})",
        "lat": dest_lat, "lon": dest_lon,
        "status": got["status"],
        "current": got["current"], "proposed": got["proposed"],
        "kept": got["kept"], "lost": got["lost"], "gained": got["gained"],
    }


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


# --------------------------------------------------------------------------
# the corridor layer
# --------------------------------------------------------------------------
#
# Everything above answers "what can a rider reach from a place they might
# stand" -- a stop, a location within a walk radius, a lattice cell. This
# layer answers something narrower: on this piece of STREET, does a bus run?
# `analyze_corridor_change.py`'s module docstring is the method and the
# reasoning; a street can lose its only bus while a stop two blocks over shows
# no change at all in `place()` or the surface, so this is pavement, not
# access, and it must never be read as though it answered the walk-access
# question those do.

def corridor_layer(con, day: str = "weekday"):
    """The corridor layer at one day type, geometry parsed for the wire.

    A straight carry-over of `data/corridor_change.csv` -- unlike `change` and
    `surface` above, nothing here is recomputed through `side_at_place`, so
    there is no "the dot and the panel behind it cannot disagree" guarantee to
    make; this table simply repeats what `analyze_corridor_change.py` already
    measured on the street network itself.

    `km` totals citywide length by class (kept/lost/added), summed from every
    row for the day -- not only the runs currently in view -- because the
    layer's whole point is a network-wide pavement figure, the corridor
    counterpart of the area total `surface_layer` complements. A rider zoomed
    into one neighbourhood should still see the citywide kept/lost/added
    split, the same way the legend's citywide bucket counts do not shrink to
    match the map's current viewport.

    Geometry is parsed here, not on the client, so the client does no parsing:
    "lon,lat lon,lat ..." becomes [[lon, lat], ...] per run.
    """
    rows = con.execute(
        "SELECT klass, length_m, geometry FROM corridor WHERE day = ?",
        (day,)).fetchall()

    km = {klass: 0.0 for klass in (KLASS_KEPT, KLASS_LOST, KLASS_ADDED)}
    runs = []
    for r in rows:
        km[r["klass"]] += r["length_m"]
        coords = [[float(v) for v in pt.split(",")]
                  for pt in r["geometry"].split(" ")]
        runs.append({"klass": r["klass"], "length_m": r["length_m"],
                     "geometry": coords})

    return {
        "day": day,
        "km": {k: round(v / 1000, 1) for k, v in km.items()},
        "runs": runs,
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
# one-seat rides to a destination
# --------------------------------------------------------------------------
#
# A fourth question, and the only one here whose answer is not a quantity of
# service: from this location, can a rider reach a given destination WITHOUT
# TRANSFERRING, today and under the plan? `analyze_one_seat.py` answers it for
# the four BASE_CAMP `*-ONE-SEAT-*` questions at the level of a place; this is
# the same test at an arbitrary location, with the destination chosen by the
# reader rather than fixed at Downtown and Oakland.
#
# FIVE THINGS ABOUT IT DIFFER FROM EVERYTHING ELSE IN THIS MODULE, and each is
# load-bearing:
#
# 1. IT READS `reach_stop`, NOT `stops`/`departures`, BECAUSE IT IS NOT BUS
#    ONLY. Every other layer drops rail and the inclines: they are outside the
#    Refresh, so including them would put unchanged service on both sides of a
#    change figure. A one-seat ride is not a change figure. Ignore the T and
#    Beechview "loses its one-seat ride Downtown" -- it does not, the Blue Line
#    still runs -- while Bon Air appears to GAIN one it has had all along. That
#    is control 2 of `analyze_one_seat.py`, found there the same way, and it is
#    why `reach_stop` carries every mode on both sides.
#
# 2. IT IS ROUTE-BASED, WHICH CONVENTION 1 NORMALLY FORBIDS. The convention
#    forbids comparing route N to route N; this never does. It asks whether the
#    set of routes serving this location intersects the set serving the
#    destination -- a question about connectivity, not volume -- and both sets
#    are recomputed independently per network. Renumbering therefore cannot
#    produce a false loss: the 61A becoming the 61X changes both sets together.
#
# 3. IT HAS NO DAY TYPE. A route serves a location or it does not, which is the
#    published method and keeps this comparable to `data/oneseat_change.csv`.
#    The cost is real and the UI has to say so: a surviving one-seat ride may
#    run hourly on a Sunday, and this test cannot tell that from a ten-minute
#    trunk route. The panel's own day-by-day trip counts are what answer that.
#
# 4. IT HAS NO TIME OR DISTANCE. A route touching both ends is a one-seat ride
#    however long it takes to make; a 90-minute ride around three sides of the
#    county counts the same as a 12-minute one.
#
# 5. THE DESTINATION TAKES THE SAME WALK RADIUS AS THE ORIGIN. The published
#    script uses a fixed 200 m at the destination end against a place at the
#    origin end. Here the reader picks both ends and moves one radius control,
#    so both ends use it: a rider walks at the far end too, and two different
#    radii in one test would be indefensible on a screen that shows one number.
#    For the two NAMED destinations this turns out to change nothing at all --
#    Downtown reaches the same 79 current and 69 proposed routes at 200 m and
#    at 400 m, Oakland the same 23 and 25 -- because a district's seed cloud is
#    dense enough that widening each seed's circle finds no route the cloud did
#    not already touch. So the app's Downtown and Oakland verdicts rest on
#    exactly the published route sets, and `tests/test_oneseat.py` checks that
#    against `data/oneseat_change.csv` rather than assuming it. Where the
#    radius does bite is a DROPPED PIN, which is one seed with nothing to
#    saturate it: there it is the whole difference between a route stopping at
#    the door and one stopping a quarter-mile away.

ONESEAT_STATUSES = (
    ("here", "at the destination"),
    ("keeps", "keeps a one-seat ride"),
    ("gains", "gains a one-seat ride"),
    ("loses", "loses its one-seat ride"),
    ("none", "no one-seat ride either way"),
)
ONESEAT_KEYS = tuple(k for k, _ in ONESEAT_STATUSES)

# The destination radius the published place-level analysis uses. Kept here
# only so the tests can reproduce `data/oneseat_change.csv`'s route sets; the
# app itself measures the destination at the reader's own walk radius (note 5).
PUBLISHED_ANCHOR_RADIUS = 200


def reach_stops_within(con, lat: float, lon: float, radius: float, side: str):
    """[(stop_id, lat, lon, frozenset(routes))] inside the radius, ALL MODES.

    The one-seat counterpart of `stops_within`, and deliberately a separate
    table and index rather than a flag on that one: `stops` holds the bus-only
    universe every service figure in this app is measured over, and quietly
    widening it would move published numbers. See note 1 above for why this
    question needs rail and those do not.

    Same padded-box-then-exact-circle metric as `stops_within`, for the same
    reason -- the r-tree stores 32-bit floats, so the box is a prefilter and
    never the tighter of the two tests.
    """
    coslat, dlat, dlon = _bbox(lat, lon, radius)
    rows = con.execute(
        """
        SELECT s.stop_id, s.lat, s.lon, s.routes
        FROM reach_rtree r
        JOIN reach_key k ON k.id = r.id
        JOIN reach_stop s ON s.side = k.side AND s.stop_id = k.stop_id
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
        if dla * dla + dlo * dlo <= lim:
            out.append((r["stop_id"], r["lat"], r["lon"],
                        frozenset(r["routes"].split(";")) if r["routes"]
                        else frozenset()))
    out.sort(key=lambda x: x[0])          # rule 3: deterministic, lowest id first
    return out


def routes_at(con, lat: float, lon: float, radius: float, side: str) -> set[str]:
    """Every route boardable within a walk of one point, on one network."""
    out: set[str] = set()
    for _sid, _lat, _lon, routes in reach_stops_within(con, lat, lon, radius, side):
        out |= routes
    return out


def routes_reaching(con, seeds, radius: float, side: str) -> set[str]:
    """Every route that stops within the radius of any seed point.

    A destination is a SET of points, not one point, and that is what lets a
    district and a pin share one definition. Downtown is the 44 stops PRT
    labels Central Business District; a pin the reader drops is a set of one.
    Union, not intersection: a route serves Downtown if it stops anywhere in
    it.
    """
    out: set[str] = set()
    for lat, lon in seeds:
        out |= routes_at(con, lat, lon, radius, side)
    return out


def destinations(con):
    """The named destinations, with their seed count and centre.

    The centre is the mean of the seeds and is for the map to fly to; nothing
    is measured from it. A district measured from its centroid would be a
    circle over one block of it.
    """
    rows = con.execute(
        "SELECT dest_key, name, lat, lon FROM destination "
        "ORDER BY dest_key, lat, lon").fetchall()
    out: dict[str, dict] = {}
    for r in rows:
        d = out.setdefault(r["dest_key"], {"key": r["dest_key"], "name": r["name"],
                                           "seeds": 0, "lat": 0.0, "lon": 0.0})
        d["seeds"] += 1
        d["lat"] += r["lat"]
        d["lon"] += r["lon"]
    for d in out.values():
        d["lat"] = round(d["lat"] / d["seeds"], 6)
        d["lon"] = round(d["lon"] / d["seeds"], 6)
    return list(out.values())


def destination_seeds(con, key: str):
    """[(lat, lon)] for a named destination, or [] if there is no such key."""
    return [(r["lat"], r["lon"]) for r in con.execute(
        "SELECT lat, lon FROM destination WHERE dest_key = ? ORDER BY lat, lon",
        (key,))]


def destination_reach(con, key: str, radius: float, side: str) -> set[str] | None:
    """The stored route set for a named destination, or None if not built.

    Precomputed by `build_webdb.py` because Downtown is 44 seed points and
    Oakland 93: measuring them per request would put ~270 spatial queries in
    front of every click, to re-derive an answer that cannot change between
    builds. A pin the reader drops is one point and is measured live.
    """
    row = con.execute(
        "SELECT routes FROM destination_reach "
        "WHERE dest_key = ? AND radius = ? AND side = ?",
        (key, int(radius), side)).fetchone()
    if row is None:
        return None
    return set(row["routes"].split(";")) if row["routes"] else set()


def resolve_destination(con, radius: float, key: str | None = None,
                        lat: float | None = None, lon: float | None = None):
    """One destination as (label, seeds, {side: routes reaching it}).

    Named or dropped-pin, the rest of the module sees the same shape. Named
    destinations take their route sets from the table when it holds them and
    fall back to measuring the seeds, so a database built before this layer
    existed degrades to slower rather than to wrong.
    """
    if key:
        seeds = destination_seeds(con, key)
        if not seeds:
            raise KeyError(key)
        name = con.execute("SELECT name FROM destination WHERE dest_key = ?",
                           (key,)).fetchone()["name"]
        reach = {}
        for side in SIDES:
            stored = destination_reach(con, key, radius, side)
            reach[side] = (stored if stored is not None
                           else routes_reaching(con, seeds, radius, side))
        return name, seeds, reach

    if lat is None or lon is None:
        raise ValueError("a destination needs either a key or a lat/lon")
    seeds = [(lat, lon)]
    return (None, seeds,
            {side: routes_reaching(con, seeds, radius, side) for side in SIDES})


def at_destination(lat: float, lon: float, seeds, radius: float) -> bool:
    """Is this point itself inside the destination?

    Kept out of the four verdicts rather than folded into `keeps`. A place
    needs no one-seat ride to itself -- `analyze_one_seat.py` skips the anchor
    districts outright for that reason -- and painting Downtown solid green as
    though the plan had preserved something there would be the loudest wrong
    signal on the map.
    """
    coslat = math.cos(math.radians(lat)) or 1e-9
    lim = radius * radius
    for slat, slon in seeds:
        dla = (slat - lat) * METERS_PER_DEGREE
        dlo = (slon - lon) * METERS_PER_DEGREE * coslat
        if dla * dla + dlo * dlo <= lim:
            return True
    return False


def oneseat_status(now: set[str], prop: set[str], here: bool = False) -> str:
    """Which of the five statuses a location falls in.

    `now`/`prop` are the routes providing the one-seat ride on each side -- the
    intersection of what serves the location with what reaches the destination
    -- not the routes serving the location. Mirrors `analyze_one_seat.py`'s
    keeps/gains/loses/none either way, with `here` added for the destination
    itself.
    """
    if here:
        return "here"
    if now and prop:
        return "keeps"
    if prop:
        return "gains"
    if now:
        return "loses"
    return "none"


def oneseat_at_place(con, lat: float, lon: float, radius: float,
                     key: str | None = None,
                     dest_lat: float | None = None,
                     dest_lon: float | None = None):
    """Can a rider get from this point to that destination without changing?

    Returns both sides' route lists in full rather than a verdict alone, for
    the reason the panel exists: "loses its one-seat ride" is a sentence a
    reader should be able to check against route numbers they recognise, and a
    bare status invites the map to be quoted without them.
    """
    name, seeds, reach = resolve_destination(con, radius, key, dest_lat, dest_lon)
    here = at_destination(lat, lon, seeds, radius)

    sides = {}
    for side in SIDES:
        serving = routes_at(con, lat, lon, radius, side)
        sides[side] = sorted(serving & reach[side])

    now, prop = set(sides["current"]), set(sides["proposed"])
    return {
        "destination": {"key": key, "name": name, "seeds": len(seeds),
                        "lat": dest_lat, "lon": dest_lon},
        "radius": radius,
        "status": oneseat_status(now, prop, here),
        "current": sides["current"],
        "proposed": sides["proposed"],
        "kept": sorted(now & prop),
        "lost": sorted(now - prop),
        "gained": sorted(prop - now),
    }


def oneseat_named(con, lat: float, lon: float, radius: float):
    """Every named destination's verdict at one point.

    Measured once per side and intersected per destination, rather than by
    calling `oneseat_at_place` in a loop: which routes serve this corner does
    not depend on where the reader is going, and it is the only part of the
    answer that costs a spatial query.

    Returns [] when the database predates this layer, so an old `refresh.db`
    serves the rest of the app unchanged instead of failing every click.
    """
    if not _has_table(con, "destination"):
        return []

    serving = {side: routes_at(con, lat, lon, radius, side) for side in SIDES}
    out = []
    for d in destinations(con):
        seeds = destination_seeds(con, d["key"])
        here = at_destination(lat, lon, seeds, radius)
        sides = {}
        for side in SIDES:
            reach = destination_reach(con, d["key"], radius, side)
            if reach is None:
                reach = routes_reaching(con, seeds, radius, side)
            sides[side] = serving[side] & reach
        now, prop = sides["current"], sides["proposed"]
        out.append({
            "key": d["key"], "name": d["name"],
            "lat": d["lat"], "lon": d["lon"],
            "status": oneseat_status(now, prop, here),
            "current": sorted(now), "proposed": sorted(prop),
            "kept": sorted(now & prop), "lost": sorted(now - prop),
            "gained": sorted(prop - now),
        })
    return out


def _has_table(con, name: str) -> bool:
    return con.execute("SELECT 1 FROM sqlite_master WHERE type = 'table' "
                       "AND name = ?", (name,)).fetchone() is not None


def oneseat_layer(con, radius: float = PRIMARY_RADIUS,
                  key: str | None = None,
                  dest_lat: float | None = None,
                  dest_lon: float | None = None):
    """Every location on the citywide point set, for one destination.

    This is why `point_reach` exists. The expensive half of a one-seat answer
    is "which routes can be boarded here", and it does not depend on the
    destination at all -- so it is measured once per point per side at build
    time, and every destination a reader picks afterwards is a set
    intersection over stored strings rather than ~12,000 spatial queries. That
    is what makes an arbitrary dropped pin repaint the county in well under a
    second instead of the twenty seconds `compute_change` takes.

    The point set, the radii and the published/new-coverage split are
    `change_points`' -- the same dots, recoloured by a different question, so
    a reader switching views is not also switching what is on the map.
    """
    name, seeds, reach = resolve_destination(con, radius, key, dest_lat, dest_lon)

    rows = con.execute(
        "SELECT point_id, side, lat, lon, published, routes FROM point_reach "
        "WHERE radius = ? ORDER BY point_id", (int(radius),)).fetchall()

    idx = {k: i for i, k in enumerate(ONESEAT_KEYS)}
    packed: dict[str, dict] = {}
    for r in rows:
        p = packed.setdefault(r["point_id"], {
            "lat": r["lat"], "lon": r["lon"], "published": r["published"],
            "current": set(), "proposed": set()})
        serving = set(r["routes"].split(";")) if r["routes"] else set()
        p[r["side"]] = serving & reach[r["side"]]

    points, counts = [], {k: 0 for k in ONESEAT_KEYS}
    for p in packed.values():
        status = oneseat_status(p["current"], p["proposed"],
                                at_destination(p["lat"], p["lon"], seeds, radius))
        counts[status] += 1
        points.append([round(p["lat"], 6), round(p["lon"], 6), p["published"],
                       idx[status], ";".join(sorted(p["current"])),
                       ";".join(sorted(p["proposed"]))])

    return {
        "radius": int(radius),
        "destination": {"key": key, "name": name, "seeds": len(seeds),
                        "lat": dest_lat, "lon": dest_lon},
        "statuses": [{"key": k, "label": lab} for k, lab in ONESEAT_STATUSES],
        "counts": counts,
        "fields": ["lat", "lon", "published", "status", "current", "proposed"],
        "points": points,
    }


# --------------------------------------------------------------------------
# how long the trip actually takes
# --------------------------------------------------------------------------
#
# A fifth question, and the only one on this site with a clock: leaving from
# here at any minute of the weekday morning peak, how long does it take to get
# there -- today, and under the plan? `analyze_travel_time.py` answers it for
# the 187 published places against Downtown and Oakland; this is the same
# search between two points a reader has chosen, and it must return the number
# that script publishes for the same pair (`tests/test_journey_query.py`).
#
# It reads `journey_pattern`/`journey_trip`/`journey_stop`, which are a second
# copy of both feeds carried for this alone, and it routes with
# `refresh.journey`. Convention 14 spells out the six things about this measure
# that look like inconsistencies and are not; four of them decide code here:
#
# 1. THE CLOCK STARTS WHEN THE RIDER IS READY, NOT WHEN THEY BOARD, so the
#    wait is part of the trip. It is the only place on the site where a
#    headway change reaches a person as time.
#
# 2. THE ANSWER IS A PROFILE, NOT A DEPARTURE. Leaving at 8:03 rather than
#    8:07 is the whole answer when a headway goes from 15 to 30, so what is
#    served is the distribution over every ready-minute in the window, with
#    the share of minutes the trip can be made at all beside it. A single
#    chosen departure is a quotable number with no denominator behind it.
#
# 3. THE TRANSFERS ARE INVENTED, AND THE INVENTION IS NOT NEUTRAL. Neither
#    feed publishes `transfers.txt`, so connections are synthesised from stop
#    coordinates. The Refresh leans on transferring more than today's network
#    does, so a generous transfer walk can only flatter it and a strict one
#    can only hurt it -- and unlike the access radii of convention 4, this can
#    change a pair's SIGN rather than its size. Every request is therefore
#    answered at BOTH radii, with `sign_flips` set when the two disagree about
#    the direction of the change. See
#    `docs/worklog/transfer-radius-favours-one-network.md`.
#
# 4. IT IS SCHEDULE AGAINST SCHEDULE. Today's side is compared at its
#    scheduled times, not its observed ones, because the proposed side has no
#    observed times and never will. Symmetric, and not the same claim as "the
#    trip will take this long" -- the caveat ships in `/api/meta`.
#
# AND IT IS A SLOW QUERY, unlike everything above. A profile is tens of RAPTOR
# searches; two networks at two transfer radii is four profiles, a few tenths
# of a second for a well-served pair and a few seconds for a badly served one.
# There is nothing to precompute -- both ends are arbitrary points -- so the UI
# needs a loading state rather than this needing a cache.

# The published question, mirrored from `analyze_travel_time.py` (which stays
# self-contained pipeline code, so these are repeated rather than imported --
# `tests/test_journey_query.py` pins them equal). The window is
# 07:00-08:59, end exclusive.
JOURNEY_DAY = "weekday"
JOURNEY_WINDOW = (7 * 60, 9 * 60)

# The two transfer walks every pair is answered at: the headline is the same
# quarter mile the rest of the site walks, the strict one convention 4's
# same-corner distance.
TRANSFER_HEADLINE = "headline"
TRANSFER_STRICT = "strict"
TRANSFER_RADII = {TRANSFER_HEADLINE: journey.MAX_TRANSFER_WALK_M,
                  TRANSFER_STRICT: 150.0}

# Why a pair has no comparable travel time -- three different failures that a
# bare "no median" would collapse into one. NO_ORIGIN_COVERAGE especially:
# that is a coverage answer, owned by `analyze_coverage_change.py` and by the
# change and surface layers above, and reporting it as a travel-time result is
# the error convention 10 forbids, one unit further down.
CLASS_COMPARABLE = "comparable"
CLASS_NO_ORIGIN_COVERAGE = "no_origin_coverage"
CLASS_NO_DEST_COVERAGE = "no_dest_coverage"
CLASS_NO_JOURNEY = "no_journey"
JOURNEY_CLASSIFICATIONS = (CLASS_COMPARABLE, CLASS_NO_ORIGIN_COVERAGE,
                           CLASS_NO_DEST_COVERAGE, CLASS_NO_JOURNEY)

# Published precision, applied here rather than on the way out, so that the
# change a reader sees is the difference of the two numbers they see.
MINUTE_DP = 1
FRACTION_DP = 3

# {(database, side, day, transfer walk): Timetable}. Keyed by database file
# rather than by connection because a Timetable is derived only from what the
# file holds, and building one is ~0.3 s of work that would otherwise be
# repeated on every request.
_TIMETABLES: dict[tuple, "journey.Timetable"] = {}
# Parsed drawn paths, per database, side and day. About 2 MB of text across
# both feeds, so parsing it per request would cost more than routing does.
_PATHS: dict[tuple, list] = {}


def _database_of(con) -> str:
    """The file this connection reads, as the timetable cache's key."""
    return con.execute("PRAGMA database_list").fetchone()[2]


def journey_patterns(con, side: str, day: str):
    """[(route_id, stops, [(start_min, offsets)])] -- the router's own shape.

    The rows are read straight back into the tuples `gtfs.load_patterns`
    returned when `build_webdb.py` wrote them; nothing is recomputed.

    ORDERED BY `pattern_id`, and that ordering is load-bearing: a ride leg
    names the pattern it rode by its index in the timetable, which is this
    list's index, so `journey_paths` below must order its rows the same way
    or a leg would be drawn along someone else's street.
    """
    patterns: dict[int, tuple] = {}
    for row in con.execute(
            "SELECT pattern_id, route_id, stops FROM journey_pattern "
            "WHERE side = ? AND day = ? ORDER BY pattern_id", (side, day)):
        patterns[row["pattern_id"]] = (row["route_id"],
                                       tuple(row["stops"].split(";")), [])
    for row in con.execute(
            "SELECT pattern_id, start_min, offsets FROM journey_trip "
            "WHERE side = ? AND day = ?", (side, day)):
        patterns[row["pattern_id"]][2].append(
            (row["start_min"], tuple(int(o) for o in row["offsets"].split(","))))
    return list(patterns.values())


def journey_paths(con, side: str, day: str):
    """[(points, stop_idx) or None] -- where each pattern's bus drives.

    Indexed the same way as `journey_patterns`, which is how a ride leg's
    pattern index finds its path. A pattern whose feed named no shape has no
    row and comes back None, and the map draws the straight line it always
    drew for that leg.

    For drawing only. The path is thinned at build time and no distance may
    be measured off it.
    """
    drawn = {}
    # Stored as "lon,lat" and kept that way: every consumer is GeoJSON, which
    # wants that order, and flipping it here would mean flipping it back.
    for row in con.execute(
            "SELECT pattern_id, points, stop_idx FROM journey_shape "
            "WHERE side = ? AND day = ?", (side, day)):
        drawn[row["pattern_id"]] = (
            tuple(tuple(float(v) for v in pair.split(","))
                  for pair in row["points"].split(" ")),
            tuple(int(i) for i in row["stop_idx"].split(",")))
    return [drawn.get(pattern_id) for (pattern_id,) in con.execute(
        "SELECT pattern_id FROM journey_pattern WHERE side = ? AND day = ? "
        "ORDER BY pattern_id", (side, day))]


def journey_coords(con, side: str):
    """{stop_id: (lat, lon)} for every stop the feed places, all modes."""
    return {r["stop_id"]: (r["lat"], r["lon"]) for r in con.execute(
        "SELECT stop_id, lat, lon FROM journey_stop WHERE side = ?", (side,))}


def cached_journey_paths(con, side: str, day: str):
    """`journey_paths`, parsed once per database, side and day."""
    key = (_database_of(con), side, day)
    if key not in _PATHS:
        _PATHS[key] = journey_paths(con, side, day)
    return _PATHS[key]


def journey_timetable(con, side: str, day: str = JOURNEY_DAY,
                      transfer_walk_m: float = journey.MAX_TRANSFER_WALK_M):
    """The router's timetable for one network, day type and transfer walk.

    One per transfer walk, not one shared: the transfer graph is synthesised
    at build time, so the radius cannot be applied per search.
    """
    key = (_database_of(con), side, day, transfer_walk_m)
    if key not in _TIMETABLES:
        _TIMETABLES[key] = journey.Timetable.build(
            label=f"{side}-{day}-{transfer_walk_m:.0f}m",
            patterns=journey_patterns(con, side, day),
            coords=journey_coords(con, side),
            max_transfer_walk_m=transfer_walk_m)
    return _TIMETABLES[key]


def lower_median(values):
    """The lower median, matching `analyze_travel_time.weighted_median` at a
    single origin's weight -- NOT `statistics.median`, which averages the two
    middle values on an even count. A minute some rider actually experiences
    is a better thing to publish than the average of two that nobody does,
    and the two differ by half a step of the arrival curve, which is exactly
    the size of drift a rounded comparison against the CSV would hide."""
    ordered = sorted(values)
    return ordered[(len(ordered) - 1) // 2] if ordered else None


def summarise_profile(profile):
    """The published numbers for one point's profile.

    The single-origin case of `analyze_travel_time.summarise`. The published
    place-level answer pools many block groups by population, which cannot be
    reproduced from one pin -- but each of those block groups is itself a
    point, and `data/trip_time_origins.csv` publishes them, which is what the
    served answer is pinned against.
    """
    reachable = round(profile.reachable_fraction, FRACTION_DP)
    if not profile.journeys:
        return {"median_min": None, "best_min": None, "worst_min": None,
                "reachable_fraction": reachable, "median_transfers": None,
                "median_wait_min": None}
    totals = [j.total_minutes for j in profile.journeys]
    return {
        "median_min": round(lower_median(totals), MINUTE_DP),
        "best_min": round(min(totals), MINUTE_DP),
        "worst_min": round(max(totals), MINUTE_DP),
        "reachable_fraction": reachable,
        "median_transfers": lower_median([j.transfers for j in profile.journeys]),
        "median_wait_min": round(
            lower_median([j.wait_minutes for j in profile.journeys]), MINUTE_DP),
    }


def median_journey(profile):
    """The itinerary that takes the median time -- a real trip, not a summary
    of several, so that what the panel describes is something a rider could
    actually have made."""
    if not profile.journeys:
        return None
    ordered = sorted(profile.journeys, key=lambda j: j.total_minutes)
    return ordered[(len(ordered) - 1) // 2]


def stop_names(con, side: str, stop_ids):
    """Best-effort names for the stops an itinerary calls at.

    `stops` is the bus-only service table, so rail stops have no row and come
    back unnamed rather than being joined in -- widening that table is the
    leak the journey layer is kept separate to prevent (convention 13).
    """
    if not stop_ids:
        return {}
    marks = ",".join("?" * len(stop_ids))
    return {r["stop_id"]: r["name"] for r in con.execute(
        f"SELECT stop_id, name FROM stops WHERE side = ? "
        f"AND stop_id IN ({marks})", (side, *stop_ids))}


def itinerary_of(con, side: str, trip, coords, day: str = JOURNEY_DAY):
    """One journey as the map can draw it: legs, with each end placed.

    Coordinates come from the journey layer's own stop table, which has every
    mode; names are looked up in the bus-only one and may be missing.

    A ride leg also carries the path the bus drives between its two stops, so
    the map draws it along the street rather than through the blocks between.
    A walk gets none: a walk really is a straight line here, which is what the
    legend's dashes say. Nor does a ride whose pattern named no shape, which
    falls back to the same straight line.
    """
    if trip is None:
        return None
    paths = cached_journey_paths(con, side, day)
    called = [stop for leg in trip.legs for stop in (leg.from_stop, leg.to_stop)
              if stop is not None]
    names = stop_names(con, side, sorted(set(called)))

    def end(stop_id):
        if stop_id is None:
            return None
        lat, lon = coords[stop_id]
        return {"stop_id": stop_id, "name": names.get(stop_id),
                "lat": lat, "lon": lon}

    def drawn(leg):
        if leg.kind != journey.LEG_RIDE or leg.pattern is None:
            return None
        path = paths[leg.pattern] if leg.pattern < len(paths) else None
        if path is None:
            return None
        points, stop_idx = path
        if leg.to_pos >= len(stop_idx):
            return None
        return [list(pt) for pt in
                points[stop_idx[leg.from_pos]:stop_idx[leg.to_pos] + 1]]

    return {
        "ready_at": trip.ready_at,
        "arrive": round(trip.arrive, MINUTE_DP),
        "total_min": round(trip.total_minutes, MINUTE_DP),
        "ride_min": round(trip.ride_minutes, MINUTE_DP),
        "walk_min": round(trip.walk_minutes, MINUTE_DP),
        "wait_min": round(trip.wait_minutes, MINUTE_DP),
        "transfers": trip.transfers,
        "legs": [{"kind": leg.kind, "route": leg.route,
                  "from": end(leg.from_stop), "to": end(leg.to_stop),
                  "depart": round(leg.depart, MINUTE_DP),
                  "arrive": round(leg.arrive, MINUTE_DP),
                  "path": drawn(leg)}
                 for leg in trip.legs],
    }


def classify_journey(origin_access, dest_access, medians):
    """Why a pair has no comparable travel time, in the published vocabulary.

    Order matters and mirrors `analyze_travel_time.classify`: a missing stop
    at either end is a coverage answer and is named as one, and NO_JOURNEY is
    reserved for the case where both ends are served and the search still
    found nothing -- which is the only one of the three that is really about
    time.
    """
    if all(medians[side] is not None for side in SIDES):
        return CLASS_COMPARABLE
    if any(origin_access[side] == 0 for side in SIDES):
        return CLASS_NO_ORIGIN_COVERAGE
    if any(dest_access[side] == 0 for side in SIDES):
        return CLASS_NO_DEST_COVERAGE
    return CLASS_NO_JOURNEY


def journey_at_radius(con, origin, dest, day, window, transfer_walk_m):
    """Both networks between two points, at one invented transfer walk."""
    answers, origin_access, dest_access, medians = {}, {}, {}, {}
    for side in SIDES:
        tt = journey_timetable(con, side, day, transfer_walk_m)
        origin_access[side] = len(journey.access_stops(tt, origin))
        dest_access[side] = len(journey.access_stops(tt, dest))
        profile = journey.profile(tt, origin, dest, window)
        answer = summarise_profile(profile)
        answer["origin_access_stops"] = origin_access[side]
        answer["dest_access_stops"] = dest_access[side]
        answer["itinerary"] = itinerary_of(con, side, median_journey(profile),
                                           tt.coords, day)
        medians[side] = answer["median_min"]
        answers[side] = answer

    change = (None if None in medians.values()
              else round(medians["proposed"] - medians["current"], MINUTE_DP))
    return {"transfer_walk_m": transfer_walk_m,
            "classification": classify_journey(origin_access, dest_access,
                                               medians),
            "change_min": change, **answers}


def journey_between(con, lat: float, lon: float, dest_lat: float,
                    dest_lon: float, *, day: str = JOURNEY_DAY,
                    window: tuple = JOURNEY_WINDOW):
    """Door to door, both networks, both transfer radii.

    `change_min` is positive where the plan makes the trip longer. It is the
    difference of the two medians AS PUBLISHED, computed after rounding, so
    the arithmetic on the screen checks out -- deriving it from full precision
    and showing rounded halves is what once flagged a pair as reversing sign
    between two radii whose displayed changes were 0.0 and -1.0.

    `sign_flips` is the answer to the question the transfer radius raises:
    True where the headline and strict searches disagree about which network
    is faster, in which case the flip IS the finding and neither median
    should be quoted alone.
    """
    origin, dest = (lat, lon), (dest_lat, dest_lon)
    radii = {key: journey_at_radius(con, origin, dest, day, window, walk_m)
             for key, walk_m in TRANSFER_RADII.items()}
    headline = radii[TRANSFER_HEADLINE]["change_min"]
    strict = radii[TRANSFER_STRICT]["change_min"]
    return {
        "origin": {"lat": lat, "lon": lon},
        "destination": {"lat": dest_lat, "lon": dest_lon},
        "day": day,
        "window": {"start_min": window[0], "end_min": window[1],
                   "minutes": window[1] - window[0]},
        "radii": radii,
        "sign_flips": (None if headline is None or strict is None
                       else headline * strict < 0),
        "constants": journey.CONSTANTS,
    }


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
