const { Router } = require('express');
const bcrypt = require('bcrypt');

const { pool } = require('../db');
const { authRateLimiter } = require('../middleware/authRateLimiter');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setTokenCookies,
  clearTokenCookies,
} = require('../lib/tokens');
const { registerSchema, loginSchema } = require('../validation/authSchemas');

const router = Router();

router.use(authRateLimiter);

router.post('/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: { message: 'Invalid input', code: 'VALIDATION_ERROR' },
      });
    }

    const { email, password } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, passwordHash],
    );
    const user = result.rows[0];

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });
    setTokenCookies(res, accessToken, refreshToken);

    res.status(201).json({ user });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        error: { message: 'Email already in use', code: 'EMAIL_TAKEN' },
      });
    }
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: { message: 'Invalid input', code: 'VALIDATION_ERROR' },
      });
    }

    const { email, password } = parsed.data;

    const result = await pool.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email],
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
      });
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });
    setTokenCookies(res, accessToken, refreshToken);

    res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({
        error: { message: 'No refresh token', code: 'UNAUTHORIZED' },
      });
    }

    const payload = verifyRefreshToken(token);

    const result = await pool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [payload.userId],
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        error: { message: 'User not found', code: 'UNAUTHORIZED' },
      });
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });
    setTokenCookies(res, accessToken, refreshToken);

    res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: { message: 'Invalid refresh token', code: 'UNAUTHORIZED' },
      });
    }
    next(err);
  }
});

router.post('/logout', (req, res) => {
  clearTokenCookies(res);
  res.json({ message: 'Logged out' });
});

router.get('/me', async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({
        error: { message: 'No token provided', code: 'UNAUTHORIZED' },
      });
    }

    const { verifyAccessToken } = require('../lib/tokens');
    const payload = verifyAccessToken(token);

    const result = await pool.query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [payload.userId],
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        error: { message: 'User not found', code: 'UNAUTHORIZED' },
      });
    }

    res.json({ user });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: { message: 'Invalid token', code: 'UNAUTHORIZED' },
      });
    }
    next(err);
  }
});

module.exports = { router };
