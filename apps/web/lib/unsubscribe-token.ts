import { createHmac, timingSafeEqual } from 'crypto';

const TOKEN_SECRET = process.env.UNSUBSCRIBE_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || '';
const TOKEN_EXPIRY_HOURS = 72; // 3 days

if (!TOKEN_SECRET) {
  console.warn('UNSUBSCRIBE_TOKEN_SECRET not set, falling back to NEXTAUTH_SECRET');
}

interface UnsubscribeTokenPayload {
  email: string;
  exp: number; // expiry timestamp in milliseconds
}

/**
 * Generate a signed unsubscribe token for a given email address
 * Format: base64(email|expiry|signature)
 */
export function generateUnsubscribeToken(email: string): string {
  const normalizedEmail = email.toLowerCase().trim();
  const expiry = Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;
  
  const payload = `${normalizedEmail}|${expiry}`;
  const signature = createHmac('sha256', TOKEN_SECRET)
    .update(payload)
    .digest('hex');
  
  const token = `${payload}|${signature}`;
  return Buffer.from(token).toString('base64url');
}

/**
 * Verify and decode an unsubscribe token
 * Returns the email if valid, or throws an error if invalid/expired
 */
export function verifyUnsubscribeToken(token: string): { email: string } {
  if (!token || typeof token !== 'string') {
    throw new Error('Token is required');
  }

  let decoded: string;
  try {
    decoded = Buffer.from(token, 'base64url').toString('utf-8');
  } catch {
    throw new Error('Invalid token format');
  }

  const parts = decoded.split('|');
  if (parts.length !== 3) {
    throw new Error('Invalid token structure');
  }

  const [email, expiryStr, providedSignature] = parts;

  // Verify expiry
  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry) || Date.now() > expiry) {
    throw new Error('Token has expired');
  }

  // Verify signature using timing-safe comparison
  const payload = `${email}|${expiryStr}`;
  const expectedSignature = createHmac('sha256', TOKEN_SECRET)
    .update(payload)
    .digest('hex');

  const providedBuffer = Buffer.from(providedSignature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    throw new Error('Invalid token signature');
  }

  return { email };
}
