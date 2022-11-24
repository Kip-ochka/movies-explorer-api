const express = require('express');
const filmsdb = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { errorHandler } = require('./middlewares/errorHandler');
const router = require('./routes/index');

const { PORT = 3001, MONGO_URL = 'mongodb://localhost:27017/filmsdb' } = process.env;

const app = express();
filmsdb.connect(MONGO_URL);

app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // for 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

app.use(requestLogger);
app.use(express.json());
app.use(cookieParser());
app.use(router);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
