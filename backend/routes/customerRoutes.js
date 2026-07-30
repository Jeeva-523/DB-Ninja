const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customerController');
const { customerRules, addressRules } = require('../validators/customerValidator');
const validate = require('../middlewares/validateMiddleware');
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/rbacMiddleware');

/**
 * Customer REST Router
 */
router.use(authenticateToken);
router.use(authorizeRoles('super_admin', 'manager', 'support'));

router.get('/', CustomerController.getAll);
router.get('/:id', CustomerController.getById);
router.post('/', customerRules, validate, CustomerController.create);
router.patch('/:id/status', authorizeRoles('super_admin', 'manager'), CustomerController.toggleStatus);
router.post('/:id/addresses', addressRules, validate, CustomerController.addAddress);

module.exports = router;
