"""The on-demand zones as the web app serves them.

Every other layer in this app measures fixed-route service, and a place whose
bus is withdrawn in favour of an on-demand van reads on all of them as a plain
loss. `analyze_coverage_area.py` already counts the zones -- 23% of the ground
that loses all fixed-route service falls inside one -- but nothing at stop or
cell level draws them, so the map paints that ground solid red. This layer is
the correction, and its whole job is to be *shown beside* the loss rather than
netted off it: a zone with 1-3 vans for 15-48 km2 is a fallback, not a
replacement, and the reader is the one who gets to weigh that.

Nothing here recomputes anything. Geometry comes from the Remix project file
through `analyze_coverage_area.on_demand_zones`, and every km2 figure is
carried over verbatim from `data/coverage_area_ondemand.csv`, so the app cannot
disagree with the published area answer -- the same relationship
`tests/test_corridor_layer.py` pins for the corridor layer.

The query-layer and endpoint tests build their own tiny SQLite file rather than
depending on the full `data/refresh.db`: the zone table joins to nothing.
"""
import csv
import json
import sqlite3
from pathlib import Path

import pytest

from refresh import query

ROOT = Path(__file__).resolve().parent.parent
ZONE_CSV = ROOT / "data" / "coverage_area_ondemand.csv"
AREA_CSV = ROOT / "data" / "coverage_area.csv"

# Just enough schema for `ondemand_layer` and `create_app` to work: `meta` is
# read the moment the app starts (and carries the citywide lost-area
# denominator), `ondemand_zone` is what is under test.
_SCHEMA = """
CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE ondemand_zone (
    name                     TEXT PRIMARY KEY,
    vehicles_weekday         INTEGER,
    weekday_hours            TEXT NOT NULL,
    service_day_patterns     TEXT NOT NULL,
    hidden_in_remix          INTEGER NOT NULL,
    zone_km2                 REAL,
    fixed_route_km2_now      REAL,
    fixed_route_km2_proposed REAL,
    lost_km2_inside          REAL,
    gained_km2_inside        REAL,
    geometry                 TEXT NOT NULL
);
"""

# One square-ish zone and one two-part zone, so the MultiPolygon path is
# exercised as well as the simple one.
_SQUARE = [[[[-80.0, 40.4], [-80.0, 40.5], [-79.9, 40.5], [-79.9, 40.4],
             [-80.0, 40.4]]]]
_TWO_PART = [[[[-80.2, 40.2], [-80.2, 40.3], [-80.1, 40.3], [-80.2, 40.2]]],
             [[[-80.5, 40.6], [-80.5, 40.7], [-80.4, 40.7], [-80.5, 40.6]]]]

_ROWS = [
    ("Testville", 2, "7:00-21:00", "0000001;0000010;1111100", 1,
     20.0, 5.0, 1.0, 4.0, 0.5, json.dumps(_SQUARE)),
    ("Two Parts", 3, "7:00-21:00", "1111100", 1,
     10.0, 2.0, 2.0, 1.0, 0.0, json.dumps(_TWO_PART)),
]

_LOST_KM2_CITYWIDE = "80.14"


@pytest.fixture
def zone_db(tmp_path):
    path = tmp_path / "zone_test.db"
    con = sqlite3.connect(path)
    con.executescript(_SCHEMA)
    con.executemany("INSERT INTO ondemand_zone VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                    _ROWS)
    con.execute("INSERT INTO meta VALUES ('lost_km2_citywide', ?)",
                (_LOST_KM2_CITYWIDE,))
    con.commit()
    con.close()
    return path


# --------------------------------------------------------------------------
# build_webdb's loader
# --------------------------------------------------------------------------

def test_build_webdb_loads_every_zone_the_published_answer_counts():
    """One row per zone in the published CSV -- not a subset, and not a set
    the app assembled for itself out of the Remix file."""
    if not ZONE_CSV.exists():
        pytest.skip(f"{ZONE_CSV} not built -- run analyze_coverage_area.py")
    import build_webdb
    rows, _citywide = build_webdb.load_zones()
    with open(ZONE_CSV, encoding="utf-8") as f:
        want = {r["zone"] for r in csv.DictReader(f)}
    assert {r[0] for r in rows} == want


def test_build_webdb_carries_the_published_km2_figures_verbatim():
    """No rounding, no recomputation: the app's numbers are the CSV's."""
    if not ZONE_CSV.exists():
        pytest.skip(f"{ZONE_CSV} not built -- run analyze_coverage_area.py")
    import build_webdb
    rows, _citywide = build_webdb.load_zones()
    by_name = {r[0]: r for r in rows}
    with open(ZONE_CSV, encoding="utf-8") as f:
        for want in csv.DictReader(f):
            got = by_name[want["zone"]]
            assert got[5] == float(want["zone_km2"])
            assert got[8] == float(want["lost_km2_inside"])
            assert got[1] == int(want["vehicles_weekday"])


def test_build_webdb_gives_every_zone_real_geometry():
    """A zone drawn as an empty polygon is worse than one not drawn at all."""
    if not ZONE_CSV.exists():
        pytest.skip(f"{ZONE_CSV} not built -- run analyze_coverage_area.py")
    import build_webdb
    rows, citywide = build_webdb.load_zones()
    for r in rows:
        coords = json.loads(r[10])
        assert coords and all(ring and len(ring[0]) >= 4
                              for poly in coords for ring in [poly])
    # The denominator the "N% of the lost ground" sentence divides by.
    assert citywide is not None and citywide > 0


# --------------------------------------------------------------------------
# query.ondemand_layer
# --------------------------------------------------------------------------

def test_layer_parses_geometry_into_multipolygon_coordinates(zone_db):
    con = query.connect(zone_db)
    layer = query.ondemand_layer(con)
    z = next(z for z in layer["zones"] if z["name"] == "Two Parts")
    assert z["geometry"] == _TWO_PART


def test_layer_splits_the_service_day_patterns(zone_db):
    """The CSV packs day patterns into one semicolon-joined cell; a client
    should not have to know that."""
    con = query.connect(zone_db)
    layer = query.ondemand_layer(con)
    z = next(z for z in layer["zones"] if z["name"] == "Testville")
    assert z["days"] == ["0000001", "0000010", "1111100"]


def test_layer_reports_the_remix_hidden_flag_as_a_boolean(zone_db):
    """All ten zones are flagged hidden in PRT's project file, which is why
    this layer is 'what the plan file says' rather than a commitment."""
    con = query.connect(zone_db)
    layer = query.ondemand_layer(con)
    assert all(z["hidden_in_remix"] is True for z in layer["zones"])


def test_layer_totals_sum_the_zones(zone_db):
    con = query.connect(zone_db)
    t = query.ondemand_layer(con)["totals"]
    assert t["zones"] == 2
    assert t["vehicles_weekday"] == 5
    assert t["zone_km2"] == 30.0
    assert t["lost_km2_inside"] == 5.0


def test_layer_reports_the_lost_ground_inside_a_zone_as_a_share(zone_db):
    """The one sentence this layer exists to let the map say: of the ground
    that loses all fixed-route service, this much is offered a van instead."""
    con = query.connect(zone_db)
    t = query.ondemand_layer(con)["totals"]
    assert t["lost_km2_citywide"] == float(_LOST_KM2_CITYWIDE)
    assert t["lost_pct_inside"] == pytest.approx(5.0 / 80.14 * 100)


def test_layer_survives_a_database_with_no_citywide_denominator(tmp_path):
    """An older database has no `lost_km2_citywide`; the zones must still
    draw, with the share reported as unknown rather than as zero."""
    path = tmp_path / "no_meta.db"
    con = sqlite3.connect(path)
    con.executescript(_SCHEMA)
    con.executemany("INSERT INTO ondemand_zone VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                    _ROWS)
    con.commit()
    con.close()

    layer = query.ondemand_layer(query.connect(path))
    assert len(layer["zones"]) == 2
    assert layer["totals"]["lost_km2_citywide"] is None
    assert layer["totals"]["lost_pct_inside"] is None


def test_layer_orders_zones_by_name(zone_db):
    """A stable order, so a legend list does not reshuffle between loads."""
    con = query.connect(zone_db)
    names = [z["name"] for z in query.ondemand_layer(con)["zones"]]
    assert names == sorted(names)


# --------------------------------------------------------------------------
# /api/zones
# --------------------------------------------------------------------------

pytest.importorskip("fastapi", reason="web extra not installed")

from fastapi.testclient import TestClient      # noqa: E402

from refresh.web.app import create_app         # noqa: E402


@pytest.fixture
def client(zone_db):
    return TestClient(create_app(zone_db))


def test_endpoint_round_trips_the_layer(client):
    r = client.get("/api/zones")
    assert r.status_code == 200
    body = r.json()
    assert len(body["zones"]) == 2
    assert set(body["totals"]) == {"zones", "vehicles_weekday", "zone_km2",
                                   "lost_km2_inside", "lost_km2_citywide",
                                   "lost_pct_inside"}


def test_endpoint_takes_no_day_or_radius(client):
    """A zone is neither a catchment nor a timetable -- it has one set of
    hours all week -- so neither control means anything here, and passing one
    must not silently change the answer."""
    plain = client.get("/api/zones").json()
    assert client.get("/api/zones", params={"day": "sunday"}).json() == plain
    assert client.get("/api/zones", params={"radius": 150}).json() == plain
