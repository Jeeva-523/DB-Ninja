const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const { categoryRules } = require('../validators/categoryValidator');
const validate = require('../middlewares/validateMiddleware');
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/rbacMiddleware');

/**
 * Category REST API Router
 */
router.use(authenticateToken);

// Read Category Endpoints (All Authenticated Users)
router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);

// Write / Modify Endpoints (Super Admin & Manager only)
router.post('/', authorizeRoles('super_admin', 'manager'), categoryRules, validate, CategoryController.create);
router.put('/:id', authorizeRoles('super_admin', 'manager'), categoryRules, validate, CategoryController.update);
router.delete('/:id', authorizeRoles('super_admin', 'manager'), CategoryController.delete);

module.exports = router;
