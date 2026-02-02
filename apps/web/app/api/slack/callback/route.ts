import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID || '';
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET || '';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Slack OAuth error:', error);
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
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/slack/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.ok) {
      console.error('Slack token error:', tokenData.error);
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

    // Extract Slack data
    const {
      access_token,
      team,
      bot_user_id,
      authed_user,
    } = tokenData;

    console.log('Slack connected for user:', session.user.email);
    console.log('Slack team:', team.name);
    console.log('Bot user ID:', bot_user_id);

    // TODO: Store Slack credentials in database
    // - access_token (encrypted)
    // - team.id, team.name
    // - bot_user_id
    // - authed_user.id

    // Redirect back to settings with success message
    return NextResponse.redirect(
      new URL('/dashboard/settings?slack=connected', request.url)
    );
  } catch (error) {
    console.error('Slack callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=callback_failed', request.url)
    );
  }
}
