const Films = require('../models/film');
const NotFoundError = require('../errors/notFound');
const BadRequestError = require('../errors/badRequest');
const ForbiddenError = require('../errors/forbidden');
const {
  EXISITNG_ITEM, VALIDATION_ERROR, NOT_FOUND_FILM, DONT_OWNER, DELETED_MESSAGE, BAD_REQUEST_FILM,
} = require('../utils/variables');

module.exports.getMyFilms = (req, res, next) => {
  Films.find({ owner: req.user._id })
    .then((films) => {
      res.send(films);
    }).catch(next);
};

module.exports.addNewFilm = (req, res, next) => {
  Films.findOne({
    movieId: req.body.movieId,
    owner: req.user._id,
  })
    .then((film) => {
      if (film) {
        throw new ForbiddenError(EXISITNG_ITEM);
      }
      return Films.create({ ...req.body, owner: req.user._id })
        .then((newFilm) => res.status(201).send(newFilm));
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(VALIDATION_ERROR));
      } else {
        next(err);
      }
    });
};

module.exports.deleteFilms = (req, res, next) => {
  const { _id } = req.params;
  Films.findById({ _id })
    .then((film) => {
      if (!film) {
        throw new NotFoundError(NOT_FOUND_FILM);
      }
      if (film.owner.toString() !== req.user._id) {
        throw new ForbiddenError(DONT_OWNER);
      }
      return Films.findByIdAndDelete({ _id }).then(() => {
        res.send({ message: DELETED_MESSAGE });
      });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(BAD_REQUEST_FILM));
      } else {
        next(err);
      }
    });
};
