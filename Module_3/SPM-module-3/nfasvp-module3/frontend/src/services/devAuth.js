/**
 * devAuth.js — Development JWT Helper
 * National Freelance & Skill Verification Platform — Module 3
 *
 * The backend validates JWTs signed with MODULE1_JWT_SECRET.
 * In development, since Module 1 (Auth) may not be running, this helper
 * generates a compatible token directly in the browser using the same secret.
 *
 * ⚠️  This file is ONLY for development/demo use.
 *      In production, tokens come from Module 1's login endpoint.
 *
 * Usage:
 *   import { getDevToken } from './services/devAuth';
 *   setAuthToken(getDevToken('freelancer'));
 */

// The JWT secret must match MODULE1_JWT_SECRET in backend/.env
// This is the dev placeholder value — update if your backend .env changes.
const DEV_JWT_SECRET = import.meta.env.VITE_DEV_JWT_SECRET || 'your-jwt-secret-from-module1';

/**
 * Simple browser-compatible JWT signer (HMAC-SHA256).
 * Does NOT require any npm package — uses the Web Crypto API.
 *
 * @param {object} payload
 * @param {string} secret
 * @returns {Promise<string>} signed JWT string
 */
async function signJwt(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };

  const encode = (obj) =>
    btoa(JSON.stringify(obj))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const headerB64  = encode(header);
  const payloadB64 = encode(payload);
  const signingInput = `${headerB64}.${payloadB64}`;

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    keyMaterial,
    new TextEncoder().encode(signingInput)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signingInput}.${signatureB64}`;
}

/**
 * Generate a dev JWT compatible with the backend's authMiddleware.
 *
 * Payload shape matches Module 1's token structure:
 *   { id, uuid, role, email, iat, exp }
 *
 * @param {'freelancer'|'client'|'admin'} role
 * @param {object} overrides - optional payload overrides
 * @returns {Promise<string>} JWT token
 */
export async function generateDevToken(role = 'freelancer', overrides = {}) {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    id: overrides.id || 'aaaaaaaa-0000-0000-0000-000000000001',
    uuid: overrides.uuid || 'aaaaaaaa-0000-0000-0000-000000000001',
    role,
    email: overrides.email || `dev-${role}@gigmarket.local`,
    iat: now,
    exp: now + 60 * 60 * 8, // 8 hours
    ...overrides,
  };

  return signJwt(payload, DEV_JWT_SECRET);
}

/**
 * Convenience: generate and return a token string (sync wrapper for use in
 * initialization — call `await` before using setAuthToken).
 */
export async function getDevToken(role = 'freelancer') {
  return generateDevToken(role);
}
