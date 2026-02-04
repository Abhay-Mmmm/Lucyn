'use client';

import { useState } from 'react';
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
  Users,
  GitPullRequest,
  Brain
} from 'lucide-react';

// Premium insights data with AI-generated content
const insights = [
  {
    id: '1',
    type: 'velocity',
    priority: 'high',
    title: 'Sprint velocity up 23% this week',
    description: 'Your team completed 47 story points vs 38 last week. The lucyn-web repository saw the most activity with 156 commits.',
    recommendation: 'Document what made this sprint successful—fewer meetings? Better task breakdown? Share learnings in your next retro.',
    impact: 'Team productivity',
    timestamp: '2 hours ago',
    isNew: true,
    metrics: {
      before: 38,
      after: 47,
      unit: 'story points',
    },
  },
  {
    id: '2',
    type: 'risk',
    priority: 'critical',
    title: 'Marcus is approaching burnout risk',
    description: 'Marcus Johnson has worked 12+ hour days for 8 of the last 10 workdays, with 2.8x the average commit load. This pattern historically precedes burnout.',
    recommendation: 'Consider a 1:1 to discuss workload. Redistribute the authentication refactor to James or Elena.',
    impact: 'Team health',
    timestamp: '4 hours ago',
    isNew: true,
    metrics: {
      before: 100,
      after: 280,
      unit: '% workload',
    },
  },
  {
    id: '3',
    type: 'quality',
    priority: 'medium',
    title: 'PR review time improved by 42%',
    description: 'Average time to first review dropped from 6.2 hours to 3.6 hours this week. Sarah Chen led the improvement with 12 same-day reviews.',
    recommendation: 'Consider implementing a review rotation or pairing junior devs with Sarah for knowledge transfer.',
    impact: 'Code quality',
    timestamp: '6 hours ago',
    isNew: false,
    metrics: {
      before: 6.2,
      after: 3.6,
      unit: 'hours',
    },
  },
  {
    id: '4',
    type: 'opportunity',
    priority: 'medium',
    title: 'Large PRs slowing down reviews',
    description: '4 PRs this week exceeded 500 lines. These PRs took 3x longer to review and had 2x more revision cycles than smaller PRs.',
    recommendation: 'Encourage the team to break changes into smaller, focused PRs. Consider setting a soft limit of 400 lines.',
    impact: 'Delivery speed',
    timestamp: '1 day ago',
    isNew: false,
    metrics: {
      before: 500,
      after: 400,
      unit: 'max lines',
    },
  },
  {
    id: '5',
    type: 'positive',
    priority: 'low',
    title: 'Test coverage increased to 78%',
    description: 'Up from 72% last month. The API team added 34 new integration tests for the authentication module.',
    recommendation: 'Celebrate this win! Consider setting a team goal of 85% coverage by end of quarter.',
    impact: 'Code quality',
    timestamp: '2 days ago',
    isNew: false,
    metrics: {
      before: 72,
      after: 78,
      unit: '% coverage',
    },
  },
];

const typeConfig = {
  velocity: {
    icon: TrendingUp,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    label: 'Velocity',
  },
  risk: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-800',
    label: 'Risk Alert',
  },
  quality: {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    border: 'border-emerald-200 dark:border-emerald-800',
    label: 'Quality',
  },
  opportunity: {
    icon: Lightbulb,
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950',
    border: 'border-purple-200 dark:border-purple-800',
    label: 'Opportunity',
  },
  positive: {
    icon: Zap,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-200 dark:border-green-800',
    label: 'Win',
  },
};

const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

export default function InsightsPage() {
  const [filter, setFilter] = useState<string>('all');
  
  const filteredInsights = filter === 'all' 
    ? insights 
    : insights.filter(i => i.type === filter);
    
  const sortedInsights = [...filteredInsights].sort(
    (a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
  );
  
  const newCount = insights.filter(i => i.isNew).length;
  const criticalCount = insights.filter(i => i.priority === 'critical').length;

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
            {newCount} new insights based on your team's recent activity
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Configure Alerts
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard 
          label="New Insights" 
          value={newCount}
          icon={<Brain className="w-4 h-4" />}
          trend="this week"
        />
        <QuickStatCard 
          label="Critical Alerts" 
          value={criticalCount}
          icon={<AlertTriangle className="w-4 h-4" />}
          highlight={criticalCount > 0}
        />
        <QuickStatCard 
          label="Team Health" 
          value="82%"
          icon={<Users className="w-4 h-4" />}
          trend="+5% from last week"
        />
        <QuickStatCard 
          label="Avg PR Time" 
          value="3.6h"
          icon={<GitPullRequest className="w-4 h-4" />}
          trend="-42% improvement"
          positive
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Insights', count: insights.length },
          { key: 'risk', label: 'Risk Alerts', count: insights.filter(i => i.type === 'risk').length },
          { key: 'velocity', label: 'Velocity', count: insights.filter(i => i.type === 'velocity').length },
          { key: 'quality', label: 'Quality', count: insights.filter(i => i.type === 'quality').length },
          { key: 'opportunity', label: 'Opportunities', count: insights.filter(i => i.type === 'opportunity').length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm rounded-full border transition-colors ${
              filter === tab.key 
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
      <div className="space-y-4">
        {sortedInsights.map((insight) => {
          const config = typeConfig[insight.type as keyof typeof typeConfig];
          const Icon = config.icon;
          
          return (
            <Card 
              key={insight.id} 
              className={`surface-elevated overflow-hidden transition-all hover:border-foreground/20 ${
                insight.priority === 'critical' ? 'ring-1 ring-amber-300 dark:ring-amber-700' : ''
              }`}
            >
              <CardContent className="p-0">
                <div className="flex">
                  {/* Color Strip */}
                  <div className={`w-1 ${config.bg}`} />
                  
                  <div className="flex-1 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Main Content */}
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
                              {insight.isNew && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded bg-foreground text-background">
                                  New
                                </span>
                              )}
                              {insight.priority === 'critical' && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">
                                  Requires Attention
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {insight.timestamp}
                              </span>
                            </div>
                            <h3 className="font-semibold text-lg mt-2">{insight.title}</h3>
                            <p className="text-muted-foreground mt-1 leading-relaxed">
                              {insight.description}
                            </p>
                          </div>
                        </div>

                        {/* Recommendation */}
                        <div className="ml-11 mt-4 p-4 bg-muted/50 rounded-lg border border-border/50">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium mb-1">Recommendation</p>
                              <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Metrics Card */}
                      {insight.metrics && (
                        <div className="lg:w-48 p-4 bg-muted/30 rounded-lg shrink-0">
                          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Impact</p>
                          <div className="flex items-end gap-2">
                            <span className="text-2xl font-semibold tabular-nums">
                              {insight.metrics.after}
                            </span>
                            <span className="text-sm text-muted-foreground mb-1">
                              {insight.metrics.unit}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            from {insight.metrics.before} {insight.metrics.unit}
                          </p>
                          <Button variant="ghost" size="sm" className="mt-3 w-full justify-between text-xs h-8">
                            View Details
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
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
  icon: React.ReactNode;
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
