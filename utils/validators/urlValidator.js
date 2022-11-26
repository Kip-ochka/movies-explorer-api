const validator = require('validator');
const BadRequest = require('../../errors/badRequest');
const { VALIDATION_ERROR } = require('../variables');

const urlValidator = (value) => {
  if (validator.isUrl(value, { require_protocol: true })) {
    throw new BadRequest(VALIDATION_ERROR);
  }
};

module.exports = urlValidator;
