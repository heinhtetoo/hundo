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
  metacritic: 92,
  ratings_count: 6900,
  developers: [{ id: 1, name: 'Rockstar North' }],
  publishers: [{ id: 2, name: 'Rockstar Games' }],
  esrb_rating: { id: 4, name: 'Mature' },
  playtime: 74,
  website: 'https://www.rockstargames.com/V/',
  extra_field: 'should be excluded',
};

const RAWG_SCREENSHOTS = {
  results: [
    { id: 1, image: 'https://media.rawg.io/shot1.jpg', extra: 'drop me' },
    { id: 2, image: 'https://media.rawg.io/shot2.jpg' },
  ],
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
    const regRes = await agent.post('/api/v1/auth/register').send(TEST_USER);
    await agent.post('/api/v1/auth/verify-email').send({ token: regRes.body._verifyToken });
    await agent.post('/api/v1/auth/login').send(TEST_USER);
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
        metacritic: 92,
        rating_count: 6900,
        developers: ['Rockstar North'],
        publishers: ['Rockstar Games'],
        esrb_rating: 'Mature',
        playtime: 74,
        website: 'https://www.rockstargames.com/V/',
      });
      expect(res.body.game).not.toHaveProperty('extra_field');
    });
  });

  describe('GET /api/v1/games/:rawgId/screenshots', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/v1/games/3498/screenshots');

      expect(res.status).toBe(401);
    });

    it('returns trimmed screenshot list on success', async () => {
      mockFetchOk(RAWG_SCREENSHOTS);

      const res = await agent.get('/api/v1/games/3498/screenshots');

      expect(res.status).toBe(200);
      expect(res.body.screenshots).toEqual([
        { id: 1, image: 'https://media.rawg.io/shot1.jpg' },
        { id: 2, image: 'https://media.rawg.io/shot2.jpg' },
      ]);
    });

    it('returns 502 when RAWG request fails', async () => {
      mockFetchError(500);

      const res = await agent.get('/api/v1/games/3498/screenshots');

      expect(res.status).toBe(502);
    });
  });

  describe('GET /api/v1/games/discover', () => {
    const RAWG_LIST = { results: [RAWG_GAME], next: null };

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/v1/games/discover');

      expect(res.status).toBe(401);
    });

    it('returns three curated rows with games', async () => {
      mockFetchOk(RAWG_LIST);

      const res = await agent.get('/api/v1/games/discover');

      expect(res.status).toBe(200);
      expect(res.body.rows).toHaveLength(3);
      expect(res.body.rows[0].slug).toBe('top-rated');
      expect(res.body.rows[0].games).toHaveLength(1);
      expect(res.body.rows[0].games[0].id).toBe(3498);
    });

    it('serves from cache on second call without extra RAWG fetches', async () => {
      mockFetchOk(RAWG_LIST);

      await agent.get('/api/v1/games/discover');
      const callsAfterFirst = fetch.mock.calls.length;

      const res = await agent.get('/api/v1/games/discover');

      expect(res.status).toBe(200);
      expect(fetch.mock.calls.length).toBe(callsAfterFirst);
    });

    it('still returns rows when RAWG fails if cache exists', async () => {
      mockFetchOk(RAWG_LIST);
      await agent.get('/api/v1/games/discover');

      mockFetchError(500);

      const res = await agent.get('/api/v1/games/discover');
      expect(res.status).toBe(200);
      expect(res.body.rows).toHaveLength(3);
    });
  });

  describe('GET /api/v1/games/browse', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/v1/games/browse');

      expect(res.status).toBe(401);
    });

    it('returns results with hasNext flag', async () => {
      mockFetchOk({ results: [RAWG_GAME], next: null });

      const res = await agent.get('/api/v1/games/browse');

      expect(res.status).toBe(200);
      expect(res.body.results).toHaveLength(1);
      expect(res.body.hasNext).toBe(false);
    });

    it('forwards genre and platform filters to RAWG', async () => {
      mockFetchOk({ results: [], next: null });

      await agent.get('/api/v1/games/browse?genre=action&platform=4');

      const calledUrl = fetch.mock.calls[0][0];
      expect(calledUrl).toContain('genres=action');
      expect(calledUrl).toContain('platforms=4');
    });

    it('forwards year as a dates range', async () => {
      mockFetchOk({ results: [], next: null });

      await agent.get('/api/v1/games/browse?year=2020');

      const calledUrl = fetch.mock.calls[0][0];
      expect(calledUrl).toContain('dates=2020-01-01%2C2020-12-31');
    });

    it('applies ascending sort when order=asc', async () => {
      mockFetchOk({ results: [], next: null });

      await agent.get('/api/v1/games/browse?sort=rating&order=asc');

      const calledUrl = fetch.mock.calls[0][0];
      expect(calledUrl).toContain('ordering=rating');
      expect(calledUrl).not.toContain('ordering=-rating');
    });

    it('rejects unknown sort values by falling back to -rating', async () => {
      mockFetchOk({ results: [], next: null });

      await agent.get('/api/v1/games/browse?sort=injection;DROP TABLE');

      const calledUrl = fetch.mock.calls[0][0];
      expect(calledUrl).toContain('ordering=-rating');
    });
  });

  describe('GET /api/v1/games/genres', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/v1/games/genres');

      expect(res.status).toBe(401);
    });

    it('returns genre list', async () => {
      mockFetchOk({ results: [{ id: 4, name: 'Action', slug: 'action' }] });

      const res = await agent.get('/api/v1/games/genres');

      expect(res.status).toBe(200);
      expect(res.body.genres).toEqual([{ id: 4, name: 'Action', slug: 'action' }]);
    });
  });

  describe('GET /api/v1/games/platforms', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/v1/games/platforms');

      expect(res.status).toBe(401);
    });

    it('returns platform list', async () => {
      mockFetchOk({ results: [{ id: 4, name: 'PC', slug: 'pc' }] });

      const res = await agent.get('/api/v1/games/platforms');

      expect(res.status).toBe(200);
      expect(res.body.platforms).toEqual([{ id: 4, name: 'PC', slug: 'pc' }]);
    });
  });
});
