const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/badRequest');
const MatchedError = require('../errors/matched');
const {
  MATCHED_EMAIL, VALIDATION_ERROR, LOGOUT_MESSAGE, BAD_REQUEST_DATA, BAD_REQUEST_ID,
} = require('../utils/variables');

const { JWT_SECRET, NODE_ENV } = process.env;

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUser(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.cookie('token', token, {
        maxAge: 999999999,
        httpOnly: true,
        sameSite: true,
        secure: true,
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
          next(new MatchedError(MATCHED_EMAIL));
        } else if (err.name === 'ValidationError') {
          next(new BadRequestError(VALIDATION_ERROR));
        } else {
          next(err);
        }
      });
  });
};

module.exports.logout = (_, res, next) => {
  res.clearCookie('token').send({ message: LOGOUT_MESSAGE })
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
        next(new BadRequestError(BAD_REQUEST_DATA));
      } else if (err.name === 'CastError') {
        next(new BadRequestError(BAD_REQUEST_ID));
      } else {
        next(err);
      }
    });
};

module.exports.updateUserInfo = (req, res, next) => {
  const { email } = req.body;
  User.findOne({ email })
    .then((matchedData) => {
      // if (matchedData && matchedData._id.toString() !== req.user._id) {
      //  next(new MatchedError(MATCHED_EMAIL));
      // }
      console.log(matchedData);
    }).then(() => {
      const userData = {
        name: req.body.name,
        email: req.body.email,
      };
      console.log(userData);
      updateData(req, res, next, userData);
    }).catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(BAD_REQUEST_DATA));
      } else if (err.name === 'CastError') {
        next(new BadRequestError(BAD_REQUEST_ID));
      } else {
        next(err);
      }
    });
};
