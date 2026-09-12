# One SQLite connection serves every request thread

The app opens `refresh.db` once and hands that single connection to every
request, which FastAPI runs on a thread pool — and under a page load's burst of
concurrent requests one of them read a `NOT NULL` column back as `None` and
returned a 500. Open — seen once on 2026-09-12, not reproduced on demand, and
not fixed because the session's task was the Route changes key.

## What is observed

`http://127.0.0.1:8765/?view=routes&route=c%3A17&routehide=new,reshaped`,
opened cold in a headless browser at 1440×900, which fires `/api/meta`,
`/api/destinations`, `/api/change?radius=400` and
`/api/route_changes?day=weekday` at once. The last returned 500:

```
  File ".../src/refresh/query.py", line 3082, in _route_group_service_rows
    "cur_hours": round(r["cur_hours"], 1),
TypeError: type NoneType doesn't define __round__ method
```

The column cannot be null — `route_group_service.cur_hours REAL NOT NULL` in
`build_webdb.py`, and the file agrees:

```
$ sqlite3 data/refresh.db "select count(*), sum(cur_hours is null) from route_group_service;"
324|0
```

The same request answered 200 with 108 groups four other times in the same
server's life, including immediately before and after, so the data is not the
problem; the moment is. Reloading the page answered correctly.

## Why

`query.connect` opens the file with `check_same_thread=False` and
`app.py:46` holds that one connection for the process. Starlette runs each
sync endpoint in a worker thread, so two endpoints iterate two cursors on the
same connection at the same time. SQLite itself serialises that, but Python's
`sqlite3` keeps a per-connection statement cache and resets or re-steps
statements underneath a cursor another thread is still reading from; a column
read off a statement that has been reset comes back as `NULL`, which is
exactly the shape of the failure. It is a race, so it depends on how many
requests land together and how long each takes: the route-group query walks
324 rows while `/api/change` is pulling half a megabyte, which is the widest
window a page load opens.

## Why it matters, and why it might not

Any endpoint can do this, not just the new one — it is the connection, not the
query. The symptom for a reader is a view that fails to load once and loads on
refresh, with nothing on screen saying why. Against urgency: it has been seen
once, in a burst a headless browser makes wider than a person's does, and the
deployed box has had no reader yet.

## Approaches considered

- **A connection per request**, opened in a dependency and closed after.
  Opening a read-only SQLite file is cheap, and it removes the shared state
  entirely; the cost is the pragmas and the row factory being set per request,
  and any cache the app keeps on the connection object being lost. Not done.
- **A thread-local connection** — one per worker thread, opened lazily. Same
  isolation, no per-request open. Not done.
- **A lock around every query.** Fixes the race by serialising the app, which
  is what the thread pool exists to avoid. Ruled out by me as the wrong
  trade; Max may disagree if simplicity wins.
