const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { productRules } = require('../validators/productValidator');
const validate = require('../middlewares/validateMiddleware');
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/rbacMiddleware');
const uploadProductImage = require('../middlewares/uploadMiddleware');

/**
 * Product REST API Router
 */
router.use(authenticateToken);

// Read Endpoints
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);

// Write Endpoints (Super Admin & Manager only)
router.post('/', authorizeRoles('super_admin', 'manager'), uploadProductImage, productRules, validate, ProductController.create);
router.put('/:id', authorizeRoles('super_admin', 'manager'), uploadProductImage, productRules, validate, ProductController.update);
router.patch('/:id/stock', authorizeRoles('super_admin', 'manager'), ProductController.adjustStock);
router.delete('/:id', authorizeRoles('super_admin', 'manager'), ProductController.delete);

module.exports = router;
