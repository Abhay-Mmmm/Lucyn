import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                organization: {
                    include: {
                        repositories: {
                            where: { isActive: true },
                            include: {
                                memory: true,
                            },
                            orderBy: { updatedAt: 'desc' },
                        },
                    },
                },
            },
        });

        if (!user?.organization) {
            return NextResponse.json({ repos: [] });
        }

        const repos = user.organization.repositories.map((repo) => ({
            id: repo.id,
            githubId: repo.githubId,
            name: repo.name,
            fullName: repo.fullName,
            description: repo.description,
            language: repo.language,
            isPrivate: repo.isPrivate,
            defaultBranch: repo.defaultBranch,
            updatedAt: repo.updatedAt.toISOString(),
            status: repo.memory?.lastFullScanAt
                ? 'ready'
                : repo.memory
                    ? 'analyzing'
                    : 'pending',
        }));

        return NextResponse.json({ repos });
    } catch (error) {
        console.error('Get repos error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
