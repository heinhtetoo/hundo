const { join } = require('node:path');
const { assertTestDatabase } = require('./assert-test-database');
const { ensureTestDatabase } = require('./ensure-test-database');

const MIGRATIONS_DIR = join(__dirname, '..', '..', 'migrations');

async function migrateTestDatabase(databaseUrl) {
  assertTestDatabase(databaseUrl);
  await ensureTestDatabase(databaseUrl);

  // node-pg-migrate 8 is ESM-only: require() throws ERR_REQUIRE_ESM.
  const { runner } = await import('node-pg-migrate');

  await runner({
    databaseUrl,
    dir: MIGRATIONS_DIR,
    direction: 'up',
    migrationsTable: 'pgmigrations',
    schema: 'public',
    singleTransaction: true,
  });
}

module.exports = { migrateTestDatabase, MIGRATIONS_DIR };
