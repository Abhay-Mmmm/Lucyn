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

    // Get GitHub integration
    const integration = await prisma.integration.findUnique({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: 'GITHUB',
        },
      },
    });

    if (!integration) {
      return NextResponse.json(
        { error: 'GitHub not connected', connected: false },
        { status: 400 }
      );
    }

    // Decrypt the token
    const accessToken = decryptToken(integration.accessToken);

    // Fetch repos from GitHub
    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      console.error('GitHub API error:', response.status);
      return NextResponse.json(
        { error: 'Failed to fetch repos from GitHub' },
        { status: response.status }
      );
    }

    const repos = await response.json();

    // Get already connected repos from our database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: { include: { repositories: true } } },
    });

    const connectedRepoIds = new Set(
      user?.organization?.repositories?.map(r => r.githubId) || []
    );

    // Format response
    const formattedRepos = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      language: repo.language,
      isPrivate: repo.private,
      defaultBranch: repo.default_branch,
      updatedAt: repo.updated_at,
      stars: repo.stargazers_count,
      isConnected: connectedRepoIds.has(String(repo.id)),
    }));

    return NextResponse.json({
      success: true,
      repos: formattedRepos,
      total: formattedRepos.length,
    });
  } catch (error) {
    console.error('GitHub repos error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Connect a repository to Lucyn
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { repoId, repoName, fullName, description, language, isPrivate, defaultBranch } = body;

    if (!repoId || !fullName) {
      return NextResponse.json(
        { error: 'Repository ID and full name are required' },
        { status: 400 }
      );
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { error: 'User has no organization' },
        { status: 400 }
      );
    }

    // Check if repository already exists in this organization
    const existingRepo = await prisma.repository.findFirst({
      where: {
        githubId: String(repoId),
        organizationId: user.organizationId,
      },
    });

    let repository;

    if (existingRepo) {
      // Update existing repository
      repository = await prisma.repository.update({
        where: { id: existingRepo.id },
        data: {
          name: repoName,
          fullName,
          description,
          language,
          isPrivate,
          defaultBranch,
          isActive: true,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new repository for this organization
      repository = await prisma.repository.create({
        data: {
          githubId: String(repoId),
          name: repoName,
          fullName,
          description,
          language,
          isPrivate,
          defaultBranch,
          organizationId: user.organizationId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      repository: {
        id: repository.id,
        name: repository.name,
        fullName: repository.fullName,
      },
    });
  } catch (error) {
    console.error('Connect repo error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
