const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/badRequest');
const MatchedError = require('../errors/matched');

const { JWT_SECRET, NODE_ENV } = process.env;

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUser(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.cookie('token', token, {
        maxAge: 999999999, httpOnly: true, sameSite: true, secure: true,
      })
        .send({ email });
    }).catch((err) => {
      next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, email,
  } = req.body;
  bcrypt.hash(req.body.password, 10).then((hash) => {
    User.create({
      name,
      email,
      password: hash,
    }).then((user) => { res.send(user); })
      .catch((err) => {
        if (err.code === 11000) {
          next(new MatchedError('Пользователь с данным email уж существует'));
        } else if (err.name === 'ValidationError') {
          next(new BadRequestError('Ошибка валидации'));
        } else {
          next(err);
        }
      });
  });
};

module.exports.logout = (_, res, next) => {
  res.clearCookie('token').send({ message: 'Вы вышли из профиля' })
    .catch((err) => {
      next(err);
    });
};

module.exports.getMyData = (req, res, next) => {
  User.findOne({ _id: req.user._id })
    .then((user) => {
      res.send(user);
    })
    .catch(next);
};

const updateData = (req, res, next, userData) => {
  User.findByIdAndUpdate(req.user._id, userData, {
    new: true,
    runValidators: true,
  })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Отправленные данные не корректны, перепроверьте данные.'));
      } else if (err.name === 'CastError') {
        next(new BadRequestError('Не корректный _id пользователя'));
      } else {
        next(err);
      }
    });
};

module.exports.updateUserInfo = (req, res, next) => {
  User.findOne(req.body.email)
    .then((matchedData) => {
      if (matchedData && matchedData._id.toString() !== req.user._id) {
        next(new MatchedError('Данный email уже используется'));
      }
    }).then(() => {
      const userData = {
        name: req.body.name,
        email: req.body.email,
      };
      updateData(req, res, next, userData);
    }).catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Отправленные данные не корректны, перепроверьте данные.'));
      } else if (err.name === 'CastError') {
        next(new BadRequestError('Не корректный _id пользователя'));
      } else {
        next(err);
      }
    });
};
