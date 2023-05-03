const jwt = require('jsonwebtoken');
const { SECRET_JWT_KEY } = require('../utils/constants');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).send({ message: 'Авторизуйтесь' });
  }
  let payload;
  try {
    payload = jwt.verify(token, SECRET_JWT_KEY);
  } catch (err) {
    return res.status(401).send({ message: 'Авторизуйтесь' });
  }
  req.user = payload;
  return next();
};
