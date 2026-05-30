'use strict';

/**
 * errorHandler.js — Global Error Handler + Custom Error Classes
 *
 * Must be mounted as the LAST middleware in server.js (4-arg signature).
 * All services and routes throw custom error instances; this handler maps
 * them to the correct HTTP status codes and response shape.
 *
 * Response shape:
 *   { success: false, error: string, code?: string, details?: array }
 */

const env = require('../config/env');

// =============================================================================
// CUSTOM ERROR CLASSES
// =============================================================================

/**
 * Base class for all Module 3 application errors.
 * Sets statusCode, code, and captures a clean stack trace.
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name      = this.constructor.name;
    this.statusCode = statusCode;
    this.code       = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * HTTP 422 — Input failed validation rules.
 * @param {string}   message  - Human-readable summary
 * @param {Array}    details  - Array of field-level errors from express-validator
 */
class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = []) {
    super(message, 422, 'VALIDATION_ERROR');
    this.details = details;
  }
}

/**
 * HTTP 401 — Authentication failure (missing / invalid / expired token).
 */
class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'AUTH_ERROR');
  }
}

/**
 * HTTP 403 — Authenticated but insufficient permissions.
 */
class ForbiddenError extends AppError {
  constructor(message = 'Forbidden: insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * HTTP 404 — Resource does not exist.
 * @param {string} resource - e.g. "Job", "Bid", "Gig"
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

/**
 * HTTP 409 — Conflict (duplicate entry, constraint violation, etc.).
 */
class ConflictError extends AppError {
  constructor(message = 'Conflict: resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

// =============================================================================
// GLOBAL ERROR HANDLER MIDDLEWARE
// =============================================================================

/**
 * Express global error handler (must have exactly 4 parameters).
 * Mount this as the LAST app.use() call in server.js.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // ── 1. Log stack in development only ────────────────────────────────────────
  if (!env.isProduction) {
    console.error('─────────────────────────────────────');
    console.error(`[ERROR] ${err.name}: ${err.message}`);
    console.error(`Route : ${req.method} ${req.originalUrl}`);
    console.error(err.stack);
    console.error('─────────────────────────────────────');
  }

  // ── 2. Known application errors ─────────────────────────────────────────────
  if (err instanceof ValidationError) {
    return res.status(422).json({
      success : false,
      error   : err.message,
      code    : err.code,
      details : err.details,
    });
  }

  if (err instanceof AuthError) {
    return res.status(401).json({
      success : false,
      error   : err.message,
      code    : err.code,
    });
  }

  if (err instanceof ForbiddenError) {
    return res.status(403).json({
      success : false,
      error   : err.message,
      code    : err.code,
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      success : false,
      error   : err.message,
      code    : err.code,
    });
  }

  if (err instanceof ConflictError) {
    return res.status(409).json({
      success : false,
      error   : err.message,
      code    : err.code,
    });
  }

  // ── 3. Any other AppError subclass (generic mapped error) ───────────────────
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success : false,
      error   : err.message,
      code    : err.code,
    });
  }

  // ── 4. Unknown / unhandled error — never leak internals in production ────────
  const statusCode = err.status || err.statusCode || 500;

  return res.status(statusCode >= 400 ? statusCode : 500).json({
    success : false,
    error   : env.isProduction ? 'Internal server error' : (err.message || 'Internal server error'),
    code    : 'INTERNAL_ERROR',
  });
}

module.exports = {
  errorHandler,
  // Custom error classes — imported by services and routes
  AppError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
};
