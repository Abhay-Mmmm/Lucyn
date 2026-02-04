import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import type { Command } from './index';

// Mock team data - in production, this would come from the database
const mockTeamMembers = [
  {
    name: 'Alice Chen',
    github: 'alicechen',
    commitsThisWeek: 15,
    prsOpened: 4,
    prsReviewed: 6,
    linesAdded: 1240,
    linesRemoved: 380,
    status: 'active',
  },
  {
    name: 'Bob Smith',
    github: 'bobsmith',
    commitsThisWeek: 12,
    prsOpened: 3,
    prsReviewed: 8,
    linesAdded: 890,
    linesRemoved: 450,
    status: 'active',
  },
  {
    name: 'Carol Davis',
    github: 'caroldavis',
    commitsThisWeek: 8,
    prsOpened: 2,
    prsReviewed: 4,
    linesAdded: 560,
    linesRemoved: 120,
    status: 'active',
  },
  {
    name: 'David Lee',
    github: 'davidlee',
    commitsThisWeek: 6,
    prsOpened: 2,
    prsReviewed: 3,
    linesAdded: 420,
    linesRemoved: 90,
    status: 'away',
  },
  {
    name: 'Eva Martinez',
    github: 'evamartinez',
    commitsThisWeek: 11,
    prsOpened: 3,
    prsReviewed: 5,
    linesAdded: 780,
    linesRemoved: 210,
    status: 'active',
  },
];

export const teamCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('team')
    .setDescription('View team member activity and contributions')
    .addStringOption(option =>
      option
        .setName('member')
        .setDescription('Filter by team member (GitHub username)')
        .setRequired(false)
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const memberFilter = interaction.options.getString('member');

    let members = mockTeamMembers;
    if (memberFilter) {
      members = mockTeamMembers.filter(m => 
        m.github.toLowerCase().includes(memberFilter.toLowerCase()) ||
        m.name.toLowerCase().includes(memberFilter.toLowerCase())
      );
    }

    if (members.length === 0) {
      await interaction.editReply({
        content: `❌ No team member found matching "${memberFilter}"`,
      });
      return;
    }

    // Calculate team totals
    const totals = members.reduce(
      (acc, m) => ({
        commits: acc.commits + m.commitsThisWeek,
        prsOpened: acc.prsOpened + m.prsOpened,
        prsReviewed: acc.prsReviewed + m.prsReviewed,
        linesAdded: acc.linesAdded + m.linesAdded,
        linesRemoved: acc.linesRemoved + m.linesRemoved,
      }),
      { commits: 0, prsOpened: 0, prsReviewed: 0, linesAdded: 0, linesRemoved: 0 }
    );

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('👥 Team Activity Dashboard')
      .setDescription(
        `**${members.length} team member${members.length > 1 ? 's' : ''}** • This week's activity`
      );

    // Add individual member fields
    for (const member of members.slice(0, 5)) { // Limit to 5 to avoid embed size limits
      const statusEmoji = member.status === 'active' ? '🟢' : '🟡';
      embed.addFields({
        name: `${statusEmoji} ${member.name} (@${member.github})`,
        value: [
          `📝 **${member.commitsThisWeek}** commits`,
          `🔀 **${member.prsOpened}** PRs opened`,
          `👀 **${member.prsReviewed}** reviews`,
          `📊 +${member.linesAdded} / -${member.linesRemoved} lines`,
        ].join(' • '),
        inline: false,
      });
    }

    if (members.length > 5) {
      embed.addFields({
        name: `➕ And ${members.length - 5} more...`,
        value: 'Use `/team member:<name>` to view specific members',
        inline: false,
      });
    }

    // Add team summary
    embed.addFields({
      name: '📈 Team Totals',
      value: [
        `**${totals.commits}** commits`,
        `**${totals.prsOpened}** PRs opened`,
        `**${totals.prsReviewed}** reviews`,
        `+${totals.linesAdded.toLocaleString()} / -${totals.linesRemoved.toLocaleString()} lines`,
      ].join(' • '),
      inline: false,
    });

    embed.setFooter({
      text: 'Updated just now • Use /insights for AI recommendations',
    });
    embed.setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
