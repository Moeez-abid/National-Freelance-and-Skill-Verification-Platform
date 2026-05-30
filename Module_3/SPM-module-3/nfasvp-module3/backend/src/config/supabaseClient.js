'use strict';

/**
 * supabaseClient.js — DEPRECATED
 *
 * This module has been replaced by pgClient.js (local PostgreSQL via node-postgres).
 * This file is kept only for backward-compatibility in case anything still imports it.
 * It simply re-exports the pg Pool from pgClient.
 */

module.exports = require('./pgClient');
