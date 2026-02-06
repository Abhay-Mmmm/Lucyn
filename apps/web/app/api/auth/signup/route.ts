import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { supabaseAdmin } from '@/lib/supabase';
import { signUpSchema } from '@lucyn/shared';
import { createVerificationToken } from '@/lib/verification-token';
import {
  sendEmail,
  buildVerificationEmailHtml,
  buildVerificationEmailText,
} from '@/lib/email';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = signUpSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.errors.map(e => e.message);
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const { email, password, name, organizationName } = result.data;
    const normalizedEmail = email.trim().toLowerCase();

    // ── Check if email already exists in our DB ──────────────────────
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // Don't reveal that account exists — same success response
      // The user should use the login page instead.
      return NextResponse.json({
        success: true,
        message: 'If this email is not yet registered, you will receive a verification link shortly.',
      });
    }

    // ── Create user in Supabase Auth (via admin API) ─────────────────
    // Use the admin client so the user is reliably created in auth.users.
    // email_confirm: false — we confirm manually after token verification.
    let { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: false,
      user_metadata: {
        name,
        organization_name: organizationName,
      },
    });

    // If the user already exists in Supabase (stale from a previous
    // failed attempt) but NOT in our DB, delete and recreate.
    if (authError && authError.message?.toLowerCase().includes('already been registered')) {
      const { data: existingList } = await supabaseAdmin.auth.admin.listUsers();
      const staleUser = existingList?.users?.find(
        (u) => u.email?.toLowerCase() === normalizedEmail
      );
      if (staleUser) {
        await supabaseAdmin.auth.admin.deleteUser(staleUser.id);
        // Retry creation
        const retry = await supabaseAdmin.auth.admin.createUser({
          email: normalizedEmail,
          password,
          email_confirm: false,
          user_metadata: { name, organization_name: organizationName },
        });
        authData = retry.data;
        authError = retry.error;
      }
    }

    if (authError) {
      console.error('Supabase createUser error:', authError.message);
      return NextResponse.json({
        success: true,
        message: 'If this email is not yet registered, you will receive a verification link shortly.',
      });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // ── Generate verification token (stored in Redis) ────────────────
    const tokenResult = await createVerificationToken({
      email: normalizedEmail,
      supabaseUserId: authData.user.id,
      name,
      organizationName,
    });

    if ('error' in tokenResult) {
      // Rate-limited
      return NextResponse.json(
        { error: tokenResult.error },
        { status: 429 }
      );
    }

    // ── Send verification email via Resend ───────────────────────────
    const verificationUrl = `${APP_URL}/api/auth/verify-email?token=${encodeURIComponent(tokenResult.token)}`;

    // In development, skip sending and log the link to the console
    if (process.env.NODE_ENV === 'development') {
      console.log('\n========================================');
      console.log('📧 VERIFICATION EMAIL (dev bypass)');
      console.log(`   To: ${normalizedEmail}`);
      console.log(`   URL: ${verificationUrl}`);
      console.log('========================================\n');

      return NextResponse.json({
        success: true,
        message: 'Verification email sent. Please check your inbox.',
        // Expose the link in dev so it shows in the browser console too
        ...(process.env.NODE_ENV === 'development' && { verificationUrl }),
      });
    }

    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: 'Verify your email — Lucyn',
      html: buildVerificationEmailHtml(verificationUrl, APP_URL),
      text: buildVerificationEmailText(verificationUrl),
    });

    if (!emailResult.success) {
      console.error('Verification email failed:', emailResult.error);
      // Clean up Supabase user since they can't verify
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupErr) {
        console.error('Failed to clean up Supabase user:', cleanupErr);
      }
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    });
  } catch (error) {
    console.error('Signup error:', error);

    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
