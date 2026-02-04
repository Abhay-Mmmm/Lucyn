import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { insightsCommand } from './insights';
import { teamCommand } from './team';
import { reposCommand } from './repos';
import { helpCommand } from './help';
import { analyzeCommand } from './analyze';

// Command interface
export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

// Export all commands
export const commands: Command[] = [
  insightsCommand,
  teamCommand,
  reposCommand,
  helpCommand,
  analyzeCommand,
];

// Command handler
export async function handleCommand(interaction: ChatInputCommandInteraction) {
  const command = commands.find(cmd => cmd.data.name === interaction.commandName);

  if (!command) {
    await interaction.reply({
      content: '❌ Unknown command',
      ephemeral: true,
    });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing command ${interaction.commandName}:`, error);

    const errorMessage = '❌ An error occurred while executing this command.';

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
}

// Utility function to create error embed
export function createErrorEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

// Utility function to create success embed
export function createSuccessEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp();
}
