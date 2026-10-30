# Hundo

## Running the tests

The suite needs a local Postgres database named `hundo_test` to exist first.
Point `DATABASE_URL` at it, for example
`postgresql://postgres:password@localhost:5432/hundo_test`.

```bash
npm run ci:all
DATABASE_URL=<your hundo_test URL> npm --prefix server run migrate:up
npm test
```

`migrate:up` has no fallback, so it needs `DATABASE_URL`. The test run falls
back to the example URL above when the variable is unset.

A passing run prints two Vitest summaries, server then client, and exits 0:

```text
 Test Files  5 passed (5)
      Tests  110 passed (110)
 Test Files  2 passed (2)
      Tests  17 passed (17)
```
