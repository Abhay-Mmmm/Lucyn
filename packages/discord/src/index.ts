import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from root .env file
config({ path: resolve(__dirname, '../../../.env') });

import { Client, GatewayIntentBits, Events, REST, Routes } from 'discord.js';
import { commands, handleCommand } from './commands';
import { handleMessage } from './events/messageCreate';

// Environment variables
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

if (!DISCORD_BOT_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN is required');
  process.exit(1);
}

if (!DISCORD_CLIENT_ID) {
  console.error('❌ DISCORD_CLIENT_ID is required');
  process.exit(1);
}

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Register slash commands
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN!);

  try {
    console.log('🔄 Registering slash commands...');

    const commandData = commands.map(cmd => cmd.data.toJSON());

    if (DISCORD_GUILD_ID) {
      // Register commands for specific guild (faster for development)
      await rest.put(
        Routes.applicationGuildCommands(DISCORD_CLIENT_ID!, DISCORD_GUILD_ID),
        { body: commandData }
      );
      console.log(`✅ Registered ${commandData.length} commands for guild ${DISCORD_GUILD_ID}`);
    } else {
      // Register global commands (takes up to 1 hour to propagate)
      await rest.put(
        Routes.applicationCommands(DISCORD_CLIENT_ID!),
        { body: commandData }
      );
      console.log(`✅ Registered ${commandData.length} global commands`);
    }
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }
}

// Bot ready event
client.once(Events.ClientReady, async (readyClient) => {
  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║                                            ║');
  console.log(`║   🤖 Lucyn Bot is online!                  ║`);
  console.log(`║   📛 Logged in as: ${readyClient.user.tag.padEnd(20)}   ║`);
  console.log(`║   🏠 Servers: ${String(readyClient.guilds.cache.size).padEnd(26)}   ║`);
  console.log('║                                            ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');

  // Register commands after bot is ready
  await registerCommands();
});

// Handle slash commands
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  await handleCommand(interaction);
});

// Handle regular messages (for @mentions and AI responses)
client.on(Events.MessageCreate, async (message) => {
  await handleMessage(client, message);
});

// Error handling
client.on(Events.Error, (error) => {
  console.error('Discord client error:', error);
});

// Start the bot
async function start() {
  console.log('🚀 Starting Lucyn Discord Bot...');
  
  try {
    await client.login(DISCORD_BOT_TOKEN);
  } catch (error) {
    console.error('❌ Failed to login:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down...');
  client.destroy();
  process.exit(0);
});

// Export for external use
export { client, start };

// Auto-start if run directly
start();
