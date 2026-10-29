#!/usr/bin/env bash
#
# Provisions the Hundo CI deploy path on the OCI host. Idempotent: safe to
# re-run. Does NOT touch the database or the running stack — the wipe is a
# separate, deliberate step (progress.md Phase 20, T7).
#
#   sudo ./setup-deploy-host.sh /path/to/hundo-deploy.pub
#
# Secrets are generated here, on the host, and are never printed. Nothing in
# this script needs to know an existing secret value.

set -euo pipefail

DEPLOY_USER=hundo-deploy
SSH_PORT=7422
CONF_DIR=/etc/hundo
OLD_ENV=/home/ubuntu/docker-blackx6/hundo/.env
DEPLOY_SCRIPT=/usr/local/bin/deploy-hundo
SSHD_DROPIN=/etc/ssh/sshd_config.d/99-hundo-ci.conf
PUBKEY_PATH=${1:-}

say() { printf '  %s\n' "$*"; }
step() { printf '\n==> %s\n' "$*"; }
die() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }

check_preconditions() {
  step 'Preconditions'
  [ "$(id -u)" -eq 0 ] || die 'must run as root (use sudo)'
  [ -n "$PUBKEY_PATH" ] || die 'pass the path to hundo-deploy.pub as the argument'
  [ -r "$PUBKEY_PATH" ] || die "cannot read public key: $PUBKEY_PATH"
  grep -q '^ssh-' "$PUBKEY_PATH" || die "not an OpenSSH public key: $PUBKEY_PATH"
  if grep -q 'PRIVATE KEY' "$PUBKEY_PATH"; then
    die 'that is a PRIVATE key — pass the .pub instead'
  fi
  grep -rq '^Include /etc/ssh/sshd_config.d/' /etc/ssh/sshd_config \
    || die 'sshd_config has no Include for sshd_config.d — aborting'
  if ss -tlnH "sport = :$SSH_PORT" | grep -q .; then
    die "port $SSH_PORT is already in use"
  fi
  [ -r "$OLD_ENV" ] || die "cannot read existing env to carry over: $OLD_ENV"
  say "ok — port $SSH_PORT free, sshd_config.d honoured, source env readable"
}

create_deploy_user() {
  step "Deploy account: $DEPLOY_USER"
  if id "$DEPLOY_USER" >/dev/null 2>&1; then
    say 'already exists'
  else
    useradd --create-home --shell /bin/bash "$DEPLOY_USER"
    say 'created'
  fi
  # Deliberately NOT in the docker group: membership is root-equivalent and
  # would expose every other stack on this shared box.
  if id -nG "$DEPLOY_USER" | tr ' ' '\n' | grep -qx docker; then
    die "$DEPLOY_USER is in the docker group — remove it, that defeats the design"
  fi
  say 'confirmed not in the docker group'
}

install_deploy_script() {
  step "Deploy script: $DEPLOY_SCRIPT"
  cat > "$DEPLOY_SCRIPT" <<'DEPLOY'
#!/bin/sh
# The only action CI can trigger. Root-owned and not writable by the deploy
# account, so CI cannot change what deploying means.
set -e
# Docker credentials are per-user and the GHCR package is private; reuse the
# login that already exists under ubuntu rather than storing a second token.
export DOCKER_CONFIG=/home/ubuntu/.docker
cd /etc/hundo
docker compose -p hundo pull backend
docker compose -p hundo up -d --no-deps backend
DEPLOY
  chown root:root "$DEPLOY_SCRIPT"
  chmod 0755 "$DEPLOY_SCRIPT"
  say 'written root:root 0755'
}

install_sudoers() {
  step 'Sudoers entry'
  local tmp
  tmp=$(mktemp)
  printf '%s ALL=(root) NOPASSWD: %s\n' "$DEPLOY_USER" "$DEPLOY_SCRIPT" > "$tmp"
  visudo -cqf "$tmp" || { rm -f "$tmp"; die 'generated sudoers entry is invalid'; }
  install -o root -g root -m 0440 "$tmp" "/etc/sudoers.d/$DEPLOY_USER"
  rm -f "$tmp"
  say "one command only, validated: $DEPLOY_SCRIPT"
}

install_authorized_key() {
  step 'Forced command'
  local home ssh_dir
  home=$(getent passwd "$DEPLOY_USER" | cut -d: -f6)
  ssh_dir="$home/.ssh"
  install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 0700 "$ssh_dir"
  # restrict = no pty, no port/agent forwarding, no X11, no user-rc.
  printf 'command="sudo -n %s",restrict %s\n' \
    "$DEPLOY_SCRIPT" "$(cat "$PUBKEY_PATH")" > "$ssh_dir/authorized_keys"
  chown "$DEPLOY_USER:$DEPLOY_USER" "$ssh_dir/authorized_keys"
  chmod 0600 "$ssh_dir/authorized_keys"
  say 'authorized_keys pinned to the deploy script, input discarded'
}

write_config_dir() {
  step "Config: $CONF_DIR"
  # 0755, as /etc convention. Confidentiality comes from .env being 0600
  # root-only, not from hiding the directory — and 0750 only broke the
  # operator's ability to cd in and read the compose file.
  install -d -o root -g root -m 0755 "$CONF_DIR"

  cat > "$CONF_DIR/init-db.sh" <<'INITDB'
#!/bin/sh
# Runs once, only when the Postgres data directory is empty.
# Creates the app role: owns the hundo database so entrypoint migrations keep
# working, but is NOT a superuser — no COPY FROM PROGRAM, no pg_read_file,
# no role creation, no access to other databases.
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<SQL
CREATE ROLE hundo_app LOGIN PASSWORD '$HUNDO_APP_PASSWORD';
ALTER DATABASE $POSTGRES_DB OWNER TO hundo_app;
SQL
INITDB
  chmod 0755 "$CONF_DIR/init-db.sh"

  cat > "$CONF_DIR/docker-compose.prod.yml" <<'COMPOSE'
# Live production config. Kept in sync with the repo's
# docker-compose.prod.example.yml, which is a reference copy only.
services:
  postgres:
    image: postgres:16.14-alpine
    restart: unless-stopped
    env_file: .env
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: hundo
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sh:/docker-entrypoint-initdb.d/init-db.sh:ro
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    image: ghcr.io/heinhtetoo/hundo/backend:latest
    restart: unless-stopped
    env_file: .env
    environment:
      DATABASE_URL: >-
        postgresql://hundo_app:${HUNDO_APP_PASSWORD}@postgres:5432/hundo
    ports:
      - '127.0.0.1:3000:3000'
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
COMPOSE
  chown root:root "$CONF_DIR/docker-compose.prod.yml"
  chmod 0644 "$CONF_DIR/docker-compose.prod.yml"
  say 'compose + init-db.sh written'
}

write_env() {
  step "Secrets: $CONF_DIR/.env"
  if [ -f "$CONF_DIR/.env" ]; then
    say 'already exists — left untouched (delete it to regenerate)'
    return 0
  fi
  local tmp
  tmp=$(mktemp)
  # Carry everything over except the values being rotated, so unknown keys
  # survive. DATABASE_URL is dropped: compose composes it from the app role.
  grep -vE '^(POSTGRES_PASSWORD|HUNDO_APP_PASSWORD|JWT_ACCESS_SECRET|JWT_REFRESH_SECRET|DATABASE_URL)=' \
    "$OLD_ENV" > "$tmp"
  {
    printf '\n# Rotated %s — previous values were world-readable at mode 664\n' "$(date -u +%Y-%m-%d)"
    printf 'POSTGRES_PASSWORD=%s\n' "$(openssl rand -hex 32)"
    printf 'HUNDO_APP_PASSWORD=%s\n' "$(openssl rand -hex 32)"
    printf 'JWT_ACCESS_SECRET=%s\n' "$(openssl rand -hex 48)"
    printf 'JWT_REFRESH_SECRET=%s\n' "$(openssl rand -hex 48)"
  } >> "$tmp"
  install -o root -g root -m 0600 "$tmp" "$CONF_DIR/.env"
  rm -f "$tmp"
  say "carried over $(grep -c '=' "$CONF_DIR/.env") keys, 4 freshly generated"
  say 'RESEND_API_KEY and RAWG_API_KEY carried over unrotated (accepted risk)'
}

# Effective sshd config for ubuntu connecting on port 22. The port list and
# the listenaddress lines sshd derives from the NEW port are excluded, since
# adding a port is the intended change; a change to port 22's own binding, or
# to any auth setting, still shows up.
effective_config_for_ubuntu_on_22() {
  sshd -T -C user=ubuntu,host=localhost,addr=127.0.0.1,laddr=127.0.0.1,lport=22 \
    | grep -vE "^port |^listenaddress .*:${SSH_PORT}$" \
    | sort
}

configure_sshd() {
  step "sshd on port $SSH_PORT"
  local before after
  before=$(effective_config_for_ubuntu_on_22)

  cat > "$SSHD_DROPIN" <<CONF
# Hundo CI deploy path. Port 22 MUST stay listed: any Port directive replaces
# the default, and omitting it would strand every other user on this box.
Port 22
Port $SSH_PORT

# sshd does not segregate users by port, so without this every account's
# authorized_keys would work on $SSH_PORT — including ubuntu's.
Match LocalPort $SSH_PORT
    AllowUsers $DEPLOY_USER
    PermitRootLogin no
    PasswordAuthentication no
    AllowTcpForwarding no
    X11Forwarding no

# Load-bearing. Ubuntu's Include sits near the top of sshd_config, so an
# unterminated Match here would keep applying to everything parsed after it
# and silently make global settings conditional for other users.
Match all
CONF
  chmod 0644 "$SSHD_DROPIN"

  if ! sshd -t; then
    rm -f "$SSHD_DROPIN"
    die 'sshd config invalid — drop-in removed, nothing reloaded'
  fi

  after=$(effective_config_for_ubuntu_on_22)
  if [ "$before" != "$after" ]; then
    printf '\n  unexpected differences (< before, > after):\n' >&2
    diff <(printf '%s\n' "$before") <(printf '%s\n' "$after") >&2 || true
    rm -f "$SSHD_DROPIN"
    die 'effective config for ubuntu on port 22 changed — drop-in removed'
  fi
  say 'preflight: ubuntu@:22 effective config unchanged'

  if systemctl is-enabled ssh.socket >/dev/null 2>&1; then
    # Socket-activated sshd (Ubuntu 24.04+) ignores the Port directive; the
    # listening ports come from the socket unit instead.
    say 'ssh.socket is enabled — adding ListenStream there too'
    install -d -m 0755 /etc/systemd/system/ssh.socket.d
    printf '[Socket]\nListenStream=%s\n' "$SSH_PORT" \
      > /etc/systemd/system/ssh.socket.d/10-hundo-ci.conf
    systemctl daemon-reload
    systemctl restart ssh.socket
    say 'ssh.socket restarted (existing sessions unaffected)'
  else
    systemctl reload ssh 2>/dev/null || systemctl reload sshd
    say 'sshd reloaded, not restarted — existing sessions survive'
  fi
}

report() {
  step 'Listening check'
  ss -tlnp | grep -E ":($SSH_PORT|22)\b" || say 'nothing found — investigate'
  printf '\nDone. Next: T6 (GitHub secrets + Tailscale ACL), then T7 (wipe).\n'
  printf 'Nothing was deployed and no data was touched.\n'
}

check_preconditions
create_deploy_user
install_deploy_script
install_sudoers
install_authorized_key
write_config_dir
write_env
configure_sshd
report
