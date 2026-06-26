const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { errorHandler } = require('./middleware/errorHandler');
const { verifyToken } = require('./middleware/verifyToken');
const { router: authRouter } = require('./routes/auth');
const { router: gamesRouter } = require('./routes/games');
const { router: backlogRouter } = require('./routes/backlog');
const { router: statsRouter } = require('./routes/stats');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const BASE = process.env.BASE_PATH ?? '';

app.get(`${BASE}/api/v1/health`, (req, res) => {
  res.json({ status: 'ok' });
});

app.use(`${BASE}/api/v1/auth`, authRouter);
app.use(`${BASE}/api/v1/games`, verifyToken, gamesRouter);
app.use(`${BASE}/api/v1/backlog`, verifyToken, backlogRouter);
app.use(`${BASE}/api/v1/stats`, verifyToken, statsRouter);

app.use(errorHandler);

module.exports = { app };
