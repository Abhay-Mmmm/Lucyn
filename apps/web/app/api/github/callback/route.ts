import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { encryptToken } from '@lucyn/shared';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const installationId = searchParams.get('installation_id');
  const setupAction = searchParams.get('setup_action');

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard?error=no_code', request.url));
  }

  try {
    // Get the current user from Supabase first
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Exchange code for access token
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
      console.error('GitHub OAuth error:', tokenData.error_description);
      return NextResponse.redirect(
        new URL(`/dashboard?error=${tokenData.error}`, request.url)
      );
    }

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const githubUser = await userResponse.json();

    // Encrypt the access token before storing
    const encryptedToken = encryptToken(tokenData.access_token);

    // Store or update the GitHub integration
    await prisma.integration.upsert({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: 'GITHUB',
        },
      },
      update: {
        accessToken: encryptedToken,
        refreshToken: tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : null,
        expiresAt: tokenData.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000) 
          : null,
        scopes: (tokenData.scope || 'repo,user').split(','),
        metadata: {
          githubId: githubUser.id,
          username: githubUser.login,
          avatarUrl: githubUser.avatar_url,
          installationId: installationId || null,
        },
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        provider: 'GITHUB',
        accessToken: encryptedToken,
        refreshToken: tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : null,
        expiresAt: tokenData.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000) 
          : null,
        scopes: (tokenData.scope || 'repo,user').split(','),
        metadata: {
          githubId: githubUser.id,
          username: githubUser.login,
          avatarUrl: githubUser.avatar_url,
          installationId: installationId || null,
        },
      },
    });

    // Also update the user's GitHub info
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        githubId: String(githubUser.id),
        githubUsername: githubUser.login,
        avatarUrl: githubUser.avatar_url,
      },
    });

    console.log(`GitHub connected for user: ${session.user.email} (${githubUser.login})`);

    // Redirect back to dashboard with success message
    return NextResponse.redirect(
      new URL('/dashboard?github=connected', request.url)
    );
  } catch (error) {
    console.error('GitHub callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=callback_failed', request.url)
    );
  }
}
