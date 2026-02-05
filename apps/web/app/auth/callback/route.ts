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
    
    // Guard: Verify email exists and is a non-empty string
    if (!email || typeof email !== 'string' || email.trim() === '') {
      console.error('Cannot sync user to database: email is missing or invalid', {
        userId: supabaseUser.id,
        hasEmail: !!supabaseUser.email,
      });
      return; // Skip DB sync - user can still access app with Supabase auth
    }

    const name = supabaseUser.user_metadata?.name || 
                 supabaseUser.user_metadata?.full_name ||
                 email.split('@')[0] || 
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
      // Link Supabase user to existing Prisma user
      if (existingByEmail.id === supabaseUser.id) {
        // IDs match - just update activity timestamp
        await prisma.user.update({
          where: { id: existingByEmail.id },
          data: { lastActiveAt: new Date() },
        });
      } else {
        // IDs don't match - this indicates the user was created before Supabase integration
        // or there's a data inconsistency. For safety, we can't update the primary key
        // as it would break foreign key relationships. Log and skip.
        console.error('User ID mismatch during OAuth sync:', {
          email,
          existingId: existingByEmail.id,
          supabaseId: supabaseUser.id,
        });
        // Note: In production, you may want to implement a migration strategy
        // or manual resolution for these cases
      }
      return;
    }

    // Create new organization for OAuth users
    const slug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Wrap organization and user creation in a transaction for atomicity
    await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: orgName,
          slug: `${slug}-${Date.now()}`,
        },
      });

      // Create user linked to the organization
      await tx.user.create({
        data: {
          id: supabaseUser.id,
          email,
          name,
          organizationId: organization.id,
          role: 'ADMIN',
          avatarUrl: supabaseUser.user_metadata?.avatar_url,
        },
      });
    });

    console.log('Synced user to database', { userId: supabaseUser.id });
  } catch (error) {
    // Log but don't fail - user can still access app
    // Avoid logging error object directly as it may contain PII
    console.error('Error syncing user to database', {
      userId: supabaseUser?.id,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
