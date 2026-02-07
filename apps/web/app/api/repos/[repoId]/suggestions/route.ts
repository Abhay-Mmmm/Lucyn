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
        const status = url.searchParams.get('status') || 'pending';
        const limit = parseInt(url.searchParams.get('limit') || '10', 10);

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

        const whereClause: any = { repositoryId: repository.id };
        if (status !== 'all') {
            whereClause.outcome = status.toUpperCase();
        }

        const suggestions = await prisma.aISuggestion.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        const total = await prisma.aISuggestion.count({ where: whereClause });

        return NextResponse.json({
            suggestions: suggestions.map((s: typeof suggestions[0]) => ({
                id: s.id,
                type: s.type.toLowerCase(),
                title: s.title,
                explanation: s.explanation,
                whyItMatters: s.whyItMatters,
                tradeoffs: s.tradeoffs,
                suggestedChange: s.suggestedChange,
                confidence: s.confidence,
                affectedFiles: s.affectedFiles,
                promptForAgents: s.promptForAgents,
                createdAt: s.createdAt.toISOString(),
                outcome: s.outcome.toLowerCase(),
            })),
            total,
        });
    } catch (error) {
        console.error('Get suggestions error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { repoId: string } }
) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { suggestionId, outcome, feedback } = body;

        if (!suggestionId || !outcome) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await prisma.aISuggestion.update({
            where: { id: suggestionId },
            data: {
                outcome: outcome.toUpperCase(),
                userFeedback: feedback,
                resolvedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update suggestion error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
