const { body } = require('express-validator');

/**
 * Express Validator rules for Category endpoints
 */
const categoryRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('parentId')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === '' || val === undefined) return true;
      if (!Number.isInteger(Number(val)) || Number(val) <= 0) {
        throw new Error('Parent Category ID must be a valid positive integer');
      }
      return true;
    })
];

module.exports = {
  categoryRules
};
