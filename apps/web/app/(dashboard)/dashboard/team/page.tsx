'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  GitCommit,
  GitPullRequest,
  Loader2,
  Users,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useRepositoryStore, useSelectedRepository } from '@/lib/stores';
import { useContributors } from '@/lib/hooks';

export default function TeamPage() {
  const [search, setSearch] = useState('');
  const selectedRepoId = useRepositoryStore((s) => s.selectedRepoId);
  const selectedRepo = useSelectedRepository();

  const { data, isLoading, error, refetch, isFetching } = useContributors(selectedRepoId);

  const contributors = data?.contributors ?? [];
  const filteredContributors = contributors.filter(
    (member) =>
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalCommits = contributors.reduce((a, b) => a + b.commits, 0);
  const totalPRs = contributors.reduce((a, b) => a + b.prsOpened, 0);
  const avgCommits = contributors.length > 0 ? (totalCommits / contributors.length).toFixed(1) : '0';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Contributors</h1>
            {selectedRepo && (
              <Badge variant="outline" className="font-mono text-xs">
                {selectedRepo.fullName}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Repository contributors and their activity
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Contributors" value={contributors.length} />
        <StatCard label="Total Commits" value={totalCommits} />
        <StatCard label="Total PRs" value={totalPRs} />
        <StatCard label="Avg Commits" value={avgCommits} />
      </div>

      {error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Failed to load contributors</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : contributors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No contributors yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Contributor data will appear after the repository is analyzed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search contributors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Contributors list */}
          <div className="grid gap-4">
            {filteredContributors.map((member, index) => (
              <Card key={member.id} className="overflow-hidden">
                <div className="flex items-center p-6 gap-6">
                  <span className="text-lg font-medium text-muted-foreground w-6">
                    {index + 1}
                  </span>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar || undefined} />
                    <AvatarFallback>
                      {member.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium">{member.name}</h3>
                    {member.email && (
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    )}
                  </div>

                  <div className="hidden lg:flex items-center gap-8">
                    <MetricItem
                      icon={<GitCommit className="h-4 w-4" />}
                      value={member.commits}
                      label="commits"
                    />
                    <MetricItem
                      icon={<GitPullRequest className="h-4 w-4" />}
                      value={member.prsOpened}
                      label="PRs"
                    />
                  </div>

                  <div className="hidden md:block w-32">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Contribution</span>
                      <span>{totalCommits > 0 ? Math.round((member.commits / totalCommits) * 100) : 0}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${totalCommits > 0 ? (member.commits / totalCommits) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {filteredContributors.length === 0 && search && (
              <div className="text-center py-12 text-muted-foreground">
                No contributors found matching "{search}"
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-semibold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

function MetricItem({
  icon,
  value,
  label
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span className="font-medium">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
