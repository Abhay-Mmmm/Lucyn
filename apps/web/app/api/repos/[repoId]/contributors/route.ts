import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { repoId: string } }
) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { organizationId: true },
        });

        if (!user?.organizationId) {
            return NextResponse.json({ error: 'No organization' }, { status: 400 });
        }

        const repository = await prisma.repository.findFirst({
            where: {
                id: params.repoId,
                organizationId: user.organizationId,
            },
        });

        if (!repository) {
            return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
        }

        // Get contributors via commit authors
        const commits = await prisma.commit.findMany({
            where: {
                repositoryId: repository.id,
                authorId: { not: null },
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                        githubUsername: true,
                    },
                },
            },
        });

        // Get PR counts per author
        const pullRequests = await prisma.pullRequest.findMany({
            where: {
                repositoryId: repository.id,
                authorId: { not: null },
            },
            select: {
                authorId: true,
            },
        });

        // Aggregate by author
        const authorMap = new Map<string, {
            id: string;
            name: string;
            email: string;
            avatar: string | null;
            commits: number;
            prsOpened: number;
        }>();

        commits.forEach((commit) => {
            if (!commit.author) return;
            const existing = authorMap.get(commit.author.id);
            if (existing) {
                existing.commits++;
            } else {
                authorMap.set(commit.author.id, {
                    id: commit.author.id,
                    name: commit.author.name || commit.author.githubUsername || 'Unknown',
                    email: commit.author.email,
                    avatar: commit.author.avatarUrl,
                    commits: 1,
                    prsOpened: 0,
                });
            }
        });

        pullRequests.forEach((pr) => {
            if (!pr.authorId) return;
            const existing = authorMap.get(pr.authorId);
            if (existing) {
                existing.prsOpened++;
            }
        });

        const contributors = Array.from(authorMap.values())
            .sort((a, b) => b.commits - a.commits)
            .slice(0, 10);

        return NextResponse.json({ contributors });
    } catch (error) {
        console.error('Get contributors error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
