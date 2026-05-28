'use strict';

/**
 * responseFormatter.js
 * Utility to enforce a consistent API response structure across all routes.
 */

const success = (res, data, statusCode = 200, meta = null) => {
  const response = { success: true, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

const error = (res, message, statusCode = 400, details = null) => {
  const response = { success: false, error: message };
  if (details) response.details = details;
  return res.status(statusCode).json(response);
};

module.exports = { success, error };
