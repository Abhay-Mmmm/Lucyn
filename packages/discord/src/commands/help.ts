import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import type { Command } from './index';

export const helpCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show available Lucyn commands and features') as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2) // Discord blurple
      .setTitle('🤖 Lucyn - AI Product Engineer')
      .setDescription(
        'I help engineering teams with insights, code review, and project management!\n\n' +
        '**Available Commands:**'
      )
      .addFields(
        {
          name: '📊 `/insights`',
          value: 'View team health, velocity metrics, and AI-generated insights',
          inline: false,
        },
        {
          name: '👥 `/team`',
          value: 'See team member activity, contributions, and workload distribution',
          inline: false,
        },
        {
          name: '📁 `/repos`',
          value: 'List connected repositories and their status',
          inline: false,
        },
        {
          name: '🔍 `/analyze`',
          value: 'Analyze a commit, PR, or codebase for quality and improvements',
          inline: false,
        },
        {
          name: '❓ `/help`',
          value: 'Show this help message',
          inline: false,
        }
      )
      .addFields(
        {
          name: '💡 Tips',
          value:
            '• **Mention me** in any message to ask questions about your codebase\n' +
            '• I\'ll automatically notify you about important PR events\n' +
            '• Use reactions on my messages to provide feedback',
          inline: false,
        }
      )
      .setFooter({
        text: 'Lucyn AI • Built for developers, by developers',
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
