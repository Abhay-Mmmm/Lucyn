import { Client, EmbedBuilder } from 'discord.js';

// Store the channel ID for notifications (set via command or config)
let notificationChannelId: string | null = null;

export function setNotificationChannel(channelId: string) {
  notificationChannelId = channelId;
}

export function getNotificationChannel(): string | null {
  return notificationChannelId;
}

// Send notification to the configured channel
export async function sendNotification(
  client: Client,
  embed: EmbedBuilder,
  channelId?: string
): Promise<boolean> {
  const targetChannelId = channelId || notificationChannelId;
  
  if (!targetChannelId) {
    console.warn('No notification channel configured');
    return false;
  }

  try {
    const channel = await client.channels.fetch(targetChannelId);
    
    // Use type guard to check if channel supports text-based messaging
    // This allows TextChannel, NewsChannel, ThreadChannel, etc.
    if (!channel || !channel.isTextBased()) {
      console.error('Invalid notification channel: channel is not text-based');
      return false;
    }

    await channel.send({ embeds: [embed] });
    return true;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}

// Notification builders for different events

export function buildPROpenedNotification(data: {
  title: string;
  url: string;
  author: string;
  repository: string;
  description?: string;
  additions: number;
  deletions: number;
}): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x238636) // GitHub green
    .setTitle(`🔀 New PR Opened: ${data.title}`)
    .setURL(data.url)
    .setDescription(data.description || 'No description provided')
    .addFields(
      { name: '👤 Author', value: data.author, inline: true },
      { name: '📁 Repository', value: data.repository, inline: true },
      { name: '📊 Changes', value: `+${data.additions} / -${data.deletions}`, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'GitHub • Pull Request' });
}

export function buildPRMergedNotification(data: {
  title: string;
  url: string;
  author: string;
  mergedBy: string;
  repository: string;
}): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x8957e5) // GitHub purple for merged
    .setTitle(`✅ PR Merged: ${data.title}`)
    .setURL(data.url)
    .addFields(
      { name: '👤 Author', value: data.author, inline: true },
      { name: '🔀 Merged by', value: data.mergedBy, inline: true },
      { name: '📁 Repository', value: data.repository, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'GitHub • Pull Request Merged' });
}

export function buildPRReviewNotification(data: {
  title: string;
  url: string;
  reviewer: string;
  repository: string;
  state: 'approved' | 'changes_requested' | 'commented';
  body?: string;
}): EmbedBuilder {
  const stateConfig = {
    approved: { emoji: '✅', color: 0x238636, text: 'Approved' },
    changes_requested: { emoji: '🔴', color: 0xda3633, text: 'Changes Requested' },
    commented: { emoji: '💬', color: 0x58a6ff, text: 'Commented' },
  };

  const config = stateConfig[data.state];

  return new EmbedBuilder()
    .setColor(config.color)
    .setTitle(`${config.emoji} PR Review: ${data.title}`)
    .setURL(data.url)
    .setDescription(data.body || `Review: ${config.text}`)
    .addFields(
      { name: '👤 Reviewer', value: data.reviewer, inline: true },
      { name: '📊 Status', value: config.text, inline: true },
      { name: '📁 Repository', value: data.repository, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'GitHub • PR Review' });
}

export function buildCommitPushNotification(data: {
  repository: string;
  branch: string;
  pusher: string;
  commits: Array<{ sha: string; message: string; author: string; url: string }>;
  compareUrl: string;
}): EmbedBuilder {
  const commitList = data.commits
    .slice(0, 5)
    .map(c => `• [\`${c.sha.slice(0, 7)}\`](${c.url}) ${c.message.split('\n')[0].slice(0, 50)}`)
    .join('\n');

  const moreCommits = data.commits.length > 5 
    ? `\n... and ${data.commits.length - 5} more commits` 
    : '';

  return new EmbedBuilder()
    .setColor(0x58a6ff) // GitHub blue
    .setTitle(`📝 ${data.commits.length} commit(s) pushed to ${data.branch}`)
    .setURL(data.compareUrl)
    .setDescription(`${commitList}${moreCommits}`)
    .addFields(
      { name: '👤 Pushed by', value: data.pusher, inline: true },
      { name: '📁 Repository', value: data.repository, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'GitHub • Push Event' });
}

export function buildInsightNotification(data: {
  title: string;
  insight: string;
  severity: 'info' | 'warning' | 'critical';
  recommendation?: string;
}): EmbedBuilder {
  const severityConfig = {
    info: { emoji: '💡', color: 0x58a6ff },
    warning: { emoji: '⚠️', color: 0xd29922 },
    critical: { emoji: '🚨', color: 0xda3633 },
  };

  const config = severityConfig[data.severity];

  const embed = new EmbedBuilder()
    .setColor(config.color)
    .setTitle(`${config.emoji} ${data.title}`)
    .setDescription(data.insight)
    .setTimestamp()
    .setFooter({ text: 'Lucyn AI • Automated Insight' });

  if (data.recommendation) {
    embed.addFields({
      name: '💡 Recommendation',
      value: data.recommendation,
    });
  }

  return embed;
}
