const router = require('express').Router();
const { validateFilmId, validateFilmData } = require('../utils/validators/filmValidator');
const {
  getMyFilms, addNewFilm, deleteFilms,
} = require('../controllers/filmControllers');

router.get('/', getMyFilms);
router.post('/', validateFilmData, addNewFilm);
router.delete('/:id', validateFilmId, deleteFilms);

module.exports = router;
