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
  ArrowRight,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRepositoryStore, useSelectedRepository } from '@/lib/stores';
import {
  useRepositorySummary,
  useActivity,
  useContributors,
  usePullRequests,
} from '@/lib/hooks';
import { RepositoryStatusDisplay, SuggestionsList } from '@/components/dashboard';
import type { RepositorySummary, ActivityItem, Contributor, PullRequest } from '@/lib/api/types';

export default function DashboardPage() {
  const selectedRepoId = useRepositoryStore((s) => s.selectedRepoId);
  const selectedRepo = useSelectedRepository();

  const { data: summary, isLoading: loadingSummary, error: summaryError, refetch } = useRepositorySummary(selectedRepoId);

  if (loadingSummary) {
    return <DashboardLoading />;
  }

  if (summaryError) {
    return <DashboardError error={(summaryError as Error).message} onRetry={() => refetch()} />;
  }

  if (!summary) {
    return <DashboardEmpty />;
  }

  if (summary.status !== 'ready') {
    return <RepositoryStatusDisplay status={summary.status} repoName={selectedRepo?.fullName || 'Repository'} />;
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <Badge variant="outline" className="font-mono text-xs">
            {selectedRepo?.fullName}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Repository insights and activity
        </p>
      </div>

      <HealthScoreCard summary={summary} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <SuggestionsList repoId={selectedRepoId!} />
          <RecentPullRequests repoId={selectedRepoId!} />
        </div>

        <div className="xl:col-span-1">
          <div className="sticky top-6 space-y-6">
            <TopContributors repoId={selectedRepoId!} />
            <RecentActivity repoId={selectedRepoId!} />
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthScoreCard({ summary }: { summary: RepositorySummary }) {
  const trend = summary.health.trend;
  const TrendIcon = trend >= 0 ? TrendingUp : TrendingDown;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-stretch">
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Repository Health</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold">{summary.health.score}</span>
                <span className="text-muted-foreground">/100</span>
                {trend !== 0 && (
                  <Badge variant={trend > 0 ? 'success' : 'destructive'} className="ml-2">
                    <TrendIcon className="h-3 w-3 mr-1" />
                    {trend > 0 ? '+' : ''}{trend}%
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${summary.health.score}%` }}
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
            value={summary.velocity.prsMerged}
            subtext="this week"
          />
          <MetricItem
            label="Commits"
            value={summary.velocity.commits}
            subtext="this week"
          />
          <MetricItem
            label="PRs Open"
            value={summary.velocity.prsOpened}
            subtext="awaiting review"
          />
          <MetricItem
            label="Avg Review Time"
            value={summary.velocity.avgReviewTime}
            subtext="time to first review"
          />
        </div>
      </div>
    </Card>
  );
}

function MetricItem({ label, value, subtext }: { label: string; value: string | number; subtext: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{subtext}</p>
    </div>
  );
}

function RecentPullRequests({ repoId }: { repoId: string }) {
  const { data, isLoading, error } = usePullRequests(repoId, { limit: 5 });

  return (
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
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground text-center py-8">Failed to load pull requests</p>
        ) : !data?.pullRequests?.length ? (
          <p className="text-sm text-muted-foreground text-center py-8">No pull requests yet</p>
        ) : (
          <div className="space-y-1">
            {data.pullRequests.map((pr) => (
              <div
                key={pr.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <GitPullRequest className={`h-5 w-5 shrink-0 ${pr.state === 'merged' ? 'text-purple-600' :
                    pr.state === 'open' ? 'text-emerald-600' :
                      'text-muted-foreground'
                  }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{pr.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {pr.author.name} · #{pr.number}
                  </p>
                </div>
                <Badge variant={
                  pr.state === 'merged' ? 'secondary' :
                    pr.state === 'open' ? 'success' :
                      'outline'
                }>
                  {pr.state}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TopContributors({ repoId }: { repoId: string }) {
  const { data, isLoading, error } = useContributors(repoId);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-medium">Top Contributors</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground text-center py-8">Failed to load contributors</p>
        ) : !data?.contributors?.length ? (
          <p className="text-sm text-muted-foreground text-center py-8">No contributors data yet</p>
        ) : (
          <div className="space-y-4">
            {data.contributors.slice(0, 5).map((member, index) => (
              <div key={member.id} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-4">{index + 1}</span>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatar || undefined} />
                  <AvatarFallback className="text-xs">
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.commits} commits · {member.prsOpened} PRs
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivity({ repoId }: { repoId: string }) {
  const { data, isLoading, error } = useActivity(repoId, { limit: 5 });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground text-center py-8">Failed to load activity</p>
        ) : !data?.activity?.length ? (
          <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
        ) : (
          <div className="space-y-3">
            {data.activity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className={`mt-1 ${item.type.includes('pr') ? 'text-purple-600' : 'text-blue-600'
                  }`}>
                  {item.type.includes('pr') ? (
                    <GitPullRequest className="h-4 w-4" />
                  ) : (
                    <GitCommit className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.author.name} · {formatTimeAgo(item.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  );
}

function DashboardError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Failed to Load Dashboard</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardEmpty() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-muted-foreground">No repository data available</p>
    </div>
  );
}

function formatTimeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
