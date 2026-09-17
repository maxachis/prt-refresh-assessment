"""`ingest_addresses.tidy_rows` -- filtering and deduping the county's raw
address points down to one row per building.

Pure and dict-in-dict-out (see the module docstring on `ingest_addresses.py`),
so these fixtures stand in for the 653,615-row extract without downloading
it. Three things could go wrong silently, and each gets its own test: a
non-active status leaking through, a unit-inside-a-building counted as its
own address, and two buildings that share one address number both surviving
the dedupe instead of collapsing to the lower `address_id`.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import ingest_addresses as ing  # noqa: E402


def row(address_id, *, parent_id="0", status="ACTIVE", num="118",
        num_suffix="", st_prefix="", st_name="ORR", st_type="AVE",
        municipality="HARMAR", zip_code="15238", lat="40.5421828",
        lon="-79.8116778"):
    """One raw county address-point row, as `csv.DictReader` would hand it."""
    return {
        "address_id": address_id, "parent_id": parent_id, "status": status,
        "addr_num": num, "addr_num_suffix": num_suffix,
        "st_prefix": st_prefix, "st_name": st_name, "st_type": st_type,
        "unit": "", "municipality": municipality, "zip_code": zip_code,
        "latitude": lat, "longitude": lon,
    }


def test_drops_a_non_active_status():
    rows = [row("1", status="ACTIVE"), row("2", status="RETIRE")]
    got = ing.tidy_rows(rows)
    assert [r["address_id"] for r in got] == ["1"]


def test_drops_a_child_row_inside_a_building():
    rows = [row("1", parent_id="0"), row("2", parent_id="1", num="118A")]
    got = ing.tidy_rows(rows)
    assert [r["address_id"] for r in got] == ["1"]


def test_dedupes_to_the_lowest_address_id():
    rows = [row("30"), row("10"), row("20")]
    got = ing.tidy_rows(rows)
    assert len(got) == 1
    assert got[0]["address_id"] == "10"


def test_a_suffix_row_stays_distinct_from_its_plain_neighbour():
    rows = [row("1", num_suffix=""), row("2", num_suffix="A")]
    got = ing.tidy_rows(rows)
    assert {r["address_id"] for r in got} == {"1", "2"}


def test_tidy_row_carries_the_ten_published_columns():
    got = ing.tidy_rows([row("1")])
    assert set(got[0]) == set(ing.TIDY_FIELDS)


def test_rounds_coordinates_to_the_sub_metre_and_no_further():
    # The county publishes 13+ decimals; six is ~0.1 m, finer than the
    # point placement itself, and cuts the committed tidy file by a third.
    got = ing.tidy_rows([row("1", lat="40.5421828403599", lon="-79.81167781195305")])
    assert (got[0]["lat"], got[0]["lon"]) == ("40.542183", "-79.811678")
