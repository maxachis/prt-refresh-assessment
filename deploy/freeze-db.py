"""Make a freshly built refresh.db servable with no writable sidecar.

`build_webdb.py` writes WAL, which is the right mode for a builder. A *served*
copy is frozen -- nothing writes it between deploys -- but a read-only SQLite
connection to a WAL database still writes the `-shm` wal-index, so serving it as
built would mean giving the web service write access to its own data directory
for no behavioural gain. Checkpointing the WAL back into the file and switching
to a plain rollback journal removes the sidecars, which is what lets
`prt-refresh-web.service` run with nothing writable at all.

Standard library, like the rest of the pipeline. Run by deploy/provision.sh:

    python3 deploy/freeze-db.py /var/lib/prt-refresh/refresh.db
"""
from __future__ import annotations

import sqlite3
import sys
from pathlib import Path


def freeze(path: Path) -> str:
    con = sqlite3.connect(path)
    try:
        con.execute("PRAGMA wal_checkpoint(TRUNCATE)")
        mode = con.execute("PRAGMA journal_mode=DELETE").fetchone()[0]
    finally:
        con.close()
    return mode


def main(argv=None) -> int:
    args = sys.argv[1:] if argv is None else argv
    if len(args) != 1:
        print(__doc__.strip().splitlines()[-1].strip(), file=sys.stderr)
        return 2

    db = Path(args[0])
    mode = freeze(db)
    if mode != "delete":
        print(f"{db}: journal mode is {mode!r}, expected 'delete' -- the service "
              "will need a writable data directory", file=sys.stderr)
        return 1

    leftovers = [p for p in (db.with_name(db.name + "-wal"),
                             db.with_name(db.name + "-shm")) if p.exists()]
    for p in leftovers:
        p.unlink()
    print(f"  {db.name}: journal_mode=delete, "
          f"{db.stat().st_size / 1e6:.1f} MB, no sidecars")
    return 0


if __name__ == "__main__":
    sys.exit(main())
