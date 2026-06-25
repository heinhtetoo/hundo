const request = require('supertest');
const { app } = require('../src/app');

const GAME_PAYLOAD = {
  rawgId: 3498,
  title: 'Grand Theft Auto V',
  coverImageUrl: 'https://media.rawg.io/gta5.jpg',
  genres: [{ id: 4, name: 'Action' }],
  platforms: [{ id: 1, name: 'PC' }],
  releaseYear: 2013,
  status: 'backlog',
};

const GAME_PAYLOAD_2 = {
  rawgId: 802,
  title: 'Borderlands 2',
  coverImageUrl: 'https://media.rawg.io/bl2.jpg',
  genres: [{ id: 4, name: 'Action' }],
  platforms: [{ id: 1, name: 'PC' }],
  releaseYear: 2012,
  status: 'playing',
};

async function createAgent(email = 'backlog@example.com') {
  const agent = request.agent(app);
  await agent.post('/api/v1/auth/register').send({
    email,
    password: 'password123',
  });
  return agent;
}

describe('Backlog API', () => {
  let agent;

  beforeEach(async () => {
    agent = await createAgent();
  });

  describe('POST /api/v1/backlog', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await request(app).post('/api/v1/backlog').send(GAME_PAYLOAD);

      expect(res.status).toBe(401);
    });

    it('returns 400 with invalid body', async () => {
      const res = await agent.post('/api/v1/backlog').send({ title: 'No rawgId' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 201 and creates entry with game data', async () => {
      const res = await agent.post('/api/v1/backlog').send(GAME_PAYLOAD);

      expect(res.status).toBe(201);
      expect(res.body.entry).toMatchObject({
        status: 'backlog',
        rawg_id: 3498,
        title: 'Grand Theft Auto V',
      });
    });

    it('returns 409 if game already in backlog', async () => {
      await agent.post('/api/v1/backlog').send(GAME_PAYLOAD);
      const res = await agent.post('/api/v1/backlog').send(GAME_PAYLOAD);

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('ALREADY_IN_BACKLOG');
    });
  });

  describe('GET /api/v1/backlog', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/v1/backlog');

      expect(res.status).toBe(401);
    });

    it('returns empty array when no entries', async () => {
      const res = await agent.get('/api/v1/backlog');

      expect(res.status).toBe(200);
      expect(res.body.entries).toEqual([]);
    });

    it('returns entries joined with game data', async () => {
      await agent.post('/api/v1/backlog').send(GAME_PAYLOAD);

      const res = await agent.get('/api/v1/backlog');

      expect(res.status).toBe(200);
      expect(res.body.entries).toHaveLength(1);
      expect(res.body.entries[0]).toMatchObject({
        status: 'backlog',
        rawg_id: 3498,
        title: 'Grand Theft Auto V',
      });
    });

    it('filters by status', async () => {
      await agent.post('/api/v1/backlog').send(GAME_PAYLOAD);
      await agent.post('/api/v1/backlog').send(GAME_PAYLOAD_2);

      const res = await agent.get('/api/v1/backlog?status=playing');

      expect(res.status).toBe(200);
      expect(res.body.entries).toHaveLength(1);
      expect(res.body.entries[0].status).toBe('playing');
    });

    it('filters by search query on title', async () => {
      await agent.post('/api/v1/backlog').send(GAME_PAYLOAD);
      await agent.post('/api/v1/backlog').send(GAME_PAYLOAD_2);

      const res = await agent.get('/api/v1/backlog?search=borderlands');

      expect(res.status).toBe(200);
      expect(res.body.entries).toHaveLength(1);
      expect(res.body.entries[0].title).toBe('Borderlands 2');
    });

    it('only returns the authenticated user entries', async () => {
      await agent.post('/api/v1/backlog').send(GAME_PAYLOAD);

      const otherAgent = await createAgent('other@example.com');
      const res = await otherAgent.get('/api/v1/backlog');

      expect(res.status).toBe(200);
      expect(res.body.entries).toHaveLength(0);
    });
  });

  describe('PUT /api/v1/backlog/:id', () => {
    let entryId;

    beforeEach(async () => {
      const res = await agent.post('/api/v1/backlog').send(GAME_PAYLOAD);
      entryId = res.body.entry.id;
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app)
        .put(`/api/v1/backlog/${entryId}`)
        .send({ status: 'playing' });

      expect(res.status).toBe(401);
    });

    it('returns 404 for non-existent entry', async () => {
      const res = await agent.put('/api/v1/backlog/9999999').send({ status: 'playing' });

      expect(res.status).toBe(404);
    });

    it('returns 403 when updating another user entry', async () => {
      const otherAgent = await createAgent('other2@example.com');
      const res = await otherAgent
        .put(`/api/v1/backlog/${entryId}`)
        .send({ status: 'playing' });

      expect(res.status).toBe(403);
    });

    it('returns 200 and updates entry fields', async () => {
      const res = await agent.put(`/api/v1/backlog/${entryId}`).send({
        status: 'completed',
        rating: 9,
        hoursPlayed: 45.5,
        notes: 'Absolute classic.',
      });

      expect(res.status).toBe(200);
      expect(res.body.entry).toMatchObject({
        status: 'completed',
        rating: 9,
        notes: 'Absolute classic.',
      });
      expect(Number(res.body.entry.hours_played)).toBe(45.5);
    });

    it('returns 400 when no update fields are provided', async () => {
      const res = await agent.put(`/api/v1/backlog/${entryId}`).send({});

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/backlog/:id', () => {
    let entryId;

    beforeEach(async () => {
      const res = await agent.post('/api/v1/backlog').send(GAME_PAYLOAD);
      entryId = res.body.entry.id;
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).delete(`/api/v1/backlog/${entryId}`);

      expect(res.status).toBe(401);
    });

    it('returns 404 for non-existent entry', async () => {
      const res = await agent.delete('/api/v1/backlog/9999999');

      expect(res.status).toBe(404);
    });

    it('returns 403 when deleting another user entry', async () => {
      const otherAgent = await createAgent('other3@example.com');
      const res = await otherAgent.delete(`/api/v1/backlog/${entryId}`);

      expect(res.status).toBe(403);
    });

    it('returns 204 and entry is gone', async () => {
      const deleteRes = await agent.delete(`/api/v1/backlog/${entryId}`);
      expect(deleteRes.status).toBe(204);

      const getRes = await agent.get('/api/v1/backlog');
      expect(getRes.body.entries).toHaveLength(0);
    });
  });
});
