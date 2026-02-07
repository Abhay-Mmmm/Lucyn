// apps/worker/src/jobs/github/ingestRepository.ts
// Full repository ingestion job

import { prisma } from '@lucyn/database';
import {
    ingestRepository as runIngestion,
    listInstallationRepositories,
    getRepository,
} from '@lucyn/github';

export interface IngestRepositoryData {
    installationId: number;
    repositoryGithubId: string;
    owner: string;
    repo: string;
    fullName: string;
    organizationId: string;
    force?: boolean; // Force re-ingestion even if already done
}

export async function ingestRepository(data: IngestRepositoryData) {
    console.log(`Starting repository ingestion: ${data.fullName}`);

    try {
        // Find or create repository record
        let repository = await prisma.repository.findUnique({
            where: { githubId: data.repositoryGithubId },
            include: { memory: true },
        });

        // Skip if already ingested and not forced
        if (repository?.memory?.lastFullScanAt && !data.force) {
            const hoursSinceLastScan =
                (Date.now() - repository.memory.lastFullScanAt.getTime()) / (1000 * 60 * 60);

            if (hoursSinceLastScan < 24) {
                console.log(`Repository ${data.fullName} was recently scanned, skipping`);
                return { skipped: true, reason: 'recently_scanned' };
            }
        }

        // Get repository info from GitHub
        const repoInfo = await getRepository(
            data.installationId,
            data.owner,
            data.repo
        );

        // Create repository if it doesn't exist
        if (!repository) {
            repository = await prisma.repository.create({
                data: {
                    githubId: data.repositoryGithubId,
                    name: repoInfo.name,
                    fullName: repoInfo.fullName,
                    description: repoInfo.description,
                    defaultBranch: repoInfo.defaultBranch,
                    language: repoInfo.language,
                    isPrivate: repoInfo.private,
                    organizationId: data.organizationId,
                },
                include: { memory: true },
            });
        }

        // Create sync log
        const syncLog = await prisma.syncLog.create({
            data: {
                entityType: 'repository_ingestion',
                entityId: repository.id,
                status: 'in_progress',
                organizationId: data.organizationId,
                metadata: {
                    fullName: data.fullName,
                    installationId: data.installationId,
                },
            },
        });

        // Run ingestion
        const result = await runIngestion(
            data.installationId,
            data.owner,
            data.repo,
            repository.id,
            (progress) => {
                console.log(
                    `[${data.fullName}] ${progress.phase}: ${progress.processedFiles}/${progress.totalFiles} files`
                );
            }
        );

        // Update sync log
        await prisma.syncLog.update({
            where: { id: syncLog.id },
            data: {
                status: result.errors.length > 0 ? 'completed_with_errors' : 'completed',
                completedAt: new Date(),
                itemsProcessed: result.filesProcessed,
                itemsFailed: result.errors.length,
                metadata: {
                    fullName: data.fullName,
                    installationId: data.installationId,
                    summary: result.summary,
                    languages: result.languagesDetected,
                    frameworks: result.frameworksDetected,
                    patterns: result.patternsIdentified,
                },
            },
        });

        console.log(`Repository ingestion completed: ${data.fullName}`);
        console.log(`  Files processed: ${result.filesProcessed}`);
        console.log(`  Embeddings created: ${result.embeddingsCreated}`);
        console.log(`  Patterns identified: ${result.patternsIdentified}`);

        return {
            repositoryId: repository.id,
            ...result,
        };
    } catch (error: any) {
        console.error(`Error ingesting repository ${data.fullName}:`, error);
        throw error;
    }
}

/**
 * Handle installation event - ingest all repositories
 */
export async function handleInstallationCreated(data: {
    installationId: number;
    accountLogin: string;
    accountId: number;
    accountType: 'User' | 'Organization';
}) {
    console.log(`New installation: ${data.accountLogin} (${data.accountType})`);

    // Find or create organization
    let organization = await prisma.organization.findFirst({
        where: { githubOrgId: String(data.accountId) },
    });

    if (!organization) {
        organization = await prisma.organization.create({
            data: {
                name: data.accountLogin,
                slug: data.accountLogin.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                githubOrgId: String(data.accountId),
                githubOrgLogin: data.accountLogin,
            },
        });
        console.log(`Created organization: ${organization.name}`);
    }

    // Get all repositories accessible to this installation
    const repositories = await listInstallationRepositories(data.installationId);
    console.log(`Found ${repositories.length} repositories to ingest`);

    // Return job data for each repository
    return {
        organizationId: organization.id,
        repositories: repositories.map((repo) => ({
            installationId: data.installationId,
            repositoryGithubId: String(repo.id),
            owner: repo.fullName.split('/')[0],
            repo: repo.name,
            fullName: repo.fullName,
        })),
    };
}
