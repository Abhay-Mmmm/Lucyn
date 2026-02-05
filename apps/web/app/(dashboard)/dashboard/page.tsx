'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  TrendingDown, 
  GitPullRequest, 
  GitCommit, 
  Users,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

// Realistic placeholder data
const metrics = {
  healthScore: 82,
  healthTrend: 5,
  velocity: {
    prsOpened: 14,
    prsMerged: 11,
    commits: 89,
    avgReviewTime: '4.2h',
  },
  teamActivity: [
    { name: 'Sarah Chen', email: 'sarah@acme.com', commits: 23, prs: 5, avatar: null },
    { name: 'Marcus Johnson', email: 'marcus@acme.com', commits: 18, prs: 4, avatar: null },
    { name: 'Elena Rodriguez', email: 'elena@acme.com', commits: 15, prs: 3, avatar: null },
    { name: 'James Park', email: 'james@acme.com', commits: 12, prs: 2, avatar: null },
  ],
  insights: [
    { id: 1, type: 'success', title: 'PR velocity up 12% this week', action: 'View details' },
    { id: 2, type: 'warning', title: 'Marcus has 3 PRs awaiting review', action: 'Assign reviewers' },
    { id: 3, type: 'info', title: 'Code coverage improved in auth module', action: null },
  ],
  recentPRs: [
    { id: 1, title: 'Add user authentication flow', author: 'Sarah Chen', status: 'merged', time: '2h ago' },
    { id: 2, title: 'Fix payment processing edge case', author: 'Marcus Johnson', status: 'open', time: '4h ago' },
    { id: 3, title: 'Update dashboard metrics', author: 'Elena Rodriguez', status: 'review', time: '6h ago' },
  ],
};

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-in">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Your engineering team at a glance
        </p>
      </div>

      {/* Health Score Card - Full Width */}
      <Card className="overflow-hidden">
        <div className="flex items-stretch">
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Team Health</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-semibold">{metrics.healthScore}</span>
                  <span className="text-muted-foreground">/100</span>
                  <Badge variant="success" className="ml-2">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{metrics.healthTrend}%
                  </Badge>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${metrics.healthScore}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Based on velocity, quality, and collaboration metrics
              </p>
            </div>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 p-6 grid grid-cols-2 gap-6">
            <MetricItem 
              label="PRs Merged" 
              value={metrics.velocity.prsMerged} 
              subtext="this week"
            />
            <MetricItem 
              label="Commits" 
              value={metrics.velocity.commits} 
              subtext="this week"
            />
            <MetricItem 
              label="PRs Open" 
              value={metrics.velocity.prsOpened} 
              subtext="awaiting review"
            />
            <MetricItem 
              label="Avg Review Time" 
              value={metrics.velocity.avgReviewTime} 
              subtext="time to first review"
            />
          </div>
        </div>
      </Card>

      {/* Two Column Layout - Fill the entire width */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Takes 2 columns */}
        <div className="xl:col-span-2 space-y-6">
          {/* Insights */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-medium">Insights</CardTitle>
              <Link href="/dashboard/insights">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics.insights.map((insight) => (
                <div 
                  key={insight.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={`mt-0.5 ${
                    insight.type === 'success' ? 'text-emerald-600' :
                    insight.type === 'warning' ? 'text-amber-600' :
                    'text-blue-600'
                  }`}>
                    {insight.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
                    {insight.type === 'warning' && <AlertTriangle className="h-5 w-5" />}
                    {insight.type === 'info' && <Lightbulb className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{insight.title}</p>
                  </div>
                  {insight.action && (
                    <Button variant="ghost" size="sm" className="shrink-0">
                      {insight.action}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent PRs */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-medium">Recent Pull Requests</CardTitle>
              <Link href="/dashboard/repos">
                <Button variant="ghost" size="sm" className="gap-1">
                  All PRs <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {metrics.recentPRs.map((pr) => (
                  <div 
                    key={pr.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <GitPullRequest className={`h-5 w-5 shrink-0 ${
                      pr.status === 'merged' ? 'text-purple-600' :
                      pr.status === 'open' ? 'text-emerald-600' :
                      'text-amber-600'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{pr.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {pr.author} · {pr.time}
                      </p>
                    </div>
                    <Badge variant={
                      pr.status === 'merged' ? 'secondary' :
                      pr.status === 'open' ? 'success' :
                      'warning'
                    }>
                      {pr.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sticky sidebar with Top Contributors */}
        <div className="xl:col-span-1">
          <div className="sticky top-6 space-y-6">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base font-medium">Top Contributors</CardTitle>
                <Link href="/dashboard/team">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Team <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics.teamActivity.map((member, index) => (
                  <div key={member.email} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-4">{index + 1}</span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.commits} commits · {member.prs} PRs
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricItem({ 
  label, 
  value, 
  subtext 
}: { 
  label: string; 
  value: string | number; 
  subtext: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{subtext}</p>
    </div>
  );
}
