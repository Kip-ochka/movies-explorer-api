const express = require('express');
const moviesdb = require('mongoose');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const limiter = require('./utils/limiter');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { errorHandler } = require('./middlewares/errorHandler');
const router = require('./routes/index');

const { PORT = 3001, MONGO_URL = 'mongodb://localhost:27017/filmsdb' } = process.env;

const app = express();
moviesdb.connect(MONGO_URL);
app.use(requestLogger);
app.use(helmet());
app.use(limiter);

app.use(express.json());
app.use(cookieParser());
app.use(router);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
