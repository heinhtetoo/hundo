const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { errorHandler } = require('./middleware/errorHandler');
const { verifyToken } = require('./middleware/verifyToken');
const { router: authRouter } = require('./routes/auth');
const { router: gamesRouter } = require('./routes/games');
const { router: backlogRouter } = require('./routes/backlog');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/games', verifyToken, gamesRouter);

app.use('/api/v1/backlog', verifyToken, backlogRouter);

app.use(errorHandler);

module.exports = { app };
