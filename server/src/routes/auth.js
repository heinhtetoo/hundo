const { Router } = require('express');
const bcrypt = require('bcrypt');

const { pool } = require('../db');
const { createAuthRateLimiter } = require('../middleware/authRateLimiter');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setTokenCookies,
  clearTokenCookies,
} = require('../lib/tokens');
const { issueToken, consumeToken } = require('../lib/authTokens');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../lib/email');
const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validation/authSchemas');

const router = Router();

// Demo mode returns the verification token in the API response so testers and
// recruiters can verify their account in-app, without a verified email domain.
const EXPOSE_VERIFY_TOKEN =
  process.env.NODE_ENV === 'test' || process.env.DEMO_MODE === 'true';

router.post('/register', createAuthRateLimiter(), async (req, res, next) => {
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
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, created_at`,
      [email, passwordHash],
    );
    const user = result.rows[0];

    const raw = await issueToken(user.id, 'email_verify');
    const link = `${process.env.CLIENT_URL}/verify-email?token=${raw}`;
    await sendVerificationEmail(email, link);

    const body = { message: 'Registration successful. Please check your inbox to verify your email.' };
    if (EXPOSE_VERIFY_TOKEN) body._verifyToken = raw;
    res.status(201).json(body);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        error: { message: 'Email already in use', code: 'EMAIL_TAKEN' },
      });
    }
    next(err);
  }
});

router.post('/login', createAuthRateLimiter(), async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: { message: 'Invalid input', code: 'VALIDATION_ERROR' },
      });
    }

    const { email, password } = parsed.data;

    const result = await pool.query(
      'SELECT id, email, password_hash, email_verified, created_at FROM users WHERE email = $1',
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

    if (!user.email_verified) {
      return res.status(403).json({
        error: { message: 'Please verify your email before logging in.', code: 'EMAIL_NOT_VERIFIED' },
      });
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });
    setTokenCookies(res, accessToken, refreshToken);

    res.json({
      user: { id: user.id, email: user.email, created_at: user.created_at },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/verify-email', createAuthRateLimiter(), async (req, res, next) => {
  try {
    const parsed = verifyEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: { message: 'Invalid input', code: 'VALIDATION_ERROR' },
      });
    }

    const userId = await consumeToken(parsed.data.token, 'email_verify');
    if (!userId) {
      return res.status(400).json({
        error: { message: 'Verification link is invalid or has expired.', code: 'INVALID_TOKEN' },
      });
    }

    await pool.query(
      'UPDATE users SET email_verified = true WHERE id = $1',
      [userId],
    );

    res.json({ message: 'Email verified. You can now log in.' });
  } catch (err) {
    next(err);
  }
});

router.post('/resend-verification', createAuthRateLimiter(), async (req, res, next) => {
  try {
    const parsed = resendSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: { message: 'Invalid input', code: 'VALIDATION_ERROR' },
      });
    }

    const result = await pool.query(
      'SELECT id, email, email_verified FROM users WHERE email = $1',
      [parsed.data.email],
    );
    const user = result.rows[0];

    let verifyToken;
    if (user && !user.email_verified) {
      const raw = await issueToken(user.id, 'email_verify');
      const link = `${process.env.CLIENT_URL}/verify-email?token=${raw}`;
      await sendVerificationEmail(user.email, link);
      verifyToken = raw;
    }

    const body = { message: 'If that email address needs verification, we have sent a new link.' };
    if (EXPOSE_VERIFY_TOKEN && verifyToken) body._verifyToken = verifyToken;
    res.json(body);
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
      'SELECT id, email, password_changed_at, created_at FROM users WHERE id = $1',
      [payload.userId],
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        error: { message: 'User not found', code: 'UNAUTHORIZED' },
      });
    }

    const tokenIssuedAt = payload.issuedAtMs ?? payload.iat * 1000;
    if (
      user.password_changed_at &&
      tokenIssuedAt < user.password_changed_at.getTime()
    ) {
      return res.status(401).json({
        error: { message: 'Session revoked', code: 'UNAUTHORIZED' },
      });
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });
    setTokenCookies(res, accessToken, refreshToken);

    res.json({
      user: { id: user.id, email: user.email, created_at: user.created_at },
    });
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

router.post('/forgot-password', createAuthRateLimiter(), async (req, res, next) => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: { message: 'Invalid input', code: 'VALIDATION_ERROR' },
      });
    }

    const result = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [parsed.data.email],
    );
    const user = result.rows[0];

    let resetToken;
    if (user) {
      const raw = await issueToken(user.id, 'password_reset');
      const link = `${process.env.CLIENT_URL}/reset-password?token=${raw}`;
      await sendPasswordResetEmail(user.email, link);
      resetToken = raw;
    }

    const body = { message: 'If that email address has an account, we have sent a reset link.' };
    if (process.env.NODE_ENV === 'test' && resetToken) body._resetToken = resetToken;
    res.json(body);
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', createAuthRateLimiter(), async (req, res, next) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: { message: 'Invalid input', code: 'VALIDATION_ERROR' },
      });
    }

    const userId = await consumeToken(parsed.data.token, 'password_reset');
    if (!userId) {
      return res.status(400).json({
        error: { message: 'Reset link is invalid or has expired.', code: 'INVALID_TOKEN' },
      });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await pool.query(
      `UPDATE users
       SET password_hash = $1, password_changed_at = now(), email_verified = true
       WHERE id = $2`,
      [passwordHash, userId],
    );

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    next(err);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({
        error: { message: 'No token provided', code: 'UNAUTHORIZED' },
      });
    }

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
