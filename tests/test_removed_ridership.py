"""Which removed locations take the most riders with them, ranked by boardings.

The failure this file exists to prevent is a stop-id-level ranking that splits
one corner's riders across two rows -- PRT gives opposite-direction stops at
the same corner different ids, so a naive ranking would double-count a single
loss and understate another. It also guards the place name: convention 6
means a cluster's place must come from the containing boundary, never from
PRT's own mislabelled MUNI field, except where the cluster falls outside every
boundary the county publishes.
"""
import csv
import math
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import analyze_removed_ridership as rr  # noqa: E402
from refresh import geometry  # noqa: E402

DATA = Path(__file__).resolve().parents[1] / "data"
COVERAGE = DATA / "coverage_change.csv"

# ~30 m and ~300 m of latitude at Pittsburgh's latitude, for building synthetic
# rows a known distance apart without pulling in a projection library.
M_PER_DEG_LAT = 111_320.0


def dlat_for(metres):
    return metres / M_PER_DEG_LAT


def row(stop_id, lat, lon, *, weekday=0.0, saturday=0.0, sunday=0.0,
        routes="1", muni="Elsewhere (Allegheny, PA)", removed=True,
        removed_150=None):
    """One synthetic coverage_change.csv row, removed at 400m by default."""
    removed_150 = removed if removed_150 is None else removed_150
    cur, prop = ("1", "0") if removed else ("1", "1")
    cur150, prop150 = ("1", "0") if removed_150 else ("1", "1")
    return {
        "stop_id": stop_id, "stop_name": f"STOP {stop_id}",
        "muni": muni, "lat": str(lat), "lon": str(lon),
        "weekday_boardings": str(weekday), "saturday_boardings": str(saturday),
        "sunday_boardings": str(sunday), "current_routes": routes,
        "cur_week_any_minimum": cur, "prop_week_any_minimum": prop,
        "cur_week_any_minimum_150m": cur150, "prop_week_any_minimum_150m": prop150,
    }


def box(name, lat, lon, half=0.01, kind="borough"):
    return geometry.Place(name=name, kind=kind, polygons=[[[
        [lon - half, lat - half], [lon + half, lat - half],
        [lon + half, lat + half], [lon - half, lat + half],
        [lon - half, lat - half]]]])


@pytest.fixture
def index():
    return geometry.PlaceIndex([box("Ash", 40.40, -80.00)])


def test_two_removed_stops_30m_apart_become_one_cluster_with_summed_boardings():
    d = dlat_for(30)
    rows = [row("1", 40.40, -80.00, weekday=10.0),
            row("2", 40.40 + d, -80.00, weekday=5.0)]
    clusters = rr.clusters_from(rows, radius_m=rr.CLUSTER_RADIUS_M)
    assert len(clusters) == 1
    summary = rr.summarize_cluster(clusters[0], index=None)
    assert summary["weekday_boardings"] == pytest.approx(15.0)
    assert summary["n_stops"] == 2


def test_two_removed_stops_300m_apart_stay_two_clusters():
    d = dlat_for(300)
    rows = [row("1", 40.40, -80.00), row("2", 40.40 + d, -80.00)]
    clusters = rr.clusters_from(rows, radius_m=rr.CLUSTER_RADIUS_M)
    assert len(clusters) == 2


def test_chaining_pulls_a_far_third_stop_into_one_cluster():
    """A-B 140m, B-C 140m, A-C 280m: single linkage chains along the corridor,
    which is wanted -- convention 2, applied to a ranking, so a corridor of
    stops is one loss rather than several."""
    da, db = dlat_for(140), dlat_for(280)
    rows = [row("1", 40.40, -80.00), row("2", 40.40 + da, -80.00),
            row("3", 40.40 + db, -80.00)]
    clusters = rr.clusters_from(rows, radius_m=rr.CLUSTER_RADIUS_M)
    assert len(clusters) == 1
    summary = rr.summarize_cluster(clusters[0], index=None)
    assert summary["n_stops"] == 3
    assert summary["span_m"] == pytest.approx(280, abs=2)


def test_a_stop_that_keeps_service_is_never_pulled_into_a_cluster():
    d = dlat_for(30)
    kept = row("2", 40.40 + d, -80.00, removed=False)
    removed = [row("1", 40.40, -80.00)]
    rows = [r for r in [removed[0], kept] if r["cur_week_any_minimum"] == "1"
            and r["prop_week_any_minimum"] == "0"]
    assert rows == removed
    clusters = rr.clusters_from(rows, radius_m=rr.CLUSTER_RADIUS_M)
    assert len(clusters) == 1
    assert clusters[0][0]["stop_id"] == "1"


def test_place_comes_from_the_containing_boundary_not_the_prt_label(index):
    rows = [row("1", 40.40, -80.00, muni="Nowhere Near (Allegheny, PA)")]
    summary = rr.summarize_cluster(rows, index=index)
    assert summary["place"] == "Ash"
    assert summary["place_source"] == rr.PLACE_SOURCE_BOUNDARY


def test_a_stop_outside_every_boundary_falls_back_to_the_prt_label(index):
    rows = [row("1", 41.90, -77.00, muni="Faraway township")]
    summary = rr.summarize_cluster(rows, index=index)
    assert summary["place"] == "Faraway township"
    assert summary["place_source"] == rr.PLACE_SOURCE_PRT_LABEL


def test_primary_street_is_the_shared_leading_street_for_a_corridor():
    rows = [
        {"stop_name": "HOMEVILLE RD OPP DUQUESNE VILLAGE ENTRANCE #2"},
        {"stop_name": "HOMEVILLE RD AT MAIN ST"},
        {"stop_name": "HOMEVILLE RD + FIFTH AVE"},
    ]
    assert rr.primary_street(rows) == "HOMEVILLE RD"


def test_primary_street_is_empty_when_members_disagree():
    rows = [{"stop_name": "FIRST AVE AT MAIN ST"},
            {"stop_name": "SECOND AVE AT MAIN ST"}]
    assert rr.primary_street(rows) == ""


def test_verified_leading_street_example():
    assert rr.leading_street(
        "HOMEVILLE RD OPP DUQUESNE VILLAGE ENTRANCE #2") == "HOMEVILLE RD"


@pytest.fixture
def coverage_rows():
    if not COVERAGE.exists():
        pytest.skip(f"{COVERAGE} not built -- run analyze_coverage_change.py")
    with open(COVERAGE, encoding="utf-8") as f:
        return list(csv.DictReader(f))


def test_published_counts_at_both_radii(coverage_rows):
    removed_400 = rr.removed_rows(
        coverage_rows, cur_col="cur_week_any_minimum",
        prop_col="prop_week_any_minimum")
    assert len(removed_400) == 593

    removed_150 = rr.removed_rows(
        coverage_rows, cur_col="cur_week_any_minimum_150m",
        prop_col="prop_week_any_minimum_150m")
    assert len(removed_150) == 900

    # Summed from the removed rows directly -- clustering only partitions
    # them, so this is the same total the clustered CSV rows carry, without
    # the rounding drift of re-summing ~286 already-rounded cluster totals.
    total = sum(rr.safe_float(r["weekday_boardings"]) for r in removed_400)
    assert round(total, 1) == pytest.approx(488.0)
