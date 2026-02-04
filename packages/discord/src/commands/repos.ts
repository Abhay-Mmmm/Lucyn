import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import type { Command } from './index';

// Mock repository data - in production, this would come from the database
const mockRepos = [
  {
    name: 'frontend-app',
    fullName: 'acme-corp/frontend-app',
    language: 'TypeScript',
    lastCommit: '2 hours ago',
    openPRs: 3,
    openIssues: 12,
    coverage: 78,
    status: 'healthy',
  },
  {
    name: 'api-service',
    fullName: 'acme-corp/api-service',
    language: 'Python',
    lastCommit: '30 minutes ago',
    openPRs: 5,
    openIssues: 8,
    coverage: 85,
    status: 'healthy',
  },
  {
    name: 'mobile-app',
    fullName: 'acme-corp/mobile-app',
    language: 'React Native',
    lastCommit: '1 day ago',
    openPRs: 2,
    openIssues: 15,
    coverage: 62,
    status: 'warning',
  },
  {
    name: 'infrastructure',
    fullName: 'acme-corp/infrastructure',
    language: 'Terraform',
    lastCommit: '3 days ago',
    openPRs: 1,
    openIssues: 4,
    coverage: null,
    status: 'healthy',
  },
];

export const reposCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('repos')
    .setDescription('List connected repositories and their status')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('Filter by repository name')
        .setRequired(false)
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const nameFilter = interaction.options.getString('name');

    let repos = mockRepos;
    if (nameFilter) {
      repos = mockRepos.filter(r =>
        r.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
        r.fullName.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (repos.length === 0) {
      await interaction.editReply({
        content: `❌ No repository found matching "${nameFilter}"`,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('📁 Connected Repositories')
      .setDescription(`**${repos.length} repositories** connected to Lucyn`);

    // Discord embeds have a maximum of 25 fields
    // Reserve 1 field for "and X more" message if needed
    const MAX_FIELDS = 24;
    const displayRepos = repos.slice(0, MAX_FIELDS);
    const omittedCount = repos.length - displayRepos.length;

    for (const repo of displayRepos) {
      const statusEmoji = repo.status === 'healthy' ? '🟢' : '🟡';
      const coverageText = repo.coverage !== null 
        ? `${repo.coverage}% coverage` 
        : 'No coverage data';
      const coverageEmoji = repo.coverage !== null && repo.coverage >= 80 
        ? '✅' 
        : repo.coverage !== null && repo.coverage >= 60 
          ? '⚠️' 
          : repo.coverage !== null 
            ? '❌' 
            : '➖';

      embed.addFields({
        name: `${statusEmoji} ${repo.name}`,
        value: [
          `📂 \`${repo.fullName}\``,
          `💻 ${repo.language}`,
          `🕐 Last commit: ${repo.lastCommit}`,
          `🔀 ${repo.openPRs} open PRs • 📋 ${repo.openIssues} issues`,
          `${coverageEmoji} ${coverageText}`,
        ].join('\n'),
        inline: true,
      });
    }

    // Add summary field if repos were omitted
    if (omittedCount > 0) {
      embed.addFields({
        name: '📊 More Repositories',
        value: `**+${omittedCount} more** repositories not shown.\nUse \`/repos name:<filter>\` to search, or view all in the [Lucyn Dashboard](${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/repositories).`,
        inline: false,
      });
    }

    embed.setFooter({
      text: omittedCount > 0 
        ? `Showing ${displayRepos.length} of ${repos.length} repos • Use filters to narrow results`
        : 'Tip: Add more repos from the Lucyn dashboard',
    });
    embed.setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
