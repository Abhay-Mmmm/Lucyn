import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

/**
 * Token Encryption Utility
 * 
 * Uses AES-256-GCM for authenticated encryption of sensitive tokens
 * (GitHub access tokens, Discord tokens, etc.)
 * 
 * The encryption key should be stored in environment variables:
 * TOKEN_ENCRYPTION_KEY=your-32-byte-hex-key-here
 * 
 * Generate a key with: openssl rand -hex 32
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 16; // For key derivation

// Dev fallback key (only used when TOKEN_ENCRYPTION_KEY is not set)
// WARNING: This is deterministic - use a real key in production!
const DEV_FALLBACK_KEY = 'lucyn-dev-encryption-key-do-not-use-in-production!!';

/**
 * Get the encryption key from environment
 * In development, falls back to a deterministic key (NOT SECURE for production)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (!key) {
    if (isDev) {
      // Use fallback for dev - derives a consistent key
      console.warn('⚠️  TOKEN_ENCRYPTION_KEY not set - using dev fallback (NOT SECURE)');
      const salt = Buffer.from('lucyn-dev-salt', 'utf8');
      return scryptSync(DEV_FALLBACK_KEY, salt, 32);
    }
    throw new Error(
      'TOKEN_ENCRYPTION_KEY is required in production. Generate with: openssl rand -hex 32'
    );
  }
  
  // If key is hex-encoded (64 chars = 32 bytes)
  if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    return Buffer.from(key, 'hex');
  }
  
  // If key is a passphrase, derive a key using scrypt
  const salt = Buffer.from('lucyn-token-encryption-salt', 'utf8');
  return scryptSync(key, salt, 32);
}

/**
 * Encrypt a token for secure storage
 * 
 * @param plaintext - The token to encrypt
 * @returns Base64-encoded encrypted string (IV + AuthTag + Ciphertext)
 * @throws Error if encryption fails or key is not configured
 * 
 * @example
 * const encrypted = encryptToken('ghp_xxxxxxxxxxxx');
 * // Store `encrypted` in database
 */
export function encryptToken(plaintext: string): string {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty token');
  }
  
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Combine IV + AuthTag + Ciphertext
  const combined = Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, 'hex'),
  ]);
  
  return combined.toString('base64');
}

/**
 * Decrypt a token from storage
 * 
 * @param encryptedToken - Base64-encoded encrypted string
 * @returns The original plaintext token
 * @throws Error if decryption fails (invalid key, tampered data, etc.)
 * 
 * @example
 * const token = decryptToken(encryptedFromDatabase);
 * // Use `token` for API calls
 */
export function decryptToken(encryptedToken: string): string {
  if (!encryptedToken) {
    throw new Error('Cannot decrypt empty token');
  }
  
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedToken, 'base64');
  
  // Extract IV, AuthTag, and Ciphertext
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  
  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error('Invalid encrypted token format');
  }
  
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(ciphertext.toString('hex'), 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generate a secure encryption key
 * 
 * @returns A 32-byte hex-encoded key suitable for TOKEN_ENCRYPTION_KEY
 * 
 * @example
 * const key = generateEncryptionKey();
 * console.log('Add to .env: TOKEN_ENCRYPTION_KEY=' + key);
 */
export function generateEncryptionKey(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Check if encryption is properly configured
 * 
 * @returns true if TOKEN_ENCRYPTION_KEY is set
 */
export function isEncryptionConfigured(): boolean {
  return !!process.env.TOKEN_ENCRYPTION_KEY;
}

/**
 * Safely encrypt a token, returning null if encryption is not configured
 * Useful for optional encryption scenarios
 * 
 * @param plaintext - The token to encrypt
 * @returns Encrypted token or null if not configured
 */
export function safeEncryptToken(plaintext: string): string | null {
  if (!isEncryptionConfigured()) {
    console.warn('Token encryption is not configured. Storing token unencrypted is not recommended.');
    return null;
  }
  
  try {
    return encryptToken(plaintext);
  } catch (error) {
    console.error('Failed to encrypt token:', error);
    return null;
  }
}

/**
 * Safely decrypt a token, returning null on failure
 * 
 * @param encryptedToken - The encrypted token
 * @returns Decrypted token or null on failure
 */
export function safeDecryptToken(encryptedToken: string): string | null {
  if (!encryptedToken) {
    return null;
  }
  
  try {
    return decryptToken(encryptedToken);
  } catch (error) {
    console.error('Failed to decrypt token:', error);
    return null;
  }
}
