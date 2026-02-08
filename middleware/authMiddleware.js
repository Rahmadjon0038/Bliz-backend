const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/app');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token kerak' });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch (error) {
    return res.status(403).json({ message: 'Token xato yoki muddati tugagan' });
  }
}

module.exports = { requireAuth };
