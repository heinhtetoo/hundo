const request = require('supertest');
const { app } = require('../src/app');

const GAMES = [
  {
    rawgId: 1001, title: 'Game Alpha',
    genres: [{ id: 1, name: 'Action' }],
    status: 'completed', rating: 9, hoursPlayed: 20,
  },
  {
    rawgId: 1002, title: 'Game Beta',
    genres: [{ id: 1, name: 'Action' }, { id: 2, name: 'RPG' }],
    status: 'completed', rating: 8, hoursPlayed: 15,
  },
  {
    rawgId: 1003, title: 'Game Gamma',
    genres: [{ id: 2, name: 'RPG' }],
    status: 'playing', hoursPlayed: 5,
  },
  {
    rawgId: 1004, title: 'Game Delta',
    genres: [{ id: 1, name: 'Action' }],
    status: 'backlog',
  },
  {
    rawgId: 1005, title: 'Game Epsilon',
    genres: [{ id: 3, name: 'Strategy' }],
    status: 'wishlist',
  },
];

describe('Stats API', () => {
  let agent;

  beforeEach(async () => {
    agent = request.agent(app);
    await agent.post('/api/v1/auth/register').send({
      email: 'stats@example.com',
      password: 'password123',
    });
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/v1/stats');

    expect(res.status).toBe(401);
  });

  it('returns zero stats when backlog is empty', async () => {
    const res = await agent.get('/api/v1/stats');

    expect(res.status).toBe(200);
    expect(res.body.stats).toMatchObject({
      statusCounts: {
        backlog: 0, playing: 0, completed: 0,
        dropped: 0, wishlist: 0,
      },
      totalHours: 0,
      completionRate: 0,
      averageRating: null,
      longestGame: null,
      genreDistribution: [],
      topGames: [],
      recentlyCompleted: [],
    });
  });

  describe('with seeded backlog', () => {
    beforeEach(async () => {
      for (const game of GAMES) {
        await agent.post('/api/v1/backlog').send(game);
      }
    });

    it('returns correct status counts', async () => {
      const res = await agent.get('/api/v1/stats');

      expect(res.status).toBe(200);
      expect(res.body.stats.statusCounts).toEqual({
        backlog: 1, playing: 1, completed: 2,
        dropped: 0, wishlist: 1,
      });
    });

    it('returns total hours played', async () => {
      const res = await agent.get('/api/v1/stats');

      expect(Number(res.body.stats.totalHours)).toBe(40);
    });

    it('returns completion rate as a percentage', async () => {
      const res = await agent.get('/api/v1/stats');

      // 2 completed out of 3 active (playing + completed + dropped)
      expect(res.body.stats.completionRate).toBe(66.7);
    });

    it('returns average rating across rated games', async () => {
      const res = await agent.get('/api/v1/stats');

      // (9 + 8) / 2 rated games
      expect(res.body.stats.averageRating).toBe(8.5);
    });

    it('returns the longest game by hours played', async () => {
      const res = await agent.get('/api/v1/stats');

      expect(res.body.stats.longestGame).toEqual({
        title: 'Game Alpha',
        hours: 20,
      });
    });

    it('returns recently completed games, newest first', async () => {
      const res = await agent.get('/api/v1/stats');

      const recent = res.body.stats.recentlyCompleted;
      expect(recent).toHaveLength(2);
      expect(recent.map(g => g.rawg_id)).toEqual([1002, 1001]);
    });

    it('returns genre distribution sorted by count descending', async () => {
      const res = await agent.get('/api/v1/stats');

      expect(res.body.stats.genreDistribution).toEqual([
        { genre: 'Action', count: 3 },
        { genre: 'RPG', count: 2 },
        { genre: 'Strategy', count: 1 },
      ]);
    });

    it('returns top 5 rated games', async () => {
      const res = await agent.get('/api/v1/stats');

      const top = res.body.stats.topGames;
      expect(top).toHaveLength(2);
      expect(top[0].rawg_id).toBe(1001);
      expect(top[0].rating).toBe(9);
      expect(top[1].rawg_id).toBe(1002);
      expect(top[1].rating).toBe(8);
    });

    it('only returns stats for the authenticated user', async () => {
      const otherAgent = request.agent(app);
      await otherAgent.post('/api/v1/auth/register').send({
        email: 'other@example.com',
        password: 'password123',
      });

      const res = await otherAgent.get('/api/v1/stats');

      expect(res.body.stats.statusCounts.completed).toBe(0);
      expect(res.body.stats.totalHours).toBe(0);
    });
  });
});
