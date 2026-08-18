const { pool } = require('../src/db');

describe('test harness inter-test cleanup', () => {
  it('seeds a game_collections row', async () => {
    await pool.query(
      `INSERT INTO game_collections (slug, title, payload)
       VALUES ($1, $2, $3)`,
      ['leak-check', 'Leak Check', JSON.stringify([])],
    );

    const result = await pool.query(
      'SELECT count(*)::int AS count FROM game_collections',
    );
    expect(result.rows[0].count).toBe(1);
  });

  it('does not see the previous test\'s game_collections row', async () => {
    const result = await pool.query(
      'SELECT count(*)::int AS count FROM game_collections',
    );
    expect(result.rows[0].count).toBe(0);
  });

  it('writes an auth_tokens row for a seeded user', async () => {
    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2) RETURNING id`,
      ['harness-user@example.com', 'hash'],
    );
    await pool.query(
      `INSERT INTO auth_tokens (user_id, type, token_hash, expires_at)
       VALUES ($1, $2, $3, now() + interval '1 hour')`,
      [userResult.rows[0].id, 'verify', 'hashed-token'],
    );

    const result = await pool.query(
      'SELECT count(*)::int AS count FROM auth_tokens',
    );
    expect(result.rows[0].count).toBe(1);
  });

  it('does not see the previous test\'s auth_tokens row', async () => {
    const result = await pool.query(
      'SELECT count(*)::int AS count FROM auth_tokens',
    );
    expect(result.rows[0].count).toBe(0);
  });

  it('writes a users row', async () => {
    await pool.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)`,
      ['harness-user-2@example.com', 'hash'],
    );

    const result = await pool.query(
      'SELECT count(*)::int AS count FROM users',
    );
    expect(result.rows[0].count).toBe(1);
  });

  it('does not see the previous test\'s users row', async () => {
    const result = await pool.query('SELECT count(*)::int AS count FROM users');
    expect(result.rows[0].count).toBe(0);
  });

  it('restarts identity so a newly inserted user receives id 1', async () => {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2) RETURNING id`,
      ['harness-user-3@example.com', 'hash'],
    );
    expect(result.rows[0].id).toBe('1');
  });
});
