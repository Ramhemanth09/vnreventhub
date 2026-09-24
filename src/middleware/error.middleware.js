const AppError = require('../utils/AppError');

/**
 * Handle Mongoose CastError (e.g. invalid MongoDB ObjectId format)
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid resource identifier: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose duplicate key error (code 11000)
 */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue ? err.keyValue[field] : '';
  const message = `Duplicate value '${value}' for ${field}. Please use another value.`;
  return new AppError(message, 409);
};

/**
 * Handle Mongoose Schema Validation errors
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle JWT Invalid Signature
 */
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

/**
 * Handle JWT Token Expiration
 */
const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

/**
 * Global Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.name = err.name;

  // Handle specific database and token errors
  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Send structured error response
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 Route Not Found Middleware
 */
const notFound = (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found on this server`, 404));
};

module.exports = {
  errorHandler,
  notFound
};
