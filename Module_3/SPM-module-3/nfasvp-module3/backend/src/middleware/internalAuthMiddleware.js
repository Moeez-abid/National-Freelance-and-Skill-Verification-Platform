'use strict';

const env = require('../config/env');

/**
 * internalAuthMiddleware.js
 * 
 * Validates inbound REST calls from other backend modules.
 * Checks for the presence of specific internal headers:
 * - X-Source-Module (e.g., 'module4')
 * - X-Internal-Key (must match the module's configured API key)
 */
function internalAuthMiddleware(expectedModuleKey) {
  return (req, res, next) => {
    const sourceModule = req.headers['x-source-module'];
    const internalKey = req.headers['x-internal-key'];

    if (!sourceModule || sourceModule !== expectedModuleKey) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid source module' });
    }

    // Lookup the correct internal key from env config based on the expected module
    const configuredKey = env[expectedModuleKey]?.apiKey;

    if (!configuredKey) {
      return res.status(500).json({ success: false, error: `Server configuration error for module: ${expectedModuleKey}` });
    }

    if (!internalKey || internalKey !== configuredKey) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid internal API key' });
    }

    next();
  };
}

module.exports = internalAuthMiddleware;
