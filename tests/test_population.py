"""The people layer must be the published people, not a second opinion.

`data/equity_change.csv` says 68,989 Allegheny residents lose all bus service
near home on a weekday and 20,223 gain it. (The findings page prints the
week-any row instead -- the same loss, and 20,095 gaining, because a place
that gains only weekend service passes a week-any test and fails a weekday
one. The map answers per day type, so the weekday row is the one it must
match.) The map now
counts the same residents in the same way, over the same 100 m lattice the
surface is drawn on, so the two can drift apart in a way no reader could
detect -- one number on a page, a slightly different one under their cursor.

These pin the join. `test_reproduces_the_published_equity_figure` is the one
that matters; the rest name which part broke when it fails.
"""
import csv

import pytest

from refresh import query

ALLEGHENY = "Allegheny"

# data/equity_change.csv, the `allegheny / all_residents / WEEKDAYS-ANY-MINIMUM
# / 400` row -- what docs/answers/ and /findings quote.
PUBLISHED_WEEKDAY_400 = {"lost": 68989, "gained": 20223}


@pytest.fixture(scope="module")
def rows(con):
    got = list(con.execute(
        "SELECT * FROM cell_population WHERE radius = 400 AND day = 'weekday'"))
    if not got:
        pytest.skip("cell_population is empty -- rebuild with build_webdb.py")
    return got


def test_reproduces_the_published_equity_figure(con, rows):
    """The map's people and the brief's people are the same people."""
    got = con.execute(
        "SELECT round(sum(lost)) lost, round(sum(gained)) gained "
        "FROM cell_population "
        "WHERE radius = 400 AND day = 'weekday' AND county = ?",
        (ALLEGHENY,)).fetchone()
    assert {"lost": int(got["lost"]), "gained": int(got["gained"])} \
        == PUBLISHED_WEEKDAY_400


def test_every_resident_lands_in_exactly_one_class(con):
    """A person is somewhere on both sides, so the four classes are a partition.

    If they stop summing to the same total on every day type, someone is being
    counted twice or dropped -- and the loss figure would move without anything
    about the plan changing.
    """
    totals = {(r["radius"], r["day"]): r["people"] for r in con.execute(
        "SELECT radius, day, sum(lost + gained + kept + neither) people "
        "FROM cell_population GROUP BY radius, day")}
    assert len(totals) == len(query.RADII) * len(query.DAYS)
    first = round(next(iter(totals.values())))
    for key, people in totals.items():
        assert round(people) == first, key


def test_the_weighting_is_the_acs_universe_the_brief_counts(con):
    """The block populations are rescaled to the ACS totals, not used raw.

    2020 block counts say where people live; the ACS `race_total` says how
    many there are. The published figures multiply the two, and using either
    alone moves the county total by ~1%, which is more than the whole gain
    side of some day types.
    """
    served = con.execute(
        "SELECT round(sum(lost + gained + kept + neither)) n "
        "FROM cell_population WHERE radius = 400 AND day = 'weekday' "
        "AND county = ?", (ALLEGHENY,)).fetchone()["n"]
    with open("data/census_block_groups.csv", encoding="utf-8") as f:
        acs = sum(float(r["race_total"]) for r in csv.DictReader(f)
                  if r["county"] == ALLEGHENY)
    # Not equal: a block group with no populated block has ACS residents and
    # nowhere to put them, so it is in the ACS sum and not on the map.
    assert 0 <= acs - served < 0.001 * acs


def test_cells_are_the_surfaces_cells(con):
    """People and ground have to be summed over the same squares.

    Both layers are drawn from the same lattice origin, so a cell id means the
    same square in each. If it did not, the People and Ground readings of one
    viewport would describe different viewports.
    """
    surface = {(r["ix"], r["iy"]) for r in con.execute(
        "SELECT DISTINCT ix, iy FROM surface WHERE radius = 400")}
    pop = {(r["ix"], r["iy"]) for r in con.execute(
        "SELECT DISTINCT ix, iy FROM cell_population WHERE radius = 400")}
    # Not equal in either direction, and both gaps are real: ground nobody
    # lives on is painted, and people beyond every bus are not.
    assert pop & surface
    lat, lon = query.cell_centre(*next(iter(pop & surface)))
    assert 39 < lat < 42 and -81 < lon < -79


def test_layer_packs_every_cell_and_day(con):
    layer = query.population_layer(con, query.PRIMARY_RADIUS)
    n = con.execute("SELECT count(DISTINCT ix || ':' || iy) FROM "
                    "cell_population WHERE radius = ?",
                    (query.PRIMARY_RADIUS,)).fetchone()[0]
    assert len(layer["cells"]) == n
    width = 2 + query.POP_STRIDE * len(query.DAYS)
    assert all(len(c) == width for c in layer["cells"])
    assert len(layer["fields"]) == width
    assert [c["key"] for c in layer["classes"]] == list(query.POP_CLASS_KEYS)


def test_the_served_layer_still_totals_the_published_figure(con):
    """The packing aggregates counties away; it must not lose people doing it.

    This is the number the legend actually sums, so it is the one a reader
    would screenshot beside the findings page.
    """
    layer = query.population_layer(con, query.PRIMARY_RADIUS)
    day = layer["days"].index("weekday")
    lost = sum(c[query.POP_AT(day, "lost")] for c in layer["cells"])
    table = con.execute(
        "SELECT sum(lost) n FROM cell_population "
        "WHERE radius = 400 AND day = 'weekday'").fetchone()["n"]
    # Not exact: the wire rounds each cell to a tenth of a person, and 28,000
    # of those tenths drift a fraction of a person against the table. A whole
    # person is the tolerance because a whole person is the unit the key
    # prints; anything larger would be a class going missing.
    assert abs(lost - table) < 1
