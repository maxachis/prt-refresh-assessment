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
    # [lat, lon, published, id, removed] + 4 fields x 3 day types
    width = query.FIXED_FIELDS + query.POINT_STRIDE * len(query.DAYS)
    assert all(len(p) == width for p in layer["points"])
    assert len(layer["fields"]) == width


def test_a_dot_counts_the_buses_at_its_own_kerb_not_the_ones_within_a_walk(con):
    """Stop-by-stop answers for the stop, in both of its channels.

    The packed row used to carry the walk radius's trip counts, read by nothing
    but the dot's tooltip -- so a reader hovering a downtown dot was told 1,591
    buses a weekday, which is every bus within 400 m of the Central Business
    District. Max ruled on 2026-09-10 that this view answers for the stop:
    "coloration leverages the misleading location scope ... if hover already
    shows that change in service at the stop level only, why have coloration
    communicate something potentially different?"

    So the trips are the kerb's, the COLOUR is the same kerb's, and the walk
    radius is the Surface view's question. The radius counts left the wire
    entirely; the `change` table keeps them, still pinned to the published CSV.
    """
    layer = query.change_layer(con, query.PRIMARY_RADIUS)
    assert layer["fields"][query.STOP_CUR_AT(0)] == "weekday_stop_cur"
    assert layer["fields"][query.STOP_PROP_AT(0)] == "weekday_stop_prop"
    assert not any(f.endswith(("_cur", "_prop")) and "stop" not in f
                   for f in layer["fields"])

    today = {r["stop_id"]: r["n"] for r in con.execute(
        "SELECT stop_id, SUM(n) AS n FROM departures "
        "WHERE side = 'current' AND day = 'weekday' GROUP BY stop_id")}
    by_id = {p[query.ID_AT]: p for p in layer["points"]}

    # The dot beside the click that started this: its own kerb, against the
    # 1,591 buses within 400 m of it that the tooltip used to print.
    downtown = query.stops_within(con, 40.44531, -79.99173, 60, "current")
    assert len(downtown) == 1
    at_kerb = by_id[f"c:{downtown[0][0]}"][query.STOP_CUR_AT(0)]
    within_walk = query.side_at_place(
        con, "current", 40.44531, -79.99173, 400)["days"]["weekday"]["trips"]
    assert at_kerb < within_walk / 5

    for point_id, p in list(by_id.items())[:150]:
        near = {s[0] for s in query.stops_within(
            con, p[query.LAT_AT], p[query.LON_AT], query.STOP_SAME_POLE_M,
            "current")}
        if point_id.startswith("c:"):
            near.add(point_id[2:])
        else:
            # A pole the plan adds stands where nothing stops today.
            assert not near
        assert p[query.STOP_CUR_AT(0)] == sum(today.get(i, 0) for i in near)


def test_a_kerb_the_plan_consolidates_does_not_read_as_a_gain(con):
    """Convention 2, at the unit the map now colours by.

    PRT splits one corner into two stop ids and the plan puts them back
    together. Counted per pole, each of the two reads its own share against the
    consolidated total and the corner paints as a gain: at c:10246 two poles of
    15 weekday trips become one of 22, which per pole is "15 -> 22, more
    service", twice over, and per kerb is 30 -> 22. 112 dots read a gain that
    way where their kerb holds flat or loses, across 208 consolidating kerbs.

    Both sides are therefore summed over the same 25 m -- the distance the
    removal cross and the added-stop ring already share.
    """
    layer = query.change_layer(con, query.PRIMARY_RADIUS)
    by_id = {p[query.ID_AT]: p for p in layer["points"]}
    p = by_id["c:10246"]
    assert (p[query.STOP_CUR_AT(0)], p[query.STOP_PROP_AT(0)]) == (30, 22)
    assert layer["buckets"][p[query.BUCKET_AT(0)]]["key"] == "less"


def test_a_pole_the_plan_moves_keeps_its_buses(con):
    """The 25 m is a floor on identity, never a ceiling: the id comes first.

    A pole the plan stands 84 m down the block keeps its stop id, keeps its
    cross-free dot, and has a dashed leader drawn to where it goes. Summing
    only what falls inside 25 m would read it as losing every bus -- a dot
    painted "loses all service" with no cross on it and a line pointing at the
    stop that serves it. `is_removed_stop`'s rule, at this unit.
    """
    layer = query.change_layer(con, query.PRIMARY_RADIUS)
    by_id = {p[query.ID_AT]: p for p in layer["points"]}
    moved = layer["moved"]
    assert moved, "no moved poles at all"

    for point_id, metres in moved.items():
        if metres <= query.STOP_SAME_POLE_M:
            continue
        stop_id = point_id.split(":", 1)[1]
        runs = con.execute(
            "SELECT SUM(n) AS n FROM departures WHERE side = 'proposed' "
            "AND stop_id = ? AND day = 'weekday'", (stop_id,)).fetchone()["n"]
        if runs:
            assert by_id[point_id][query.STOP_PROP_AT(0)] >= runs, point_id


def test_the_colour_is_the_kerbs_own_answer_not_the_walk_radiuss(con):
    """The wire's bucket is computed from the two numbers beside it.

    An off-by-one in these indices recolours the whole map without changing a
    number on the server, so the index is checked against `bucket()` run on the
    row's own trips -- which is also the assertion that the colour and the
    tooltip cannot drift apart, since they now read the same two fields.
    """
    layer = query.change_layer(con, query.PRIMARY_RADIUS)
    keys = [b["key"] for b in layer["buckets"]]
    for p in layer["points"]:
        assert keys[p[query.BUCKET_AT(0)]] == query.bucket(
            p[query.STOP_CUR_AT(0)], p[query.STOP_PROP_AT(0)])


def test_the_published_location_buckets_are_untouched_by_the_map(con):
    """What the map draws stopped being what `docs/answers/` publishes.

    The `change` table is still the walk radius's answer at both radii, still
    row-for-row the CSV's (the test above this one), and still what
    `point_boardings` and the published shares are computed over. The layer no
    longer ships it: a reader counting dots in the key is counting stops, not
    the locations `data/coverage_change.csv` measures, and the two differ by
    more than rounding -- 1,363 stops lose every weekday bus at their own kerb
    against 633 locations that lose all service within 400 m.

    Anything quoting one at the other is the mistake this test exists to name.
    """
    layer = query.change_layer(con, query.PRIMARY_RADIUS)
    keys = [b["key"] for b in layer["buckets"]]
    stored = {r["point_id"]: r["bucket"] for r in con.execute(
        "SELECT point_id, bucket FROM change WHERE radius = ? AND day = 'weekday'",
        (query.PRIMARY_RADIUS,))}

    drawn = sum(1 for p in layer["points"]
                if keys[p[query.BUCKET_AT(0)]] == "gone")
    published = sum(1 for b in stored.values() if b == "gone")
    assert published == 633
    assert drawn > published * 2

    differ = sum(1 for p in layer["points"]
                 if p[query.ID_AT] in stored
                 and keys[p[query.BUCKET_AT(0)]] != stored[p[query.ID_AT]])
    assert differ > 1000, differ


def test_change_points_are_the_same_set_at_both_radii(con):
    """Convention 4 only works if the two radii describe the same places."""
    at = {r: {row["point_id"] for row in con.execute(
        "SELECT DISTINCT point_id FROM change WHERE radius = ?", (r,))}
        for r in query.RADII}
    assert at[400] == at[150]


def test_unpublished_points_have_no_stop_of_their_own_today(con):
    """What an unpublished point claims, stated as the rule that builds it.

    It claims the plan puts a stop on a kerb no stop stands on -- no current
    pole within `STOP_SAME_POLE_M`, convention 3's renumbering carve-out. It
    does NOT claim the ground is newly served: until 2026-09-08 the two were
    the same assertion, because the distance was the access radius, and this
    test asserted `cur_trips == 0`. It cannot any more, and that is the point
    of the change rather than a regression in it. A point 30 m from a busy
    stop is a real new pole on ground that already has a bus, and the bucket
    says so.
    """
    rows = con.execute(
        "SELECT lat, lon FROM change WHERE published = 0 AND radius = ? "
        "AND day = 'weekday'", (query.PRIMARY_RADIUS,)).fetchall()
    assert rows, "no new-coverage points at all -- change_points() found none"
    for r in rows:
        assert not query.stops_within(con, r["lat"], r["lon"],
                                      query.STOP_SAME_POLE_M, "current")


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
    """The numbers the plan's defenders quote, at the published unit.

    A weekday LOCATION that loses all service carries 580 of the system's
    73,408 daily boardings -- 0.8%. That figure is the strongest thing anyone
    can say for the plan and it is drawn from PRT's own usage extract, so it is
    pinned the way the bucket counts are: if it moves, either the usage join
    broke or the buckets did.

    Read off the `change` table rather than the map layer, and that is the
    point of this test's existence beside the next one. The layer stopped
    carrying this unit when Stop-by-stop moved to the kerb; nothing else did.
    """
    boardings = query.point_boardings(con)
    total = gone = 0.0
    for r in con.execute("SELECT point_id, bucket FROM change "
                         "WHERE radius = ? AND day = 'weekday'",
                         (query.PRIMARY_RADIUS,)):
        riders = boardings.get(r["point_id"], {}).get("weekday")
        if riders is None:
            continue
        total += riders
        if r["bucket"] == "gone":
            gone += riders
    assert round(total) == 73408
    assert round(gone) == 580


def test_the_map_weighs_a_different_and_much_larger_share(con):
    """And the map's own Riders reading is now an order of magnitude bigger.

    6,515 of the same 73,408 boardings -- 8.9% -- are at a stop whose own kerb
    loses every weekday bus, against the 0.8% at a location that loses all
    service within a 400 m walk. Both are true and they are not each other:
    the gap is precisely the riders who can walk to another stop.

    This is convention 10's "never quote one alone" landing inside a single
    legend, and it is why the key has to name its unit. A screenshot of 8.9%
    captioned with the published sentence would be a serious misquote, and so
    would the reverse.
    """
    layer = query.change_layer(con, query.PRIMARY_RADIUS)
    day = query.DAYS.index("weekday")
    keys = [b["key"] for b in layer["buckets"]]
    total = gone = 0.0
    for p in layer["points"]:
        riders = p[query.RIDERS_AT(day)]
        if riders is None:
            continue
        total += riders
        if keys[p[query.BUCKET_AT(day)]] == "gone":
            gone += riders
    assert round(total) == 73408
    assert round(gone) == 6515


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


def test_every_dot_carries_the_name_of_the_pole_it_is_drawn_at(con):
    """A dot is a pole, and until 2026-09-10 the map could not say which.

    The name was reachable only by clicking, which drew the pin's marks -- so
    the pole's name, its id and the metres the plan moved it were on screen
    only while a pin was down, and the same pixel said different things
    depending on whether one was. Max asked for the two readings to be the same
    reading. That needs the name on the wire.

    It is a fixed field rather than a parallel array because the row is the
    format's own unit: a second list aligned by position would be one
    reordering away from naming every dot after its neighbour. The names cost
    65 KB gzipped, 15 of which came back when the radius trip counts left the
    row: 205 KB against 155 KB before either change.
    """
    layer = query.change_layer(con, query.PRIMARY_RADIUS)
    assert layer["fields"][query.NAME_AT] == "name"

    named = {p[query.ID_AT]: p[query.NAME_AT] for p in layer["points"]}
    assert all(isinstance(n, str) and n for n in named.values())

    for point_id, name in list(named.items())[:50]:
        side, stop_id = point_id.split(":", 1)
        row = con.execute(
            "SELECT name FROM stops WHERE side = ? AND stop_id = ?",
            ("current" if side == "c" else "proposed", stop_id)).fetchone()
        assert name == row["name"]


def test_a_pole_the_plan_shifts_says_so_without_a_pin(con):
    """The dashed leader is drawn for 225 poles; the metres were pin-only.

    Same rule as the leader itself (`moved_pole`): the stop id kept, and the
    plan standing the pole more than `STOP_MOVED_M` from where it stands
    today. Sparse, because 225 of 6,765 is not a column.

    It is keyed on the published point, `c:<stop_id>`, and that is not a slip.
    A pole whose id the plan keeps is never a point of its own on the proposed
    side -- `is_new_place` rules the id out before it ever measures a distance
    -- so the only dot that can carry the sentence is the one drawn where the
    pole stands today. Which is also the honest place for it: the dot is
    today's kerb, and what it now says is that the plan does not leave it
    there.
    """
    layer = query.change_layer(con, query.PRIMARY_RADIUS)
    moved = layer["moved"]
    assert 200 < len(moved) < 260

    for point_id, metres in list(moved.items())[:25]:
        assert point_id.startswith("c:")
        stop_id = point_id.split(":", 1)[1]
        row = con.execute(
            "SELECT lat, lon FROM stops WHERE side = 'proposed' AND stop_id = ?",
            (stop_id,)).fetchone()
        assert query.moved_pole(con, stop_id, row["lat"], row["lon"])[0] == metres


def test_the_identity_radius_is_not_the_access_radius(con):
    """Two different questions, and they stopped sharing a number on 2026-09-08.

    Access asks how far a rider will walk; the mark asks whether the plan is
    adding a stop here. Whatever distance settles the second, it must stay
    independent of the walk radius the caller asks for -- a point set that
    moved with the radius would stop describing the same places at 400 m and
    150 m.

    Since 2026-09-10 the distance is `STOP_SAME_POLE_M`, 25 m, and it is no
    longer a location radius at all: it is convention 3's mirror, the
    renumbered-kerb carve-out, because Max ruled that location is not the
    stop-by-stop view's unit. `is_removed_stop` asks at the same 25 m, so both
    marks are decided by one distance and neither can appear without the other
    being able to.
    """
    assert query.STOP_SAME_POLE_M == 25
    assert query.STOP_SAME_POLE_M != query.PRIMARY_RADIUS

    ids = {p[0] for p in query.change_points(con)}
    at_400 = {p[0] for p in query.change_points(con, dedup=query.PRIMARY_RADIUS)}
    assert at_400 < ids

    # Selecting at whatever radius was asked for is the thing that must not
    # happen: both radii describe one point set.
    assert ids == {p[0] for p in query.change_points(con, 150)}

    published = {p for p in ids if p.startswith("c:")}
    assert published == {p for p in at_400 if p.startswith("c:")}


def test_the_panel_says_which_proposed_stops_stand_where_none_stands_today(con):
    """The mark is on the map; the panel that explains a dot has to know it too.

    Same rule and same constant as the point universe -- the plan's own id,
    then no current pole within `STOP_SAME_POLE_M` -- so the panel cannot say a
    stop is new while the map draws it as an infill of an existing one, or the
    reverse.
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
            con, s["lat"], s["lon"], query.STOP_SAME_POLE_M, "current")
        assert s["new_place"] is (not near)

    # One-sided, like boardings: a stop that runs today stands where a stop
    # stands today, so the question is not asked of that side.
    assert all("new_place" not in s for s in at["current"]["stops"])


def test_the_panel_says_how_far_the_plan_moves_a_pole_it_keeps(con):
    """A kept stop the plan nudges down the block draws as two marks.

    `is_new_place` already refuses to call it new, because the plan kept the
    id. But the mark for today's pole and the mark for the proposed one are
    painted at their own coordinates, so a 20 m nudge splits them apart on
    screen and the reader is owed the reason. The distance ships with the
    proposed stop, together with where its own pole stands today, so the map
    can draw the leader between them.
    """
    # Northview Heights: the plan keeps 1772 and 1797 and moves both a few
    # metres up Mt Pleasant Road.
    at = query.place(con, 40.48314, -80.00339, 400)
    moved = {s["stop_id"]: s for s in at["proposed"]["stops"]
             if s.get("moved_m") is not None}

    assert "1772" in moved, "the plan moved this pole"
    assert moved["1772"]["moved_m"] == 21
    assert not moved["1772"]["new_place"], "a moved pole is not a new place"

    for s in moved.values():
        today = query.stops_within(
            con, s["moved_lat"], s["moved_lon"], 1.0, "current")
        assert s["stop_id"] in {t[0] for t in today}, (
            "the coordinates the leader points at are that stop's own pole")
        assert s["moved_m"] >= query.STOP_MOVED_M

    # One-sided in the same way `new_place` is: the question is what the plan
    # did to a pole, so it is asked of the plan's side only.
    assert all("moved_m" not in s for s in at["current"]["stops"])

    # And a stop the plan leaves where it is says nothing at all, rather than
    # reporting a zero the map would have to filter out again.
    kept = [s for s in at["proposed"]["stops"] if s["stop_id"] == "1773"]
    assert kept and kept[0].get("moved_m") is None


# --------------------------------------------------------------------------
# the stop's own fate, beside what happens to the service around it
# --------------------------------------------------------------------------
#
# Two questions at one dot, and they are not the same question. The colour is
# `bucket()` -- what happens to the buses within a walk of here -- and the mark
# is this: does the stop itself survive. They disagree constantly and both
# readings are true. On a weekday at 400 m, 675 of the stops the plan removes
# still have buses within the radius: 206 read "less service", 165 "about the
# same", 192 "more" and 43 "doubled or better". A stop can be taken away on a
# corridor that gains service, and only saying one of those would mislead.


def test_a_renumbered_stop_is_not_drawn_as_removed(con):
    """The plan reissuing an id at the same kerb is not a stop going away.

    1,406 ids that run today are absent from the plan, and 98 of them have a
    stop the plan serves within `STOP_SAME_POLE_M` -- the same kerb under a new
    number. Counting those as removals would put a red X on three of Downtown's
    busiest kerbs. The PRTX stations are the sharpest case: PRT renumbers them
    wholesale, and the replacement stands a couple of metres away.
    """
    for old, new in (("23101", "8681"),      # Ross Street PRTX Station
                     ("23102", "20684"),     # Market Square PRTX Station
                     ("23112", "20287")):    # East Busway + Penn Station
        row = con.execute("SELECT lat, lon FROM stops WHERE side = 'current' "
                          "AND stop_id = ?", (old,)).fetchone()
        assert row, f"{old} is not in the current feed -- fixture changed"
        assert not con.execute("SELECT 1 FROM stops WHERE side = 'proposed' "
                               "AND stop_id = ?", (old,)).fetchone()
        assert con.execute("SELECT 1 FROM stops WHERE side = 'proposed' "
                           "AND stop_id = ?", (new,)).fetchone()
        assert query.is_removed_stop(con, old, row["lat"], row["lon"]) is False


def test_a_pole_the_plan_drops_is_marked_removed(con):
    """A retired id the plan does not stop at is a removal, however near a bus is.

    > Max, 2026-09-10: "if it's a retired stop that is not simply moved, it
    > should be marked as removed. The user can infer a nearby stop by looking
    > at the map."

    Before that ruling the cross asked at 150 m, so a pole the
    plan retired while serving another kerb 74 m up the street drew no mark of
    its own at all -- the reader saw an ordinary coloured dot, and the only
    thing saying the stop was going was a ring that was not there. The two West
    View poles below are the case Max was looking at. Each is absent from the
    proposed feed, each has a stop the plan serves well inside 150 m, and each
    must now be crossed.
    """
    for stop_id, nearest_m in (("1670", 95), ("1672", 74)):
        row = con.execute("SELECT lat, lon FROM stops WHERE side = 'current' "
                          "AND stop_id = ? LIMIT 1", (stop_id,)).fetchone()
        assert row, f"{stop_id} is not in the current feed -- fixture changed"
        near = query.stops_within(con, row["lat"], row["lon"], 150, "proposed")
        assert near, f"{stop_id} has nothing proposed within 150 m any more"
        assert min(n[4] for n in near) == pytest.approx(nearest_m, abs=5)
        assert query.is_removed_stop(
            con, stop_id, row["lat"], row["lon"]) is True


def test_a_stop_prt_kept_the_id_of_is_never_removed(con):
    """The mirror of `is_new_place`'s first rule, and it must stay a mirror.

    PRT keeping an id is the agency saying "this is that stop", and it outranks
    the distance guess in BOTH directions: 18627 (Hwy Rt 286 + Royal Oak Dr)
    comes back 178 m away named for a different cross street, and 20918
    (Churchill Rd + Holland) 152 m away. Neither is a stop the plan adds, and
    neither is a stop the plan takes away.
    """
    shared = [r for r in con.execute(
        "SELECT s.stop_id, s.lat, s.lon FROM stops s WHERE s.side = 'current' "
        "AND s.stop_id IN (SELECT stop_id FROM stops WHERE side = 'proposed')")]
    assert shared, "no ids in common -- the fixture cannot test this"
    for r in shared:
        assert query.is_removed_stop(con, r["stop_id"], r["lat"], r["lon"]) is False


def test_no_corner_is_both_removed_and_added(con):
    """One threshold decides both marks, so a corner can never carry both.

    This is the whole reason `is_removed_stop` mirrors `is_new_place` instead
    of being written independently. If the two ever took different constants, a
    renumbering would draw a red X and a hollow ring on top of each other --
    "the plan takes this stop away" and "the plan adds a stop here", at one
    kerb, both in the key. The pair held the two constants apart between
    2026-09-10's two rulings, and 58 renumberings sat in exactly that position;
    with one distance again the count is zero by construction.
    """
    removed = [r for r in con.execute(
        "SELECT stop_id, lat, lon FROM stops WHERE side = 'current'")
        if query.is_removed_stop(con, r["stop_id"], r["lat"], r["lon"])]
    assert removed, "no removals at all -- the fixture cannot test this"

    new_places = {p[0][2:] for p in query.change_points(con) if p[3] == 0}
    for r in removed:
        near = {s[0] for s in query.stops_within(
            con, r["lat"], r["lon"], query.STOP_SAME_POLE_M, "proposed")}
        assert not (near & new_places), (
            f"{r['stop_id']} would draw removed and added at one corner")


def test_the_removed_mark_is_independent_of_the_walk_radius(con):
    """A stop's identity does not depend on how far a reader will walk.

    The colour under the mark moves with the radius toggle -- that is what the
    toggle is for -- but the mark must not, or the same kerb would be "removed"
    at 150 m and not at 400 m, which is a statement about the reader rather
    than about the plan.
    """
    layers = {r: query.change_layer(con, radius=r) for r in (400, 150)}
    at = {r: {p[query.ID_AT]: p[query.REMOVED_AT] for p in lay["points"]}
          for r, lay in layers.items()}
    assert at[400] and at[400].keys() == at[150].keys()
    assert at[400] == at[150]


# --------------------------------------------------------------------------
# the kerb the panel now leads with
# --------------------------------------------------------------------------

def test_the_panel_can_answer_for_the_kerb_the_dot_was_drawn_at(con):
    """The click and the hover must print the same two numbers.

    Stop-by-stop moved to the kerb on 2026-09-10 in its colour, its tooltip
    and its key, and the panel a click opened went on headlining the buses
    within a 400 m walk: 1,591 -> 2,178 at a downtown dot whose own kerb
    carries 167. `kerb_service` is the panel's half of that move, and it has
    to agree with `kerb_departures` exactly -- it is the same unit reached
    from a coordinate rather than from a point id.
    """
    kerbs = query.kerb_departures(con)
    points = {p[0]: p for p in query.change_points(con)}
    sample = [p for p in points.values() if p[3] == 1][:200]
    assert sample

    for point_id, lat, lon, _published in sample:
        got = query.kerb_service(con, lat, lon)
        assert got is not None, point_id
        for day in query.DAYS:
            want = kerbs[point_id][day]
            here = (got["current"]["days"][day]["trips"],
                    got["proposed"]["days"][day]["trips"])
            assert here == want, f"{point_id} {day}: {here} != {want}"


def test_the_kerb_answer_is_smaller_than_the_walk_it_sits_inside(con):
    """The two blocks on the panel are different units, and say so.

    At the dot beside the click that started this, the kerb carries a small
    fraction of what stands within a quarter mile of it -- which is the whole
    reason both are on screen with their own labels.
    """
    kerb = query.kerb_service(con, 40.44531, -79.99173)
    walk = query.side_at_place(con, "current", 40.44531, -79.99173,
                               query.PRIMARY_RADIUS)
    assert kerb["current"]["days"]["weekday"]["trips"] * 5 < \
        walk["days"]["weekday"]["trips"]


def test_a_point_with_no_pole_on_it_has_no_kerb_to_report(con):
    """Null, not an empty kerb.

    A reader clicking the middle of a park is not standing at a stop that
    lost every bus -- they are standing where no stop is. Zero trips "at this
    stop" would be a finding about a stop that does not exist, so the panel
    is told there is nothing to lead with and falls back to the walk radius.
    """
    lat, lon = 40.4406, -79.9490   # Schenley Park
    assert query.stops_within(con, lat, lon, query.STOP_SAME_POLE_M,
                              "current") == []
    assert query.kerb_service(con, lat, lon) is None


def test_the_kerb_pools_its_poles_where_the_location_maxes_its_cluster(con):
    """Two poles on one corner are one kerb, and their buses add up.

    `cluster_trips` takes the richest stop per (route, direction) because a
    location's cluster records the same route at several stops. Inside 25 m
    that is not what a duplicate means: a trip calls at one pole, and 34 of
    the duplicated (route, direction) pairs on the sampled kerbs carry
    different times at each. So the kerb sums, which is exactly what
    `kerb_departures` does and what makes a consolidation read as one.
    """
    by_stop = {"a": {("61A", "in"): [400, 500]},
               "b": {("61A", "in"): [430, 530]}}
    assert sum(query.kerb_trips(by_stop, ["a", "b"]).values()) == 4
    assert sum(query.cluster_trips(by_stop, ["a", "b"]).values()) == 2
    assert query.kerb_by_direction(by_stop, ["a", "b"])["in"] == [400, 430,
                                                                 500, 530]


def test_the_kerbs_periods_add_up_to_its_headline(con):
    """Nothing falls between the period table and the number above it."""
    kerb = query.kerb_service(con, 40.44531, -79.99173)
    for side in query.SIDES:
        for day in query.DAYS:
            got = kerb[side]["days"][day]
            assert round(sum(got["periods"].values())) == got["trips"]


def test_the_kerb_names_the_poles_prt_names(con):
    """A headline that says "at this stop" has to say which stop."""
    kerb = query.kerb_service(con, 40.44531, -79.99173)
    assert kerb["names"] and all(n for n in kerb["names"])
    assert kerb["stop_id"]
    assert all(s["stop_id"] for s in kerb["current"]["stops"])


def test_the_panel_carries_the_kerb_beside_the_walk_radius(con):
    """Additive: the published location answer keeps its own place."""
    p = query.place(con, 40.44531, -79.99173, query.PRIMARY_RADIUS)
    assert p["kerb"]["current"]["days"]["weekday"]["trips"] \
        != p["current"]["days"]["weekday"]["trips"]
    assert p["radius"] == query.PRIMARY_RADIUS
