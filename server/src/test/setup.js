const { pool } = require('../db');

afterEach(async () => {
  await pool.query(
    'TRUNCATE TABLE backlog_entries, games, users RESTART IDENTITY CASCADE',
  );
});

afterAll(async () => {
  await pool.end();
});
