const request = require('supertest');
const { app } = require('../src/app');

const REGISTER_URL = '/api/v1/auth/register';
const LOGIN_URL = '/api/v1/auth/login';
const REFRESH_URL = '/api/v1/auth/refresh';
const LOGOUT_URL = '/api/v1/auth/logout';
const ME_URL = '/api/v1/auth/me';

const validUser = { email: 'test@example.com', password: 'password123' };

async function registerAndLogin(credentials = validUser) {
  await request(app).post(REGISTER_URL).send(credentials);
  return request.agent(app).post(LOGIN_URL).send(credentials);
}

describe('POST /api/v1/auth/register', () => {
  it('returns 201 and user data on valid input', async () => {
    const res = await request(app).post(REGISTER_URL).send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it('sets httpOnly access and refresh token cookies', async () => {
    const res = await request(app).post(REGISTER_URL).send(validUser);

    const cookies = res.headers['set-cookie'] ?? [];
    expect(cookies.some((c) => c.startsWith('accessToken='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true);
    expect(cookies.every((c) => c.includes('HttpOnly'))).toBe(true);
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

describe('POST /api/v1/auth/login', () => {
  it('returns 200 and sets cookies on valid credentials', async () => {
    await request(app).post(REGISTER_URL).send(validUser);

    const res = await request(app).post(LOGIN_URL).send(validUser);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);

    const cookies = res.headers['set-cookie'] ?? [];
    expect(cookies.some((c) => c.startsWith('accessToken='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true);
  });

  it('returns 401 with wrong password', async () => {
    await request(app).post(REGISTER_URL).send(validUser);

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
    await agent.post(REGISTER_URL).send(validUser);

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
    await agent.post(REGISTER_URL).send(validUser);

    const res = await agent.post(LOGOUT_URL);

    expect(res.status).toBe(200);
    const cookies = res.headers['set-cookie'] ?? [];
    expect(
      cookies.some((c) => c.startsWith('accessToken=;')),
    ).toBe(true);
    expect(
      cookies.some((c) => c.startsWith('refreshToken=;')),
    ).toBe(true);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('returns 200 and user data with valid access token', async () => {
    const agent = request.agent(app);
    await agent.post(REGISTER_URL).send(validUser);

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

describe('verifyToken middleware', () => {
  it('returns 401 on a protected route without a token', async () => {
    const res = await request(app).get('/api/v1/backlog');

    expect(res.status).toBe(401);
  });
});
