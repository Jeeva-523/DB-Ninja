const { body } = require('express-validator');

const customerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Customer full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Valid email address is required'),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const addressRules = [
  body('addressLine1')
    .trim()
    .notEmpty().withMessage('Address Line 1 is required'),
  body('city')
    .trim()
    .notEmpty().withMessage('City is required'),
  body('state')
    .trim()
    .notEmpty().withMessage('State is required'),
  body('postalCode')
    .trim()
    .notEmpty().withMessage('Postal Code is required')
];

module.exports = {
  customerRules,
  addressRules
};
