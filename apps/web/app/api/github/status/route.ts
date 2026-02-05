import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { decryptToken } from '@lucyn/shared';

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get GitHub integration for this user
    const integration = await prisma.integration.findUnique({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: 'GITHUB',
        },
      },
    });

    if (!integration) {
      return NextResponse.json({
        connected: false,
        message: 'GitHub not connected',
      });
    }

    // Check if token is expired
    if (integration.expiresAt && integration.expiresAt < new Date()) {
      return NextResponse.json({
        connected: false,
        expired: true,
        message: 'GitHub token expired, please reconnect',
      });
    }

    // Return connection status with metadata (not the token!)
    const metadata = integration.metadata as any;
    return NextResponse.json({
      connected: true,
      github: {
        username: metadata?.username,
        avatarUrl: metadata?.avatarUrl,
        connectedAt: integration.createdAt,
      },
    });
  } catch (error) {
    console.error('GitHub status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Disconnect GitHub
export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the integration
    await prisma.integration.delete({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: 'GITHUB',
        },
      },
    });

    // Clear GitHub info from user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        githubId: null,
        githubUsername: null,
      },
    });

    return NextResponse.json({ success: true, message: 'GitHub disconnected' });
  } catch (error) {
    console.error('GitHub disconnect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
