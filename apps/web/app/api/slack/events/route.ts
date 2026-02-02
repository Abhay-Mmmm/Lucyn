import { NextResponse } from 'next/server';
import crypto from 'crypto';

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET || '';

function verifySlackRequest(
  signature: string,
  timestamp: string,
  body: string
): boolean {
  const sigBasestring = `v0:${timestamp}:${body}`;
  const mySignature = 'v0=' + crypto
    .createHmac('sha256', SLACK_SIGNING_SECRET)
    .update(sigBasestring)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(mySignature),
    Buffer.from(signature)
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-slack-signature') || '';
    const timestamp = request.headers.get('x-slack-request-timestamp') || '';

    // Verify request is from Slack
    if (SLACK_SIGNING_SECRET && !verifySlackRequest(signature, timestamp, body)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const data = JSON.parse(body);

    // Handle URL verification challenge
    if (data.type === 'url_verification') {
      return NextResponse.json({ challenge: data.challenge });
    }

    // Handle events
    if (data.type === 'event_callback') {
      const event = data.event;

      console.log(`Slack event received: ${event.type}`);

      switch (event.type) {
        case 'app_mention':
          await handleAppMention(event, data.team_id);
          break;
        case 'message':
          if (event.channel_type === 'im') {
            await handleDirectMessage(event, data.team_id);
          }
          break;
        case 'reaction_added':
          await handleReaction(event, data.team_id);
          break;
        default:
          console.log(`Unhandled Slack event: ${event.type}`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Slack events error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleAppMention(event: any, teamId: string) {
  const { user, channel, text, ts } = event;

  console.log(`App mentioned by ${user} in ${channel}: ${text}`);

  // TODO: Parse the message and respond
  // This would typically involve:
  // 1. Understanding the question/command
  // 2. Querying relevant data
  // 3. Using AI to generate a response
  // 4. Posting the response back to Slack
}

async function handleDirectMessage(event: any, teamId: string) {
  const { user, channel, text, ts } = event;

  // Ignore bot messages
  if (event.bot_id) return;

  console.log(`DM from ${user}: ${text}`);

  // TODO: Process direct message and respond
  // This could be a developer asking a question about the codebase
}

async function handleReaction(event: any, teamId: string) {
  const { user, reaction, item } = event;

  console.log(`Reaction ${reaction} added by ${user}`);

  // TODO: Track helpful/not helpful reactions on feedback messages
  // This helps improve the AI's feedback quality
}
