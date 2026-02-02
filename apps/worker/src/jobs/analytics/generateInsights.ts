import { prisma } from '@lucyn/database';
import { generateInsights as generateAIInsights } from '@lucyn/ai';

export interface GenerateInsightsData {
  organizationId: string;
}

export async function generateInsights(data: GenerateInsightsData) {
  console.log(`Generating insights for organization: ${data.organizationId}`);

  try {
    // Get team data
    const users = await prisma.user.findMany({
      where: { organizationId: data.organizationId },
      include: {
        profile: true,
        commits: {
          where: {
            committedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        pullRequests: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
      },
    });

    const weeklyCommits = users.reduce((sum, u) => sum + u.commits.length, 0);
    const weeklyPRs = users.reduce((sum, u) => sum + u.pullRequests.length, 0);

    // Calculate workload distribution
    const workloadDistribution = users.map((u) => ({
      name: u.name || u.email,
      percentage: u.profile?.currentWorkload || 0,
    }));

    // Get previous week data for trends
    const prevWeekCommits = await prisma.commit.count({
      where: {
        repository: { organizationId: data.organizationId },
        committedAt: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const velocityTrend =
      prevWeekCommits > 0
        ? weeklyCommits > prevWeekCommits
          ? 'increasing'
          : weeklyCommits < prevWeekCommits
          ? 'decreasing'
          : 'stable'
        : 'stable';

    // Generate insights using AI
    const aiInsights = await generateAIInsights({
      teamSize: users.length,
      weeklyCommits,
      weeklyPRs,
      avgMergeTime: 4.5, // TODO: Calculate from actual PR data
      openPRCount: 5, // TODO: Get actual open PR count
      workloadDistribution,
      recentTrends: {
        velocity: velocityTrend,
        quality: 'stable',
      },
    });

    // Store insights in database
    const createdInsights = [];
    for (const insight of aiInsights.insights) {
      const created = await prisma.insight.create({
        data: {
          type: insight.type.toUpperCase() as any,
          severity: insight.severity.toUpperCase() as any,
          title: insight.title,
          description: insight.description,
          recommendation: insight.recommendation,
          organizationId: data.organizationId,
        },
      });
      createdInsights.push(created);
    }

    console.log(`Generated ${createdInsights.length} insights`);

    return {
      insightsCreated: createdInsights.length,
      insights: createdInsights,
    };
  } catch (error) {
    console.error('Error generating insights:', error);
    throw error;
  }
}
