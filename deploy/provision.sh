#!/usr/bin/env bash
#
# Provision (or redeploy) the prt-refresh web app on a Hetzner VM, end to end:
#   create server (cloud-init base prep) -> wait for SSH -> fetch the repo at a
#   commit -> uv sync -> build the database -> install & start the unit.
#
# THE REPO IS PUBLIC, which is the one thing that makes this simpler than
# pgh-ghost-bus's equivalent. That kit rsyncs a working tree because a private
# repo can't be cloned on a fresh box without a deploy key, and it then has to
# snapshot-and-tag the tree to record what is live. Here the box clones from
# GitHub and checks out a commit, so "what is deployed" is a SHA you can read
# with `git show` -- no manifest, no snapshot tags. The cost is that the commit
# must be PUSHED, which this script refuses to proceed without.
#
# There are no secrets anywhere in this deployment: public repo, public data,
# no credentials, nothing to place by hand afterward. Re-running is the redeploy.
#
# Override any VAR via env. Requires: hcloud, ssh, git, an ssh keypair.
set -euo pipefail

HCLOUD_CONTEXT="${HCLOUD_CONTEXT:-prt-refresh}"
SERVER_NAME="${SERVER_NAME:-prt-refresh}"
SERVER_TYPE="${SERVER_TYPE:-cpx11}"          # 2 vCPU / 2 GB / 40 GB, x86
LOCATION="${LOCATION:-ash}"                   # Ashburn, VA -- the readers are in Pittsburgh
IMAGE="${IMAGE:-ubuntu-24.04}"
SSH_KEY_NAME="${SSH_KEY_NAME:-prt-refresh-deploy}"
SSH_PUBKEY="${SSH_PUBKEY:-$HOME/.ssh/id_ed25519.pub}"
SSH_PRIVKEY="${SSH_PRIVKEY:-$HOME/.ssh/id_ed25519}"
REPO_URL="${REPO_URL:-https://github.com/maxachis/prt-refresh-assessment.git}"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP=/opt/prt-refresh/app     # only for the closing instructions; the paths the
                             # deploy actually uses are set inside the remote block

export HCLOUD_CONTEXT
log() { printf '\n>>> %s\n' "$*"; }

# Hard guardrail: never provision into someone else's project. `ghostbus` is the
# live collector -- a second app on that 2 GB box is exactly what its memory
# caps exist to prevent.
case "$HCLOUD_CONTEXT" in
  charles-cms|ghostbus)
    echo "REFUSING: HCLOUD_CONTEXT=$HCLOUD_CONTEXT belongs to another project." >&2
    exit 1;;
esac

# 0. Decide what to deploy, and refuse to guess. The box pulls from GitHub, so a
#    commit that exists only on this laptop cannot be deployed -- catching that
#    here beats discovering it as a mystery "old code is live" later.
#    Resolved to a full sha here, not passed through as a tag or branch name,
#    so the box checks out one immutable thing and "is the box already at what I
#    asked for?" is a string comparison rather than a name that could move.
REF="${REF:-HEAD}"
REF_SHA="$(git -C "$REPO_DIR" rev-parse --verify "$REF^{commit}")"
if ! git -C "$REPO_DIR" branch -r --contains "$REF_SHA" 2>/dev/null | grep -q .; then
  echo "REFUSING: $REF ($REF_SHA) is not on any remote branch -- push it first." >&2
  echo "  (or set REF=<pushed sha or tag> to deploy something else)" >&2
  exit 1
fi
if [ -n "$(git -C "$REPO_DIR" status --porcelain)" ]; then
  log "note: working tree is dirty -- deploying committed $REF_SHA, not what is on disk"
fi
log "context=$HCLOUD_CONTEXT  type=$SERVER_TYPE  location=$LOCATION  ref=$REF_SHA"

# 1. SSH key in the project (idempotent)
if ! hcloud ssh-key describe "$SSH_KEY_NAME" >/dev/null 2>&1; then
  log "uploading SSH key '$SSH_KEY_NAME' from $SSH_PUBKEY"
  hcloud ssh-key create --name "$SSH_KEY_NAME" --public-key-from-file "$SSH_PUBKEY"
fi

# 2. Server (skip if it already exists -- this is also the redeploy path)
if hcloud server describe "$SERVER_NAME" >/dev/null 2>&1; then
  log "server '$SERVER_NAME' already exists -- reusing"
else
  log "creating server '$SERVER_NAME'"
  hcloud server create \
    --name "$SERVER_NAME" --type "$SERVER_TYPE" --image "$IMAGE" \
    --location "$LOCATION" --ssh-key "$SSH_KEY_NAME" \
    --user-data-from-file "$REPO_DIR/deploy/cloud-init.yaml"
fi

IP="$(hcloud server ip "$SERVER_NAME")"
log "server IP: $IP"
SSH="ssh -i $SSH_PRIVKEY -o StrictHostKeyChecking=accept-new -o ConnectTimeout=5 root@$IP"

# 3. Wait for SSH, then for cloud-init to finish base prep
log "waiting for SSH + cloud-init (a couple of minutes on a fresh box)..."
for _ in $(seq 1 60); do $SSH true 2>/dev/null && break; sleep 5; done
$SSH "cloud-init status --wait" || true

# 4. Everything else happens on the box, driven from here so a redeploy is one
#    command. The frontend bundle is committed (src/refresh/web/static/app.js),
#    so unlike the ghost-bus kit there is no npm step and no build artifact to
#    ship -- the checkout is already servable.
log "deploying $REF_SHA to $IP"
$SSH "REPO_URL='$REPO_URL' REF='$REF_SHA' FORCE='${FORCE:-0}' bash -s" <<'REMOTE'
set -euo pipefail
APP=/opt/prt-refresh/app
STATE=/var/lib/prt-refresh
UV=/opt/prt-refresh/.local/bin/uv
as_app() { su - prtrefresh -s /bin/bash -c "$1"; }

# Base prep, repeated. cloud-init already did all of this on the box's first
# boot -- but cloud-init runs ONCE, so a first boot that half-failed used to
# leave a server that no amount of re-running could repair, only hand surgery.
# Each of these is a no-op on a healthy box and a repair on a broken one, which
# is what makes re-running the fix for "something went wrong during setup".
id -u prtrefresh >/dev/null 2>&1 \
  || useradd --system --create-home --home-dir /opt/prt-refresh --shell /bin/bash prtrefresh
install -d -o prtrefresh -g prtrefresh /opt/prt-refresh "$APP" "$STATE"
command -v git >/dev/null 2>&1 \
  || { apt-get update -qq && apt-get install -y -qq git curl; }
[ -x "$UV" ] || as_app 'curl -LsSf https://astral.sh/uv/install.sh | sh'

# Nothing to do? Say so and stop. Re-running is the redeploy, so it is also what
# you type when you are not sure whether the last one landed -- and in that case
# the honest answer is usually "it did", not a rebuild and a restart. The three
# checks are the three ways it could be less deployed than it looks: wrong
# commit, no database, or a service that is not actually answering.
LIVE="$(as_app "cd '$APP' 2>/dev/null && git rev-parse HEAD" 2>/dev/null || echo none)"
if [ "$FORCE" != 1 ] && [ "$LIVE" = "$REF" ] && [ -s "$STATE/refresh.db" ] \
   && systemctl is-active --quiet prt-refresh-web.service \
   && curl -fsS -o /dev/null --max-time 10 http://127.0.0.1:8000/api/meta; then
  echo "already at $REF, database present, service answering -- nothing to do."
  echo "(FORCE=1 ./deploy/provision.sh rebuilds and restarts anyway)"
  exit 0
fi

# Check out the exact commit, detached: the box then has no branch that could
# drift from what was asked for, and `git clean` afterwards means a redeploy
# cannot inherit a stray file from the previous one.
if [ ! -d "$APP/.git" ]; then
  as_app "git clone --quiet '$REPO_URL' '$APP'"
fi
as_app "cd '$APP' && git fetch --quiet --tags --force origin && git checkout --quiet --force '$REF' && git clean -qfd"

# The web extra (fastapi + uvicorn). The pipeline itself needs nothing.
as_app "cd '$APP' && $UV sync --quiet --extra web"

# Build the database on the box from the committed feeds (~30-90s). It is a
# derived artifact -- gitignored, rebuilt identically anywhere -- so it is built
# here rather than shipped, and it lands outside the checkout so `git clean`
# can never take it.
as_app "cd '$APP' && python3 build_webdb.py --out '$STATE/refresh.db.new'"

# Checkpoint the WAL away so the served file needs no writable sidecar, and so
# the unit can keep its data directory read-only. Why, at length: deploy/freeze-db.py.
as_app "python3 '$APP/deploy/freeze-db.py' '$STATE/refresh.db.new'"

# Swap in atomically, so a redeploy never serves a half-built file.
as_app "mv -f '$STATE/refresh.db.new' '$STATE/refresh.db'"

cp "$APP/deploy/prt-refresh-web.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable prt-refresh-web.service
# `restart`, not a bare `enable --now`: the latter is a no-op on an already
# running unit, which would leave a redeploy serving the old code.
systemctl restart prt-refresh-web.service
sleep 2
systemctl --no-pager --lines=5 status prt-refresh-web.service || true

# Caddy is installed separately (setup-caddy.sh) because it needs a DNS record
# to exist first. If it is already here, a redeploy must not disturb it.
systemctl is-active --quiet caddy && echo "caddy: still serving" || true
REMOTE

log "checking the app answers on the box"
$SSH "curl -fsS 'http://127.0.0.1:8000/api/meta' | head -c 200; echo"

cat <<EOF

>>> Deployed $REF_SHA to $SERVER_NAME ($IP).

    Look at it over an SSH tunnel, no public exposure needed:
        ssh -i $SSH_PRIVKEY -L 8000:localhost:8000 root@$IP
        open http://localhost:8000

    To publish it at a hostname (one A record, then Let's Encrypt via Caddy):
        1. add  A  <subdomain> -> $IP  at your DNS provider
        2. ssh -i $SSH_PRIVKEY root@$IP
           DOMAIN=<hostname> bash $APP/deploy/setup-caddy.sh

    Redeploy after pushing a commit: re-run this script.
EOF
