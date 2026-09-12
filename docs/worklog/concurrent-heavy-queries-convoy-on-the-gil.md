# Concurrent heavy queries convoy on the GIL

Several big SQLite reads running at once in the app are far slower than the
same reads one after another — four cold change-layer builds together take
20 s where one takes 0.9 s, and sixteen took minutes. Open — measured
2026-09-12 while checking the per-thread-connection fix, pre-existing and
independent of it, not fixed because the session's task was that fix.

## What is observed

`query.change_layer(con, 400)` on its own: 0.9 s. In threads, each with its
own connection, all started together:

```
2 concurrent:  3.9 s total
4 concurrent: 19.6 s total
8 concurrent: 76.9 s total
```

Roughly ×4–5 per doubling, so 16 together is minutes. The same shape appears
on a bare `SELECT side, stop_id, name FROM stops` (11,697 rows): 0.02 s
alone, 0.9 s each when four run together — and the same 0.9 s when the four
share one connection, which is how the app was wired before
[one-sqlite-connection-serves-every-thread](one-sqlite-connection-serves-every-thread.md).
So this is not the connection count; it is what CPython's `sqlite3` does per
row — release and retake the GIL around every `sqlite3_step` — which under
several fetching threads turns into the known GIL convoy, most of the time
spent handing the lock around rather than reading. The server sat at ~220%
CPU throughout, which is that hand-off, not useful work.

Reproduce by timing `query.change_layer` from N threads at once, each on its own
`query.connect`,
or by firing sixteen `curl` at `/api/change?radius=400` against a cold
server: all return 200, in about ten minutes.

## Why it matters, and why it might not

It matters only where heavy reads coincide. In the app that is the **cold
start**: `layer_cache` in `app.py` holds the change, surface and population
layers as bytes once built, but nothing builds them until a reader asks, so
the first readers after a deploy each trigger a build and convoy on each
other. After that the big layers are cache hits and never touch SQLite; the
per-click endpoints (`/api/place`, `/api/route_changes`) are small reads
that do not convoy measurably. So a person browsing alone never sees this;
an announcement that lands many first visitors on a freshly deployed box
would, once, for the length of the cold builds.

## Approaches considered

- **Warm `layer_cache` at start-up** — build the six entries (two radii ×
  three layers, ~4 s, ~4 MB) in `create_app` before the app serves. Removes
  the cold-start herd entirely, and `deploy/provision.sh` already waits for
  the app to answer before switching traffic. My recommendation; not done.
- **A lock per cache key**, so concurrent misses build once and the rest
  wait for the bytes. Fixes the herd without the start-up cost, but leaves
  the first reader paying it. Cheaper if start-up time turns out to matter.
- **Fewer worker threads** (anyio's limiter, default 40) so fewer fetches
  overlap. Blunt: it slows the light endpoints too.
- **Doing nothing**, on the grounds above — the window is one cold start.
