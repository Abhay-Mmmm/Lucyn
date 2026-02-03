import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  GitPullRequest, 
  GitCommit, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

// Mock data - will be replaced with real API calls
const mockStats = {
  healthScore: 78,
  healthTrend: 'improving',
  prsThisWeek: 24,
  prsTrend: 12,
  commitsThisWeek: 156,
  commitsTrend: -5,
  avgMergeTime: 4.2,
  mergeTimeTrend: -15,
  activeDevs: 8,
  burnoutRisks: 1,
};

const mockInsights = [
  {
    id: '1',
    type: 'opportunity',
    severity: 'info',
    title: 'PR velocity is increasing',
    description: 'Team merged 12% more PRs this week. Great momentum!',
  },
  {
    id: '2',
    type: 'risk',
    severity: 'warning',
    title: 'One team member may be overloaded',
    description: 'Alex has 3x the average workload. Consider rebalancing tasks.',
  },
  {
    id: '3',
    type: 'recommendation',
    severity: 'info',
    title: 'Connect Discord for better insights',
    description: 'Enable Discord integration to provide personalized developer feedback.',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Engineering Overview</h1>
        <p className="text-muted-foreground">
          Real-time insights into your team&apos;s performance
        </p>
      </div>

      {/* Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Engineering Health Score
            {mockStats.healthTrend === 'improving' ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </CardTitle>
          <CardDescription>
            Overall team performance based on velocity, quality, and collaboration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-5xl font-bold">{mockStats.healthScore}</div>
            <div className="flex-1">
              <Progress value={mockStats.healthScore} className="h-3" />
            </div>
            <div className="text-sm text-muted-foreground">/ 100</div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="PRs This Week"
          value={mockStats.prsThisWeek}
          trend={mockStats.prsTrend}
          icon={<GitPullRequest className="w-5 h-5" />}
        />
        <MetricCard
          title="Commits This Week"
          value={mockStats.commitsThisWeek}
          trend={mockStats.commitsTrend}
          icon={<GitCommit className="w-5 h-5" />}
        />
        <MetricCard
          title="Avg Merge Time"
          value={`${mockStats.avgMergeTime}h`}
          trend={mockStats.mergeTimeTrend}
          icon={<Clock className="w-5 h-5" />}
          invertTrend
        />
        <MetricCard
          title="Active Developers"
          value={mockStats.activeDevs}
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Insights</CardTitle>
          <CardDescription>
            AI-generated observations and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  trend,
  icon,
  invertTrend = false,
}: {
  title: string;
  value: string | number;
  trend?: number;
  icon: React.ReactNode;
  invertTrend?: boolean;
}) {
  const isPositive = invertTrend ? (trend ?? 0) < 0 : (trend ?? 0) > 0;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground">{icon}</div>
          {trend !== undefined && (
            <div className={`flex items-center text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="mt-2">
          <div className="text-3xl font-bold">{value}</div>
          <div className="text-sm text-muted-foreground">{title}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function InsightCard({ insight }: { insight: typeof mockInsights[0] }) {
  const icons = {
    opportunity: <CheckCircle className="w-5 h-5 text-green-500" />,
    risk: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    recommendation: <TrendingUp className="w-5 h-5 text-blue-500" />,
  };

  return (
    <div className="flex gap-4 p-4 border rounded-lg">
      <div>{icons[insight.type as keyof typeof icons]}</div>
      <div>
        <h4 className="font-medium">{insight.title}</h4>
        <p className="text-sm text-muted-foreground">{insight.description}</p>
      </div>
    </div>
  );
}
