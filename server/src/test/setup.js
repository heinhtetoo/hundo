const { pool } = require('../db');

afterEach(async () => {
  await pool.query(
    'TRUNCATE TABLE backlog_entries, games, users, auth_tokens, ' +
      'game_collections RESTART IDENTITY CASCADE',
  );
});

afterAll(async () => {
  await pool.end();
});
