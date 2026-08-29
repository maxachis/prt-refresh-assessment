"""The served numbers must equal the published numbers.

`data/coverage_change.csv` is what `docs/answers/` cites and what any public
comment will quote. The web app reaches the same statistic by a different route
-- SQLite and an arbitrary point, rather than a Python dict and a stop's own
coordinates -- so the two implementations can drift apart silently. This module
exists to make that drift loud.

`test_matches_published_csv` is the one that matters. The rest pin the
individual aggregation rules so that when it fails, the failure names which
rule broke rather than only that something did.
"""
import random

import pytest

from refresh import query

# Sampled rather than exhaustive: 5,751 locations x 3 day types x 2 sides is
# ~35k place queries and about six minutes. The sample is seeded, so it is the
# same set every run, and it deliberately includes the busiest locations --
# Downtown clusters have 50+ routes and are where a cluster-aggregation bug
# shows up first.
SAMPLE_N = 120


def _sample(rows):
    random.seed(1729)
    return rows[:20] + random.sample(rows, SAMPLE_N)


def test_matches_published_csv(con, coverage_rows):
    """Trips and the hourly tier, at every stop's own coordinates, both sides."""
    mismatches = []
    for r in _sample(coverage_rows):
        place = query.place(con, float(r["lat"]), float(r["lon"]),
                            query.PRIMARY_RADIUS)
        for day in query.DAYS:
            for side, prefix in (("current", "cur"), ("proposed", "prop")):
                got = place[side]["days"][day]
                want_trips = int(r[f"{prefix}_{day}_trips"])
                if got["trips"] != want_trips:
                    mismatches.append(
                        f"{r['stop_id']} {side} {day} trips: "
                        f"csv={want_trips} api={got['trips']}")
                want_hourly = bool(int(r[f"{prefix}_{day}_hourly"]))
                if got["hourly"] != want_hourly:
                    mismatches.append(
                        f"{r['stop_id']} {side} {day} hourly: "
                        f"csv={want_hourly} api={got['hourly']}")
    assert not mismatches, "\n".join(mismatches[:25])


def test_weekday_periods_match_published_csv(con, coverage_rows):
    """The seven period buckets, which the headline trip total sums over."""
    mismatches = []
    for r in _sample(coverage_rows):
        place = query.place(con, float(r["lat"]), float(r["lon"]),
                            query.PRIMARY_RADIUS)
        for side, prefix in (("current", "cur"), ("proposed", "prop")):
            for key in query.PKEYS:
                want = int(r[f"{prefix}_{key}"])
                got = place[side]["days"]["weekday"]["periods"][key]
                if got != want:
                    mismatches.append(
                        f"{r['stop_id']} {side} {key}: csv={want} api={got}")
    assert not mismatches, "\n".join(mismatches[:25])


def test_routes_at_location_match_published_csv(con, coverage_rows):
    mismatches = []
    for r in _sample(coverage_rows):
        place = query.place(con, float(r["lat"]), float(r["lon"]),
                            query.PRIMARY_RADIUS)
        for side, col in (("current", "current_routes"),
                          ("proposed", "proposed_routes")):
            want = sorted(x for x in (r[col] or "").split(";") if x)
            got = place[side]["days"]["weekday"]["routes"]
            if got != want:
                mismatches.append(f"{r['stop_id']} {side}: csv={want} api={got}")
    assert not mismatches, "\n".join(mismatches[:10])


# --------------------------------------------------------------------------
# the aggregation rules, in isolation
# --------------------------------------------------------------------------

def test_cluster_trips_takes_max_not_sum():
    """Convention 2: two adjacent stop ids on a corridor are one bus passing.

    Summing here is the bug the convention exists to prevent -- it would make
    consolidating two stops into one read as a service cut.
    """
    by_stop = {
        "A": {("61C", "0"): [7 * 60, 8 * 60]},
        "B": {("61C", "0"): [7 * 60, 8 * 60]},   # the same two buses, next block
    }
    out = query.cluster_trips(by_stop, ["A", "B"])
    assert sum(out.values()) == 2, "cluster trips summed across stops"


def test_cluster_trips_maxes_per_period_not_per_day():
    """One stop may hold the morning trips and its neighbour the afternoon's.

    The rider on that corner has both, so the max is taken per period.
    """
    by_stop = {
        "A": {("28X", "0"): [7 * 60, 7 * 60 + 30]},          # am only
        "B": {("28X", "0"): [16 * 60, 16 * 60 + 30]},        # pm only
    }
    out = query.cluster_trips(by_stop, ["A", "B"])
    assert out["am_6_9a"] == 2 and out["pm_3_6p"] == 2
    assert sum(out.values()) == 4


def test_departures_by_direction_picks_the_richest_stop():
    by_stop = {
        "A": {("71B", "0"): [7 * 60]},
        "B": {("71B", "0"): [7 * 60, 8 * 60, 9 * 60]},
    }
    out = query.departures_by_direction(by_stop, ["A", "B"])
    assert out["0"] == [7 * 60, 8 * 60, 9 * 60]


def test_departures_by_direction_ties_go_to_lowest_stop_id():
    """Rule 3: ties must not depend on iteration order.

    Set iteration order is randomised per process, and this moved ~20 borderline
    locations between runs of the original script before it was pinned.
    """
    by_stop = {
        "A": {("1", "0"): [7 * 60]},
        "B": {("1", "0"): [9 * 60]},   # same count, different times
    }
    assert query.departures_by_direction(by_stop, ["A", "B"])["0"] == [7 * 60]
    assert query.departures_by_direction(by_stop, ["B", "A"])["0"] == [7 * 60]


def test_hourly_fails_on_a_midday_gap():
    """Peak-only service must fail the tier rather than pass on an average."""
    peak_only = {"0": [t for t in range(6 * 60, 9 * 60, 20)]
                      + [t for t in range(15 * 60, 18 * 60, 20)]}
    assert query.hourly(peak_only) is False

    all_day = {"0": list(range(6 * 60, 18 * 60 + 1, 30))}
    assert query.hourly(all_day) is True


def test_hourly_counts_the_wait_from_the_window_edges():
    """A bus at noon and nothing else is not hourly, however tight its gaps."""
    assert query.hourly({"0": [12 * 60]}) is False


def test_hourly_takes_the_better_direction_not_the_pooled_stream():
    """An hourly inbound-only stop must not clear the bar on its outbound trips."""
    by_dir = {
        "0": list(range(6 * 60, 18 * 60 + 1, 30)),   # clears on its own
        "1": [7 * 60],                                # does not
    }
    assert query.hourly(by_dir) is True
    assert query.hourly({"1": by_dir["1"]}) is False


# --------------------------------------------------------------------------
# spatial
# --------------------------------------------------------------------------

def test_radius_is_applied_identically_to_both_sides(con, coverage_rows):
    """Convention 1: the same circle on the ground, in both networks."""
    r = coverage_rows[0]
    lat, lon = float(r["lat"]), float(r["lon"])
    for side in query.SIDES:
        for stop_id, _name, slat, slon, metres in query.stops_within(
                con, lat, lon, 400, side):
            assert metres <= 400, f"{side} {stop_id} at {metres} m inside a 400 m query"


def test_boundary_stops_are_not_lost_to_rtree_float_rounding(con):
    """Regression: the r-tree prefilter must never be tighter than the radius.

    Stop 11056 is 399.895 m from MIFFLIN RD + GLENHURST (12186). The r-tree
    holds coordinates as 32-bit floats, ~0.4 m at this longitude, so an
    unpadded query box dropped it from a 400 m query -- and with it 19 weekday
    trips, putting the app below the figure coverage_change.csv publishes for
    that location. `test_change_table_agrees_with_the_csv_row_by_row` is what
    caught it; this names it.
    """
    lat, lon = 40.37211, -79.917079
    got = {s[0] for s in query.stops_within(con, lat, lon, 400, "current")}
    assert "11056" in got


def test_smaller_radius_never_finds_more(con, coverage_rows):
    r = coverage_rows[0]
    lat, lon = float(r["lat"]), float(r["lon"])
    for side in query.SIDES:
        wide = query.stops_within(con, lat, lon, 400, side)
        tight = query.stops_within(con, lat, lon, 150, side)
        assert len(tight) <= len(wide)
        assert {s[0] for s in tight} <= {s[0] for s in wide}


def test_place_reports_both_sides_and_a_signed_change(con, coverage_rows):
    r = coverage_rows[0]
    p = query.place(con, float(r["lat"]), float(r["lon"]))
    assert set(p) >= {"current", "proposed", "change", "radius", "place"}
    for day in query.DAYS:
        assert (p["change"][day]["trips"]
                == p["proposed"]["days"][day]["trips"]
                - p["current"]["days"][day]["trips"])


# --------------------------------------------------------------------------
# the citywide change layer
# --------------------------------------------------------------------------

def test_bucket_decides_total_loss_before_the_ratio_tests():
    """`prop == 0` also satisfies "halved or worse"; order has to break the tie."""
    assert query.bucket(40, 0) == "gone"
    assert query.bucket(0, 40) == "new"
    assert query.bucket(0, 0) == "none"


def test_bucket_edges_are_the_published_criteria():
    """LOSE-FREQUENCY-HALF: prop <= cur/2. GAIN-FREQUENCY-DOUBLE: prop >= 2*cur."""
    assert query.bucket(100, 50) == "halved"      # exactly half is halved
    assert query.bucket(100, 51) == "less"
    assert query.bucket(100, 200) == "doubled"    # exactly double is doubled
    assert query.bucket(100, 199) == "more"


def test_bucket_dead_band_is_symmetric():
    """Gains and losses get the same benefit of the doubt, per convention."""
    assert query.bucket(100, 90) == "same"
    assert query.bucket(100, 110) == "same"
    assert query.bucket(100, 89) == "less"
    assert query.bucket(100, 111) == "more"


def test_change_buckets_reproduce_the_published_counts(con, coverage_rows):
    """The map's dots and docs/answers/ must be the same finding.

    These four figures are printed in COVERAGE-CHANGE.md, LOSE-FREQUENCY-HALF.md
    and GAIN-FREQUENCY-DOUBLE.md. If the layer stops reproducing them, either a
    bucket edge moved or the precomputed table is stale against the CSV -- and
    either way the map is telling a public-comment audience something the
    answer documents do not say.
    """
    want = {
        ("weekday", "gone"): 593,
        ("weekday", "halved"): 284,
        ("weekday", "doubled"): 217,
        ("saturday", "doubled"): 331,
        ("sunday", "doubled"): 373,
    }
    got = {}
    for day, key in want:
        got[(day, key)] = con.execute(
            "SELECT count(*) FROM change WHERE radius = ? AND day = ? "
            "AND bucket = ? AND published = 1",
            (query.PRIMARY_RADIUS, day, key)).fetchone()[0]
    assert got == want


def test_change_table_agrees_with_the_csv_row_by_row(con, coverage_rows):
    """Every published location's bucket, recomputed from the CSV's own trips."""
    stored = {
        (r["point_id"], r["day"]): (r["cur_trips"], r["prop_trips"], r["bucket"])
        for r in con.execute(
            "SELECT point_id, day, cur_trips, prop_trips, bucket FROM change "
            "WHERE radius = ? AND published = 1", (query.PRIMARY_RADIUS,))}

    bad = []
    for r in coverage_rows:
        for day in query.DAYS:
            cur = int(r[f"cur_{day}_trips"])
            prop = int(r[f"prop_{day}_trips"])
            got = stored.get((f"c:{r['stop_id']}", day))
            want = (cur, prop, query.bucket(cur, prop))
            if got != want:
                bad.append(f"{r['stop_id']} {day}: db={got} csv={want}")
    assert not bad, "\n".join(bad[:25])


def test_change_layer_packs_every_point_and_day(con):
    layer = query.change_layer(con, query.PRIMARY_RADIUS)
    n = con.execute("SELECT count(DISTINCT point_id) FROM change WHERE radius = ?",
                    (query.PRIMARY_RADIUS,)).fetchone()[0]
    assert len(layer["points"]) == n
    assert [b["key"] for b in layer["buckets"]] == list(query.BUCKET_KEYS)
    # [lat, lon, published] + 4 fields x 3 day types
    width = 3 + query.POINT_STRIDE * len(query.DAYS)
    assert all(len(p) == width for p in layer["points"])
    assert len(layer["fields"]) == width


def test_change_layer_bucket_indices_resolve_to_the_stored_bucket(con):
    """The wire format is indices into `buckets`; an off-by-one would recolour
    the whole map without changing a single number."""
    layer = query.change_layer(con, query.PRIMARY_RADIUS)
    keys = [b["key"] for b in layer["buckets"]]
    rows = {(round(r["lat"], 6), round(r["lon"], 6)): r["bucket"]
            for r in con.execute(
                "SELECT lat, lon, bucket FROM change WHERE radius = ? "
                "AND day = 'weekday'", (query.PRIMARY_RADIUS,))}
    for p in layer["points"][:400]:
        assert keys[p[query.BUCKET_AT(0)]] == rows[(p[0], p[1])]


def test_change_points_are_the_same_set_at_both_radii(con):
    """Convention 4 only works if the two radii describe the same places."""
    at = {r: {row["point_id"] for row in con.execute(
        "SELECT DISTINCT point_id FROM change WHERE radius = ?", (r,))}
        for r in query.RADII}
    assert at[400] == at[150]


def test_unpublished_points_have_no_bus_within_the_headline_radius(con):
    """The added points are places nothing serves today -- that is what they are
    for. If one had current service it would be double-counting a published
    location under a second identity."""
    rows = con.execute(
        "SELECT cur_trips FROM change WHERE published = 0 AND radius = ?",
        (query.PRIMARY_RADIUS,)).fetchall()
    assert rows, "no new-coverage points at all -- change_points() found none"
    assert all(r["cur_trips"] == 0 for r in rows)


# --------------------------------------------------------------------------
# ridership weighting
# --------------------------------------------------------------------------

def test_change_layer_carries_each_days_own_boardings(con):
    """The day control has to move the riders as well as the buses.

    Boardings differ by day type -- Sunday is 43% of the weekday total -- so a
    layer that shipped one figure for all three would report weekday riders
    under a Sunday map's losses.
    """
    layer = query.change_layer(con, query.PRIMARY_RADIUS)
    want = {r["stop_id"]: r for r in con.execute(
        "SELECT stop_id, weekday_boardings, saturday_boardings, "
        "  sunday_boardings FROM stop_place")}
    by_point = {(round(r["lat"], 6), round(r["lon"], 6)): r["point_id"]
                for r in con.execute(
                    "SELECT DISTINCT point_id, lat, lon FROM change "
                    "WHERE radius = ?", (query.PRIMARY_RADIUS,))}

    seen_published = seen_new = 0
    for p in layer["points"]:
        point_id = by_point[(p[0], p[1])]
        for i, day in enumerate(query.DAYS):
            riders = p[query.RIDERS_AT(i)]
            if p[2]:
                assert riders == want[point_id[2:]][f"{day}_boardings"]
                seen_published += 1
            else:
                # Not zero: no bus stops here today, so there is no ridership
                # record to be zero. Convention 15 -- the gains side of this
                # weighting is unmeasurable, and it says so in the data.
                assert riders is None
                seen_new += 1
    assert seen_published and seen_new


def test_boardings_reproduce_the_published_shares(con):
    """The numbers the weighted legend will be quoted on.

    A weekday location that loses all service carries 488 of the system's
    67,619 daily boardings -- 0.7%. That figure is the strongest thing the
    plan's defenders can say and it is drawn from PRT's own usage extract, so
    it has to be pinned the way the bucket counts are: if it moves, either the
    usage join broke or the buckets did.
    """
    layer = query.change_layer(con, query.PRIMARY_RADIUS)
    day = query.DAYS.index("weekday")
    keys = [b["key"] for b in layer["buckets"]]

    total = 0.0
    gone = 0.0
    for p in layer["points"]:
        riders = p[query.RIDERS_AT(day)]
        if riders is None:
            continue
        total += riders
        if keys[p[query.BUCKET_AT(day)]] == "gone":
            gone += riders
    assert round(total) == 67619
    assert round(gone) == 488


# --------------------------------------------------------------------------
# boardings at one place
# --------------------------------------------------------------------------

def test_place_carries_todays_boardings_and_the_plan_carries_none(con,
                                                                  coverage_rows):
    """The panel's second denominator, one-sided the way convention 15 says.

    A place is a walk radius around a point, and the stops inside it are the
    stops the usage extract counted. Summing them is the same set the panel
    already prints as "stops within 400 m", read as riders instead of as
    service. The proposed side has no figure at all -- not 0 -- because a
    network that has not run has no observed riders.
    """
    r = coverage_rows[0]
    p = query.place(con, float(r["lat"]), float(r["lon"]))
    for day in query.DAYS:
        cur = p["current"]["days"][day]["boardings"]
        assert cur["total"] is None or cur["total"] >= 0
        assert cur["measured"] + cur["unmeasured"] == len(p["current"]["stops"])
        assert p["proposed"]["days"][day]["boardings"] is None


def test_place_boardings_sum_the_stops_inside_the_walk(con, coverage_rows):
    """The figure is the stops on screen, not a nearby aggregate.

    If these drift apart, the panel is quoting riders for a set of stops it is
    not drawing, which no reader could detect.
    """
    r = coverage_rows[0]
    p = query.place(con, float(r["lat"]), float(r["lon"]))
    ids = [s["stop_id"] for s in p["current"]["stops"]]
    if not ids:
        pytest.skip("the first published location has no current stop")
    want = con.execute(
        "SELECT sum(weekday_boardings) n FROM stop_place "
        f"WHERE stop_id IN ({','.join('?' * len(ids))})", ids).fetchone()["n"]
    got = p["current"]["days"]["weekday"]["boardings"]["total"]
    assert (got is None and want is None) or round(got, 3) == round(want, 3)


# --------------------------------------------------------------------------
# the place's residents
# --------------------------------------------------------------------------

def _a_place_that_lost_residents(con):
    """A published place with a loss, and a stop the panel would label with it."""
    row = con.execute(
        "SELECT place, residents_lost FROM place_population "
        "WHERE residents_lost > 0 ORDER BY residents_lost DESC LIMIT 1"
    ).fetchone()
    stop = con.execute(
        "SELECT s.stop_id, s.lat, s.lon FROM stops s "
        "JOIN stop_place p ON p.stop_id = s.stop_id "
        "WHERE s.side = 'current' AND p.id_name_mismatch = 0 "
        "  AND (p.hood = ? OR p.muni LIKE ?) LIMIT 1",
        (row["place"], row["place"] + " (%")).fetchone()
    return row, stop


def test_place_carries_the_published_residents_of_its_own_place(con):
    """The panel names a place; this is what the equity work published for it.

    Deliberately the same label the heading shows, however weak that label is
    (convention 6): a second way of deciding which place a point is in would
    let the heading and the population line disagree on screen.
    """
    row, stop = _a_place_that_lost_residents(con)
    p = query.place(con, stop["lat"], stop["lon"])
    got = p["population"]
    assert got["place"] == row["place"]
    assert round(got["lost"], 1) == round(row["residents_lost"], 1)
    assert got["measured"] is True


def test_a_place_the_plan_does_not_change_says_so_rather_than_nothing(con):
    """Absence from the equity file is a finding, inside Allegheny.

    The file holds only block groups that changed, so a labelled Allegheny
    place with no row has nobody losing or gaining every bus -- which is worth
    printing, and is not the same as not having asked.
    """
    unchanged = con.execute(
        "SELECT muni FROM stop_place WHERE muni LIKE '% (Allegheny, PA)' "
        "  AND (hood IS NULL OR hood = '') "
        "  AND lower(replace(muni, ' (Allegheny, PA)', '')) NOT IN "
        "      (SELECT key FROM place_population) LIMIT 1").fetchone()["muni"]
    assert query.place_residents(con, {"muni": unchanged, "hood": ""}) == {
        "place": query.place_display(unchanged), "lost": 0.0, "gained": 0.0,
        "block_groups": 0, "measured": True}


def test_outside_allegheny_the_question_was_never_asked(con):
    """The equity work is Allegheny-only, so elsewhere there is no answer.

    Reporting 0 there would say the plan changes nothing for anyone in Beaver
    County, which the repo has not measured either way.
    """
    assert query.place_residents(
        con, {"muni": "Ambridge borough (Beaver, PA)", "hood": ""}) is None
    assert query.place_residents(con, None) is None
