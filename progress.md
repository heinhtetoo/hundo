# Hundo — Project Progress

## Phase 1 — Project Scaffolding
- [x] Initialise monorepo (root `package.json`, `client/`, `server/` directories)
- [x] Create root `.gitignore` (covers Node, React, Docker, env files)
- [x] Create `server/.env.example` documenting all required backend env vars
- [x] Initialise git repository

## Phase 2 — Backend Foundation
- [x] Initialise Express app (`server/`) with entry point, middleware, and router wiring
- [x] Set up Docker Compose for local dev (postgres + backend services)
- [ ] Configure `pg` database connection pool
- [ ] Set up `node-pg-migrate` and create initial migration runner scripts
- [x] Set up centralised error-handling middleware
- [ ] Set up `express-rate-limit` on auth routes
- [x] Configure environment variable loading with `dotenv`

## Phase 3 — Database Migrations
- [ ] Migration: create `users` table
- [ ] Migration: create `games` table
- [ ] Migration: create `backlog_entries` table with status enum and FK constraints

## Phase 4 — Authentication (TDD)
- [ ] `POST /api/v1/auth/register` — register with email + password (bcrypt hash)
- [ ] `POST /api/v1/auth/login` — issue access token + refresh token in httpOnly cookies
- [ ] `POST /api/v1/auth/refresh` — rotate refresh token, issue new access token
- [ ] `POST /api/v1/auth/logout` — clear both cookies
- [ ] `GET /api/v1/auth/me` — return current user from access token
- [ ] Auth middleware (`verifyToken`) — protect all non-auth routes
- [ ] Zod validation schemas for all auth request bodies

## Phase 5 — Games API (TDD)
- [ ] `GET /api/v1/games/search?q=` — proxy search to RAWG, return trimmed payload
- [ ] `GET /api/v1/games/:rawgId` — fetch single game from RAWG (or local cache)

## Phase 6 — Backlog API (TDD)
- [ ] `POST /api/v1/backlog` — upsert game into `games` table, create backlog entry
- [ ] `GET /api/v1/backlog` — fetch authenticated user's entries (filter, search, sort)
- [ ] `PUT /api/v1/backlog/:id` — update entry fields (ownership enforced)
- [ ] `DELETE /api/v1/backlog/:id` — delete entry (ownership enforced)
- [ ] Zod validation schemas for backlog request bodies

## Phase 7 — Stats API (TDD)
- [ ] `GET /api/v1/stats` — return status counts, genre distribution, completion rate, total hours, top-5 games

## Phase 8 — Testing Setup
- [ ] Configure Vitest + Supertest with a dedicated test database
- [ ] Auth route integration tests
- [ ] Auth middleware tests
- [ ] Games route integration tests
- [ ] Backlog route integration tests (including ownership enforcement)
- [ ] Stats route integration tests

## Phase 9 — Frontend Foundation
- [ ] Initialise React app in `client/` with Vite
- [ ] Configure Tailwind CSS
- [ ] Set up React Router v6 with all six routes
- [ ] Set up TanStack Query provider
- [ ] Set up `AuthContext` (fetch `/api/v1/auth/me` on load, expose login/logout/isAuthenticated)
- [ ] Create `ProtectedRoute` wrapper component
- [ ] Configure Vite dev proxy to backend

## Phase 10 — Frontend Pages & Components
- [ ] Landing page (`/`) — marketing/logged-out home
- [ ] Register page (`/register`) — React Hook Form + Zod
- [ ] Login page (`/login`) — React Hook Form + Zod
- [ ] Navbar with global game search input
- [ ] Backlog page (`/backlog`) — collection view with filter, sort, text search
- [ ] Game detail page (`/games/:id`) — metadata + backlog entry editor
- [ ] Dashboard page (`/dashboard`) — four Recharts charts

## Phase 11 — Deployment
- [ ] Write `Dockerfile` for the Express backend
- [ ] Write production `docker-compose.yml` for OCI
- [ ] Configure GitHub Actions workflow (run Vitest → SSH deploy to OCI → Vercel auto-deploy)
- [ ] Set up Vercel project linked to `client/` subdirectory
