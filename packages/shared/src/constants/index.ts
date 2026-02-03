// Application constants
export const APP_NAME = 'Lucyn';
export const APP_TAGLINE = 'The AI Product Engineer that works inside your company';

// Feature flags
export const FEATURES = {
  GITHUB_INTEGRATION: true,
  DISCORD_INTEGRATION: true,
  MEETING_INTEGRATION: false, // Phase 2
  TASK_AUTOMATION: false, // Phase 2
} as const;

// Rate limiting
export const RATE_LIMITS = {
  API_REQUESTS_PER_MINUTE: 60,
  WEBHOOK_REQUESTS_PER_MINUTE: 100,
  AI_REQUESTS_PER_HOUR: 100,
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Score thresholds
export const THRESHOLDS = {
  BURNOUT_RISK: {
    LOW: 0.3,
    MEDIUM: 0.6,
    HIGH: 0.8,
  },
  CODE_QUALITY: {
    POOR: 4,
    FAIR: 6,
    GOOD: 8,
    EXCELLENT: 9,
  },
  WORKLOAD: {
    UNDERUTILIZED: 0.3,
    BALANCED_MIN: 0.4,
    BALANCED_MAX: 0.7,
    OVERLOADED: 0.8,
  },
} as const;

// Time constants (in milliseconds)
export const TIME = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

// GitHub events to handle
export const GITHUB_EVENTS = [
  'installation.created',
  'installation.deleted',
  'push',
  'pull_request.opened',
  'pull_request.closed',
  'pull_request.merged',
  'pull_request.synchronize',
  'pull_request_review.submitted',
  'pull_request_review_comment.created',
  'repository.created',
  'repository.deleted',
] as const;

// Discord event types
export const DISCORD_EVENTS = [
  'INTERACTION_CREATE',
  'MESSAGE_CREATE',
  'GUILD_CREATE',
  'READY',
] as const;

// Insight types
export const INSIGHT_TYPES = {
  VELOCITY: 'velocity',
  QUALITY: 'quality',
  HEALTH: 'health',
  RISK: 'risk',
  OPPORTUNITY: 'opportunity',
  RECOMMENDATION: 'recommendation',
} as const;

// Task priorities
export const TASK_PRIORITIES = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4,
} as const;

// Error codes
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  GITHUB_ERROR: 'GITHUB_ERROR',
  DISCORD_ERROR: 'DISCORD_ERROR',
  AI_ERROR: 'AI_ERROR',
} as const;
