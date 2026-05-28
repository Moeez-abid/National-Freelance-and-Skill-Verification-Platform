'use strict';

/**
 * rateLimiter.js — Express Rate Limiter
 *
 * Configured from env vars RATE_LIMIT_WINDOW_MS and RATE_LIMIT_MAX.
 * Applied globally in server.js before all routes.
 *
 * Default: 100 requests per 15-minute window per IP.
 */

const rateLimit = require('express-rate-limit');
const env       = require('../config/env');

const rateLimiter = rateLimit({
  windowMs          : env.rateLimit.windowMs,   // e.g. 900000 = 15 minutes
  max               : env.rateLimit.max,         // max requests per window per IP
  standardHeaders   : true,                      // return RateLimit-* headers (RFC 6585)
  legacyHeaders     : false,                     // disable X-RateLimit-* headers

  message: {
    success : false,
    error   : 'Too many requests — please try again later.',
    code    : 'RATE_LIMIT_EXCEEDED',
  },

  // Skip rate limiting for health check endpoint
  skip: (req) => req.path === '/api/v1/health',

  // Keyed by IP by default; can be extended to key by user ID post-auth
  keyGenerator: (req) => req.ip,
});

module.exports = rateLimiter;
