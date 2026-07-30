const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/rbacMiddleware');

/**
 * Reports REST Router
 */
router.use(authenticateToken);
router.use(authorizeRoles('super_admin', 'manager'));

router.get('/sales', ReportController.getSalesReport);
router.get('/top-products', ReportController.getTopProducts);
router.get('/category-breakdown', ReportController.getCategoryBreakdown);
router.get('/export/csv', ReportController.exportCsv);

module.exports = router;
