# Hundo — Product Requirements Document

## Problem Statement

Gamers accumulate games faster than they can play them — through sales, bundles, subscriptions, and gifts — resulting in a backlog that grows invisibly and feels unmanageable. There is no dedicated, lightweight tool that lets a player record which games they own, track where they are in each one, rate what they have played, and see a clear picture of their gaming habits over time. Existing solutions are either too broad (spreadsheets), socially focused rather than personal (Backloggd, HowLongToBeat), or locked into a specific platform ecosystem. Players need a personal, private space to manage their pile of unplayed games and make intentional decisions about what to play next.

## Solution

Hundo is a multi-user, full-stack web application that gives each player a private game backlog. Users search a large game catalog, add titles to their collection, and assign each entry a play status, rating, hours played, and personal notes. A profile page surfaces patterns in their gaming habits — completion rates, genre preferences, and time invested — helping them decide what to play next and see progress over time. The name is a nod to "getting a hundo" — gaming slang for 100%-ing a game — reflecting the app's purpose of helping players track their journey through their backlog.

## User Stories

### Authentication

1. As a new user, I want to register with an email and password, so that I can create a private account and backlog. I expect to verify my email address before the account can be used.
2. As a returning user, I want to log in with my email and password, so that I can access my backlog from any device.
3. As a logged-in user, I want my session to persist across browser refreshes, so that I do not have to log in every time I visit the app.
4. As a logged-in user, I want my access token to be automatically refreshed in the background, so that my session does not expire mid-use.
5. As a logged-in user, I want to log out, so that my account is secured when I am done.
6. As a user with an expired or invalid session, I want to be redirected to the login page, so that I am not left in a broken authenticated state.
7. As a user, I want my password stored securely, so that my account is not compromised if the database is breached.
39. As a new user, I want to receive a verification email with a link after registering, so that I can confirm I own the email address before using the app.
40. As a new user, I want to verify my email by clicking a button on the verification page rather than having it happen automatically when the page loads, so that email-client link prefetching does not consume my single-use link.
41. As an unverified user, I want my login attempt to be rejected with a clear message and an option to resend the verification email, so that I understand I must verify before I can sign in.
42. As a user whose verification link has expired or been lost, I want to request a new one, so that I can finish verifying without registering again.
47. As a user who forgot their password, I want to request a reset link by email, so that I can regain access without creating a new account.
48. As a user resetting my password, I want to set a new password via the emailed link and then sign in with it, so that I can recover my account securely.
49. As a user who just reset my password, I want any other active sessions signed out, so that someone who may have had access is locked out.

### Game Search

8. As a logged-in user, I want to search for games by title, so that I can find specific games to add to my backlog.
9. As a logged-in user, I want to see search results with a cover image, title, release year, and genres, so that I can identify the correct game at a glance.
10. As a logged-in user, I want search to be accessible from the navigation bar on every page, so that I can find and add games without navigating away from what I am doing.
11. As a logged-in user, I want to click through to a game's detail page from search results, so that I can see more information before adding it to my backlog.

### Game Discovery

43. As a logged-in user, I want a Discover page with curated rows — Top Rated, New & Recent Releases, and Popular — so that I can find games to add beyond searching for an exact title.
44. As a logged-in user, I want to filter discovery by genre, platform, and release year and sort the results in ascending or descending order, so that I can narrow the catalog to what interests me.
45. As a logged-in user, I want a "Load more" button to page through filtered discovery results, so that I can keep browsing without overwhelming the initial view.
46. As a logged-in user, I want to click a game card on the Discover page to open its detail page, so that I can add it to my backlog through the existing flow.

### Game Detail

12. As a logged-in user, I want to view a game's detail page showing its cover image, title, release year, genres, platforms, Metacritic score, developer, publisher, ESRB rating, average playtime, and official website, so that I have full context before adding it. I also want to browse a screenshot gallery on the same page.
13. As a logged-in user, I want to add a game to my backlog directly from its detail page, so that the action is one step.
14. As a logged-in user who already has the game in my backlog, I want to edit my backlog entry directly from the game's detail page, so that I can update it without searching for it in my collection.

### Backlog Management

15. As a logged-in user, I want to view all games in my backlog on a single page, so that I can see my full collection at once.
16. As a logged-in user, I want to assign a status to each backlog entry — Backlog, Playing, Completed, Dropped, or Wishlist — so that I can track where I am with each game.
17. As a logged-in user, I want to assign a rating from 1 to 10 to a backlog entry, so that I can record my opinion of games I have played.
18. As a logged-in user, I want to leave a rating field empty, so that I am not forced to rate games I have not yet played or finished.
19. As a logged-in user, I want to log how many hours I have played a game, so that I can track my time investment.
20. As a logged-in user, I want to write personal notes on a backlog entry, so that I can record thoughts, tips, or reminders for myself.
21. As a logged-in user, I want to edit any field of a backlog entry after it has been created, so that I can keep my records up to date as I play.
22. As a logged-in user, I want to delete a game from my backlog, so that I can remove entries I no longer care about.
23. As a logged-in user, I want to filter my backlog by one or more statuses simultaneously, so that I can focus on a specific subset of my collection.
24. As a logged-in user, I want to search for a game by title within my backlog, so that I can quickly find a specific entry in a large collection.
25. As a logged-in user, I want to sort my backlog by title, date added, rating, or hours played in ascending or descending order, so that I can view my collection in the order most useful to me at the time.

### Profile

26. As a logged-in user, I want to see my backlog broken down by status as a completion ring plus per-status counts on my profile, so that I can see at a glance how much of my collection I have completed versus left to play.
27. As a logged-in user, I want my most-played genres reflected in my profile stats, so that I can understand my genre preferences.
28. As a logged-in user, I want to see my completion rate over active games (completed, playing, and dropped — excluding wishlist and backlog) as a single stat, so that I can track my progress through games I have actually engaged with.
29. As a logged-in user, I want to see my total hours played across all backlog entries, so that I know how much time I have invested in gaming.
30. As a logged-in user, I want to see a list of my top 5 highest-rated games, so that I can quickly recall my favourites.
31. As a logged-in user with an empty backlog, I want the profile to show an empty state with a prompt to add games, so that I am not left with a broken or empty-looking page.
32a. As a logged-in user, I want to see my average rating across all rated games, so that I have a sense of my overall enjoyment.
32b. As a logged-in user, I want to see my longest game by hours played, so that I can identify where I have spent the most time.
32c. As a logged-in user, I want to see my most-played genre, so that I understand my genre preferences at a glance.
32d. As a logged-in user, I want to see a list of my recently completed games, so that I can remember what I just finished.
32e. As a logged-in user, I want a profile page showing my avatar, a library-completion ring, member-since, headline stats (games, hours, average rating, top genre), and a filterable grid of my library, so that I have a personal home summarising my collection and progress.

### General UX

32. As an unauthenticated user, I want to see a landing page describing the app, so that I understand what Hundo does before signing up.
33. As an unauthenticated user trying to access a protected page, I want to be redirected to the login page, so that I am prompted to authenticate rather than seeing an error.
34. As a user on any page, I want clear loading states during data fetches, so that I know the app is working and not frozen.
35. As a user on any page, I want clear error messages when something goes wrong, so that I understand what happened and what to do next.
36. As a logged-in user, I want to receive a toast notification when I add, save, or delete a backlog entry, so that I know my action succeeded without having to reload the page.
37. As a logged-in user, I want a confirmation step before deleting a backlog entry, so that I do not accidentally remove a game from my collection.
38. As a logged-in user, I want to see a live character count while writing notes, so that I know how close I am to the 2,000-character limit.

## Implementation Decisions

### Architecture

- Monorepo with `client/` (React frontend) and `server/` (Express backend) directories and a root `package.json` for shared scripts.
- All backend API routes are versioned under `/api/v1/`.
- The frontend is a single-page application (SPA) with client-side routing.
- The backend serves only JSON API responses; HTML is served entirely by the React frontend.

### Authentication

- JWTs are used for stateless authentication. The access token is short-lived (15 minutes); the refresh token is long-lived.
- Both tokens are stored in `httpOnly` cookies (`Secure` in production, `SameSite=Lax`). Cookies are never stored in `localStorage` or `sessionStorage`. Cross-site and Safari ITP restrictions are avoided by proxying all API requests through the same Vercel origin (`/api/*` → OCI backend), keeping cookie sends same-origin.
- Password hashing uses bcrypt.
- Registration creates an unverified account, issues no session cookies, sends a verification email, and returns a "check your inbox" message. Login verifies the password and then rejects unverified accounts with `403 EMAIL_NOT_VERIFIED` before issuing any tokens.
- Email verification uses single-use tokens stored hashed (SHA-256) in the `auth_tokens` table with a 24-hour expiry. `POST /api/v1/auth/verify-email` consumes the token and sets `email_verified = true`; the verification page triggers this only on an explicit button click, so email-client link prefetching cannot consume the link. `POST /api/v1/auth/resend-verification` is enumeration-safe — it always returns a generic 200, sends a new link only when the account exists and is unverified, and invalidates the previous token.
- Emails are sent through a pluggable sender selected by the `EMAIL_PROVIDER` environment variable: a no-op in `NODE_ENV=test`, a console-logged link in development, and the Resend HTTP API in production. The send call lives in one place so the transport is swappable.
- Password reset: `POST /api/v1/auth/forgot-password` is enumeration-safe — it always returns a generic 200 and sends a reset link only when the account exists. `POST /api/v1/auth/reset-password` consumes a single-use token (the same hashed `auth_tokens` mechanism, with a 1-hour expiry), sets the new password hash, and also sets `email_verified = true` (receiving the link proves inbox control). Reset works regardless of verification status; on success the user is redirected to log in (no auto-login).
- Resetting a password revokes existing sessions: a `users.password_changed_at` timestamp is set on reset, and `POST /api/v1/auth/refresh` rejects any refresh token issued before it. Refresh tokens carry a millisecond-precision `issuedAtMs` claim for this comparison (falling back to the second-precision `iat` for older tokens). Already-issued access tokens remain valid until they expire (≤15 minutes); they are not checked on every request.
- Token refresh is handled transparently by a custom `apiFetch` wrapper. On any 401 response, the wrapper calls `POST /api/v1/auth/refresh` (with single-flight deduplication to prevent concurrent refresh races), retries the original request once, and emits an `auth:expired` DOM event if the refresh also fails. `AuthContext` listens for that event, clears auth state, and triggers a redirect to `/login` via `ProtectedRoute`.
- Auth state on the frontend is managed by a single `AuthContext` that fetches the current user from `GET /api/v1/auth/me` on app load and exposes `login`, `logout`, `register`, `resendVerification`, `requestPasswordReset`, `resetPassword`, `user`, `isLoading`, and `isAuthenticated`.
- Rate limiting via `express-rate-limit` is applied per-route: each of `register`, `login`, `verify-email`, and `resend-verification` has its own independent bucket (10 requests per 15 minutes per IP). Session-maintenance routes (`refresh`, `logout`) and `/me` are intentionally not rate-limited — `refresh` is fired automatically by the client and must not exhaust the credential-endpoint budget.

### Database Schema

Three primary tables:

- **users**: `id`, `email` (unique), `password_hash`, `email_verified` (boolean, default `false`; existing accounts were backfilled to `true`), `password_changed_at` (timestamptz, nullable), `created_at`
- **games**: `id`, `rawg_id` (unique), `title`, `cover_image_url`, `genres` (jsonb), `platforms` (jsonb), `release_year`, `created_at`
- **backlog_entries**: `id`, `user_id` (FK → users), `game_id` (FK → games), `status` (enum: `backlog`, `playing`, `completed`, `dropped`, `wishlist`), `rating` (integer 1–10, nullable), `hours_played` (numeric, nullable), `notes` (text, nullable), `created_at`, `updated_at`

The `games` table acts as a local cache of RAWG metadata, populated at the moment a user first adds a game to their backlog. The `rawg_id` unique constraint prevents duplicate game records.

Two supporting tables back the newer features:

- **auth_tokens**: `id`, `user_id` (FK → users, `ON DELETE CASCADE`), `type` (text, e.g. `email_verify`, `password_reset`), `token_hash` (SHA-256 hex), `expires_at`, `created_at`. Indexed on `(user_id, type)` and on `token_hash`. The `type` column lets one table back multiple single-use token flows — email verification and password reset — each with its own expiry (24 hours and 1 hour respectively).
- **game_collections**: `slug` (primary key), `title`, `payload` (jsonb), `refreshed_at`. Caches the curated Discover rows so they can be served without hitting RAWG on every request.

### Games API (RAWG)

- All RAWG API requests originate from the Express backend. The RAWG API key is never exposed to the browser.
- `GET /api/v1/games/search?q=<query>` proxies to RAWG's game list endpoint and returns a trimmed payload.
- `GET /api/v1/games/:rawgId` fetches a single game from RAWG. The detail payload includes: id, name, background_image, genres, platforms, description, Metacritic score, rating count, developers, publishers, ESRB rating, average playtime, released date, and website.
- `GET /api/v1/games/:rawgId/screenshots` returns the game's screenshot list from RAWG (id + image URL per screenshot).
- `GET /api/v1/games/discover` returns three curated rows — Top Rated, New & Recent Releases, and Popular. It uses lazy stale-while-revalidate caching against the `game_collections` table: the cached payload is served immediately, a row older than 24 hours is refreshed in the background, and the last-good payload is kept if RAWG fails.
- `GET /api/v1/games/browse` returns a live filtered list. It accepts `genre`, `platform`, `year`, `sort`, `order`, and `page`; `sort` and `order` are whitelisted (as in the backlog API) and the remaining params are passed through to RAWG. The response shape is `{ results, hasNext }`.
- `GET /api/v1/games/genres` and `GET /api/v1/games/platforms` return RAWG reference lists for the filter dropdowns, cached with the same 24-hour approach.
- The static discovery routes are declared before `/:rawgId` so Express does not match them as a game id.
- On `POST /api/v1/backlog`, the backend upserts the game into the local `games` table before creating the backlog entry.

### Backlog API

- `GET /api/v1/backlog` — returns the authenticated user's entries. Accepts query params: `status` (comma-separated), `search` (title search), `sort` (`title` | `created_at` | `rating` | `hours_played`), `order` (`asc` | `desc`). Filtering and sorting are handled in SQL.
- `POST /api/v1/backlog` — creates a new entry. Body validated with Zod.
- `PUT /api/v1/backlog/:id` — updates an entry. Ownership verified before update.
- `DELETE /api/v1/backlog/:id` — deletes an entry. Ownership verified before delete.

### Stats API

- `GET /api/v1/stats` — returns all dashboard data in a single response to avoid multiple round trips: status counts, genre distribution, active completion rate (completed ÷ completed+playing+dropped), total hours played, average rating across rated games, longest game by hours played, top-5 games by rating, and recently completed games. All computed in a single set of SQL queries server-side. Consumed by the Profile screen.

### Frontend Stack

- **Build tool**: Vite
- **Styling**: Tailwind CSS — configured with a custom design system (Space Grotesk type, an oklch semantic-token palette, and a reusable primitive library); see Frontend Design System below
- **Server state**: TanStack Query (React Query) — handles caching, loading/error states, cache invalidation after mutations, and infinite-query pagination for the Discover grid's "Load more" button
- **Forms**: React Hook Form with Zod resolvers via `@hookform/resolvers` — Zod schemas are shared with the backend
- **Routing**: React Router v6
- **Notifications**: react-hot-toast — toast confirmations for add, save, and delete actions
- **Rating widget**: custom `RatingBar` component — a 10-segment interactive 1–10 selector (replacing the earlier star-rating widget)

### Frontend Design System

- A single dark, completionist-themed design system. Typography is Space Grotesk; colour is defined as semantic oklch tokens in the Tailwind theme (layered `surface`/`edge` neutrals, an amber `brand`, an indigo `accent`, `content` text steps, and `status`/`metacritic` accents) rather than ad-hoc utility colours.
- A reusable primitive library in `client/src/components/ui/`: `Button`, `Input`, `Field`, `Card`, `Badge` (tag/status/metacritic/completion variants), `CompletionRing` (the conic-gradient "100%" motif reused across screens), and `RatingBar` (10-segment 1–10 selector).
- Two layout shells via nested routes: `PublicLayout` (minimal nav) wraps the landing and auth screens; `AppLayout` (top navigation bar plus a bottom tab bar on small screens) wraps the protected screens. Navigation is Backlog / Discover / Profile.
- The interface is responsive: the Backlog sidebar collapses to a filter pill row, split-panel auth drops to a single column, heroes and grids reflow, and a bottom tab bar replaces the top nav links below the `md` breakpoint.

### Error Handling

- Express uses a single centralized error-handling middleware (four-argument signature) registered last in the middleware chain.
- All route handlers pass errors to `next(err)` rather than handling inline.
- The error middleware serializes errors into a consistent JSON shape: `{ error: { message, code } }`.

### Environment & Configuration

- Backend uses `dotenv`. A committed `.env.example` documents all required variables, including the email-delivery settings (`EMAIL_PROVIDER`, `RESEND_API_KEY`, `EMAIL_FROM`) and `CLIENT_URL`, which is used to build verification links.
- Frontend requires only `VITE_API_URL` pointing to the deployed backend.
- Production environment variables are set in the OCI host environment and Vercel dashboard respectively — never committed.

### Deployment

- **Local development**: Docker Compose runs the Express backend and PostgreSQL together. The frontend runs via `vite dev` with a proxy to the backend.
- **Production backend**: Docker container on an OCI Ampere A1 free-tier instance. PostgreSQL runs in a container with a volume mounted to OCI block storage for persistence. The backend is exposed over HTTPS via Tailscale Funnel. A `BASE_PATH` environment variable (`/hundo/api`) is set so Express strips the tunnel prefix and routes requests correctly.
- **Production frontend**: Vercel, auto-deployed from the `main` branch via GitHub integration. Vercel rewrites (`/api/*` → OCI backend) proxy all API requests through the same origin, keeping cookie sends same-origin and bypassing Safari ITP.
- **CI/CD**: GitHub Actions on push to `main` — run the Vitest test suite, then deploy to OCI via SSH using the Tailscale GitHub Action to connect the CI runner to the private network (`docker compose pull && docker compose up -d`). Vercel deployment is triggered automatically by its GitHub integration.
- **Database migrations**: `node-pg-migrate`. Migrations run as part of the Docker entrypoint on container start.

## Testing Decisions

### What makes a good test

Tests verify external behavior observable through the HTTP interface — status codes, response bodies, side effects in the database — not internal implementation details like which SQL query was used or which helper function was called. Tests are written before the implementation (TDD: red → green → refactor) for all routes and middleware. A test that passes for the wrong reason (e.g. the route doesn't exist and a 404 happens to satisfy a `!== 500` assertion) is worse than no test.

### Testing seam

A single seam: the **Express HTTP API**, tested with Vitest + Supertest against a real PostgreSQL test database. This single seam exercises route handlers, auth middleware, Zod validation, SQL queries, and response formatting together, with no mocking of internal modules.

### What is tested

- **Auth routes**: registration (success, duplicate email, missing fields), login (success, wrong password, unknown email), token refresh (valid token, expired token, missing cookie), logout, and the `/me` endpoint.
- **Backlog routes**: CRUD operations including ownership enforcement (a user cannot read, update, or delete another user's entries), filtering, sorting, and search.
- **Game routes**: search proxy and single-game fetch.
- **Stats route**: correct aggregation values given a known backlog state.
- **Auth middleware**: protected routes return 401 without a valid access token.
- **Rate limiting middleware**: auth endpoints return 429 after the threshold is exceeded. Rate limiting is disabled in the test environment (`NODE_ENV=test`) to avoid interference.
- **Screenshots route**: authenticated access, trimmed payload, and 502 on RAWG failure.
- **Stats route**: correct aggregation (average rating, longest game, recently completed, top-5 by rating) given a known backlog state.
- **Email verification**: registration returns 201 with no auth cookies and an unverified user; login on an unverified account returns 403 `EMAIL_NOT_VERIFIED`; verifying with a valid token flips `email_verified` and lets login succeed; tokens are single-use and reject expired or invalid values; resend-verification returns an identical generic 200 for unknown, pending, and already-verified emails, issuing a usable token only when pending; email transport is a no-op in `NODE_ENV=test`.
- **Discovery routes**: discover returns three rows and serves the second call within 24 hours from cache (no extra RAWG fetch), keeping the last-good payload on RAWG failure; browse forwards and whitelists filters and paginates; genres and platforms return cached reference lists; all discovery routes return 401 unauthenticated.
- **Password reset**: forgot-password returns an identical generic 200 for unknown and existing emails (issuing a usable token only when the account exists); reset-password updates the password (old fails, new works), sets `email_verified = true`, is single-use, and rejects invalid or expired tokens and passwords shorter than 8 characters; resetting revokes existing sessions (a refresh token captured before the reset is rejected afterward, while a fresh login refreshes normally).

### Prior art

No prior tests exist (greenfield project). The first test file established for auth routes sets the pattern for all subsequent test files.

## Out of Scope

- **Social features**: sharing backlogs, following other users, public profiles.
- **Third-party OAuth**: Google, GitHub, or any other OAuth provider. Auth is hand-built with JWTs only.
- **Platform-specific integrations**: no Steam, PSN, or Xbox API sync.
- **Mobile application**: no native app — web-only, though the UI is responsive (desktop and mobile layouts, with a bottom tab bar on small screens).
- **Game recommendations**: no algorithm or suggestion engine.
- **Achievements or gamification**: no badges, streaks, or points system.
- **Multiple lists**: each user has exactly one backlog. No custom lists or shelves.
- **Friends or social graph**: users have no awareness of each other.
- **E2E testing**: no committed Playwright/Cypress suite. Ad-hoc Playwright screenshot runs and manual browser checks cover frontend correctness.
- **Frontend unit tests**: component-level tests are not written. Visual correctness is verified in the browser.
- **Admin panel**: no moderation or administrative interface.

## Further Notes

- The RAWG free tier allows 20,000 requests per month. For a personal app this limit is not a concern, but the local `games` table snapshot strategy reduces RAWG calls on subsequent visits by serving cached metadata from the database. The `game_collections` cache extends this to discovery: curated rows are refreshed at most once every 24 hours, so the Discover page costs a small, flat number of RAWG calls per month regardless of how often it is viewed.
- The name "Hundo" is gaming slang for 100%-ing a game — fully completing it including all side content and achievements. It reflects the app's purpose of helping players work through their backlog toward full completion.
- This project is built as both a learning exercise (applying and extending skills from the IBM Cloud Applications Development Foundations course) and a portfolio piece. Architectural decisions favour clarity, correctness, and demonstrable skill over brevity or convenience.
