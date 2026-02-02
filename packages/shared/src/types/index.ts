// ============================================
// Dashboard Types
// ============================================

export interface HealthOverview {
  overallScore: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
  highlights: string[];
  concerns: string[];
}

export interface VelocityMetrics {
  prsPerWeek: {
    current: number;
    previous: number;
    trend: number; // percentage change
  };
  commitsPerDay: {
    current: number;
    previous: number;
    trend: number;
  };
  avgMergeTime: {
    current: number; // hours
    previous: number;
    trend: number;
  };
  reviewTurnaround: {
    current: number; // hours
    previous: number;
    trend: number;
  };
}

export interface RiskIndicators {
  burnoutRisk: {
    developers: Array<{
      id: string;
      name: string;
      riskLevel: 'low' | 'medium' | 'high';
      indicators: string[];
    }>;
  };
  bottlenecks: {
    items: Array<{
      type: 'pr' | 'review' | 'deployment';
      description: string;
      impact: 'low' | 'medium' | 'high';
    }>;
  };
  techDebt: {
    score: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    hotspots: string[];
  };
}

export interface TeamDistribution {
  workloadBalance: {
    distribution: Array<{
      userId: string;
      name: string;
      workload: number; // percentage
      status: 'underutilized' | 'balanced' | 'overloaded';
    }>;
    giniCoefficient: number; // 0-1, lower is more equal
  };
  skillCoverage: {
    skills: Array<{
      skill: string;
      coverage: number; // number of developers
      proficiency: number; // average 1-10
    }>;
    gaps: string[];
  };
}

// ============================================
// Developer Types
// ============================================

export interface DeveloperStats {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  commits: {
    total: number;
    thisWeek: number;
    avgPerDay: number;
  };
  pullRequests: {
    opened: number;
    merged: number;
    reviewed: number;
    avgMergeTime: number; // hours
  };
  codeQuality: {
    score: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  collaboration: {
    reviewsGiven: number;
    commentsWritten: number;
    helpfulnessScore: number;
  };
}

// ============================================
// Task Types
// ============================================

export interface TaskAssignmentSuggestion {
  taskId: string;
  suggestedAssignee: {
    id: string;
    name: string;
    confidence: number; // 0-1
  };
  alternativeAssignees: Array<{
    id: string;
    name: string;
    confidence: number;
  }>;
  reasoning: string;
  factors: {
    skillMatch: number;
    availability: number;
    historicalSuccess: number;
    growthOpportunity: number;
  };
}

// ============================================
// Insight Types
// ============================================

export interface InsightData {
  id: string;
  type: 'velocity' | 'quality' | 'health' | 'risk' | 'opportunity' | 'recommendation';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  recommendation?: string;
  data?: Record<string, unknown>;
  createdAt: Date;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// GitHub Types
// ============================================

export interface GitHubWebhookPayload {
  action?: string;
  repository?: {
    id: number;
    full_name: string;
    name: string;
  };
  sender?: {
    id: number;
    login: string;
  };
  installation?: {
    id: number;
  };
}

export interface GitHubCommitPayload {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    username?: string;
  };
  timestamp: string;
  added: string[];
  removed: string[];
  modified: string[];
}

// ============================================
// Slack Types
// ============================================

export interface SlackEventPayload {
  type: string;
  challenge?: string;
  event?: {
    type: string;
    user?: string;
    channel?: string;
    text?: string;
    ts?: string;
  };
}

export interface SlackMessage {
  channel: string;
  text?: string;
  blocks?: SlackBlock[];
  thread_ts?: string;
}

export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
  elements?: SlackBlockElement[];
}

export interface SlackBlockElement {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  action_id?: string;
  value?: string;
}
