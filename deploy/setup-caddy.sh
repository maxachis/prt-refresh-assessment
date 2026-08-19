#!/usr/bin/env bash
#
# Publish the prt-refresh map at a hostname: install Caddy as a reverse proxy
# with automatic Let's Encrypt HTTPS. You add ONE A record for a subdomain at
# whatever DNS provider you already use -- nothing else about the domain moves,
# and no Cloudflare account is involved.
#
# The map is served openly, no login. That is the point: it exists to help
# people comment on a plan that is out for public comment.
#
# PREREQ: the A record <hostname> -> this box's IPv4 must already resolve, or
# Let's Encrypt's HTTP-01 challenge fails. Run as root ON THE SERVER:
#   ssh root@<box>
#   DOMAIN=refresh.example.org bash /opt/prt-refresh/app/deploy/setup-caddy.sh
set -euo pipefail

[[ $EUID -eq 0 ]] || { echo "Run as root (installs Caddy, writes /etc/caddy)." >&2; exit 1; }

DOMAIN="${DOMAIN:-}"
[[ -n "$DOMAIN" ]] || read -rp "Public hostname (e.g. refresh.example.org): " DOMAIN
[[ "$DOMAIN" == *.* ]] || { echo "That doesn't look like a hostname." >&2; exit 1; }

echo "=== Caddy publish setup for $DOMAIN ==="

# Sanity: warn (don't block) if DNS doesn't point here yet.
MYIP="$(curl -fsS https://api.ipify.org 2>/dev/null || true)"
RESOLVED="$(getent ahostsv4 "$DOMAIN" 2>/dev/null | awk '{print $1; exit}')"
if [[ -n "$MYIP" && -n "$RESOLVED" && "$MYIP" != "$RESOLVED" ]]; then
  echo "WARNING: $DOMAIN resolves to ${RESOLVED:-nothing}, but this box is $MYIP."
  echo "         Let's Encrypt will fail until the A record points here."
  read -rp "Continue anyway? [y/N]: " GO; [[ "$GO" =~ ^[Yy] ]] || exit 1
fi

# The app must be up before Caddy points at it, or the first visitor gets a 502
# and Caddy still holds a valid cert -- a confusing state to debug.
curl -fsS -o /dev/null http://127.0.0.1:8000/api/meta \
  || { echo "The app is not answering on 127.0.0.1:8000 -- run provision.sh first." >&2; exit 1; }

# 1. Install Caddy from its official apt repo (idempotent). The package ships a
#    caddy.service reading /etc/caddy/Caddyfile, with certs in /var/lib/caddy.
if ! command -v caddy >/dev/null 2>&1; then
  echo "Installing Caddy..."
  apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl gnupg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update && apt-get install -y caddy
fi
echo "caddy: $(caddy version | head -1)"

# 2. Write the Caddyfile. See Caddyfile.example for why /api/* is cached and the
#    HTML/JS deliberately is not.
install -d /etc/caddy
cat > /etc/caddy/Caddyfile <<EOF
$DOMAIN {
    encode zstd gzip

    @api path /api/*
    header @api Cache-Control "public, max-age=3600"

    reverse_proxy 127.0.0.1:8000
}
EOF
echo "Wrote /etc/caddy/Caddyfile for $DOMAIN."

# 3. Validate, then start/reload.
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
systemctl enable --now caddy
systemctl reload caddy 2>/dev/null || systemctl restart caddy
sleep 4
systemctl --no-pager --lines=10 status caddy || true

cat <<EOF

>>> Done. If $DOMAIN points at this box, Caddy is now fetching a Let's Encrypt
    cert (the first request may take a few seconds). Open:
        https://$DOMAIN

    Cert or serving trouble?   journalctl -u caddy -n 40 --no-pager

NOTE: this box has no firewall (SSH, and now Caddy, listen publicly). Optional
hardening -- run these IN ORDER, SSH first so you cannot lock yourself out:
    ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable
EOF
