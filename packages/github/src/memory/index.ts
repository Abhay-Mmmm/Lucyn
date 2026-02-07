// packages/github/src/memory/index.ts
// Repository memory service for persistent context

import { prisma } from '@lucyn/database';
import { buildAnalysisContext } from './context-builder';

export interface RepositoryContext {
    memory: {
        primaryLanguages: string[];
        frameworks: string[];
        architectureSummary: string | null;
        repoSummary: string | null;
    } | null;
    patterns: Array<{
        type: string;
        name: string;
        description: string;
    }>;
    relevantFiles: Array<{
        path: string;
        content: string;
        similarity: number;
    }>;
    priorSuggestions: Array<{
        id: string;
        type: string;
        title: string;
        outcome: string;
        affectedFiles: string[];
    }>;
}

/**
 * Get repository context for analysis
 */
export async function getRepositoryContext(
    repositoryId: string,
    options: {
        query?: string;
        affectedFiles?: string[];
        maxRelevantFiles?: number;
        includePriorSuggestions?: boolean;
    } = {}
): Promise<RepositoryContext> {
    const {
        query,
        affectedFiles = [],
        maxRelevantFiles = 10,
        includePriorSuggestions = true,
    } = options;

    // Get repository memory
    const memory = await prisma.repositoryMemory.findUnique({
        where: { repositoryId },
        select: {
            primaryLanguages: true,
            frameworks: true,
            architectureSummary: true,
            repoSummary: true,
        },
    });

    // Get patterns
    const patterns = memory ? await prisma.repositoryPattern.findMany({
        where: {
            memory: { repositoryId },
        },
        select: {
            type: true,
            name: true,
            description: true,
        },
        orderBy: { confidence: 'desc' },
        take: 10,
    }) : [];

    // Get relevant files via embedding similarity
    let relevantFiles: Array<{
        path: string;
        content: string;
        similarity: number;
    }> = [];

    if (query || affectedFiles.length > 0) {
        relevantFiles = await buildAnalysisContext(
            repositoryId,
            query,
            affectedFiles,
            maxRelevantFiles
        );
    }

    // Get prior suggestions for affected files
    let priorSuggestions: Array<{
        id: string;
        type: string;
        title: string;
        outcome: string;
        affectedFiles: string[];
    }> = [];

    if (includePriorSuggestions && affectedFiles.length > 0) {
        const suggestions = await prisma.aISuggestion.findMany({
            where: {
                repositoryId,
                affectedFiles: {
                    hasSome: affectedFiles,
                },
            },
            select: {
                id: true,
                type: true,
                title: true,
                outcome: true,
                affectedFiles: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        priorSuggestions = suggestions.map((s) => ({
            id: s.id,
            type: s.type,
            title: s.title,
            outcome: s.outcome,
            affectedFiles: s.affectedFiles,
        }));
    }

    return {
        memory,
        patterns,
        relevantFiles,
        priorSuggestions,
    };
}

/**
 * Check if a suggestion is novel (not a repeat)
 */
export async function isNovelSuggestion(
    repositoryId: string,
    suggestion: {
        type: string;
        title: string;
        affectedFiles: string[];
    }
): Promise<{ isNovel: boolean; similarSuggestion?: { id: string; title: string; outcome: string } }> {
    // Find similar suggestions (same type, overlapping files)
    const similarSuggestions = await prisma.aISuggestion.findMany({
        where: {
            repositoryId,
            type: suggestion.type,
            affectedFiles: {
                hasSome: suggestion.affectedFiles,
            },
            outcome: {
                notIn: ['OUTDATED'],
            },
        },
        select: {
            id: true,
            title: true,
            outcome: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
    });

    if (similarSuggestions.length === 0) {
        return { isNovel: true };
    }

    // Check for very similar titles (simple similarity)
    const normalizedTitle = suggestion.title.toLowerCase().trim();
    for (const existing of similarSuggestions) {
        const existingNormalized = existing.title.toLowerCase().trim();

        // Simple string similarity check
        if (normalizedTitle === existingNormalized) {
            return {
                isNovel: false,
                similarSuggestion: {
                    id: existing.id,
                    title: existing.title,
                    outcome: existing.outcome,
                },
            };
        }

        // Check for high word overlap
        const newWords = new Set(normalizedTitle.split(/\s+/));
        const existingWords = new Set(existingNormalized.split(/\s+/));
        const intersection = [...newWords].filter(w => existingWords.has(w));
        const overlap = intersection.length / Math.max(newWords.size, existingWords.size);

        if (overlap > 0.7) {
            return {
                isNovel: false,
                similarSuggestion: {
                    id: existing.id,
                    title: existing.title,
                    outcome: existing.outcome,
                },
            };
        }
    }

    return { isNovel: true };
}

/**
 * Store an AI suggestion
 */
export async function storeSuggestion(
    repositoryId: string,
    pullRequestId: string | null,
    suggestion: {
        type: string;
        title: string;
        explanation: string;
        whyItMatters?: string;
        tradeoffs?: string;
        suggestedChange?: string;
        confidence: number;
        affectedFiles: string[];
        relatedPatterns?: string[];
        promptForAgents?: string;
        commentId?: string;
    }
): Promise<{ id: string }> {
    const created = await prisma.aISuggestion.create({
        data: {
            repositoryId,
            pullRequestId,
            type: suggestion.type,
            title: suggestion.title,
            explanation: suggestion.explanation,
            whyItMatters: suggestion.whyItMatters,
            tradeoffs: suggestion.tradeoffs,
            suggestedChange: suggestion.suggestedChange,
            confidence: suggestion.confidence,
            affectedFiles: suggestion.affectedFiles,
            relatedPatterns: suggestion.relatedPatterns ?? [],
            promptForAgents: suggestion.promptForAgents,
            commentId: suggestion.commentId,
            outcome: 'PENDING',
        },
        select: { id: true },
    });

    return { id: created.id };
}

/**
 * Record the outcome of a suggestion
 */
export async function recordSuggestionOutcome(
    suggestionId: string,
    outcome: 'ACCEPTED' | 'PARTIALLY_ACCEPTED' | 'IGNORED' | 'REJECTED' | 'OUTDATED',
    userFeedback?: string
): Promise<void> {
    await prisma.aISuggestion.update({
        where: { id: suggestionId },
        data: {
            outcome,
            userFeedback,
            resolvedAt: new Date(),
        },
    });
}

/**
 * Mark suggestions as outdated when files change significantly
 */
export async function markSuggestionsOutdated(
    repositoryId: string,
    changedFiles: string[]
): Promise<number> {
    const result = await prisma.aISuggestion.updateMany({
        where: {
            repositoryId,
            outcome: 'PENDING',
            affectedFiles: {
                hasSome: changedFiles,
            },
            createdAt: {
                lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Older than 7 days
            },
        },
        data: {
            outcome: 'OUTDATED',
            resolvedAt: new Date(),
        },
    });

    return result.count;
}

/**
 * Get suggestion statistics for a repository
 */
export async function getSuggestionStats(repositoryId: string): Promise<{
    total: number;
    byOutcome: Record<string, number>;
    byType: Record<string, number>;
    acceptanceRate: number;
}> {
    const suggestions = await prisma.aISuggestion.findMany({
        where: { repositoryId },
        select: {
            type: true,
            outcome: true,
        },
    });

    const byOutcome: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const s of suggestions) {
        byOutcome[s.outcome] = (byOutcome[s.outcome] || 0) + 1;
        byType[s.type] = (byType[s.type] || 0) + 1;
    }

    const accepted = (byOutcome['ACCEPTED'] || 0) + (byOutcome['PARTIALLY_ACCEPTED'] || 0);
    const resolved = suggestions.filter(s => s.outcome !== 'PENDING' && s.outcome !== 'OUTDATED').length;
    const acceptanceRate = resolved > 0 ? accepted / resolved : 0;

    return {
        total: suggestions.length,
        byOutcome,
        byType,
        acceptanceRate,
    };
}

/**
 * Update repository memory after changes
 */
export async function updateRepositoryMemory(
    repositoryId: string,
    updates: Partial<{
        primaryLanguages: string[];
        frameworks: string[];
        treeHash: string;
        lastFullScanAt: Date;
    }>
): Promise<void> {
    await prisma.repositoryMemory.update({
        where: { repositoryId },
        data: updates,
    });
}

export * from './context-builder';
