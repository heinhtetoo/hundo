const { Router } = require('express');
const { pool } = require('../db');
const {
  searchGames,
  getGameById,
  getGameScreenshots,
  listGames,
  getGenres,
  getPlatforms,
} = require('../lib/rawg');

const router = Router();

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const CURATED_ROWS = [
  {
    slug: 'top-rated',
    title: 'Top Rated',
    params: { ordering: '-rating', metacritic: '70,100', page_size: 20 },
  },
  {
    slug: 'new-releases',
    title: 'New Releases',
    params: () => {
      const today = new Date().toISOString().slice(0, 10);
      const ago = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      return { dates: `${ago},${today}`, ordering: '-released', page_size: 20 };
    },
  },
  {
    slug: 'popular',
    title: 'Popular Now',
    params: { ordering: '-added', page_size: 20 },
  },
];

const BROWSE_SORT_MAP = {
  rating:   '-rating',
  released: '-released',
  name:     'name',
  added:    '-added',
};

async function getCachedRow(slug) {
  const result = await pool.query(
    'SELECT payload, refreshed_at FROM game_collections WHERE slug = $1',
    [slug],
  );
  return result.rows[0] ?? null;
}

async function upsertRow(slug, title, payload) {
  await pool.query(
    `INSERT INTO game_collections (slug, title, payload, refreshed_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (slug) DO UPDATE SET
       title        = EXCLUDED.title,
       payload      = EXCLUDED.payload,
       refreshed_at = now()`,
    [slug, title, JSON.stringify(payload)],
  );
}

function isStale(row) {
  return !row || Date.now() - new Date(row.refreshed_at).getTime() > CACHE_TTL_MS;
}

async function refreshRow(row) {
  const params = typeof row.params === 'function' ? row.params() : row.params;
  try {
    const data = await listGames(params);
    await upsertRow(row.slug, row.title, data.results);
  } catch {
    // keep serving last-good cache; swallow silently
  }
}

router.get('/discover', async (req, res, next) => {
  try {
    const rows = [];
    const toRefresh = [];

    for (const def of CURATED_ROWS) {
      const cached = await getCachedRow(def.slug);
      if (cached) {
        rows.push({ slug: def.slug, title: def.title, games: cached.payload });
        if (isStale(cached)) toRefresh.push(def);
      } else {
        const params = typeof def.params === 'function' ? def.params() : def.params;
        const data = await listGames(params);
        await upsertRow(def.slug, def.title, data.results);
        rows.push({ slug: def.slug, title: def.title, games: data.results });
      }
    }

    res.json({ rows });

    for (const def of toRefresh) {
      refreshRow(def).catch(() => {});
    }
  } catch (err) {
    next(err);
  }
});

router.get('/browse', async (req, res, next) => {
  try {
    const { genre, platform, year, sort, order, page } = req.query;

    const rawgParams = { page_size: 20 };

    if (genre) rawgParams.genres = genre;
    if (platform) rawgParams.platforms = platform;
    if (year) rawgParams.dates = `${year}-01-01,${year}-12-31`;
    if (page) rawgParams.page = page;

    const baseOrdering = BROWSE_SORT_MAP[sort] ?? '-rating';
    const resolvedOrdering =
      order === 'asc' ? baseOrdering.replace(/^-/, '') : baseOrdering.startsWith('-')
        ? baseOrdering
        : `-${baseOrdering}`;
    rawgParams.ordering = resolvedOrdering;

    const data = await listGames(rawgParams);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/genres', async (req, res, next) => {
  try {
    const cached = await getCachedRow('__genres__');
    if (cached && !isStale(cached)) {
      return res.json({ genres: cached.payload });
    }
    const genres = await getGenres();
    await upsertRow('__genres__', 'Genres', genres);
    refreshRow.catch?.(() => {});
    res.json({ genres });
  } catch (err) {
    next(err);
  }
});

router.get('/platforms', async (req, res, next) => {
  try {
    const cached = await getCachedRow('__platforms__');
    if (cached && !isStale(cached)) {
      return res.json({ platforms: cached.payload });
    }
    const platforms = await getPlatforms();
    await upsertRow('__platforms__', 'Platforms', platforms);
    res.json({ platforms });
  } catch (err) {
    next(err);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(400).json({
        error: { message: 'Query parameter q is required', code: 'VALIDATION_ERROR' },
      });
    }
    const games = await searchGames(q.trim());
    res.json({ games });
  } catch (err) {
    next(err);
  }
});

router.get('/:rawgId/screenshots', async (req, res, next) => {
  try {
    const screenshots = await getGameScreenshots(req.params.rawgId);
    res.json({ screenshots });
  } catch (err) {
    next(err);
  }
});

router.get('/:rawgId', async (req, res, next) => {
  try {
    const game = await getGameById(req.params.rawgId);
    res.json({ game });
  } catch (err) {
    next(err);
  }
});

module.exports = { router };
