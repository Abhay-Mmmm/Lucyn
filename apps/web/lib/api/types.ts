// API Response Types

export interface ApiResponse<T> {
    success?: boolean;
    error?: string;
    data?: T;
}

// GitHub Status
export interface GitHubStatus {
    connected: boolean;
    expired?: boolean;
    message?: string;
    github?: {
        username: string;
        avatarUrl: string;
        connectedAt: string;
    };
}

// Repository
export interface Repository {
    id: string;
    githubId: string;
    name: string;
    fullName: string;
    description: string | null;
    language: string | null;
    isPrivate: boolean;
    defaultBranch: string;
    updatedAt: string;
    stars?: number;
    isConnected?: boolean;
    status?: RepositoryStatus;
}

export type RepositoryStatus =
    | 'pending'
    | 'indexing'
    | 'analyzing'
    | 'ready'
    | 'error';

// Repository Summary
export interface RepositorySummary {
    id: string;
    name: string;
    fullName: string;
    status: RepositoryStatus;
    lastScanAt: string | null;
    stats: {
        totalFiles: number;
        totalLines: number;
        primaryLanguages: string[];
        frameworks: string[];
    };
    health: {
        score: number;
        trend: number;
    };
    velocity: {
        prsOpened: number;
        prsMerged: number;
        commits: number;
        avgReviewTime: string;
    };
}

// AI Suggestion
export interface AISuggestion {
    id: string;
    type: 'architecture' | 'performance' | 'security' | 'maintainability' | 'testing';
    title: string;
    explanation: string;
    whyItMatters: string | null;
    tradeoffs: string | null;
    suggestedChange: string | null;
    confidence: number;
    affectedFiles: string[];
    promptForAgents: string | null;
    createdAt: string;
    outcome: 'pending' | 'accepted' | 'rejected' | 'dismissed';
}

// Activity Item
export interface ActivityItem {
    id: string;
    type: 'pr_opened' | 'pr_merged' | 'pr_closed' | 'commit' | 'review' | 'suggestion';
    title: string;
    author: {
        name: string;
        avatar: string | null;
    };
    timestamp: string;
    metadata: Record<string, any>;
}

// Contributor
export interface Contributor {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    commits: number;
    prsOpened: number;
    prsMerged: number;
    reviewsGiven: number;
}

// Pull Request
export interface PullRequest {
    id: string;
    number: number;
    title: string;
    state: 'open' | 'closed' | 'merged';
    author: {
        name: string;
        avatar: string | null;
    };
    createdAt: string;
    updatedAt: string;
    reviewers: {
        id: string;
        name: string;
        avatar: string | null;
    }[];
    suggestionsCount: number;
}
