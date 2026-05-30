import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV for GCM
const TAG_LENGTH = 16; // 128-bit auth tag

/**
 * Returns the 32-byte encryption key from the environment variable.
 * Throws clearly if the key is missing or has wrong length.
 */
function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex) {
    throw new Error('ENCRYPTION_KEY is not set in environment variables');
  }
  const buf = Buffer.from(hex, 'hex');
  if (buf.length !== 32) {
    throw new Error(
      `ENCRYPTION_KEY must be exactly 64 hex chars (32 bytes). Got ${buf.length} bytes.`,
    );
  }
  return buf;
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a base64-encoded string: iv:authTag:ciphertext
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Store iv + authTag + ciphertext together so we can decrypt later
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString('base64');
}

/**
 * Decrypts a base64-encoded string produced by `encrypt()`.
 * Returns the original plaintext.
 * Throws if the ciphertext has been tampered with (GCM auth tag mismatch).
 */
export function decrypt(encoded: string): string {
  const key = getKey();
  const combined = Buffer.from(encoded, 'base64');

  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Returns true if a value looks like it was encrypted by this module.
 * Useful to skip double-encryption or identify already-encrypted fields.
 */
export function isEncrypted(value: string): boolean {
  try {
    const buf = Buffer.from(value, 'base64');
    return buf.length > IV_LENGTH + TAG_LENGTH;
  } catch {
    return false;
  }
}
