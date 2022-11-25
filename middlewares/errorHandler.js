const { SERVER_ERROR } = require('../utils/variables');

module.exports.errorHandler = (err, _, res, next) => {
  console.log(err);
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500 ? SERVER_ERROR : message,
    });
  next();
};
