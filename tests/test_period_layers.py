"""A layer asked for one time of day must be the same layer, narrowed.

The dots and the surface can be served for one of PRT's seven periods
(`query.PKEYS`) instead of the whole day. Everything about the reading
stays as it was -- same points, same cells, same buckets, same wire format --
and only the departures counted change: those whose minute falls in the
period. These tests pin that the narrowing is exact (the seven add up to the
day), that it is the panel's own period table drawn citywide (the number under
a dot or a cell is the number the panel prints for that period), and that the
one thing which cannot be narrowed -- observed boardings, which the usage
extract records per day type only -- is absent from a period layer rather
than silently shipped as all-day figures under a rush-hour map.
"""
import random

import pytest
from fastapi.testclient import TestClient

from refresh import query
from refresh.web.app import create_app

SAMPLE_POINTS = 150
SAMPLE_CELLS = 150


@pytest.fixture(scope="module")
def client(db_path):
    return TestClient(create_app(db_path))


# --------------------------------------------------------------------------
# the dots
# --------------------------------------------------------------------------
def test_the_seven_periods_at_a_kerb_add_up_to_its_day(con):
    """Nothing falls between the periods; nothing is counted twice."""
    whole = query.kerb_departures(con)
    parts = {p: query.kerb_departures(con, period=p) for p in query.PKEYS}
    for point_id, by_day in whole.items():
        for day in query.DAYS:
            summed = tuple(
                sum(parts[p][point_id][day][i] for p in query.PKEYS)
                for i in range(2))
            assert summed == by_day[day], f"{point_id} {day}"


def test_asking_for_the_whole_day_is_the_layer_as_it_was(con):
    """`period=ALL_DAY` and no period at all are byte-identical."""
    assert query.change_layer(con, query.PRIMARY_RADIUS) == \
        query.change_layer(con, query.PRIMARY_RADIUS, period=query.ALL_DAY)


def test_a_period_dot_is_the_panels_period_row_for_that_kerb(con):
    """The hover under a rush-hour map and the panel's 6-9am row agree.

    Same rule as `test_the_panel_can_answer_for_the_kerb_the_dot_was_drawn_at`,
    one period at a time: the layer's two numbers are the kerb's own period
    counts, and the colour is `bucket()` on them.
    """
    period = "am_6_9a"
    layer = query.change_layer(con, query.PRIMARY_RADIUS, period=period)
    assert layer["period"] == period
    assert layer["fields"] == query.change_layer(con, query.PRIMARY_RADIUS)["fields"]

    random.seed(1729)
    points = [p for p in layer["points"] if p[query.PUBLISHED_AT]]
    idx = {k: i for i, k in enumerate(query.BUCKET_KEYS)}
    for p in random.sample(points, SAMPLE_POINTS):
        panel = query.kerb_service(con, p[query.LAT_AT], p[query.LON_AT])
        assert panel is not None, p[query.ID_AT]
        for i, day in enumerate(query.DAYS):
            cur, prop = p[query.STOP_CUR_AT(i)], p[query.STOP_PROP_AT(i)]
            want = (round(panel["current"]["days"][day]["periods"][period]),
                    round(panel["proposed"]["days"][day]["periods"][period]))
            assert (cur, prop) == want, f"{p[query.ID_AT]} {day}"
            assert p[query.BUCKET_AT(i)] == idx[query.bucket(cur, prop)]


def test_a_period_layer_carries_no_boardings(con):
    """Boardings have no time of day, so a period layer ships none.

    The usage extract is per stop per day type (`B_W_202505`, `B_S_202505`,
    `B_U_202505`); there is no hour in it. An all-day figure under a 6-9am
    map would read as the riders at risk in the morning rush, which nothing
    observed can say. `None` at every point, never the day's figure.
    """
    layer = query.change_layer(con, query.PRIMARY_RADIUS, period="pm_3_6p")
    for p in layer["points"]:
        for i in range(len(query.DAYS)):
            assert p[query.RIDERS_AT(i)] is None


# --------------------------------------------------------------------------
# the surface
# --------------------------------------------------------------------------
def test_the_seven_periods_in_a_cell_add_up_to_its_day(con):
    cur = " + ".join(f"cur_{p}" for p in query.PKEYS)
    prop = " + ".join(f"prop_{p}" for p in query.PKEYS)
    off = con.execute(
        f"SELECT count(*) FROM surface "
        f"WHERE cur_trips != {cur} OR prop_trips != {prop}").fetchone()[0]
    assert off == 0


def test_a_period_cell_agrees_with_the_panel_it_opens(con):
    """The stored period column and a live query at the cell centre agree."""
    rows = con.execute(
        "SELECT ix, iy, day, " +
        ", ".join(f"cur_{p}, prop_{p}" for p in query.PKEYS) +
        " FROM surface WHERE radius = ?", (query.PRIMARY_RADIUS,)).fetchall()
    if not rows:
        pytest.skip("surface not built")
    by_cell = {}
    for r in rows:
        by_cell.setdefault((r["ix"], r["iy"]), {})[r["day"]] = r

    random.seed(1729)
    mismatches = []
    for cell in random.sample(sorted(by_cell), SAMPLE_CELLS):
        lat, lon = query.cell_centre(*cell)
        live = query.place(con, lat, lon, query.PRIMARY_RADIUS)
        for day, r in by_cell[cell].items():
            for p in query.PKEYS:
                got = (round(live["current"]["days"][day]["periods"][p]),
                       round(live["proposed"]["days"][day]["periods"][p]))
                if got != (r[f"cur_{p}"], r[f"prop_{p}"]):
                    mismatches.append(f"cell {cell} {day} {p}: "
                                      f"stored {(r[f'cur_{p}'], r[f'prop_{p}'])}, "
                                      f"live {got}")
    assert not mismatches, "\n".join(mismatches[:25])


def test_a_period_surface_has_the_days_shape(con):
    whole = query.surface_layer(con, query.PRIMARY_RADIUS)
    part = query.surface_layer(con, query.PRIMARY_RADIUS, period="late_8_11p")
    assert part["period"] == "late_8_11p"
    assert part["fields"] == whole["fields"]
    assert part["origin"] == whole["origin"]
    # Same cells in the same order: a cell with no bus in this period still
    # travels, as zeros, so the client can draw the same lattice.
    assert [c[:2] for c in part["cells"]] == [c[:2] for c in whole["cells"]]
    assert whole == query.surface_layer(con, query.PRIMARY_RADIUS,
                                        period=query.ALL_DAY)


# --------------------------------------------------------------------------
# the endpoints
# --------------------------------------------------------------------------
@pytest.mark.parametrize("name", ["change", "surface"])
def test_a_period_is_served_and_named(client, name):
    r = client.get(f"/api/{name}?radius=400&period=am_6_9a")
    assert r.status_code == 200
    assert r.json()["period"] == "am_6_9a"


@pytest.mark.parametrize("name", ["change", "surface"])
def test_a_period_that_is_not_prts_is_refused(client, name):
    r = client.get(f"/api/{name}?radius=400&period=rush")
    assert r.status_code == 422


def test_the_periods_the_layers_accept_are_the_ones_meta_publishes(client):
    keys = [p["key"] for p in client.get("/api/meta").json()["periods"]]
    assert keys == list(query.PKEYS)
    assert list(query.LAYER_PERIODS) == [query.ALL_DAY, *keys]
