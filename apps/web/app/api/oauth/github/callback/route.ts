import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  handleOAuthCallback, 
  getGitHubVerifiedEmail,
  type OAuthProfile 
} from '@/lib/auth/oauth-handler';

// ============================================
// ENVIRONMENT VARIABLES
// ============================================

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !APP_URL) {
  throw new Error('Missing required GitHub OAuth environment variables');
}

// ============================================
// GITHUB OAUTH CALLBACK HANDLER
// ============================================

/**
 * GitHub OAuth Callback
 * 
 * This endpoint handles the OAuth callback from GitHub and:
 * 1. Validates the authorization code
 * 2. Exchanges code for access token
 * 3. Fetches user profile and email
 * 4. Calls unified OAuth handler (email-based auth)
 * 5. Creates session and redirects appropriately
 * 
 * Authentication Rules:
 * - Email is the unique identifier
 * - If email exists: log in + link GitHub provider
 * - If email doesn't exist: create user + organization
 * - Returns isNewUser flag for routing decision
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors from GitHub
  if (error) {
    console.error('GitHub OAuth error:', error);
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
  const storedState = cookieStore.get('github_oauth_state')?.value;

  if (!state || !storedState || state !== storedState) {
    console.error('OAuth state mismatch - possible CSRF attack');
    if (storedState) {
      cookieStore.delete('github_oauth_state');
    }
    return NextResponse.redirect(
      new URL('/login?error=invalid_state', APP_URL)
    );
  }

  // Clean up state cookie after validation
  cookieStore.delete('github_oauth_state');

  try {
    // ============================================
    // STEP 1: Exchange code for access token
    // ============================================
    
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('GitHub token exchange error:', tokenData.error_description);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(tokenData.error)}`, APP_URL)
      );
    }

    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('No access token received from GitHub');
      return NextResponse.redirect(
        new URL('/login?error=no_access_token', APP_URL)
      );
    }

    // ============================================
    // STEP 2: Fetch user profile from GitHub
    // ============================================
    
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch GitHub user:', userResponse.statusText);
      return NextResponse.redirect(
        new URL('/login?error=github_api_error', APP_URL)
      );
    }

    const githubUser = await userResponse.json();

    // ============================================
    // STEP 3: Get verified email (handles private emails)
    // ============================================
    
    const email = await getGitHubVerifiedEmail(accessToken, githubUser.email);

    if (!email) {
      console.error('GitHub OAuth: No verified email available');
      return NextResponse.redirect(
        new URL('/login?error=no_verified_email', APP_URL)
      );
    }

    // ============================================
    // STEP 4: Build OAuth profile
    // ============================================
    
    const profile: OAuthProfile = {
      email,
      name: githubUser.name || githubUser.login,
      avatarUrl: githubUser.avatar_url,
      providerUserId: String(githubUser.id),
      providerUsername: githubUser.login,
      accessToken,
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
    
    const result = await handleOAuthCallback('GITHUB', profile);

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
    console.error('GitHub OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent('authentication_failed')}`,
        APP_URL
      )
    );
  }
}
