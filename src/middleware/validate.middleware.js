const { validationResult } = require('express-validator');

/**
 * Validation Middleware
 * Checks for express-validator errors and returns consistent 400 response.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please check input fields.',
      errors: extractedErrors
    });
  }
  next();
};

module.exports = { validate };
