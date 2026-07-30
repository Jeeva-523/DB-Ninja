const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

/**
 * Global Enterprise Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, null, false);
  }

  const responseStatusCode = error.statusCode;
  const responseMessage = error.message;
  const responseErrors = error.errors;

  if (process.env.NODE_ENV === 'development' && !error.isOperational) {
    console.error('💥 UNHANDLED ERROR:', err);
  }

  return ApiResponse.error(res, responseStatusCode, responseMessage, responseErrors);
};

module.exports = errorHandler;
