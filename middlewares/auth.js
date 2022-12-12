const jwt = require('jsonwebtoken');
const Unauthorized = require('../errors/unauthorized');
const { AUTH_NEEDED } = require('../utils/variables');

const { JWT_SECRET, NODE_ENV } = process.env;

module.exports = (req, _, next) => {
  const { token } = req.cookies;
  if (!token) {
    throw new Unauthorized(AUTH_NEEDED);
  }

  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    next(new Unauthorized(AUTH_NEEDED));
    throw new Error(AUTH_NEEDED);
  }
  req.user = payload;
  return next();
};
