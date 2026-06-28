const { Router } = require('express');
const { pool } = require('../db');

const router = Router();

const EMPTY_STATUS_COUNTS = {
  backlog: 0,
  playing: 0,
  completed: 0,
  dropped: 0,
  wishlist: 0,
};

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [
      statusResult,
      hoursResult,
      genreResult,
      topResult,
      summaryResult,
      recentResult,
    ] = await Promise.all([
        pool.query(
          `SELECT status, COUNT(*) AS count
           FROM backlog_entries
           WHERE user_id = $1
           GROUP BY status`,
          [userId],
        ),
        pool.query(
          `SELECT
             COALESCE(SUM(hours_played), 0) AS total_hours,
             COUNT(*) FILTER (WHERE status NOT IN ('wishlist', 'backlog'))
               AS total,
             COUNT(*) FILTER (WHERE status = 'completed') AS completed
           FROM backlog_entries
           WHERE user_id = $1`,
          [userId],
        ),
        pool.query(
          `SELECT
             genre->>'name' AS genre,
             COUNT(*) AS count
           FROM backlog_entries be
           JOIN games g ON g.id = be.game_id
           CROSS JOIN jsonb_array_elements(
             COALESCE(g.genres, '[]'::jsonb)
           ) AS genre
           WHERE be.user_id = $1
           GROUP BY genre->>'name'
           ORDER BY count DESC`,
          [userId],
        ),
        pool.query(
          `SELECT
             g.rawg_id,
             g.title,
             g.cover_image_url,
             be.rating,
             be.hours_played,
             be.status
           FROM backlog_entries be
           JOIN games g ON g.id = be.game_id
           WHERE be.user_id = $1
             AND be.rating IS NOT NULL
           ORDER BY be.rating DESC, be.hours_played DESC NULLS LAST
           LIMIT 5`,
          [userId],
        ),
        pool.query(
          `SELECT
             AVG(be.rating) AS average_rating,
             (SELECT g.title
              FROM backlog_entries be2
              JOIN games g ON g.id = be2.game_id
              WHERE be2.user_id = $1 AND be2.hours_played IS NOT NULL
              ORDER BY be2.hours_played DESC
              LIMIT 1) AS longest_title,
             (SELECT be2.hours_played
              FROM backlog_entries be2
              WHERE be2.user_id = $1 AND be2.hours_played IS NOT NULL
              ORDER BY be2.hours_played DESC
              LIMIT 1) AS longest_hours
           FROM backlog_entries be
           WHERE be.user_id = $1`,
          [userId],
        ),
        pool.query(
          `SELECT g.rawg_id, g.title, g.cover_image_url, be.rating
           FROM backlog_entries be
           JOIN games g ON g.id = be.game_id
           WHERE be.user_id = $1 AND be.status = 'completed'
           ORDER BY be.updated_at DESC
           LIMIT 5`,
          [userId],
        ),
      ]);

    const statusCounts = { ...EMPTY_STATUS_COUNTS };
    for (const row of statusResult.rows) {
      statusCounts[row.status] = Number(row.count);
    }

    const { total_hours, total, completed } = hoursResult.rows[0];
    const totalNum = Number(total);
    const completionRate = totalNum === 0
      ? 0
      : Math.round((Number(completed) / totalNum) * 1000) / 10;

    const summary = summaryResult.rows[0];
    const averageRating = summary.average_rating === null
      ? null
      : Math.round(Number(summary.average_rating) * 10) / 10;
    const longestGame = summary.longest_title === null
      ? null
      : {
          title: summary.longest_title,
          hours: Number(summary.longest_hours),
        };

    res.json({
      stats: {
        statusCounts,
        totalHours: Number(total_hours),
        completionRate,
        averageRating,
        longestGame,
        genreDistribution: genreResult.rows.map(r => ({
          genre: r.genre,
          count: Number(r.count),
        })),
        topGames: topResult.rows,
        recentlyCompleted: recentResult.rows,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = { router };
