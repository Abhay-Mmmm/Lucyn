import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyEmailToken } from '@/lib/verification-token';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ============================================
// EMAIL VERIFICATION ENDPOINT
// ============================================

/**
 * GET /api/auth/verify-email?token=xxx
 *
 * Called when user clicks the link in their verification email.
 *
 * Flow:
 * 1. Validate & consume the one-time token from Redis
 * 2. Confirm the user in Supabase Auth
 * 3. Create the Organization + User in the Prisma DB
 * 4. Redirect to login with a success message
 *
 * If anything fails, the user is redirected to an error page
 * with a human-readable query param.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // ── Guard: token must be present ───────────────────────────────────
  if (!token) {
    return NextResponse.redirect(
      new URL('/login?error=missing_token', APP_URL)
    );
  }

  // ── Step 1: Verify token (single-use, expires after 24h) ──────────
  const payload = await verifyEmailToken(token);

  if (!payload) {
    return NextResponse.redirect(
      new URL('/login?error=invalid_or_expired_token', APP_URL)
    );
  }

  const { email, supabaseUserId, name, organizationName } = payload;

  try {
    // ── Step 2: Confirm the Supabase user's email ────────────────────
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      supabaseUserId,
      { email_confirm: true }
    );

    if (updateError) {
      console.error('Failed to confirm Supabase user email:', updateError);
      return NextResponse.redirect(
        new URL('/login?error=verification_failed', APP_URL)
      );
    }

    // ── Step 3: Create org + user in Prisma (idempotent) ─────────────
    // Check if user record already exists (e.g. link was clicked twice
    // before token was consumed, or a race condition).
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: supabaseUserId },
          { email },
        ],
      },
    });

    if (!existingUser) {
      const slug = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'org';

      await prisma.$transaction(async (tx) => {
        const organization = await tx.organization.create({
          data: {
            name: organizationName,
            slug: `${slug}-${Date.now()}`,
          },
        });

        await tx.user.create({
          data: {
            id: supabaseUserId,
            email,
            name,
            organizationId: organization.id,
            role: 'ADMIN',
          },
        });
      });
    }

    // ── Step 4: Redirect to login with success message ───────────────
    return NextResponse.redirect(
      new URL(
        '/login?message=' + encodeURIComponent('Email verified! You can now sign in.'),
        APP_URL
      )
    );
  } catch (error) {
    console.error('Email verification error:', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.redirect(
      new URL('/login?error=verification_failed', APP_URL)
    );
  }
}
