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
                memory: true,
                pullRequests: {
                    where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
                },
                commits: {
                    where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
                },
            },
        });

        if (!repository) {
            return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
        }

        const prsMerged = repository.pullRequests.filter((pr) => pr.mergedAt).length;
        const prsOpened = repository.pullRequests.length;

        const status = repository.memory?.lastFullScanAt
            ? 'ready'
            : repository.memory
                ? 'analyzing'
                : 'pending';

        return NextResponse.json({
            id: repository.id,
            name: repository.name,
            fullName: repository.fullName,
            status,
            lastScanAt: repository.memory?.lastFullScanAt?.toISOString() || null,
            stats: {
                totalFiles: 0,
                totalLines: 0,
                primaryLanguages: repository.memory?.primaryLanguages || [],
                frameworks: repository.memory?.frameworks || [],
            },
            health: {
                score: 75,
                trend: 0,
            },
            velocity: {
                prsOpened,
                prsMerged,
                commits: repository.commits.length,
                avgReviewTime: 'N/A',
            },
        });
    } catch (error) {
        console.error('Get repo summary error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
