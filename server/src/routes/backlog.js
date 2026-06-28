const { Router } = require('express');
const { pool } = require('../db');
const {
  STATUSES,
  addToBacklogSchema,
  updateBacklogSchema,
} = require('../validation/backlogSchemas');

const router = Router();

function parseStatuses(raw) {
  if (!raw) return [];
  return raw.split(',').map(s => s.trim()).filter(s => STATUSES.includes(s));
}

function resolveOrder(raw, defaultDir) {
  const upper = (raw ?? '').toUpperCase();
  if (upper === 'ASC' || upper === 'DESC') return upper;
  return defaultDir;
}

const SORT_MAP = {
  title:        { col: 'g.title',          dir: 'ASC' },
  rating:       { col: 'be.rating',         dir: 'DESC' },
  hours_played: { col: 'be.hours_played',   dir: 'DESC' },
  created_at:   { col: 'be.created_at',     dir: 'DESC' },
};

const ENTRY_SELECT = `
  SELECT
    be.id,
    be.status,
    be.rating,
    be.hours_played,
    be.notes,
    be.created_at,
    be.updated_at,
    g.id        AS game_id,
    g.rawg_id,
    g.title,
    g.cover_image_url,
    g.genres,
    g.platforms,
    g.release_year
  FROM backlog_entries be
  JOIN games g ON g.id = be.game_id
`;

router.post('/', async (req, res, next) => {
  try {
    const parsed = addToBacklogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: { message: 'Invalid input', code: 'VALIDATION_ERROR' },
      });
    }

    const {
      rawgId, title, coverImageUrl, genres, platforms,
      releaseYear, status, rating, hoursPlayed, notes,
    } = parsed.data;

    const gameResult = await pool.query(
      `INSERT INTO games
         (rawg_id, title, cover_image_url, genres, platforms, release_year)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (rawg_id) DO UPDATE SET
         title           = EXCLUDED.title,
         cover_image_url = EXCLUDED.cover_image_url,
         genres          = EXCLUDED.genres,
         platforms       = EXCLUDED.platforms,
         release_year    = EXCLUDED.release_year
       RETURNING id`,
      [
        rawgId,
        title,
        coverImageUrl ?? null,
        JSON.stringify(genres ?? []),
        JSON.stringify(platforms ?? []),
        releaseYear ?? null,
      ],
    );
    const gameId = gameResult.rows[0].id;

    const entryResult = await pool.query(
      `INSERT INTO backlog_entries
         (user_id, game_id, status, rating, hours_played, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.user.userId,
        gameId,
        status ?? 'backlog',
        rating ?? null,
        hoursPlayed ?? null,
        notes ?? null,
      ],
    );

    const entry = entryResult.rows[0];

    res.status(201).json({
      entry: {
        ...entry,
        rawg_id: rawgId,
        title,
        cover_image_url: coverImageUrl ?? null,
        genres: genres ?? [],
        platforms: platforms ?? [],
        release_year: releaseYear ?? null,
      },
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        error: { message: 'Game already in backlog', code: 'ALREADY_IN_BACKLOG' },
      });
    }
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { search, sort, order } = req.query;
    const { col, dir } = SORT_MAP[sort] ?? SORT_MAP.created_at;
    const resolvedOrder = resolveOrder(order, dir);

    const conditions = ['be.user_id = $1'];
    const params = [req.user.userId];

    const statuses = parseStatuses(req.query.status);
    if (statuses.length > 0) {
      params.push(statuses);
      conditions.push(`be.status::text = ANY($${params.length})`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`g.title ILIKE $${params.length}`);
    }

    const result = await pool.query(
      `${ENTRY_SELECT}
       WHERE ${conditions.join(' AND ')}
       ORDER BY ${col} ${resolvedOrder} NULLS LAST`,
      params,
    );

    res.json({ entries: result.rows });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const parsed = updateBacklogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: { message: 'Invalid input', code: 'VALIDATION_ERROR' },
      });
    }

    const existing = await pool.query(
      'SELECT id, user_id FROM backlog_entries WHERE id = $1',
      [req.params.id],
    );
    if (!existing.rows[0]) {
      return res.status(404).json({
        error: { message: 'Entry not found', code: 'NOT_FOUND' },
      });
    }
    if (existing.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({
        error: { message: 'Forbidden', code: 'FORBIDDEN' },
      });
    }

    const { status, rating, hoursPlayed, notes } = parsed.data;
    const updates = [];
    const params = [];

    if (status !== undefined) {
      params.push(status);
      updates.push(`status = $${params.length}`);
    }
    if (rating !== undefined) {
      params.push(rating);
      updates.push(`rating = $${params.length}`);
    }
    if (hoursPlayed !== undefined) {
      params.push(hoursPlayed);
      updates.push(`hours_played = $${params.length}`);
    }
    if (notes !== undefined) {
      params.push(notes);
      updates.push(`notes = $${params.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: { message: 'No fields to update', code: 'VALIDATION_ERROR' },
      });
    }

    params.push(req.params.id);
    const result = await pool.query(
      `UPDATE backlog_entries
       SET ${updates.join(', ')}, updated_at = now()
       WHERE id = $${params.length}
       RETURNING *`,
      params,
    );

    res.json({ entry: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await pool.query(
      'SELECT id, user_id FROM backlog_entries WHERE id = $1',
      [req.params.id],
    );
    if (!existing.rows[0]) {
      return res.status(404).json({
        error: { message: 'Entry not found', code: 'NOT_FOUND' },
      });
    }
    if (existing.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({
        error: { message: 'Forbidden', code: 'FORBIDDEN' },
      });
    }

    await pool.query('DELETE FROM backlog_entries WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = { router };
