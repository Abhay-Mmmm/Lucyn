import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  X,
  Bell
} from 'lucide-react';

// Mock insights data
const mockInsights = [
  {
    id: '1',
    type: 'velocity',
    severity: 'info',
    title: 'Velocity increased by 15% this sprint',
    description: 'Your team shipped more story points than the previous sprint. The frontend team was particularly productive with 3 major features completed.',
    recommendation: 'Consider documenting what worked well to replicate success in future sprints.',
    createdAt: '2 hours ago',
    isRead: false,
  },
  {
    id: '2',
    type: 'risk',
    severity: 'warning',
    title: 'Potential burnout risk detected',
    description: 'Alex has been working outside normal hours for the past 2 weeks and has 3x the average workload. This pattern often precedes burnout.',
    recommendation: 'Consider redistributing some tasks and checking in with Alex about workload.',
    createdAt: '5 hours ago',
    isRead: false,
  },
  {
    id: '3',
    type: 'quality',
    severity: 'info',
    title: 'Code review turnaround improved',
    description: 'Average time to first review decreased from 8 hours to 4 hours this week.',
    recommendation: 'Great progress! Consider setting a team goal to maintain this momentum.',
    createdAt: '1 day ago',
    isRead: true,
  },
  {
    id: '4',
    type: 'recommendation',
    severity: 'info',
    title: 'Consider breaking up large PRs',
    description: '3 PRs this week had over 500 lines of changes. Large PRs take longer to review and are more prone to bugs.',
    recommendation: 'Encourage the team to keep PRs under 400 lines when possible.',
    createdAt: '2 days ago',
    isRead: true,
  },
];

const typeIcons = {
  velocity: TrendingUp,
  risk: AlertTriangle,
  quality: CheckCircle,
  recommendation: Lightbulb,
  health: CheckCircle,
  opportunity: TrendingUp,
};

const severityColors = {
  info: 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950',
  warning: 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950',
  critical: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950',
};

const iconColors = {
  info: 'text-blue-500',
  warning: 'text-yellow-500',
  critical: 'text-red-500',
};

export default function InsightsPage() {
  const unreadCount = mockInsights.filter((i) => !i.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Insights</h1>
          <p className="text-muted-foreground">
            AI-generated observations and recommendations for your team
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {unreadCount} unread
            </span>
          )}
          <Button variant="outline" size="sm">
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Insight Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{mockInsights.length}</div>
            <div className="text-sm text-muted-foreground">Total Insights</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-500">
              {mockInsights.filter((i) => i.type === 'velocity').length}
            </div>
            <div className="text-sm text-muted-foreground">Velocity</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-500">
              {mockInsights.filter((i) => i.severity === 'warning').length}
            </div>
            <div className="text-sm text-muted-foreground">Warnings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-500">
              {mockInsights.filter((i) => i.type === 'quality').length}
            </div>
            <div className="text-sm text-muted-foreground">Quality</div>
          </CardContent>
        </Card>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {mockInsights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      {mockInsights.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">No insights yet</h3>
            <p className="text-muted-foreground">
              Insights will appear here as Lucyn analyzes your team&apos;s activity
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InsightCard({ insight }: { insight: typeof mockInsights[0] }) {
  const Icon = typeIcons[insight.type as keyof typeof typeIcons] || Lightbulb;

  return (
    <Card className={`${severityColors[insight.severity as keyof typeof severityColors]} ${!insight.isRead ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className={`p-2 rounded-lg bg-background ${iconColors[insight.severity as keyof typeof iconColors]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{insight.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {insight.description}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
            {insight.recommendation && (
              <div className="mt-3 p-3 bg-background rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Recommendation:</span>{' '}
                  {insight.recommendation}
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3">{insight.createdAt}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
