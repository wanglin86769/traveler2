const { validationResult } = require('express-validator');

/**
 * Validation result middleware
 * Check request validation results, return 400 status code if there are errors
 * 
 * @returns {Function} Express middleware function
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
      message: 'Validation failed'
    });
  }
  next();
};

module.exports = {
  validateRequest
};