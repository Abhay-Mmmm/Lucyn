import { prisma } from '@lucyn/database';
import { analyzeCommit } from '@lucyn/ai';

export interface ProcessCommitData {
  repositoryId: string;
  commitSha: string;
  message: string;
  authorEmail: string;
  authorName: string;
  additions: number;
  deletions: number;
  filesChanged: number;
  committedAt: string;
}

export async function processCommit(data: ProcessCommitData) {
  console.log(`Processing commit ${data.commitSha.slice(0, 7)}: ${data.message.split('\n')[0]}`);

  try {
    // Check if commit already exists
    const existingCommit = await prisma.commit.findUnique({
      where: { sha: data.commitSha },
    });

    if (existingCommit) {
      console.log('Commit already processed, skipping');
      return { skipped: true };
    }

    // Find or create author
    const author = await findOrCreateAuthor(data.authorEmail, data.authorName, data.repositoryId);

    // Analyze commit with AI
    const analysis = await analyzeCommit({
      message: data.message,
      filesCount: data.filesChanged,
      additions: data.additions,
      deletions: data.deletions,
    });

    // Store commit in database
    const commit = await prisma.commit.create({
      data: {
        sha: data.commitSha,
        message: data.message,
        messageScore: analysis.messageQuality,
        additions: data.additions,
        deletions: data.deletions,
        filesChanged: data.filesChanged,
        analysis: analysis as any,
        committedAt: new Date(data.committedAt),
        repositoryId: data.repositoryId,
        authorId: author?.id,
      },
    });

    console.log(`Commit stored with score: ${analysis.messageQuality}/10`);

    // If commit needs improvement, queue feedback
    if (analysis.sentiment === 'needs_improvement' && author?.feedbackEnabled) {
      // Queue Discord feedback job
      console.log('Queuing feedback for commit improvement');
    }

    return {
      commitId: commit.id,
      analysis,
    };
  } catch (error) {
    console.error('Error processing commit:', error);
    throw error;
  }
}

async function findOrCreateAuthor(
  email: string,
  name: string,
  repositoryId: string
) {
  // First, find repository to get organization
  const repository = await prisma.repository.findUnique({
    where: { id: repositoryId },
    select: { organizationId: true },
  });

  if (!repository) {
    console.warn('Repository not found');
    return null;
  }

  // Find or create user
  let user = await prisma.user.findFirst({
    where: {
      email,
      organizationId: repository.organizationId,
    },
  });

  if (!user) {
    // Create new user
    user = await prisma.user.create({
      data: {
        email,
        name,
        organizationId: repository.organizationId,
      },
    });
    console.log(`Created new user: ${name} (${email})`);
  }

  return user;
}
