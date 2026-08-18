const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    environment: 'node',
    globals: true,
    fileParallelism: false,
    setupFiles: ['./src/test/setup.js'],
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL ??
        'postgresql://postgres:password@localhost:5432/hundo_test',
      JWT_ACCESS_SECRET: 'test_access_secret_32_chars_long!',
      JWT_REFRESH_SECRET: 'test_refresh_secret_32_chars_lon',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
      NODE_ENV: 'test',
    },
  },
});
