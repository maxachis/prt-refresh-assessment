"""Where the coverage losses land, on named ground.

`analyze_equity_change.py` answers the six EQUITY questions as county totals,
and a county total cannot be testified about. "2,376 car-free households in
Allegheny County lose all bus service near home" is true, it is the sharpest
number in the whole analysis, and it names nobody. This script says where those
households are.

It is worth doing because the losses are *concentrated*. Of Allegheny County's
1,062 block groups, 182 lose any coverage at all and 75 gain some; a hundred of
them hold 90% of the loss, and twenty-five hold 62% of the car-free-household
loss. A choropleth of the county would therefore be mostly a map of where
nothing happened, over which a reader would read Pittsburgh's existing
segregation as though it were the finding. A ranked list of named places is
both smaller and more use.

## Method

For each Allegheny block group, the share of its residents who lose (or gain)
each service tier is already computed, per block, by `analyze_equity_change.py`.
This multiplies that share by each demographic total to get people, then
attaches a place name and rolls the block groups up.

**Naming is the only new step, and it is the weak one.** PRT ships a `HOOD` and
a `MUNI` label per stop, and convention 6 of `CLAUDE.md` exists because those
fields contain stops mislabelled by up to 40 km. The labels therefore arrive
through `analyze_one_seat.py`'s outlier filter, which is the same cleaning the
place-level one-seat answer uses. A block group takes the label of the nearest
surviving labelled stop, and the distance to that stop is written to the CSV so
a reader can discount a name that came from a mile away. Beyond
`LABEL_RADIUS_M` a block group stays unnamed rather than borrowing a name it
has no claim to -- and it is still written out, because dropping it would make
the file stop reconciling to the county totals it is derived from.

Two things this deliberately does not do. It does not name a block group's
demographics as a cause: these are the places the plan changed, and who lives
in them, in that order. And it ranks on `WEEK-ANY-MINIMUM` -- losing every bus
-- rather than on a frequency tier, because that is the loss with no fallback
and the one a rider cannot work around by leaving earlier.

Output is `data/equity_places.csv`, one row per Allegheny block group that
changed, and a printed ranking by place.
"""
import csv
import sys
from collections import defaultdict
from pathlib import Path

import gtfs
from analyze_one_seat import build_grid, drop_outliers, load_labels, near

DATA = Path(__file__).resolve().parent / "data"
SOURCE_CSV = DATA / "equity_block_groups.csv"
OUT_CSV = DATA / "equity_places.csv"
TOTALS_CSV = DATA / "equity_place_totals.csv"

COUNTY = "Allegheny"

# The tier this ranks on: any bus at all, any day. See the docstring.
TIER = "week_any_minimum"

# How far a block group's population-weighted centre may sit from the nearest
# labelled stop and still take its name. Generous, because the centre of an
# outer-suburb block group is routinely set back from the road the bus runs on
# -- and paired with a written-out distance, so a stretched name is visible
# rather than silent.
LABEL_RADIUS_M = 2_000

# The suffix PRT's MUNI field appends. The type word ("township", "borough")
# stays: Ross township and Ross are not interchangeable on a comment form.
MUNI_SUFFIX = " (Allegheny, PA)"

# The demographic totals carried through, as (output prefix, source column).
# Only groups above the analysis's 5,000-person quoting threshold appear.
STAKES = [
    ("residents", "race_total"),
    ("black", "black_nh"),
    ("age_65_plus", "age_65_plus"),
    ("under_18", "under_18"),
    ("low_income", "income_under_25k"),
    ("zero_vehicle", "zero_vehicle_households"),
    ("disability", "with_a_disability"),
    ("limited_english", "limited_english_households"),
]
SIDES = ["lost", "gained"]

# Below this many people or households a place-level figure is noise dressed as
# a finding, the same reasoning as MIN_UNIVERSE in analyze_equity_change.py.
REPORT_TOP = 25


def tidy(place):
    """A place name as a reader would write it on a comment form."""
    return (place or "").removesuffix(MUNI_SUFFIX).strip()


def label_grid(points):
    """Index (lat, lon, place) triples for nearest-label lookup."""
    return build_grid(points, LABEL_RADIUS_M)


def label_for(lat, lon, grid):
    """The nearest labelled stop's place and its distance, or (None, None)."""
    hits = near(lat, lon, grid, LABEL_RADIUS_M, LABEL_RADIUS_M)
    if not hits:
        return None, None
    distance, place = min(hits, key=lambda h: h[0])
    return place, distance


def locate(block_groups, grid):
    """One row per Allegheny block group the plan changed, on named ground."""
    out = []
    for bg in block_groups:
        if bg["county"] != COUNTY:
            continue
        shares = {side: float(bg[f"{side}_{TIER}"]) for side in SIDES}
        if not any(shares.values()):
            continue
        lat, lon = float(bg["lat"]), float(bg["lon"])
        place, distance = label_for(lat, lon, grid)
        row = {"geoid": bg["geoid"], "place": tidy(place),
               "place_distance_m": round(distance) if distance else "",
               "lat": lat, "lon": lon,
               "population": float(bg["population"])}
        for prefix, column in STAKES:
            for side in SIDES:
                row[f"{prefix}_{side}"] = float(bg[column]) * shares[side]
        out.append(row)
    return out


def by_place(located):
    """Block groups rolled up to their place, biggest net loss first."""
    grouped = defaultdict(list)
    for row in located:
        grouped[row["place"]].append(row)

    rolled = []
    for place, rows in grouped.items():
        entry = {"place": place, "block_groups": len(rows),
                 "population": sum(r["population"] for r in rows)}
        for prefix, _ in STAKES:
            for side in SIDES:
                key = f"{prefix}_{side}"
                entry[key] = sum(r[key] for r in rows)
        entry["residents_net"] = entry["residents_gained"] - entry["residents_lost"]
        rolled.append(entry)
    return sorted(rolled, key=lambda e: e["residents_net"])


def place_totals(block_groups, grid):
    """[{place, block_groups, residents, lat, lon}] -- every named place's own size.

    The denominator, and it needs a file of its own because `OUT_CSV` cannot
    carry it. That file holds only the block groups the plan *changed*, so its
    `population` column is the population of a place's changed part -- and it
    is the 2020 decennial count besides, where every loss here is weighted by
    ACS `race_total`. Reserve township is the case that makes the mismatch
    unarguable: 1,430 in that column against 1,629 residents lost. Dividing one
    by the other would print a share above 100% under a straight face.

    So this walks *all* of Allegheny's block groups through the same labelling
    `locate` uses -- the same grid, the same radius, the same nearest surviving
    labelled stop -- and sums the same ACS universe the losses are weighted by.
    A share built from the two is then residents of one place measured one way.

    Two deliberate carry-overs from `locate`. Block groups beyond
    `LABEL_RADIUS_M` are totalled under "" rather than dropped, so a consumer
    listing only named places can state its residual instead of quietly losing
    it. And other counties are skipped, because the loss side never asked
    there and a denominator with no numerator is worse than no answer.

    The centre is population-weighted. A place has no boundary anywhere in this
    repo -- that is objection 2 in
    `docs/worklog/the-place-number-has-no-view-of-its-own.md` -- so a view that
    wants to put a place on screen has only its residents to aim at, and an
    unweighted mean of block-group points would pull a borough towards
    whichever half the census happened to cut into more pieces.
    """
    grouped = defaultdict(list)
    for bg in block_groups:
        if bg["county"] != COUNTY:
            continue
        lat, lon = float(bg["lat"]), float(bg["lon"])
        place, _ = label_for(lat, lon, grid)
        grouped[tidy(place)].append((lat, lon, float(bg["race_total"])))

    totals = []
    for place, rows in grouped.items():
        people = sum(r[2] for r in rows)
        weight = people or len(rows)
        totals.append({
            "place": place,
            "block_groups": len(rows),
            "residents": people,
            "lat": sum(r[0] * (r[2] or 1) for r in rows) / weight,
            "lon": sum(r[1] * (r[2] or 1) for r in rows) / weight,
        })
    return sorted(totals, key=lambda t: (-t["residents"], t["place"]))


# --------------------------------------------------------------------------
# loading, writing, reporting
# --------------------------------------------------------------------------

def load_block_groups():
    if not SOURCE_CSV.exists():
        sys.exit(f"missing {SOURCE_CSV} -- run analyze_equity_change.py first")
    with open(SOURCE_CSV, encoding="utf-8") as f:
        return list(csv.DictReader(f))


def load_place_labels():
    """PRT's HOOD/MUNI labels, outlier-filtered, on current stop coordinates."""
    _, coords = gtfs.stop_routes(gtfs.current(), bus_only=False)
    label, _ = load_labels()
    label, dropped = drop_outliers(label, coords)
    print(f"  {len(label)} labelled stops "
          f"({len(dropped)} dropped as mislabelled)")
    return [(*coords[sid], place) for sid, place in label.items()
            if sid in coords]


def read_located(path=OUT_CSV):
    """The written CSV back as numbers, so `by_place` can roll it up again.

    This is what lets the brief render the place tables without reloading two
    GTFS feeds and re-deriving the labels: the rollup is a pure function of
    what this script already published.
    """
    if not path.exists():
        sys.exit(f"missing {path} -- run analyze_equity_places.py first")
    numeric = {"population", "lat", "lon"} | {
        f"{prefix}_{side}" for prefix, _ in STAKES for side in SIDES}
    with open(path, encoding="utf-8") as f:
        return [{k: (float(v or 0) if k in numeric else v)
                 for k, v in row.items()}
                for row in csv.DictReader(f)]


def write_totals(totals):
    fields = ["place", "block_groups", "residents", "lat", "lon"]
    with open(TOTALS_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in totals:
            writer.writerow({k: _rounded(k, v) for k, v in row.items()})


def write(located):
    fields = (["geoid", "place", "place_distance_m", "lat", "lon", "population"]
              + [f"{prefix}_{side}" for prefix, _ in STAKES for side in SIDES])
    with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in sorted(located, key=lambda r: -r["residents_lost"]):
            writer.writerow({k: _rounded(k, v) for k, v in row.items()})


# Latitude and longitude are the exception to the tenth-of-a-person rounding
# below: one decimal of latitude is about 11 km, which would put a block group
# in the wrong municipality while still looking precise enough to map.
COORDINATES = ("lat", "lon")
COORD_DP = 6
COUNT_DP = 1


def _rounded(field, value):
    if not isinstance(value, float):
        return value
    return round(value, COORD_DP if field in COORDINATES else COUNT_DP)


def table(rolled, key, title, unit):
    """Print the places holding the most of one kind of loss."""
    ranked = sorted((e for e in rolled if e[f"{key}_lost"] >= 1),
                    key=lambda e: -e[f"{key}_lost"])[:REPORT_TOP]
    total = sum(e[f"{key}_lost"] for e in rolled)
    shown = sum(e[f"{key}_lost"] for e in ranked)
    print(f"\n{title}")
    print(f"  {len(ranked)} places holding {shown:,.0f} of "
          f"{total:,.0f} {unit} ({shown / total:.0%})\n")
    print(f"    {'place':34s} {'lost':>8s} {'gained':>8s}  block groups")
    for entry in ranked:
        print(f"    {entry['place'] or '(unnamed)':34s} "
              f"{entry[f'{key}_lost']:8,.0f} {entry[f'{key}_gained']:8,.0f}"
              f"  {entry['block_groups']:>4d}")


def main():
    print("Loading place labels from PRT's stop usage extract...")
    grid = label_grid(load_place_labels())

    print("Locating coverage change...")
    located = locate(load_block_groups(), grid)
    unnamed = [r for r in located if not r["place"]]
    stretched = [r for r in located
                 if r["place_distance_m"] and r["place_distance_m"] > 1_000]
    print(f"  {len(located)} Allegheny block groups changed on {TIER}")
    print(f"  {len(unnamed)} took no name (>{LABEL_RADIUS_M} m from a "
          f"labelled stop); {len(stretched)} named from over 1 km away")

    write(located)
    print(f"  wrote {OUT_CSV.relative_to(DATA.parent)}")

    print("Totalling every place, changed or not...")
    totals = place_totals(load_block_groups(), grid)
    named = [t for t in totals if t["place"]]
    residual = sum(t["residents"] for t in totals if not t["place"])
    print(f"  {len(named)} named places hold "
          f"{sum(t['residents'] for t in named):,.0f} residents; "
          f"{residual:,.0f} live beyond {LABEL_RADIUS_M} m of a labelled stop")
    write_totals(totals)
    print(f"  wrote {TOTALS_CSV.relative_to(DATA.parent)}")

    rolled = by_place(located)
    table(rolled, "zero_vehicle",
          "Where car-free households lose every bus", "households")
    table(rolled, "age_65_plus",
          "Where residents aged 65+ lose every bus", "residents")
    table(rolled, "residents", "Where anyone loses every bus", "residents")

    gained = sorted(rolled, key=lambda e: -e["residents_gained"])[:10]
    print("\nWhere the plan adds a bus to ground that has none")
    print(f"    {'place':34s} {'gained':>8s} {'lost':>8s}")
    for entry in gained:
        print(f"    {entry['place'] or '(unnamed)':34s} "
              f"{entry['residents_gained']:8,.0f} {entry['residents_lost']:8,.0f}")


if __name__ == "__main__":
    main()
