import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// ============================================
// ENVIRONMENT VARIABLES
// ============================================

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

if (!SLACK_CLIENT_ID || !APP_URL) {
  throw new Error('Missing required Slack OAuth environment variables');
}

// ============================================
// SLACK OAUTH INITIATION
// ============================================

/**
 * Slack OAuth Initiation
 * 
 * Redirects user to Slack authorization page
 * Sets CSRF protection state cookie
 * 
 * URL: /api/oauth/slack/authorize
 * Method: GET
 */
export async function GET() {
  // Generate CSRF protection state token
  const state = crypto.randomBytes(32).toString('hex');
  
  // Store state in secure cookie for validation in callback
  const cookieStore = cookies();
  cookieStore.set('slack_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  // Build Slack OAuth URL
  // Note: Using user_scope for Sign in with Slack
  const params = new URLSearchParams({
    client_id: SLACK_CLIENT_ID as string,
    redirect_uri: `${APP_URL as string}/api/oauth/slack/callback`,
    scope: '',
    user_scope: 'identity.basic,identity.email,identity.avatar',
    state,
  });

  const slackAuthUrl = `https://slack.com/oauth/v2/authorize?${params.toString()}`;

  return NextResponse.redirect(slackAuthUrl);
}
