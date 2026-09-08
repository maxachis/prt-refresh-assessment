# A stale local database fails the tests as though the code broke

The app's database is a local build artifact, and when it falls behind the
published CSVs the three tests that compare served numbers to published ones go
red with no hint that the cause is an old build rather than a regression.

Fixed, awaiting close, for the instance that raised it: the local database was
rebuilt on 2026-09-08 and the suite is green. What is unfixed is that nothing
tells you which of the two you are looking at.

## What was observed

Found 2026-09-08 while running the suite for an unrelated change. Three tests
in `tests/test_query.py` failed — `test_change_buckets_reproduce_the_published_counts`,
`test_change_table_agrees_with_the_csv_row_by_row`,
`test_boardings_reproduce_the_published_shares` — and stashing the working tree
confirmed they had nothing to do with the change being tested.

The differences were the whole of the stop-universe fix (478fe27, which widened
the measured universe to every stop a bus calls at), in the same direction each
time: weekday `gone` 593 against the published 633, `halved` 284 against 298,
`doubled` 217 against 237, Saturday `doubled` 331 against 368, Sunday `doubled`
373 against 438. The database on disk had been built before that commit.

## The database is not committed, and that is the point

`data/refresh.db` is gitignored (`.gitignore:12`) and has never been tracked.
A clone therefore has no database at all, and the fixtures in
`tests/conftest.py` **skip** rather than fail — so the red suite was never
something a clean checkout could reproduce. It is purely a local-staleness
failure, reachable only by someone who built the database once and then pulled
a commit that changed what the numbers should be.

An earlier version of this entry asserted the opposite — that the stale copy
was committed and that a clean checkout fails. That was wrong, and the shape of
the error is worth keeping: the file sat in `data/` beside a dozen committed
CSVs, and "everything in `data/` is committed" (which `CLAUDE.md` says, of the
pipeline's outputs) was read as covering it without checking `git ls-files`.

The **deployed site was never affected**: `deploy/provision.sh` builds the
database on the box from the pushed commit, so <https://prt-refresh.lemaliconsulting.com>
has always served numbers rebuilt from current code.

## What was done

`python3 build_webdb.py` was re-run on 2026-09-08. It reproduced the published
weekday buckets exactly — `633 gone, 298 halved, 1420 less, 1583 same, 2113
more, 237 doubled` at 400 m, matching `data/coverage_change.csv` and matching
what the deploy box had already built. `uv run pytest -q` then passed 383
tests.

> Max decided on 2026-09-08 to rebuild rather than adapt the tests.

The alternative — teaching the three tests to skip against a database older
than `coverage_change.csv` — buys a green suite at the price of the exact
signal they exist to give, and the agent rejected it for that reason.

## What is left

Nothing tells you a database is stale. The three tests report a numeric
mismatch, which reads identically whether the code drifted from the published
CSVs or the build did — and the first reading sends you into `query.py` looking
for a bug that isn't there. A cheap fix exists and is not built: compare the
build's mtime (or a stamped source commit) against `data/coverage_change.csv`
and say so in the failure message. That is a message change, not a skip, so it
keeps the signal.
