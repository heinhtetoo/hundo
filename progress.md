# Hundo — Project Progress

## Phase 1 — Project Scaffolding
- [x] Initialise monorepo (root `package.json`, `client/`, `server/` directories)
- [x] Create root `.gitignore` (covers Node, React, Docker, env files)
- [x] Create `server/.env.example` documenting all required backend env vars
- [x] Initialise git repository

## Phase 2 — Backend Foundation
- [x] Initialise Express app (`server/`) with entry point, middleware, and router wiring
- [x] Set up Docker Compose for local dev (postgres + backend services)
- [x] Configure `pg` database connection pool
- [x] Set up `node-pg-migrate` and create initial migration runner scripts
- [x] Set up centralised error-handling middleware
- [x] Set up `express-rate-limit` on auth routes
- [x] Configure environment variable loading with `dotenv`

## Phase 3 — Database Migrations
- [x] Migration: create `users` table
- [x] Migration: create `games` table
- [x] Migration: create `backlog_entries` table with status enum and FK constraints

## Phase 4 — Authentication (TDD)
- [x] `POST /api/v1/auth/register` — register with email + password (bcrypt hash)
- [x] `POST /api/v1/auth/login` — issue access token + refresh token in httpOnly cookies
- [x] `POST /api/v1/auth/refresh` — rotate refresh token, issue new access token
- [x] `POST /api/v1/auth/logout` — clear both cookies
- [x] `GET /api/v1/auth/me` — return current user from access token
- [x] Auth middleware (`verifyToken`) — protect all non-auth routes
- [x] Zod validation schemas for all auth request bodies

## Phase 5 — Games API (TDD)
- [x] `GET /api/v1/games/search?q=` — proxy search to RAWG, return trimmed payload
- [x] `GET /api/v1/games/:rawgId` — fetch single game from RAWG (or local cache)

## Phase 6 — Backlog API (TDD)
- [x] `POST /api/v1/backlog` — upsert game into `games` table, create backlog entry
- [x] `GET /api/v1/backlog` — fetch authenticated user's entries (filter, search, sort)
- [x] `PUT /api/v1/backlog/:id` — update entry fields (ownership enforced)
- [x] `DELETE /api/v1/backlog/:id` — delete entry (ownership enforced)
- [x] Zod validation schemas for backlog request bodies

## Phase 7 — Stats API (TDD)
- [x] `GET /api/v1/stats` — return status counts, genre distribution, completion rate, total hours, top-5 games

## Phase 8 — Testing Setup
- [x] Configure Vitest + Supertest with a dedicated test database
- [x] Auth route integration tests
- [x] Auth middleware tests
- [x] Games route integration tests
- [x] Backlog route integration tests (including ownership enforcement)
- [x] Stats route integration tests

## Phase 9 — Frontend Foundation
- [x] Initialise React app in `client/` with Vite
- [x] Configure Tailwind CSS
- [x] Set up React Router v6 with all six routes
- [x] Set up TanStack Query provider
- [x] Set up `AuthContext` (fetch `/api/v1/auth/me` on load, expose login/logout/isAuthenticated)
- [x] Create `ProtectedRoute` wrapper component
- [x] Configure Vite dev proxy to backend

## Phase 10 — Frontend Pages & Components
- [x] Landing page (`/`) — marketing/logged-out home
- [x] Register page (`/register`) — React Hook Form + Zod
- [x] Login page (`/login`) — React Hook Form + Zod
- [x] Navbar with global game search input
- [x] Backlog page (`/backlog`) — collection view with filter, sort, text search
- [x] Game detail page (`/games/:id`) — metadata + backlog entry editor
- [x] Dashboard page (`/dashboard`) — four Recharts charts

## Phase 11 — Deployment
- [x] Write `Dockerfile` for the Express backend
- [x] Write production `docker-compose.yml` for OCI
- [x] Configure GitHub Actions workflow (run Vitest → SSH deploy to OCI → Vercel auto-deploy)
- [x] Set up Vercel project linked to `client/` subdirectory
- [x] Add QEMU + Buildx for linux/arm64 cross-platform Docker builds
- [x] Add `BASE_PATH` support so Express handles `/hundo/api` prefix behind Tailscale Funnel
- [x] Wire in Tailscale GitHub Action so CI runner can SSH to OCI
- [x] Fix cross-site cookie sending for Chrome/Firefox (`SameSite=None` in production)
- [x] Fix Safari ITP cookie blocking via Vercel proxy rewrites (`/api/*` → OCI backend)

## Phase 12 — Polish
- [x] Fix completion rate to exclude wishlist + backlog from denominator
- [x] Add toast notifications (react-hot-toast) on save / add / delete
- [x] Add inline delete confirmation to prevent accidental removals
- [x] Add notes character counter (live `/2000` display)
- [x] Fix dashboard top-rated chart title truncation

## Phase 13 — Session Resilience, Richer Detail, Engagement
- [x] Add `apiFetch` wrapper with single-flight silent token refresh on 401
- [x] Redirect to login on real expiry via `auth:expired` event (no manual refresh)
- [x] Expand game detail: Metacritic, dev/publisher, ESRB, playtime, website
- [x] Add screenshots gallery (new RAWG screenshots endpoint)
- [x] Add star-rating widget replacing the rating number input
- [x] Add richer dashboard stats (avg rating, longest game, top genre, recently completed)

## Phase 14 — Multi-status Filter, User-defined Sort Order, PRD Sync

### Backlog filtering & sorting (to original PRD spec)
- [x] Backend: parse `status` as comma-separated list, validate against `STATUSES`, filter via `be.status::text = ANY($n)` (`server/src/routes/backlog.js`)
- [x] Backend: accept `order` param (asc/desc, whitelisted), fall back to `SORT_MAP` column default; keep `SORT_MAP` as the sort-column whitelist
- [x] Frontend: multi-select status toggle buttons + `All` clear button (`client/src/pages/BacklogPage.jsx`)
- [x] Frontend: asc/desc order toggle beside the sort dropdown; send `status` (joined) + `order`, add both to query key
- [x] Tests: multi-status filter, invalid-status ignored, user-defined order asc/desc (`server/test/backlog.test.js`)

### PRD.md sync (approved edits)
- [x] Point 1 (line 80): rewrite token-refresh to describe the actual `apiFetch` wrapper
- [x] Point 2 (line 78): cookies `SameSite=Lax` + same-origin Vercel proxy (not `SameSite=None`)
- [x] Point 3 (line 81): add `register`, `user`, `isLoading` to AuthContext exposed values
- [x] Point 4 (lines 94–98, story 12): add screenshots endpoint + enriched detail payload/story
- [x] Point 6 (line 110, stories 26/28/30): stats = active completion rate, top-5 by rating, avg rating, longest game, recently completed; pie chart; new stories
- [x] Point 7 (lines 112–119): add react-hot-toast + star-rating widget to frontend stack
- [x] Point 8 (General UX): add toast confirmation, delete confirmation, notes counter stories
- [x] Point 9 (deployment): Tailscale Funnel, `BASE_PATH` (`/hundo/api`), Vercel `/api/*` rewrites, Tailscale CI action
- [x] Point 5 (line 103): keep multi-status + asc/desc intent; use as-built `search` param name and add `order`
- [x] Minor: note rate limiting skipped in test env; suite now at 64 tests

### Verify
- [x] `npm test` (server) and `npm run build` (client) pass
- [x] Manual: multi-status union, asc/desc flip, `All` clears; PRD internally consistent

## Phase 15 — Email Verification + Game Discovery (Browse)

### Part A — Email Verification

#### A1. Database
- [x] Migration: `ALTER users ADD email_verified boolean NOT NULL DEFAULT false`; backfill existing rows to `true` in the same migration (`server/migrations/`)
- [x] Migration: `CREATE TABLE auth_tokens (id bigserial PK, user_id bigint FK→users ON DELETE CASCADE, type text NOT NULL, token_hash text NOT NULL, expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`; index `(user_id, type)` and `token_hash`

#### A2. Backend — token + email libs
- [x] `server/src/lib/authTokens.js` (new): `issueToken(userId, type)` — `crypto.randomBytes(32).toString('hex')`, store SHA-256 hash + expiry (delete any existing same-type row first), return the RAW token
- [x] `server/src/lib/authTokens.js`: `consumeToken(rawToken, type)` — hash, look up, check expiry, delete on success, return `user_id` or `null`
- [x] `server/src/lib/email.js` (new): generic `sendEmail({ to, subject, html })` + `sendVerificationEmail(to, link)`; transport via `EMAIL_PROVIDER` env — console.log in dev, no-op in `NODE_ENV=test`, Resend HTTPS in prod (single swappable send call)
- [x] `server/package.json`: add `resend` dependency
- [x] `server/.env.example`: add `EMAIL_PROVIDER`, `RESEND_API_KEY`, `EMAIL_FROM`

#### A3. Backend — auth routes (`server/src/routes/auth.js`)
- [x] `POST /register`: create user (unverified), `issueToken('email_verify')`, send email with `${CLIENT_URL}/verify-email?token=<raw>`, return `201 { message }`, STOP setting cookies
- [x] `POST /login`: after password check, if `!email_verified` return `403 { error: { code: 'EMAIL_NOT_VERIFIED' } }` before issuing cookies
- [x] `POST /verify-email` (new): body `{ token }`; `consumeToken('email_verify')`, set `email_verified = true`; idempotent-friendly response
- [x] `POST /resend-verification` (new): body `{ email }`; ALWAYS generic `200`; only re-issue + send when account exists AND unverified (enumeration-safe)
- [x] Confirm all new routes sit behind `authRateLimiter`
- [x] `server/src/validation/authSchemas.js`: add `verifyEmailSchema` (`token`) + `resendSchema` (`email`)

#### A4. Frontend
- [x] `client/src/pages/RegisterPage.jsx`: on success show "Check your inbox" state (no auto-login) + resend button
- [x] `client/src/pages/VerifyEmailPage.jsx` (new) + public route in `client/src/App.jsx`: read `?token=`, show "Verify my account" BUTTON (verify only on click, not page load), on success link to `/login`, handle expired/invalid with resend option
- [x] `client/src/pages/LoginPage.jsx`: handle `EMAIL_NOT_VERIFIED` 403 — clear message + "resend verification email" action
- [x] `client/src/context/AuthContext.jsx`: `register()` no longer expects a session; add `resendVerification(email)` helper (reuse `apiFetch`)

#### A5. Tests (`server/test/auth.test.js`)
- [x] register returns 201, no auth cookies, user is unverified
- [x] login on unverified account returns 403 `EMAIL_NOT_VERIFIED`
- [x] verify-email with valid token flips `email_verified` and login then succeeds
- [x] verify-email with expired/invalid token fails; token is single-use
- [x] resend-verification returns identical generic 200 for unknown vs pending vs already-verified; issues a usable token when pending
- [x] email transport is stubbed/no-op in `NODE_ENV=test`

### Part B — Game Discovery (`/discover`)

#### B1. Database
- [x] Migration: `CREATE TABLE game_collections (slug text PRIMARY KEY, title text NOT NULL, payload jsonb NOT NULL, refreshed_at timestamptz NOT NULL DEFAULT now())` (separate from `games`)

#### B2. Backend — RAWG client (`server/src/lib/rawg.js`)
- [x] `listGames(params)`: forward `genres`, `platforms`, `dates`, `ordering`, `page`, `page_size` to RAWG `/games`; return the trimmed list shape used by search
- [x] `getGenres()` / `getPlatforms()`: fetch RAWG reference lists for filter dropdowns

#### B3. Backend — games routes (`server/src/routes/games.js`, behind `verifyToken`)
- [x] `GET /discover`: 3 curated rows; lazy stale-while-revalidate vs `game_collections` (serve cached payload now; if a row >24h old refresh in background; keep last-good on RAWG failure). Rows: Top Rated (`ordering=-rating` + rating/metacritic floor), New & Recent (`dates=<90d ago>,<today>&ordering=-released`), Popular (`ordering=-added`)
- [x] `GET /browse`: live filtered grid; params `genre`, `platform`, `year`, `sort`, `order`, `page`; whitelist `sort`/`order` with `SORT_MAP`-style guard (see `backlog.js`); pass through to `rawg.listGames`; return `{ results, hasNext }`
- [x] `GET /genres` + `GET /platforms`: cached reference lists (reuse 24h cache approach)

#### B4. Frontend
- [x] Extract shared `client/src/components/GameCard.jsx` from `BacklogPage.jsx` (browse variant, no status/rating badge, links to `/games/:rawgId`)
- [x] `client/src/pages/DiscoverPage.jsx` (new) + protected route in `App.jsx`: default = 3 curated carousels from `/discover`; on any filter set → grid mode via `useInfiniteQuery` on `/browse` with "Load more" button
- [x] Filter pane: Genre, Platform, Year, Sort + asc/desc toggle (reuse toggle pattern from `BacklogPage.jsx`)
- [x] `client/src/components/Navbar.jsx`: add "Discover" link

#### B5. Tests (`server/test/games.test.js`)
- [x] discover returns 3 rows; second call within 24h serves from cache (no extra RAWG fetch); RAWG failure still serves last-good
- [x] browse forwards filters, validates/whitelists `sort`/`order`, paginates
- [x] genres/platforms return cached reference lists
- [x] all new routes return 401 unauthenticated

### Verify
- [x] `cd server && npm test` — 86 tests pass (72 auth/backlog/stats/games + 14 new discover/browse/genres/platforms)
- [x] `cd client && npm run build` — no errors
- [x] Manual (email transport = console): register → "check your inbox", grab logged link, login blocked (403) until button-click verify, then login succeeds; resend generic; expired token handled
- [x] Manual: `/discover` rows instant + cache-served on reload; genre/platform/year/sort filters → grid + "Load more"; card click → detail → add to backlog
- [x] Sync PRD.md: add stories + implementation notes for both features (`auth_tokens`/verification flow; discover endpoints + `game_collections` cache)

## Phase 16 — Forgot Password / Password Reset

Emailed-link reset flow that reuses the Phase 15 infrastructure (`auth_tokens`,
`issueToken`/`consumeToken`, pluggable email sender, per-route rate limiters,
`VerifyEmailPage` as UI template). New piece: session revocation on reset.

### Locked decisions (from grilling)
- Revoke existing sessions on reset via `users.password_changed_at` + an
  `issuedAtMs` claim embedded in new refresh JWTs (ms-precision; falls back to
  `iat*1000` for pre-existing tokens). Other sessions die within ≤15 min. Access
  tokens are not checked mid-life — the 15-min window is accepted.
- Reset-token expiry is 1 hour (verification stays 24h).
- Reset works regardless of verified status; a successful reset also sets
  `email_verified = true`.
- Redirect to `/login` after reset (no auto-login).
- Request endpoint is enumeration-safe (always generic 200; sends only when the
  account exists).

### B1. Database
- [x] Migration: add `password_changed_at timestamptz` (nullable) to `users`. No
  backfill — `NULL` means "never changed", so the refresh `iat` check is skipped
  for existing sessions. No change to `auth_tokens` (its `type` column already
  supports `password_reset`).

### B2. Backend — token + email libs
- [x] `server/src/lib/authTokens.js`: parameterise expiry per token type — replace
  the single `EXPIRY_MS` with a per-type map (`email_verify` 24h, `password_reset`
  1h, default 24h); `issueToken` looks up expiry by `type`. `consumeToken`
  unchanged (already type-aware)
- [x] `server/src/lib/email.js`: add `sendPasswordResetEmail(to, link)` mirroring
  `sendVerificationEmail`; reuse the existing `sendEmail` transport unchanged
- [x] `server/src/validation/authSchemas.js`: add `forgotPasswordSchema`
  (`{ email }`) and `resetPasswordSchema` (`{ token, password: min(8) }`)

### B3. Backend — auth routes (`server/src/routes/auth.js`)
- [x] `POST /forgot-password` (own `createAuthRateLimiter()`): look up user by
  email; if it exists `issueToken(id, 'password_reset')`, build
  `${CLIENT_URL}/reset-password?token=<raw>`, `sendPasswordResetEmail`; ALWAYS
  return generic `200`; in `NODE_ENV=test` expose `_resetToken` only when issued
- [x] `POST /reset-password` (own `createAuthRateLimiter()`): validate;
  `consumeToken(token, 'password_reset')`; `null` → `400 INVALID_TOKEN`; else
  `bcrypt.hash` and one `UPDATE` setting `password_hash`,
  `password_changed_at = now()`, `email_verified = true`; success message, no
  cookies
- [x] `POST /refresh`: select `password_changed_at`; compare via ms-precision
  `issuedAtMs` claim embedded in the refresh JWT (falls back to `iat*1000` for
  old tokens); revoke if token predates password change

### B4. Frontend
- [x] `client/src/context/AuthContext.jsx`: add `requestPasswordReset(email)` and
  `resetPassword(token, password)` helpers (thin `apiFetch` wrappers, like
  `resendVerification`); expose both
- [x] `client/src/pages/ForgotPasswordPage.jsx` (new) + public `/forgot-password`
  route in `App.jsx`: email input → generic "check your inbox" confirmation
- [x] `client/src/pages/ResetPasswordPage.jsx` (new) + public `/reset-password`
  route: read `?token=`, new-password + confirm-password fields (client-side match
  check), submit → success state linking to `/login`; invalid/expired token (only
  surfaces on submit) → error state linking to `/forgot-password`
- [x] `client/src/pages/LoginPage.jsx`: add a "Forgot password?" link

### B5. Tests (`server/test/auth.test.js`)
- [x] forgot-password returns identical generic 200 for unknown vs existing;
  issues a usable token only for an existing account (`_resetToken` present)
- [x] reset-password: old password stops working, new password logs in;
  `email_verified` flips true; token single-use; expired/invalid → 400; password
  < 8 chars → 400 validation
- [x] session revocation: a refresh cookie captured before the reset yields 401
  from `/refresh` afterwards; a fresh login refreshes fine

### Verify
- [x] `cd server && npm test` — 96 tests pass (86 prior + 10 new reset/revocation)
- [x] `cd client && npm run build` — no errors
- [x] Manual (email = console): two logged-in "devices"; request reset from a
  third; use logged link to set new password; redirect to login; old password
  fails, new works; open sessions bounced within ~15 min / on next refresh;
  expired/invalid token handled; unknown email still says "check your inbox"
- [x] Sync PRD.md: password-reset stories + notes (`password_changed_at` +
  `issuedAtMs` revocation, per-type token expiry, reset-also-verifies)
