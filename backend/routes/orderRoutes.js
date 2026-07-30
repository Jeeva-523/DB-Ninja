const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { createOrderRules, updateStatusRules } = require('../validators/orderValidator');
const validate = require('../middlewares/validateMiddleware');
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/rbacMiddleware');

/**
 * Order REST Router
 */
router.use(authenticateToken);

router.get('/', OrderController.getAll);
router.get('/:id', OrderController.getById);
router.post('/', authorizeRoles('super_admin', 'manager'), createOrderRules, validate, OrderController.create);
router.patch('/:id/status', authorizeRoles('super_admin', 'manager', 'support'), updateStatusRules, validate, OrderController.updateStatus);

module.exports = router;
