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
- [ ] Write `Dockerfile` for the Express backend
- [ ] Write production `docker-compose.yml` for OCI
- [ ] Configure GitHub Actions workflow (run Vitest → SSH deploy to OCI → Vercel auto-deploy)
- [ ] Set up Vercel project linked to `client/` subdirectory
