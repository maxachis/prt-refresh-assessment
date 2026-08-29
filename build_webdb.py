#!/usr/bin/env python3
"""
Both networks' timetables into one SQLite file, for the web app to query live.

This is the last step of the pipeline and the only one whose output is not a
CSV. `data/refresh.db` is a *serving* artifact: the web layer opens it
read-only and never writes, exactly as pgh-ghost-bus's dashboard does over its
hot store. Nothing here is a new analysis -- the numbers this file serves are
the numbers `analyze_coverage_change.py` publishes, reachable at an arbitrary
point and radius instead of only at the 5,751 stop locations that script emits.

WHY DEPARTURE LISTS RATHER THAN TRIP COUNTS

The obvious schema stores trips per stop per period, and it cannot answer the
question the app exists to ask. A rider standing at a corner wants the gap
between buses, and a gap is not recoverable from a count: eight trips in a
period is a bus every 22 minutes or eight buses in one hour and nothing after.
`analyze_coverage_change.py`'s hourly tier is a maximum-gap test for that
reason. So the unit stored is one row per (side, stop, route, direction, day)
carrying that trip's actual departure minutes, and every count, period bucket
and gap the app reports is derived from it at query time. Periods and the axis
are not baked in, which is what lets the radius be a slider rather than a
rebuild.

The row count is what makes this affordable. Storing one row per stop_time
would be ~2.5M rows across both feeds; packing the times into the
(stop, route, direction, day) row that owns them is ~100k rows, because that is
how many distinct such combinations exist.

AND WHY THE ROUTER STILL GETS ITS OWN TABLES

Departure lists answer how much service runs at a place. They cannot answer
how long a rider's trip takes, because they have thrown away which departures
belong to the same vehicle and in what order it calls -- the one dimension a
journey needs. So the `journey_*` tables carry a second reading of both feeds,
in raw minutes and with rail in, and nothing joins them to the tables above.
See the schema comment on `journey_pattern`, and convention 14.

THE AGGREGATION RULE IS THE ANALYSIS

Convention 2 says aggregate above the stop id, and the rule
`analyze_coverage_change.py` arrived at is stored here verbatim in
`refresh/query.py`:

    trips at a location = for each (route, direction) stopping within R metres,
                          the departures at whichever stop in the cluster
                          carries the most of them -- MAX, NOT SUM

Summing is the bug that convention exists to prevent: two adjacent stop ids on
one corridor would double every route that calls at both, so consolidating two
stops into one would read as a service cut. The query layer must never sum
across stops, and `tests/test_query.py` pins that.

Both sides are measured by the same code path -- `gtfs.load_service` is called
twice and neither side has its own branch. That is structural here, not a
convention: there is a real feed on both sides.

THE CHANGE LAYER IS PRECOMPUTED, BY THE SAME CODE THAT ANSWERS A CLICK

`change` holds what the map paints before anybody clicks: every published
location, bucketed by what the plan does to it, at both radii and all three day
types. It is built by calling `refresh.query.compute_change` -- the app's own
`side_at_place`, run ~35,000 times -- rather than by a bespoke aggregate here,
because the one thing a citywide layer must not do is disagree with the panel
that opens when a reader clicks one of its dots. It adds ~15s to this build,
and it runs on a connection opened after the build: see `change_layer`.

Run ingest_blr.py and analyze_coverage_change.py first (this reads
data/coverage_change.csv for place labels and boardings).

    python3 build_webdb.py            -> data/refresh.db
    python3 build_webdb.py --out /tmp/x.db
"""

import argparse
import csv
import json
import sqlite3
import sys
from collections import Counter
from pathlib import Path

import gtfs
from gtfs import DAYS, SAMPLE
from analyze_frequency_change import PERIODS, period_of, to_axis

# The change layer is precomputed here by calling the app's own query layer, so
# that a dot on the citywide map and the panel behind it cannot disagree. This
# import adds no dependency and needs no install -- `refresh/query.py` is
# standard library only, exactly like the rest of the pipeline; it lives under
# src/ because the web extra also imports it.
sys.path.insert(0, str(Path(__file__).parent / "src"))
from refresh import query  # noqa: E402
from refresh import walking  # noqa: E402

import ingest_osm_walk  # noqa: E402  (root script, like analyze_one_seat above)

DATA = Path("data")
DB = DATA / "refresh.db"
COVERAGE = DATA / "coverage_change.csv"
EQUITY_PLACES = DATA / "equity_places.csv"
CENSUS_BLOCKS = DATA / "census_blocks.csv"
CENSUS_BLOCK_GROUPS = DATA / "census_block_groups.csv"

# The ACS column the equity work counts people in. `population` is the other
# candidate and is wrong: the published figures are weighted by `race_total`,
# and the two differ by about 12,000 people in Allegheny alone -- more than
# half the plan's gain side.
ACS_UNIVERSE = "race_total"
CORRIDOR = DATA / "corridor_change.csv"

SIDES = ["current", "proposed"]

SCHEMA = """
PRAGMA journal_mode = WAL;

-- Build provenance. The app prints feed_version and sample dates in its
-- methods panel, so a served number can always be traced to a feed.
CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);

CREATE TABLE stops (
    side      TEXT NOT NULL,          -- 'current' | 'proposed'
    stop_id   TEXT NOT NULL,
    name      TEXT NOT NULL,
    lat       REAL NOT NULL,
    lon       REAL NOT NULL,
    PRIMARY KEY (side, stop_id)
);

-- One row per (side, stop, route, direction, day), carrying that combination's
-- departure minutes on the 4:00-28:00 axis as a comma-separated list. See the
-- module docstring for why the times are stored rather than counted.
CREATE TABLE departures (
    side      TEXT NOT NULL,
    stop_id   TEXT NOT NULL,
    route     TEXT NOT NULL,
    direction TEXT NOT NULL,
    day       TEXT NOT NULL,          -- weekday | saturday | sunday
    n         INTEGER NOT NULL,       -- len(times), stored so the max-per-
                                      -- cluster pick needs no parsing
    times     TEXT NOT NULL
);
CREATE INDEX ix_dep_stop ON departures(side, stop_id, day);
CREATE INDEX ix_dep_route ON departures(side, route, day);

-- Spatial index over both sides at once; `side` is recovered by joining stops.
-- rowid is an alias into stop_key so a hit maps back to (side, stop_id).
CREATE VIRTUAL TABLE stops_rtree USING rtree(id, min_lat, max_lat, min_lon, max_lon);
CREATE TABLE stop_key (
    id      INTEGER PRIMARY KEY,
    side    TEXT NOT NULL,
    stop_id TEXT NOT NULL
);
CREATE INDEX ix_key ON stop_key(side, stop_id);

CREATE TABLE routes (
    side       TEXT NOT NULL,
    route_id   TEXT NOT NULL,
    short_name TEXT,
    long_name  TEXT,
    color      TEXT,
    PRIMARY KEY (side, route_id)
);

CREATE TABLE route_service (
    side      TEXT NOT NULL,
    route_id  TEXT NOT NULL,
    day       TEXT NOT NULL,
    trips     REAL NOT NULL,
    hours     REAL NOT NULL,
    first_min INTEGER,
    last_min  INTEGER,
    PRIMARY KEY (side, route_id, day)
);

-- PRT's own current -> proposed route mapping. Present so the app can say
-- "the 61C became the 61X" WITHOUT ever comparing route N to route N for
-- service volume (convention 1) -- it is a label aid, not an analysis unit.
CREATE TABLE crosswalk (
    current_route  TEXT,
    final_route    TEXT,
    category       TEXT,
    related_routes TEXT,
    route_page     TEXT
);

-- What the equity work published for each named place: how many residents lose
-- every bus, and how many gain one. Allegheny only, and on WEEK-ANY-MINIMUM --
-- any bus on any day -- which is the measure `analyze_equity_places.py` ranks
-- on and the one /findings quotes, not the day type the panel's switch moves.
-- `key` is the label with PRT's " (Allegheny, PA)" suffix stripped and cased
-- down, because the panel looks these up by the same HOOD/MUNI label it prints
-- in its heading and PRT spells the two differently.
CREATE TABLE place_population (
    key             TEXT PRIMARY KEY,
    place           TEXT NOT NULL,
    block_groups    INTEGER NOT NULL,
    residents_lost  REAL NOT NULL,
    residents_gained REAL NOT NULL
);

-- Place labels and boardings, carried over from coverage_change.csv so the app
-- inherits its handling of caveat 10 (stop ids that name different stops in
-- the usage extract and the GTFS) rather than re-deriving it.
CREATE TABLE stop_place (
    stop_id            TEXT PRIMARY KEY,
    muni               TEXT,
    hood               TEXT,
    id_name_mismatch   INTEGER NOT NULL DEFAULT 0,
    weekday_boardings  REAL,
    saturday_boardings REAL,
    sunday_boardings   REAL
);

-- The citywide change layer: what the map paints before anybody clicks.
--
-- Precomputed rather than served live because it is ~5,900 locations x 2 radii
-- x 3 day types of the same measurement /api/place makes at one point, and at
-- ~4 ms each that is 45 seconds -- fine once at build time, not per request.
-- The values are `query.side_at_place`'s, not a cheaper approximation of it,
-- so the dot's colour and the panel a reader opens by clicking it come from
-- one code path. See `query.change_points` for what a point is.
CREATE TABLE change (
    radius     INTEGER NOT NULL,   -- 400 | 150, both built
    point_id   TEXT NOT NULL,      -- 'c:<stop_id>' published, 'p:<stop_id>' new
    day        TEXT NOT NULL,
    lat        REAL NOT NULL,
    lon        REAL NOT NULL,
    published  INTEGER NOT NULL,   -- 1 = one of coverage_change.csv's 5,751
    cur_trips  INTEGER NOT NULL,
    prop_trips INTEGER NOT NULL,
    cur_hourly INTEGER NOT NULL,
    prop_hourly INTEGER NOT NULL,
    bucket     TEXT NOT NULL,
    PRIMARY KEY (radius, day, point_id)
);
CREATE INDEX ix_change_radius ON change(radius);

-- The magnitude surface: the same before-and-after the `change` table holds,
-- measured on a 100 m lattice instead of only where a stop stands today, so
-- the map can be read as a continuous field rather than a scatter of dots.
-- Cells are `analyze_coverage_area.py`'s cells -- see the lattice note in
-- query.py -- which is what lets the served-cell count be checked against the
-- km2 figures docs/answers/ publishes. Cells with no bus either way on any day
-- are not stored.
CREATE TABLE surface (
    radius     INTEGER NOT NULL,   -- 400 | 150, both built
    ix         INTEGER NOT NULL,   -- lattice column
    iy         INTEGER NOT NULL,   -- lattice row
    day        TEXT NOT NULL,
    cur_trips  INTEGER NOT NULL,
    prop_trips INTEGER NOT NULL,
    PRIMARY KEY (radius, day, ix, iy)
);
CREATE INDEX ix_surface_radius ON surface(radius);

-- Who lives on that ground. The same before-and-after coverage test as the
-- two layers above, but measured at the interior point of every populated
-- census block and summed into the surface's own cells, so the map can be
-- read as people rather than as stops or as square kilometres (convention 12).
-- `county` is here because the published equity figures are Allegheny-only
-- while the map paints all three counties PRT stops in; without it the served
-- number could not be checked against the one docs/answers/ prints.
CREATE TABLE cell_population (
    radius  INTEGER NOT NULL,   -- 400 | 150, both built
    day     TEXT NOT NULL,
    ix      INTEGER NOT NULL,   -- the surface's lattice, cell for cell
    iy      INTEGER NOT NULL,
    county  TEXT NOT NULL,
    lost    REAL NOT NULL,      -- a bus today, none proposed
    gained  REAL NOT NULL,
    kept    REAL NOT NULL,
    neither REAL NOT NULL,      -- no bus either way: the denominator
    PRIMARY KEY (radius, day, ix, iy, county)
);
CREATE INDEX ix_cell_population_radius ON cell_population(radius);

-- The corridor layer: does a bus run on THIS STREET, not what a rider can
-- reach from a point. `analyze_corridor_change.py`'s module docstring is the
-- method; the distinction that must survive here is that this is pavement,
-- not walk access -- a street can lose its only bus while a stop two blocks
-- over shows no change at all in `change` or `surface` above. Never join this
-- to those tables as though they answered the same question.
--
-- Unlike `change` and `surface`, this is NOT precomputed through
-- `query.side_at_place` -- there is no "app's own code path" rationale here.
-- It is a straight carry-over of data/corridor_change.csv, verbatim, the same
-- way `stop_place` below carries over coverage_change.csv.
CREATE TABLE corridor (
    day       TEXT NOT NULL,          -- weekday | saturday | sunday
    klass     TEXT NOT NULL,          -- kept | lost | added
    length_m  REAL NOT NULL,
    geometry  TEXT NOT NULL           -- "lon,lat lon,lat ..." as the CSV wrote it
);
CREATE INDEX ix_corridor_day ON corridor(day);

-- --------------------------------------------------------------------------
-- THE ONE-SEAT LAYER: three tables, and the only ones here that are not bus
-- only.
--
-- Every table above drops rail and the inclines, because they are outside the
-- Refresh and putting unchanged service on both sides of a change figure
-- would dilute it. The one-seat question is not a change figure -- it asks
-- whether a rider can get there without transferring -- and dropping the T
-- from it makes Beechview "lose its one-seat ride Downtown" when the Blue
-- Line still runs. That is control 2 of analyze_one_seat.py. So these carry
-- every mode, and they are separate tables rather than a flag on `stops` so
-- that widening the universe here cannot widen it under a published number.
--
-- No day type and no timetable: a route serves a stop or it does not, which
-- is the published method. See query.py's one-seat section for the five ways
-- this question differs from the rest of the app.

CREATE TABLE reach_stop (
    side    TEXT NOT NULL,
    stop_id TEXT NOT NULL,
    lat     REAL NOT NULL,
    lon     REAL NOT NULL,
    routes  TEXT NOT NULL,          -- ';'-joined route ids, sorted
    PRIMARY KEY (side, stop_id)
);
CREATE VIRTUAL TABLE reach_rtree USING rtree(id, min_lat, max_lat, min_lon, max_lon);
-- The same index, resolved per day type -- the one-seat view's day-restricted
-- variant, and NOT the published answer. `reach_stop.routes` above counts a
-- route calling here on any calendar, which is what data/oneseat_change.csv
-- means by a one-seat ride; these rows count only the routes that call here
-- on that day type, resolved per (stop, route, day) rather than per route, so
-- a weekend pattern that skips this corner is absent here while the route
-- itself still runs elsewhere. A stop with no row for a day has no service
-- that day; see query.reach_stops_within.
CREATE TABLE reach_stop_day (
    side    TEXT NOT NULL,
    stop_id TEXT NOT NULL,
    day     TEXT NOT NULL,
    routes  TEXT NOT NULL,          -- ';'-joined route ids, sorted
    PRIMARY KEY (side, stop_id, day)
);

CREATE TABLE reach_key (
    id      INTEGER PRIMARY KEY,
    side    TEXT NOT NULL,
    stop_id TEXT NOT NULL
);
CREATE INDEX ix_reach_key ON reach_key(side, stop_id);

-- Named destinations, one row per SEED STOP -- a district is a cloud of
-- points, not a centroid. Downtown measured from its middle is a circle over
-- one block of it. Seeds are PRT's own HOOD labels on the current network,
-- put through analyze_one_seat.py's outlier filter (convention 6), and they
-- are taken from the CURRENT network for both sides: a destination defined
-- per network would move under the plan, and a route stopping one block from
-- where the old definition ended would read as a lost one-seat ride.
CREATE TABLE destination (
    dest_key TEXT NOT NULL,
    name     TEXT NOT NULL,
    lat      REAL NOT NULL,
    lon      REAL NOT NULL
);
CREATE INDEX ix_destination ON destination(dest_key);

-- Which routes reach each named destination, per side and radius. Downtown is
-- 44 seeds and Oakland 93, so measuring them live would put ~270 spatial
-- queries in front of every click to re-derive something that cannot change
-- between builds. A pin the reader drops is one point and is measured live.
-- `day` is query.ANY_DAY for the published, day-free answer and a day type for
-- the variant beside it. One table, one sentinel, rather than a nullable
-- column: a caller reading a row cannot then be vague about which it asked.
CREATE TABLE destination_reach (
    dest_key TEXT NOT NULL,
    radius   INTEGER NOT NULL,
    side     TEXT NOT NULL,
    day      TEXT NOT NULL,
    routes   TEXT NOT NULL,
    PRIMARY KEY (dest_key, radius, side, day)
);

-- The routes boardable at each citywide-layer point, per side and radius.
--
-- This is the table that makes an ARBITRARY destination affordable. "Which
-- routes can I board here" does not depend on where the reader is going, so
-- it is measured once per point at build time and every destination picked
-- afterwards is a set intersection over these strings -- a repaint of the
-- whole county in well under a second, against the ~20 s `change` costs.
-- Same point set, radii and published flag as `change`, so the two views show
-- the same dots asking different questions.
CREATE TABLE point_reach (
    radius    INTEGER NOT NULL,
    point_id  TEXT NOT NULL,
    side      TEXT NOT NULL,
    day       TEXT NOT NULL,       -- query.ANY_DAY, or a day type
    lat       REAL NOT NULL,
    lon       REAL NOT NULL,
    published INTEGER NOT NULL,
    routes    TEXT NOT NULL,
    PRIMARY KEY (radius, point_id, side, day)
);
CREATE INDEX ix_point_reach_radius ON point_reach(radius, day);
-- --------------------------------------------------------------------------
-- THE JOURNEY LAYER: the router's own timetable, and the second thing here
-- that is not bus only.
--
-- `departures` above answers how MUCH service runs, and it cannot answer how
-- LONG A TRIP TAKES. It knows when buses leave a stop; it does not know which
-- departures belong to the same vehicle or in what order that vehicle calls,
-- and no amount of aggregation recovers that. So these three tables carry
-- `gtfs.load_patterns` -- the reader the router uses -- rather than
-- `gtfs.load_service`, which every table above is built from.
--
-- Three departures from the conventions those tables follow. Each is
-- deliberate, and each is CLAUDE.md convention 14 in schema form:
--
--   * RAW MINUTES, not the 4:00-28:00 axis. Folding is what puts a 25:30
--     departure in the owl period, and it is exactly wrong along a trip -- a
--     vehicle running through 4am would appear to arrive before it left.
--   * EVERY MODE, like the one-seat tables and unlike every service figure.
--     Separate tables again, and for the same reason: widening the universe
--     here must never widen it under a published service number.
--   * PER-TRIP RUNNING TIMES, never per pattern. Both feeds widen a route's
--     end-to-end time at the PM peak, and that widening is part of what a
--     before-and-after comparison is measuring.
--
-- Stored as patterns rather than trip by trip for the same reason the router
-- patterns: the two feeds' ~27,000 sample-day trips run only ~1,100 distinct
-- (route, stop sequence) combinations, so a trip costs a start minute and its
-- offsets while the stop list is paid for once. That is ~4 MB of offsets for
-- both networks and all three day types.

CREATE TABLE journey_pattern (
    side       TEXT NOT NULL,
    day        TEXT NOT NULL,
    pattern_id INTEGER NOT NULL,
    route_id   TEXT NOT NULL,
    stops      TEXT NOT NULL,      -- ';'-joined stop ids, in calling order
    PRIMARY KEY (side, day, pattern_id)
);

-- Where a pattern's bus actually drives, for drawing only. The router works
-- in stops and minutes and knows nothing about streets, so a drawn itinerary
-- without this joins its stops with straight lines -- through buildings,
-- across rivers, and straight through every turn the bus makes.
--
-- `points` is the path, `stop_idx` gives the vertex each of the pattern's
-- stops sits on, so a leg from one stop to another is a slice. The path is
-- thinned to `gtfs.SHAPE_SIMPLIFY_M` between stops and is LOSSY BY
-- CONSTRUCTION: nothing may be measured off it. Street length is
-- `analyze_corridor_change.py`'s question and is measured on the full shape.
--
-- A pattern whose trips name no shape simply has no row here, and the map
-- falls back to the straight line it drew before.
CREATE TABLE journey_shape (
    side       TEXT NOT NULL,
    day        TEXT NOT NULL,
    pattern_id INTEGER NOT NULL,
    points     TEXT NOT NULL,      -- "lon,lat lon,lat ..." as `corridor` does
    stop_idx   TEXT NOT NULL,      -- ','-joined index into points, one per stop
    PRIMARY KEY (side, day, pattern_id)
);

CREATE TABLE journey_trip (
    side       TEXT NOT NULL,
    day        TEXT NOT NULL,
    pattern_id INTEGER NOT NULL,
    start_min  INTEGER NOT NULL,   -- raw GTFS minutes; over 1440 past midnight
    offsets    TEXT NOT NULL       -- ','-joined minutes from start, one per stop
);
CREATE INDEX ix_journey_trip ON journey_trip(side, day, pattern_id);

-- Every stop the feed places, not only those a pattern calls at. The router
-- builds its transfer graph and both of its walks -- out from the origin, in
-- to the destination -- over exactly this set, so storing a narrower one would
-- hand the app a different graph from the one the published travel times were
-- measured on.
CREATE TABLE journey_stop (
    side    TEXT NOT NULL,
    stop_id TEXT NOT NULL,
    lat     REAL NOT NULL,
    lon     REAL NOT NULL,
    PRIMARY KEY (side, stop_id)
);

-- The pedestrian graph the router measures every walk on -- to a stop, between
-- stops on a transfer, and from the last stop to the door. One side, shared
-- by both networks: a street does not move between the current and proposed
-- plans, only the buses on it do.
--
-- Packed arrays under `name`, not rows: `refresh.walking.WalkNetwork.to_blobs`
-- keys ("lat", "lon", "osm_ids", "offsets", "targets", "lengths") become the
-- rows here, one column each. It is ~1.0M nodes and ~2.2M directed edges, and
-- nothing ever reads it a row at a time -- the app loads all six blobs at
-- once and rebuilds the graph in memory, the same shape `ingest_osm_walk.py`
-- fetched it in. An app built without this table falls back to straight-line
-- walks and would silently disagree with the published travel times, which
-- is why `build_webdb.py` refuses to write one.
CREATE TABLE walk_network (
    name TEXT PRIMARY KEY,
    data BLOB NOT NULL
);
"""


def stop_names(feed):
    """{stop_id: name} straight from a feed's stops.txt."""
    out = {}
    for s in feed.rows("stops.txt"):
        out[s["stop_id"]] = (s.get("stop_name") or "").strip()
    return out


def load_places():
    """{stop_id: place row} from coverage_change.csv, if it has been built."""
    if not COVERAGE.exists():
        print(f"  ! {COVERAGE} missing -- place labels and boardings will be "
              "blank. Run analyze_coverage_change.py to populate them.")
        return {}

    def num(v):
        try:
            return float(v)
        except (TypeError, ValueError):
            return None

    out = {}
    for r in csv.DictReader(open(COVERAGE, encoding="utf-8")):
        out[r["stop_id"]] = (
            r.get("muni") or "", r.get("hood") or "",
            int(r.get("id_name_mismatch") or 0),
            num(r.get("weekday_boardings")), num(r.get("saturday_boardings")),
            num(r.get("sunday_boardings")))
    return out


def load_corridor():
    """[(day, klass, length_m, geometry), ...] from corridor_change.csv.

    Unlike `load_places`, a missing file is fatal -- the corridor table has no
    meaningful empty state to fall back to the way place labels do, and a
    silently empty layer would render as "the plan touches no streets", which
    is not a caveat, it's a wrong answer.
    """
    if not CORRIDOR.exists():
        sys.exit(f"error: {CORRIDOR} missing -- run "
                  "`python3 analyze_corridor_change.py` first")
    return [(r["day"], r["klass"], float(r["length_m"]), r["geometry"])
            for r in csv.DictReader(open(CORRIDOR, encoding="utf-8"))]


def load_crosswalk():
    path = DATA / "route_crosswalk.csv"
    if not path.exists():
        return []
    return [(r.get("current_route"), r.get("final_route"), r.get("category"),
             r.get("related_routes"), r.get("route_page"))
            for r in csv.DictReader(open(path, encoding="utf-8"))]


def build(out_path):
    out_path = Path(out_path)
    if out_path.exists():
        out_path.unlink()
    for suffix in ("-wal", "-shm"):
        stale = out_path.with_name(out_path.name + suffix)
        if stale.exists():
            stale.unlink()

    con = sqlite3.connect(out_path)
    con.executescript(SCHEMA)

    places = load_places()
    con.executemany(
        "INSERT INTO stop_place (stop_id, muni, hood, id_name_mismatch, "
        "weekday_boardings, saturday_boardings, sunday_boardings) "
        "VALUES (?,?,?,?,?,?,?)",
        [(sid, *row) for sid, row in places.items()])

    equity = load_place_population()
    con.executemany("INSERT INTO place_population VALUES (?,?,?,?,?)", equity)
    print(f"  place population: {len(equity)} places that changed")

    cw = load_crosswalk()
    con.executemany("INSERT INTO crosswalk VALUES (?,?,?,?,?)", cw)
    print(f"  place labels: {len(places):,} stops   crosswalk: {len(cw)} rows")

    corridor = load_corridor()
    con.executemany("INSERT INTO corridor VALUES (?,?,?,?)", corridor)
    print(f"  corridor runs: {len(corridor):,} rows")

    key_id = 0
    reach_id = 0
    reach_coords = {}
    for side in SIDES:
        feed = gtfs.current() if side == "current" else gtfs.proposed()
        print(f"\n{side}:")
        svc = gtfs.load_service(feed, SAMPLE[side], period_of=period_of,
                                to_axis=to_axis)
        names = stop_names(feed)

        con.execute("INSERT INTO meta VALUES (?,?)",
                    (f"{side}_feed_version", svc.version))
        for day in DAYS:
            con.execute("INSERT INTO meta VALUES (?,?)",
                        (f"{side}_sample_{day}", str(SAMPLE[side][day])))
            con.execute("INSERT INTO meta VALUES (?,?)",
                        (f"{side}_trips_{day}", str(svc.n_trips[day])))

        # --- stops, only those the feed actually serves ---------------------
        served = svc.served()
        stop_rows, key_rows, rtree_rows = [], [], []
        for sid in sorted(served):
            ll = svc.coords.get(sid)
            if not ll:
                continue          # a stop_times reference to a stop with no
                                  # coordinates cannot be placed, so it cannot
                                  # take part in a radius query
            lat, lon = ll
            stop_rows.append((side, sid, names.get(sid, ""), lat, lon))
            key_id += 1
            key_rows.append((key_id, side, sid))
            rtree_rows.append((key_id, lat, lat, lon, lon))
        con.executemany("INSERT INTO stops VALUES (?,?,?,?,?)", stop_rows)
        con.executemany("INSERT INTO stop_key VALUES (?,?,?)", key_rows)
        con.executemany("INSERT INTO stops_rtree VALUES (?,?,?,?,?)", rtree_rows)

        # --- departures -----------------------------------------------------
        placed = {r[1] for r in stop_rows}
        dep_rows = []
        for day in DAYS:
            for sid, per_rd in svc.times[day].items():
                if sid not in placed:
                    continue
                for (route, direction), ts in per_rd.items():
                    ts = sorted(ts)
                    dep_rows.append((side, sid, route, str(direction), day,
                                     len(ts), ",".join(str(t) for t in ts)))
        con.executemany(
            "INSERT INTO departures VALUES (?,?,?,?,?,?,?)", dep_rows)

        # --- routes ---------------------------------------------------------
        rt_rows = []
        for r in feed.rows("routes.txt"):
            if r.get("route_type") != "3":
                continue          # bus only, both sides: rail and the inclines
                                  # are outside the Refresh
            rt_rows.append((side, r["route_id"],
                            (r.get("route_short_name") or "").strip(),
                            (r.get("route_long_name") or "").strip(),
                            (r.get("route_color") or "").strip()))
        con.executemany("INSERT INTO routes VALUES (?,?,?,?,?)", rt_rows)

        svc_rows = []
        for day in DAYS:
            for route, per in svc.route_periods[day].items():
                span = svc.route_spans[day].get(route, (None, None))
                svc_rows.append((side, route, day, sum(per.values()),
                                 svc.route_hours[day].get(route, 0.0),
                                 span[0], span[1]))
        con.executemany(
            "INSERT INTO route_service VALUES (?,?,?,?,?,?,?)", svc_rows)

        # --- the one-seat reach index, ALL MODES ----------------------------
        # Deliberately not `svc.served()` above: that is the bus-only universe
        # every service figure is measured over, and the one-seat question
        # needs the T. See the schema comment on `reach_stop`.
        sr, coords = gtfs.stop_routes(feed, bus_only=False)
        reach_rows, key_rows, rtree_rows = [], [], []
        for sid, rts in sorted(sr.items()):
            if sid not in coords or not rts:
                continue
            lat, lon = coords[sid]
            reach_rows.append((side, sid, lat, lon, ";".join(sorted(rts))))
            reach_id += 1
            key_rows.append((reach_id, side, sid))
            rtree_rows.append((reach_id, lat, lat, lon, lon))
        con.executemany("INSERT INTO reach_stop VALUES (?,?,?,?,?)", reach_rows)
        con.executemany("INSERT INTO reach_key VALUES (?,?,?)", key_rows)
        con.executemany("INSERT INTO reach_rtree VALUES (?,?,?,?,?)", rtree_rows)

        # The same index resolved per day type, for the day-restricted
        # variant. A second read of the feed rather than a filter over the
        # rows above: `stop_routes` deliberately ignores calendars, so the day
        # answer cannot be recovered from it.
        placed = {sid for _side, sid, _lat, _lon, _rts in reach_rows}
        by_day, _ = gtfs.stop_routes_by_day(feed, gtfs.SAMPLE[side],
                                            bus_only=False)
        day_rows = [(side, sid, day, ";".join(sorted(rts)))
                    for day in DAYS
                    for sid, rts in sorted(by_day[day].items())
                    if sid in placed and rts]
        con.executemany("INSERT INTO reach_stop_day VALUES (?,?,?,?)", day_rows)
        if side == "current":
            reach_coords = coords

        patterns, trips, placed_all_modes, drawn = journey_layer(con, side, feed)

        print(f"    -> {len(stop_rows):,} stops, {len(dep_rows):,} departure "
              f"rows, {len(rt_rows)} bus routes, "
              f"{len(reach_rows):,} all-mode stops for one-seat "
              f"({len(day_rows):,} stop-days)")
        print(f"       journey layer: {patterns} patterns, {trips:,} trips, "
              f"{placed_all_modes:,} placed stops, {drawn} drawn on streets")

    # --- the pedestrian network, shared by both sides ------------------------
    # Fatal, like the corridor layer above and for the same reason: a database
    # built without it would silently serve straight-line walks that disagree
    # with the published travel times, rather than refusing to build.
    if not ingest_osm_walk.EXTRACT.exists():
        sys.exit(f"error: {ingest_osm_walk.EXTRACT} missing -- run "
                  "`python3 ingest_osm_walk.py` first")
    network = walking.load(ingest_osm_walk.EXTRACT)
    con.executemany("INSERT INTO walk_network VALUES (?,?)",
                     network.to_blobs().items())
    nodes, segments, metres = network.summary()
    print(f"\nwalk network: {nodes:,} nodes, {segments:,} segments, "
          f"{metres / 1000:,.0f} km")

    dest = load_destinations(reach_coords)
    con.executemany("INSERT INTO destination VALUES (?,?,?,?)", dest)
    seeded = Counter(d[0] for d in dest)
    print("\ndestinations: "
          + ", ".join(f"{k} ({n} seed stops)" for k, n in sorted(seeded.items())))

    con.execute("INSERT INTO meta VALUES ('periods', ?)",
                (",".join(f"{k}:{a}:{b}" for k, a, b in PERIODS),))
    con.commit()
    con.execute("ANALYZE")
    con.commit()
    con.close()

    change_layer(out_path)
    surface_layer(out_path)
    population_layer(out_path)
    oneseat_layer(out_path)

    mb = out_path.stat().st_size / 1e6
    print(f"\nwrote {out_path}  ({mb:.1f} MB)")


def journey_layer(con, side, feed):
    """Fill `journey_pattern`, `journey_trip`, `journey_stop` and
    `journey_shape` for one feed.

    A second read of the same feed, on purpose. `gtfs.load_service` above and
    `gtfs.load_patterns` here disagree about the time axis and about rail, both
    deliberately (see the schema comment), so one loader cannot serve both --
    and a caller that took the wrong one would get a plausible answer to the
    other question. Sharing the calendar resolution is what keeps them honest:
    a journey can only be routed onto service the analyses would also count.

    Unlike the three precomputed layers below, nothing is measured here. The
    rows are the loader's own tuples written down, so that the app can build a
    `journey.Timetable` without opening a GTFS feed -- plus the path each
    pattern drives, which the router never looks at and only the map draws.
    """
    by_day, coords, shapes = gtfs.load_patterns(
        feed, SAMPLE[side], quiet=True, with_shapes=True)

    pattern_rows, trip_rows, shape_rows = [], [], []
    for day in DAYS:
        for route, stops, trips in by_day[day]:
            pattern_id = len(pattern_rows) + 1
            pattern_rows.append((side, day, pattern_id, route, ";".join(stops)))
            trip_rows.extend(
                (side, day, pattern_id, start, ",".join(str(o) for o in offsets))
                for start, offsets in trips)
            drawn = shapes.get((route, stops))
            if drawn is not None:
                points, stop_idx = drawn
                shape_rows.append((
                    side, day, pattern_id,
                    " ".join(f"{lon:.5f},{lat:.5f}" for lat, lon in points),
                    ",".join(str(i) for i in stop_idx)))

    con.executemany("INSERT INTO journey_pattern VALUES (?,?,?,?,?)", pattern_rows)
    con.executemany("INSERT INTO journey_trip VALUES (?,?,?,?,?)", trip_rows)
    con.executemany("INSERT INTO journey_shape VALUES (?,?,?,?,?)", shape_rows)
    con.executemany("INSERT INTO journey_stop VALUES (?,?,?,?)",
                    [(side, sid, lat, lon)
                     for sid, (lat, lon) in sorted(coords.items())])
    return len(pattern_rows), len(trip_rows), len(coords), len(shape_rows)


def change_layer(out_path):
    """Fill the `change` table -- the citywide layer, precomputed.

    ON THE FRESH CONNECTION, WHICH IS NOT TIDINESS. This must not reuse the
    connection that built the database. SQLite fixes a virtual table's index
    strategy from the schema as that connection last read it, and the
    connection above read the schema when `stops_rtree` was empty -- so it
    plans every radius query as

        SCAN r VIRTUAL TABLE INDEX 1:            (no bounding box; ~11,700 rows)

    walking the whole r-tree once per lookup, instead of

        SCAN r VIRTUAL TABLE INDEX 2:D0B1D2B3    (the bounding box, as intended)

    Same file, same statistics, same everything except which connection asks:
    13.9 ms per location against 1.8, and a 7m24s build against 26 seconds.
    `EXPLAIN QUERY PLAN` on the two connections is how to see it. The timing
    alone looks like an I/O problem and is not one -- neither checkpointing the
    WAL nor a page cache larger than the whole database moves it at all.
    """
    read = query.connect(out_path)          # read-only, opened after the build
    write = sqlite3.connect(out_path)
    for radius in query.RADII:
        rows = query.compute_change(read, radius)
        write.executemany(
            "INSERT INTO change VALUES (?,?,?,?,?,?,?,?,?,?,?)", rows)
        tally = Counter(r[10] for r in rows if r[2] == "weekday" and r[5])
        print(f"\nchange layer @ {radius} m: {len(rows):,} rows, "
              f"{len(rows) // len(DAYS):,} locations")
        print("    published weekday buckets: "
              + ", ".join(f"{tally[k]} {k}" for k, _ in query.BUCKETS if tally[k]))
    write.commit()
    write.close()
    read.close()


def surface_layer(out_path):
    """Fill the `surface` table -- the magnitude surface, precomputed.

    Same fresh-connection requirement as `change_layer` above, and it costs far
    more here: this is ~48,500 cells per radius against ~5,900 locations, so
    the r-tree query plan is the difference between a minute and twenty.
    """
    read = query.connect(out_path)
    write = sqlite3.connect(out_path)
    for radius in query.RADII:
        rows = query.compute_surface(read, radius)
        write.executemany("INSERT INTO surface VALUES (?,?,?,?,?,?)", rows)
        cells = len(rows) // len(DAYS)
        served = sum(1 for r in rows
                     if r[3] == "weekday" and (r[4] > 0 or r[5] > 0))
        print(f"\nsurface @ {radius} m: {cells:,} cells "
              f"({cells * query.CELL_M ** 2 / 1e6:.1f} km2 of lattice), "
              f"{served:,} with weekday service either side")
    write.commit()
    write.close()
    read.close()


def load_place_population():
    """[(key, place, block_groups, lost, gained)] -- the published place table.

    Straight out of `data/equity_places.csv`, rolled up from block groups to
    places exactly as `analyze_equity_places.by_place` does, so the panel
    cannot print a figure the brief and `docs/answers/` do not. Unnamed block
    groups -- those with no labelled stop within `LABEL_RADIUS_M` -- are
    dropped here rather than pooled: the panel looks a place up by name, and
    "" is not a place a reader clicked in.

    Missing file is fatal for the same reason the census files are: the panel
    would silently lose a line rather than the build failing.
    """
    if not EQUITY_PLACES.exists():
        sys.exit(f"error: {EQUITY_PLACES} missing -- run "
                 "`python3 analyze_equity_places.py` first")

    # Rolled up by key rather than by the raw label, because one place can
    # arrive under two spellings: Trafford borough straddles the county line,
    # so some of its block groups take their name from a stop PRT labels
    # "Trafford borough (Westmoreland, PA)" and some from an unsuffixed one.
    # They are one borough, the rows are Allegheny either way, and keying on
    # the label would split the borough in half and then collide on insert.
    rolled: dict[str, list] = {}
    with open(EQUITY_PLACES, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            place = (row["place"] or "").strip()
            if not place:
                continue
            entry = rolled.setdefault(query.place_key(place),
                                      [query.place_display(place), 0, 0.0, 0.0])
            entry[1] += 1
            entry[2] += float(row["residents_lost"] or 0)
            entry[3] += float(row["residents_gained"] or 0)
    return [(key, place, groups, lost, gained)
            for key, (place, groups, lost, gained) in rolled.items()]


def load_residents():
    """[(lat, lon, people, county)] -- every populated census block, ACS-weighted.

    Two files, and each answers half of "how many people live here". The 2020
    block file says WHERE inside a block group people are, at the block's
    interior point; the ACS block-group file says HOW MANY there are, which is
    the universe `analyze_equity_change.py` reports in. A block therefore
    carries its own share of its group's ACS population, and summing the
    blocks reproduces the published county total rather than the 2020 count,
    which differs by about 1%.

    Missing census files are fatal here for the same reason the corridor and
    walk-network files are: a database that built without them would serve a
    map whose People reading is silently absent, and the failure would surface
    as a blank number rather than as a build error.
    """
    for path in (CENSUS_BLOCKS, CENSUS_BLOCK_GROUPS):
        if not path.exists():
            sys.exit(f"error: {path} missing -- run `python3 ingest_census.py` "
                     "first")

    with open(CENSUS_BLOCK_GROUPS, encoding="utf-8") as f:
        groups = {r["geoid"]: (float(r[ACS_UNIVERSE] or 0), r["county"])
                  for r in csv.DictReader(f)}

    with open(CENSUS_BLOCKS, encoding="utf-8") as f:
        blocks = [(r["block_group_geoid"], int(r["population"]),
                   float(r["lat"]), float(r["lon"]))
                  for r in csv.DictReader(f) if int(r["population"]) > 0]

    lived_in = Counter()
    for geoid, people, _lat, _lon in blocks:
        lived_in[geoid] += people

    out = []
    for geoid, people, lat, lon in blocks:
        acs, county = groups.get(geoid, (0.0, ""))
        if not acs or not county:
            continue      # a block group the ACS has no estimate for cannot
                          # be weighted, and counting it raw would mix the two
                          # universes inside one total
        out.append((lat, lon, people / lived_in[geoid] * acs, county))
    return out


def population_layer(out_path):
    """Fill `cell_population` -- the map's people, measured at their own doors.

    Fast, unlike the two layers above, and for a reason worth writing down:
    coverage is a yes/no question, so this needs one r-tree query per block per
    radius and none of the departure arithmetic a trips count needs. 33,131
    blocks cost seconds where the surface's 48,500 cells cost minutes.
    """
    read = query.connect(out_path)
    write = sqlite3.connect(out_path)
    residents = load_residents()
    for radius in query.RADII:
        rows = query.compute_cell_population(read, residents, radius)
        write.executemany(
            "INSERT INTO cell_population VALUES (?,?,?,?,?,?,?,?,?)", rows)
        cells = len({(r[2], r[3]) for r in rows})
        weekday = [r for r in rows if r[1] == "weekday"]
        lost = sum(r[5] for r in weekday if r[4] == "Allegheny")
        gained = sum(r[6] for r in weekday if r[4] == "Allegheny")
        print(f"\npeople @ {radius} m: {cells:,} inhabited cells, "
              f"{sum(r[5] + r[6] + r[7] + r[8] for r in weekday):,.0f} residents; "
              f"Allegheny weekday -{lost:,.0f} / +{gained:,.0f} with any bus")
    write.commit()
    write.close()
    read.close()


def load_destinations(coords):
    """[(dest_key, name, lat, lon)] -- one row per seed stop of each anchor.

    Imported wholesale from `analyze_one_seat.py` rather than re-derived: the
    anchor definitions, the HOOD labels they are read from and the outlier
    filter that makes those labels usable are all that script's, so the app's
    Downtown is the Downtown `data/oneseat_change.csv` publishes. PRT labels
    two stops in Braddock "Westwood", 16 km out (convention 6); an unfiltered
    seed cloud would put a piece of Downtown wherever a label went wrong.

    Seeds come from the CURRENT network for both sides. A destination defined
    per network would move under the plan, and a route stopping one block from
    where the old definition ended would read as a lost one-seat ride.
    """
    import analyze_one_seat as one_seat

    label, _boardings = one_seat.load_labels()
    label, dropped = one_seat.drop_outliers(label, coords)
    if dropped:
        print(f"  dropped {len(dropped)} mislabelled stops before seeding "
              "destinations")

    rows = []
    for name, hoods in one_seat.ANCHORS.items():
        for sid, place in label.items():
            if place in hoods and sid in coords:
                rows.append((name.lower(), name, *coords[sid]))
    return rows


def _day_route_index(con):
    """{(side, stop_id, day): frozenset(routes)} -- the whole per-day index.

    ~40,000 rows, held in memory for the length of the build so that the
    per-point work below stays one spatial query rather than four.
    """
    return {(r["side"], r["stop_id"], r["day"]):
            frozenset(r["routes"].split(";")) if r["routes"] else frozenset()
            for r in con.execute(
                "SELECT side, stop_id, day, routes FROM reach_stop_day")}


def oneseat_layer(out_path):
    """Fill `destination_reach` and `point_reach` -- the one-seat layer.

    Same fresh-connection requirement as `change_layer`: this is ~24,000
    spatial queries, and on the build connection the r-tree would be scanned
    whole for every one of them.

    Cheaper than the other two layers by an order of magnitude because there
    is no timetable in it -- a route serves a stop or it does not -- so this
    is spatial work only, no departure parsing.

    Every day type is answered from ONE spatial query per point rather than
    four. The circle a point draws does not depend on the day; only which
    routes those stops carry does. So the stops are found once and the day
    index is applied in memory, which keeps this layer as cheap as it was
    before the variant existed instead of quadrupling the r-tree work.
    """
    read = query.connect(out_path)
    write = sqlite3.connect(out_path)
    day_routes = _day_route_index(read)

    def reach(lat, lon, radius, side):
        """{day: routes} within the radius of one point, one spatial query."""
        found = query.reach_stops_within(read, lat, lon, radius, side)
        out = {d: set() for d in query.ONESEAT_DAYS}
        for sid, _lat, _lon, routes in found:
            out[query.ANY_DAY] |= routes
            for day in DAYS:
                out[day] |= day_routes.get((side, sid, day), frozenset())
        return out

    for radius in query.RADII:
        for d in query.destinations(read):
            seeds = query.destination_seeds(read, d["key"])
            for side in SIDES:
                per = {day: set() for day in query.ONESEAT_DAYS}
                for lat, lon in seeds:
                    for day, rts in reach(lat, lon, radius, side).items():
                        per[day] |= rts
                write.executemany(
                    "INSERT INTO destination_reach VALUES (?,?,?,?,?)",
                    [(d["key"], int(radius), side, day, ";".join(sorted(rts)))
                     for day, rts in per.items()])

        rows = []
        for point_id, lat, lon, published in query.change_points(read, radius):
            for side in SIDES:
                for day, rts in reach(lat, lon, radius, side).items():
                    rows.append((int(radius), point_id, side, day, lat, lon,
                                 published, ";".join(sorted(rts))))
        write.executemany("INSERT INTO point_reach VALUES (?,?,?,?,?,?,?,?)",
                          rows)
        n_days = len(query.ONESEAT_DAYS)
        print(f"\none-seat layer @ {radius} m: "
              f"{len(rows) // (len(SIDES) * n_days):,} locations, "
              f"{len(rows):,} rows over {n_days} day settings")

    write.commit()
    # The verdict counts for the named destinations, as a build-time check:
    # a destination that reaches nothing is a broken seed cloud, and it should
    # not take a browser to notice.
    for d in query.destinations(read):
        for radius in query.RADII:
            for day in query.ONESEAT_DAYS:
                counts = query.oneseat_layer(read, radius, key=d["key"],
                                             day=day)["counts"]
                label = "published" if day == query.ANY_DAY else day
                print(f"    {d['name']} @ {radius} m, {label}: "
                      + ", ".join(f"{v} {k}" for k, v in counts.items() if v))
    write.close()
    read.close()


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    ap.add_argument("--out", default=str(DB), help=f"output path (default {DB})")
    args = ap.parse_args()
    build(args.out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
