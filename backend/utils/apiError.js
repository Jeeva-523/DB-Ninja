/**
 * Custom Operational Error Class for Enterprise API Error Handling
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = null, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = 'Bad Request', errors = null) {
    return new ApiError(400, msg, errors);
  }

  static unauthorized(msg = 'Unauthorized Access') {
    return new ApiError(401, msg);
  }

  static forbidden(msg = 'Forbidden - Insufficient Permissions') {
    return new ApiError(403, msg);
  }

  static notFound(msg = 'Resource Not Found') {
    return new ApiError(404, msg);
  }

  static internal(msg = 'Internal Server Error') {
    return new ApiError(500, msg, null, false);
  }
}

module.exports = ApiError;
