import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let details = err.details || null;

  // Handle Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = Object.values(err.errors).map(e => e.message).join(', ');
    details = err.errors;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = err.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid authentication token.';
  }

  // Log error (with stack trace internally)
  if (statusCode >= 500) {
    logger.error({ err, path: req.originalUrl, method: req.method }, 'Server internal error');
  } else {
    logger.warn({ path: req.originalUrl, method: req.method, code, message }, 'Client error');
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      timestamp: new Date().toISOString(),
    },
  });
}
