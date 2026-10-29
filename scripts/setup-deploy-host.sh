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
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
# Where the host files come from. Keeps the repo layout by default; override
# with DEPLOY_DIR=... if the files are copied somewhere else.
DEPLOY_DIR=${DEPLOY_DIR:-$SCRIPT_DIR/../deploy}
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
    # On a re-run sshd legitimately holds the port because we put it there.
    # Only refuse if something else has taken it.
    if [ -f "$SSHD_DROPIN" ] && ss -tlnpH "sport = :$SSH_PORT" | grep -q 'sshd'; then
      say "port $SSH_PORT already served by sshd via our drop-in — re-run, fine"
    else
      die "port $SSH_PORT is in use by something that is not this setup"
    fi
  fi
  [ -d "$DEPLOY_DIR" ] || die "no deploy directory at $DEPLOY_DIR"
  for f in deploy-hundo docker-compose.prod.yml init-db.sh; do
    [ -r "$DEPLOY_DIR/$f" ] || die "missing $DEPLOY_DIR/$f"
  done
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
  install -o root -g root -m 0755 "$DEPLOY_DIR/deploy-hundo" "$DEPLOY_SCRIPT"
  say "installed from $DEPLOY_DIR/deploy-hundo"
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
  for f in docker-compose.prod.yml init-db.sh; do
    [ -r "$DEPLOY_DIR/$f" ] || die "missing $DEPLOY_DIR/$f — copy the repo's deploy/ directory alongside scripts/"
  done
  # 0755, as /etc convention. Confidentiality comes from .env being 0600
  # root-only, not from hiding the directory.
  install -d -o root -g root -m 0755 "$CONF_DIR"
  install -o root -g root -m 0644 \
    "$DEPLOY_DIR/docker-compose.prod.yml" "$CONF_DIR/docker-compose.prod.yml"
  install -o root -g root -m 0755 "$DEPLOY_DIR/init-db.sh" "$CONF_DIR/init-db.sh"
  say "installed from $DEPLOY_DIR"
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

verify_compose() {
  step 'Compose sanity check'
  # Runs the exact flags the deploy script uses, so a missing -f or a parse
  # error surfaces here rather than on the next CI deploy.
  ( cd "$CONF_DIR" && docker compose -p hundo -f docker-compose.prod.yml config -q )
  say 'parses with the same flags the deploy script uses'
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
verify_compose
configure_sshd
report
