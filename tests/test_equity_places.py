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
from refresh import geometry


def box(place, lat, lon, kind='borough', half=0.01):
    """One square place centred on (lat, lon) -- the boundary-test stand-in for
    what used to be a labelled stop at that point."""
    ring = [[lon - half, lat - half], [lon + half, lat - half],
            [lon + half, lat + half], [lon - half, lat + half],
            [lon - half, lat - half]]
    return geometry.Place(name=place, kind=kind, polygons=[[ring]])


def index(*boxes):
    return geometry.PlaceIndex(list(boxes))




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

def test_a_block_group_takes_the_place_whose_boundary_contains_it():
    """The whole point of the boundary source: containment, not proximity. A
    nearest-stop rule put 302 of the county's 1,062 block groups in a place
    they are not in, because the closest surviving labelled stop was over the
    line -- Regent Square's centre was named Point Breeze, and so on."""
    grid = index(box("Carrick", 40.4400, -79.9900),
                 box("Beechview", 40.4600, -79.9900))
    assert places.place_at(40.4405, -79.9900, grid) == "Carrick"
    assert places.place_at(40.4595, -79.9900, grid) == "Beechview"


def test_a_block_group_inside_no_boundary_stays_unnamed():
    """Municipal boundaries partition the county, so this is now rare rather
    than routine -- but a point in open water at the county edge still has no
    honest answer, and a blank is better than the nearest name."""
    grid = index(box("Somewhere", 41.0, -79.0))
    assert places.place_at(40.44, -79.99, grid) == ""


def test_an_unnamed_block_group_is_still_written_out():
    """Dropping it would quietly shrink the county total the CSV must reconcile to."""
    grid = index(box("Somewhere", 41.0, -79.0))
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
    grid = index(box("Carrick", 40.44, -79.99))
    (row,) = places.locate([block_group(lost_week_any_minimum=0.25)], grid)
    assert row["residents_lost"] == pytest.approx(250.0)
    assert row["zero_vehicle_lost"] == pytest.approx(15.0)   # 60 * 0.25
    assert row["age_65_plus_lost"] == pytest.approx(37.5)


def test_a_block_group_that_both_loses_and_gains_reports_both_sides():
    """Ten Allegheny block groups do exactly this; netting them hides it."""
    grid = index(box("Carrick", 40.44, -79.99))
    (row,) = places.locate([block_group(lost_week_any_minimum=0.3,
                                        gained_week_any_minimum=0.5)], grid)
    assert row["residents_lost"] == pytest.approx(300.0)
    assert row["residents_gained"] == pytest.approx(500.0)


def test_only_allegheny_block_groups_are_located():
    """The headline denominator; Beaver and Westmoreland have no PRT labels."""
    grid = index(box("Carrick", 40.44, -79.99))
    rows = places.locate([block_group(county="Beaver", lost_week_any_minimum=1.0)],
                         grid)
    assert rows == []


# --------------------------------------------------------------------------
# rolling block groups up to a place
# --------------------------------------------------------------------------

def test_places_sum_their_block_groups_and_count_them():
    grid = index(box("Carrick", 40.44, -79.99))
    located = places.locate([block_group("420030001001", lost_week_any_minimum=0.5),
                             block_group("420030001002", lost_week_any_minimum=0.25)],
                            grid)
    (rolled,) = places.by_place(located)
    assert rolled["place"] == "Carrick"
    assert rolled["block_groups"] == 2
    assert rolled["residents_lost"] == pytest.approx(750.0)


def test_a_place_where_nothing_changed_is_not_in_the_rollup():
    """The list exists to name where the plan moved; 880 of 1,062 it did not."""
    grid = index(box("Carrick", 40.44, -79.99))
    located = places.locate([block_group()], grid)
    assert places.by_place(located) == []


def test_the_written_coordinates_keep_their_precision(tmp_path, monkeypatch):
    """One decimal of latitude is about 11 km. Counts round to a tenth of a
    person happily; a position rounded the same way puts a block group in the
    wrong municipality while still looking precise enough to trust."""
    monkeypatch.setattr(places, "OUT_CSV", tmp_path / "places.csv")
    grid = index(box("Wexford", 40.626271, -80.064431))
    places.write(places.locate(
        [block_group(lat=40.626271, lon=-80.064431, gained_week_any_minimum=1.0)],
        grid))

    import csv
    (row,) = list(csv.DictReader(open(tmp_path / "places.csv")))
    assert float(row["lat"]) == pytest.approx(40.626271, abs=1e-5)
    assert float(row["lon"]) == pytest.approx(-80.064431, abs=1e-5)
    # The people columns still round -- a tenth of a person is the useful grain.
    assert row["residents_gained"] == "1000.0"


# --------------------------------------------------------------------------
# the denominator: a place's own population, not its changed part
# --------------------------------------------------------------------------

def test_a_place_total_counts_every_block_group_not_only_the_changed_ones():
    """`population` in equity_places.csv is the changed block groups' 2020
    count, and it is not a denominator: Reserve township publishes 1,430 there
    against 1,629 residents lost, because the loss is ACS-weighted and the
    column is not. A share needs the place's whole ACS population."""
    grid = index(box("Carrick", 40.44, -79.99))
    groups = [block_group("420030001001", lost_week_any_minimum=0.5),
              block_group("420030001002")]
    (total,) = places.place_totals(groups, grid)
    assert total["place"] == "Carrick"
    assert total["block_groups"] == 2
    assert total["residents"] == pytest.approx(2000.0)

    (rolled,) = places.by_place(places.locate(groups, grid))
    assert rolled["block_groups"] == 1
    assert rolled["residents_lost"] == pytest.approx(500.0)


def test_a_place_total_centres_on_where_its_residents_are():
    """The Places view zooms the map to a place, and it zooms to where the
    place's people are rather than to the middle of its polygon: an unweighted
    mean of block-group points would pull a borough towards whichever half was
    cut into more pieces, and a polygon's centroid would point at the empty
    hillside that makes up most of several townships here."""
    grid = index(box("Carrick", 40.44, -79.99))
    (total,) = places.place_totals(
        [block_group("420030001001", lat=40.40, race_total=3000.0),
         block_group("420030001002", lat=40.50, race_total=1000.0)], grid)
    assert total["lat"] == pytest.approx(40.425)


def test_block_groups_with_no_name_are_totalled_too_so_the_county_reconciles():
    """Same reason `locate` writes unnamed rows out: a Places view that lists
    only named places has to be able to say what the residual is."""
    grid = index(box("Carrick", 40.44, -79.99))
    totals = places.place_totals(
        [block_group("420030001001"),
         block_group("420030001002", lat=41.90, lon=-79.10)], grid)
    assert sum(t["residents"] for t in totals) == pytest.approx(2000.0)
    assert [t["place"] for t in totals if not t["place"]] == [""]


def test_a_place_total_ignores_other_counties():
    """The equity work never asked outside Allegheny, so a Beaver County block
    group must not inflate a denominator the loss side cannot match."""
    grid = index(box("Carrick", 40.44, -79.99))
    (total,) = places.place_totals(
        [block_group("420030001001"),
         block_group("420070001001", county="Beaver")], grid)
    assert total["residents"] == pytest.approx(1000.0)
