const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { loginRules, registerRules } = require('../validators/authValidator');
const validate = require('../middlewares/validateMiddleware');
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/rbacMiddleware');

/**
 * Authentication REST API Routes
 */

// Public Auth Endpoints
router.post('/login', loginRules, validate, AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

// Protected Auth Endpoints
router.get('/me', authenticateToken, AuthController.me);

// Super Admin Only User Creation Endpoint
router.post('/register', authenticateToken, authorizeRoles('super_admin'), registerRules, validate, AuthController.register);

module.exports = router;
