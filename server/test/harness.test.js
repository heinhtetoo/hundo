const { readdir } = require('node:fs/promises');
const { pool } = require('../src/db');
const { assertTestDatabase } = require('../src/test/assert-test-database');
const {
  databaseNameFrom,
  maintenanceUrlFor,
} = require('../src/test/ensure-test-database');
const {
  MIGRATIONS_DIR,
  migrateTestDatabase,
} = require('../src/test/migrate-test-database');
const { resolveDatabaseUrl } = require('../src/test/resolve-database-url');

const TRUNCATED_TABLES = [
  'backlog_entries',
  'games',
  'users',
  'auth_tokens',
  'game_collections',
];

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

describe('DATABASE_URL resolution', () => {
  it('uses DATABASE_URL from the environment when it is set', () => {
    expect(
      resolveDatabaseUrl({ DATABASE_URL: 'postgresql://x/hundo_test_alt' }),
    ).toBe('postgresql://x/hundo_test_alt');
  });

  it('falls back to the local test database when DATABASE_URL is unset', () => {
    expect(resolveDatabaseUrl({})).toBe(
      'postgresql://postgres:password@localhost:5432/hundo_test',
    );
  });
});

describe('test-database guard', () => {
  it('rejects a connection string whose database is not a test database', () => {
    expect(() =>
      assertTestDatabase('postgresql://postgres:password@localhost:5432/hundo'),
    ).toThrow('hundo');
  });

  it('rejects an absent DATABASE_URL', () => {
    expect(() => assertTestDatabase(undefined)).toThrow(
      'DATABASE_URL is missing or unparseable',
    );
  });

  it('rejects a malformed or unparseable connection string', () => {
    expect(() => assertTestDatabase('not-a-connection-string')).toThrow(
      'DATABASE_URL is missing or unparseable',
    );
  });

  it('accepts the CI service-container URL and the local fallback URL', () => {
    expect(() =>
      assertTestDatabase(
        'postgresql://postgres:password@localhost:5432/hundo_test',
      ),
    ).not.toThrow();
    expect(() =>
      assertTestDatabase(
        'postgresql://postgres:password@postgres:5432/hundo_test',
      ),
    ).not.toThrow();
  });
});

describe('globalSetup applies migrations', () => {
  it('records every migration file on disk in the ledger', async () => {
    const files = await readdir(MIGRATIONS_DIR);
    const expected = files
      .filter((file) => file.endsWith('.js'))
      .map((file) => file.replace(/\.js$/, ''))
      .sort();

    const result = await pool.query(
      'SELECT name FROM pgmigrations ORDER BY id',
    );
    const applied = result.rows.map((row) => row.name).sort();

    expect(applied).toEqual(expected);
  });

  it('creates every table the harness truncates, plus the ledger', async () => {
    const tables = [...TRUNCATED_TABLES, 'pgmigrations'];
    const result = await pool.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = ANY($1)`,
      [tables],
    );

    expect(result.rows.map((row) => row.table_name).sort()).toEqual(
      [...tables].sort(),
    );
  });

  it('leaves the ledger intact when truncating between tests', async () => {
    const result = await pool.query(
      'SELECT count(*)::int AS n FROM pgmigrations',
    );

    expect(result.rows[0].n).toBeGreaterThan(0);
  });

  it('refuses a non-test database before opening any connection', async () => {
    await expect(
      migrateTestDatabase('postgresql://postgres:password@127.0.0.1:1/hundo'),
    ).rejects.toThrow('does not mark it as a test database');
  });
});

describe('maintenance connection helpers', () => {
  it('swaps the database for postgres and keeps everything else', () => {
    expect(
      maintenanceUrlFor(
        'postgresql://user:p%40ss@db.example:6543/hundo_test?sslmode=require',
      ),
    ).toBe('postgresql://user:p%40ss@db.example:6543/postgres?sslmode=require');
  });

  it('decodes a percent-encoded database name', () => {
    expect(
      databaseNameFrom('postgresql://postgres@localhost:5432/hundo%20test'),
    ).toBe('hundo test');
  });
});
