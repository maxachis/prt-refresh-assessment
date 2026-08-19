import csv
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent

# The pipeline scripts live at the repo root and are not an installed package.
# test_surface.py imports analyze_coverage_area to check that the app's lattice
# is the same lattice the published area figures were measured on -- which is
# only a real check if it reaches the actual script.
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

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
