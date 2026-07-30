const { body } = require('express-validator');

/**
 * Express Validator rules for Product endpoints
 */
const productRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Product title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('sku')
    .trim()
    .notEmpty().withMessage('SKU is required')
    .isLength({ min: 3, max: 50 }).withMessage('SKU must be between 3 and 50 characters'),
  body('categoryId')
    .notEmpty().withMessage('Category ID is required')
    .isInt({ min: 1 }).withMessage('Valid Category ID is required'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
  body('salePrice')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Sale price must be a positive number')
    .custom((value, { req }) => {
      if (value && parseFloat(value) >= parseFloat(req.body.price)) {
        throw new Error('Sale price must be strictly lower than regular price');
      }
      return true;
    }),
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock quantity cannot be negative')
];

module.exports = {
  productRules
};
