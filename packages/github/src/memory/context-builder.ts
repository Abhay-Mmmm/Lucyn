// packages/github/src/memory/context-builder.ts
// Build analysis context from embeddings and memory

import { prisma } from '@lucyn/database';
import { createEmbedding, cosineSimilarity } from '@lucyn/ai';

/**
 * Build context for AI analysis by finding relevant code
 */
export async function buildAnalysisContext(
    repositoryId: string,
    query?: string,
    affectedFiles: string[] = [],
    maxResults: number = 10
): Promise<Array<{
    path: string;
    content: string;
    similarity: number;
}>> {
    const results: Array<{
        path: string;
        content: string;
        similarity: number;
    }> = [];

    // If we have affected files, get their embeddings directly
    if (affectedFiles.length > 0) {
        const directMatches = await prisma.codeEmbedding.findMany({
            where: {
                repositoryId,
                filePath: {
                    in: affectedFiles,
                },
            },
            select: {
                filePath: true,
                content: true,
            },
        });

        for (const match of directMatches) {
            results.push({
                path: match.filePath,
                content: match.content,
                similarity: 1.0, // Direct match
            });
        }
    }

    // If we have a query, find semantically similar files
    if (query && results.length < maxResults) {
        const queryEmbedding = await createEmbedding(query);

        // Get all embeddings for this repository
        // Note: In production, you'd use pgvector's similarity search directly
        const allEmbeddings = await prisma.$queryRaw<Array<{
            id: string;
            filePath: string;
            content: string;
            embedding: number[];
        }>>`
      SELECT 
        id,
        "filePath",
        content,
        embedding::float[] as embedding
      FROM code_embeddings
      WHERE "repositoryId" = ${repositoryId}
      AND "filePath" NOT IN (${affectedFiles.length > 0 ? affectedFiles : ['']})
      ORDER BY embedding <=> ${queryEmbedding.embedding}::vector
      LIMIT ${maxResults - results.length}
    `;

        for (const row of allEmbeddings) {
            if (row.embedding) {
                const similarity = cosineSimilarity(queryEmbedding.embedding, row.embedding);
                results.push({
                    path: row.filePath,
                    content: row.content,
                    similarity,
                });
            }
        }
    }

    // If we still need more context, get related files based on directory
    if (results.length < maxResults && affectedFiles.length > 0) {
        const directories = [...new Set(
            affectedFiles.map(f => f.split('/').slice(0, -1).join('/'))
        )];

        if (directories.length > 0) {
            const relatedFiles = await prisma.codeEmbedding.findMany({
                where: {
                    repositoryId,
                    filePath: {
                        notIn: [...affectedFiles, ...results.map(r => r.path)],
                    },
                    OR: directories.map(dir => ({
                        filePath: {
                            startsWith: dir + '/',
                        },
                    })),
                },
                select: {
                    filePath: true,
                    content: true,
                },
                take: maxResults - results.length,
            });

            for (const file of relatedFiles) {
                results.push({
                    path: file.filePath,
                    content: file.content,
                    similarity: 0.5, // Related by directory
                });
            }
        }
    }

    // Sort by similarity and limit
    return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, maxResults);
}

/**
 * Find files related to a specific pattern
 */
export async function findFilesMatchingPattern(
    repositoryId: string,
    patternDescription: string,
    maxResults: number = 5
): Promise<string[]> {
    const embedding = await createEmbedding(patternDescription);

    const matches = await prisma.$queryRaw<Array<{ filePath: string }>>`
    SELECT "filePath"
    FROM code_embeddings
    WHERE "repositoryId" = ${repositoryId}
    ORDER BY embedding <=> ${embedding.embedding}::vector
    LIMIT ${maxResults}
  `;

    return matches.map(m => m.filePath);
}

/**
 * Get context summary for a set of files
 */
export async function getFileContextSummary(
    repositoryId: string,
    filePaths: string[]
): Promise<{
    files: Array<{
        path: string;
        language?: string;
        imports?: string[];
        exports?: string[];
    }>;
    commonImports: string[];
    directory: string | null;
}> {
    const embeddings = await prisma.codeEmbedding.findMany({
        where: {
            repositoryId,
            filePath: {
                in: filePaths,
            },
        },
        select: {
            filePath: true,
            metadata: true,
        },
    });

    const files = embeddings.map(e => {
        const metadata = e.metadata as Record<string, any> | null;
        return {
            path: e.filePath,
            language: metadata?.language,
            imports: metadata?.imports,
            exports: metadata?.exports,
        };
    });

    // Find common imports
    const allImports = files.flatMap(f => f.imports || []);
    const importCounts = new Map<string, number>();
    for (const imp of allImports) {
        importCounts.set(imp, (importCounts.get(imp) || 0) + 1);
    }
    const commonImports = [...importCounts.entries()]
        .filter(([_, count]) => count > 1)
        .map(([imp]) => imp);

    // Find common directory
    const directories = filePaths.map(f => f.split('/').slice(0, -1).join('/'));
    const commonDir = directories.length > 0
        ? findCommonPrefix(directories)
        : null;

    return {
        files,
        commonImports,
        directory: commonDir,
    };
}

/**
 * Find common prefix of paths
 */
function findCommonPrefix(paths: string[]): string | null {
    if (paths.length === 0) return null;
    if (paths.length === 1) return paths[0];

    const sorted = paths.sort();
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    let i = 0;
    while (i < first.length && first[i] === last[i]) {
        i++;
    }

    const common = first.slice(0, i);

    // Trim to last complete directory
    const lastSlash = common.lastIndexOf('/');
    return lastSlash > 0 ? common.slice(0, lastSlash) : null;
}

/**
 * Build a comprehensive context prompt for AI analysis
 */
export function buildContextPrompt(context: {
    memory: {
        primaryLanguages: string[];
        frameworks: string[];
        architectureSummary: string | null;
    } | null;
    patterns: Array<{
        type: string;
        name: string;
        description: string;
    }>;
    relevantFiles: Array<{
        path: string;
        content: string;
    }>;
    priorSuggestions: Array<{
        type: string;
        title: string;
        outcome: string;
    }>;
}): string {
    const parts: string[] = [];

    // Repository context
    if (context.memory) {
        parts.push('## Repository Context');
        parts.push(`Languages: ${context.memory.primaryLanguages.join(', ')}`);
        parts.push(`Frameworks: ${context.memory.frameworks.join(', ')}`);
        if (context.memory.architectureSummary) {
            parts.push(`Architecture: ${context.memory.architectureSummary}`);
        }
        parts.push('');
    }

    // Patterns
    if (context.patterns.length > 0) {
        parts.push('## Established Patterns');
        for (const pattern of context.patterns) {
            parts.push(`- **${pattern.name}** (${pattern.type}): ${pattern.description}`);
        }
        parts.push('');
    }

    // Prior suggestions (to avoid repeats)
    if (context.priorSuggestions.length > 0) {
        parts.push('## Prior Suggestions (avoid repeating)');
        for (const s of context.priorSuggestions) {
            parts.push(`- [${s.outcome}] ${s.title}`);
        }
        parts.push('');
    }

    // Relevant code
    if (context.relevantFiles.length > 0) {
        parts.push('## Relevant Code');
        for (const file of context.relevantFiles.slice(0, 5)) {
            parts.push(`### ${file.path}`);
            parts.push('```');
            parts.push(file.content.slice(0, 1000) + (file.content.length > 1000 ? '\n...' : ''));
            parts.push('```');
            parts.push('');
        }
    }

    return parts.join('\n');
}
