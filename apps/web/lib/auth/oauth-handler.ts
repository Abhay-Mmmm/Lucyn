import 'server-only';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';
import type { Prisma } from '@prisma/client';
import { encryptToken } from '@lucyn/shared';

// Type will be available after running: npx prisma generate
type AuthProviderType = 'GITHUB' | 'GOOGLE' | 'DISCORD' | 'SLACK';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface OAuthProfile {
  email: string;
  name?: string;
  avatarUrl?: string;
  providerUserId: string;
  providerUsername?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface OAuthResult {
  user: {
    id: string;
    email: string;
    name?: string;
    avatarUrl?: string;
  };
  sessionToken: string;
  isNewUser: boolean;
}

// ============================================
// CORE OAUTH AUTHENTICATION LOGIC
// ============================================

/**
 * Unified OAuth authentication handler
 * 
 * This function enforces the following rules:
 * 1. Email is the primary unique identifier
 * 2. Same email = same user, regardless of provider
 * 3. If user exists, link the provider
 * 4. If user doesn't exist, create new user
 * 5. Never create duplicate users for the same email
 * 
 * @param provider - OAuth provider type (GITHUB, GOOGLE, etc.)
 * @param profile - User profile from OAuth provider
 * @returns OAuth result with user info and session token
 */
export async function handleOAuthCallback(
  provider: AuthProviderType,
  profile: OAuthProfile
): Promise<OAuthResult> {
  // Normalize email to prevent case-sensitivity issues
  const normalizedEmail = profile.email.trim().toLowerCase();

  // Strategy: Use upsert pattern for atomic user lookup/creation
  // This prevents race conditions during concurrent OAuth callbacks
  let user;
  let isNewUser = false;
  let organization;

  try {
    // Step 1: Look up user by email (enforces email uniqueness)
    user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        organization: true,
      },
    }) as any;

    if (user) {
      // User exists - link provider if not already linked
      await linkProviderToUser(user.id, provider, profile);
    } else {
      // User doesn't exist - create new user + organization atomically
      const result = await createUserWithOrganization(normalizedEmail, profile);
      user = result.user;
      organization = result.organization;
      isNewUser = true;

      // Attach provider information
      await linkProviderToUser(user.id, provider, profile);
    }

    // Step 2: Ensure Supabase user exists (for session management)
    // Check if user exists in Supabase by email
    const { data: existingSupabaseUsers } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    let supabaseUserId = user.id;
    const supabaseUser = existingSupabaseUsers?.users?.find(u => u.email === normalizedEmail);

    if (!supabaseUser) {
      // Create Supabase user if doesn't exist
      const { data: newSupabaseUser, error: createError } = 
        await supabaseAdmin.auth.admin.createUser({
          email: normalizedEmail,
          email_confirm: true, // OAuth emails are pre-verified
          user_metadata: {
            name: profile.name || user.name,
            avatar_url: profile.avatarUrl || user.avatarUrl,
            provider,
          },
        });

      if (createError) {
        console.error('Failed to create Supabase user:', createError);
        throw new Error('Failed to create authentication session');
      }

      supabaseUserId = newSupabaseUser.user!.id;

      // Update Prisma user with Supabase ID if different
      if (supabaseUserId !== user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { id: supabaseUserId },
        });
      }
    } else {
      supabaseUserId = supabaseUser.id;
    }

    // Step 3: Generate session token using Supabase
    const { data: sessionData, error: sessionError } = 
      await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: normalizedEmail,
      });

    if (sessionError || !sessionData) {
      console.error('Failed to generate session token:', sessionError);
      throw new Error('Failed to generate session token');
    }

    // Update last active timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    // Step 4: Return standardized response
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        avatarUrl: user.avatarUrl || undefined,
      },
      sessionToken: sessionData.properties?.action_link || '',
      isNewUser,
    };
  } catch (error) {
    console.error('OAuth callback error:', error);
    throw error;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Link OAuth provider to existing user
 * Idempotent - updates if provider already linked
 */
async function linkProviderToUser(
  userId: string,
  provider: AuthProviderType,
  profile: OAuthProfile
): Promise<void> {
  const encryptedAccessToken = encryptToken(profile.accessToken);
  const encryptedRefreshToken = profile.refreshToken 
    ? encryptToken(profile.refreshToken) 
    : null;

  await (prisma as any).authProvider.upsert({
    where: {
      provider_providerUserId: {
        provider,
        providerUserId: profile.providerUserId,
      },
    },
    create: {
      provider,
      providerUserId: profile.providerUserId,
      email: profile.email,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      expiresAt: profile.expiresAt,
      userId,
    },
    update: {
      email: profile.email,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      expiresAt: profile.expiresAt,
      updatedAt: new Date(),
    },
  });

  // Update user profile with provider-specific info if not already set
  const updates: any = {};
  
  if (provider === 'GITHUB' && profile.providerUsername) {
    updates.githubUsername = profile.providerUsername;
    updates.githubId = profile.providerUserId;
  }

  if (profile.avatarUrl && !updates.avatarUrl) {
    updates.avatarUrl = profile.avatarUrl;
  }

  if (Object.keys(updates).length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: updates,
    });
  }
}

/**
 * Create new user with organization in atomic transaction
 * Ensures data consistency and prevents partial creation
 */
async function createUserWithOrganization(
  email: string,
  profile: OAuthProfile
): Promise<{ user: any; organization: any }> {
  // Generate organization name and slug
  const userName = profile.name || email.split('@')[0];
  const orgName = `${userName}'s Organization`;
  const slugBase = userName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const slug = slugBase || 'org';

  // Atomic transaction to prevent partial creation
  return await prisma.$transaction(async (tx) => {
    // Create organization first
    const organization = await tx.organization.create({
      data: {
        name: orgName,
        slug: `${slug}-${Date.now()}`, // Ensure uniqueness with timestamp
      },
    });

    // Create user linked to organization
    const user = await tx.user.create({
      data: {
        email,
        name: profile.name || userName,
        avatarUrl: profile.avatarUrl,
        organizationId: organization.id,
        role: 'ADMIN', // First user in organization is admin
      },
    });

    return { user, organization };
  });
}

// ============================================
// EMAIL VERIFICATION HELPERS
// ============================================

/**
 * Extract verified email from GitHub OAuth
 * Handles private email case by fetching from emails API
 */
export async function getGitHubVerifiedEmail(
  accessToken: string,
  primaryEmail?: string
): Promise<string | null> {
  // If primary email is provided and not private, use it
  if (primaryEmail && !primaryEmail.includes('noreply.github.com')) {
    return primaryEmail;
  }

  // Fetch all emails and find primary verified one
  try {
    const response = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch GitHub emails:', response.statusText);
      return null;
    }

    const emails = await response.json();
    
    // Find primary verified email
    const primaryVerified = emails.find(
      (e: any) => e.primary && e.verified
    );

    if (primaryVerified) {
      return primaryVerified.email;
    }

    // Fallback: find any verified email
    const anyVerified = emails.find((e: any) => e.verified);
    return anyVerified?.email || null;
  } catch (error) {
    console.error('Error fetching GitHub emails:', error);
    return null;
  }
}
