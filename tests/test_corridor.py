"""Unit tests for the corridor-change geometry pipeline (analyze_corridor_change.py).

These exercise the algorithm on hand-built tiny fixtures -- a handful of
lat/lon points describing toy streets -- never the real ~500k-point feeds, so
the suite stays fast and each test isolates one step of the method described
in the module docstring: resample -> canonical key -> tolerant match ->
classify -> smooth -> split into runs -> dedupe -> drop slivers -> simplify.
"""
import math

import analyze_corridor_change as cc

# A small, easy-to-reason-about metre offset near the module's projection
# origin, so tests can build lat/lon fixtures without hand-computing exact
# geodesic coordinates.
M_PER_DEG_LAT = cc.M_PER_DEG_LAT
M_PER_DEG_LON = cc.M_PER_DEG_LON


def offset(lat0, lon0, east_m, north_m):
    """A lat/lon point east_m/north_m metres from (lat0, lon0)."""
    return (lat0 + north_m / M_PER_DEG_LAT, lon0 + east_m / M_PER_DEG_LON)


ORIGIN = (cc.LAT0, cc.LON0)


# --------------------------------------------------------------------------
# resampling
# --------------------------------------------------------------------------

def test_resample_straight_line_lands_at_requested_spacing():
    a = offset(*ORIGIN, 0, 0)
    b = offset(*ORIGIN, 0, 100)  # due north, 100 m
    samples = cc.build_path([a, b], step_m=20)

    assert len(samples) == 6  # 0, 20, 40, 60, 80, 100
    for i in range(len(samples) - 1):
        d = math.hypot(samples[i + 1].x - samples[i].x,
                       samples[i + 1].y - samples[i].y)
        assert d == pytest_approx(20)
    # last sample is the true endpoint, not an overshoot
    assert samples[-1].x == pytest_approx(b_xy(b)[0])
    assert samples[-1].y == pytest_approx(b_xy(b)[1])


def test_resample_l_shape_keeps_spacing_and_turns_the_corner():
    a = offset(*ORIGIN, 0, 0)
    corner = offset(*ORIGIN, 0, 60)     # 60 m north
    b = offset(*ORIGIN, 60, 60)         # then 60 m east
    samples = cc.build_path([a, corner, b], step_m=20)

    assert len(samples) == 7  # 0,20,40,60 (corner),80,100,120
    for i in range(len(samples) - 1):
        d = math.hypot(samples[i + 1].x - samples[i].x,
                       samples[i + 1].y - samples[i].y)
        assert d == pytest_approx(20)
    # bearing before the corner is ~north (0 deg), after is ~east (90 deg)
    assert samples[0].bearing == pytest_approx(0, abs=1e-6)
    assert samples[-1].bearing == pytest_approx(90, abs=1e-6)


def b_xy(latlon):
    return cc.project(*latlon)


def pytest_approx(x, abs=1e-6):
    import pytest
    return pytest.approx(x, abs=abs)


# --------------------------------------------------------------------------
# canonical key / bearing bins
# --------------------------------------------------------------------------

def test_perpendicular_streets_land_in_different_bearing_bins():
    ns = cc.canonical_key(0, 0, bearing_deg=0)      # due north
    ew = cc.canonical_key(0, 0, bearing_deg=90)     # due east
    assert ns[2] != ew[2]


def test_perpendicular_streets_do_not_tolerantly_match():
    """A north-south street and an east-west street crossing at the same
    point must never be treated as the same corridor, no matter how close."""
    ns_key = cc.canonical_key(0, 0, bearing_deg=0)
    ew_occupancy = {cc.canonical_key(0, 0, bearing_deg=90)}
    assert not cc.tolerant_match(ns_key, ew_occupancy)


# --------------------------------------------------------------------------
# the checkerboard fix: jittered digitisation of the same street
# --------------------------------------------------------------------------

def _straight_path(lat0, lon0, jitter_m, length_m=200, step_m=cc.STEP_M):
    """A north-running street, optionally offset sideways by jitter_m to
    simulate the two feeds digitising the same street a few metres apart."""
    a = offset(lat0, lon0, jitter_m, 0)
    b = offset(lat0, lon0, jitter_m, length_m)
    return cc.build_path([a, b], step_m)


def test_jittered_digitisation_of_the_same_street_classifies_as_kept_throughout():
    current_path = _straight_path(*ORIGIN, jitter_m=0)
    proposed_path = _straight_path(*ORIGIN, jitter_m=4)  # a few metres over

    cur_occ = {s.key for s in current_path}
    rows = cc.emit_runs_for_side(
        "weekday", [proposed_path], cur_occ,
        cc.KLASS_KEPT, cc.KLASS_ADDED, (cc.KLASS_KEPT, cc.KLASS_ADDED))

    # One single "kept" run end to end -- not an alternating checkerboard of
    # short kept/added slivers.
    assert [r["klass"] for r in rows] == [cc.KLASS_KEPT]
    assert rows[0]["length_m"] > 150  # most of the 200 m street


def test_exact_key_equality_would_have_produced_a_checkerboard():
    """Sanity check on the fixture idea: a jitter large enough to cross a
    lattice cell boundary (but still within MATCH_CELL_RADIUS tolerance)
    disagrees key-for-key, proving that a hard exact-cell test really would
    paint this as lost/added rather than kept -- the tolerant match is doing
    real work, not passing on a fixture that happens to land on the lattice
    by luck."""
    current_path = _straight_path(*ORIGIN, jitter_m=0)
    proposed_path = _straight_path(*ORIGIN, jitter_m=cc.CELL_M + 1)
    cur_keys = {s.key for s in current_path}
    prop_keys = {s.key for s in proposed_path}
    assert cur_keys != prop_keys
    # ...yet the tolerant match still treats it as one corridor.
    assert all(cc.tolerant_match(k, cur_keys) for k in prop_keys)


# --------------------------------------------------------------------------
# lost / added
# --------------------------------------------------------------------------

def test_street_only_on_current_side_is_lost():
    current_path = _straight_path(*ORIGIN, jitter_m=0)
    empty_occ = set()
    rows = cc.emit_runs_for_side(
        "weekday", [current_path], empty_occ,
        cc.KLASS_KEPT, cc.KLASS_LOST, (cc.KLASS_LOST,))
    assert [r["klass"] for r in rows] == [cc.KLASS_LOST]


def test_street_only_on_proposed_side_is_added():
    proposed_path = _straight_path(*ORIGIN, jitter_m=0)
    empty_occ = set()
    rows = cc.emit_runs_for_side(
        "weekday", [proposed_path], empty_occ,
        cc.KLASS_KEPT, cc.KLASS_ADDED, (cc.KLASS_KEPT, cc.KLASS_ADDED))
    assert [r["klass"] for r in rows] == [cc.KLASS_ADDED]


# --------------------------------------------------------------------------
# cross-route dedupe
# --------------------------------------------------------------------------

def test_corridor_shared_by_two_routes_is_emitted_once():
    """Two shapes tracing (almost) the same street -- as two routes sharing
    a corridor would -- must draw one run, not two."""
    path_a = _straight_path(*ORIGIN, jitter_m=0)
    path_b = _straight_path(*ORIGIN, jitter_m=1)  # a different route, same street
    empty_occ = set()

    rows = cc.emit_runs_for_side(
        "weekday", [path_a, path_b], empty_occ,
        cc.KLASS_KEPT, cc.KLASS_ADDED, (cc.KLASS_KEPT, cc.KLASS_ADDED))

    assert len(rows) == 1


# --------------------------------------------------------------------------
# Douglas-Peucker simplification
# --------------------------------------------------------------------------

def test_douglas_peucker_keeps_endpoints_and_drops_collinear_points():
    a = offset(*ORIGIN, 0, 0)
    mid = offset(*ORIGIN, 0, 50)   # exactly on the line from a to b
    b = offset(*ORIGIN, 0, 100)
    samples = cc.build_path([a, mid, b], step_m=50)  # lands exactly on a, mid, b
    assert len(samples) == 3

    simplified = cc.simplify_run(samples, tolerance=cc.SIMPLIFY_M)
    assert len(simplified) == 2
    assert simplified[0].key == samples[0].key
    assert simplified[-1].key == samples[-1].key


def _sample_at(latlon):
    lat, lon = latlon
    x, y = cc.project(lat, lon)
    return cc.Sample(x, y, lat, lon, 0.0, cc.canonical_key(x, y, 0.0))


def test_douglas_peucker_keeps_a_genuine_corner():
    a = offset(*ORIGIN, 0, 0)
    corner = offset(*ORIGIN, 50, 0)  # a sharp turn, well outside tolerance
    b = offset(*ORIGIN, 50, 50)
    samples = [_sample_at(a), _sample_at(corner), _sample_at(b)]

    simplified = cc.simplify_run(samples, tolerance=cc.SIMPLIFY_M)
    assert len(simplified) == 3


# --------------------------------------------------------------------------
# minimum run length
# --------------------------------------------------------------------------

def test_short_runs_are_dropped_as_slivers():
    a = offset(*ORIGIN, 0, 0)
    b = offset(*ORIGIN, 0, 40)  # shorter than MIN_RUN_M = 60
    assert 40 < cc.MIN_RUN_M
    path = cc.build_path([a, b], step_m=cc.STEP_M)
    empty_occ = set()

    rows = cc.emit_runs_for_side(
        "weekday", [path], empty_occ,
        cc.KLASS_KEPT, cc.KLASS_ADDED, (cc.KLASS_KEPT, cc.KLASS_ADDED))
    assert rows == []


def test_runs_at_or_above_min_length_are_kept():
    a = offset(*ORIGIN, 0, 0)
    b = offset(*ORIGIN, 0, 100)  # comfortably above MIN_RUN_M
    path = cc.build_path([a, b], step_m=cc.STEP_M)
    empty_occ = set()

    rows = cc.emit_runs_for_side(
        "weekday", [path], empty_occ,
        cc.KLASS_KEPT, cc.KLASS_ADDED, (cc.KLASS_KEPT, cc.KLASS_ADDED))
    assert len(rows) == 1
    assert rows[0]["length_m"] >= cc.MIN_RUN_M


# --------------------------------------------------------------------------
# exact-key dedupe: no double-counted pavement on a PARTIAL overlap
# --------------------------------------------------------------------------

def _overlapping_fixture():
    """Shape A runs 0->200 m north; shape B runs 100->300 m north, so the two
    share the 100->200 m stretch and diverge for the rest -- the common case
    of two routes overlapping for a few blocks, not their whole corridor.
    True distinct pavement is the union, 0->300 m = 300 m, not 200 + 200 =
    400 m -- the number the old whole-run "skip only if ALL keys already
    emitted" dedupe would have produced, by letting B's run through in full
    the moment any one of its samples was new."""
    a_start = offset(*ORIGIN, 0, 0)
    a_end = offset(*ORIGIN, 0, 200)
    b_start = offset(*ORIGIN, 0, 100)
    b_end = offset(*ORIGIN, 0, 300)
    path_a = cc.build_path([a_start, a_end], step_m=cc.STEP_M)
    path_b = cc.build_path([b_start, b_end], step_m=cc.STEP_M)
    return path_a, path_b


def test_partial_overlap_is_not_double_counted():
    path_a, path_b = _overlapping_fixture()
    rows = cc.emit_runs_for_side(
        "weekday", [path_a, path_b], set(),
        cc.KLASS_KEPT, cc.KLASS_ADDED, (cc.KLASS_KEPT, cc.KLASS_ADDED))

    total_length = sum(r["length_m"] for r in rows)
    # Not the old bug's 400 m (200 + 200, the shared stretch redrawn). The
    # true distinct length is 300 m; CELL_M = 25 m discretises exactly where
    # the split falls near the boundary, so the result lands a cell or two
    # short of 300 rather than exactly on it -- still nowhere near 400.
    assert total_length < 350
    assert total_length == pytest_approx(300, abs=2 * cc.CELL_M)

    # the shared stretch must appear in exactly one row's geometry, not two
    all_points = [pt for r in rows for pt in r["geometry"].split()]
    assert len(all_points) == len(set(all_points))


def test_partial_overlap_emits_the_new_tail_as_its_own_row():
    """Shape B's new (non-overlapping) tail must still survive as its own
    row -- fragments from a partial overlap are not slivers, and MIN_RUN_M
    must not be applied to them even though this tail clears it anyway; the
    point under test is the mechanism (a second row exists at all and the
    two rows are not identical), not its exact length."""
    path_a, path_b = _overlapping_fixture()
    rows = cc.emit_runs_for_side(
        "weekday", [path_a, path_b], set(),
        cc.KLASS_KEPT, cc.KLASS_ADDED, (cc.KLASS_KEPT, cc.KLASS_ADDED))

    assert len(rows) == 2
    lengths = sorted(r["length_m"] for r in rows)
    assert lengths[0] > 0
    assert lengths[1] == pytest_approx(200, abs=cc.CELL_M)  # all of A, whole
