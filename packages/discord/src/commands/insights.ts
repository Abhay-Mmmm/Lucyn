import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import type { Command } from './index';

// Mock data - in production, this would come from the database
const mockInsights = {
  healthScore: 82,
  velocity: {
    commitsThisWeek: 47,
    prsOpened: 12,
    prsMerged: 9,
    avgReviewTime: '4.2 hours',
  },
  risks: [
    '⚠️ PR #234 has been open for 5 days without review',
    '⚠️ High code churn detected in auth module (3 rewrites this week)',
  ],
  recommendations: [
    '💡 Consider breaking down large PRs for faster reviews',
    '💡 Schedule a refactoring session for the auth module',
    '💡 Add more unit tests to payment service (coverage: 45%)',
  ],
};

export const insightsCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('insights')
    .setDescription('View team health, velocity metrics, and AI-generated insights') as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    // Create health score color based on value
    const healthColor = mockInsights.healthScore >= 80 
      ? 0x00ff00 
      : mockInsights.healthScore >= 60 
        ? 0xffff00 
        : 0xff0000;

    const healthEmoji = mockInsights.healthScore >= 80 
      ? '🟢' 
      : mockInsights.healthScore >= 60 
        ? '🟡' 
        : '🔴';

    const embed = new EmbedBuilder()
      .setColor(healthColor)
      .setTitle('📊 Team Insights Dashboard')
      .setDescription(`${healthEmoji} **Team Health Score: ${mockInsights.healthScore}/100**`)
      .addFields(
        {
          name: '📈 Velocity Metrics (This Week)',
          value: [
            `• **Commits:** ${mockInsights.velocity.commitsThisWeek}`,
            `• **PRs Opened:** ${mockInsights.velocity.prsOpened}`,
            `• **PRs Merged:** ${mockInsights.velocity.prsMerged}`,
            `• **Avg Review Time:** ${mockInsights.velocity.avgReviewTime}`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '⚠️ Risk Alerts',
          value: mockInsights.risks.length > 0 
            ? mockInsights.risks.join('\n')
            : '✅ No active risks detected',
          inline: false,
        },
        {
          name: '💡 AI Recommendations',
          value: mockInsights.recommendations.join('\n'),
          inline: false,
        }
      )
      .setFooter({
        text: 'Data updated just now • Use /team for individual metrics',
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
