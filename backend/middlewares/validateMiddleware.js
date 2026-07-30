const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

/**
 * Middleware to check express-validator results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    return next(ApiError.badRequest('Validation Error', formattedErrors));
  }
  next();
};

module.exports = validate;
