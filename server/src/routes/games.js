const { Router } = require('express');
const { searchGames, getGameById, getGameScreenshots } = require('../lib/rawg');

const router = Router();

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
