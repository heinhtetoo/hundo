# How Hundo is put together

Plain-language orientation, for picking this project back up after months away.

- **What** Hundo does → `PRD.md`
- **How** it is built, and the rules agents must follow → `PROJECT.md`
- **Why** the deployment looks like this → `docs/decisions/`
- Task history → `progress.md`

Accurate as of 2026-10-30, after Phase 20.

## The short version

Hundo is in two halves that live in different places. The part people see runs
on Vercel's servers. The part that stores the games runs on a personal Oracle
Cloud box, which it shares with five other projects.

## The two halves

**The website** — the React app. Vercel builds and hosts it. A push to `main`
makes Vercel redeploy on its own; there is nothing to manage.

**The engine** — an Express API and a Postgres database, each in its own
container on the Oracle box.

## Following a single click

Someone opens their backlog. The journey is stranger than you would expect, and
every hop is there for a reason:

```
Browser
  │  asks Hundo's own domain for /api/v1/backlog
  ▼
Vercel
  │  quietly forwards it to blackx6-server.tail58ded8.ts.net/hundo/api/...
  ▼
Tailscale Funnel          ← the one deliberately public door into the box
  │  hands it to localhost:3000
  ▼
Express                   ← strips the "/hundo/api" prefix, runs the real route
  │
  ▼
Postgres
```

**Why not let the browser talk to the box directly?** Cookies. Hundo keeps you
signed in with cookies, and Safari discards cookies that arrive from a different
domain than the page. Routing through Vercel means the browser believes it is
only ever talking to one place. `PROJECT.md` carries a warning not to
"simplify" this away — this is why.

**Tailscale** is a private network joining the laptop, phone and box as though
they shared a home router, wherever they physically are. **Funnel** is the one
exception: a single public doorway so Vercel can reach the API without exposing
the box to the internet generally. Verified 2026-10-29 — ports 22 and 7422 are
both unreachable from outside.

## Where the data lives

Postgres keeps its files in a named Docker volume, `hundo_postgres_data`, which
lives outside the container under `/var/lib/docker/volumes/`. That is
deliberate: the container is destroyed and replaced on every deploy while the
data stays untouched.

It is ordinary disk, not attached block storage. `PROJECT.md` claimed otherwise
until Phase 20.

## How code gets from laptop to live

```
push to main
  │
  ├─ Vercel rebuilds the website, by itself
  │
  └─ GitHub Actions:
       1. runs the tests (110 backend, 17 frontend)
       2. builds the backend into a container image
       3. uploads it to GitHub's private image store
       4. joins the Tailscale network as a temporary member
       5. SSHes into the box on port 7422 as "hundo-deploy"
       6. that account can do exactly one thing: run one fixed script
       7. the script fetches the new image and restarts only the backend
       8. on startup the backend applies any new database migrations
```

**Step 6 is the heart of the security design.** The `hundo-deploy` account has
no useful power: no shell, no Docker commands, no access to the secrets. The
single script it may run is owned by root and it cannot edit it. Demonstrated by
asking it to print the system password file — it ran a deploy and ignored the
request.

**Step 8 is the one to watch.** Database structure changes apply automatically
with nobody watching. Acceptable while the only account is a test one; worth
revisiting before real users exist.

Rolling back means editing the image tag in
`/etc/hundo/docker-compose.prod.yml` to a specific commit SHA and deploying
again. Images are tagged both `:latest` and `:<sha>`.

## Where the secrets are

One file: `/etc/hundo/.env` on the box, readable only by root. It holds the
database passwords, the two keys that sign login tokens, the RAWG key and the
Resend key.

Until Phase 20 that file sat in a home directory readable by every account on
the box, including `styr`, which runs code autonomously. The database and
login-token secrets were replaced; the Resend and RAWG keys were deliberately
left as they were (see `docs/decisions/`).

The app no longer signs in to Postgres as the administrator. It uses
`hundo_app`, which can read and write Hundo's own data and nothing else — it
cannot run commands on the database container or reach other databases.

## Two quirks worth remembering

**Email does not really work.** Resend's free tier only delivers to a verified
domain, so in practice only the owner would ever receive a verification email.
That is why `DEMO_MODE` is on: new users get a "Verify now" card in the app
instead. Convenient for a public demo, with a known weakness — someone can
verify an address they do not own.

**Game data comes from RAWG**, and every call is made server-side, never by the
browser, so the API key never reaches anyone's device.

## Which files matter

| Path | What it is |
| --- | --- |
| `deploy/` | The single source for the three files that live on the box |
| `scripts/setup-deploy-host.sh` | Installs them; idempotent, `--check` runs preconditions only |
| `server/entrypoint.sh` | Runs migrations, then starts the API |
| `server/migrations/` | One baseline file describing the whole schema |
| `client/vercel.json` | The rewrite that keeps cookies same-origin |

On the box: `/etc/hundo/` holds the config, `/usr/local/bin/deploy-hundo` is the
only thing CI can run.

## If something breaks

- **Website down, API fine** → Vercel's problem
- **API down** →
  `sudo docker compose -p hundo -f /etc/hundo/docker-compose.prod.yml logs backend`
- **Deploy fails at the SSH step** → Tailscale, or the deploy account
- **Deploy succeeds but the app is broken** → almost certainly a migration
  failing on startup, leaving the container in a restart loop
- **Is the API alive?** →
  `curl -s -o /dev/null -w '%{http_code}\n' https://blackx6-server.tail58ded8.ts.net/hundo/api/v1/auth/me`
  — **401 is the healthy answer**, since the endpoint requires a login
- **`sshd -T` errors** on this box unless given `-C ...,lport=NN`. Expected:
  the `Match LocalPort` rule requires it
