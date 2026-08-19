"""The magnitude surface must agree with the published area and with the click.

The surface answers the same question as the citywide dots -- what the plan
does to the buses within a walk of here -- but at every point in space rather
than only where a stop happens to stand today. That makes it answerable to two
different published things at once, and both checks live here:

1. ITS EXTENT MUST BE THE PUBLISHED EXTENT. `data/coverage_area.csv` is what
   COVERAGE-CHANGE cites for area. Counting the surface's served cells is the
   same measurement by a different implementation, so if the two drift, one of
   them is wrong and `docs/answers/` is quoting a number the map contradicts.

2. A CELL MUST AGREE WITH THE PANEL IT OPENS. Clicking the surface runs
   `place()` at the clicked point; the cell was painted from a precomputed row.
   If those disagree the reader is shown one answer and told another, which is
   the same failure the change layer's precompute exists to prevent.

WHY THE AREA CHECK CARRIES A TOLERANCE. `analyze_coverage_area.py` measures
distance on one equirectangular scale fixed at the county's centre latitude,
while the app scales longitude by the cosine of each query point's own latitude
-- so a stop 399 m away by one metric can be 401 m away by the other. Over
Allegheny County the two differ by about 0.4% in the longitude metric, which
moves a handful of cells on the boundary of every disc and nothing in the
interior. The app's metric is the one kept, because a cell that disagreed with
the panel behind it would be the worse error.

Measured, that difference is worth at most 0.022% of the area -- 405.15 km2
against a published 405.06 for the proposed network at 400 m. The tolerance
below is an order of magnitude looser than that and nothing else, so it cannot
absorb an aggregation change: dropping a single day type, or summing a cluster
instead of maxing it, moves these figures by whole percent.
"""
import csv
import math
import random

import pytest

from refresh import query

# Fraction by which the surface's area may differ from the published km2
# before the test fails. Observed worst case is 0.022%; this is 10x that, and
# ~50x smaller than the smallest aggregation bug would produce.
AREA_TOLERANCE = 0.002

SAMPLE_CELLS = 60


@pytest.fixture(scope="session")
def area_rows():
    from tests.conftest import ROOT
    path = ROOT / "data" / "coverage_area.csv"
    if not path.exists():
        pytest.skip(f"{path} not built -- run analyze_coverage_area.py")
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))


def _surface(con, radius):
    return con.execute(
        "SELECT ix, iy, day, cur_trips, prop_trips FROM surface "
        "WHERE radius = ?", (int(radius),)).fetchall()


def test_lattice_agrees_with_the_area_analysis():
    """The cell index of a point must be the one the area script would give.

    The surface reuses that script's lattice so the two are talking about the
    same squares; if the origin or the projection drifts, every cell moves and
    the area comparison below silently compares different ground.
    """
    import analyze_coverage_area as area

    random.seed(1729)
    for _ in range(200):
        lat = random.uniform(40.2, 40.7)
        lon = random.uniform(-80.4, -79.6)
        x, y = area.project(lat, lon)
        want = (int(math.floor(x / area.CELL_M)), int(math.floor(y / area.CELL_M)))
        assert query.cell_of(lat, lon) == want


def test_cell_centres_round_trip():
    """cell_of(centre_of(c)) == c, or cells and their centres disagree."""
    for cell in [(0, 0), (-5, 12), (137, -240), (1000, 1000)]:
        lat, lon = query.cell_centre(*cell)
        assert query.cell_of(lat, lon) == cell


@pytest.mark.parametrize("radius", query.RADII)
def test_surface_area_reproduces_the_published_km2(con, area_rows, radius):
    """Served cells x cell area must equal what COVERAGE-CHANGE publishes.

    Checked per side and per day-type tier, not only in total: a bug that
    dropped the proposed side's Sunday service would leave the weekday areas
    right and still be wrong everywhere it mattered.
    """
    rows = _surface(con, radius)
    if not rows:
        pytest.skip(f"surface not built at {radius} m")

    served = {"current": {d: set() for d in query.DAYS},
              "proposed": {d: set() for d in query.DAYS}}
    for r in rows:
        cell = (r["ix"], r["iy"])
        if r["cur_trips"] > 0:
            served["current"][r["day"]].add(cell)
        if r["prop_trips"] > 0:
            served["proposed"][r["day"]].add(cell)

    published = {(r["tier"], int(r["radius_m"])): r for r in area_rows
                 if int(r["cell_m"]) == query.CELL_M}
    cell_km2 = query.CELL_M * query.CELL_M / 1e6

    problems = []
    for tier, days in (("WEEK-ANY-MINIMUM", query.DAYS),
                       ("WEEKDAYS-ANY-MINIMUM", ("weekday",)),
                       ("WEEKENDS-ANY-MINIMUM", ("saturday", "sunday"))):
        want_row = published.get((tier, int(radius)))
        if want_row is None:
            continue
        for side, col in (("current", "current_km2"), ("proposed", "proposed_km2")):
            got = len(set().union(*(served[side][d] for d in days))) * cell_km2
            want = float(want_row[col])
            if abs(got - want) > AREA_TOLERANCE * want:
                problems.append(
                    f"{tier} {side} @{radius}m: published {want} km2, "
                    f"surface {got:.2f} km2 "
                    f"({100 * (got - want) / want:+.2f}%)")
    assert not problems, "\n".join(problems)


def test_a_cell_agrees_with_the_panel_it_opens(con):
    """The stored row and a live query at the cell centre must be identical.

    Sampled: this is the expensive check, and a systematic disagreement shows
    up in any sample at all.
    """
    rows = _surface(con, query.PRIMARY_RADIUS)
    if not rows:
        pytest.skip("surface not built")

    by_cell = {}
    for r in rows:
        by_cell.setdefault((r["ix"], r["iy"]), {})[r["day"]] = (
            r["cur_trips"], r["prop_trips"])

    random.seed(1729)
    mismatches = []
    for cell in random.sample(sorted(by_cell), SAMPLE_CELLS):
        lat, lon = query.cell_centre(*cell)
        live = query.place(con, lat, lon, query.PRIMARY_RADIUS)
        for day, (cur, prop) in by_cell[cell].items():
            got = (live["current"]["days"][day]["trips"],
                   live["proposed"]["days"][day]["trips"])
            if got != (cur, prop):
                mismatches.append(
                    f"cell {cell} {day}: stored {(cur, prop)}, live {got}")
    assert not mismatches, "\n".join(mismatches[:25])


def test_surface_layer_packs_every_cell_once(con):
    """The wire format carries one row per cell, all three days together."""
    layer = query.surface_layer(con, query.PRIMARY_RADIUS)
    if not layer["cells"]:
        pytest.skip("surface not built")

    assert layer["cell_m"] == query.CELL_M
    assert layer["days"] == list(query.DAYS)
    seen = {(c[0], c[1]) for c in layer["cells"]}
    assert len(seen) == len(layer["cells"]), "a cell appears twice"
    assert all(len(c) == 2 + 2 * len(query.DAYS) for c in layer["cells"])


def test_surface_drops_cells_with_no_service_either_way(con):
    """A cell with no bus on either side on any day is absent, not zero-valued.

    At 150 m most of the 400 m cell set has no service at all, and shipping
    those rows would triple the payload to draw nothing.
    """
    layer = query.surface_layer(con, 150)
    if not layer["cells"]:
        pytest.skip("surface not built at 150 m")
    assert all(any(c[2:]) for c in layer["cells"])
