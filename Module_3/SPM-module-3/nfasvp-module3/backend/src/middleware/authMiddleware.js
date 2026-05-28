'use strict';

/**
 * authMiddleware.js — JWT Validation Middleware
 *
 * Module 3 does NOT issue tokens. It only validates JWTs issued by Module 1.
 * Attach this middleware to individual routers (NOT globally), per architecture rules.
 *
 * On success: attaches decoded payload to req.user
 *   { id, uuid, role, email, iat, exp, ... }
 */

const jwt  = require('jsonwebtoken');
const env  = require('../config/env');
const pool = require('../config/pgClient');

/**
 * Extracts and verifies the Bearer token from the Authorization header.
 * Populates req.user with the decoded JWT payload on success.
 */
async function authMiddleware(req, res, next) {
  // ── 1. Extract token from Authorization header ──────────────────────────────
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: No token provided',
    });
  }

  const token = authHeader.slice(7); // strip "Bearer "

  // ── 2. Verify token using Module 1's JWT secret ──────────────────────────────
  try {
    const decoded = jwt.verify(token, env.module1.jwtSecret);

    // If the token payload contains a numeric id (from Module 1's old schema),
    // look up the corresponding UUID in the local users table and replace it.
    if (typeof decoded.id === 'number') {
      const result = await pool.query('SELECT uuid FROM users WHERE id = $1', [decoded.id]);
      if (result.rows.length > 0) {
        decoded.id = result.rows[0].uuid;
      }
    }

    // ── 3. Attach decoded payload to req.user ──────────────────────────────────
    // Module 1 payload shape: { id, uuid, role, email, iat, exp }
    req.user = decoded;

    return next();
  } catch (err) {
    // Handle specific JWT errors with clear messages
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Token has expired',
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid token',
    });
  }
}

/**
 * Role-based authorization factory.
 * Usage: router.get('/admin-route', authMiddleware, requireRole('admin'), handler)
 *
 * @param  {...string} roles - Allowed roles (e.g., 'client', 'freelancer', 'admin')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Requires role [${roles.join(' | ')}]`,
      });
    }

    return next();
  };
}

module.exports = { authMiddleware, requireRole };
