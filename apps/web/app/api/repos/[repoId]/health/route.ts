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
            include: {
                pullRequests: {
                    where: {
                        createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
                    },
                },
                commits: {
                    where: {
                        createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
                    },
                },
            },
        });

        if (!repository) {
            return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
        }

        const thisWeekPRs = repository.pullRequests.filter(
            (pr) => pr.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;
        const lastWeekPRs = repository.pullRequests.filter(
            (pr) =>
                pr.createdAt >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) &&
                pr.createdAt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;

        const thisWeekCommits = repository.commits.filter(
            (c) => c.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;
        const lastWeekCommits = repository.commits.filter(
            (c) =>
                c.createdAt >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) &&
                c.createdAt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;

        const velocityScore = Math.min(100, (thisWeekPRs * 10 + thisWeekCommits * 2));
        const prMergeRate = repository.pullRequests.length > 0
            ? (repository.pullRequests.filter((pr) => pr.mergedAt).length / repository.pullRequests.length) * 100
            : 50;

        const overallScore = Math.round((velocityScore * 0.4 + prMergeRate * 0.6));

        const lastWeekScore = lastWeekPRs + lastWeekCommits > 0
            ? Math.round((Math.min(100, lastWeekPRs * 10 + lastWeekCommits * 2) * 0.4 + prMergeRate * 0.6))
            : overallScore;

        const trend = overallScore - lastWeekScore;

        return NextResponse.json({
            score: overallScore || 75,
            trend: trend || 0,
            factors: [
                { name: 'Velocity', score: velocityScore, weight: 0.4 },
                { name: 'PR Merge Rate', score: Math.round(prMergeRate), weight: 0.3 },
                { name: 'Code Quality', score: 80, weight: 0.3 },
            ],
        });
    } catch (error) {
        console.error('Get health error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
