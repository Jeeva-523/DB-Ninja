const express = require('express');
const router = express.Router();
const SettingController = require('../controllers/settingController');
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/rbacMiddleware');

/**
 * Settings REST Router
 */
router.use(authenticateToken);

router.get('/', SettingController.getSettings);
router.put('/', authorizeRoles('super_admin'), SettingController.updateSettings);
router.get('/audit-logs', authorizeRoles('super_admin', 'manager'), SettingController.getAuditLogs);

module.exports = router;
