import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  handleOAuthCallback,
  type OAuthProfile 
} from '@/lib/auth/oauth-handler';

// ============================================
// ENVIRONMENT VARIABLES
// ============================================

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

if (!SLACK_CLIENT_ID || !SLACK_CLIENT_SECRET || !APP_URL) {
  throw new Error('Missing required Slack OAuth environment variables');
}

// ============================================
// SLACK OAUTH CALLBACK HANDLER
// ============================================

/**
 * Slack OAuth Callback
 * 
 * This endpoint handles the OAuth callback from Slack and:
 * 1. Validates the authorization code
 * 2. Exchanges code for access token
 * 3. Fetches user profile and email
 * 4. Calls unified OAuth handler (email-based auth)
 * 5. Creates session and redirects appropriately
 * 
 * Authentication Rules:
 * - Email is the unique identifier
 * - If email exists: log in + link Slack provider
 * - If email doesn't exist: create user + organization
 * - Returns isNewUser flag for routing decision
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors from Slack
  if (error) {
    console.error('Slack OAuth error:', error);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, APP_URL)
    );
  }

  // Validate authorization code
  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=missing_code', APP_URL)
    );
  }

  // CSRF Protection: Validate state parameter
  const cookieStore = cookies();
  const storedState = cookieStore.get('slack_oauth_state')?.value;

  if (!state || !storedState || state !== storedState) {
    console.error('OAuth state mismatch - possible CSRF attack');
    if (storedState) {
      cookieStore.delete('slack_oauth_state');
    }
    return NextResponse.redirect(
      new URL('/login?error=invalid_state', APP_URL)
    );
  }

  // Clean up state cookie after validation
  cookieStore.delete('slack_oauth_state');

  try {
    // ============================================
    // STEP 1: Exchange code for access token
    // ============================================
    
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SLACK_CLIENT_ID!,
        client_secret: SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: `${APP_URL}/api/oauth/slack/callback`,
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.ok) {
      console.error('Slack token exchange error:', tokenData.error);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(tokenData.error)}`, APP_URL)
      );
    }

    const accessToken = tokenData.authed_user?.access_token;

    if (!accessToken) {
      console.error('No access token received from Slack');
      return NextResponse.redirect(
        new URL('/login?error=no_access_token', APP_URL)
      );
    }

    // ============================================
    // STEP 2: Fetch user profile from Slack
    // ============================================
    
    const userResponse = await fetch('https://slack.com/api/users.identity', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userData = await userResponse.json();

    if (!userData.ok) {
      console.error('Failed to fetch Slack user:', userData.error);
      return NextResponse.redirect(
        new URL('/login?error=slack_api_error', APP_URL)
      );
    }

    // ============================================
    // STEP 3: Extract verified email
    // ============================================
    
    const email = userData.user?.email;

    if (!email) {
      console.error('Slack OAuth: No email available');
      return NextResponse.redirect(
        new URL('/login?error=no_email', APP_URL)
      );
    }

    // ============================================
    // STEP 4: Build OAuth profile
    // ============================================
    
    const profile: OAuthProfile = {
      email,
      name: userData.user?.name || userData.user?.real_name,
      avatarUrl: userData.user?.image_512 || userData.user?.image_192,
      providerUserId: userData.user?.id,
      accessToken,
      // Note: Slack doesn't provide refresh tokens in user OAuth flow
      refreshToken: tokenData.refresh_token,
      expiresAt: tokenData.expires_in 
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : undefined,
    };

    // ============================================
    // STEP 5: Call unified OAuth handler
    // This enforces email uniqueness and handles
    // user creation or provider linking
    // ============================================
    
    const result = await handleOAuthCallback('SLACK', profile);

    // ============================================
    // STEP 6: Create session cookie
    // ============================================
    
    const response = NextResponse.redirect(
      new URL(
        result.isNewUser ? '/onboarding' : '/dashboard',
        APP_URL
      )
    );

    // Set secure session cookie
    response.cookies.set('session_token', result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Slack OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent('authentication_failed')}`,
        APP_URL
      )
    );
  }
}
