const { migrateTestDatabase } = require('./migrate-test-database');
const { resolveDatabaseUrl } = require('./resolve-database-url');

// Vitest requires a bare exported function here: both `module.exports = {...}`
// and `exports.setup = fn` would set `default` to an object and be rejected.
// The arrow also stops Vitest's `setup(this)` reaching migrateTestDatabase,
// and discards runner()'s array, which is not a valid teardown value.
module.exports = async () => {
  await migrateTestDatabase(resolveDatabaseUrl(process.env));
};
