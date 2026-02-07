// apps/worker/src/jobs/github/analyzePullRequest.ts
// Context-aware PR analysis with memory integration

import { prisma } from '@lucyn/database';
import {
    createInstallationOctokit,
    getPullRequestFiles,
    getFileContent,
    createPRComment,
} from '@lucyn/github';
import {
    getRepositoryContext,
    isNovelSuggestion,
    storeSuggestion,
    buildContextPrompt,
} from '@lucyn/github';
import { analyzeCodeWithContext } from '@lucyn/ai';

export interface AnalyzePullRequestData {
    repositoryId: string;
    organizationId: string;
    installationId: number;
    owner: string;
    repo: string;
    action: string;
    pullRequest: {
        githubId: string;
        number: number;
        title: string;
        body: string | null;
        state: string;
        isDraft: boolean;
        baseBranch: string;
        headBranch: string;
        baseRef: string;
        headRef: string;
        additions: number;
        deletions: number;
        changedFiles: number;
        author: {
            login: string;
            id: number;
        };
    };
}

export async function analyzePullRequest(data: AnalyzePullRequestData) {
    const { pullRequest, installationId, owner, repo, repositoryId } = data;

    console.log(`Analyzing PR #${pullRequest.number}: ${pullRequest.title}`);

    try {
        // Get or create PR record
        let prRecord = await prisma.pullRequest.findUnique({
            where: { githubId: pullRequest.githubId },
        });

        if (!prRecord) {
            // Find author
            const author = await prisma.user.findFirst({
                where: { githubId: String(pullRequest.author.id) },
            });

            prRecord = await prisma.pullRequest.create({
                data: {
                    githubId: pullRequest.githubId,
                    number: pullRequest.number,
                    title: pullRequest.title,
                    body: pullRequest.body,
                    state: pullRequest.state.toUpperCase() as 'OPEN' | 'CLOSED' | 'MERGED',
                    isDraft: pullRequest.isDraft,
                    additions: pullRequest.additions,
                    deletions: pullRequest.deletions,
                    filesChanged: pullRequest.changedFiles,
                    repositoryId,
                    authorId: author?.id,
                },
            });
        }

        // Get PR files
        const files = await getPullRequestFiles(
            installationId,
            owner,
            repo,
            pullRequest.number
        );

        if (files.length === 0) {
            console.log('No files in PR, skipping analysis');
            return { analyzed: false, reason: 'no_files' };
        }

        const changedFilePaths = files.map((f) => f.filename);
        console.log(`PR has ${files.length} changed files`);

        // Get repository context
        const context = await getRepositoryContext(repositoryId, {
            query: `${pullRequest.title} ${pullRequest.body || ''}`,
            affectedFiles: changedFilePaths,
            maxRelevantFiles: 15,
            includePriorSuggestions: true,
        });

        // Build context prompt
        const contextPrompt = buildContextPrompt({
            memory: context.memory,
            patterns: context.patterns,
            relevantFiles: context.relevantFiles.slice(0, 5),
            priorSuggestions: context.priorSuggestions.slice(0, 10),
        });

        // Get file contents
        const fileContents: Array<{
            filename: string;
            status: string;
            additions: number;
            deletions: number;
            patch?: string;
        }> = [];

        for (const file of files.slice(0, 20)) { // Limit files analyzed
            fileContents.push({
                filename: file.filename,
                status: file.status,
                additions: file.additions,
                deletions: file.deletions,
                patch: file.patch?.slice(0, 2000), // Truncate large patches
            });
        }

        // Run AI analysis
        const analysis = await analyzeCodeWithContext({
            type: 'pull_request',
            title: pullRequest.title,
            description: pullRequest.body || '',
            files: fileContents,
            repositoryContext: contextPrompt,
            patterns: context.patterns.map((p) => p.name),
        });

        // Process suggestions
        const validSuggestions: any[] = [];

        for (const suggestion of analysis.suggestions || []) {
            // Check if suggestion is novel
            const { isNovel, similarSuggestion } = await isNovelSuggestion(
                repositoryId,
                {
                    type: suggestion.type,
                    title: suggestion.title,
                    affectedFiles: suggestion.affectedFiles || changedFilePaths.slice(0, 5),
                }
            );

            if (!isNovel) {
                console.log(`Skipping duplicate suggestion: ${suggestion.title}`);
                continue;
            }

            // Skip low-confidence suggestions
            if (suggestion.confidence < 0.5) {
                console.log(`Skipping low-confidence suggestion: ${suggestion.title}`);
                continue;
            }

            validSuggestions.push(suggestion);
        }

        console.log(`Generated ${validSuggestions.length} valid suggestions`);

        // Build and post PR comment if we have suggestions
        if (validSuggestions.length > 0) {
            const comment = buildPRComment(validSuggestions, analysis.summary);

            // Post comment
            const commentResult = await createPRComment(
                installationId,
                owner,
                repo,
                pullRequest.number,
                comment
            );

            // Store suggestions
            for (const suggestion of validSuggestions) {
                await storeSuggestion(repositoryId, prRecord.id, {
                    type: suggestion.type,
                    title: suggestion.title,
                    explanation: suggestion.explanation,
                    whyItMatters: suggestion.whyItMatters,
                    tradeoffs: suggestion.tradeoffs,
                    suggestedChange: suggestion.suggestedChange,
                    confidence: suggestion.confidence,
                    affectedFiles: suggestion.affectedFiles || [],
                    relatedPatterns: suggestion.relatedPatterns || [],
                    promptForAgents: suggestion.promptForAgents,
                    commentId: String(commentResult.id),
                });
            }
        }

        // Update PR record
        await prisma.pullRequest.update({
            where: { id: prRecord.id },
            data: {
                analysis: analysis as any,
                qualityScore: analysis.overallScore,
            },
        });

        return {
            analyzed: true,
            suggestionsCount: validSuggestions.length,
            overallScore: analysis.overallScore,
        };

    } catch (error: any) {
        console.error(`Error analyzing PR #${pullRequest.number}:`, error);
        throw error;
    }
}

function buildPRComment(
    suggestions: any[],
    summary: string
): string {
    const lines: string[] = [];

    lines.push('## 🔍 Lucyn Analysis');
    lines.push('');

    if (summary) {
        lines.push(summary);
        lines.push('');
    }

    if (suggestions.length > 0) {
        lines.push('### Suggestions');
        lines.push('');

        for (const suggestion of suggestions) {
            const emoji = getSuggestionEmoji(suggestion.type);
            lines.push(`#### ${emoji} ${suggestion.title}`);
            lines.push('');
            lines.push(suggestion.explanation);

            if (suggestion.whyItMatters) {
                lines.push('');
                lines.push(`**Why it matters:** ${suggestion.whyItMatters}`);
            }

            if (suggestion.suggestedChange) {
                lines.push('');
                lines.push('```suggestion');
                lines.push(suggestion.suggestedChange);
                lines.push('```');
            }

            if (suggestion.tradeoffs) {
                lines.push('');
                lines.push(`<details><summary>Tradeoffs to consider</summary>`);
                lines.push('');
                lines.push(suggestion.tradeoffs);
                lines.push('</details>');
            }

            lines.push('');
        }

        lines.push('---');
        lines.push('');
        lines.push('*Powered by [Lucyn](https://lucyn.dev) - Your AI Product Engineer*');
    }

    return lines.join('\n');
}

function getSuggestionEmoji(type: string): string {
    const emojis: Record<string, string> = {
        architecture: '🏗️',
        performance: '⚡',
        security: '🔒',
        style: '✨',
        refactor: '♻️',
        testing: '🧪',
        documentation: '📝',
        bug: '🐛',
    };
    return emojis[type] || '💡';
}
