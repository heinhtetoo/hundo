const { Client, escapeIdentifier } = require('pg');

const UNDEFINED_DATABASE = '3D000';
const DUPLICATE_DATABASE = '42P04';
const MAINTENANCE_DATABASE = 'postgres';

async function ensureTestDatabase(databaseUrl) {
  if (await databaseExists(databaseUrl)) {
    return;
  }

  await createDatabase(databaseUrl);
}

async function databaseExists(databaseUrl) {
  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
  } catch (error) {
    if (error.code === UNDEFINED_DATABASE) {
      return false;
    }
    throw error;
  }

  await client.end();
  return true;
}

async function createDatabase(databaseUrl) {
  const databaseName = databaseNameFrom(databaseUrl);
  const client = new Client({
    connectionString: maintenanceUrlFor(databaseUrl),
  });
  await client.connect();

  try {
    await client.query(`CREATE DATABASE ${escapeIdentifier(databaseName)}`);
  } catch (error) {
    if (error.code !== DUPLICATE_DATABASE) {
      throw error;
    }
  } finally {
    await client.end();
  }
}

function maintenanceUrlFor(databaseUrl) {
  const url = new URL(databaseUrl);
  url.pathname = `/${MAINTENANCE_DATABASE}`;
  return url.toString();
}

function databaseNameFrom(databaseUrl) {
  return decodeURIComponent(new URL(databaseUrl).pathname.slice(1));
}

module.exports = {
  ensureTestDatabase,
  maintenanceUrlFor,
  databaseNameFrom,
};
