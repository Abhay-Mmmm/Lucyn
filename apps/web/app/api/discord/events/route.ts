import { NextResponse } from 'next/server';
import crypto from 'crypto';

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY || '';

function verifyDiscordRequest(
  signature: string,
  timestamp: string,
  body: string
): boolean {
  try {
    const message = timestamp + body;
    const signatureBytes = Buffer.from(signature, 'hex');
    const publicKeyBytes = Buffer.from(DISCORD_PUBLIC_KEY, 'hex');
    
    // Use Ed25519 verification for Discord
    return crypto.verify(
      null,
      Buffer.from(message),
      {
        key: Buffer.concat([Buffer.from('302a300506032b6570032100', 'hex'), publicKeyBytes]),
        format: 'der',
        type: 'spki',
      },
      signatureBytes
    );
  } catch (error) {
    console.error('Discord signature verification error:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature-ed25519') || '';
    const timestamp = request.headers.get('x-signature-timestamp') || '';

    // Verify request is from Discord
    if (DISCORD_PUBLIC_KEY && !verifyDiscordRequest(signature, timestamp, body)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const data = JSON.parse(body);

    // Handle Discord PING (verification)
    if (data.type === 1) {
      return NextResponse.json({ type: 1 });
    }

    // Handle interactions (type 2 = Application Command, type 3 = Message Component)
    if (data.type === 2 || data.type === 3) {
      const interaction = data;

      console.log(`Discord interaction received: ${interaction.data?.name || 'component'}`);

      switch (interaction.data?.name) {
        case 'lucyn':
          await handleSlashCommand(interaction);
          break;
        default:
          console.log(`Unhandled Discord interaction: ${interaction.data?.name}`);
      }

      // Acknowledge the interaction
      return NextResponse.json({
        type: 4,
        data: {
          content: 'Processing your request...',
        },
      });
    }

    // Handle MESSAGE_CREATE events (for bot mentions in messages)
    if (data.t === 'MESSAGE_CREATE') {
      const message = data.d;
      
      // Check if bot was mentioned
      const botMentioned = message.mentions?.some(
        (mention: any) => mention.id === process.env.DISCORD_BOT_ID
      );

      if (botMentioned) {
        await handleBotMention(message);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Discord events error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleSlashCommand(interaction: any) {
  const { user, channel_id, data } = interaction;

  console.log(`Slash command from ${user?.username} in channel ${channel_id}`);

  // TODO: Parse the command and respond
  // This would typically involve:
  // 1. Understanding the command/options
  // 2. Querying relevant data
  // 3. Using AI to generate a response
  // 4. Sending follow-up message via Discord API
}

async function handleBotMention(message: any) {
  const { author, channel_id, content } = message;

  // Ignore bot messages
  if (author.bot) return;

  console.log(`Bot mentioned by ${author.username}: ${content}`);

  // TODO: Process mention and respond
  // This could be a developer asking a question about the codebase
}

async function handleReaction(guildId: string, channelId: string, messageId: string, emoji: string, userId: string) {
  console.log(`Reaction ${emoji} added by ${userId}`);

  // TODO: Track helpful/not helpful reactions on feedback messages
  // This helps improve the AI's feedback quality
}
