# Two deploys at once collide on the database build

Two sessions ran `deploy/provision.sh` within a minute of each other on
2026-09-11 and both built `refresh.db.new` on the box at once; one died with
`sqlite3.OperationalError: database is locked`, the other's driver was cut off
by its own timeout and left an orphaned build running for 24 minutes. Open;
nothing in the script knows another run exists.

## What happened

Max had a second session deploying the access-log commit (`e7c8dcd`) while
this one deployed the one-direction row (`3c8af63`). Both ran the remote
half of `provision.sh`, which checks out the ref and then runs
`build_webdb.py --out /var/lib/prt-refresh/refresh.db.new` — the same path
from both. The first to finish checkout started writing; the second opened
the same file and got the lock error, and `set -euo pipefail` ended its run
before `systemctl restart`. The other session's local script hit a 590 s
`timeout` while the build was still going, which killed the ssh but not the
build: the box kept running `build_webdb.py` (PID 339447) at 100% CPU with
nobody left to freeze, swap in or restart. The service stayed on the
previous day's process (`ExecMainStartTimestamp=2026-09-10 18:50:11 UTC`)
with a newer checkout under it.

> Stated by Max; not verifiable from the repo: "I had another session
> running a deployment at the same time."

Compounding it, the build had also become slow — `3c8af63` added a full
GROUP BY over `departures` per `days_of_service` call, about 210,000 calls
per build — so the window in which two deploys could overlap grew from a few
minutes to an hour. That is fixed and committed (`ae40b9e`, memoised); this
entry is about the missing guard, which is there at any build length.

## Why it matters

The box is left in the state the OOM entry describes
([the-deploy-box-runs-out-of-memory-building-the-database.md](the-deploy-box-runs-out-of-memory-building-the-database.md)):
checkout advanced, database not rebuilt, old process serving. And the second
runner cannot tell: a re-run takes the no-op branch (right commit checked
out, database present, service answering) and says nothing is to do — see
[provision-reports-deployed-when-the-box-did-nothing.md](provision-reports-deployed-when-the-box-did-nothing.md).

## Approaches

The obvious guard is a lock on the box — `flock` on a file under
`/var/lib/prt-refresh` around the build-and-swap section, so a second run
either waits or fails loudly with "another deploy is building". Building to
a per-run temp name (`refresh.db.$$`) would stop the lock error but not the
orphan, so the lock is the one that addresses both. Not decided; Max's call
whether the second run should wait or refuse.

Recovery this time: I killed the orphaned build once its driver was
confirmed dead, then `FORCE=1 ./deploy/provision.sh` rebuilt and restarted
cleanly (`d14d0e2` live at 09:58 UTC).
