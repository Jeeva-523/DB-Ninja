const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/rbacMiddleware');

/**
 * Dashboard REST API Routes (Protected by Auth & Role Permissions)
 */
router.use(authenticateToken);
router.use(authorizeRoles('super_admin', 'manager'));

router.get('/summary', DashboardController.getSummary);
router.get('/revenue-trend', DashboardController.getRevenueTrend);
router.get('/recent-orders', DashboardController.getRecentOrders);

module.exports = router;
