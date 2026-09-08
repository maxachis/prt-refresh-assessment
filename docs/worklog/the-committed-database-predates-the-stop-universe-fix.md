# The committed database predates the stop-universe fix

`data/refresh.db` was built before 478fe27 widened the measured universe to
every stop a bus calls at, so it still holds the pre-fix bucket counts — 593
weekday locations losing all service where `data/coverage_change.csv` now
publishes 633.

Open, not fixed. Found 2026-09-08 while running the suite for an unrelated
change; three tests in `tests/test_query.py` fail on a clean checkout, and have
nothing to do with whatever change is being tested.

## Evidence

```bash
uv run pytest -q tests/test_query.py
# FAILED test_change_buckets_reproduce_the_published_counts
# FAILED test_change_table_agrees_with_the_csv_row_by_row
# FAILED test_boardings_reproduce_the_published_shares
```

The differences are the whole of the stop-universe fix, in the same direction
each time: weekday `gone` 593 against the published 633, `halved` 284 against
298, `doubled` 217 against 237, Saturday `doubled` 331 against 368, Sunday
`doubled` 373 against 438. Confirmed pre-existing by stashing the working tree
and re-running.

## Why it matters, and why it may not

The **deployed site is not affected**: `deploy/provision.sh` builds the
database on the box from the pushed commit, so what
<https://prt-refresh.lemaliconsulting.com> serves is rebuilt from the current
code. What is stale is the copy in the repo, which is what a clone gets and
what every local run of the app and the tests reads.

So the cost is not a wrong published number; it is that the repo's own
regression suite fails out of the box, which trains the next person to read
three red tests as normal. That is the failure mode worth naming: these three
exist precisely to make a drift between the served and the published numbers
loud, and a suite that is red before you start cannot do that.

## What is not yet decided

Whether `build_webdb.py` is re-run and the rebuilt database committed. It is
one command, but it is also the script the deploy box cannot always finish
(docs/worklog/the-deploy-box-runs-out-of-memory-building-the-database.md), and
the rebuilt file is a committed binary of some size. The alternative — teaching
the three tests to skip against a database older than `coverage_change.csv` —
buys a green suite at the price of the exact signal they exist to give, and the
agent rejects it for that reason.
