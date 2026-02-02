import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, Plus, RefreshCw } from 'lucide-react';

// Mock repository data
const mockRepos = [
  {
    id: '1',
    name: 'frontend',
    fullName: 'company/frontend',
    description: 'Main web application',
    language: 'TypeScript',
    isPrivate: true,
    lastSynced: '2 hours ago',
    stats: {
      commits: 1250,
      prs: 89,
      contributors: 5,
    },
  },
  {
    id: '2',
    name: 'api',
    fullName: 'company/api',
    description: 'Backend REST API',
    language: 'Python',
    isPrivate: true,
    lastSynced: '1 hour ago',
    stats: {
      commits: 890,
      prs: 67,
      contributors: 4,
    },
  },
  {
    id: '3',
    name: 'infrastructure',
    fullName: 'company/infrastructure',
    description: 'Terraform and K8s configs',
    language: 'HCL',
    isPrivate: true,
    lastSynced: '30 minutes ago',
    stats: {
      commits: 234,
      prs: 23,
      contributors: 2,
    },
  },
];

const languageColors: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-yellow-500',
  Python: 'bg-green-500',
  Go: 'bg-cyan-500',
  Rust: 'bg-orange-500',
  HCL: 'bg-purple-500',
};

export default function RepositoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Repositories</h1>
          <p className="text-muted-foreground">
            Manage your connected GitHub repositories
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Connect Repository
        </Button>
      </div>

      {/* Connection Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <Github className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">GitHub Connected</h3>
              <p className="text-sm text-muted-foreground">
                Lucyn is monitoring {mockRepos.length} repositories
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Sync All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Repository List */}
      <div className="grid gap-4">
        {mockRepos.map((repo) => (
          <RepositoryCard key={repo.id} repo={repo} />
        ))}
      </div>

      {/* Empty State */}
      {mockRepos.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Github className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">No repositories connected</h3>
            <p className="text-muted-foreground mb-4">
              Connect your GitHub repositories to start getting insights
            </p>
            <Button>Connect GitHub</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RepositoryCard({ repo }: { repo: typeof mockRepos[0] }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-lg">{repo.name}</h3>
              <span className={`w-3 h-3 rounded-full ${languageColors[repo.language] || 'bg-gray-500'}`} />
              <span className="text-sm text-muted-foreground">{repo.language}</span>
              {repo.isPrivate && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded">Private</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{repo.description}</p>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-medium">{repo.stats.commits}</span>
                <span className="text-muted-foreground ml-1">commits</span>
              </div>
              <div>
                <span className="font-medium">{repo.stats.prs}</span>
                <span className="text-muted-foreground ml-1">pull requests</span>
              </div>
              <div>
                <span className="font-medium">{repo.stats.contributors}</span>
                <span className="text-muted-foreground ml-1">contributors</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Last synced</p>
            <p className="text-sm">{repo.lastSynced}</p>
            <Button variant="ghost" size="sm" className="mt-2">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
