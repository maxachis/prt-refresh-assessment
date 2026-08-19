import csv
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
DB = ROOT / "data" / "refresh.db"
COVERAGE = ROOT / "data" / "coverage_change.csv"


@pytest.fixture(scope="session")
def db_path():
    if not DB.exists():
        pytest.skip(f"{DB} not built -- run `python3 build_webdb.py`")
    return DB


@pytest.fixture(scope="session")
def con():
    from refresh import query
    if not DB.exists():
        pytest.skip(f"{DB} not built -- run `python3 build_webdb.py`")
    return query.connect(DB)


@pytest.fixture(scope="session")
def coverage_rows():
    if not COVERAGE.exists():
        pytest.skip(f"{COVERAGE} not built -- run analyze_coverage_change.py")
    with open(COVERAGE, encoding="utf-8") as f:
        return list(csv.DictReader(f))
