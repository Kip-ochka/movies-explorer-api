const moviesdb = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Unauthorized = require('../errors/unauthorized');
const { INCORRECT_DATA } = require('../utils/variables');

const { Schema } = moviesdb;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: [2, 'имя должно содержать минимум 2 символа'],
    maxlength: [30, 'максимальная длина имени 30 символов'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: ({ value }) => `${value} - некорректный адрес email`,
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
}, {
  versionKey: false,
  toObject: { useProjection: true },
  toJSON: { useProjection: true },
});

userSchema.statics.findUser = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Unauthorized(INCORRECT_DATA));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Unauthorized(INCORRECT_DATA));
          }
          return user;
        });
    });
};

module.exports = moviesdb.model('user', userSchema);
