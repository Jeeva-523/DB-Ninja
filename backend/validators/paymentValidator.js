const { body } = require('express-validator');

const processPaymentRules = [
  body('orderId')
    .notEmpty().withMessage('Order ID is required')
    .isInt({ min: 1 }).withMessage('Valid Order ID is required'),
  body('amount')
    .notEmpty().withMessage('Payment amount is required')
    .isFloat({ min: 0.01 }).withMessage('Payment amount must be greater than 0'),
  body('paymentMethod')
    .optional()
    .trim()
];

module.exports = {
  processPaymentRules
};
