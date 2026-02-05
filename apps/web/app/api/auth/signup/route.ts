import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';
import { signUpSchema } from '@lucyn/shared';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = signUpSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.errors.map(e => e.message);
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const { email, password, name, organizationName } = result.data;

    // Create user in Supabase Auth
    const supabase = createRouteHandlerClient({ cookies });
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          organization_name: organizationName,
        },
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create organization and user in a single atomic transaction
    const slug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Create organization first
        const organization = await tx.organization.create({
          data: {
            name: organizationName,
            slug: `${slug}-${Date.now()}`, // Ensure uniqueness
          },
        });

        // Create user linked to the organization
        const user = await tx.user.create({
          data: {
            id: authData.user.id, // Use Supabase user ID
            email,
            name,
            organizationId: organization.id,
            role: 'ADMIN', // First user is admin
          },
        });

        return { organization, user };
      });

      return NextResponse.json({
        success: true,
        message: 'Account created. Please check your email to verify.',
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
      });
    } catch (dbError) {
      // Transaction failed - cleanup the Supabase user
      console.error('Database transaction failed:', dbError);
      
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        console.log('Cleaned up Supabase user after DB failure');
      } catch (cleanupError) {
        console.error('Failed to cleanup Supabase user:', cleanupError);
      }

      // Re-throw the original error to be handled by outer catch
      throw dbError;
    }
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
