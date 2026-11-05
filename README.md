# Hundo

## Running the tests

You need a local Postgres you can reach as a role allowed to create
databases. You do not need to create or migrate the test database yourself —
the suite does it.

```bash
npm run ci:all
npm test
```

The server suite's `globalSetup` resolves `DATABASE_URL` (falling back to
`postgresql://postgres:password@localhost:5432/hundo_test`), refuses anything
whose database name does not look like a test database, creates that database
if it is missing, and applies migrations — all before the first test file
loads.

**Do not run `npm --prefix server run migrate:up` to prepare the test
database.** The `node-pg-migrate` v8 CLI loads `server/.env` itself, and that
file points `DATABASE_URL` at the **dev** database `hundo` — so a bare
`migrate:up` migrates the wrong database. If you ever need it by hand, prefix
the variable (`DATABASE_URL=… npm --prefix server run migrate:up`), which wins
because dotenv never overrides a variable already set in the environment.

A passing run prints two Vitest summaries, server then client, and exits 0:

```text
 Test Files  5 passed (5)
      Tests  116 passed (116)
 Test Files  2 passed (2)
      Tests  17 passed (17)
```

## How a change lands

1. Cut your branch from `dev`, the integration branch, and open the PR
   against `dev`.
2. The PR runs CI (`.github/workflows/ci.yml`) with two jobs:
   - **Test:** starts a Postgres 16 container and runs `npm ci` in
     `server`, then the server tests, which create and migrate `hundo_test`
     themselves. The container deliberately does not pre-create it, so CI
     exercises that path on every run.
   - **Test client:** runs `npm ci` and the tests in `client`.

   A PR never deploys.
3. Once merged, the change sits on `dev`. `main` only ever advances by
   fast-forward from `dev`: no direct commits, no PRs, no hotfixes.
4. A push to `main` runs the same two test jobs, then deploys the backend
   once both pass. Vercel also deploys the frontend from `main`.

See `PROJECT.md` §2 for the full branch rules.

## Troubleshooting

**`Not run migration … is preceding already run migration …`** — this host's
`hundo_test` was migrated before the migrations were squashed into one
baseline, so its ledger no longer matches the files on disk. `globalSetup` is
right to refuse. Fix it once:

```bash
dropdb -h localhost -U postgres hundo_test
```

The next `npm test` recreates and migrates it. Never edit the `pgmigrations`
table by hand to paper over this.
