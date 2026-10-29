# Deploy hardening and datastore reset

- **Date:** 2026-10-29
- **Status:** accepted
- **Tasks:** `progress.md` Phase 20

`progress.md` tracks *what* is done. This records *why*, because the reasoning
is the part that is expensive to rediscover.

## Context

Promoting `dev` to `main` failed in the `Deploy to OCI` step:

```
2026/10/29 08:36:27 ssh: handshake failed: EOF
```

`ci.yml` had not changed since the last successful deploy on 2026-08-23, so this
was an environment change, not a regression in the workflow.

## Root cause

Tailscale SSH had been enabled on `blackx6-server` at some point after August.
`tailscaled` therefore owns port 22 on the tailnet — confirmed by banner grab,
which returns `SSH-2.0-Tailscale`, not `SSH-2.0-OpenSSH_*`.

Tailscale SSH authorises by **tailnet identity**, not by key, so `OCI_SSH_KEY`
was never evaluated. The runner joins as `tag:ci`, and the tailnet's only `ssh`
rule was `action: check` with `src: autogroup:member`. A tagged node has no
user identity, so it can never match `autogroup:member`; and `check` requires
an interactive browser re-auth no CI runner can perform. No rule matched,
`tailscaled` closed the connection before auth completed, and the client saw
`EOF`.

## Decisions

1. **Transport: OpenSSH on port 7422, tailnet-only.** A Tailscale SSH rule's
   `dst` accepts only a tag, `autogroup:self`, or the same named user as `src`
   — so using Tailscale SSH for CI would require tagging the server. Tagging
   removes a device's user owner, which would have broken the existing
   `autogroup:self` laptop rule and forced a rewrite of working access. An
   extra OpenSSH port avoids that entirely and **restores forced commands**,
   which Tailscale SSH does not support — the single most valuable control
   available here.
2. **Port 7422.** Outside the ephemeral range (32768–60999, where a listener
   can collide with an outbound source port), absent from `/etc/services`, and
   confirmed free on the host. Rejected: 7100 (X Font Service), 1337
   (`menandmice-dns`), 100 (unassigned and privileged, but reads as suspicious).
3. **`Match LocalPort 7422` scoped to `hundo-deploy`, closed with `Match all`.**
   sshd does not segregate users by port, so opening 7422 would otherwise make
   *every* account's `authorized_keys` usable on it. The `Match all` terminator
   is load-bearing: Ubuntu's `Include` sits near the top of `sshd_config`, so an
   unterminated `Match` in a drop-in keeps applying to everything parsed after
   it and would silently make global settings conditional for the other five
   stacks' users on this shared box.
4. **CI account `hundo-deploy`, not in the `docker` group.** Docker group
   membership is root-equivalent and would let the CI account control every
   container on the box, including other projects. Instead: a sudoers entry for
   one fixed script, and a forced command with `restrict` in `authorized_keys`.
   The script and the compose file are root-owned, so the account cannot alter
   what the deploy does.
5. **Deploy runs as root, reusing the existing GHCR login** via
   `DOCKER_CONFIG=/home/ubuntu/.docker`. Docker credentials are per-user and the
   package is private, so a root-run deploy would otherwise fail `unauthorized`.
   Issuing root its own token was rejected: a GHCR credential already exists on
   the box and already has an expiry that will break deploys one day — a second
   copy duplicates that problem rather than adding safety.
6. **Database role `hundo_app`, owner but not superuser.** The app had been
   connecting as the `postgres` superuser, which grants `COPY … FROM PROGRAM`
   (shell on the DB container), `pg_read_file()`, role creation, and access to
   every database in the cluster. Owning the database still permits DDL, so
   migrations keep running from the container entrypoint with **zero code
   change**. Two-role and manual-migration variants were rejected: their only
   extra protection is against an attacker dropping tables, which is near
   worthless while the data is disposable, and both add a way for future
   deploys to break.
7. **Migrations squashed 6 → 1.** `users` alone was spread across three files.
   Generated from `pg_dump --schema-only` and proven by diffing a fresh
   six-migration run against a fresh baseline run: 367 lines, zero differences.
   Only safe while data is disposable; the window closes at the first real user.
8. **Config relocated to `/etc/hundo/`.** The directory holds only
   configuration — Postgres data is a named Docker volume — so `/etc` is the
   honest home. The move is hygiene, not access: the deploy script runs as root
   and never needed the path. `.env` had been mode `664` in a home directory for
   four months on a box where `styr` runs autonomously, so every account could
   read `POSTGRES_PASSWORD`, both JWT secrets, `RAWG_API_KEY` and
   `RESEND_API_KEY`.
9. **Images tagged `:latest` and `:<sha>`.** Only `:latest` had ever been
   pushed, so `PROJECT.md`'s "Rollback = redeploy previous image tag" had never
   been possible. Compose still tracks `:latest` because the forced command
   takes no arguments and cannot be told a SHA; rollback is editing
   `/etc/hundo/docker-compose.prod.yml` to a SHA and redeploying.
10. **Deploy touches the backend only** (`up -d --no-deps backend`), so the
    database never restarts on a push.
11. **Repo's compose file renamed to `docker-compose.prod.example.yml`.** It had
    never been deployable — it contained `${{ github.repository }}`, which is
    GitHub Actions syntax that Compose rejects with `invalid interpolation
    format`. Making the repo the source of truth was rejected on security
    grounds: the compose file controls volume mounts, so deploying it from the
    repo would hand a compromised pipeline the ability to mount the host.

## Accepted risks

- **`RESEND_API_KEY` and `RAWG_API_KEY` are not rotated**, despite four months
  of world-readable exposure. Owner's decision. The Resend key is the one with
  third-party impact — it can send mail as the verified domain.
- **`DEMO_MODE=true` in production** lets a registrant verify an address they do
  not own. Deliberate showcase affordance, already documented in `PROJECT.md`
  §7.
- **Migrations run unattended** against production on every push, from the
  container entrypoint. Acceptable while data is disposable; revisit before real
  users.

## Deferred

- Split config: `/opt/hundo` for the deployment unit, `/etc/hundo` for secrets.
  Needs `--env-file`, because Compose interpolates `${VAR}` only from the
  project-directory `.env` or an explicit `--env-file` — never from `env_file:`,
  which only injects into the container.
- Free major Postgres upgrade while data is disposable (currently pinned
  `16.14-alpine`); requires moving CI and local dev in lockstep.
- Move the other five stacks out of `/home/ubuntu/docker-blackx6/`.
- Pull-based deploy (host polls GHCR) to remove inbound access entirely.

## Resulting topology

```
Vercel (frontend, deploys itself from main)
  └─ rewrite /api/*  →  https://blackx6-server.tail58ded8.ts.net/hundo/api/*
       └─ Tailscale Funnel  /hundo/  →  http://127.0.0.1:3000
            └─ backend container (BASE_PATH=/hundo/api), published on
               127.0.0.1:3000 only
                 └─ postgres container, volume hundo_postgres_data,
                    app connects as hundo_app (non-superuser)

GitHub Actions on push to main
  ├─ build + push ghcr.io/heinhtetoo/hundo/backend:{latest,<sha>}  (private)
  └─ tailscale up --tags=tag:ci
       └─ ssh -p 7422 hundo-deploy@<tailnet ip>
            └─ forced command → sudo /usr/local/bin/deploy-hundo (root)
                 └─ cd /etc/hundo && pull backend && up -d --no-deps backend
                      └─ entrypoint.sh → migrate:up → node src/index.js
```

No Cloudflare anywhere in Hundo; searched the repo and git history.

## Checks that should keep passing

- `ssh -p 7422 hundo-deploy@<ip> 'id'` runs the deploy and exits — input is
  discarded, proving the forced command holds.
- `ssh -p 7422 ubuntu@<ip>` is refused by `Match LocalPort` scoping.
- `SELECT rolsuper FROM pg_roles WHERE rolname='hundo_app'` is `false`.
- `/etc/hundo/.env` is `0600 root:root`.
- `sshd -T -C user=ubuntu,...,lport=22` is unchanged from before this work.
