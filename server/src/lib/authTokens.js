const crypto = require('crypto');
const { pool } = require('../db');

const EXPIRY_MS = {
  email_verify: 24 * 60 * 60 * 1000,
  password_reset: 60 * 60 * 1000,
};
const DEFAULT_EXPIRY_MS = 24 * 60 * 60 * 1000;

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

async function issueToken(userId, type) {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = hashToken(raw);
  const expiresAt = new Date(Date.now() + (EXPIRY_MS[type] ?? DEFAULT_EXPIRY_MS));

  await pool.query(
    'DELETE FROM auth_tokens WHERE user_id = $1 AND type = $2',
    [userId, type],
  );

  await pool.query(
    `INSERT INTO auth_tokens (user_id, type, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [userId, type, hash, expiresAt],
  );

  return raw;
}

async function consumeToken(raw, type) {
  const hash = hashToken(raw);

  const result = await pool.query(
    `DELETE FROM auth_tokens
     WHERE token_hash = $1 AND type = $2 AND expires_at > now()
     RETURNING user_id`,
    [hash, type],
  );

  return result.rows[0]?.user_id ?? null;
}

module.exports = { issueToken, consumeToken };
