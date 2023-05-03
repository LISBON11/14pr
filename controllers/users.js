const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const SECRET_JWT_KEY = require('../utils/constants');
const handleErrors = require('../errors/handleErrors');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => handleErrors(err, res));
};

module.exports.getMe = (req, res) => {
  const { _id } = req.user;
  User.findById({ _id })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Такого пользователя не существует');
      }
      res.send(user);
    })
    .catch((err) => handleErrors(err, res));
};

module.exports.getUser = (req, res) => {
  const { _id } = req.params.id;
  User.findById(_id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Такого пользователя не существует');
      }
      res.send(user);
    })
    .catch((err) => handleErrors(err, res));
};

module.exports.createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    })
      .then((user) => res.status(201).send(user))
      .catch((err) => handleErrors(err, res)));
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { runValidators: true, new: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError();
      } else {
        return res.send({
          _id: user._id,
          avatar: user.avatar,
          name,
          about,
        });
      }
    })
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { runValidators: true, new: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError();
      } else {
        return res.send({
          _id: user._id,
          avatar,
          name: user.name,
          about: user.about,
        });
      }
    })
    .catch(next);
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ id: user._id }, SECRET_JWT_KEY, { expiresIn: '7d' });
      res.cookie('token'/** 'jwt' */, token, {
        maxAge: 3600000,
        httpOnly: true,
        sameSite: true,
      })
        .send({ token });
    })
    .catch((err) => res.status(401).send({ message: err.message }));
};
