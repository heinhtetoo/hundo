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

## Phase 17 — UI Polish (full redesign to the "Hundo" design system)

Re-skin **and** restructure the whole client to match the imported Claude Design
project, on both desktop and mobile. Presentation only — no backend/API/behaviour
changes; server tests stay green.

### Design source & locked decisions (from grilling)
- **Design source:** Claude Design project `298c6232-b112-4b89-970a-b7104198b113`
  ("Hundo site polish"). Files: `Hundo Screens.dc.html` (desktop, 13 screens) and
  `Hundo Screens Mobile.dc.html` (mobile, same 13). Re-read specifics per screen
  via the DesignSync MCP (`get_file`) — the inline tokens below are the summary,
  the HTML is the pixel-level truth.
- **Full redesign** — adopt the design's layouts, not just colours.
- **Profile replaces Dashboard** — rename `/dashboard` → `/profile`; rebuild as the
  design's Profile. Drop Recharts pie/bar; fold stat data into tiles + arc. Nav =
  **Backlog / Discover / Profile**.
- **Full responsive parity** — implement desktop *and* mobile per both files.
  Mobile = bottom **tab bar** (Backlog/Discover/Profile) + single-column reflows;
  sidebars/heroes collapse.

### Design tokens (establish once, reference everywhere)
- **Font:** Space Grotesk 300–700 (Google Fonts); default sans.
- **Surfaces:** page `oklch(7% 0.022 265)`; panel `oklch(8–10% 0.02 265)`; input
  `oklch(11% 0.022 265)`; borders `oklch(13–20% 0.022 265)`.
- **Brand amber:** `oklch(76% 0.19 55)` (logo, primary CTA, rings, active nav, 100%
  badge). Hover `oklch(81% 0.2 55)`. On-amber text `oklch(10% 0.02 55)`.
- **Accent indigo:** `oklch(62% 0.24 280)` (register button, links). Hover `67–68%`.
- **Text:** heading `oklch(96% 0.005 265)`; body `oklch(56% 0.013 265)`; muted
  `oklch(40–46% 0.013 265)`.
- **Semantic:** Metacritic green `oklch(72% 0.18 145)`; RAWG star = amber; status
  colours (backlog/playing/completed/dropped/wishlist).
- **Keyframes:** `floatA/B/C` (translateY ±10–16px loop, slight rotate),
  `glowPulse` (opacity 0.55↔1). Inputs: focus ring
  `box-shadow:0 0 0 3px oklch(76% 0.19 55 / 0.18)`, border → amber.

### P1. Foundation — theme + primitives
- [x] `client/index.html`: add Space Grotesk — `preconnect` to fonts.googleapis /
  fonts.gstatic + `css2?family=Space+Grotesk:wght@300;400;500;600;700`
- [x] `client/tailwind.config.js`: `theme.extend` → `fontFamily.sans` = Space
  Grotesk; semantic `colors` (surface 0–4 scale, brand, accent, text, border,
  status map, metacritic) as oklch literals; `keyframes` + `animation` for
  `floatA/B/C` + `glowPulse`
- [x] `client/src/index.css`: `@layer base` body bg/text + global input focus ring
  + placeholder colour; `@layer utilities` for `.dot-grid`
  (`radial-gradient(circle, oklch(100% 0 0 / 0.045) 1px, transparent 1px); 28px`)
  and `.glow` radial helpers
- [x] `client/src/components/ui/Button.jsx` (new): variants `primary` (amber),
  `secondary` (indigo), `outline`, `ghost`; sizes sm/md/lg; hover lift + glow
- [x] `client/src/components/ui/Input.jsx` + `Field.jsx` (new): styled input +
  label/error wrapper; replace inline inputs and the local `Field` in
  `BacklogEntryForm.jsx`
- [x] `client/src/components/ui/Card.jsx` (new): bordered surface panel
  (`oklch(10% 0.022 265)` bg, `oklch(18% 0.022 265)` border, radius 14px)
- [x] `client/src/components/ui/Badge.jsx` (new): `tag` / `status` / `metacritic` /
  `completion` variants — absorb `STATUS_COLOURS` (BacklogPage) + the Metacritic
  badge from `GameMeta.jsx` into this single source
- [x] `client/src/components/ui/CompletionRing.jsx` (new): conic-gradient ring,
  props `size`/`percent`/`label`; metric = completed ÷ total entries. Reused on
  Backlog sidebar, Profile hero, Game Details "Your Entry", auth brand panel
- [x] `client/src/components/ui/RatingBar.jsx` (new): 10-segment bar, display +
  interactive; align `StarRating.jsx` usage in `BacklogEntryForm` + Game Details

### P2. Shared shell & routing
- [ ] `client/src/App.jsx`: split the global wrapper into **PublicLayout** (minimal
  nav: amber logo + Sign in/Register, full-bleed, drop `max-w-6xl`) for
  landing/auth and **AppLayout** (top nav + mobile bottom tab bar, full-width) for
  protected screens. Rename route `/dashboard` → `/profile`
- [ ] `client/src/components/Navbar.jsx`: redesign — amber logo, search w/ icon,
  Backlog/Discover/Profile links with active amber underline, Sign out outline
  button; hidden `< md` (replaced by tab bar)
- [ ] `client/src/components/MobileTabBar.jsx` (new): fixed bottom tab bar
  (Backlog/Discover/Profile icon+label, active = amber), shown `< md` in AppLayout
- [ ] Update any `/dashboard` links/redirects across the client to `/profile`

### P3. Public / auth screens (re-skin + split-panel restructure)
- [ ] `LandingPage.jsx` (design 01): hero copy "Your backlog, actually managed.",
  dual CTAs (amber "Get started" + outline "Sign in"), floating game-cover cards
  visual (`floatA/B/C` + `glowPulse`), dot-grid + side glows; mobile = stacked
- [ ] `RegisterPage.jsx` (02) + `LoginPage.jsx` (03): split layout — left brand
  panel (completion-ring "H", "Built for completionists.", game-spine strip) +
  right form panel on the new primitives. Preserve Login's "Forgot password?" +
  `EMAIL_NOT_VERIFIED` states and Register's pending/resend state. Mobile = form
  only, brand condensed to top
- [ ] `VerifyEmailPage.jsx` (08/09/11) + "Check your inbox" (07) on RegisterPage +
  `ForgotPasswordPage.jsx` (12) + `ResetPasswordPage.jsx` + "Reset link sent" (13):
  centered branded status cards (ring/icon + heading + copy + CTA). Keep existing
  button-click-to-verify + token-on-submit behaviour
- [ ] Restyle global toasts (react-hot-toast) to the dark/amber theme

### P4. Core app screens
- [ ] `BacklogPage.jsx` (design 05): left **sidebar** (`CompletionRing` + status
  filter list with counts) + main responsive grid; keep multi-status filter / sort
  / search behaviour, restyle controls. Mobile = filters become a horizontal pill
  row, single/two-col grid, tab bar
- [ ] `GameCard.jsx`: redesign cover-forward (real RAWG art, gradient fallback) with
  completion/status badge + rating + hours; variants for backlog vs discover
- [ ] `GameDetailPage.jsx` (06): cinematic **hero** (RAWG cover bg + noise-grain SVG
  + bottom fade + breadcrumb + title + tag/Metacritic/RAWG badges) over two-col
  body — left About / Details grid / Screenshots; right "Your Entry" `Card`
  (segmented status control, `RatingBar`, hours, notes). Rebuild
  `BacklogEntryForm.jsx` on the new primitives. Mobile = hero + stacked single col
- [ ] `DiscoverPage.jsx` (10): header ("Discover" + count) + scrollable **category
  pills** + responsive grid + search; keep data + infinite-scroll behaviour, retire
  carousel-row layout to match design. Mobile = pills + single/two-col grid
- [ ] `ProfilePage.jsx` (rename from `DashboardPage.jsx`, design 04): hero (avatar =
  email initials + completion arc + identity + stat tiles: games / hours / avg
  rating / top genre) + completion donut with Done/Playing/Backlog counts +
  **Library** section (filter pills + game grid). Reuse existing stat computations;
  derive display name + member-since from email/`created_at`; derive tier from
  completion %. Drop Recharts (optional simple genre bars). Mobile = stacked

### Data-availability assumptions (no schema change)
- Avatar = email initials; display name/handle derived from email; member-since
  from `users.created_at`. Mock's bio/handle/tier fields omitted or derived.
- Cover gradients in the mock are placeholders — use real RAWG art where present,
  gradient fallback when missing.

### Verify
- [ ] `cd client && npm run dev`; drive each route with chromium-cli/Playwright at
  **1440px** and **390px**, screenshot, compare to the matching desktop/mobile
  design screen (`/`, `/login`, `/register`, `/forgot-password`, `/reset-password`,
  `/verify-email` + states, `/backlog`, `/games/:id`, `/discover`, `/profile`).
  **Look at the screenshots** — correct fonts/colours, no blank frames, no console
  errors
- [ ] `cd client && npm run build` — clean build
- [ ] Spot-check: nav active states, mobile tab bar, Game Details status control +
  rating, Discover pills, Backlog filters, completion rings with real data
- [ ] `cd server && npm test` still green (no backend change)
- [ ] Sync PRD.md: note the design-system adoption (Space Grotesk, oklch token
  palette, primitive component library, `/dashboard` → `/profile`, responsive
  tab-bar shell)
