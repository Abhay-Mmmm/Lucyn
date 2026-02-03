'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FeedbackMessage {
  id: string;
  type: 'COMMIT_TIP' | 'PR_SUGGESTION' | 'ACHIEVEMENT' | 'INSIGHT';
  recipient: string;
  message: string;
  deliveredAt: string;
  reaction?: string;
  responseText?: string;
}

// Mock feedback data
const mockFeedback: FeedbackMessage[] = [
  {
    id: '1',
    type: 'COMMIT_TIP',
    recipient: 'Alex Chen',
    message:
      'Hey Alex! Great commit on the auth module. One tip: consider adding a brief "why" to your commit messages to help future developers understand the reasoning behind changes.',
    deliveredAt: '2024-01-15T10:30:00Z',
    reaction: '👍',
  },
  {
    id: '2',
    type: 'ACHIEVEMENT',
    recipient: 'Sarah Kim',
    message:
      "🎉 Congrats Sarah! You've closed 15 PRs this week - your highest ever! Your code quality scores have been consistently above 8.5. Keep up the amazing work!",
    deliveredAt: '2024-01-15T09:00:00Z',
    reaction: '🙏',
  },
  {
    id: '3',
    type: 'PR_SUGGESTION',
    recipient: 'Mike Johnson',
    message:
      'Hi Mike! I noticed your PR #234 could benefit from some additional test coverage. Would you like me to suggest some edge cases to test?',
    deliveredAt: '2024-01-14T16:45:00Z',
    responseText: "Yes please! That would be helpful.",
  },
  {
    id: '4',
    type: 'INSIGHT',
    recipient: 'Team Channel',
    message:
      '📊 Weekly Engineering Report: Velocity is up 12% this week! Top contributors: Sarah (15 PRs), Alex (12 PRs), Mike (10 PRs). Average PR merge time: 3.2 hours.',
    deliveredAt: '2024-01-15T08:00:00Z',
    reaction: '🚀',
  },
];

function getTypeIcon(type: string) {
  switch (type) {
    case 'COMMIT_TIP':
      return '💬';
    case 'PR_SUGGESTION':
      return '📝';
    case 'ACHIEVEMENT':
      return '🏆';
    case 'INSIGHT':
      return '📊';
    default:
      return '💡';
  }
}

function getTypeBadge(type: string) {
  switch (type) {
    case 'COMMIT_TIP':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'PR_SUGGESTION':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'ACHIEVEMENT':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'INSIGHT':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function DiscordPage() {
  const [isConnected, setIsConnected] = useState(true);
  const [settings, setSettings] = useState({
    feedbackChannel: '#engineering',
    weeklyReportChannel: '#team-updates',
    dmFeedback: true,
    achievementCelebrations: true,
    dailyDigest: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Discord Integration</h1>
        <p className="text-muted-foreground">
          Configure how Lucyn interacts with your team through Discord
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Manage your Discord server connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="font-medium">
                  {isConnected ? 'Connected to server' : 'Not connected'}
                </span>
              </div>
              <Button variant={isConnected ? 'outline' : 'default'}>
                {isConnected ? 'Disconnect' : 'Connect Discord'}
              </Button>
            </div>
            {isConnected && (
              <div className="text-sm text-muted-foreground">
                <p>Server: Acme Corp</p>
                <p>Bot name: Lucyn</p>
                <p>Members synced: 12</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback Stats</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold">48</p>
                <p className="text-sm text-muted-foreground">Messages sent</p>
              </div>
              <div>
                <p className="text-2xl font-bold">92%</p>
                <p className="text-sm text-muted-foreground">Positive reactions</p>
              </div>
              <div>
                <p className="text-2xl font-bold">15</p>
                <p className="text-sm text-muted-foreground">Replies received</p>
              </div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">Achievements shared</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Settings</CardTitle>
          <CardDescription>Configure how and where Lucyn sends feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="feedbackChannel">Feedback Channel</Label>
              <Input
                id="feedbackChannel"
                value={settings.feedbackChannel}
                onChange={(e) =>
                  setSettings({ ...settings, feedbackChannel: e.target.value })
                }
                placeholder="#channel-name"
              />
              <p className="text-xs text-muted-foreground">
                Public team feedback will be posted here
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weeklyReportChannel">Weekly Report Channel</Label>
              <Input
                id="weeklyReportChannel"
                value={settings.weeklyReportChannel}
                onChange={(e) =>
                  setSettings({ ...settings, weeklyReportChannel: e.target.value })
                }
                placeholder="#channel-name"
              />
              <p className="text-xs text-muted-foreground">
                Weekly engineering reports will be posted here
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Direct Message Feedback</p>
                <p className="text-sm text-muted-foreground">
                  Send personalized tips directly to developers
                </p>
              </div>
              <Button
                variant={settings.dmFeedback ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  setSettings({ ...settings, dmFeedback: !settings.dmFeedback })
                }
              >
                {settings.dmFeedback ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Achievement Celebrations</p>
                <p className="text-sm text-muted-foreground">
                  Celebrate milestones and achievements publicly
                </p>
              </div>
              <Button
                variant={settings.achievementCelebrations ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  setSettings({
                    ...settings,
                    achievementCelebrations: !settings.achievementCelebrations,
                  })
                }
              >
                {settings.achievementCelebrations ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Digest</p>
                <p className="text-sm text-muted-foreground">
                  Send a daily summary of team activity
                </p>
              </div>
              <Button
                variant={settings.dailyDigest ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  setSettings({ ...settings, dailyDigest: !settings.dailyDigest })
                }
              >
                {settings.dailyDigest ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </div>

          <Button>Save Settings</Button>
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>Messages sent by Lucyn to your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockFeedback.map((feedback) => (
              <div
                key={feedback.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span>{getTypeIcon(feedback.type)}</span>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeBadge(
                      feedback.type
                    )}`}
                  >
                    {feedback.type.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    to {feedback.recipient}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(feedback.deliveredAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{feedback.message}</p>
                {(feedback.reaction || feedback.responseText) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {feedback.reaction && (
                      <span>Reaction: {feedback.reaction}</span>
                    )}
                    {feedback.responseText && (
                      <span>Reply: &ldquo;{feedback.responseText}&rdquo;</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
