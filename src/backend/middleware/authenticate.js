// middleware/authenticate.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ← your secret from .env
    req.user = decoded; // now you can access req.user.id in your routes
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};
