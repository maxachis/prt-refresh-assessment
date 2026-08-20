"""Unit tests for locating the coverage losses.

The county-wide equity answer is a set of totals, and a total cannot be
testified about: "2,376 car-free households lose all bus service" names nobody.
This analysis puts those households on named ground. The failure modes it has
to avoid are the ones that would put them on the *wrong* ground -- a block
group inheriting a place label from four miles away, a place-level total that
double-counts or silently drops a block group, or a share of a block group's
population being read as all of it.
"""
import pytest

import analyze_equity_places as places


def block_group(geoid="420030001001", **kw):
    row = {"geoid": geoid, "county": "Allegheny", "lat": 40.44, "lon": -79.99,
           "population": 1000.0, "race_total": 1000.0, "black_nh": 200.0,
           "age_total": 1000.0, "age_65_plus": 150.0, "under_18": 220.0,
           "income_total": 400.0, "income_under_25k": 80.0,
           "vehicle_total": 400.0, "zero_vehicle_households": 60.0,
           "disability_total": 1000.0, "with_a_disability": 140.0,
           "language_total": 400.0, "limited_english_households": 10.0,
           "lost_week_any_minimum": 0.0, "gained_week_any_minimum": 0.0}
    row.update(kw)
    return {k: str(v) for k, v in row.items()}


# --------------------------------------------------------------------------
# putting a block group on named ground
# --------------------------------------------------------------------------

def test_a_block_group_takes_the_label_of_the_nearest_labelled_stop():
    grid = places.label_grid([(40.4400, -79.9900, "Carrick"),
                              (40.4600, -79.9900, "Beechview")])
    label, distance = places.label_for(40.4410, -79.9900, grid)
    assert label == "Carrick"
    assert distance == pytest.approx(111, abs=15)


def test_a_block_group_with_no_stop_within_reach_stays_unnamed():
    """Better an honest blank than a neighbourhood four miles away."""
    grid = places.label_grid([(41.0, -79.0, "Somewhere")])
    assert places.label_for(40.44, -79.99, grid) == (None, None)


def test_an_unnamed_block_group_is_still_written_out():
    """Dropping it would quietly shrink the county total the CSV must reconcile to."""
    grid = places.label_grid([(41.0, -79.0, "Somewhere")])
    (row,) = places.locate([block_group(lost_week_any_minimum=1.0)], grid)
    assert row["place"] == ""
    assert row["residents_lost"] == pytest.approx(1000.0)


def test_the_municipality_suffix_is_dropped_but_the_type_word_is_kept():
    """"Ross" and "Ross township" are different places; only the state falls away."""
    assert places.tidy("Ross township (Allegheny, PA)") == "Ross township"
    assert places.tidy("Carrick") == "Carrick"
    assert places.tidy("") == ""


# --------------------------------------------------------------------------
# how many people, of which kind, on which side
# --------------------------------------------------------------------------

def test_a_partial_loss_takes_a_share_of_each_group_not_all_of_it():
    """Coverage is a fraction of a block group's blocks, never a flag."""
    grid = places.label_grid([(40.44, -79.99, "Carrick")])
    (row,) = places.locate([block_group(lost_week_any_minimum=0.25)], grid)
    assert row["residents_lost"] == pytest.approx(250.0)
    assert row["zero_vehicle_lost"] == pytest.approx(15.0)   # 60 * 0.25
    assert row["age_65_plus_lost"] == pytest.approx(37.5)


def test_a_block_group_that_both_loses_and_gains_reports_both_sides():
    """Ten Allegheny block groups do exactly this; netting them hides it."""
    grid = places.label_grid([(40.44, -79.99, "Carrick")])
    (row,) = places.locate([block_group(lost_week_any_minimum=0.3,
                                        gained_week_any_minimum=0.5)], grid)
    assert row["residents_lost"] == pytest.approx(300.0)
    assert row["residents_gained"] == pytest.approx(500.0)


def test_only_allegheny_block_groups_are_located():
    """The headline denominator; Beaver and Westmoreland have no PRT labels."""
    grid = places.label_grid([(40.44, -79.99, "Carrick")])
    rows = places.locate([block_group(county="Beaver", lost_week_any_minimum=1.0)],
                         grid)
    assert rows == []


# --------------------------------------------------------------------------
# rolling block groups up to a place
# --------------------------------------------------------------------------

def test_places_sum_their_block_groups_and_count_them():
    grid = places.label_grid([(40.44, -79.99, "Carrick")])
    located = places.locate([block_group("420030001001", lost_week_any_minimum=0.5),
                             block_group("420030001002", lost_week_any_minimum=0.25)],
                            grid)
    (rolled,) = places.by_place(located)
    assert rolled["place"] == "Carrick"
    assert rolled["block_groups"] == 2
    assert rolled["residents_lost"] == pytest.approx(750.0)


def test_a_place_where_nothing_changed_is_not_in_the_rollup():
    """The list exists to name where the plan moved; 880 of 1,062 it did not."""
    grid = places.label_grid([(40.44, -79.99, "Carrick")])
    located = places.locate([block_group()], grid)
    assert places.by_place(located) == []
