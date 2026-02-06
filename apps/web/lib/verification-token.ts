import 'server-only';
import crypto from 'crypto';
import { redis } from './redis';

// ============================================
// EMAIL VERIFICATION TOKEN MANAGEMENT
// ============================================

// Token TTL: 24 hours
const VERIFICATION_TOKEN_TTL = 60 * 60 * 24;

// Rate limit: max 3 verification emails per email per hour
const RATE_LIMIT_WINDOW = 60 * 60; // 1 hour
const RATE_LIMIT_MAX = 3;

// Redis key prefixes
const TOKEN_PREFIX = 'email_verify:token:';
const EMAIL_PREFIX = 'email_verify:email:';
const RATE_PREFIX = 'email_verify:rate:';

interface VerificationPayload {
  email: string;
  supabaseUserId: string;
  name: string;
  organizationName: string;
}

// ============================================
// TOKEN GENERATION
// ============================================

/**
 * Generate a secure verification token for email confirmation.
 * 
 * Stores the associated user data in Redis with a 24h TTL.
 * Enforces a rate limit of 3 emails per hour per email address.
 * 
 * @returns The token string, or null if rate-limited
 */
export async function createVerificationToken(
  payload: VerificationPayload
): Promise<{ token: string } | { error: string }> {
  const normalizedEmail = payload.email.trim().toLowerCase();

  // Rate limit check
  const rateKey = `${RATE_PREFIX}${normalizedEmail}`;
  const currentCount = await redis.incr(rateKey);

  if (currentCount === 1) {
    // First request in this window — set expiry
    await redis.expire(rateKey, RATE_LIMIT_WINDOW);
  }

  if (currentCount > RATE_LIMIT_MAX) {
    return { error: 'Too many verification emails. Please try again later.' };
  }

  // Generate cryptographically secure token (URL-safe)
  const token = crypto.randomBytes(32).toString('base64url');

  // Store token → payload mapping (for lookup on verification click)
  const tokenKey = `${TOKEN_PREFIX}${token}`;
  await redis.set(tokenKey, JSON.stringify({
    ...payload,
    email: normalizedEmail,
    createdAt: Date.now(),
  }), { ex: VERIFICATION_TOKEN_TTL });

  // Store email → token mapping (to invalidate previous tokens)
  const emailKey = `${EMAIL_PREFIX}${normalizedEmail}`;
  const previousToken = await redis.get<string>(emailKey);
  if (previousToken) {
    // Delete the old token so only the latest link works
    await redis.del(`${TOKEN_PREFIX}${previousToken}`);
  }
  await redis.set(emailKey, token, { ex: VERIFICATION_TOKEN_TTL });

  return { token };
}

// ============================================
// TOKEN VERIFICATION
// ============================================

/**
 * Verify and consume a verification token.
 * 
 * Returns the associated payload if the token is valid,
 * then deletes the token so it cannot be reused.
 * 
 * @returns The payload, or null if the token is invalid/expired
 */
export async function verifyEmailToken(
  token: string
): Promise<VerificationPayload | null> {
  const tokenKey = `${TOKEN_PREFIX}${token}`;
  const raw = await redis.get<string>(tokenKey);

  if (!raw) {
    return null; // Token expired or doesn't exist
  }

  let payload: VerificationPayload & { createdAt: number };
  try {
    payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    console.error('Failed to parse verification token payload');
    await redis.del(tokenKey);
    return null;
  }

  // Token is valid — consume it (single-use)
  await redis.del(tokenKey);
  await redis.del(`${EMAIL_PREFIX}${payload.email}`);

  return {
    email: payload.email,
    supabaseUserId: payload.supabaseUserId,
    name: payload.name,
    organizationName: payload.organizationName,
  };
}
