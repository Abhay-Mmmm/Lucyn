'use client';

import { useState, type ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Zap,
  Clock,
  ArrowRight,
  Sparkles,
  Filter,
  Brain,
  Shield,
  Wrench,
  TestTube,
  Copy,
  Check,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useRepositoryStore } from '@/lib/stores';
import { useSuggestions, useRepositorySummary } from '@/lib/hooks';
import type { AISuggestion } from '@/lib/api/types';

const typeConfig = {
  architecture: {
    icon: Lightbulb,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950',
    label: 'Architecture',
  },
  performance: {
    icon: Zap,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950',
    label: 'Performance',
  },
  security: {
    icon: Shield,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-950',
    label: 'Security',
  },
  maintainability: {
    icon: Wrench,
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950',
    label: 'Maintainability',
  },
  testing: {
    icon: TestTube,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    label: 'Testing',
  },
};

export default function InsightsPage() {
  const [filter, setFilter] = useState<string>('all');
  const selectedRepoId = useRepositoryStore((s) => s.selectedRepoId);

  const { data: suggestionsData, isLoading, error, refetch, isFetching } = useSuggestions(selectedRepoId, {
    status: filter === 'all' ? 'all' : 'pending',
    limit: 50,
  });
  const { data: summaryData } = useRepositorySummary(selectedRepoId);

  const suggestions = suggestionsData?.suggestions ?? [];
  const filteredSuggestions = filter === 'all'
    ? suggestions
    : suggestions.filter(s => s.type === filter);

  const pendingCount = suggestions.filter(s => s.outcome === 'pending').length;

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
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-semibold tracking-tight">Insights</h1>
            <span className="flex items-center gap-1 text-xs font-medium bg-foreground text-background px-2 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              AI-Powered
            </span>
          </div>
          <p className="text-muted-foreground mt-1">
            {pendingCount > 0
              ? `${pendingCount} pending suggestions based on your repository analysis`
              : 'AI-generated insights and suggestions for your codebase'}
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard
          label="Total Insights"
          value={suggestionsData?.total ?? 0}
          icon={<Brain className="w-4 h-4" />}
        />
        <QuickStatCard
          label="Pending Review"
          value={pendingCount}
          icon={<AlertTriangle className="w-4 h-4" />}
          highlight={pendingCount > 0}
        />
        <QuickStatCard
          label="Health Score"
          value={summaryData?.health?.score ?? '-'}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <QuickStatCard
          label="Confidence Avg"
          value={suggestions.length > 0
            ? `${Math.round(suggestions.reduce((a, b) => a + b.confidence, 0) / suggestions.length * 100)}%`
            : '-'}
          icon={<CheckCircle className="w-4 h-4" />}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Insights', count: suggestions.length },
          { key: 'architecture', label: 'Architecture', count: suggestions.filter(s => s.type === 'architecture').length },
          { key: 'performance', label: 'Performance', count: suggestions.filter(s => s.type === 'performance').length },
          { key: 'security', label: 'Security', count: suggestions.filter(s => s.type === 'security').length },
          { key: 'maintainability', label: 'Maintainability', count: suggestions.filter(s => s.type === 'maintainability').length },
          { key: 'testing', label: 'Testing', count: suggestions.filter(s => s.type === 'testing').length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm rounded-full border transition-colors ${filter === tab.key
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-foreground border-border hover:border-foreground/30'
              }`}
          >
            {tab.label}
            <span className={`ml-2 ${filter === tab.key ? 'text-background/70' : 'text-muted-foreground'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Insights List */}
      {error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Failed to load insights</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredSuggestions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No insights yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Lucyn is continuously analyzing your repository. Insights will appear here as patterns are detected.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSuggestions.map((suggestion) => (
            <InsightCard key={suggestion.id} suggestion={suggestion} />
          ))}
        </div>
      )}
    </div>
  );
}

function InsightCard({ suggestion }: { suggestion: AISuggestion }) {
  const [copied, setCopied] = useState(false);
  const config = typeConfig[suggestion.type as keyof typeof typeConfig] || typeConfig.architecture;
  const Icon = config.icon;

  const handleCopy = async () => {
    if (suggestion.promptForAgents) {
      await navigator.clipboard.writeText(suggestion.promptForAgents);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const timeAgo = formatTimeAgo(suggestion.createdAt);

  return (
    <Card className="surface-elevated overflow-hidden transition-all hover:border-foreground/20">
      <CardContent className="p-0">
        <div className="flex">
          <div className={`w-1 ${config.bg}`} />

          <div className="flex-1 p-6">
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${config.bg}`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                      {suggestion.outcome === 'pending' && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-foreground text-background">
                          Pending
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mt-2">{suggestion.title}</h3>
                    <p className="text-muted-foreground mt-1 leading-relaxed">
                      {suggestion.explanation}
                    </p>
                  </div>
                </div>

                {suggestion.whyItMatters && (
                  <div className="ml-11 mt-4 p-4 bg-muted/50 rounded-lg border border-border/50">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium mb-1">Why This Matters</p>
                        <p className="text-sm text-muted-foreground">{suggestion.whyItMatters}</p>
                      </div>
                    </div>
                  </div>
                )}

                {suggestion.tradeoffs && (
                  <div className="ml-11 mt-3 p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium mb-1">Tradeoffs</p>
                        <p className="text-sm text-muted-foreground">{suggestion.tradeoffs}</p>
                      </div>
                    </div>
                  </div>
                )}

                {suggestion.promptForAgents && (
                  <div className="ml-11 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Prompt for AI Agents</p>
                      <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 gap-1 text-xs">
                        {copied ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
                      {suggestion.promptForAgents}
                    </pre>
                  </div>
                )}
              </div>

              <div className="lg:w-48 p-4 bg-muted/30 rounded-lg shrink-0">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Confidence</p>
                <p className="text-2xl font-semibold tabular-nums">
                  {Math.round(suggestion.confidence * 100)}%
                </p>
                {suggestion.affectedFiles.length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground mt-3 mb-1">Affected Files</p>
                    <p className="text-sm font-medium">{suggestion.affectedFiles.length}</p>
                  </>
                )}
                <Button variant="ghost" size="sm" className="mt-3 w-full justify-between text-xs h-8">
                  View Details
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickStatCard({
  label,
  value,
  icon,
  trend,
  highlight = false,
  positive = false,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  highlight?: boolean;
  positive?: boolean;
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
        {trend && (
          <p className={`text-xs mt-2 ${positive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
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
