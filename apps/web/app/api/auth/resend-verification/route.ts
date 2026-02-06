import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';
import { createVerificationToken } from '@/lib/verification-token';
import {
  sendEmail,
  buildVerificationEmailHtml,
  buildVerificationEmailText,
} from '@/lib/email';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ============================================
// RESEND VERIFICATION EMAIL
// ============================================

/**
 * POST /api/auth/resend-verification
 * Body: { email: string }
 *
 * Resends the verification email if the user exists in Supabase
 * but hasn't confirmed their email yet.
 *
 * Always returns 200 with a neutral message to prevent
 * email enumeration attacks.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const neutralResponse = NextResponse.json({
      success: true,
      message: 'If an unverified account exists for this email, a new verification link has been sent.',
    });

    // Check if user already exists and is verified in our DB
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // User already verified and in our DB — nothing to do
      return neutralResponse;
    }

    // Look up unverified Supabase user
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 50,
    });

    if (listError) {
      console.error('Failed to list Supabase users:', listError);
      return neutralResponse;
    }

    const supabaseUser = users?.find(
      (u) => u.email?.toLowerCase() === email && !u.email_confirmed_at
    );

    if (!supabaseUser) {
      // No unverified user found — return neutral to prevent enumeration
      return neutralResponse;
    }

    // Generate new verification token
    const tokenResult = await createVerificationToken({
      email,
      supabaseUserId: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || email.split('@')[0],
      organizationName:
        supabaseUser.user_metadata?.organization_name ||
        `${supabaseUser.user_metadata?.name || 'User'}'s Org`,
    });

    if ('error' in tokenResult) {
      return NextResponse.json(
        { error: tokenResult.error },
        { status: 429 }
      );
    }

    // Send the email
    const verificationUrl = `${APP_URL}/api/auth/verify-email?token=${encodeURIComponent(tokenResult.token)}`;

    await sendEmail({
      to: email,
      subject: 'Verify your email — Lucyn',
      html: buildVerificationEmailHtml(verificationUrl, APP_URL),
      text: buildVerificationEmailText(verificationUrl),
    });

    return neutralResponse;
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
