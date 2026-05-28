'use strict';

/**
 * sanitizerMiddleware.js — XSS & SQL Injection Sanitization (REQ-MKT-NFR-002)
 *
 * Recursively sanitizes all string values in req.body and req.query.
 * Applied globally BEFORE all route handlers.
 *
 * Strategy:
 *   - Strip HTML tags           → prevents XSS
 *   - Strip SQL injection keywords/patterns → prevents SQLi
 *   - Preserve URLs, descriptions, special chars in normal prose
 */

// ── Dangerous SQL patterns to remove ──────────────────────────────────────────
// Ordered from most specific to most general to avoid over-stripping
const SQL_PATTERNS = [
  /;\s*DROP\s+TABLE/gi,
  /;\s*DROP\s+DATABASE/gi,
  /;\s*DELETE\s+FROM/gi,
  /;\s*TRUNCATE\s+TABLE/gi,
  /;\s*INSERT\s+INTO/gi,
  /;\s*UPDATE\s+\w+\s+SET/gi,
  /'\s*OR\s*'?\s*\d*\s*'?\s*=\s*'?\s*\d*/gi,   // ' OR '1'='1
  /'\s*OR\s+1\s*=\s*1/gi,
  /--\s*(.*)/g,                                   // SQL line comments: -- comment
  /\/\*[\s\S]*?\*\//g,                            // SQL block comments: /* ... */
  /UNION\s+(ALL\s+)?SELECT/gi,
  /EXEC(\s|\()+/gi,
  /EXECUTE(\s|\()+/gi,
  /xp_cmdshell/gi,
  /INFORMATION_SCHEMA/gi,
  /sys\.tables/gi,
];

// ── HTML tag pattern ───────────────────────────────────────────────────────────
const HTML_TAG_PATTERN = /<[^>]*>/g;

// ── HTML entities that could be used for XSS bypass ───────────────────────────
const DANGEROUS_ENTITIES = /&(lt|gt|amp|quot|#\d+|#x[\da-f]+);/gi;

/**
 * Sanitizes a single string value.
 * Strips HTML tags and SQL injection patterns.
 * Trims leading/trailing whitespace.
 *
 * @param  {string} value - Raw input string
 * @returns {string}       - Sanitized string
 */
function sanitizeString(value) {
  if (typeof value !== 'string') return value;

  let sanitized = value;

  // 1. Strip HTML tags (XSS prevention)
  sanitized = sanitized.replace(HTML_TAG_PATTERN, '');

  // 2. Strip dangerous HTML entities used for XSS obfuscation
  sanitized = sanitized.replace(DANGEROUS_ENTITIES, '');

  // 3. Strip SQL injection patterns
  SQL_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '');
  });

  // 4. Trim
  return sanitized.trim();
}

/**
 * Recursively sanitizes all string values within an object or array.
 * Non-string primitives (numbers, booleans) are passed through unchanged.
 *
 * @param  {*} data - Input value (object, array, or primitive)
 * @returns {*}      - Sanitized copy
 */
function sanitizeDeep(data) {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    return sanitizeString(data);
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeDeep);
  }

  if (typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeDeep(value);
    }
    return sanitized;
  }

  // Numbers, booleans — pass through as-is
  return data;
}

/**
 * Express middleware — sanitizes req.body and req.query in-place.
 * Must be applied AFTER express.json() so the body is already parsed.
 */
function sanitizerMiddleware(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeDeep(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeDeep(req.query);
  }

  next();
}

module.exports = { sanitizerMiddleware, sanitizeString, sanitizeDeep };
