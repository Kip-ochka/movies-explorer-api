const { SERVER_ERROR } = require('../utils/variables');

module.exports.errorHandler = (err, _, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      err,
    });
  next();
};
