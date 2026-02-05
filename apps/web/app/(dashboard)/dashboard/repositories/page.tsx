'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus,
  RefreshCw,
  GitBranch,
  GitPullRequest,
  Users,
  Clock,
  ArrowUpRight,
  Lock,
  Globe,
  Activity,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

// Realistic repository data
const repositories = [
  {
    id: '1',
    name: 'lucyn-web',
    fullName: 'acme-corp/lucyn-web',
    description: 'Main Next.js web application with dashboard and auth',
    language: 'TypeScript',
    languageColor: '#3178c6',
    isPrivate: true,
    status: 'healthy',
    lastActivity: '12 minutes ago',
    lastSynced: 'Just now',
    stats: {
      commits: 2847,
      openPRs: 7,
      contributors: 8,
      branches: 14,
    },
    activity: {
      today: 23,
      thisWeek: 156,
      trend: '+12%',
    },
  },
  {
    id: '2',
    name: 'lucyn-api',
    fullName: 'acme-corp/lucyn-api',
    description: 'FastAPI backend with PostgreSQL and Redis',
    language: 'Python',
    languageColor: '#3572A5',
    isPrivate: true,
    status: 'healthy',
    lastActivity: '43 minutes ago',
    lastSynced: '5 minutes ago',
    stats: {
      commits: 1923,
      openPRs: 4,
      contributors: 6,
      branches: 9,
    },
    activity: {
      today: 15,
      thisWeek: 89,
      trend: '+8%',
    },
  },
  {
    id: '3',
    name: 'lucyn-ml',
    fullName: 'acme-corp/lucyn-ml',
    description: 'Machine learning models and training pipelines',
    language: 'Python',
    languageColor: '#3572A5',
    isPrivate: true,
    status: 'needs-attention',
    lastActivity: '3 hours ago',
    lastSynced: '10 minutes ago',
    stats: {
      commits: 456,
      openPRs: 2,
      contributors: 3,
      branches: 5,
    },
    activity: {
      today: 2,
      thisWeek: 18,
      trend: '-15%',
    },
  },
  {
    id: '4',
    name: 'lucyn-infra',
    fullName: 'acme-corp/lucyn-infra',
    description: 'Terraform, Kubernetes configs, and CI/CD pipelines',
    language: 'HCL',
    languageColor: '#7B42BC',
    isPrivate: true,
    status: 'healthy',
    lastActivity: '1 day ago',
    lastSynced: '15 minutes ago',
    stats: {
      commits: 312,
      openPRs: 1,
      contributors: 2,
      branches: 3,
    },
    activity: {
      today: 0,
      thisWeek: 8,
      trend: '0%',
    },
  },
  {
    id: '5',
    name: 'lucyn-docs',
    fullName: 'acme-corp/lucyn-docs',
    description: 'Product documentation and API reference',
    language: 'MDX',
    languageColor: '#fcb32c',
    isPrivate: false,
    status: 'healthy',
    lastActivity: '2 days ago',
    lastSynced: '1 hour ago',
    stats: {
      commits: 178,
      openPRs: 0,
      contributors: 4,
      branches: 2,
    },
    activity: {
      today: 0,
      thisWeek: 3,
      trend: '-5%',
    },
  },
];

export default function RepositoriesPage() {
  const [search, setSearch] = useState('');
  
  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(search.toLowerCase()) ||
    repo.description.toLowerCase().includes(search.toLowerCase()) ||
    repo.language.toLowerCase().includes(search.toLowerCase())
  );
  
  const totalCommits = repositories.reduce((acc, r) => acc + r.stats.commits, 0);
  const totalPRs = repositories.reduce((acc, r) => acc + r.stats.openPRs, 0);
  const totalContributors = new Set(repositories.flatMap(r => Array(r.stats.contributors).fill(0))).size || 
    Math.max(...repositories.map(r => r.stats.contributors)) + 3;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground mt-1">
            {repositories.length} connected repositories being monitored
          </p>
        </div>
        <Button className="gap-2 bg-foreground text-background hover:bg-foreground/90">
          <Plus className="w-4 h-4" />
          Connect Repository
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Repositories" 
          value={repositories.length} 
          icon={<GitBranch className="w-4 h-4" />}
        />
        <StatCard 
          label="Total Commits" 
          value={totalCommits.toLocaleString()} 
          icon={<Activity className="w-4 h-4" />}
        />
        <StatCard 
          label="Open PRs" 
          value={totalPRs} 
          icon={<GitPullRequest className="w-4 h-4" />}
          highlight={totalPRs > 10}
        />
        <StatCard 
          label="Contributors" 
          value={totalContributors} 
          icon={<Users className="w-4 h-4" />}
        />
      </div>

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
        <Button variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Sync All
        </Button>
      </div>

      {/* Repository List */}
      <div className="space-y-3">
        {filteredRepos.map((repo) => (
          <Card 
            key={repo.id} 
            className="surface-elevated overflow-hidden group hover:border-foreground/20 transition-colors cursor-pointer"
          >
            <CardContent className="p-0">
              <div className="p-6 flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg truncate group-hover:text-foreground transition-colors">
                      {repo.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: repo.languageColor }}
                      />
                      <span className="text-sm text-muted-foreground">{repo.language}</span>
                    </div>
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
                    {repo.status === 'needs-attention' && (
                      <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400 px-2 py-0.5 rounded">
                        <AlertCircle className="w-3 h-3" />
                        Needs Attention
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                    {repo.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <MetricItem 
                      icon={<GitBranch className="w-3.5 h-3.5" />}
                      value={repo.stats.branches}
                      label="branches"
                    />
                    <MetricItem 
                      icon={<GitPullRequest className="w-3.5 h-3.5" />}
                      value={repo.stats.openPRs}
                      label="open PRs"
                    />
                    <MetricItem 
                      icon={<Users className="w-3.5 h-3.5" />}
                      value={repo.stats.contributors}
                      label="contributors"
                    />
                  </div>
                </div>

                {/* Activity and Last Synced */}
                <div className="flex items-center gap-6 lg:gap-8">
                  {/* Activity This Week */}
                  <div className="text-right">
                    <p className="text-2xl font-semibold tabular-nums">{repo.activity.thisWeek}</p>
                    <p className="text-xs text-muted-foreground">commits this week</p>
                    <div className={`flex items-center justify-end gap-1 text-xs mt-1 ${
                      repo.activity.trend.startsWith('+') ? 'text-emerald-600' : 
                      repo.activity.trend.startsWith('-') ? 'text-rose-600' : 'text-muted-foreground'
                    }`}>
                      <TrendingUp className="w-3 h-3" />
                      {repo.activity.trend}
                    </div>
                  </div>

                  {/* Sync Info */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Synced {repo.lastSynced}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-3 text-xs gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      View Details
                    </Button>
                  </div>
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
    </div>
  );
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
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {icon}
      <span className="font-medium text-foreground">{value}</span>
      <span>{label}</span>
    </div>
  );
}
