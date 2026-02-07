import type {
    GitHubStatus,
    Repository,
    RepositorySummary,
    AISuggestion,
    ActivityItem,
    Contributor,
    PullRequest,
} from './types';

class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(endpoint, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(
            data.error || 'An error occurred',
            response.status,
            data.code
        );
    }

    return data;
}

// GitHub Status
export async function getGitHubStatus(): Promise<GitHubStatus> {
    return fetchApi<GitHubStatus>('/api/github/status');
}

export async function disconnectGitHub(): Promise<void> {
    await fetchApi('/api/github/status', { method: 'DELETE' });
}

// Repositories
export async function getAvailableRepos(): Promise<{
    repos: Repository[];
    total: number;
}> {
    return fetchApi('/api/github/repos');
}

export async function connectRepository(repo: {
    repoId: string | number;
    repoName: string;
    fullName: string;
    description?: string;
    language?: string;
    isPrivate?: boolean;
    defaultBranch?: string;
}): Promise<{ repository: Repository }> {
    return fetchApi('/api/github/repos', {
        method: 'POST',
        body: JSON.stringify(repo),
    });
}

export async function getConnectedRepos(): Promise<{
    repos: Repository[];
}> {
    return fetchApi('/api/repos');
}

export async function getRepositorySummary(
    repoId: string
): Promise<RepositorySummary> {
    return fetchApi(`/api/repos/${repoId}/summary`);
}

export async function getRepositoryHealth(
    repoId: string
): Promise<{
    score: number;
    trend: number;
    factors: { name: string; score: number; weight: number }[];
}> {
    return fetchApi(`/api/repos/${repoId}/health`);
}

// Suggestions
export async function getSuggestions(
    repoId: string,
    options?: {
        status?: 'pending' | 'accepted' | 'rejected' | 'all';
        limit?: number;
    }
): Promise<{ suggestions: AISuggestion[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    if (options?.limit) params.set('limit', String(options.limit));

    return fetchApi(`/api/repos/${repoId}/suggestions?${params}`);
}

export async function updateSuggestionOutcome(
    repoId: string,
    suggestionId: string,
    outcome: 'accepted' | 'rejected' | 'dismissed',
    feedback?: string
): Promise<void> {
    await fetchApi(`/api/repos/${repoId}/suggestions/${suggestionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ outcome, feedback }),
    });
}

// Activity
export async function getActivity(
    repoId: string,
    options?: { limit?: number; type?: string }
): Promise<{ activity: ActivityItem[] }> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.type) params.set('type', options.type);

    return fetchApi(`/api/repos/${repoId}/activity?${params}`);
}

// Contributors
export async function getContributors(
    repoId: string
): Promise<{ contributors: Contributor[] }> {
    return fetchApi(`/api/repos/${repoId}/contributors`);
}

// Pull Requests
export async function getPullRequests(
    repoId: string,
    options?: { state?: 'open' | 'closed' | 'all'; limit?: number }
): Promise<{ pullRequests: PullRequest[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.state) params.set('state', options.state);
    if (options?.limit) params.set('limit', String(options.limit));

    return fetchApi(`/api/repos/${repoId}/pull-requests?${params}`);
}

export { ApiError };
