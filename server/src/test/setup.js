const { pool } = require('../db');
const { assertTestDatabase } = require('./assert-test-database');

assertTestDatabase(process.env.DATABASE_URL);

afterEach(async () => {
  await pool.query(
    'TRUNCATE TABLE backlog_entries, games, users, auth_tokens, ' +
      'game_collections RESTART IDENTITY CASCADE',
  );
});

afterAll(async () => {
  await pool.end();
});
