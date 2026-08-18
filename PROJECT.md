# PROJECT.md — Hundo

Per-project contract. Read this alongside the global `STACK.md`. Where the two
disagree, **this file wins for this repo** — but every disagreement is recorded in
§3 as a _legacy pattern_ with a migration stance, not as a silent exception.

Agents (PM, Build, Judge) must load this file before planning or reviewing any
Hundo ticket.

> **Status: pilot project.** Hundo is the first repo the agentic pipeline operates
> on. Expect this file to change more often than others in the first ten tickets.

---

## 1. What Hundo is

A personal game-backlog tracker. Users search a game catalog (RAWG API), add titles
to a private backlog, and track status / rating / hours / notes per entry. A profile
screen aggregates stats (completion ring, top genres, total hours, top-rated games).

Multi-user, private per user. No social features, no OAuth, no platform sync.
Full product scope, user stories, and rationale live in `Hundo_PRD.md` — that
document remains the source of truth for **what** Hundo does; this file governs
**how** it is built and what agents may do to it.

Blast radius: personal portfolio piece with a public demo. A bad merge is
embarrassing, not an incident. Rollback = redeploy previous image tag.

## 2. Architecture (as-is)

Monorepo, two deployables:

```
client/   React 18 SPA — Vite, Tailwind, TanStack Query, React Router v6,
          React Hook Form + Zod, react-hot-toast
server/   Express API — JSON only, all routes under /api/v1/, raw SQL on
          node-postgres, JWT auth in httpOnly cookies, node-pg-migrate
```

- **Frontend** deploys to Vercel from `main`. Vercel rewrites proxy `/api/*` to the
  backend so cookies stay same-origin (this is what keeps Safari ITP off your back —
  do not "simplify" it away).
- **Backend** deploys as a Docker container to the OCI 3-core box, exposed via
  Tailscale Funnel. `BASE_PATH=/hundo/api` makes Express strip the tunnel prefix.
- **Postgres** runs in a container on the same box, volume-mounted to block storage.
- **CI/CD**: GitHub Actions on push to `main` — Vitest suite, then SSH deploy to OCI
  via the Tailscale action (`docker compose pull && docker compose up -d`). Vercel
  deploys itself via its GitHub integration.
- Migrations run from the Docker entrypoint on container start.

Design system: dark completionist theme, Space Grotesk, oklch semantic tokens,
primitives in `client/src/components/ui/` (`Button`, `Input`, `Field`, `Card`,
`Badge`, `CompletionRing`, `RatingBar`). Two layout shells via nested routes
(`PublicLayout`, `AppLayout`). New UI composes these primitives — agents do not
introduce new one-off colour values or a second styling approach.

## 3. Deviations from `STACK.md` (legacy patterns)

Hundo predates the stack contract. These deviations are **accepted and documented**,
not bugs. Agents must conform to the _existing_ pattern in this repo unless a ticket
explicitly scopes a migration.

| #   | `STACK.md` law                       | Hundo today                                                                                                                                           | Stance                                                                                                      |
| --- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1   | TypeScript strict everywhere         | **Plain JavaScript**                                                                                                                                  | Migrate — server first (see §8 backlog)                                                                     |
| 2   | Next.js App Router monolith          | Vite SPA + separate Express API                                                                                                                       | **Keep.** No rewrite. Legacy-but-fine                                                                       |
| 3   | Drizzle ORM                          | Raw SQL via node-postgres                                                                                                                             | Keep for now; candidate migration after TS lands                                                            |
| 4   | DB-backed sessions                   | JWT access+refresh in httpOnly cookies, `password_changed_at` revocation, single-flight refresh wrapper                                               | **Keep.** Do not extend the JWT machinery; any new auth surface argues for sessions at the plan gate        |
| 5   | pnpm                                 | **npm** (three separate `package-lock.json` files; `--prefix` scripts, not real workspaces)                                                           | Migrate early — cheap, unlocks phantom-dep protection, collapses three lockfiles into one                   |
| 6   | Component tests exist                | None (PRD scoped them out); `client` has **no test script at all**                                                                                    | **Migrating now** — harness is the first orchestrated ticket                                                |
| 7   | Playwright smoke pack                | None (ad-hoc runs only)                                                                                                                               | Add after the component harness                                                                             |
| 8   | Neon for Vercel-hosted apps          | Self-hosted Postgres on the box                                                                                                                       | **Keep.** Hundo's _app_ is box-hosted; the pairing law is satisfied                                         |
| 9   | Named exports, no default exports    | **Server: named** (`module.exports = { … }`). **Client: default exports, 33 files.** No barrel files anywhere                                         | Enforce on **changed files only**; no repo-wide sweep. Client conversion rides along with the TS migration  |
| 10  | ESM                                  | **Server is CommonJS**                                                                                                                                | Convert as part of the server TS migration, not before — one ticket, one disruption                         |
| 11  | Shared ESLint + Prettier config      | **Neither tool is installed.** No `.eslintrc*`, no `eslint.config.*`, no `.prettierrc`. `code-style.md` states the 300-line rule; nothing enforces it | Migrate — see §8. Until then **no mechanical gate exists in this repo** and the Judge carries the full load |
| 12  | Node pinned via `engines` + `.nvmrc` | Pinned only by `server/Dockerfile` (`node:20-alpine`); client build inherits whatever Vercel picks                                                    | Migrate — one-line fix, bundle into the pnpm ticket                                                         |

Everything in `STACK.md` **not** listed above applies to Hundo in full — including
the entire anti-preferences list, the suppression-comment ban, the
agents-never-touch-prod-credentials rule, and the deviation procedure itself.

## 4. Commands

Verified against the repo 2026-08-14. Not npm workspaces — the root delegates with
`--prefix`, and each package has its own lockfile.

```bash
# install everything
npm run install:all           # root + server + client

# local development
npm run dev                   # concurrently: server (node --watch) + client (vite)
npm run dev:server
npm run dev:client

# tests — Vitest + Supertest against a real test database
npm test                      # root → delegates to server
npm --prefix server run test              # vitest run
npm --prefix server run test:watch
npm --prefix server run test -- <path>    # single file

# migrations
npm --prefix server run migrate:up
npm --prefix server run migrate:down
npm --prefix server run migrate:create -- <name>

# build
npm --prefix client run build
```

**Test database — read this before writing any test.**

- Connection resolves from **`DATABASE_URL`** in `server/vitest.config.js`, falling
  back to `postgresql://postgres:password@localhost:5432/hundo_test` when unset.
  An import-time guard in `server/src/test/setup.js` refuses to run unless the
  resolved database name marks it as a test database (contains "test"), and
  likewise if the value is absent or unparseable — so the suite cannot silently
  point at a real database.
- It is a **local Postgres instance**, _not_ the compose service (compose uses host
  `postgres`, database `hundo` — a different database). The test DB must exist
  locally before the suite runs.
- `NODE_ENV=test` no-ops rate limiting and email sending. RAWG is stubbed with fake
  data — no network calls, no quota burn, no flakiness.
- `setupFiles` truncates `backlog_entries`, `games`, `users`, `auth_tokens`, and
  `game_collections` after each test; `fileParallelism: false`.
- Never point the suite at a database holding real data.

- Node: pinned only by `server/Dockerfile` (`node:20-alpine`). Assume **Node 20**.

## 5. Conventions

- **Backend**: route handlers stay thin and pass errors to `next(err)`; the single
  centralized error middleware (four-arg, registered last) owns the response shape
  `{ error: { message, code } }`. Agents never handle errors inline in a route.
- **Validation**: Zod schemas on every request body; schemas shared with the client
  where the shape is the same.
- **API surface**: all routes under `/api/v1/`. Static routes are declared _before_
  parameterised ones (`/games/discover` before `/games/:rawgId`) — a real bug class
  in this repo, not a style preference.
- **RAWG**: all RAWG calls originate server-side; the API key never reaches the
  browser. Metadata is cached in the local `games` table on first add;
  curated rows cache in `game_collections` with 24h stale-while-revalidate.
- **Frontend**: server state via TanStack Query only (no client-state library);
  mutations invalidate the relevant query keys and fire a toast; forms via React
  Hook Form + Zod resolvers.
- **File size**: `max-lines: 300` per `STACK.md` (already stated in the repo's own
  `code-style.md`, currently unenforced). Grandfathered files, as of 2026-08-14 —
  a ticket that touches one splits it:
  - `client/src/pages/GameDetailPage.jsx` — 357
  - `server/src/routes/auth.js` — 325
- **Existing agent context files**: the repo already carries `code-style.md` and
  `CLAUDE.local.md`. This `PROJECT.md` is the authority for pipeline work; those
  files must be reconciled with it (fold their content in, or have them defer to
  it) so agents never receive two conflicting sets of instructions.
- **Ownership checks**: every backlog mutation verifies the entry belongs to the
  authenticated user. This is a security invariant — a diff that touches
  `backlog` routes without preserving it is an automatic Judge bounce.

## 6. Testing law (project-scoped)

Backbone is already in place and is the pattern to follow: **Vitest + Supertest
against a real Postgres test database**, no mocking of internal modules, TDD
(red → green → refactor), tests asserting HTTP-observable behaviour — status codes,
response bodies, database side effects — never internal implementation details.

A test that passes for the wrong reason is worse than no test. Cosmetic and
assertion-free tests are Judge-bounceable.

**Coverage gates (changed-line):**

| Area      | Threshold | Notes                                        |
| --------- | --------- | -------------------------------------------- |
| `server/` | **70%**   | Active from ticket #1                        |
| `client/` | **50%**   | Activates when the RTL harness ticket merges |

Excluded from the gate: generated files, migrations, pure-presentational layout
components.

**Playwright smoke pack** (5–8 specs max, added after the RTL harness). Proposed
critical paths — confirm at the harness ticket's plan gate:

1. Register → verification → login
2. Login → search a game → open detail → add to backlog
3. Backlog: edit an entry's status/rating → persists after reload
4. Backlog: delete with confirmation
5. Profile renders stats for a seeded backlog
6. Unauthenticated visit to a protected route redirects to login

## 7. Security fences

- **`security`-labeled paths** — any diff touching auth routes, the token/refresh
  logic, `auth_tokens`, password hashing, or the ownership checks in backlog routes:
  top-tier model for Plan and Judge, full gates regardless of ticket class, never
  the cheap/mechanical lane.
- **Secrets**: `RAWG_API_KEY`, `RESEND_API_KEY`, `JWT_*` secrets, and the production
  `DATABASE_URL` live in the OCI host environment and GitHub Actions secrets only.
  Agents get `.env.example` and local/test services. No exceptions, no deviations.
- **`DEMO_MODE`** returns verification tokens in API responses so recruiters can
  self-verify. It is a showcase affordance with a real weakness (a registrant can
  verify an address they don't own). It stays **off by default**, and no ticket may
  extend its reach beyond the two endpoints it already touches without an explicit
  plan-gate deviation.
- Rate limiting is per-route with independent buckets; `refresh`, `logout`, and
  `/me` are deliberately unlimited. Changing either fact requires a deviation —
  the asymmetry is intentional, not an oversight.

## 8. Migration backlog (system-built, in priority order)

These are tickets the pipeline works through on Hundo, roughly in this order:

0. **Test-harness hygiene** — add `auth_tokens` and `game_collections` to the
   truncation list; make `DATABASE_URL` env-overridable with the current value as
   the fallback. **Proposed Stage 1 hand-run ticket**: small, backend-only,
   verifiable (write a test that fails on leaked state, then fix it), and it repairs
   the foundation every later ticket stands on.
1. **Frontend test harness** — Vitest + RTL on the existing Vite setup, plus a
   `client` test script. _First orchestrated ticket._ Activates the client coverage
   gate at 50%.
2. **npm → pnpm + Node pin** — collapse three lockfiles into one, add `engines` and
   `.nvmrc` at Node 20. Small, mechanical, unlocks phantom-dependency protection.
3. **ESLint + Prettier from scratch** — not "adopt the shared config" but _create_
   it: Hundo has no lint tooling at all, so this ticket both builds the shared
   package in `styr` and wires Hundo to it (`max-lines: 300`, import restrictions,
   snapshot ban). Until it lands, Hundo has **no mechanical gates** and the Judge is
   the only line of defence — which is a reason to sequence it early.
4. **Server → TypeScript strict** — the big one, and it carries the CJS → ESM
   conversion with it. Excellent agent work: mechanical, verifiable, large diff no
   human wants to hand-write. Do it _after_ the lint and package-manager tickets so
   the gates are already watching.
5. **Client → TypeScript strict** — after the server migration proves the pattern;
   default → named exports rides along.
6. **Playwright smoke pack** — once the client is typed and the harness is mature.
7. _(Optional, later)_ Raw SQL → Drizzle, one module at a time.

Feature and bug tickets interleave freely with these; the migration list is a
standing backlog, not a freeze.

## 9. Verification status

Repo inspected 2026-08-14; all seven original questions resolved and folded into
§3, §4, §5, and §8. Remaining open items, none blocking the first ticket:

- [ ] Reconcile `code-style.md` and `CLAUDE.local.md` with this file (§5) — fold in
      or defer, so agents get one instruction set.
- [x] Confirm how CI provisions Postgres for the Vitest run today — a
      `postgres:16-alpine` service container on the default port. `.github/
      workflows/ci.yml` now passes `DATABASE_URL` to both the migrate and test
      steps explicitly, rather than the test step riding on vitest.config.js's
      fallback (#4).
- [ ] Decide whether `client` gets its own `vitest.config` or shares the root one
      when the RTL harness lands (harness ticket's plan gate).
