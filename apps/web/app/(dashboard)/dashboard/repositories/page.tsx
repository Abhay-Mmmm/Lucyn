'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Plus,
  RefreshCw,
  GitBranch,
  GitPullRequest,
  Lock,
  Globe,
  Loader2,
  AlertCircle,
  Check,
  FolderGit2,
} from 'lucide-react';
import { useRepositoryStore, useSelectedRepository } from '@/lib/stores';
import { useConnectedRepos, useAvailableRepos, useConnectRepository } from '@/lib/hooks';
import type { Repository } from '@/lib/api/types';

const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  Java: '#b07219',
  Ruby: '#701516',
  PHP: '#4F5D95',
  'C#': '#178600',
  'C++': '#f34b7d',
  C: '#555555',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
};

export default function RepositoriesPage() {
  const [search, setSearch] = useState('');
  const [showConnect, setShowConnect] = useState(false);

  const { data: connectedData, isLoading, error, refetch, isFetching } = useConnectedRepos();
  const selectedRepoId = useRepositoryStore((s) => s.selectedRepoId);
  const selectRepository = useRepositoryStore((s) => s.selectRepository);

  const repositories = connectedData?.repos ?? [];
  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(search.toLowerCase()) ||
    (repo.description?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (repo.language?.toLowerCase() || '').includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground mt-1">
            {repositories.length} connected {repositories.length === 1 ? 'repository' : 'repositories'}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowConnect(!showConnect)}>
          <Plus className="w-4 h-4" />
          Connect Repository
        </Button>
      </div>

      {showConnect && <ConnectRepositorySection onClose={() => setShowConnect(false)} />}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Repositories"
          value={repositories.length}
          icon={<GitBranch className="w-4 h-4" />}
        />
        <StatCard
          label="Ready"
          value={repositories.filter(r => r.status === 'ready').length}
          icon={<Check className="w-4 h-4" />}
        />
        <StatCard
          label="Analyzing"
          value={repositories.filter(r => r.status === 'analyzing' || r.status === 'indexing').length}
          icon={<Loader2 className="w-4 h-4" />}
        />
        <StatCard
          label="Pending"
          value={repositories.filter(r => r.status === 'pending').length}
          icon={<AlertCircle className="w-4 h-4" />}
        />
      </div>

      {error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Failed to load repositories</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : repositories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderGit2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No repositories connected</p>
            <p className="text-sm text-muted-foreground mt-1">
              Connect a repository to start getting AI-powered insights.
            </p>
            <Button className="mt-4" onClick={() => setShowConnect(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Connect Repository
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Repository List */}
          <div className="space-y-3">
            {filteredRepos.map((repo) => (
              <Card
                key={repo.id}
                className={`surface-elevated overflow-hidden group hover:border-foreground/20 transition-colors cursor-pointer ${selectedRepoId === repo.id ? 'ring-2 ring-primary' : ''
                  }`}
                onClick={() => selectRepository(repo.id)}
              >
                <CardContent className="p-0">
                  <div className="p-6 flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg truncate group-hover:text-foreground transition-colors">
                          {repo.name}
                        </h3>
                        {repo.language && (
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: languageColors[repo.language] || '#666' }}
                            />
                            <span className="text-sm text-muted-foreground">{repo.language}</span>
                          </div>
                        )}
                        {repo.isPrivate ? (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            <Lock className="w-3 h-3" />
                            Private
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            <Globe className="w-3 h-3" />
                            Public
                          </span>
                        )}
                        <StatusBadge status={repo.status} />
                      </div>
                      {repo.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                          {repo.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {repo.fullName}
                      </p>
                    </div>

                    {/* Selection Indicator */}
                    <div className="flex items-center gap-4">
                      {selectedRepoId === repo.id && (
                        <Badge variant="default">Selected</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs gap-1.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectRepository(repo.id);
                          window.location.href = '/dashboard';
                        }}
                      >
                        <GitPullRequest className="w-3.5 h-3.5" />
                        View Dashboard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredRepos.length === 0 && search && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium mb-1">No repositories found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search terms
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ConnectRepositorySection({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState('');
  const { data, isLoading, refetch } = useAvailableRepos();
  const connectMutation = useConnectRepository();
  const selectRepository = useRepositoryStore((s) => s.selectRepository);

  const availableRepos = data?.repos ?? [];
  const filteredRepos = availableRepos.filter((repo) =>
    repo.fullName.toLowerCase().includes(search.toLowerCase())
  ).filter(repo => !repo.isConnected);

  const handleConnect = async (repo: Repository) => {
    try {
      const result = await connectMutation.mutateAsync({
        repoId: repo.githubId || repo.id,
        repoName: repo.name,
        fullName: repo.fullName,
        description: repo.description || undefined,
        language: repo.language || undefined,
        isPrivate: repo.isPrivate,
        defaultBranch: repo.defaultBranch,
      });
      selectRepository(result.repository.id);
      onClose();
    } catch (e) {
      console.error('Failed to connect repository:', e);
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Connect a Repository</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search available repositories..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredRepos.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {search ? 'No matching repositories found' : 'No available repositories to connect'}
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredRepos.slice(0, 10).map((repo) => (
              <div
                key={repo.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {repo.isPrivate ? (
                    <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{repo.fullName}</p>
                    {repo.description && (
                      <p className="text-xs text-muted-foreground truncate">{repo.description}</p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleConnect(repo)}
                  disabled={connectMutation.isPending}
                >
                  {connectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Connect'
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;

  const config = {
    ready: { label: 'Ready', variant: 'success' as const },
    indexing: { label: 'Indexing', variant: 'warning' as const },
    analyzing: { label: 'Analyzing', variant: 'warning' as const },
    pending: { label: 'Pending', variant: 'secondary' as const },
    error: { label: 'Error', variant: 'destructive' as const },
  };

  const c = config[status as keyof typeof config] || config.pending;

  return <Badge variant={c.variant}>{c.label}</Badge>;
}

function StatCard({
  label,
  value,
  icon,
  highlight = false
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? 'border-amber-200 dark:border-amber-800' : ''}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted-foreground">{icon}</span>
        </div>
        <p className={`text-3xl font-semibold tabular-nums ${highlight ? 'text-amber-600' : ''}`}>
          {value}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}
