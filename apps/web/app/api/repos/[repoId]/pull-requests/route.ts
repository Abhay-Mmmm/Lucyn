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
        const state = url.searchParams.get('state') || 'all';
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

        const whereClause: Record<string, unknown> = { repositoryId: repository.id };
        if (state !== 'all') {
            whereClause.state = state.toUpperCase();
        }

        const pullRequests = await prisma.pullRequest.findMany({
            where: whereClause,
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
                reviewers: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                _count: { select: { aiSuggestions: true } },
            },
        });

        const total = await prisma.pullRequest.count({ where: whereClause });

        return NextResponse.json({
            pullRequests: pullRequests.map((pr) => ({
                id: pr.id,
                number: pr.number,
                title: pr.title,
                state: pr.mergedAt ? 'merged' : pr.state.toLowerCase(),
                author: {
                    name: pr.author?.name || pr.author?.githubUsername || 'Unknown',
                    avatar: pr.author?.avatarUrl || null,
                },
                createdAt: pr.createdAt.toISOString(),
                updatedAt: pr.updatedAt.toISOString(),
                reviewers: pr.reviewers.map((r) => ({
                    id: r.id,
                    name: r.name || 'Unknown',
                    avatar: r.avatarUrl,
                })),
                suggestionsCount: pr._count.aiSuggestions,
            })),
            total,
        });
    } catch (error) {
        console.error('Get pull requests error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
