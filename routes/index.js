const router = require('express').Router();
const { validateLoginData, validateRegisterData } = require('../utils/validators/userValidator');
const NotFound = require('../errors/notFound');
const auth = require('../middlewares/auth');
const filmsRouter = require('./filmsRoutes');
const usersRouter = require('./usersRoutes');
const { login, createUser, logout } = require('../controllers/usersControllers');

router.post('/signin', validateLoginData, login);
router.post('/signup', validateRegisterData, createUser);

router.use(auth);

router.use('/users', usersRouter);
router.use('/movies', filmsRouter);
router.get('/signout', logout);

router.use(() => {
  throw new NotFound('Ресурс не найден. Проверьте URL и метод запроса');
});

module.exports = router;
