const { body } = require('express-validator');

/**
 * Validation rules for authentication requests
 */
const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Full Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('roleId')
    .notEmpty().withMessage('Role ID is required')
    .isInt({ min: 1 }).withMessage('Valid Role ID is required')
];

module.exports = {
  loginRules,
  registerRules
};
