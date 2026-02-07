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

        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '20', 10);

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

        const [pullRequests, commits] = await Promise.all([
            prisma.pullRequest.findMany({
                where: { repositoryId: repository.id },
                orderBy: { createdAt: 'desc' },
                take: limit,
                include: {
                    author: {
                        select: {
                            name: true,
                            avatarUrl: true,
                            githubUsername: true,
                        },
                    },
                },
            }),
            prisma.commit.findMany({
                where: { repositoryId: repository.id },
                orderBy: { committedAt: 'desc' },
                take: limit,
                include: {
                    author: {
                        select: {
                            name: true,
                            avatarUrl: true,
                            githubUsername: true,
                        },
                    },
                },
            }),
        ]);

        const activity = [
            ...pullRequests.map((pr) => ({
                id: pr.id,
                type: pr.mergedAt ? 'pr_merged' : pr.state === 'CLOSED' ? 'pr_closed' : 'pr_opened',
                title: pr.title,
                author: {
                    name: pr.author?.name || pr.author?.githubUsername || 'Unknown',
                    avatar: pr.author?.avatarUrl || null,
                },
                timestamp: pr.createdAt.toISOString(),
                metadata: { number: pr.number },
            })),
            ...commits.map((c) => ({
                id: c.id,
                type: 'commit',
                title: c.message?.split('\n')[0] || 'No message',
                author: {
                    name: c.author?.name || c.author?.githubUsername || 'Unknown',
                    avatar: c.author?.avatarUrl || null,
                },
                timestamp: c.committedAt.toISOString(),
                metadata: { sha: c.sha.substring(0, 7) },
            })),
        ]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);

        return NextResponse.json({ activity });
    } catch (error) {
        console.error('Get activity error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
