#!/usr/bin/env python3
"""
Who gains and who loses: the plan's coverage change weighted by people, for the
six BASE_CAMP EQUITY-* questions (race, age, income, vehicle access,
disability, language).

THE THIRD DENOMINATOR

analyze_coverage_change.py answers the five coverage tiers at 5,751 LOCATIONS
that have a bus stop today, each counting once. analyze_coverage_area.py
answers them over SPACE, where a square kilometre of hillside counts like a
square kilometre of Brookline. This script answers the same five tiers at
33,131 RESIDENTIAL points -- the interior point of every populated census
block in the three counties PRT stops in -- and weights each by the people who
live there.

The three are complements, not rivals, and the existing rule that area and
location figures are quoted together (CLAUDE.md convention 10) extends to this
one. Population answers "how many people", not "how much of the county", and
not "how many bus stops". Where they disagree the disagreement is the finding:
a redesign that concentrates service on dense corridors will look worse by area
than by population, and that is exactly what "ridership over coverage" means.

COVERAGE IS A FRACTION, NOT A FLAG

Demographics come from the block group (ACS publishes nothing usable below it,
and 2020 block counts carry differential-privacy noise that would wreck a
subgroup count). Coverage comes from the blocks inside it. So a block group is
not covered or uncovered: it is the SHARE of its 2020 residents living in a
block that clears the tier, and each group's population is multiplied by that
share.

This is what the blocks are for and the only thing they are used for, and it
was worth doing: 31% of Allegheny residents live in a block group whose centre
sits within 150 m of the 400 m threshold in one network or the other, so that
share of the county was being rounded wholly in or wholly out on the strength
of a single point.

The correction did not go the way the coarse figures suggested it would. One
point per block group put 51.9% of Allegheny residents within 400 m of a bus
today and the plan at -3.6 points; across the blocks it is 53.3% and -3.9
points. Both moved UP. A population-weighted centroid is pulled toward wherever
a block group is densest, which in the outer county is a subdivision set back
from the road the bus runs on -- so the coarse unit was missing real coverage
at the edges, and missing the losses along those same edges, which is where a
plan that trims coverage does its trimming. The centroid method understated the
county both ways. Section A prints both so the size of the correction stays
visible.

Losses and gains are counted per block, never as proposed-minus-current: one
block group can gain at one end and lose at the other, and a net would report
neither.

THE SERVICE TEST IS THE ONE ALREADY IN USE

A residential point is treated as a location, and the test applied to it is
imported from analyze_coverage_change.py rather than restated: the same
per-route-direction cluster rule, the same 6am-6pm maximum-gap definition of
hourly, the same 400 m headline radius and 150 m sensitivity, the same five
tiers, both networks through gtfs.load_service. A rider stands in a place and
walks to whatever is within R; that is as true at a house as at a stop id.

The stop universe here is every stop with a departure in each network's own
feed, matching analyze_coverage_area.py rather than analyze_coverage_change.py
-- the ridership-record filter exists to attach boardings to a location, and no
boardings are used here.

WHAT THIS CANNOT SEE

  * A census block is still covered or not at a single point, so the same
    rounding survives one level down -- but a populated block here is a few
    hundred metres across against a 400 m walk radius, where a block group was
    routinely larger than the radius itself. The residual is small and no
    longer one-sided.

  * Which of a block group's residents belong to a group is not known. A
    group's population is spread across its block group's blocks in proportion
    to the 2020 population, so if a neighbourhood's Black residents live
    disproportionately at the end of it that keeps its bus, this will not see
    it. This is the sharpest remaining limit, and no published source fixes it
    without block-level demographics that 2020's privacy noise makes unusable.

  * This is an ECOLOGICAL measure. It says coverage changed for the places
    where the members of a group live, not for those individuals. Everyone in
    a block group is treated as sharing its composition.

  * ACS margins of error at block-group level are wide -- for a small subgroup
    in one block group, routinely tens of percent. They are not carried
    through here. Aggregated to a whole race or age group across 1,062
    Allegheny block groups the sampling error is small, but any single block
    group's row in the CSV should be read as an estimate, not a count. Groups
    whose county-wide universe falls under MIN_UNIVERSE are flagged
    `too_small_to_quote` and dropped from the disproportion table entirely.

  * Disability and language are published only at tract level and were shared
    out among each tract's block groups by population in ingest_census.py.
    Their figures therefore assume a uniform rate within the tract, and are
    coarser than the other four.

  * Coverage is not service quality: clearing WEEK-ANY-MINIMUM means one bus a
    week. Section D reports population-weighted trips per day alongside, which
    is the honest companion to a tier that a rider cannot live on.

Run ingest_blr.py and ingest_census.py first.
    Usage: python3 analyze_equity_change.py
        -> data/equity_block_groups.csv, data/equity_change.csv,
           data/equity_frequency.csv
"""

import csv
from collections import defaultdict
from pathlib import Path

import gtfs
from gtfs import DAYS, SAMPLE
from analyze_frequency_change import Grid, PRIMARY, RADII, period_of, to_axis
from analyze_coverage_change import (TIERS, cluster_trips,
                                     departures_by_direction, hourly,
                                     tier_value)
from ingest_census import DIMENSIONS

DATA = Path("data")

# Everyone, as a comparison row: a group's change means little until you can
# see whether the region moved the same way.
REGION = "all_residents"
REGION_HOUSEHOLDS = "all_households"

PEOPLE, HOUSEHOLDS = "people", "households"

# --------------------------------------------------------------------------
# Denominators. Which one you divide by decides the headline, so all three are
# written out and the choice is visible rather than buried.
#
# Two thirds of the three-county population lives where PRT has never run a
# bus -- almost all of Beaver and Westmoreland, and the outer edges of
# Allegheny. Dividing by that would report every change as small and say more
# about county lines than about the plan. So:
#
#   allegheny    every block group in Allegheny County, PRT's taxing district
#                and the only county it serves at scale. THE HEADLINE.
#   served       every block group with any bus at its centre in EITHER
#                network, any county -- the population actually at stake, and
#                the right denominator for "who bears the losses".
#   three_county everything the feeds touch. Published for completeness; it is
#                the number that looks smallest, and quoting it alone would be
#                a way of making the change disappear.
# --------------------------------------------------------------------------

ALLEGHENY, SERVED, THREE_COUNTY = "allegheny", "served", "three_county"
HEADLINE_SCOPE = ALLEGHENY

# Below this many people or households in the denominator, a group's result is
# arithmetic on a handful of block groups and must not be quoted. Allegheny has
# 187 Pacific Islander and 628 Native American residents by this table; a
# single block group flipping moves either by several percentage points, and
# the disproportion ratio it produces looks exactly like a finding. The rows
# stay in the CSV -- deleting them would be its own distortion -- carrying a
# `too_small_to_quote` flag, and the printed tables mark them.
MIN_UNIVERSE = 5_000


def in_scope(row, scope):
    if scope == ALLEGHENY:
        return row["county"] == "Allegheny"
    if scope == SERVED:
        return (row["cur_week_any_minimum"] > 0
                or row["prop_week_any_minimum"] > 0)
    return True


SCOPES = [ALLEGHENY, SERVED, THREE_COUNTY]


def weights():
    """[(question, group, universe, column)] -- every population to report on.

    The region rows come first so that each dimension's groups can be read
    against them, and so the printed tables have their denominator on top.
    """
    out = [("REGION", REGION, PEOPLE, "race_total"),
           ("REGION", REGION_HOUSEHOLDS, HOUSEHOLDS, "income_total")]
    for d in DIMENSIONS:
        for group in d["groups"]:
            out.append((d["question"], group, d["universe"], group))
    return out


def load_block_groups():
    path = DATA / "census_block_groups.csv"
    if not path.exists():
        raise SystemExit(f"{path} is missing -- run: python3 ingest_census.py")
    rows = []
    with open(path, encoding="utf-8", newline="") as f:
        for r in csv.DictReader(f):
            for k, v in r.items():
                if k not in ("geoid", "tract_geoid", "county"):
                    r[k] = float(v)
            rows.append(r)
    return rows


def load_blocks():
    """{block group: [(population, lat, lon), ...]} -- where its residents are."""
    path = DATA / "census_blocks.csv"
    if not path.exists():
        raise SystemExit(f"{path} is missing -- run: python3 ingest_census.py")
    blocks = defaultdict(list)
    with open(path, encoding="utf-8", newline="") as f:
        for r in csv.DictReader(f):
            blocks[r["block_group_geoid"]].append(
                (int(r["population"]), float(r["lat"]), float(r["lon"])))
    return blocks


def load_side(which):
    """One network's service, stop coordinates and per-period counts."""
    feed = gtfs.current() if which == "current" else gtfs.proposed()
    svc = gtfs.load_service(feed, SAMPLE[which],
                            period_of=period_of, to_axis=to_axis)
    return svc, {d: svc.counts(d, period_of) for d in DAYS}


def build_grid(svc, radius):
    """Every stop with a departure on any day, indexed for radius lookups."""
    grid = Grid(radius)
    served = {sid for d in DAYS for sid in svc.times[d]}
    for sid in sorted(served):
        if sid in svc.coords:
            grid.add(*svc.coords[sid], sid)
    return grid, served


def measure(svc, period_counts, stop_ids):
    """Tier flags and daily trip totals at one point in one network."""
    flags, trips = {}, {}
    for day in DAYS:
        per = cluster_trips(period_counts[day], stop_ids)
        by_dir = departures_by_direction(svc.times[day], stop_ids)
        trips[day] = sum(per.values())
        flags[day] = (trips[day], hourly(by_dir))
    tiers = {label: int(tier_value(flags, days, want_hourly))
             for label, days, want_hourly in TIERS}
    return tiers, trips


def at_point(lat, lon, gcur, gprop, cur, cur_counts, prop, prop_counts):
    """Both networks' tiers and trips at one lat/lon."""
    cur_tiers, cur_trips = measure(cur, cur_counts, list(gcur.within(lat, lon)))
    prop_tiers, prop_trips = measure(prop, prop_counts,
                                     list(gprop.within(lat, lon)))
    return cur_tiers, prop_tiers, cur_trips, prop_trips


def evaluate(block_groups, blocks, cur, cur_counts, prop, prop_counts):
    """Attach both networks' tiers and trips to every block group, per radius.

    A tier is not a flag here but a FRACTION: the share of the block group's
    2020 residents who live in a census block whose interior point clears it.
    A block group straddling the edge of a walk radius therefore contributes
    the part of itself that is genuinely covered, instead of being rounded
    wholly in or wholly out at one centroid.

    Losses and gains are counted per block rather than derived from the two
    fractions, because a single block group can do both at once -- one end
    picking up a new route while the other loses its old one -- and
    proposed-minus-current would net those out and report neither.
    """
    for radius in RADII:
        sfx = "" if radius == PRIMARY else f"_{radius}m"
        gcur, _ = build_grid(cur, radius)
        gprop, _ = build_grid(prop, radius)
        for row in block_groups:
            evaluate_one(row, blocks.get(row["geoid"], ()), sfx,
                         gcur, gprop, cur, cur_counts, prop, prop_counts)
    return block_groups


def evaluate_one(row, blocks, sfx, gcur, gprop, cur, cur_counts,
                 prop, prop_counts):
    """One block group: its residents' coverage, weighted across its blocks."""
    covered = {label: defaultdict(float) for label, _d, _h in TIERS}
    trips = {side: defaultdict(float) for side in ("cur", "prop")}
    people = sum(n for n, _lat, _lon in blocks)

    for n, lat, lon in blocks:
        cur_tiers, prop_tiers, cur_trips, prop_trips = at_point(
            lat, lon, gcur, gprop, cur, cur_counts, prop, prop_counts)
        for label, _days, _h in TIERS:
            c, p = cur_tiers[label], prop_tiers[label]
            covered[label]["cur"] += n * c
            covered[label]["prop"] += n * p
            covered[label]["lost"] += n * (c and not p)
            covered[label]["gained"] += n * (p and not c)
        for day in DAYS:
            trips["cur"][day] += n * cur_trips[day]
            trips["prop"][day] += n * prop_trips[day]

    for label, _days, _h in TIERS:
        key = label.replace("-", "_").lower()
        for side in ("cur", "prop", "lost", "gained"):
            row[f"{side}_{key}{sfx}"] = round(
                covered[label][side] / people if people else 0.0, 4)
    if sfx:
        return
    for day in DAYS:
        for side in ("cur", "prop"):
            row[f"{side}_{day}_trips"] = round(
                trips[side][day] / people if people else 0.0, 1)
    # The one-point-per-block-group answer, kept for section A's comparison:
    # it is what this script measured before the blocks were brought in, and
    # the gap between the two is the size of the error they removed.
    cur_tiers, prop_tiers, _c, _p = at_point(
        row["lat"], row["lon"], gcur, gprop, cur, cur_counts, prop, prop_counts)
    for label, _days, _h in TIERS:
        key = label.replace("-", "_").lower()
        row[f"point_cur_{key}"] = cur_tiers[label]
        row[f"point_prop_{key}"] = prop_tiers[label]


# --------------------------------------------------------------------------
# reporting: every figure below is a sum of (people in group) x (0 or 1)
# --------------------------------------------------------------------------

SIDES = {"now": "cur", "proposed": "prop", "lost": "lost", "gained": "gained"}


def tally(block_groups, column, tier_key, sfx):
    """Population of one group on each side of one tier, and the movers.

    Each block group contributes its group population times the SHARE of its
    residents who clear the tier -- so a group living in a block group that is
    two thirds covered contributes two thirds of itself, not all or none. The
    share is measured on 2020 block populations; the group population is an ACS
    estimate. Mixing the two assumes a group is distributed within its block
    group the same way the population at large is, which is the same
    within-unit uniformity this method rests on throughout.
    """
    t = {"total": 0.0, "now": 0.0, "proposed": 0.0, "lost": 0.0, "gained": 0.0}
    for row in block_groups:
        n = row[column]
        if not n:
            continue
        t["total"] += n
        for name, side in SIDES.items():
            t[name] += n * row[f"{side}_{tier_key}{sfx}"]
    return t


def pct(part, whole):
    return 100 * part / whole if whole else 0.0


def change_rows(block_groups):
    """The tidy EQUITY-* result: one row per group per tier per radius."""
    rows = []
    for scope in SCOPES:
        inside = [r for r in block_groups if in_scope(r, scope)]
        for radius in RADII:
            sfx = "" if radius == PRIMARY else f"_{radius}m"
            for label, _days, _h in TIERS:
                tier_key = label.replace("-", "_").lower()
                for question, group, universe, column in weights():
                    t = tally(inside, column, tier_key, sfx)
                    rows.append({
                        "scope": scope,
                        "question": question, "group": group,
                        "universe": universe, "tier": label, "radius_m": radius,
                        "total": round(t["total"]),
                        "covered_now": round(t["now"]),
                        "covered_proposed": round(t["proposed"]),
                        "net": round(t["proposed"] - t["now"]),
                        "pct_now": round(pct(t["now"], t["total"]), 1),
                        "pct_proposed": round(pct(t["proposed"], t["total"]), 1),
                        "pct_point_change": round(
                            pct(t["proposed"], t["total"])
                            - pct(t["now"], t["total"]), 1),
                        "lost": round(t["lost"]),
                        "gained": round(t["gained"]),
                        "pct_lost": round(pct(t["lost"], t["total"]), 2),
                        "pct_gained": round(pct(t["gained"], t["total"]), 2),
                        "too_small_to_quote": int(t["total"] < MIN_UNIVERSE),
                    })
    return rows


def frequency_rows(block_groups):
    """Population-weighted trips at home, per group: the tier's companion.

    The average member of a group has this many bus departures within 400 m of
    home. It is the answer to the objection that a tier is a low bar: a group
    can hold WEEK-ANY-MINIMUM on both sides and still lose half its buses.
    """
    rows = []
    for scope in SCOPES:
        inside = [r for r in block_groups if in_scope(r, scope)]
        rows += [frequency_row(inside, scope, *w) for w in weights()]
    return rows


def frequency_row(block_groups, scope, question, group, universe, column):
    """Trips within 400 m of home for the average member of one group."""
    total = sum(r[column] for r in block_groups)
    row = {"scope": scope, "question": question, "group": group,
           "universe": universe, "total": round(total)}
    for day in DAYS:
        for side in ("cur", "prop"):
            weighted = sum(r[column] * r[f"{side}_{day}_trips"]
                           for r in block_groups)
            row[f"{side}_{day}_trips"] = round(
                weighted / total if total else 0.0, 1)
        row[f"net_{day}_pct"] = round(
            pct(row[f"prop_{day}_trips"] - row[f"cur_{day}_trips"],
                row[f"cur_{day}_trips"]), 1)
    return row


def universe_report(block_groups):
    """Section A: the three denominators, and the coverage rate in each."""
    print("\nA. The universe, and the three denominators")
    print(f"  {'scope':<14s} {'block groups':>13s} {'residents':>12s} "
          f"{'households':>12s} {'with a bus now':>16s}")
    for scope in SCOPES:
        inside = [r for r in block_groups if in_scope(r, scope)]
        people = sum(r["race_total"] for r in inside)
        served = sum(r["race_total"] * r["cur_week_any_minimum"]
                     for r in inside)
        print(f"  {scope:<14s} {len(inside):>13,} {people:>12,.0f} "
              f"{sum(r['income_total'] for r in inside):>12,.0f} "
              f"{pct(served, people):>15.1f}%")
    by_county = defaultdict(float)
    for r in block_groups:
        by_county[r["county"]] += r["race_total"]
    print("  residents by county: "
          + "   ".join(f"{c}: {n:,.0f}" for c, n in sorted(by_county.items())))
    print(f"  Sections B-D below use the {HEADLINE_SCOPE} denominator; "
          "the CSV carries all three.")
    block_vs_point(block_groups)


def block_vs_point(block_groups):
    """What the blocks bought: the same tiers measured both ways.

    `point` is one test at the block group's population-weighted centre, the
    whole block group rounded in or out by it. `blocks` distributes the same
    test across its populated census blocks. The gap is the error the coarser
    unit was carrying -- and it is one-sided, because a block group whose
    centre falls outside a walk radius still has residents inside it far more
    often than the reverse.
    """
    inside = [r for r in block_groups if in_scope(r, HEADLINE_SCOPE)]
    print(f"\n  What the census blocks changed ({HEADLINE_SCOPE}, 400 m): "
          "one point per block group, against 33k blocks")
    print(f"    {'tier':<22s} {'point now':>10s} {'blocks now':>11s} "
          f"{'point chg':>10s} {'blocks chg':>11s}")
    for label, _days, _h in TIERS:
        key = label.replace("-", "_").lower()
        people = sum(r["race_total"] for r in inside)
        pt = {side: sum(r["race_total"] * r[f"point_{side}_{key}"]
                        for r in inside) for side in ("cur", "prop")}
        bl = {side: sum(r["race_total"] * r[f"{side}_{key}"]
                        for r in inside) for side in ("cur", "prop")}
        print(f"    {label:<22s} {pct(pt['cur'], people):>9.1f}% "
              f"{pct(bl['cur'], people):>10.1f}% "
              f"{pct(pt['prop'], people) - pct(pt['cur'], people):>+9.1f}pp "
              f"{pct(bl['prop'], people) - pct(bl['cur'], people):>+10.1f}pp")


def tier_report(rows):
    """Section B: how much of each group clears each tier, before and after."""
    for label, _days, _h in TIERS:
        print(f"\nB. {label}   ({HEADLINE_SCOPE}; 400 m, "
              f"and the 150 m change in brackets)")
        print(f"  {'group':<28s} {'universe':>11s} {'now':>7s} {'proposed':>9s} "
              f"{'change':>8s} {'lost':>9s} {'gained':>9s}")
        for question, group, universe, _column in weights():
            wide = pick(rows, group, label, PRIMARY)
            tight = pick(rows, group, label, RADII[1])
            small = " (too small to quote)" if wide["too_small_to_quote"] else ""
            print(f"  {group:<28s} {wide['total']:>11,} "
                  f"{wide['pct_now']:>6.1f}% {wide['pct_proposed']:>8.1f}% "
                  f"{wide['pct_point_change']:>+7.1f}pp "
                  f"{wide['lost']:>9,} {wide['gained']:>9,}"
                  f"   [{tight['pct_point_change']:+.1f}pp]{small}")


def pick(rows, group, tier, radius, scope=HEADLINE_SCOPE):
    for r in rows:
        if (r["group"] == group and r["tier"] == tier
                and r["radius_m"] == radius and r["scope"] == scope):
            return r
    raise KeyError((group, tier, radius, scope))


def disparity_report(rows):
    """Section C: each group's loss rate against the region's, FTA-style.

    The ratio is the group's share losing a tier divided by everyone's share
    losing it. Above 1 means the losses fall disproportionately on that group;
    it is a screening statistic, not a legal finding, and PRT sets its own
    disparate-impact threshold under Title VI.

    Groups too small to quote are left out entirely rather than shown with a
    caveat: a ratio of 1.48 built from fourteen people reads as a finding no
    matter what is printed beside it.

    The gain ratio is printed beside the loss ratio and is not decoration. A
    group concentrated where the network is being restructured shows a high
    ratio on BOTH -- more of its members lose a tier and more of them gain one,
    because the plan is doing more to the places they live. Black residents on
    the weekend-hourly tier are exactly that case: 1.40 on losses, and a larger
    net gain than any other group. Quoting the loss ratio alone would describe
    churn as harm.
    """
    print(f"\nC. Disproportion ({HEADLINE_SCOPE}): share of each group losing "
          "a tier, against everyone's share")
    print(f"  {'group':<28s} {'tier':<22s} {'lost':>7s} {'region':>7s} "
          f"{'ratio':>6s} {'gain ratio':>11s} {'net':>8s}")
    for label, _days, _h in TIERS:
        region = {u: pick(rows, g, label, PRIMARY)
                  for u, g in ((PEOPLE, REGION), (HOUSEHOLDS, REGION_HOUSEHOLDS))}
        for question, group, universe, _column in weights():
            if question == "REGION":
                continue
            r = pick(rows, group, label, PRIMARY)
            if r["too_small_to_quote"]:
                continue
            base = region[universe]
            ratio = ratio_of(r["pct_lost"], base["pct_lost"])
            gain_ratio = ratio_of(r["pct_gained"], base["pct_gained"])
            mark = "  <--" if ratio >= 1.2 and r["lost"] else ""
            print(f"  {group:<28s} {label:<22s} {r['pct_lost']:>6.2f}% "
                  f"{base['pct_lost']:>6.2f}% {ratio:>6.2f} {gain_ratio:>11.2f} "
                  f"{r['pct_point_change']:>+7.1f}pp{mark}")


def ratio_of(group_pct, region_pct):
    return group_pct / region_pct if region_pct else 0.0


def frequency_report(rows):
    print(f"\nD. Trips per day within 400 m of home, weighted by population "
          f"({HEADLINE_SCOPE})")
    print(f"  {'group':<28s} {'weekday now':>12s} {'proposed':>10s} "
          f"{'change':>8s} {'Sat change':>11s} {'Sun change':>11s}")
    for r in [r for r in rows if r["scope"] == HEADLINE_SCOPE]:
        print(f"  {r['group']:<28s} {r['cur_weekday_trips']:>12,.1f} "
              f"{r['prop_weekday_trips']:>10,.1f} "
              f"{r['net_weekday_pct']:>+7.1f}% "
              f"{r['net_saturday_pct']:>+10.1f}% "
              f"{r['net_sunday_pct']:>+10.1f}%")


def write(path, rows):
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print(f"Wrote {path} ({len(rows):,} rows)")


def main():
    print("Loading sources...")
    block_groups = load_block_groups()
    blocks = load_blocks()
    cur, cur_counts = load_side("current")
    prop, prop_counts = load_side("proposed")

    n_blocks = sum(len(v) for v in blocks.values())
    print(f"Measuring {n_blocks:,} populated census blocks across "
          f"{len(block_groups):,} block groups "
          f"at {', '.join(f'{r} m' for r in RADII)}...")
    evaluate(block_groups, blocks, cur, cur_counts, prop, prop_counts)

    universe_report(block_groups)
    rows = change_rows(block_groups)
    tier_report(rows)
    disparity_report(rows)
    freq = frequency_rows(block_groups)
    frequency_report(freq)

    print()
    write(DATA / "equity_block_groups.csv", block_groups)
    write(DATA / "equity_change.csv", rows)
    write(DATA / "equity_frequency.csv", freq)
    print("\nNOTE: coverage is measured at each block group's population-weighted\n"
          "      centre, so a block group is covered or not as a whole; "
          "demographics\n      are ACS 5-year estimates with wide block-group "
          "margins of error; and\n      this is an ecological measure -- it "
          "describes the places a group lives,\n      not its individual members. "
          "Quote it beside the location and area\n      figures, never alone.")


if __name__ == "__main__":
    main()
