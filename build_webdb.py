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

DATA = Path("data")
DB = DATA / "refresh.db"
COVERAGE = DATA / "coverage_change.csv"

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

    cw = load_crosswalk()
    con.executemany("INSERT INTO crosswalk VALUES (?,?,?,?,?)", cw)
    print(f"  place labels: {len(places):,} stops   crosswalk: {len(cw)} rows")

    key_id = 0
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

        print(f"    -> {len(stop_rows):,} stops, {len(dep_rows):,} departure "
              f"rows, {len(rt_rows)} bus routes")

    con.execute("INSERT INTO meta VALUES ('periods', ?)",
                (",".join(f"{k}:{a}:{b}" for k, a, b in PERIODS),))
    con.commit()
    con.execute("ANALYZE")
    con.commit()
    con.close()

    change_layer(out_path)

    mb = out_path.stat().st_size / 1e6
    print(f"\nwrote {out_path}  ({mb:.1f} MB)")


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


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    ap.add_argument("--out", default=str(DB), help=f"output path (default {DB})")
    args = ap.parse_args()
    build(args.out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
