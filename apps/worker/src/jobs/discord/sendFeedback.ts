import { prisma } from '@lucyn/database';
import { generateCommitTip, generatePRTip, generateAchievementMessage } from '@lucyn/ai';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';

export interface SendFeedbackData {
  userId: string;
  type: 'commit_tip' | 'pr_suggestion' | 'achievement';
  entityId?: string; // commit or PR ID
  achievement?: string;
  stats?: Record<string, number>;
}

export async function sendFeedback(data: SendFeedbackData) {
  console.log(`Sending ${data.type} feedback to user: ${data.userId}`);

  try {
    // Get user with Discord ID
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user?.discordId) {
      console.log('User has no Discord ID, skipping feedback');
      return { skipped: true, reason: 'no_discord_id' };
    }

    if (!user.feedbackEnabled) {
      console.log('User has feedback disabled, skipping');
      return { skipped: true, reason: 'feedback_disabled' };
    }

    let message = '';
    let commitId: string | undefined;
    let pullRequestId: string | undefined;

    switch (data.type) {
      case 'commit_tip': {
        const commit = await prisma.commit.findUnique({
          where: { id: data.entityId },
        });
        if (!commit) throw new Error('Commit not found');

        const analysis = commit.analysis as any;
        message = await generateCommitTip(
          user.name || 'Developer',
          commit.message,
          analysis?.suggestions || []
        );
        commitId = commit.id;
        break;
      }

      case 'pr_suggestion': {
        const pr = await prisma.pullRequest.findUnique({
          where: { id: data.entityId },
        });
        if (!pr) throw new Error('Pull request not found');

        const analysis = pr.analysis as any;
        message = await generatePRTip(
          user.name || 'Developer',
          pr.title,
          analysis?.highlights || [],
          analysis?.suggestions || []
        );
        pullRequestId = pr.id;
        break;
      }

      case 'achievement': {
        message = await generateAchievementMessage(
          user.name || 'Developer',
          data.achievement || 'Great work!',
          data.stats || {}
        );
        break;
      }
    }

    // Send Discord DM
    const discordResponse = await sendDiscordDM(user.discordId, message);

    // Record feedback in database
    await prisma.discordFeedback.create({
      data: {
        type: data.type.toUpperCase() as any,
        message,
        channelId: discordResponse.channelId,
        messageId: discordResponse.messageId,
        deliveredAt: new Date(),
        userId: user.id,
        commitId,
        pullRequestId,
      },
    });

    console.log(`Feedback sent successfully to ${user.name}`);

    return {
      sent: true,
      messageId: discordResponse.messageId,
    };
  } catch (error) {
    console.error('Error sending feedback:', error);
    throw error;
  }
}

async function sendDiscordDM(
  userId: string,
  message: string
): Promise<{ channelId: string; messageId: string }> {
  // Create DM channel with user
  const dmChannelResponse = await fetch('https://discord.com/api/v10/users/@me/channels', {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recipient_id: userId }),
  });

  const dmChannel = await dmChannelResponse.json();
  if (dmChannel.code) {
    throw new Error(`Failed to create DM channel: ${dmChannel.message}`);
  }

  const channelId = dmChannel.id;

  // Send message to DM channel
  const messageResponse = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: message,
    }),
  });

  const messageData = await messageResponse.json();
  if (messageData.code) {
    throw new Error(`Failed to send message: ${messageData.message}`);
  }

  return {
    channelId,
    messageId: messageData.id,
  };
}
