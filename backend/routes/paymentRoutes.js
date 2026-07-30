const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { processPaymentRules } = require('../validators/paymentValidator');
const validate = require('../middlewares/validateMiddleware');
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/rbacMiddleware');

/**
 * Payment REST Router
 */
router.use(authenticateToken);
router.use(authorizeRoles('super_admin', 'manager'));

router.get('/', PaymentController.getAll);
router.get('/:id', PaymentController.getById);
router.post('/process', processPaymentRules, validate, PaymentController.processPayment);
router.post('/:id/refund', PaymentController.refund);

module.exports = router;
