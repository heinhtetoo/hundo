const FALLBACK_DATABASE_URL =
  'postgresql://postgres:password@localhost:5432/hundo_test';

function resolveDatabaseUrl(env) {
  return env.DATABASE_URL ?? FALLBACK_DATABASE_URL;
}

module.exports = { resolveDatabaseUrl, FALLBACK_DATABASE_URL };
