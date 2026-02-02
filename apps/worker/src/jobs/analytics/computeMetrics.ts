import { prisma } from '@lucyn/database';
import { calculateGiniCoefficient } from '@lucyn/shared';

export interface ComputeMetricsData {
  organizationId: string;
  startDate?: string;
  endDate?: string;
}

export async function computeMetrics(data: ComputeMetricsData) {
  console.log(`Computing metrics for organization: ${data.organizationId}`);

  try {
    const endDate = data.endDate ? new Date(data.endDate) : new Date();
    const startDate = data.startDate
      ? new Date(data.startDate)
      : new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

    // Get all users in the organization
    const users = await prisma.user.findMany({
      where: { organizationId: data.organizationId },
      include: {
        commits: {
          where: {
            committedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        pullRequests: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        reviewedPRs: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        profile: true,
      },
    });

    // Compute metrics for each user
    for (const user of users) {
      const commitsCount = user.commits.length;
      const prsCount = user.pullRequests.length;
      const reviewsCount = user.reviewedPRs.length;

      // Calculate workload (simple heuristic)
      const avgWorkload = (commitsCount + prsCount * 3 + reviewsCount) / 10;
      const workloadPercentage = Math.min(100, Math.round(avgWorkload * 10));

      // Determine burnout risk
      let burnoutRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      if (workloadPercentage > 80) burnoutRisk = 'HIGH';
      else if (workloadPercentage > 60) burnoutRisk = 'MEDIUM';

      // Calculate average commit quality
      const avgCommitQuality =
        user.commits.length > 0
          ? user.commits.reduce((sum, c) => sum + (c.messageScore || 0), 0) / user.commits.length
          : null;

      // Calculate average PR quality
      const avgPRQuality =
        user.pullRequests.length > 0
          ? user.pullRequests.reduce((sum, pr) => sum + (pr.qualityScore || 0), 0) / user.pullRequests.length
          : null;

      // Update or create developer profile
      await prisma.developerProfile.upsert({
        where: { userId: user.id },
        update: {
          currentWorkload: workloadPercentage,
          burnoutRisk,
          codeQualityScore: avgCommitQuality || avgPRQuality,
          lastAnalyzedAt: new Date(),
        },
        create: {
          userId: user.id,
          currentWorkload: workloadPercentage,
          burnoutRisk,
          codeQualityScore: avgCommitQuality || avgPRQuality,
          lastAnalyzedAt: new Date(),
        },
      });

      console.log(`Updated profile for ${user.name}: workload=${workloadPercentage}%, risk=${burnoutRisk}`);
    }

    // Calculate team-level metrics
    const workloads = users.map((u) => u.profile?.currentWorkload || 0);
    const gini = calculateGiniCoefficient(workloads);

    console.log(`Team workload Gini coefficient: ${gini.toFixed(2)}`);

    return {
      usersProcessed: users.length,
      giniCoefficient: gini,
    };
  } catch (error) {
    console.error('Error computing metrics:', error);
    throw error;
  }
}
