# Hosting the map (Hetzner + Caddy)

One small VM serves [the web app](../docs/WEBAPP.md) at a public hostname over
HTTPS. Two commands, and the second one is optional until DNS exists:

```bash
./deploy/provision.sh                                   # from your workstation
DOMAIN=refresh.example.org bash deploy/setup-caddy.sh   # as root, on the box
```

## Why this is a small kit

The app has **no moving parts at runtime**. It reads a SQLite database built
from two frozen GTFS feeds, opens it read-only, and computes every answer from
that. Nothing is collected, nothing expires, there are no credentials, and the
data only changes when you deploy new code.

That is the whole difference from `pgh-ghost-bus`, whose deploy kit this is
modelled on. There, a 20-second poll loop gathers realtime data that can never
be backfilled, so most of the kit exists to make sure collection never silently
stops: hourly read replicas, R2 archiving, freshness heartbeats, memory caps
keeping the dashboard from starving the poller. **None of that applies here.**
If this box burns down, you lose nothing but uptime — re-run `provision.sh`
against a new one and everything is back, byte for byte.

## What ends up on the box

| Path | What |
| --- | --- |
| `/opt/prt-refresh/app` | this repo, checked out at a specific commit |
| `/opt/prt-refresh/.local/bin/uv` | uv, installed as the `prtrefresh` user |
| `/var/lib/prt-refresh/refresh.db` | the served database, built on the box |
| `/etc/systemd/system/prt-refresh-web.service` | uvicorn on `127.0.0.1:8000` |
| `/etc/caddy/Caddyfile` | the front door, once you run `setup-caddy.sh` |

## 1. Provision

From your workstation, with an `hcloud` context for a project of its own:

```bash
export HCLOUD_CONTEXT=prt-refresh     # the script refuses ghostbus / charles-cms
./deploy/provision.sh
```

Defaults to `cpx11` (2 vCPU / 2 GB, ~€5/mo) in `ash` (Ashburn, VA — nearest
Hetzner region to Pittsburgh). Override with env vars:
`SERVER_TYPE=cax11 LOCATION=fsn1 ./deploy/provision.sh` for the cheaper EU/ARM
box, which is fine too — nothing here is latency-sensitive.

The script creates the server, runs `cloud-init.yaml` for base prep, then over
SSH: clones the repo, checks out the commit, `uv sync --extra web`, runs
`build_webdb.py` on the box (~30–90 s), installs the unit and restarts it.

**It deploys a pushed commit, not your working tree.** The repo is public, so
the box can clone it, and "what is live" is then a SHA you can `git show` — no
snapshot tags or deploy manifests like the ghost-bus kit needs for its private
repo. The trade is that an unpushed commit cannot be deployed, and the script
stops rather than quietly deploying something older. Deploy something else with
`REF=<sha or tag> ./deploy/provision.sh`.

Re-running is the redeploy, and it is also safe when you are simply unsure
whether the last one landed. It reuses the existing server, moves the checkout to
the new commit, rebuilds the database, and restarts the service — **unless the
box is already at that commit, has a database, and is answering**, in which case
it says so and changes nothing. `FORCE=1 ./deploy/provision.sh` rebuilds anyway.

Every remote step is written to be a no-op on a healthy box and a repair on a
broken one — including creating the service account and installing uv, which
cloud-init also does. cloud-init runs only on a server's first boot, so without
that a half-failed first boot would need hand surgery; with it, the fix for
"something went wrong during setup" is to run the script again.

## 2. Look at it before publishing it

```bash
ssh -i ~/.ssh/id_ed25519 -L 8000:localhost:8000 root@<ip>
# then open http://localhost:8000
```

The service binds `127.0.0.1`, so until you install Caddy the box is not serving
anything to the internet. This is also the mode to use if you want a small group
to review it first.

## 3. Publish it

1. **DNS**: add one `A` record, `refresh` → the box's IPv4, at your existing DNS
   provider. Nothing else about the domain changes. Optionally `AAAA` → its IPv6.
2. **On the box**, once that resolves:
   `DOMAIN=refresh.example.org bash /opt/prt-refresh/app/deploy/setup-caddy.sh`
3. Open `https://refresh.example.org`.

Caddy fetches and renews a Let's Encrypt cert automatically and serves the app
openly — no login. The box then listens on 80/443, so its IP is public and there
is no CDN in front of it; for a low-traffic public-comment tool that is fine.
`setup-caddy.sh` prints an optional `ufw` command at the end (allow 22 first).

`/api/*` responses are cached for an hour at the front door, because they cannot
change without a deploy. The HTML and JS bundle deliberately are not — a stale
bundle against a fresh API is the one failure a reader could not diagnose.

## Verifying a deploy

```bash
systemctl status prt-refresh-web
journalctl -u prt-refresh-web -n 50 --no-pager
curl -s https://refresh.example.org/api/meta | head -c 400   # feeds + caveats
cd /opt/prt-refresh/app && git log -1 --oneline               # what is live
```

`/api/meta` is the useful one: it returns both feed versions and the caveats the
UI shows, so it tells you *which data* is being served, not just that something
answers.

## Sizing

The database is ~31 MB and is read from disk with SQLite's own caching; the
process sits well under a couple of hundred MB. The largest single response is
the 100 m magnitude surface at ~1.3 MB, which the app gzips to 198 KB before
Caddy ever sees it. A 2 GB box is not close to being the constraint; a 1 GB one
would do if you wanted to shave the bill.

## Before you point people at it

`docs/WEBAPP.md` has the list, and one item is not technical: this app serves the
proposed network's timetable at its finest grain — every departure at every stop
— from a feed PRT publishes at no URL and sent to PPT on request. Provenance is
recorded (`DATA_SOURCES.md`); confirm with PPT that republishing it in this form
is expected before you announce it.
