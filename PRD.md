# Hundo — Product Requirements Document

## Problem Statement

Gamers accumulate games faster than they can play them — through sales, bundles, subscriptions, and gifts — resulting in a backlog that grows invisibly and feels unmanageable. There is no dedicated, lightweight tool that lets a player record which games they own, track where they are in each one, rate what they have played, and see a clear picture of their gaming habits over time. Existing solutions are either too broad (spreadsheets), socially focused rather than personal (Backloggd, HowLongToBeat), or locked into a specific platform ecosystem. Players need a personal, private space to manage their pile of unplayed games and make intentional decisions about what to play next.

## Solution

Hundo is a multi-user, full-stack web application that gives each player a private game backlog. Users search a large game catalog, add titles to their collection, and assign each entry a play status, rating, hours played, and personal notes. A stats dashboard surfaces patterns in their gaming habits — completion rates, genre preferences, and time invested — helping them decide what to play next and see progress over time. The name is a nod to "getting a hundo" — gaming slang for 100%-ing a game — reflecting the app's purpose of helping players track their journey through their backlog.

## User Stories

### Authentication

1. As a new user, I want to register with an email and password, so that I can create a private account and backlog.
2. As a returning user, I want to log in with my email and password, so that I can access my backlog from any device.
3. As a logged-in user, I want my session to persist across browser refreshes, so that I do not have to log in every time I visit the app.
4. As a logged-in user, I want my access token to be automatically refreshed in the background, so that my session does not expire mid-use.
5. As a logged-in user, I want to log out, so that my account is secured when I am done.
6. As a user with an expired or invalid session, I want to be redirected to the login page, so that I am not left in a broken authenticated state.
7. As a user, I want my password stored securely, so that my account is not compromised if the database is breached.

### Game Search

8. As a logged-in user, I want to search for games by title, so that I can find specific games to add to my backlog.
9. As a logged-in user, I want to see search results with a cover image, title, release year, and genres, so that I can identify the correct game at a glance.
10. As a logged-in user, I want search to be accessible from the navigation bar on every page, so that I can find and add games without navigating away from what I am doing.
11. As a logged-in user, I want to click through to a game's detail page from search results, so that I can see more information before adding it to my backlog.

### Game Detail

12. As a logged-in user, I want to view a game's detail page showing its cover image, title, release year, genres, and platforms, so that I have full context before adding it.
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

### Stats Dashboard

26. As a logged-in user, I want to see a donut chart breaking down my backlog by status, so that I can see at a glance how much of my collection I have completed versus left to play.
27. As a logged-in user, I want to see a horizontal bar chart of my top genres by number of games, so that I can understand my genre preferences.
28. As a logged-in user, I want to see my overall completion rate as a single stat, so that I can track my progress through my collection over time.
29. As a logged-in user, I want to see my total hours played across all backlog entries, so that I know how much time I have invested in gaming.
30. As a logged-in user, I want to see a list of my top 5 most-played games by hours, so that I can see where I have spent the most time.
31. As a logged-in user with an empty backlog, I want the dashboard to show an empty state with a prompt to add games, so that I am not left with a broken or empty-looking page.

### General UX

32. As an unauthenticated user, I want to see a landing page describing the app, so that I understand what Hundo does before signing up.
33. As an unauthenticated user trying to access a protected page, I want to be redirected to the login page, so that I am prompted to authenticate rather than seeing an error.
34. As a user on any page, I want clear loading states during data fetches, so that I know the app is working and not frozen.
35. As a user on any page, I want clear error messages when something goes wrong, so that I understand what happened and what to do next.

## Implementation Decisions

### Architecture

- Monorepo with `client/` (React frontend) and `server/` (Express backend) directories and a root `package.json` for shared scripts.
- All backend API routes are versioned under `/api/v1/`.
- The frontend is a single-page application (SPA) with client-side routing.
- The backend serves only JSON API responses; HTML is served entirely by the React frontend.

### Authentication

- JWTs are used for stateless authentication. The access token is short-lived (15 minutes); the refresh token is long-lived.
- Both tokens are stored in httpOnly, Secure, SameSite=Strict cookies — never in `localStorage` or `sessionStorage`.
- Password hashing uses bcrypt.
- Token refresh is handled transparently by the frontend using a TanStack Query retry interceptor or an Axios interceptor that calls `POST /api/v1/auth/refresh` on 401 responses.
- Auth state on the frontend is managed by a single `AuthContext` that fetches the current user from `GET /api/v1/auth/me` on app load and exposes `login`, `logout`, and `isAuthenticated`.
- Rate limiting via `express-rate-limit` is applied to all `/api/v1/auth/*` routes (10 requests per 15 minutes per IP).

### Database Schema

Three primary tables:

- **users**: `id`, `email` (unique), `password_hash`, `created_at`
- **games**: `id`, `rawg_id` (unique), `title`, `cover_image_url`, `genres` (jsonb), `platforms` (jsonb), `release_year`, `created_at`
- **backlog_entries**: `id`, `user_id` (FK → users), `game_id` (FK → games), `status` (enum: `backlog`, `playing`, `completed`, `dropped`, `wishlist`), `rating` (integer 1–10, nullable), `hours_played` (numeric, nullable), `notes` (text, nullable), `created_at`, `updated_at`

The `games` table acts as a local cache of RAWG metadata, populated at the moment a user first adds a game to their backlog. The `rawg_id` unique constraint prevents duplicate game records.

### Games API (RAWG)

- All RAWG API requests originate from the Express backend. The RAWG API key is never exposed to the browser.
- `GET /api/v1/games/search?q=<query>` proxies to RAWG's game list endpoint and returns a trimmed payload.
- `GET /api/v1/games/:rawgId` fetches a single game from RAWG (or serves the local record if already stored).
- On `POST /api/v1/backlog`, the backend upserts the game into the local `games` table before creating the backlog entry.

### Backlog API

- `GET /api/v1/backlog` — returns the authenticated user's entries. Accepts query params: `status` (comma-separated), `q` (title search), `sort` (`title` | `created_at` | `rating` | `hours_played`), `order` (`asc` | `desc`). Filtering and sorting are handled in SQL.
- `POST /api/v1/backlog` — creates a new entry. Body validated with Zod.
- `PUT /api/v1/backlog/:id` — updates an entry. Ownership verified before update.
- `DELETE /api/v1/backlog/:id` — deletes an entry. Ownership verified before delete.

### Stats API

- `GET /api/v1/stats` — returns all dashboard data in a single response to avoid multiple round trips: status counts, genre distribution, completion rate, total hours played, and top-5 games by hours played. All computed in a single set of SQL queries server-side.

### Frontend Stack

- **Build tool**: Vite
- **Styling**: Tailwind CSS
- **Server state**: TanStack Query (React Query) — handles caching, loading/error states, and cache invalidation after mutations
- **Forms**: React Hook Form with Zod resolvers via `@hookform/resolvers` — Zod schemas are shared with the backend
- **Charts**: Recharts
- **Routing**: React Router v6

### Error Handling

- Express uses a single centralized error-handling middleware (four-argument signature) registered last in the middleware chain.
- All route handlers pass errors to `next(err)` rather than handling inline.
- The error middleware serializes errors into a consistent JSON shape: `{ error: { message, code } }`.

### Environment & Configuration

- Backend uses `dotenv`. A committed `.env.example` documents all required variables.
- Frontend requires only `VITE_API_URL` pointing to the deployed backend.
- Production environment variables are set in the OCI host environment and Vercel dashboard respectively — never committed.

### Deployment

- **Local development**: Docker Compose runs the Express backend and PostgreSQL together. The frontend runs via `vite dev` with a proxy to the backend.
- **Production backend**: Docker container on an OCI Ampere A1 free-tier instance. PostgreSQL runs in a container with a volume mounted to OCI block storage for persistence.
- **Production frontend**: Vercel, auto-deployed from the `main` branch via GitHub integration.
- **CI/CD**: GitHub Actions on push to `main` — run the Vitest test suite, then deploy to OCI via SSH (`docker compose pull && docker compose up -d`). Vercel deployment is triggered automatically by its GitHub integration.
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
- **Rate limiting middleware**: auth endpoints return 429 after the threshold is exceeded.

### Prior art

No prior tests exist (greenfield project). The first test file established for auth routes sets the pattern for all subsequent test files.

## Out of Scope

- **Social features**: sharing backlogs, following other users, public profiles.
- **Third-party OAuth**: Google, GitHub, or any other OAuth provider. Auth is hand-built with JWTs only.
- **Platform-specific integrations**: no Steam, PSN, or Xbox API sync.
- **Mobile application**: web-only, though the UI will be responsive.
- **Game recommendations**: no algorithm or suggestion engine.
- **Achievements or gamification**: no badges, streaks, or points system.
- **Multiple lists**: each user has exactly one backlog. No custom lists or shelves.
- **Friends or social graph**: users have no awareness of each other.
- **E2E testing**: Playwright/Cypress is out of scope. Manual browser verification covers frontend correctness.
- **Frontend unit tests**: component-level tests are not written. Visual correctness is verified in the browser.
- **Admin panel**: no moderation or administrative interface.

## Further Notes

- The RAWG free tier allows 20,000 requests per month. For a personal app this limit is not a concern, but the local `games` table snapshot strategy reduces RAWG calls on subsequent visits by serving cached metadata from the database.
- The name "Hundo" is gaming slang for 100%-ing a game — fully completing it including all side content and achievements. It reflects the app's purpose of helping players work through their backlog toward full completion.
- This project is built as both a learning exercise (applying and extending skills from the IBM Cloud Applications Development Foundations course) and a portfolio piece. Architectural decisions favour clarity, correctness, and demonstrable skill over brevity or convenience.
