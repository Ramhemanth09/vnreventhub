/**
 * Custom Operational Application Error Class
 * Distinguishes trusted operational errors from unhandled programmer errors.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Flag identifying predictable runtime errors

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
