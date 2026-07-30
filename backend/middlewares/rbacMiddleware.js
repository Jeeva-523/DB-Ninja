const ApiError = require('../utils/apiError');

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param {Array<string>} allowedRoles List of roles permitted to access endpoint
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(ApiError.unauthorized('User session context missing'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Access Denied: Role '${req.user.role}' lacks permission for this resource`));
    }

    next();
  };
};

module.exports = authorizeRoles;
