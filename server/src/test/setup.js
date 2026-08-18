const { pool } = require('../db');

function assertTestDatabase(connectionString) {
  let databaseName;
  try {
    databaseName = new URL(connectionString).pathname.replace(/^\//, '');
  } catch {
    databaseName = '';
  }

  if (!databaseName) {
    throw new Error(
      'Refusing to run tests: DATABASE_URL is missing or unparseable ' +
        `(got "${connectionString ?? ''}").`,
    );
  }

  if (!/test/i.test(databaseName)) {
    throw new Error(
      `Refusing to run tests against database "${databaseName}": its ` +
        'name does not mark it as a test database.',
    );
  }
}

assertTestDatabase(process.env.DATABASE_URL);

afterEach(async () => {
  await pool.query(
    'TRUNCATE TABLE backlog_entries, games, users, auth_tokens, ' +
      'game_collections RESTART IDENTITY CASCADE',
  );
});

afterAll(async () => {
  if (!pool.ending) await pool.end();
});

module.exports = { assertTestDatabase };
