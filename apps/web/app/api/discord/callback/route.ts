import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Discord OAuth error:', error);
    return NextResponse.redirect(
      new URL(`/dashboard/settings?error=${error}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=no_code', request.url)
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/discord/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Discord token error:', tokenData.error);
      return NextResponse.redirect(
        new URL(`/dashboard/settings?error=${tokenData.error}`, request.url)
      );
    }

    // Get the current user from Supabase
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Get Discord user info
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const discordUser = await userResponse.json();

    console.log('Discord connected for user:', session.user.email);
    console.log('Discord user:', discordUser.username);

    // TODO: Store Discord credentials in database
    // - access_token (encrypted)
    // - refresh_token
    // - discordUser.id, discordUser.username
    // - guild_id (if bot was added to a server)

    // Redirect back to settings with success message
    return NextResponse.redirect(
      new URL('/dashboard/settings?discord=connected', request.url)
    );
  } catch (error) {
    console.error('Discord callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=callback_failed', request.url)
    );
  }
}
