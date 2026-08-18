const { defineConfig } = require('vitest/config');
const { resolveDatabaseUrl } = require('./src/test/resolve-database-url');

module.exports = defineConfig({
  test: {
    environment: 'node',
    globals: true,
    fileParallelism: false,
    setupFiles: ['./src/test/setup.js'],
    env: {
      DATABASE_URL: resolveDatabaseUrl(process.env),
      JWT_ACCESS_SECRET: 'test_access_secret_32_chars_long!',
      JWT_REFRESH_SECRET: 'test_refresh_secret_32_chars_lon',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
      NODE_ENV: 'test',
    },
  },
});
