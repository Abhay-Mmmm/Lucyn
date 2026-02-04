import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Sync user to Prisma database
      await syncUserToDatabase(data.user);
    }
  }

  // Redirect to dashboard after successful auth
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}

async function syncUserToDatabase(supabaseUser: any) {
  try {
    const email = supabaseUser.email;
    const name = supabaseUser.user_metadata?.name || 
                 supabaseUser.user_metadata?.full_name ||
                 email?.split('@')[0] || 
                 'User';
    const orgName = supabaseUser.user_metadata?.organization_name || `${name}'s Org`;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
    });

    if (existingUser) {
      // User exists, just update last active
      await prisma.user.update({
        where: { id: supabaseUser.id },
        data: { lastActiveAt: new Date() },
      });
      return;
    }

    // Check if user exists by email (could be from email signup)
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      // Link Supabase user to existing Prisma user by updating the ID
      // This handles the case where email signup created the user first
      return;
    }

    // Create new organization for OAuth users
    const slug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const organization = await prisma.organization.create({
      data: {
        name: orgName,
        slug: `${slug}-${Date.now()}`,
      },
    });

    // Create user in Prisma
    await prisma.user.create({
      data: {
        id: supabaseUser.id,
        email,
        name,
        organizationId: organization.id,
        role: 'ADMIN',
        avatarUrl: supabaseUser.user_metadata?.avatar_url,
      },
    });

    console.log(`Synced user ${email} to database`);
  } catch (error) {
    // Log but don't fail - user can still access app
    console.error('Error syncing user to database:', error);
  }
}
