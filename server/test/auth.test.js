const request = require('supertest');
const { app } = require('../src/app');

const REGISTER_URL = '/api/v1/auth/register';
const LOGIN_URL = '/api/v1/auth/login';
const REFRESH_URL = '/api/v1/auth/refresh';
const LOGOUT_URL = '/api/v1/auth/logout';
const ME_URL = '/api/v1/auth/me';
const VERIFY_URL = '/api/v1/auth/verify-email';
const RESEND_URL = '/api/v1/auth/resend-verification';
const FORGOT_URL = '/api/v1/auth/forgot-password';
const RESET_URL = '/api/v1/auth/reset-password';

const validUser = { email: 'test@example.com', password: 'password123' };

async function registerAndVerify(credentials = validUser) {
  const agent = request.agent(app);
  const regRes = await agent.post(REGISTER_URL).send(credentials);
  const token = regRes.body._verifyToken;
  await agent.post(VERIFY_URL).send({ token });
  await agent.post(LOGIN_URL).send(credentials);
  return agent;
}

describe('POST /api/v1/auth/register', () => {
  it('returns 201 with a message (no cookies) on valid input', async () => {
    const res = await request(app).post(REGISTER_URL).send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.message).toBeDefined();
    const cookies = res.headers['set-cookie'] ?? [];
    expect(cookies.some((c) => c.startsWith('accessToken='))).toBe(false);
    expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(false);
  });

  it('exposes _verifyToken in test environment', async () => {
    const res = await request(app).post(REGISTER_URL).send(validUser);

    expect(res.body._verifyToken).toBeDefined();
    expect(typeof res.body._verifyToken).toBe('string');
  });

  it('returns 400 with missing email', async () => {
    const res = await request(app)
      .post(REGISTER_URL)
      .send({ password: 'password123' });

    expect(res.status).toBe(400);
  });

  it('returns 400 with missing password', async () => {
    const res = await request(app)
      .post(REGISTER_URL)
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(400);
  });

  it('returns 400 with invalid email format', async () => {
    const res = await request(app)
      .post(REGISTER_URL)
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
  });

  it('returns 400 with password shorter than 8 characters', async () => {
    const res = await request(app)
      .post(REGISTER_URL)
      .send({ email: 'test@example.com', password: 'short' });

    expect(res.status).toBe(400);
  });

  it('returns 409 with duplicate email', async () => {
    await request(app).post(REGISTER_URL).send(validUser);

    const res = await request(app).post(REGISTER_URL).send(validUser);

    expect(res.status).toBe(409);
  });
});

describe('POST /api/v1/auth/verify-email', () => {
  it('returns 200 and allows login after verification', async () => {
    const regRes = await request(app).post(REGISTER_URL).send(validUser);
    const token = regRes.body._verifyToken;

    const verifyRes = await request(app).post(VERIFY_URL).send({ token });
    expect(verifyRes.status).toBe(200);

    const loginRes = await request(app).post(LOGIN_URL).send(validUser);
    expect(loginRes.status).toBe(200);
  });

  it('returns 400 for an invalid token', async () => {
    const res = await request(app).post(VERIFY_URL).send({ token: 'bogus' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('returns 400 if token is reused (single-use)', async () => {
    const regRes = await request(app).post(REGISTER_URL).send(validUser);
    const token = regRes.body._verifyToken;

    await request(app).post(VERIFY_URL).send({ token });
    const res = await request(app).post(VERIFY_URL).send({ token });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('returns 400 with missing token', async () => {
    const res = await request(app).post(VERIFY_URL).send({});

    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/resend-verification', () => {
  it('returns 200 for an unverified account and allows verification with the new token', async () => {
    await request(app).post(REGISTER_URL).send(validUser);

    const resendRes = await request(app)
      .post(RESEND_URL)
      .send({ email: validUser.email });
    expect(resendRes.status).toBe(200);

    const verifyRes = await request(app)
      .post(VERIFY_URL)
      .send({ token: resendRes.body._verifyToken });
    expect(verifyRes.status).toBe(200);
  });

  it('returns identical generic 200 for unknown email (no enumeration)', async () => {
    const res = await request(app)
      .post(RESEND_URL)
      .send({ email: 'nobody@example.com' });

    expect(res.status).toBe(200);
    expect(res.body._verifyToken).toBeUndefined();
  });

  it('returns identical generic 200 for already-verified account (no enumeration)', async () => {
    const regRes = await request(app).post(REGISTER_URL).send(validUser);
    await request(app)
      .post(VERIFY_URL)
      .send({ token: regRes.body._verifyToken });

    const res = await request(app)
      .post(RESEND_URL)
      .send({ email: validUser.email });

    expect(res.status).toBe(200);
    expect(res.body._verifyToken).toBeUndefined();
  });
});

describe('POST /api/v1/auth/login', () => {
  it('returns 403 EMAIL_NOT_VERIFIED for unverified account', async () => {
    await request(app).post(REGISTER_URL).send(validUser);

    const res = await request(app).post(LOGIN_URL).send(validUser);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('EMAIL_NOT_VERIFIED');
  });

  it('returns 200 and sets cookies after verification', async () => {
    const regRes = await request(app).post(REGISTER_URL).send(validUser);
    await request(app).post(VERIFY_URL).send({ token: regRes.body._verifyToken });

    const res = await request(app).post(LOGIN_URL).send(validUser);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
    const cookies = res.headers['set-cookie'] ?? [];
    expect(cookies.some((c) => c.startsWith('accessToken='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true);
  });

  it('returns 401 with wrong password', async () => {
    const regRes = await request(app).post(REGISTER_URL).send(validUser);
    await request(app).post(VERIFY_URL).send({ token: regRes.body._verifyToken });

    const res = await request(app)
      .post(LOGIN_URL)
      .send({ email: validUser.email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('returns 401 with unknown email', async () => {
    const res = await request(app)
      .post(LOGIN_URL)
      .send({ email: 'unknown@example.com', password: 'password123' });

    expect(res.status).toBe(401);
  });

  it('returns 400 with missing fields', async () => {
    const res = await request(app).post(LOGIN_URL).send({});

    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/refresh', () => {
  it('returns 200 and rotates tokens when refresh token is valid', async () => {
    const agent = request.agent(app);
    const regRes = await agent.post(REGISTER_URL).send(validUser);
    await agent.post(VERIFY_URL).send({ token: regRes.body._verifyToken });
    await agent.post(LOGIN_URL).send(validUser);

    const res = await agent.post(REFRESH_URL);

    expect(res.status).toBe(200);
    const cookies = res.headers['set-cookie'] ?? [];
    expect(cookies.some((c) => c.startsWith('accessToken='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true);
  });

  it('returns 401 with no refresh token cookie', async () => {
    const res = await request(app).post(REFRESH_URL);

    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('returns 200 and clears cookies', async () => {
    const agent = request.agent(app);
    const regRes = await agent.post(REGISTER_URL).send(validUser);
    await agent.post(VERIFY_URL).send({ token: regRes.body._verifyToken });
    await agent.post(LOGIN_URL).send(validUser);

    const res = await agent.post(LOGOUT_URL);

    expect(res.status).toBe(200);
    const cookies = res.headers['set-cookie'] ?? [];
    expect(cookies.some((c) => c.startsWith('accessToken=;'))).toBe(true);
    expect(cookies.some((c) => c.startsWith('refreshToken=;'))).toBe(true);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('returns 200 and user data with valid access token', async () => {
    const agent = request.agent(app);
    const regRes = await agent.post(REGISTER_URL).send(validUser);
    await agent.post(VERIFY_URL).send({ token: regRes.body._verifyToken });
    await agent.post(LOGIN_URL).send(validUser);

    const res = await agent.get(ME_URL);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it('returns 401 with no access token', async () => {
    const res = await request(app).get(ME_URL);

    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid access token', async () => {
    const res = await request(app)
      .get(ME_URL)
      .set('Cookie', 'accessToken=invalidtoken');

    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/forgot-password', () => {
  it('returns generic 200 for an existing account and exposes _resetToken in test env', async () => {
    const regRes = await request(app).post(REGISTER_URL).send(validUser);
    await request(app).post(VERIFY_URL).send({ token: regRes.body._verifyToken });

    const res = await request(app)
      .post(FORGOT_URL)
      .send({ email: validUser.email });

    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
    expect(res.body._resetToken).toBeDefined();
  });

  it('returns identical generic 200 for unknown email (no enumeration)', async () => {
    const res = await request(app)
      .post(FORGOT_URL)
      .send({ email: 'nobody@example.com' });

    expect(res.status).toBe(200);
    expect(res.body._resetToken).toBeUndefined();
  });

  it('works for unverified accounts too', async () => {
    await request(app).post(REGISTER_URL).send(validUser);

    const res = await request(app)
      .post(FORGOT_URL)
      .send({ email: validUser.email });

    expect(res.status).toBe(200);
    expect(res.body._resetToken).toBeDefined();
  });
});

describe('POST /api/v1/auth/reset-password', () => {
  async function getResetToken() {
    const regRes = await request(app).post(REGISTER_URL).send(validUser);
    await request(app).post(VERIFY_URL).send({ token: regRes.body._verifyToken });
    const forgotRes = await request(app)
      .post(FORGOT_URL)
      .send({ email: validUser.email });
    return forgotRes.body._resetToken;
  }

  it('resets the password — old password fails, new one succeeds', async () => {
    const token = await getResetToken();
    const newPassword = 'newpassword123';

    const resetRes = await request(app)
      .post(RESET_URL)
      .send({ token, password: newPassword });
    expect(resetRes.status).toBe(200);

    const oldLoginRes = await request(app)
      .post(LOGIN_URL)
      .send(validUser);
    expect(oldLoginRes.status).toBe(401);

    const newLoginRes = await request(app)
      .post(LOGIN_URL)
      .send({ email: validUser.email, password: newPassword });
    expect(newLoginRes.status).toBe(200);
  });

  it('sets email_verified = true on reset', async () => {
    const regRes = await request(app).post(REGISTER_URL).send(validUser);
    const forgotRes = await request(app)
      .post(FORGOT_URL)
      .send({ email: validUser.email });
    const token = forgotRes.body._resetToken;

    await request(app)
      .post(RESET_URL)
      .send({ token, password: 'newpassword123' });

    const loginRes = await request(app)
      .post(LOGIN_URL)
      .send({ email: validUser.email, password: 'newpassword123' });
    expect(loginRes.status).toBe(200);
  });

  it('token is single-use', async () => {
    const token = await getResetToken();

    await request(app).post(RESET_URL).send({ token, password: 'newpassword123' });
    const res = await request(app)
      .post(RESET_URL)
      .send({ token, password: 'anotherpassword' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('returns 400 for an invalid token', async () => {
    const res = await request(app)
      .post(RESET_URL)
      .send({ token: 'bogustoken', password: 'newpassword123' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('returns 400 for password shorter than 8 characters', async () => {
    const token = await getResetToken();

    const res = await request(app)
      .post(RESET_URL)
      .send({ token, password: 'short' });

    expect(res.status).toBe(400);
  });

  it('revokes existing sessions after reset (refresh yields 401)', async () => {
    const agent = request.agent(app);
    const regRes = await agent.post(REGISTER_URL).send(validUser);
    await agent.post(VERIFY_URL).send({ token: regRes.body._verifyToken });
    await agent.post(LOGIN_URL).send(validUser);

    const forgotRes = await request(app)
      .post(FORGOT_URL)
      .send({ email: validUser.email });
    await request(app)
      .post(RESET_URL)
      .send({ token: forgotRes.body._resetToken, password: 'newpassword123' });

    const refreshRes = await agent.post(REFRESH_URL);
    expect(refreshRes.status).toBe(401);
  });

  it('a fresh login after reset can refresh normally', async () => {
    const token = await getResetToken();
    const newPassword = 'newpassword123';
    await request(app).post(RESET_URL).send({ token, password: newPassword });

    const agent = request.agent(app);
    await agent.post(LOGIN_URL).send({ email: validUser.email, password: newPassword });

    const refreshRes = await agent.post(REFRESH_URL);
    expect(refreshRes.status).toBe(200);
  });
});

describe('verifyToken middleware', () => {
  it('returns 401 on a protected route without a token', async () => {
    const res = await request(app).get('/api/v1/backlog');

    expect(res.status).toBe(401);
  });
});
