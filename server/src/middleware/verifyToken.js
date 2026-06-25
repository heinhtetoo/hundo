const { verifyAccessToken } = require('../lib/tokens');

function verifyToken(req, res, next) {
  const token = req.cookies.accessToken;

  if (!token) {
    return res
      .status(401)
      .json({ error: { message: 'No token provided', code: 'UNAUTHORIZED' } });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.userId, email: payload.email };
    next();
  } catch {
    res
      .status(401)
      .json({ error: { message: 'Invalid token', code: 'UNAUTHORIZED' } });
  }
}

module.exports = { verifyToken };
