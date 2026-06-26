import logger from '../utils/logger.js';

/**
 * Custom application error class.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Mongoose validation errors.
 */
const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation Error: ${messages.join(', ')}`, 400, 'VALIDATION_ERROR');
};

/**
 * Handle Mongoose cast errors (invalid ObjectId).
 */
const handleCastError = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400, 'INVALID_FIELD');
};

/**
 * Handle duplicate key errors.
 */
const handleDuplicateError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already exists`, 409, 'DUPLICATE_FIELD');
};

/**
 * Handle MongoDB sanitization errors.
 */
const handleSanitizationError = () => {
  return new AppError('Invalid characters detected in request', 400, 'INVALID_INPUT');
};

/**
 * Send error response in development mode.
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message,
    code: err.code || 'INTERNAL_ERROR',
    stack: err.stack,
    error: err,
  });
};

/**
 * Send error response in production mode.
 */
const sendErrorProd = (err, res) => {
  // Operational errors - send details to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      code: err.code,
    });
  } else {
    // Programming or unknown errors - don't leak details
    logger.error('UNEXPECTED ERROR:', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Global Express error handler middleware.
 * Must have 4 parameters to be recognized as error handler.
 */
export const globalErrorHandler = (err, _req, res, _next) => {
  let error = err;

  // Transform known Mongoose errors
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateError(err);
  if (err.message && err.message.includes('sanitized')) error = handleSanitizationError();

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * 404 Not Found handler.
 */
export const notFoundHandler = (req, _res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404, 'NOT_FOUND'));
};
