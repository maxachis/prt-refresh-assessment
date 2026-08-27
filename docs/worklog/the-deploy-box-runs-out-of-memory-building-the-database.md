# The deploy box runs out of memory building the database

`build_webdb.py` was OOM-killed on the 2 GB Hetzner box during the 2026-08-27
deploy, leaving the checkout advanced and the database half-written. A 2 GB
swapfile added by hand on the box unblocked it; nothing in the repo creates
that swapfile, so a fresh `provision.sh` on a new box would hit the same wall.

## What happened

`HCLOUD_CONTEXT=prt-refresh ./deploy/provision.sh` printed `Killed` after
`>>> deploying 3f6c2d27…`. The kernel confirms it was the build, not the deploy
script:

```
$ ssh root@5.161.252.107 'dmesg -T | grep -i "killed process"'
[Thu Aug 27 20:02:55 2026] Out of memory: Killed process 101900 (python3)
  total-vm:1231808kB, anon-rss:1199500kB … UID:999
```

UID 999 is `prtrefresh`, and the step is `deploy/provision.sh:143` —
`python3 build_webdb.py --out …/refresh.db.new`.

The arithmetic is tight rather than pathological. The box is a `cpx11`: 1.9 GB
usable. The running web service held 530 MB (`systemctl show prt-refresh-web
-p MemoryCurrent`), leaving ~1.1 GB available; the build peaked at ~1.2 GB
resident. It fits with the service stopped and does not fit with it running.
The 2026-08-19 and 2026-08-25 deploys succeeded, so this crossed the line
recently — most likely when the pedestrian network started being packed into
the database, which is the largest thing the build holds in memory at once.

## Why it matters more than a one-off failure

The failure is not clean. `provision.sh` advances the checkout *before* it
builds (`git checkout --force "$REF"` at line 134, build at 143), so a killed
build leaves the box at the new commit with the previous database and stale
`refresh.db.new{,-shm,-wal}` files in `/var/lib/prt-refresh/`, and the service
never restarted. That state passes the script's own "nothing to do" guard on
the next run — same commit, database present, service answering — so a
re-run says `already at <ref>` and changes nothing. The failed deploy is then
invisible to the tool that would otherwise repair it. It only looked harmless
this time because the commit was frontend-only and the old database's contents
were identical.

## Where it stands

Unblocked, not fixed. On the box:

```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile
swapon /swapfile
echo "/swapfile none swap sw 0 0" >> /etc/fstab
```

`FORCE=1 ./deploy/provision.sh` then completed, rebuilt the database at
20:06 UTC, restarted the service, and `https://prt-refresh.lemaliconsulting.com`
serves 3f6c2d2. Swap peaked at 2.5 MB during the build — the headroom is
what mattered, not the paging.

That swapfile is a hand-edit to mutable state. It survives reboots via
`/etc/fstab` and nothing else; it is not in `deploy/cloud-init.yaml`, so a new
box does not get it, and the next person to run `provision.sh` against a fresh
server meets the original failure with no clue that this happened.

## Approaches, and who chose what

- **Swapfile on the box** — what was done, by the agent, as the smallest thing
  that finished the deploy the user asked for. Deliberately *not* also written
  into `cloud-init.yaml`, because changing how every future box is built is a
  bigger decision than unblocking one deploy, and it is Max's.
- **Stop the service during the build** — considered and not done. It would
  have fit in the available memory, but it trades a working deploy for a
  minute of downtime on every redeploy, and it does not help a first
  provision, where there is no service to stop.
- **A bigger box** (`cpx21`, 4 GB, roughly double the ~€5/mo) — not done. The
  build is the only thing that needs the memory; paying for it around the
  clock to serve a static SQLite file is the wrong shape.
- **Build the database off-box and ship it** — not done, and it argues against
  `deploy/README.md`'s stated reason for building on the box (a derived
  artifact, rebuilt identically anywhere, so no snapshot to manage). Raising
  it here because if the build keeps growing, that reasoning is what will have
  to give.

## Open, for Max

1. Should `deploy/cloud-init.yaml` create the swapfile, so a fresh box gets
   the headroom without anyone remembering this entry?
2. Should `provision.sh` fail *loudly and recoverably* — checking out the
   commit only after the database builds, or removing a stale `refresh.db.new`
   and refusing the "nothing to do" shortcut when one is present — so a killed
   build cannot masquerade as a finished deploy?
