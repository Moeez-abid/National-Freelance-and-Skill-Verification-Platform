'use strict';

/**
 * pgClient.js — PostgreSQL connection pool singleton (replaces supabaseClient.js)
 *
 * This is the ONLY file that creates and exports the pg Pool.
 * Rule: Only repositories (dataAccess layer) may import from this file.
 *       Services in the application layer MUST NOT import this directly.
 *
 * Usage in repositories:
 *   const pool = require('../../config/pgClient');
 *   const { rows } = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host    : process.env.DB_HOST     || 'localhost',
  port    : parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME     || 'nfasvp_module3',
  user    : process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  // Keep a pool of up to 10 connections; idle connections released after 30s
  max           : 10,
  idleTimeoutMillis   : 30000,
  connectionTimeoutMillis: 5000,
});

// Log connection events in development
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    // Uncomment the line below to log every new connection:
    // console.log('🐘 [pg] New client connected to local PostgreSQL');
  }
});

pool.on('error', (err) => {
  console.error('🔴 [pg] Unexpected pool error:', err.message);
});

module.exports = pool;
