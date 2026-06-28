const { rateLimit } = require('express-rate-limit');

function createAuthRateLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skip: () => process.env.NODE_ENV === 'test',
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      error: {
        message: 'Too many requests, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
      },
    },
  });
}

module.exports = { createAuthRateLimiter };
