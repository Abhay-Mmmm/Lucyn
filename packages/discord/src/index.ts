import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// ESM-compatible __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from root .env file
config({ path: resolve(__dirname, '../../../.env') });

import { Client, GatewayIntentBits, Events, REST, Routes } from 'discord.js';
import { commands, handleCommand } from './commands';
import { handleMessage } from './events/messageCreate';

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
async function registerCommands(botToken: string, clientId: string, guildId?: string) {
  const rest = new REST({ version: '10' }).setToken(botToken);

  try {
    console.log('🔄 Registering slash commands...');

    const commandData = commands.map(cmd => cmd.data.toJSON());

    if (guildId) {
      // Register commands for specific guild (faster for development)
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commandData }
      );
      console.log(`✅ Registered ${commandData.length} commands for guild ${guildId}`);
    } else {
      // Register global commands (takes up to 1 hour to propagate)
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commandData }
      );
      console.log(`✅ Registered ${commandData.length} global commands`);
    }
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }
}

// Store credentials for use in event handlers (set during start())
let storedBotToken: string;
let storedClientId: string;
let storedGuildId: string | undefined;

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
  await registerCommands(storedBotToken, storedClientId, storedGuildId);
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
  
  // Validate environment variables at startup (not import time)
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!botToken) {
    console.error('❌ DISCORD_BOT_TOKEN is required');
    process.exit(1);
  }

  if (!clientId) {
    console.error('❌ DISCORD_CLIENT_ID is required');
    process.exit(1);
  }

  // Store credentials for use in event handlers
  storedBotToken = botToken;
  storedClientId = clientId;
  storedGuildId = guildId;
  
  try {
    await client.login(botToken);
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

// Auto-start only when run directly as entrypoint (not when imported)
// ESM-safe check: compare the file URL of this module with the normalized entry point URL
function isMainModule(): boolean {
  const entryPath = process.argv[1];
  if (!entryPath) return false;
  
  try {
    // Use pathToFileURL for safe conversion (handles spaces, special chars, etc.)
    const entryUrl = pathToFileURL(resolve(entryPath)).href;
    return import.meta.url === entryUrl;
  } catch {
    return false;
  }
}

if (isMainModule()) {
  start();
}
