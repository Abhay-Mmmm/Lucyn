import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// ============================================
// ENVIRONMENT VARIABLES
// ============================================

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

if (!GITHUB_CLIENT_ID || !APP_URL) {
  throw new Error('Missing required GitHub OAuth environment variables');
}

// ============================================
// GITHUB OAUTH INITIATION
// ============================================

/**
 * GitHub OAuth Initiation
 * 
 * Redirects user to GitHub authorization page
 * Sets CSRF protection state cookie
 * 
 * URL: /api/oauth/github/authorize
 * Method: GET
 */
export async function GET() {
  // Generate CSRF protection state token
  const state = crypto.randomBytes(32).toString('hex');
  
  // Store state in secure cookie for validation in callback
  const cookieStore = cookies();
  cookieStore.set('github_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  // Build GitHub OAuth URL
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID as string,
    redirect_uri: `${APP_URL as string}/api/oauth/github/callback`,
    scope: 'user:email read:user',
    state,
  });

  const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  return NextResponse.redirect(githubAuthUrl);
}
