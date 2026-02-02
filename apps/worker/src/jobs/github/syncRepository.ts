import { prisma } from '@lucyn/database';
import { Octokit } from 'octokit';

export interface SyncRepositoryData {
  repositoryId: string;
  installationId: number;
  fullName: string;
  since?: string; // ISO date string
}

export async function syncRepository(data: SyncRepositoryData) {
  console.log(`Syncing repository: ${data.fullName}`);

  try {
    const repository = await prisma.repository.findUnique({
      where: { id: data.repositoryId },
      include: { organization: true },
    });

    if (!repository) {
      throw new Error(`Repository not found: ${data.repositoryId}`);
    }

    // Create sync log
    const syncLog = await prisma.syncLog.create({
      data: {
        entityType: 'repository',
        entityId: data.repositoryId,
        status: 'in_progress',
        organizationId: repository.organizationId,
      },
    });

    // TODO: Get GitHub App token for installation
    // const octokit = new Octokit({
    //   auth: await getInstallationToken(data.installationId),
    // });

    // For now, simulate sync
    console.log('Fetching commits...');
    // const commits = await octokit.rest.repos.listCommits({
    //   owner: data.fullName.split('/')[0],
    //   repo: data.fullName.split('/')[1],
    //   since: data.since,
    //   per_page: 100,
    // });

    console.log('Fetching pull requests...');
    // const prs = await octokit.rest.pulls.list({
    //   owner: data.fullName.split('/')[0],
    //   repo: data.fullName.split('/')[1],
    //   state: 'all',
    //   per_page: 100,
    // });

    // Update sync log
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        itemsProcessed: 0, // Update with actual counts
      },
    });

    // Update repository last synced
    await prisma.repository.update({
      where: { id: data.repositoryId },
      data: { lastSyncedAt: new Date() },
    });

    console.log(`Repository sync completed: ${data.fullName}`);

    return {
      syncLogId: syncLog.id,
      commitsProcessed: 0,
      prsProcessed: 0,
    };
  } catch (error) {
    console.error('Error syncing repository:', error);
    throw error;
  }
}
