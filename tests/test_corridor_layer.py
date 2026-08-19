"""The corridor layer as the web app serves it -- pavement, not access.

`tests/test_corridor.py` already pins the geometry algorithm in
`analyze_corridor_change.py` against hand-built fixtures; nothing here
repeats that. This checks the next stage instead: that `build_webdb.py`
carries every row of `data/corridor_change.csv` over verbatim, that
`refresh.query.corridor_layer` parses its geometry and sums its `km` totals
correctly, and that `/api/corridors` validates `day` and round-trips a
payload for all three day types.

The query-layer and endpoint tests build their own tiny SQLite file rather
than depending on the full ~583 KB `data/refresh.db` -- the corridor table
carries no relationship to stops, routes or departures, so a handful of
synthetic rows exercises the same code paths as the real artifact.
"""
import csv
import sqlite3
from pathlib import Path

import pytest

from refresh import query

ROOT = Path(__file__).resolve().parent.parent
CORRIDOR_CSV = ROOT / "data" / "corridor_change.csv"

# Just enough schema for corridor_layer and create_app to work: `meta` is
# read (and may be empty) the moment the app starts, `corridor` is what is
# under test.
_SCHEMA = """
CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE corridor (
    day       TEXT NOT NULL,
    klass     TEXT NOT NULL,
    length_m  REAL NOT NULL,
    geometry  TEXT NOT NULL
);
CREATE INDEX ix_corridor_day ON corridor(day);
"""

_ROWS = [
    ("weekday", "kept", 100.0, "-80.0,40.4 -80.001,40.401"),
    ("weekday", "lost", 50.5, "-80.1,40.5 -80.101,40.501 -80.102,40.502"),
    ("weekday", "added", 25.25, "-80.2,40.6 -80.201,40.601"),
    ("saturday", "kept", 10.0, "-80.0,40.4 -80.001,40.401"),
]


@pytest.fixture
def corridor_db(tmp_path):
    path = tmp_path / "corridor_test.db"
    con = sqlite3.connect(path)
    con.executescript(_SCHEMA)
    con.executemany("INSERT INTO corridor VALUES (?,?,?,?)", _ROWS)
    con.commit()
    con.close()
    return path


# --------------------------------------------------------------------------
# build_webdb's loader
# --------------------------------------------------------------------------

def test_build_webdb_loads_every_row_of_the_csv():
    """The row count going into the table must equal the row count of the CSV
    -- a straight carry-over, not a filtered or deduped subset."""
    if not CORRIDOR_CSV.exists():
        pytest.skip(f"{CORRIDOR_CSV} not built -- run analyze_corridor_change.py")
    import build_webdb
    rows = build_webdb.load_corridor()
    with open(CORRIDOR_CSV, encoding="utf-8") as f:
        want = sum(1 for _ in csv.DictReader(f))
    assert len(rows) == want


# --------------------------------------------------------------------------
# query.corridor_layer
# --------------------------------------------------------------------------

def test_corridor_layer_parses_geometry_into_float_coordinate_pairs(corridor_db):
    con = query.connect(corridor_db)
    layer = query.corridor_layer(con, "weekday")
    kept = next(r for r in layer["runs"] if r["klass"] == "kept")
    assert kept["geometry"] == [[-80.0, 40.4], [-80.001, 40.401]]
    assert all(isinstance(v, float) for pt in kept["geometry"] for v in pt)


def test_corridor_layer_km_totals_match_summing_length_m(corridor_db):
    con = query.connect(corridor_db)
    layer = query.corridor_layer(con, "weekday")

    by_klass = {}
    for day, klass, length_m, _geom in _ROWS:
        if day == "weekday":
            by_klass[klass] = by_klass.get(klass, 0.0) + length_m

    for klass, total_m in by_klass.items():
        assert layer["km"][klass] == round(total_m / 1000, 1)


def test_corridor_layer_only_returns_the_requested_day(corridor_db):
    con = query.connect(corridor_db)
    layer = query.corridor_layer(con, "saturday")
    assert layer["day"] == "saturday"
    assert len(layer["runs"]) == 1
    assert layer["runs"][0]["klass"] == "kept"
    # No weekday-only class leaks into a day with none of it.
    assert layer["km"]["lost"] == 0.0
    assert layer["km"]["added"] == 0.0


# --------------------------------------------------------------------------
# /api/corridors
# --------------------------------------------------------------------------

pytest.importorskip("fastapi", reason="web extra not installed")

from fastapi.testclient import TestClient      # noqa: E402

from refresh.web.app import create_app         # noqa: E402


@pytest.fixture
def client(corridor_db):
    return TestClient(create_app(corridor_db))


def test_endpoint_rejects_an_unknown_day(client):
    r = client.get("/api/corridors", params={"day": "tuesday"})
    assert r.status_code == 422


@pytest.mark.parametrize("day", query.DAYS)
def test_endpoint_round_trips_for_every_day_type(client, day):
    r = client.get("/api/corridors", params={"day": day})
    assert r.status_code == 200
    body = r.json()
    assert body["day"] == day
    assert set(body["km"]) == {"kept", "lost", "added"}
    assert all(set(run) == {"klass", "length_m", "geometry"}
              for run in body["runs"])


def test_endpoint_defaults_to_weekday(client):
    r = client.get("/api/corridors")
    assert r.json()["day"] == "weekday"
