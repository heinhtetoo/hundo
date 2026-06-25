const request = require('supertest');
const { app } = require('../src/app');

const TEST_USER = { email: 'gamer@example.com', password: 'password123' };

const RAWG_GAME = {
  id: 3498,
  name: 'Grand Theft Auto V',
  background_image: 'https://media.rawg.io/gta5.jpg',
  genres: [{ id: 4, name: 'Action' }],
  platforms: [{ platform: { id: 1, name: 'PC' } }],
  rating: 4.47,
  released: '2013-09-17',
  description_raw: 'An open world crime game.',
  extra_field: 'should be excluded',
};

function mockFetchOk(body) {
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
  });
}

function mockFetchError(status) {
  fetch.mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ detail: 'error' }),
  });
}

describe('Games API', () => {
  let agent;

  beforeEach(async () => {
    vi.stubGlobal('fetch', vi.fn());
    agent = request.agent(app);
    await agent.post('/api/v1/auth/register').send(TEST_USER);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('GET /api/v1/games/search', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/v1/games/search?q=zelda');

      expect(res.status).toBe(401);
    });

    it('returns 400 when q param is missing', async () => {
      const res = await agent.get('/api/v1/games/search');

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when q param is empty', async () => {
      const res = await agent.get('/api/v1/games/search?q=');

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns trimmed game list on success', async () => {
      mockFetchOk({ results: [RAWG_GAME] });

      const res = await agent.get('/api/v1/games/search?q=gta');

      expect(res.status).toBe(200);
      expect(res.body.games).toHaveLength(1);
      expect(res.body.games[0]).toMatchObject({
        id: 3498,
        name: 'Grand Theft Auto V',
        genres: [{ id: 4, name: 'Action' }],
        platforms: [{ id: 1, name: 'PC' }],
        rating: 4.47,
      });
      expect(res.body.games[0]).not.toHaveProperty('description_raw');
      expect(res.body.games[0]).not.toHaveProperty('extra_field');
    });

    it('returns 502 when RAWG request fails', async () => {
      mockFetchError(500);

      const res = await agent.get('/api/v1/games/search?q=zelda');

      expect(res.status).toBe(502);
    });
  });

  describe('GET /api/v1/games/:rawgId', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/v1/games/3498');

      expect(res.status).toBe(401);
    });

    it('returns 404 when RAWG returns 404', async () => {
      mockFetchError(404);

      const res = await agent.get('/api/v1/games/9999999');

      expect(res.status).toBe(404);
    });

    it('returns 502 when RAWG request fails', async () => {
      mockFetchError(500);

      const res = await agent.get('/api/v1/games/3498');

      expect(res.status).toBe(502);
    });

    it('returns trimmed game detail including description on success', async () => {
      mockFetchOk(RAWG_GAME);

      const res = await agent.get('/api/v1/games/3498');

      expect(res.status).toBe(200);
      expect(res.body.game).toMatchObject({
        id: 3498,
        name: 'Grand Theft Auto V',
        genres: [{ id: 4, name: 'Action' }],
        platforms: [{ id: 1, name: 'PC' }],
        description_raw: 'An open world crime game.',
      });
      expect(res.body.game).not.toHaveProperty('extra_field');
    });
  });
});
