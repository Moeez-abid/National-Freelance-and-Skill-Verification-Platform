'use strict';

/**
 * env.js — Centralized environment configuration
 *
 * Reads from process.env (populated by dotenv in server.js).
 * Throws a descriptive error at startup if any required variable is missing,
 * so the server fails fast rather than silently misconfigurating.
 */

const REQUIRED_VARS = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'PORT',
  'MODULE1_JWT_SECRET',
  'MODULE6_BASE_URL',
  'MODULE7_BASE_URL',
  'MODULE4_API_KEY',
];

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `[Module 3] Missing required environment variables:\n  ${missing.join('\n  ')}\n` +
    `Copy .env.example to .env and fill in all values.`
  );
}

const env = {
  // Server
  port: parseInt(process.env.PORT, 10) || 4003,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Local PostgreSQL
  db: {
    host    : process.env.DB_HOST,
    port    : parseInt(process.env.DB_PORT, 10) || 5432,
    name    : process.env.DB_NAME,
    user    : process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },

  // Module 1 — Auth (JWT validation)
  module1: {
    jwtSecret: process.env.MODULE1_JWT_SECRET,
    baseUrl: process.env.MODULE1_BASE_URL || 'http://localhost:4001',
  },

  // Module 6 — Communication (outbound)
  module6: {
    baseUrl: process.env.MODULE6_BASE_URL,
    apiKey: process.env.MODULE6_API_KEY || '',
  },

  // Module 7 — Payment & Escrow (outbound)
  module7: {
    baseUrl: process.env.MODULE7_BASE_URL,
    apiKey: process.env.MODULE7_API_KEY || '',
  },

  // Module 4 — AI Matching (inbound)
  module4: {
    apiKey: process.env.MODULE4_API_KEY,
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
};

module.exports = env;
