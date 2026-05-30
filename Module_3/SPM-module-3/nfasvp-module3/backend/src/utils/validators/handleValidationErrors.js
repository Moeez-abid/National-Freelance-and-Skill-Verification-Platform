'use strict';

const { validationResult } = require('express-validator');
const { ValidationError } = require('../../middleware/errorHandler');

/**
 * Middleware to check express-validator results.
 * Throws a formatted ValidationError if any checks failed.
 * The global errorHandler will map this to a 422 Unprocessable Entity.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format the errors for the ValidationError detail array
    const details = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));
    
    // Throw our custom error class
    throw new ValidationError('Validation failed', details);
  }
  next();
}

module.exports = handleValidationErrors;
