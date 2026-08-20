#!/usr/bin/env python3
"""
The population denominator: census geography and demographics for the six
BASE_CAMP EQUITY-* questions.

Everything else in this repo measures the plan against stops (a location) or
against ground (an area). Neither can say who is standing there. This script
fetches the one thing that can -- resident counts by race, age, income, vehicle
access, disability and language, attached to a point on the map -- so that
analyze_equity_change.py can run the identical coverage test at each of those
points and weight the answer by people.

WHY BLOCK GROUPS, AND WHY THESE POINTS

The unit is the 2020 census BLOCK GROUP, located at its POPULATION-WEIGHTED
CENTRE, not its geometric one. Both halves of that matter here:

  * Block group, not block: the Census publishes no centre-of-population file
    below block-group level, and 2020 block counts carry deliberate
    differential-privacy noise that is large relative to a small subgroup
    count. Block group is the finest honest unit for this.

  * Population-weighted, not geometric: Allegheny County's block groups wrap
    around hillsides, rivers and rail cuts. The geometric centre of one is
    routinely in the woods; the population-weighted centre sits where the
    houses are. Using the wrong one would put the test point up a hill from
    everybody it is meant to represent.

Using a point rather than a polygon is also what keeps this repo
standard-library-only -- no shapefile reader, no geometry library, and no
areal interpolation. The cost is that a block group is covered or not as a
single unit, at its centre. See analyze_equity_change.py for what that biases.

TWO GEOGRAPHIES, BECAUSE ACS PUBLISHES TWO

Race, age, income and vehicle access are published at block group. Disability
and language are not -- their smallest published geography is the tract. Rather
than pretend otherwise, each table is fetched at the finest level it exists at
and the level is recorded per table in the output. analyze_equity_change.py
then apportions a tract-level rate down to that tract's block groups by
population share, which assumes the rate is uniform within the tract; that
assumption is stated wherever a disability or language figure is quoted, and it
is not made for the four tables that do not need it.

CREDENTIALS, AND WHY RE-RUNNING THIS NEEDS NONE

The Census API now rejects unauthenticated requests (it answers "Missing Key"),
which would make this the first part of the pipeline that a re-runner cannot
reproduce. So every response is cached verbatim under data/raw/census/ and
committed, exactly as the Remix and GTFS pulls are. A clone re-runs from the
cache with no key at all; a key is needed only to fetch something not yet
cached. Supply it as CENSUS_API_KEY in the environment or in .env (gitignored).

The centre-of-population file needs no key at any time.

    Usage: python3 ingest_census.py
        -> data/raw/census/*, data/census_block_groups.csv
"""

import csv
import io
import json
import os
import urllib.parse
import urllib.request
import zipfile
from collections import defaultdict
from pathlib import Path

DATA = Path("data")
RAW = DATA / "raw" / "census"

UA = "prt-refresh-assessment (pro-bono transit analysis)"

# 2020 Census centres of population, Pennsylvania block groups. Plain CSV, no
# key, no geometry. The block/ sibling of this path does not exist.
CENPOP_URL = ("https://www2.census.gov/geo/docs/reference/cenpop2020/"
              "blkgrp/CenPop2020_Mean_BG42.txt")
CENPOP_FILE = "CenPop2020_Mean_BG42.txt"

# 2020 Census redistricting data, Pennsylvania. No key. This is where census
# BLOCKS come from -- the finest geography published, roughly a twentieth of a
# square kilometre each here, with a population and an interior point apiece.
# The blocks are used only to say WHERE INSIDE a block group its residents
# live, so that coverage can be weighted rather than decided all-or-nothing at
# one point. No demographic breakdown is taken from them: 2020 block counts
# carry deliberate differential-privacy noise, which is tolerable in a total
# used as a weight and is not tolerable in a subgroup count.
PL_URL = ("https://www2.census.gov/programs-surveys/decennial/2020/data/"
          "01-Redistricting_File--PL_94-171/Pennsylvania/pa2020.pl.zip")
PL_FILE = "pa2020.pl.zip"
PL_GEOHEADER = "pageo2020.pl"
PL_SEGMENT_1 = "pa000012020.pl"

# Pipe-delimited, no header row, positions fixed by the PL 94-171 spec. Named
# rather than sliced inline because a silently wrong offset here would put
# every block at the wrong coordinates and still produce a plausible answer.
GEO_SUMLEV, GEO_LOGRECNO, GEO_GEOCODE = 2, 7, 9
GEO_COUNTY, GEO_LAT, GEO_LON = 14, 92, 93
SEGMENT_LOGRECNO, SEGMENT_POPULATION = 4, 5
SUMLEV_BLOCK = "750"

ACS_YEAR = "2024"
ACS_DATASET = f"https://api.census.gov/data/{ACS_YEAR}/acs/acs5"

STATE_FIPS = "42"
# PRT stops fall in three counties; Beaver and Westmoreland hold a few dozen
# between them, all at the ends of long-haul routes.
COUNTIES = {"003": "Allegheny", "007": "Beaver", "129": "Westmoreland"}

BLOCK_GROUP = "block group"
TRACT = "tract"

# --------------------------------------------------------------------------
# What each EQUITY-* question reads, as ACS table cells.
#
# Cells are named rather than derived from the variable labels: the labels are
# long, punctuated and change wording between vintages, and a label-matching
# rule that silently stops matching would drop a category to zero without
# failing. Named cells are checkable against
# https://api.census.gov/data/2024/acs/acs5/groups/<TABLE>.json, and the
# universe assertion below catches a mistyped one.
# --------------------------------------------------------------------------

DIMENSIONS = [
    {
        "question": "EQUITY-RACE",
        "table": "B03002",          # Hispanic or Latino origin by race
        "level": BLOCK_GROUP,
        "universe": "people",
        "total": "B03002_001E",
        # Non-overlapping by construction: everyone Hispanic is counted once in
        # `hispanic` regardless of race, and the race categories are all
        # not-Hispanic. Summing them recovers the universe, which is why
        # B03002 and not B02001 is the standard table for this question.
        "groups": {
            "hispanic_or_latino": ["B03002_012E"],
            "white_nh": ["B03002_003E"],
            "black_nh": ["B03002_004E"],
            "native_american_nh": ["B03002_005E"],
            "asian_nh": ["B03002_006E"],
            "pacific_islander_nh": ["B03002_007E"],
            "other_race_nh": ["B03002_008E"],
            "two_or_more_nh": ["B03002_009E"],
        },
        "exhaustive": True,
    },
    {
        "question": "EQUITY-AGE",
        "table": "B01001",          # Sex by age
        "level": BLOCK_GROUP,
        "universe": "people",
        "total": "B01001_001E",
        # Male cells 003-006 and female 027-030 are under 18; male 020-025 and
        # female 044-049 are 65 and over; everything between is 18-64.
        "groups": {
            "under_18": ["B01001_003E", "B01001_004E", "B01001_005E",
                         "B01001_006E", "B01001_027E", "B01001_028E",
                         "B01001_029E", "B01001_030E"],
            "age_65_plus": ["B01001_020E", "B01001_021E", "B01001_022E",
                            "B01001_023E", "B01001_024E", "B01001_025E",
                            "B01001_044E", "B01001_045E", "B01001_046E",
                            "B01001_047E", "B01001_048E", "B01001_049E"],
        },
        "exhaustive": False,
    },
    {
        "question": "EQUITY-INCOME",
        "table": "B19001",          # Household income in the past 12 months
        "level": BLOCK_GROUP,
        "universe": "households",
        "total": "B19001_001E",
        "groups": {
            "income_under_25k": ["B19001_002E", "B19001_003E", "B19001_004E",
                                 "B19001_005E"],
            "income_25k_50k": ["B19001_006E", "B19001_007E", "B19001_008E",
                               "B19001_009E", "B19001_010E"],
            "income_50k_75k": ["B19001_011E", "B19001_012E"],
            "income_75k_100k": ["B19001_013E"],
            "income_100k_plus": ["B19001_014E", "B19001_015E", "B19001_016E",
                                 "B19001_017E"],
        },
        "exhaustive": True,
    },
    {
        "question": "EQUITY-VEHICLE",
        "table": "B25044",          # Tenure by vehicles available
        "level": BLOCK_GROUP,
        "universe": "households",
        "total": "B25044_001E",
        # Owner-occupied and renter-occupied with no vehicle available. The
        # journey-to-work table B08201 asks the same question of households but
        # is not published below tract, and this one is.
        "groups": {
            "zero_vehicle_households": ["B25044_003E", "B25044_010E"],
            "one_vehicle_households": ["B25044_004E", "B25044_011E"],
        },
        "exhaustive": False,
    },
    {
        "question": "EQUITY-DISABILITY",
        "table": "B18101",          # Sex by age by disability status
        "level": TRACT,
        "universe": "people",
        "total": "B18101_001E",
        # "With a disability" under each of the twelve sex-by-age branches.
        "groups": {
            "with_a_disability": ["B18101_004E", "B18101_007E", "B18101_010E",
                                  "B18101_013E", "B18101_016E", "B18101_019E",
                                  "B18101_023E", "B18101_026E", "B18101_029E",
                                  "B18101_032E", "B18101_035E", "B18101_038E"],
        },
        "exhaustive": False,
    },
    {
        "question": "EQUITY-LANGUAGE",
        "table": "C16002",          # Household language by limited English
        "level": TRACT,
        "universe": "households",
        "total": "C16002_001E",
        # One "limited English speaking household" cell per language group.
        "groups": {
            "limited_english_households": ["C16002_004E", "C16002_007E",
                                           "C16002_010E", "C16002_013E"],
        },
        "exhaustive": False,
    },
]

# ACS suppresses a cell it cannot publish with a large negative sentinel rather
# than a blank, and -666666666 summed into a total is a silent catastrophe.
ACS_NULL_FLOOR = -1e6


def api_key():
    """CENSUS_API_KEY from the environment, else from .env, else None.

    None is not an error: everything may already be cached, and the fetch below
    only needs a key on a miss.
    """
    key = os.environ.get("CENSUS_API_KEY")
    if key:
        return key.strip()
    env = Path(".env")
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            name, sep, value = line.partition("=")
            if sep and name.strip() == "CENSUS_API_KEY":
                return value.strip().strip("'\"")
    return None


def fetch(url, dest, *, headers=None):
    """Download url to dest unless already present. Returns dest."""
    dest = Path(dest)
    if dest.exists() and dest.stat().st_size > 0:
        return dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers=headers or {"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=180) as r, open(dest, "wb") as f:
        f.write(r.read())
    return dest


def acs_variables(dimension):
    """The cells one dimension needs, total first, deduplicated and ordered."""
    cells = [dimension["total"]]
    for group_cells in dimension["groups"].values():
        cells += [c for c in group_cells if c not in cells]
    return cells


def acs_url(dimension, county, key):
    """One ACS request: every cell of one table, one county, one geography."""
    level = dimension["level"]
    query = {
        "get": ",".join(acs_variables(dimension)),
        "for": f"{level}:*",
        "in": f"state:{STATE_FIPS} county:{county}"
        + (f" tract:*" if level == BLOCK_GROUP else ""),
    }
    if key:
        query["key"] = key
    return f"{ACS_DATASET}?" + urllib.parse.urlencode(query, safe=":*,")


def cache_name(dimension, county):
    level = dimension["level"].replace(" ", "")
    return f"acs5_{ACS_YEAR}_{dimension['table']}_{level}_{county}.json"


def fetch_acs(dimension, key):
    """{geoid: {cell: value}} for one table across the three counties.

    The geoid is the 12-digit block group id or the 11-digit tract id, which is
    what joins these rows to the centre-of-population file.
    """
    out = {}
    for county in COUNTIES:
        dest = RAW / cache_name(dimension, county)
        if not dest.exists() and not key:
            raise SystemExit(
                f"{dest} is not cached and no CENSUS_API_KEY is set.\n"
                "Put your key in .env as CENSUS_API_KEY=... (it is gitignored),\n"
                "or export it, then re-run.")
        fetch(acs_url(dimension, county, key), dest)
        header, *rows = json.loads(dest.read_text(encoding="utf-8"))
        index = {name: i for i, name in enumerate(header)}
        for row in rows:
            parts = [row[index["state"]], row[index["county"]],
                     row[index["tract"]]]
            if dimension["level"] == BLOCK_GROUP:
                parts.append(row[index["block group"]])
            out["".join(parts)] = {
                cell: acs_number(row[index[cell]])
                for cell in acs_variables(dimension)}
    return out


def acs_number(raw):
    """One ACS cell as a count, with suppression sentinels read as zero."""
    if raw in (None, "", "null"):
        return 0
    value = float(raw)
    return 0 if value <= ACS_NULL_FLOOR else value


def load_centroids():
    """Block groups in the three counties, at their population-weighted centres."""
    path = fetch(CENPOP_URL, RAW / CENPOP_FILE)
    rows = []
    with open(path, encoding="utf-8-sig", newline="") as f:
        for r in csv.DictReader(f):
            if r["STATEFP"] != STATE_FIPS or r["COUNTYFP"] not in COUNTIES:
                continue
            geoid = (r["STATEFP"] + r["COUNTYFP"] + r["TRACTCE"]
                     + r["BLKGRPCE"])
            rows.append({
                "geoid": geoid,
                "tract_geoid": geoid[:11],
                "county": COUNTIES[r["COUNTYFP"]],
                "population": int(r["POPULATION"]),
                "lat": float(r["LATITUDE"]),
                "lon": float(r["LONGITUDE"]),
            })
    return sorted(rows, key=lambda r: r["geoid"])


def load_blocks():
    """Populated census blocks in the three counties: where people actually are.

    Returned as {block_group_geoid: [(population, lat, lon), ...]}, which is
    the only shape anything downstream wants -- a block group's residents,
    distributed. Blocks with nobody in them are dropped, which is over half of
    them and most of the parsing time saved.

    The interior point is a geographic centroid, not a population-weighted one
    (the Census publishes no such file for blocks). At block scale the two are
    close enough not to matter: the whole block is typically far smaller than
    the 400 m walk radius being tested.
    """
    path = fetch(PL_URL, RAW / PL_FILE)
    with zipfile.ZipFile(path) as z:
        population = read_block_population(z)
        return read_block_geography(z, population)


def read_block_population(archive):
    """{logrecno: 2020 population} from segment 1's P0010001."""
    out = {}
    with archive.open(PL_SEGMENT_1) as f:
        for line in io.TextIOWrapper(f, encoding="latin-1"):
            parts = line.rstrip("\n").split("|")
            count = int(parts[SEGMENT_POPULATION])
            if count:
                out[parts[SEGMENT_LOGRECNO]] = count
    return out


def read_block_geography(archive, population):
    """Join the geoheader's blocks to their populations, filtered to our counties."""
    blocks = defaultdict(list)
    with archive.open(PL_GEOHEADER) as f:
        for line in io.TextIOWrapper(f, encoding="latin-1"):
            parts = line.rstrip("\n").split("|")
            if (parts[GEO_SUMLEV] != SUMLEV_BLOCK
                    or parts[GEO_COUNTY] not in COUNTIES):
                continue
            count = population.get(parts[GEO_LOGRECNO])
            if not count:
                continue
            # A block geoid is state+county+tract+block, and a block's group is
            # the first digit of its block number -- so the first 12 characters.
            blocks[parts[GEO_GEOCODE][:12]].append(
                (count, float(parts[GEO_LAT]), float(parts[GEO_LON])))
    return blocks


def write_blocks(blocks):
    out = DATA / "census_blocks.csv"
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["block_group_geoid", "population", "lat", "lon"])
        for geoid in sorted(blocks):
            for count, lat, lon in sorted(blocks[geoid], reverse=True):
                w.writerow([geoid, count, f"{lat:.6f}", f"{lon:.6f}"])
    total = sum(c for v in blocks.values() for c, _, _ in v)
    print(f"\nWrote {out} "
          f"({sum(len(v) for v in blocks.values()):,} populated blocks, "
          f"{total:,} residents, {len(blocks):,} block groups)")


def tract_population(centroids):
    """Block-group population summed to the tract, for apportioning tract rates."""
    totals = defaultdict(int)
    for r in centroids:
        totals[r["tract_geoid"]] += r["population"]
    return totals


def attach(centroids, dimension, values, tract_pop):
    """Write one dimension's counts onto every block group.

    A block-group table is joined directly. A tract table is shared out among
    the tract's block groups in proportion to 2020 population -- the uniform
    within-tract rate assumption named in the module docstring. It is applied
    here, once, so that nothing downstream has to know which tables needed it.
    """
    columns = [f"{dimension['question'].split('-')[1].lower()}_total"]
    total_column = columns[0]
    for r in centroids:
        if dimension["level"] == BLOCK_GROUP:
            cells = values.get(r["geoid"])
            share = 1.0
        else:
            cells = values.get(r["tract_geoid"])
            denominator = tract_pop.get(r["tract_geoid"], 0)
            share = r["population"] / denominator if denominator else 0.0
        cells = cells or {}
        r[total_column] = round(cells.get(dimension["total"], 0.0) * share, 2)
        for name, group_cells in dimension["groups"].items():
            r[name] = round(sum(cells.get(c, 0.0) for c in group_cells) * share, 2)
    columns += list(dimension["groups"])
    return columns


def report(centroids, dimension, columns):
    """Print the universe and its parts, so a mistyped cell cannot pass quietly."""
    total_column = columns[0]
    total = sum(r[total_column] for r in centroids)
    print(f"\n  {dimension['question']}  ({dimension['table']}, "
          f"{dimension['level']}, {dimension['universe']})")
    print(f"    {'universe':<32s} {total:>12,.0f}")
    parts = 0.0
    for name in columns[1:]:
        n = sum(r[name] for r in centroids)
        parts += n
        pct = 100 * n / total if total else 0
        print(f"    {name:<32s} {n:>12,.0f}  {pct:5.1f}%")
    if dimension["exhaustive"] and total:
        drift = abs(parts - total) / total
        flag = "" if drift < 0.005 else "   <-- CHECK THE CELL LIST"
        print(f"    {'(parts sum to)':<32s} {parts:>12,.0f}  "
              f"{100 * parts / total:5.1f}%{flag}")


def main():
    key = api_key()
    print(f"Census API key: {'found' if key else 'not set (cache only)'}")

    centroids = load_centroids()
    print(f"\nBlock groups: {len(centroids):,} in "
          f"{', '.join(COUNTIES.values())}; "
          f"2020 population {sum(r['population'] for r in centroids):,}")

    tract_pop = tract_population(centroids)
    columns = ["geoid", "tract_geoid", "county", "population", "lat", "lon"]
    for dimension in DIMENSIONS:
        values = fetch_acs(dimension, key)
        columns += attach(centroids, dimension, values, tract_pop)
        report(centroids, dimension, columns[-1 - len(dimension["groups"]):])

    write_blocks(load_blocks())

    out = DATA / "census_block_groups.csv"
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=columns)
        w.writeheader()
        w.writerows(centroids)
    print(f"\nWrote {out} ({len(centroids):,} rows)")
    print(f"\nNOTE: demographics are ACS {ACS_YEAR} 5-year estimates, carrying\n"
          "      margins of error that are wide at block-group level; geography\n"
          "      and the 2020 population are from the decennial census. Tract-level\n"
          "      tables (disability, language) are apportioned to block groups by\n"
          "      population share and assume a uniform rate within the tract.")


if __name__ == "__main__":
    main()
