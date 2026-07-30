const { body } = require('express-validator');

const createOrderRules = [
  body('customerId')
    .notEmpty().withMessage('Customer ID is required')
    .isInt({ min: 1 }).withMessage('Valid Customer ID is required'),
  body('items')
    .isArray({ min: 1 }).withMessage('Order must contain at least 1 item'),
  body('items.*.productId')
    .notEmpty().withMessage('Product ID is required')
    .isInt({ min: 1 }).withMessage('Valid Product ID is required'),
  body('items.*.quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

const updateStatusRules = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status value')
];

module.exports = {
  createOrderRules,
  updateStatusRules
};
