const Films = require('../models/film');
const NotFoundError = require('../errors/notFound');
const BadRequestError = require('../errors/badRequest');
const ForbiddenError = require('../errors/forbidden');

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
        throw new ForbiddenError('Такой фильм уже добавлен');
      }
      return Films.create({ ...req.body, owner: req.user._id })
        .then((newFilm) => res.status(201).send(newFilm));
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Ошибка валидации'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteFilms = (req, res, next) => {
  Films.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с таким id не найдена');
      }
      if (card.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Невозможно удалить чужие карточки');
      }
      return Films.findByIdAndDelete(req.params.cardId).then(() => {
        res.send({ message: 'Карточка удалена' });
      });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Не корректный _id карточки'));
      } else {
        next(err);
      }
    });
};
