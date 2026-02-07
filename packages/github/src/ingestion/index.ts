// packages/github/src/ingestion/index.ts
// Main repository ingestion orchestrator

import { prisma } from '@lucyn/database';
import { createBatchEmbeddings, chunkText, prepareCodeForEmbedding } from '@lucyn/ai';
import {
    getRepository,
    getRepositoryTree,
    getFileContent,
    getRepositoryLanguages,
} from '../client';
import { scanRepository } from './scanner';
import { chunkFile } from './chunker';
import { analyzeRepositoryPatterns } from './analyzer';
import type { IngestionProgress, IngestionResult } from '../types';

// File extensions to skip during ingestion
const SKIP_EXTENSIONS = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp', '.bmp',
    '.mp4', '.webm', '.mov', '.avi', '.mp3', '.wav',
    '.zip', '.tar', '.gz', '.rar', '.7z',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx',
    '.woff', '.woff2', '.ttf', '.eot', '.otf',
    '.lock', '.log',
    '.min.js', '.min.css',
    '.map',
]);

// Directories to skip
const SKIP_DIRECTORIES = new Set([
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    '__pycache__',
    '.venv',
    'venv',
    'vendor',
    '.cache',
    'coverage',
    '.nyc_output',
]);

// Maximum file size to process (100KB)
const MAX_FILE_SIZE = 100 * 1024;

/**
 * Progress callback type
 */
export type ProgressCallback = (progress: IngestionProgress) => void;

/**
 * Ingest a repository - main entry point
 */
export async function ingestRepository(
    installationId: number,
    owner: string,
    repo: string,
    repositoryId: string,
    onProgress?: ProgressCallback
): Promise<IngestionResult> {
    const errors: Array<{ file: string; error: string }> = [];

    // Get repository info
    const repoInfo = await getRepository(installationId, owner, repo);

    // Report scanning phase
    onProgress?.({
        phase: 'scanning',
        totalFiles: 0,
        processedFiles: 0,
        errors: [],
    });

    // Get repository tree
    const tree = await getRepositoryTree(installationId, owner, repo, repoInfo.defaultBranch);

    // Filter to processable files
    const filesToProcess = tree.filter((item) => {
        if (item.type !== 'blob') return false;
        if (item.size && item.size > MAX_FILE_SIZE) return false;

        const ext = getFileExtension(item.path);
        if (SKIP_EXTENSIONS.has(ext)) return false;

        // Check if any directory in path should be skipped
        const pathParts = item.path.split('/');
        if (pathParts.some((part) => SKIP_DIRECTORIES.has(part))) return false;

        return true;
    });

    const totalFiles = filesToProcess.length;
    let processedFiles = 0;
    let embeddingsCreated = 0;

    // Report analyzing phase
    onProgress?.({
        phase: 'analyzing',
        totalFiles,
        processedFiles: 0,
        errors: [],
    });

    // Get language statistics
    const languageStats = await getRepositoryLanguages(installationId, owner, repo);
    const languages = Object.keys(languageStats);
    const primaryLanguages = languages.slice(0, 5);

    // Scan repository structure
    const scanResult = await scanRepository(filesToProcess, repoInfo.defaultBranch);

    // Process files in batches for embeddings
    const BATCH_SIZE = 20;
    const allChunks: Array<{
        filePath: string;
        content: string;
        contentHash: string;
        metadata: Record<string, any>;
    }> = [];

    for (let i = 0; i < filesToProcess.length; i += BATCH_SIZE) {
        const batch = filesToProcess.slice(i, i + BATCH_SIZE);

        // Fetch file contents in parallel
        const contentPromises = batch.map(async (file) => {
            try {
                onProgress?.({
                    phase: 'analyzing',
                    totalFiles,
                    processedFiles,
                    currentFile: file.path,
                    errors,
                });

                const content = await getFileContent(
                    installationId,
                    owner,
                    repo,
                    file.path,
                    repoInfo.defaultBranch
                );

                if (!content) {
                    return null;
                }

                // Chunk the file
                const chunks = chunkFile(
                    content.content,
                    file.path,
                    getLanguageFromPath(file.path)
                );

                processedFiles++;

                return chunks.map((chunk) => ({
                    filePath: file.path,
                    content: chunk.content,
                    contentHash: chunk.hash,
                    metadata: {
                        ...chunk.metadata,
                        sha: file.sha,
                    },
                }));
            } catch (error: any) {
                errors.push({
                    file: file.path,
                    error: error.message || 'Unknown error',
                });
                processedFiles++;
                return null;
            }
        });

        const batchResults = await Promise.all(contentPromises);

        for (const result of batchResults) {
            if (result) {
                allChunks.push(...result);
            }
        }

        // Rate limiting - small delay between batches
        if (i + BATCH_SIZE < filesToProcess.length) {
            await delay(100);
        }
    }

    // Report embedding phase
    onProgress?.({
        phase: 'embedding',
        totalFiles,
        processedFiles,
        errors,
    });

    // Generate embeddings for all chunks
    if (allChunks.length > 0) {
        const EMBEDDING_BATCH_SIZE = 50;

        for (let i = 0; i < allChunks.length; i += EMBEDDING_BATCH_SIZE) {
            const batch = allChunks.slice(i, i + EMBEDDING_BATCH_SIZE);

            try {
                // Prepare text for embedding
                const textsToEmbed = batch.map((chunk) =>
                    prepareCodeForEmbedding(
                        chunk.content,
                        chunk.filePath,
                        chunk.metadata.language
                    )
                );

                const embedResults = await createBatchEmbeddings(textsToEmbed);

                // Store embeddings in database
                for (let j = 0; j < batch.length; j++) {
                    const chunk = batch[j];
                    const embedding = embedResults[j]?.embedding;

                    if (embedding) {
                        await prisma.$executeRaw`
              INSERT INTO code_embeddings ("id", "repositoryId", "filePath", "content", "contentHash", "metadata", "embedding", "createdAt", "updatedAt")
              VALUES (
                ${generateCuid()},
                ${repositoryId},
                ${chunk.filePath},
                ${chunk.content},
                ${chunk.contentHash},
                ${JSON.stringify(chunk.metadata)}::jsonb,
                ${embedding}::vector,
                NOW(),
                NOW()
              )
              ON CONFLICT ("repositoryId", "filePath") 
              DO UPDATE SET 
                "content" = EXCLUDED."content",
                "contentHash" = EXCLUDED."contentHash",
                "metadata" = EXCLUDED."metadata",
                "embedding" = EXCLUDED."embedding",
                "updatedAt" = NOW()
            `;
                        embeddingsCreated++;
                    }
                }
            } catch (error: any) {
                console.error('Error generating embeddings:', error);
                errors.push({
                    file: 'embedding-batch',
                    error: error.message || 'Embedding generation failed',
                });
            }

            // Rate limiting for OpenAI API
            if (i + EMBEDDING_BATCH_SIZE < allChunks.length) {
                await delay(500);
            }
        }
    }

    // Report summarizing phase
    onProgress?.({
        phase: 'summarizing',
        totalFiles,
        processedFiles,
        errors,
    });

    // Analyze and detect patterns
    const patterns = await analyzeRepositoryPatterns(
        scanResult.directories,
        scanResult.keyFiles,
        primaryLanguages
    );

    // Create or update repository memory
    const existingMemory = await prisma.repositoryMemory.findUnique({
        where: { repositoryId },
    });

    const memoryData = {
        primaryLanguages,
        frameworks: scanResult.frameworks,
        buildTools: scanResult.buildTools,
        testingFrameworks: scanResult.testingFrameworks,
        directoryMap: scanResult.directoryMap,
        keyFiles: scanResult.keyFiles,
        entryPoints: scanResult.entryPoints,
        repoSummary: scanResult.summary,
        architectureSummary: scanResult.architectureSummary,
        treeHash: repoInfo.pushedAt,
        lastFullScanAt: new Date(),
    };

    if (existingMemory) {
        await prisma.repositoryMemory.update({
            where: { id: existingMemory.id },
            data: memoryData,
        });
    } else {
        await prisma.repositoryMemory.create({
            data: {
                repositoryId,
                ...memoryData,
            },
        });
    }

    // Store detected patterns
    for (const pattern of patterns) {
        await prisma.repositoryPattern.create({
            data: {
                memoryId: existingMemory?.id ?? repositoryId, // Will be fixed in memory creation
                type: pattern.type,
                name: pattern.name,
                description: pattern.description,
                examples: pattern.examples,
                confidence: pattern.confidence,
            },
        });
    }

    // Report complete
    onProgress?.({
        phase: 'complete',
        totalFiles,
        processedFiles,
        errors,
    });

    return {
        repositoryId,
        filesProcessed: processedFiles,
        embeddingsCreated,
        languagesDetected: primaryLanguages,
        frameworksDetected: scanResult.frameworks,
        patternsIdentified: patterns.length,
        summary: scanResult.summary || 'Repository ingested successfully',
        errors,
    };
}

/**
 * Incremental update after a push
 */
export async function updateRepositoryFromPush(
    installationId: number,
    owner: string,
    repo: string,
    repositoryId: string,
    changedFiles: Array<{ path: string; status: 'added' | 'modified' | 'removed' }>
): Promise<{ updated: number; removed: number; errors: number }> {
    let updated = 0;
    let removed = 0;
    let errorCount = 0;

    for (const file of changedFiles) {
        try {
            if (file.status === 'removed') {
                // Remove embeddings for deleted files
                await prisma.codeEmbedding.deleteMany({
                    where: {
                        repositoryId,
                        filePath: file.path,
                    },
                });
                removed++;
            } else {
                // Update or create embeddings for added/modified files
                const ext = getFileExtension(file.path);
                if (SKIP_EXTENSIONS.has(ext)) continue;

                const content = await getFileContent(installationId, owner, repo, file.path);
                if (!content || content.size > MAX_FILE_SIZE) continue;

                const chunks = chunkFile(
                    content.content,
                    file.path,
                    getLanguageFromPath(file.path)
                );

                // Just process first chunk for now (simplification)
                if (chunks.length > 0) {
                    const chunk = chunks[0];
                    const prepared = prepareCodeForEmbedding(
                        chunk.content,
                        file.path,
                        chunk.metadata.language
                    );

                    const [embedResult] = await createBatchEmbeddings([prepared]);

                    if (embedResult?.embedding) {
                        await prisma.$executeRaw`
              INSERT INTO code_embeddings ("id", "repositoryId", "filePath", "content", "contentHash", "metadata", "embedding", "createdAt", "updatedAt")
              VALUES (
                ${generateCuid()},
                ${repositoryId},
                ${file.path},
                ${chunk.content},
                ${chunk.hash},
                ${JSON.stringify(chunk.metadata)}::jsonb,
                ${embedResult.embedding}::vector,
                NOW(),
                NOW()
              )
              ON CONFLICT ("repositoryId", "filePath") 
              DO UPDATE SET 
                "content" = EXCLUDED."content",
                "contentHash" = EXCLUDED."contentHash",
                "metadata" = EXCLUDED."metadata",
                "embedding" = EXCLUDED."embedding",
                "updatedAt" = NOW()
            `;
                        updated++;
                    }
                }
            }
        } catch (error) {
            console.error(`Error processing ${file.path}:`, error);
            errorCount++;
        }
    }

    return { updated, removed, errors: errorCount };
}

// Utility functions

function getFileExtension(path: string): string {
    const lastDot = path.lastIndexOf('.');
    if (lastDot === -1) return '';

    const ext = path.slice(lastDot).toLowerCase();

    // Handle .min.js, .min.css, etc.
    if (ext === '.js' || ext === '.css') {
        if (path.endsWith('.min.js') || path.endsWith('.min.css')) {
            return '.min' + ext;
        }
    }

    return ext;
}

function getLanguageFromPath(path: string): string | undefined {
    const ext = getFileExtension(path).slice(1); // Remove leading dot

    const extToLang: Record<string, string> = {
        'ts': 'typescript',
        'tsx': 'typescript',
        'js': 'javascript',
        'jsx': 'javascript',
        'py': 'python',
        'rb': 'ruby',
        'go': 'go',
        'rs': 'rust',
        'java': 'java',
        'kt': 'kotlin',
        'swift': 'swift',
        'cs': 'csharp',
        'cpp': 'cpp',
        'c': 'c',
        'h': 'c',
        'hpp': 'cpp',
        'php': 'php',
        'vue': 'vue',
        'svelte': 'svelte',
    };

    return extToLang[ext];
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateCuid(): string {
    // Simple CUID-like generator for raw SQL
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 8);
    return `c${timestamp}${random}`;
}

export * from './scanner';
export * from './chunker';
export * from './analyzer';
