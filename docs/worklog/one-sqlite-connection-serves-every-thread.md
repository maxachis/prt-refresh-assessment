# One SQLite connection serves every request thread

The app used to open `refresh.db` once and hand that single connection to
every request, which FastAPI runs on a thread pool — and under a page load's
burst of concurrent requests one of them read a `NOT NULL` column back as
`None` and returned a 500. Fixed, awaiting close — since 2026-09-12 each
worker thread opens its own connection (Max's call, the second approach
below), and a burst test pins it.

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

It was not rare once asked for: sixteen requests fired together through the
test client against the shared connection failed every run, with a different
symptom each time — `IndexError: tuple index out of range` inside a row read
in one, the `None` above in another. That burst is now
`tests/test_web.py::test_a_burst_of_concurrent_requests_all_answer`.

## Why

`query.connect` opens the file with `check_same_thread=False` and
`app.py:46` held that one connection for the process. Starlette runs each
sync endpoint in a worker thread, so two endpoints iterate two cursors on the
same connection at the same time. SQLite itself serialises that, but Python's
`sqlite3` keeps a per-connection statement cache and resets or re-steps
statements underneath a cursor another thread is still reading from; a column
read off a statement that has been reset comes back as `NULL`, which is
exactly the shape of the failure. It is a race, so it depends on how many
requests land together and how long each takes: the route-group query walks
324 rows while `/api/change` is pulling half a megabyte, which is the widest
window a page load opens.

## Why it matters

Any endpoint could do this, not just the new one — it was the connection, not
the query. The symptom for a reader was a view that fails to load once and
loads on refresh, with nothing on screen saying why.

## Approaches considered

- **A connection per request**, opened in a dependency and closed after.
  Opening a read-only SQLite file is cheap, and it removes the shared state
  entirely; the cost is an open per request and any cache keyed on the
  connection object being lost every time. Not taken.
- **A thread-local connection** — one per worker thread, opened lazily. Same
  isolation, no per-request open. **Taken** (Max): `app._connection_per_thread`,
  with `app.state.connection` exposed so
  `test_each_request_thread_gets_its_own_connection` can see two threads get
  two. One consequence: `query.place_index` was cached by connection identity
  and would have parsed its 3.5 MB of polygons once per worker thread, so it
  now keys by database file the way `_TIMETABLES` and `_WALK_NETWORKS` already
  did. `_loop_routes` stays memoised per connection — 16 ms, six entries per
  thread, not worth re-keying.
- **A lock around every query.** Fixes the race by serialising the app, which
  is what the thread pool exists to avoid. Ruled out by me as the wrong trade.

## What remains

Nothing to do; the entry stays until Max closes it. Anyone adding a cache to
`query` should key it by `_database_of(con)`, not by the connection, for the
reason above.
