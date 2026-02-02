import { prisma } from '@lucyn/database';
import { reviewPullRequest } from '@lucyn/ai';

export interface ProcessPullRequestData {
  repositoryId: string;
  githubId: string;
  number: number;
  title: string;
  body: string | null;
  state: 'OPEN' | 'CLOSED' | 'MERGED';
  additions: number;
  deletions: number;
  filesChanged: number;
  authorEmail?: string;
  authorGithubUsername?: string;
  files?: string[];
  createdAt: string;
  mergedAt?: string;
  closedAt?: string;
}

export async function processPullRequest(data: ProcessPullRequestData) {
  console.log(`Processing PR #${data.number}: ${data.title}`);

  try {
    // Check if PR already exists
    let pullRequest = await prisma.pullRequest.findUnique({
      where: { githubId: data.githubId },
    });

    // Find author if possible
    const author = data.authorGithubUsername
      ? await prisma.user.findFirst({
          where: { githubUsername: data.authorGithubUsername },
        })
      : null;

    // Analyze PR with AI if it's new or updated
    let analysis = null;
    if (!pullRequest || pullRequest.state === 'OPEN') {
      analysis = await reviewPullRequest({
        title: data.title,
        description: data.body || '',
        files: data.files || [],
        diffSummary: `${data.additions} additions, ${data.deletions} deletions across ${data.filesChanged} files`,
        additions: data.additions,
        deletions: data.deletions,
      });
    }

    if (pullRequest) {
      // Update existing PR
      pullRequest = await prisma.pullRequest.update({
        where: { id: pullRequest.id },
        data: {
          title: data.title,
          body: data.body,
          state: data.state,
          additions: data.additions,
          deletions: data.deletions,
          filesChanged: data.filesChanged,
          qualityScore: analysis?.qualityScore,
          analysis: analysis as any,
          mergedAt: data.mergedAt ? new Date(data.mergedAt) : undefined,
          closedAt: data.closedAt ? new Date(data.closedAt) : undefined,
        },
      });
    } else {
      // Create new PR
      pullRequest = await prisma.pullRequest.create({
        data: {
          githubId: data.githubId,
          number: data.number,
          title: data.title,
          body: data.body,
          state: data.state,
          additions: data.additions,
          deletions: data.deletions,
          filesChanged: data.filesChanged,
          qualityScore: analysis?.qualityScore,
          analysis: analysis as any,
          repositoryId: data.repositoryId,
          authorId: author?.id,
          createdAt: new Date(data.createdAt),
          mergedAt: data.mergedAt ? new Date(data.mergedAt) : undefined,
          closedAt: data.closedAt ? new Date(data.closedAt) : undefined,
        },
      });
    }

    console.log(`PR processed with quality score: ${analysis?.qualityScore || 'N/A'}/10`);

    // If PR has suggestions and author has feedback enabled, queue feedback
    if (analysis?.suggestions?.length && author?.feedbackEnabled) {
      console.log('Queuing feedback for PR suggestions');
    }

    return {
      pullRequestId: pullRequest.id,
      analysis,
    };
  } catch (error) {
    console.error('Error processing pull request:', error);
    throw error;
  }
}
