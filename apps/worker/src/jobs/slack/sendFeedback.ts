import { prisma } from '@lucyn/database';
import { generateCommitTip, generatePRTip, generateAchievementMessage } from '@lucyn/ai';

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN || '';

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
    // Get user with Slack ID
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user?.slackId) {
      console.log('User has no Slack ID, skipping feedback');
      return { skipped: true, reason: 'no_slack_id' };
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

    // Send Slack message
    const slackResponse = await sendSlackDM(user.slackId, message);

    // Record feedback in database
    await prisma.slackFeedback.create({
      data: {
        type: data.type.toUpperCase() as any,
        message,
        channelId: slackResponse.channel,
        messageTs: slackResponse.ts,
        deliveredAt: new Date(),
        userId: user.id,
        commitId,
        pullRequestId,
      },
    });

    console.log(`Feedback sent successfully to ${user.name}`);

    return {
      sent: true,
      messageTs: slackResponse.ts,
    };
  } catch (error) {
    console.error('Error sending feedback:', error);
    throw error;
  }
}

async function sendSlackDM(
  userId: string,
  message: string
): Promise<{ channel: string; ts: string }> {
  // Open DM channel
  const openResponse = await fetch('https://slack.com/api/conversations.open', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ users: userId }),
  });

  const openData = await openResponse.json();
  if (!openData.ok) {
    throw new Error(`Failed to open DM: ${openData.error}`);
  }

  const channelId = openData.channel.id;

  // Send message
  const messageResponse = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: channelId,
      text: message,
      unfurl_links: false,
    }),
  });

  const messageData = await messageResponse.json();
  if (!messageData.ok) {
    throw new Error(`Failed to send message: ${messageData.error}`);
  }

  return {
    channel: channelId,
    ts: messageData.ts,
  };
}
