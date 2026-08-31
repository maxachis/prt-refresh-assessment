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

import json

from . import geometry
import math
import re
import sqlite3
from pathlib import Path

from . import journey
from . import walking

DAYS = ("weekday", "saturday", "sunday")
SIDES = ("current", "proposed")

# The day dimension, and the sentinel for its absence. ANY_DAY is the PUBLISHED
# question -- a route serves a place or it does not, counted on any calendar --
# and it stays the default everywhere, because it is what
# `data/oneseat_change.csv` and the answer documents mean by a one-seat ride.
# The three day types beside it are a variant, not a refinement of it: they
# answer "can I make this trip on a Sunday", which the plan's weekend cuts make
# a different question, and their counts are NOT the published ones. Stored as
# a sentinel row rather than a nullable column so the two live in one table and
# a caller cannot forget which it asked for.
ANY_DAY = "any"
ONESEAT_DAYS = (ANY_DAY, *DAYS)

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

BOARDINGS_COLUMN = {"weekday": "weekday_boardings",
                    "saturday": "saturday_boardings",
                    "sunday": "sunday_boardings"}


def stop_boardings(con, stop_ids, day: str):
    """What PRT counted boarding at these stops on an average day of this type.

    The panel's second denominator, and convention 15 governs every part of
    it. It is one-sided: the usage extract counted stops that run today, so a
    proposed-side call would be asking a network that has not run how many
    people boarded it. `side_at_place` therefore never asks.

    A stop the extract has no figure for is counted as unmeasured rather than
    as zero, and a place where none of the stops has one gets `None` rather
    than a 0 total, for the same reason the change layer does: "nobody boards
    here" and "nobody counted here" are different sentences, and only the
    first is a finding.
    """
    if not stop_ids:
        return {"total": None, "measured": 0, "unmeasured": 0}
    column = BOARDINGS_COLUMN[day]
    counted = [r["v"] for r in con.execute(
        f"SELECT {column} AS v FROM stop_place "
        f"WHERE stop_id IN ({','.join('?' * len(stop_ids))})", stop_ids)
        if r["v"] is not None]
    return {"total": sum(counted) if counted else None,
            "measured": len(counted),
            "unmeasured": len(stop_ids) - len(counted)}


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
            # Observed riders exist on today's side only, permanently, so the
            # proposed side carries no key rather than an empty tally -- a
            # tally of zero stops reads too much like a tally of zero riders.
            "boardings": (stop_boardings(con, stop_ids, day)
                          if side == "current" else None),
        }

    return {
        "side": side,
        "stops": [{"stop_id": s[0], "name": s[1], "lat": s[2], "lon": s[3],
                   "metres": round(s[4])} for s in stops],
        "days": days,
    }


def place(con, lat: float, lon: float, radius: float = PRIMARY_RADIUS,
          dest_lat: float | None = None, dest_lon: float | None = None,
          oneseat_day: str = ANY_DAY):
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
    # By containment, NOT by `out["place"]`'s nearest-stop label: the two name
    # a place differently on 14 of PRT's 187 labels ("Penn Hills township" vs
    # the county's "Penn Hills municipality"), and a lookup by the label would
    # report a measured zero for places that lose thousands of residents'
    # service. See the `place_boundary` schema comment in `build_webdb.py`.
    out["population"] = place_residents(con, lat, lon)
    # The one-seat verdicts ride along with the panel rather than sitting
    # behind their own request: they answer a question about this same point,
    # and two round trips would let the panel show a corner's trip counts
    # while its "can I still get Downtown" line was still loading.
    # `oneseat_day` follows whatever the map is showing, so a dot and the
    # panel it opens never answer different questions. It is separate from the
    # day types above, which are this panel's own before/after counts: those
    # are always all three, because the day-by-day trip counts are the very
    # thing a one-seat verdict cannot tell you.
    out["oneseat"] = oneseat_named(con, lat, lon, radius, oneseat_day)
    out["oneseat_day"] = oneseat_day
    # A dropped pin joins the named destinations rather than replacing them.
    # The reader picked it, so it goes first; Downtown and Oakland stay because
    # they are the two the published answers cover and the two most people are
    # actually travelling to.
    if dest_lat is not None and dest_lon is not None:
        out["oneseat"].insert(0, pin_verdict(con, lat, lon, radius,
                                             dest_lat, dest_lon, oneseat_day))
    return out


def pin_verdict(con, lat: float, lon: float, radius: float,
                dest_lat: float, dest_lon: float, day: str = ANY_DAY):
    """One dropped-pin destination, shaped like a named one for the panel."""
    got = oneseat_at_place(con, lat, lon, radius,
                           dest_lat=dest_lat, dest_lon=dest_lon, day=day)
    return {
        "key": None,
        "name": f"the point you picked ({dest_lat:.4f}, {dest_lon:.4f})",
        "lat": dest_lat, "lon": dest_lon,
        "status": got["status"],
        "day": day,
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


# How a packed point is laid out: three fixed columns, then one group per day
# type. Defined here rather than spelled as literals at the two places that
# read it, because the client mirrors these offsets in frontend/types.ts and a
# stride that drifts on one side silently recolours the map on the other.
POINT_STRIDE = 4
def CUR_AT(day: int) -> int: return 3 + POINT_STRIDE * day
def PROP_AT(day: int) -> int: return 4 + POINT_STRIDE * day
def BUCKET_AT(day: int) -> int: return 5 + POINT_STRIDE * day
def RIDERS_AT(day: int) -> int: return 6 + POINT_STRIDE * day


def point_boardings(con) -> dict[str, dict[str, float | None]]:
    """Observed daily boardings at each published point, by day type.

    From the May 2025 usage extract, carried into `stop_place` by
    `build_webdb.py`. Three things about this number decide how it may be
    drawn, and all three are convention 15:

    It exists only on today's side. The published points ARE the usage
    extract's stops -- `change_points` builds them from this table -- so every
    one of them has a figure and none is missing. The points the proposed
    network adds are absent here, and they are absent because a network that
    has not run has no observed riders. A missing figure is therefore returned
    as `None` and never as 0: the difference between "nobody boards here" and
    "nobody can have boarded here yet" is the whole asymmetry of weighting this
    map by ridership.

    It is boardings, not people: unlinked and unweighted, so one rider's round
    trip with a transfer is up to four of them.

    And it is PRT's own count, carrying PRT's own disclaimer -- unadjusted,
    unofficial totals that may understate ridership by up to 30%.
    """
    return {f"c:{r['stop_id']}": {"weekday": r["weekday_boardings"],
                                  "saturday": r["saturday_boardings"],
                                  "sunday": r["sunday_boardings"]}
            for r in con.execute(
                "SELECT stop_id, weekday_boardings, saturday_boardings, "
                "  sunday_boardings FROM stop_place")}


def change_layer(con, radius: float = PRIMARY_RADIUS):
    """The citywide layer at one radius, all three day types, packed for the wire.

    Columnar on purpose. The same content as GeoJSON is several megabytes of
    repeated key names for ~5,900 points; as fixed-width rows it is a few
    hundred kilobytes, and the client assembles the GeoJSON itself. All three
    day types ship together so switching Weekday/Saturday/Sunday repaints from
    memory instead of refetching -- 152 locations keep their weekday buses and
    lose the weekend entirely, and that comparison should cost nothing.

    Each row is [lat, lon, published, then per day: cur, prop, bucket index,
    boardings]. Boardings are `null`, never 0, at a point the proposed network
    serves and today's does not -- see `point_boardings`.
    """
    rows = con.execute(
        "SELECT point_id, day, lat, lon, published, cur_trips, prop_trips, "
        "  bucket FROM change WHERE radius = ? ORDER BY point_id",
        (int(radius),)).fetchall()

    boardings = point_boardings(con)
    idx = {k: i for i, k in enumerate(BUCKET_KEYS)}
    packed: dict[str, list] = {}
    for r in rows:
        p = packed.setdefault(
            r["point_id"], [round(r["lat"], 6), round(r["lon"], 6),
                            r["published"], *([0] * (POINT_STRIDE * len(DAYS)))])
        day = DAYS.index(r["day"])
        p[CUR_AT(day):RIDERS_AT(day) + 1] = [
            r["cur_trips"], r["prop_trips"], idx[r["bucket"]],
            boardings.get(r["point_id"], {}).get(r["day"])]

    return {
        "radius": int(radius),
        "days": list(DAYS),
        "buckets": [{"key": k, "label": lab} for k, lab in BUCKETS],
        "fields": ["lat", "lon", "published",
                   *[f"{d}_{f}" for d in DAYS
                     for f in ("cur", "prop", "bucket", "riders")]],
        "points": list(packed.values()),
    }


# --------------------------------------------------------------------------
# people on the same ground
# --------------------------------------------------------------------------

# The four outcomes a resident can have, and they are a partition: everybody
# alive in the three counties is in exactly one of them on every day type.
# Deliberately coarser than the surface's ramp beside it -- this is coverage,
# not magnitude, because that is the question `analyze_equity_change.py`
# publishes an answer to and a second, differently-defined people-number is
# the one thing this layer must not introduce (convention 12).
POP_CLASSES = (
    ("lost", "lose all bus service"),
    ("gained", "gain bus service"),
    ("kept", "keep a bus"),
    ("none", "no bus either way"),
)
POP_CLASS_KEYS = tuple(k for k, _ in POP_CLASSES)

# `none` is a keyword-shaped column name, so the table spells it `neither`.
POP_COLUMN = {"none": "neither"}

# A packed cell is [ix, iy] then one group of four per day type, in
# POP_CLASSES order -- the same shape as a packed change point, mirrored in
# frontend/types.ts.
POP_STRIDE = len(POP_CLASSES)


def POP_AT(day: int, klass: str) -> int:
    return 2 + POP_STRIDE * day + POP_CLASS_KEYS.index(klass)


def served_stop_ids(con, side: str, day: str) -> set[str]:
    """Stops of one network with at least one departure on one day type.

    The whole coverage test, and no more than that: "any bus at all" is the
    published WEEKDAYS-ANY-MINIMUM tier, which asks whether a bus comes, not
    how often. Frequency is the surface's question and lives beside this one.
    """
    return {r[0] for r in con.execute(
        "SELECT DISTINCT stop_id FROM departures "
        "WHERE side = ? AND day = ? AND n > 0", (side, day))}


def compute_cell_population(con, residents, radius: float = PRIMARY_RADIUS):
    """Rows for `cell_population`: who gains and loses a bus, by lattice cell.

    The third denominator (convention 12), measured so that it cannot disagree
    with the published one. Two decisions do that work.

    **Coverage is decided at the resident's own point, never at the cell's.**
    Each populated census block is tested where its people actually are, and
    the cell it falls in is only where the answer is *drawn*. Testing at the
    cell centre instead would move a person up to 70 m before asking whether
    they have a bus, and the citywide answer drifts about 3% -- enough to put
    a different loss figure under the reader's cursor than the one the
    findings page prints. The consequence is deliberate and worth knowing: a
    cell painted "loses all service" by the surface, which is a centre test,
    can hold residents counted here as keeping a bus. The colour describes the
    ground; the number describes the people.

    **A resident weighs what the ACS says they weigh.** `residents` carries
    2020 block populations already rescaled to the ACS universe the equity
    work counts in -- blocks say where inside a block group people live, the
    ACS says how many there are, and the published figures are the product.
    Using raw block counts moves the county total by about 1%.

    Returns (radius, day, ix, iy, county, lost, gained, kept, neither). County
    rides along because the published figures are Allegheny-only while the map
    paints all three counties, and without it the served number could not be
    checked against them.
    """
    served = {(side, day): served_stop_ids(con, side, day)
              for side in SIDES for day in DAYS}
    cells: dict[tuple, dict[str, float]] = {}

    for lat, lon, people, county in residents:
        ix, iy = cell_of(lat, lon)
        near = {side: [s[0] for s in stops_within(con, lat, lon, radius, side)]
                for side in SIDES}
        for day in DAYS:
            cur = any(sid in served[("current", day)] for sid in near["current"])
            prop = any(sid in served[("proposed", day)]
                       for sid in near["proposed"])
            klass = ("lost" if cur and not prop else
                     "gained" if prop and not cur else
                     "kept" if cur else "none")
            at = cells.setdefault((day, ix, iy, county),
                                  dict.fromkeys(POP_CLASS_KEYS, 0.0))
            at[klass] += people

    return [(int(radius), day, ix, iy, county,
             *(round(at[k], 3) for k in POP_CLASS_KEYS))
            for (day, ix, iy, county), at in sorted(cells.items())]


def population_layer(con, radius: float = PRIMARY_RADIUS):
    """The people layer at one radius, all three day types, packed for the wire.

    Columnar for the same reason the change layer is, and county is summed
    away here: a reader panning a map is asking about a viewport, not about a
    county, and the scope that matters to them is named in the key instead.
    """
    packed: dict[tuple[int, int], list] = {}
    for r in con.execute(
            "SELECT ix, iy, day, lost, gained, kept, neither "
            "FROM cell_population WHERE radius = ? ORDER BY ix, iy",
            (int(radius),)):
        cell = packed.setdefault(
            (r["ix"], r["iy"]),
            [r["ix"], r["iy"], *([0.0] * (POP_STRIDE * len(DAYS)))])
        day = DAYS.index(r["day"])
        for klass in POP_CLASS_KEYS:
            at = POP_AT(day, klass)
            cell[at] = round(cell[at] + r[POP_COLUMN.get(klass, klass)], 1)

    return {
        "radius": int(radius),
        "cell_m": CELL_M,
        "days": list(DAYS),
        "classes": [{"key": k, "label": lab} for k, lab in POP_CLASSES],
        "origin": {
            "lat0": LAT0,
            "lon0": LON0,
            "dlat": CELL_M / METERS_PER_DEGREE,
            "dlon": CELL_M / M_PER_DEG_LON,
        },
        "fields": ["ix", "iy",
                   *[f"{d}_{k}" for d in DAYS for k in POP_CLASS_KEYS]],
        "cells": list(packed.values()),
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


# The equity work is Allegheny-only (`analyze_equity_change.py` reports three
# scopes and `analyze_equity_places.py` names places in one of them), so a
# point outside the county has no answer rather than an answer of zero.
EQUITY_COUNTY = "Allegheny"

# PRT writes a municipality as "Whitehall borough (Allegheny, PA)"; the census
# work writes the same place as "Whitehall borough". One suffix, and it also
# carries the only county the panel can read off a label.
_COUNTY_SUFFIX = re.compile(r"\s*\(([^,()]+),\s*[A-Za-z]{2}\)\s*$")


def place_key(label: str) -> str:
    """A HOOD or MUNI label reduced to what both sides spell the same way."""
    return _COUNTY_SUFFIX.sub("", (label or "").strip()).casefold()


def place_display(label: str) -> str:
    """The same label as a reader would write it, county suffix removed."""
    return _COUNTY_SUFFIX.sub("", (label or "").strip())


def place_county(label: str) -> str | None:
    """The county PRT's own municipality label names, if it names one."""
    found = _COUNTY_SUFFIX.search((label or "").strip())
    return found.group(1) if found else None


# Below this many residents a place is not given a share of itself. Trafford
# borough is why: it straddles the county line, its Allegheny part is 16
# people, all 16 lose every bus, and ranked by share that 97.5% led the whole
# list -- above Reserve township's 85% of 3,180 -- on a denominator that
# cannot support the third significant figure it appears to carry. The floor
# removes exactly that one place today and costs 16 of 68,838 residents lost;
# the next smallest denominator is Bon Air's 776, whose 93.1% is a real
# finding and stays. A withheld share is drawn as a dash, and the place keeps
# its position in the count-ranked list, where 16 is simply 16.
SHARE_MIN_RESIDENTS = 100


def _place_row(row):
    """One place_population row as the API serves it, shares included.

    The share is computed here rather than stored so that the count and the
    denominator it divides always arrive from the same row -- and it is
    `residents_total`, the place's whole ACS population, never the population
    of the block groups that changed. See `analyze_equity_places.place_totals`
    for why those are different numbers.
    """
    total = row["residents_total"]
    ranked = total >= SHARE_MIN_RESIDENTS
    return {
        "key": row["key"],
        "place": row["place"],
        "changed_block_groups": row["block_groups"],
        "block_groups": row["total_block_groups"],
        "residents_lost": row["residents_lost"],
        "residents_gained": row["residents_gained"],
        "residents_total": total,
        "share_lost": row["residents_lost"] / total if ranked else None,
        "share_gained": row["residents_gained"] / total if ranked else None,
        "lat": row["lat"], "lon": row["lon"],
    }


def places(con):
    """Every named Allegheny place the plan changes, with its own population.

    The list behind the Places view, and the reason that view exists: the
    panel's population line is a *place* figure printed under a walk circle
    that measures one point, and at Squirrel Hill South the two say opposite
    things -- the circle triples its service while 259 people on Beechwood
    Boulevard lose every bus. This answers the place-level question in a
    place-level view instead.

    Ranking is left to the caller, because the two orders disagree and both
    are true. By count, twelve places carry 71.5% of everyone who loses every
    bus. By share, the list is led by small boroughs and townships that a
    count-ranked list buries -- Reserve township is ninth by count and loses
    85% of its residents.

    Scope, per convention 12: named places only. The six block groups beyond
    `analyze_equity_places.LABEL_RADIUS_M` of a labelled stop take no name and
    are not here; they hold 151 of the county's 68,989 residents who lose
    every bus, and a view listing this must say so rather than implying it
    totals the county.
    """
    return [_place_row(r) for r in con.execute(
        "SELECT * FROM place_population ORDER BY residents_lost DESC")]


def boundaries(con):
    """Every place's boundary as a GeoJSON FeatureCollection.

    Each feature carries the place's own change figures, so the choropleth
    colours itself from the properties it already has rather than joining to
    `/api/places` in the browser -- one source for the number under the cursor
    and the number in the list.

    A place the plan does not touch is included with zeros rather than
    omitted. Leaving it out would draw a hole in the county and read as "not
    measured", when what is true is "measured, and nothing changed" -- which
    for most of Allegheny is the finding.
    """
    changed = {r["key"]: r for r in con.execute("SELECT * FROM place_population")}
    features = []
    # `residents_total > 0` drops the places wholly covered by a finer one --
    # Pittsburgh city, every acre of which is in one of the 90 neighbourhoods.
    # Drawing it would lay one null-share polygon over the ninety that hold its
    # people. See the `place_boundary` schema comment.
    for row in con.execute(
            "SELECT key, place, kind, polygons FROM place_boundary "
            "WHERE residents_total > 0"):
        hit = changed.get(row["key"])
        props = {"key": row["key"], "place": row["place"], "kind": row["kind"]}
        props.update(_place_row(hit) if hit else {
            "changed_block_groups": 0, "block_groups": 0,
            "residents_lost": 0.0, "residents_gained": 0.0,
            "residents_total": None, "share_lost": None, "share_gained": None})
        features.append({
            "type": "Feature",
            "geometry": {"type": "MultiPolygon",
                         "coordinates": json.loads(row["polygons"])},
            "properties": props,
        })
    return {"type": "FeatureCollection", "features": features}


def place_detail(con, key: str):
    """One place, plus the changed block groups as points, or None.

    The points are the geometry this repo has. It carries no place boundaries
    at all -- a block group takes the name of the nearest surviving labelled
    PRT stop, median 373 m away and up to 1,989 m -- so filling a real
    municipal polygon with these numbers would assert that PRT's labelling and
    the municipal partition agree, which nothing here has checked. A point per
    block group claims only what was measured.
    """
    row = con.execute("SELECT * FROM place_population WHERE key = ?",
                      (key,)).fetchone()
    if row is None:
        return None
    detail = _place_row(row)
    detail["changed"] = [
        {"geoid": b["geoid"], "lat": b["lat"], "lon": b["lon"],
         "residents_lost": b["residents_lost"],
         "residents_gained": b["residents_gained"]}
        for b in con.execute(
            "SELECT * FROM place_block_group WHERE key = ? "
            "ORDER BY residents_lost DESC", (key,))]
    return detail


_PLACE_INDEX = {}


def place_index(con):
    """The county's boundaries, loaded once per connection.

    Cached on the connection because the panel asks this on every click and
    parsing 3.5 MB of polygon JSON per request would dominate the response.
    """
    cached = _PLACE_INDEX.get(id(con))
    if cached is None:
        cached = geometry.PlaceIndex([
            geometry.Place(name=r["place"], kind=r["kind"],
                           polygons=json.loads(r["polygons"]))
            for r in con.execute(
                "SELECT place, kind, polygons FROM place_boundary")])
        _PLACE_INDEX[id(con)] = cached
    return cached


def place_containing(con, lat: float, lon: float):
    """The named place this point is inside, or None."""
    hit = place_index(con).place_at(lat, lon)
    return hit.name if hit else None


def place_residents(con, lat: float, lon: float):
    """How many people this named place loses and gains every bus for.

    The panel's population line, and it is a *place* figure, not a figure for
    the walk radius the rest of the panel measures -- a point has no
    population worth quoting, and computing one here would put a fourth
    people-number on the site that disagrees with the surface key reading the
    cell under the cursor.

    Three rules, and each is a different kind of nothing:

    A place looked up by the same label the heading prints, weak as convention
    6 says that label is. A second way of deciding which place a point sits in
    would let the heading and the number below it name different places.

    Outside Allegheny there is no answer at all -- `None` -- because the equity
    work never asked there. Reporting 0 would say the plan changes nothing for
    anyone in Beaver County, which is a finding nobody has earned.

    Inside Allegheny, a place absent from the published table is a real zero:
    the file holds every block group that changed, so absence means nobody
    here loses or gains every bus. That is worth printing, and it is why this
    returns a measured zero rather than `None`.
    """
    named = place_containing(con, lat, lon)
    if not named:
        return None

    row = con.execute(
        "SELECT key, place, block_groups, residents_lost, residents_gained "
        "FROM place_population WHERE key = ?", (place_key(named),)).fetchone()
    # `key` is served so the panel can link into the Places view without
    # re-deriving it. It was briefly ported into TypeScript instead, which
    # meant `place_key`'s rules lived in two languages and a change to one
    # would have sent the link to the wrong place, or to none, with nothing
    # failing loudly enough to notice.
    if row is None:
        return {"key": place_key(named), "place": place_display(named),
                "lost": 0.0, "gained": 0.0, "block_groups": 0,
                "measured": True}
    return {"key": row["key"], "place": row["place"],
            "lost": row["residents_lost"],
            "gained": row["residents_gained"],
            "block_groups": row["block_groups"], "measured": True}


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
# 3. ITS DEFAULT HAS NO DAY TYPE, AND THAT DEFAULT IS THE PUBLISHED ANSWER. A
#    route serves a location or it does not, counted on any calendar, which is
#    what `data/oneseat_change.csv` means and what the answer documents cite.
#    Every caller here defaults to ANY_DAY for that reason.
#
#    A day type can now be asked for beside it, and it is a DIFFERENT
#    MEASUREMENT rather than a sharper version of the same one -- its counts
#    are not the published counts and anything quoting them has to say which
#    it used. It exists because the plan's weekend cuts make "can I still get
#    Downtown without transferring on a Sunday" a question the any-day answer
#    silently answers yes to: 152 locations keep every weekday bus and lose
#    the weekend outright. It is resolved per (stop, route, day), never per
#    (route, day) -- a route running Sunday somewhere is not the same claim as
#    it running past this corner, which is precisely the S-variants' case.
#
#    What it still cannot say is how OFTEN. A one-seat ride surviving on a
#    Sunday may be hourly; the panel's own day-by-day trip counts are what
#    answer that, and the legend has to keep pointing at them.
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

# Named here rather than beside the one-seat layer that owns them because
# `place()` above defaults to ANY_DAY too, and a default cannot reference a
# constant defined further down the module. The full reasoning is in the
# one-seat section's note 3.
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


def reach_stops_within(con, lat: float, lon: float, radius: float, side: str,
                      day: str = ANY_DAY):
    """[(stop_id, lat, lon, frozenset(routes))] inside the radius, ALL MODES.

    The one-seat counterpart of `stops_within`, and deliberately a separate
    table and index rather than a flag on that one: `stops` holds the bus-only
    universe every service figure in this app is measured over, and quietly
    widening it would move published numbers. See note 1 above for why this
    question needs rail and those do not.

    Same padded-box-then-exact-circle metric as `stops_within`, for the same
    reason -- the r-tree stores 32-bit floats, so the box is a prefilter and
    never the tighter of the two tests.

    `day` is note 3's escape hatch, and it defaults to the published answer.
    At ANY_DAY the routes come from `reach_stop`, which counts a route that
    calls here on any calendar at all -- that is the method
    `data/oneseat_change.csv` publishes. Naming a day type instead reads
    `reach_stop_day`, which is resolved per (stop, route, day), so a route
    whose weekend pattern skips this corner is absent here even though it
    still runs. A missing row is no service, not all of it: LEFT JOIN with an
    empty default rather than an inner join, so a stop that keeps its geometry
    and loses its Sunday bus stays in the answer as a stop with nothing at it.
    """
    coslat, dlat, dlon = _bbox(lat, lon, radius)
    if day == ANY_DAY:
        source, params = "s.routes", ()
    else:
        source, params = ("COALESCE(("
                          " SELECT dd.routes FROM reach_stop_day dd"
                          " WHERE dd.side = s.side AND dd.stop_id = s.stop_id"
                          "   AND dd.day = ?), '')", (day,))
    rows = con.execute(
        f"""
        SELECT s.stop_id, s.lat, s.lon, {source} AS routes
        FROM reach_rtree r
        JOIN reach_key k ON k.id = r.id
        JOIN reach_stop s ON s.side = k.side AND s.stop_id = k.stop_id
        WHERE r.min_lat >= ? AND r.max_lat <= ?
          AND r.min_lon >= ? AND r.max_lon <= ?
          AND k.side = ?
        """,
        (*params, lat - dlat, lat + dlat, lon - dlon, lon + dlon, side),
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


def routes_at(con, lat: float, lon: float, radius: float, side: str,
              day: str = ANY_DAY) -> set[str]:
    """Every route boardable within a walk of one point, on one network."""
    out: set[str] = set()
    for _sid, _lat, _lon, routes in reach_stops_within(con, lat, lon, radius,
                                                       side, day):
        out |= routes
    return out


def routes_reaching(con, seeds, radius: float, side: str,
                    day: str = ANY_DAY) -> set[str]:
    """Every route that stops within the radius of any seed point.

    A destination is a SET of points, not one point, and that is what lets a
    district and a pin share one definition. Downtown is the 44 stops PRT
    labels Central Business District; a pin the reader drops is a set of one.
    Union, not intersection: a route serves Downtown if it stops anywhere in
    it.
    """
    out: set[str] = set()
    for lat, lon in seeds:
        out |= routes_at(con, lat, lon, radius, side, day)
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


def destination_reach(con, key: str, radius: float, side: str,
                      day: str = ANY_DAY) -> set[str] | None:
    """The stored route set for a named destination, or None if not built.

    Precomputed by `build_webdb.py` because Downtown is 44 seed points and
    Oakland 93: measuring them per request would put ~270 spatial queries in
    front of every click, to re-derive an answer that cannot change between
    builds. A pin the reader drops is one point and is measured live.
    """
    row = con.execute(
        "SELECT routes FROM destination_reach "
        "WHERE dest_key = ? AND radius = ? AND side = ? AND day = ?",
        (key, int(radius), side, day)).fetchone()
    if row is None:
        return None
    return set(row["routes"].split(";")) if row["routes"] else set()


def resolve_destination(con, radius: float, key: str | None = None,
                        lat: float | None = None, lon: float | None = None,
                        day: str = ANY_DAY):
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
            stored = destination_reach(con, key, radius, side, day)
            reach[side] = (stored if stored is not None
                           else routes_reaching(con, seeds, radius, side, day))
        return name, seeds, reach

    if lat is None or lon is None:
        raise ValueError("a destination needs either a key or a lat/lon")
    seeds = [(lat, lon)]
    return (None, seeds,
            {side: routes_reaching(con, seeds, radius, side, day)
             for side in SIDES})


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
                     dest_lon: float | None = None,
                     day: str = ANY_DAY):
    """Can a rider get from this point to that destination without changing?

    Returns both sides' route lists in full rather than a verdict alone, for
    the reason the panel exists: "loses its one-seat ride" is a sentence a
    reader should be able to check against route numbers they recognise, and a
    bare status invites the map to be quoted without them.
    """
    name, seeds, reach = resolve_destination(con, radius, key, dest_lat,
                                             dest_lon, day)
    here = at_destination(lat, lon, seeds, radius)

    sides = {}
    for side in SIDES:
        serving = routes_at(con, lat, lon, radius, side, day)
        sides[side] = sorted(serving & reach[side])

    now, prop = set(sides["current"]), set(sides["proposed"])
    return {
        "destination": {"key": key, "name": name, "seeds": len(seeds),
                        "lat": dest_lat, "lon": dest_lon},
        "radius": radius,
        "day": day,
        "status": oneseat_status(now, prop, here),
        "current": sides["current"],
        "proposed": sides["proposed"],
        "kept": sorted(now & prop),
        "lost": sorted(now - prop),
        "gained": sorted(prop - now),
    }


def oneseat_named(con, lat: float, lon: float, radius: float,
                  day: str = ANY_DAY):
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

    serving = {side: routes_at(con, lat, lon, radius, side, day)
               for side in SIDES}
    out = []
    for d in destinations(con):
        seeds = destination_seeds(con, d["key"])
        here = at_destination(lat, lon, seeds, radius)
        sides = {}
        for side in SIDES:
            reach = destination_reach(con, d["key"], radius, side, day)
            if reach is None:
                reach = routes_reaching(con, seeds, radius, side, day)
            sides[side] = serving[side] & reach
        now, prop = sides["current"], sides["proposed"]
        out.append({
            "key": d["key"], "name": d["name"],
            "lat": d["lat"], "lon": d["lon"],
            "day": day,
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
                  dest_lon: float | None = None,
                  day: str = ANY_DAY):
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
    name, seeds, reach = resolve_destination(con, radius, key, dest_lat,
                                             dest_lon, day)

    rows = con.execute(
        "SELECT point_id, side, lat, lon, published, routes FROM point_reach "
        "WHERE radius = ? AND day = ? ORDER BY point_id",
        (int(radius), day)).fetchall()

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
        "day": day,
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

# `itinerary_of` derives a walk leg's drawing search distance from its own
# timed duration, round-tripped through a division and a multiplication by
# `journey.WALK_SPEED_M_PER_MIN`. This much slack absorbs that round-trip's
# floating-point error without ever loosening the search enough to draw a
# walk the clock did not actually charge for.
WALK_PATH_SLACK_M = 1.0

# {(database, side, day, transfer walk): Timetable}. Keyed by database file
# rather than by connection because a Timetable is derived only from what the
# file holds, and building one is ~0.3 s of work that would otherwise be
# repeated on every request.
_TIMETABLES: dict[tuple, "journey.Timetable"] = {}
# Parsed drawn paths, per database, side and day. About 2 MB of text across
# both feeds, so parsing it per request would cost more than routing does.
_PATHS: dict[tuple, list] = {}
# {database: WalkNetwork or None}, one graph shared by both sides -- a street
# does not move between the current and proposed plans. None is cached too,
# not left as a missing key, so a database built before this layer existed is
# recognised once per process rather than re-checked on every request.
_WALK_NETWORKS: dict[str, "walking.WalkNetwork | None"] = {}


def _database_of(con) -> str:
    """The file this connection reads, as the timetable cache's key."""
    return con.execute("PRAGMA database_list").fetchone()[2]


def walk_network(con):
    """The pedestrian graph stored in this database, or None on one built
    before `walk_network` existed.

    Cached per database file for the reason `_TIMETABLES` is: unpacking ~1.0M
    nodes from their blobs is real work, and the graph never changes under a
    running server. A caller that gets None falls back to the straight line
    every walk drew before this layer -- see `itinerary_of`.
    """
    key = _database_of(con)
    if key not in _WALK_NETWORKS:
        blobs = {row["name"]: row["data"] for row in
                 con.execute("SELECT name, data FROM walk_network")} \
            if _has_table(con, "walk_network") else {}
        _WALK_NETWORKS[key] = walking.WalkNetwork.from_blobs(blobs) if blobs else None
    return _WALK_NETWORKS[key]


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
            max_transfer_walk_m=transfer_walk_m,
            walk=walk_network(con))
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


def itinerary_of(con, side: str, trip, coords, day: str = JOURNEY_DAY, *,
                 origin: tuple, dest: tuple):
    """One journey as the map can draw it: legs, with each end placed.

    Coordinates come from the journey layer's own stop table, which has every
    mode; names are looked up in the bus-only one and may be missing.

    A ride leg carries the path the bus drives between its two stops, so the
    map draws it along the street rather than through the blocks between. A
    walk leg carries the routed pedestrian path over the same network the
    clock charged it against -- see the nested `walk_path` below for how its
    search distance is derived from the leg's own duration, which is what
    keeps the drawn walk from ever being shorter than the one the rider was
    billed for.
    Either kind falls back to None (the straight line the caller already
    knows how to draw) when there is nothing to draw it with: a ride whose
    pattern named no shape, or a walk the network cannot route within its
    charged distance. `origin` and `dest` fill in the one end of the first
    and last legs that no stop id names.
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

    def ride_path(leg):
        if leg.pattern is None:
            return None
        path = paths[leg.pattern] if leg.pattern < len(paths) else None
        if path is None:
            return None
        points, stop_idx = path
        if leg.to_pos >= len(stop_idx):
            return None
        return [list(pt) for pt in
                points[stop_idx[leg.from_pos]:stop_idx[leg.to_pos] + 1]]

    def walk_path(leg):
        network = walk_network(con)
        if network is None:
            return None
        start = coords[leg.from_stop] if leg.from_stop is not None else origin
        end = coords[leg.to_stop] if leg.to_stop is not None else dest
        # The leg's own timed duration, converted back to a distance, is
        # EXACTLY the distance the clock charged it -- so searching for a
        # path no longer than that (plus a hair of slack for the float
        # round-trip through minutes and back) guarantees the drawn walk can
        # never be shorter than the one the rider was billed for.
        max_m = ((leg.arrive - leg.depart) * journey.WALK_SPEED_M_PER_MIN
                + WALK_PATH_SLACK_M)
        walk = network.path_between(start, end, max_m)
        if walk is None:
            return None
        # Stored and drawn as "lon,lat", matching a ride's path and every
        # other GeoJSON coordinate in this file; `Walk.points` is (lat, lon).
        return [[lon, lat] for lat, lon in walk.points]

    def drawn(leg):
        if leg.kind == journey.LEG_RIDE:
            return ride_path(leg)
        if leg.kind == journey.LEG_WALK:
            return walk_path(leg)
        return None

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
                                           tt.coords, day,
                                           origin=origin, dest=dest)
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
