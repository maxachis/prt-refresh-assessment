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
import csv
import random
from pathlib import Path

import pytest

from refresh import query

ROOT = Path(__file__).resolve().parent.parent

# Sampled rather than exhaustive: 6,284 locations x 3 day types x 2 sides is
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
        ("weekday", "gone"): 633,
        ("weekday", "halved"): 298,
        ("weekday", "doubled"): 237,
        ("saturday", "doubled"): 368,
        ("sunday", "doubled"): 438,
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
    # [lat, lon, published, id] + 4 fields x 3 day types
    width = 4 + query.POINT_STRIDE * len(query.DAYS)
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


def test_unpublished_points_have_no_stop_of_their_own_today(con):
    """What an unpublished point claims, stated as the rule that builds it.

    It claims the plan puts a stop where no stop stands within
    UNIVERSE_DEDUP_M -- an identity test. It does NOT claim the ground is
    newly served: until 2026-09-08 the two were the same assertion, because
    the identity radius was the access radius, and this test asserted
    `cur_trips == 0`. It cannot any more, and that is the point of the change
    rather than a regression in it. A point 200 m from a busy stop is a real
    new pole on ground that already has a bus, and the bucket says so.
    """
    rows = con.execute(
        "SELECT lat, lon FROM change WHERE published = 0 AND radius = ? "
        "AND day = 'weekday'", (query.PRIMARY_RADIUS,)).fetchall()
    assert rows, "no new-coverage points at all -- change_points() found none"
    for r in rows:
        assert not query.stops_within(con, r["lat"], r["lon"],
                                      query.UNIVERSE_DEDUP_M, "current")


def test_a_stop_prt_kept_the_id_of_is_never_a_new_place(con):
    """PRT's own stop id outranks the distance rule that guesses at identity.

    A pole PRT moved down the block keeps its id, and 150 m is a guess about
    when two coordinates are the same corner -- so where the two disagree, the
    id wins: the agency saying "this is that stop" is evidence, and a distance
    threshold is a convention. Two stops in the current feed disagree, both
    relocations rather than additions: 20918 (Churchill Rd + Holland, 152 m)
    and 18627 (Hwy Rt 286 + Royal Oak Dr, moved to Old Frankstown Rd, 178 m).
    Drawn as new places they would say the plan adds a stop where it moves one.
    """
    shared = {r["stop_id"] for r in con.execute(
        "SELECT stop_id FROM stops WHERE side = 'proposed' AND stop_id IN "
        "(SELECT stop_id FROM stops WHERE side = 'current')")}
    assert shared, "no ids in common -- the fixture cannot test this"
    new_places = {p[0] for p in query.change_points(con) if p[3] == 0}
    assert not {f"p:{sid}" for sid in shared} & new_places


def test_new_coverage_points_are_not_all_a_gain(con):
    """The set must never be read, or drawn, as the plan's gains.

    Some of these poles go on corridors the plan is thinning, and if every one
    of them landed in a gain bucket the layer would be an advertisement rather
    than a measurement. Convention 15's asymmetry one unit over: a stop being
    added says nothing about whether service there goes up.
    """
    buckets = {r["bucket"] for r in con.execute(
        "SELECT DISTINCT bucket FROM change WHERE published = 0 "
        "AND radius = ? AND day = 'weekday'", (query.PRIMARY_RADIUS,))}
    assert buckets & {"less", "halved", "gone"}, \
        f"every new-coverage point reads as a gain or unchanged: {buckets}"


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

    A weekday location that loses all service carries 580 of the system's
    73,408 daily boardings -- 0.8%. That figure is the strongest thing the
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
    assert round(total) == 73408
    assert round(gone) == 580


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
        "SELECT key, place, residents_lost FROM place_population "
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
    changed = {r["key"] for r in con.execute("SELECT key FROM place_population")}
    for stop in con.execute(
            "SELECT lat, lon FROM stops WHERE side = 'current'"):
        named = query.place_containing(con, stop["lat"], stop["lon"])
        if named and query.place_key(named) not in changed:
            break
    else:
        pytest.skip("every place with a stop in it changed")

    assert query.place_residents(con, stop["lat"], stop["lon"]) == {
        "key": query.place_key(named), "place": named,
        "lost": 0.0, "gained": 0.0, "block_groups": 0, "measured": True}


def test_outside_allegheny_the_question_was_never_asked(con):
    """The equity work is Allegheny-only, so elsewhere there is no answer.

    Reporting 0 there would say the plan changes nothing for anyone in Beaver
    County, which the repo has not measured either way.
    """
    # Ambridge, Beaver County -- inside no Allegheny boundary, so the
    # containment test returns nothing to look up rather than a zero.
    assert query.place_containing(con, 40.5889, -80.2256) is None
    assert query.place_residents(con, 40.5889, -80.2256) is None


# --------------------------------------------------------------------------
# the Places view
# --------------------------------------------------------------------------

def test_places_rank_every_named_place_the_plan_changed(con):
    """The view's list. One row per place with any loss or gain, carrying both
    the count and the denominator, because either alone misleads: Baldwin's
    9,613 is the biggest raw loss in the county and Reserve township, ninth by
    count, loses 85% of everyone who lives there."""
    rows = query.places(con)
    assert rows, "no places served"
    by_key = {r["key"]: r for r in rows}

    published = con.execute(
        "SELECT key, place, residents_lost, residents_total FROM "
        "place_population ORDER BY residents_lost DESC LIMIT 1").fetchone()
    got = by_key[published["key"]]
    assert got["place"] == published["place"]
    assert got["residents_lost"] == pytest.approx(published["residents_lost"])
    assert got["residents_total"] == pytest.approx(published["residents_total"])
    assert got["share_lost"] == pytest.approx(
        published["residents_lost"] / published["residents_total"])


def test_no_place_loses_more_residents_than_it_has(con):
    """The share is only meaningful if both halves count the same people. They
    did not before: `equity_places.csv` carries the changed block groups' 2020
    population, and dividing by that puts Reserve township above 100%."""
    for row in query.places(con):
        assert row["residents_total"] > 0, row["place"]
        if row["share_lost"] is not None:
            assert row["share_lost"] <= 1.0, row["place"]


def test_a_place_carries_the_block_group_points_the_map_lights(con):
    """The place's own polygon says how much of it lost service; these points
    say where inside it, which is a different unit and drawn on top of the
    fill rather than instead of it (convention 10)."""
    key = con.execute(
        "SELECT key FROM place_population ORDER BY residents_lost DESC "
        "LIMIT 1").fetchone()["key"]
    detail = query.place_detail(con, key)
    assert detail["key"] == key
    assert len(detail["changed"]) == detail["changed_block_groups"]
    assert sum(b["residents_lost"] for b in detail["changed"]) == \
        pytest.approx(detail["residents_lost"])
    for bg in detail["changed"]:
        assert 40.0 < bg["lat"] < 41.0 and -81.0 < bg["lon"] < -79.0


def test_an_unknown_place_is_not_an_error(con):
    assert query.place_detail(con, "no such place") is None


def test_the_served_places_reconcile_with_the_published_county_total(con):
    """The Places view lists only *named* places, and convention 12's scope
    rule applies: it has to be able to say what it leaves out. 68,838 of the
    68,989 residents who lose every bus are on named ground; the other 151 sit
    beyond 2 km of a labelled stop and are in neither this list nor the map."""
    served = sum(r["residents_lost"] for r in query.places(con))
    with open(ROOT / "data" / "equity_places.csv", encoding="utf-8") as f:
        published = sum(float(r["residents_lost"] or 0)
                        for r in csv.DictReader(f))
    unnamed = sum(float(r["residents_lost"] or 0)
                  for r in csv.DictReader(
                      open(ROOT / "data" / "equity_places.csv",
                           encoding="utf-8")) if not (r["place"] or "").strip())
    assert served == pytest.approx(published - unnamed)


def test_the_panel_serves_the_key_the_places_view_is_addressed_by(con):
    """So the link out of the panel does not have to re-derive it. Porting
    `place_key` into TypeScript put its rules in two languages, where a change
    to one sends the link to the wrong place with nothing failing loudly."""
    row, stop = _a_place_that_lost_residents(con)
    got = query.place(con, stop["lat"], stop["lon"])["population"]
    assert got["key"] == row["key"]
    assert query.place_detail(con, got["key"])["place"] == got["place"]


def test_a_place_too_small_to_have_a_share_is_not_given_one(con):
    """Trafford borough straddles the county line and its Allegheny part is 16
    people, all of whom lose every bus. Ranked by share that is 97.5% and it
    led the list, above Reserve township's 85% of 3,180 -- a number with no
    denominator behind it heading a list about 69,000 people. Below the floor
    the share is withheld rather than shown, because there is no honest
    version of it; the place keeps its place in the count-ranked list, where
    16 is simply 16."""
    small = [r for r in query.places(con)
             if r["residents_total"] < query.SHARE_MIN_RESIDENTS]
    assert small, "no place below the floor -- has the data changed?"
    for row in small:
        assert row["share_lost"] is None and row["share_gained"] is None

    ranked = [r for r in query.places(con) if r["share_lost"] is not None]
    assert max(ranked, key=lambda r: r["share_lost"])["place"] != "Trafford borough"


def test_change_layer_carries_the_point_id(con):
    """A dot has to be nameable, not just locatable.

    The paint-to-select brush hands the legend a set of dots and the URL a way
    to say which ones; both need an identity that survives a rebuild, and an
    index into `points` does not -- the row order is the server's, and a
    reordering would silently reselect different stops in a link somebody had
    already sent.
    """
    layer = query.change_layer(con, query.PRIMARY_RADIUS)
    assert layer["fields"][query.ID_AT] == "id"
    ids = {r["point_id"] for r in con.execute(
        "SELECT DISTINCT point_id FROM change WHERE radius = ?",
        (query.PRIMARY_RADIUS,))}
    assert {p[query.ID_AT] for p in layer["points"]} == ids


def test_the_identity_radius_is_not_the_access_radius(con):
    """Two different questions, and they stopped sharing a number on 2026-09-08.

    Access asks how far a rider will walk; identity asks whether a proposed
    pole is its own place to measure. The identity radius is the strict
    same-corner distance, and it must stay independent of the walk radius the
    caller asks for -- a point set that moved with the radius would stop
    describing the same places at 400 m and 150 m.

    The direction of the inequality is the fix itself: widening identity back
    to the access radius drops points, and those are the 139 stops that drew
    no mark at all.
    """
    assert query.UNIVERSE_DEDUP_M == 150
    assert query.UNIVERSE_DEDUP_M != query.PRIMARY_RADIUS

    ids = {p[0] for p in query.change_points(con)}
    at_400 = {p[0] for p in query.change_points(con, dedup=query.PRIMARY_RADIUS)}
    assert at_400 < ids

    # Selecting at whatever radius was asked for is the thing that must not
    # happen: both radii describe one point set.
    assert ids == {p[0] for p in query.change_points(con, 150)}

    published = {p for p in ids if p.startswith("c:")}
    assert published == {p for p in at_400 if p.startswith("c:")}


def test_the_panel_says_which_proposed_stops_stand_where_none_stands_today(con):
    """The ring is on the map; the panel that explains a dot has to know it too.

    Same rule and same constant as the point universe -- no current stop within
    `UNIVERSE_DEDUP_M` -- so the panel cannot say a stop is new while the map
    draws it as an infill of an existing one, or the reverse.
    """
    # Millvale's Grant Avenue: today's buses pass on East Ohio Street and
    # Evergreen Avenue, and the plan runs them up Grant itself.
    at = query.place(con, 40.48005, -79.97341, 400)

    proposed = at["proposed"]["stops"]
    assert proposed, "the plan serves this corner"
    assert all("new_place" in s for s in proposed)
    assert any(s["new_place"] for s in proposed)

    for s in proposed:
        near = query.stops_within(
            con, s["lat"], s["lon"], query.UNIVERSE_DEDUP_M, "current")
        assert s["new_place"] is (not near)

    # One-sided, like boardings: a stop that runs today stands where a stop
    # stands today, so the question is not asked of that side.
    assert all("new_place" not in s for s in at["current"]["stops"])
