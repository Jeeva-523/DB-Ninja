const { verifyAccessToken } = require('../config/jwt');
const ApiError = require('../utils/apiError');

/**
 * Authentication Middleware: Validates Bearer JWT Access Token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Access token is missing or malformed'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedPayload = verifyAccessToken(token);
    req.user = decodedPayload;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Access token has expired'));
    }
    return next(ApiError.unauthorized('Invalid authorization token'));
  }
};

module.exports = authenticateToken;
