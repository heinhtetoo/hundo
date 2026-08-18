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

module.exports = { assertTestDatabase };
