// packages/github/src/types.ts
// Shared types for GitHub integration

export interface GitHubAppConfig {
    appId: string;
    privateKey: string;
    clientId?: string;
    clientSecret?: string;
    webhookSecret?: string;
}

export interface RepositoryInfo {
    id: number;
    nodeId: string;
    name: string;
    fullName: string;
    owner: string;
    defaultBranch: string;
    description: string | null;
    language: string | null;
    isPrivate: boolean;
    createdAt: string;
    updatedAt: string;
    pushedAt: string;
}

export interface FileInfo {
    path: string;
    name: string;
    type: 'file' | 'dir' | 'submodule' | 'symlink';
    size: number;
    sha: string;
    url: string;
}

export interface FileContent {
    path: string;
    content: string;
    encoding: 'utf-8' | 'base64';
    size: number;
    sha: string;
}

export interface DirectoryInfo {
    path: string;
    responsibility?: string;
    files: string[];
    subdirectories: string[];
    primaryLanguage?: string;
    exports?: string[];
}

export interface LanguageDetection {
    primary: string;
    all: Array<{ language: string; percentage: number }>;
}

export interface FrameworkDetection {
    frameworks: string[];
    buildTools: string[];
    testingFrameworks: string[];
    packageManager?: string;
}

export interface CommitInfo {
    sha: string;
    message: string;
    author: {
        name: string;
        email: string;
        date: string;
    };
    committer: {
        name: string;
        email: string;
        date: string;
    };
    additions?: number;
    deletions?: number;
    changedFiles?: number;
}

export interface PullRequestInfo {
    id: number;
    nodeId: string;
    number: number;
    title: string;
    body: string | null;
    state: 'open' | 'closed';
    draft: boolean;
    merged: boolean;
    author: {
        login: string;
        id: number;
    };
    base: {
        ref: string;
        sha: string;
    };
    head: {
        ref: string;
        sha: string;
    };
    additions: number;
    deletions: number;
    changedFiles: number;
    labels: string[];
    createdAt: string;
    updatedAt: string;
    mergedAt: string | null;
    closedAt: string | null;
}

export interface DiffFile {
    filename: string;
    status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
    previousFilename?: string;
}

export interface IngestionProgress {
    phase: 'scanning' | 'analyzing' | 'embedding' | 'summarizing' | 'complete';
    totalFiles: number;
    processedFiles: number;
    currentFile?: string;
    errors: Array<{ file: string; error: string }>;
}

export interface IngestionResult {
    repositoryId: string;
    filesProcessed: number;
    embeddingsCreated: number;
    languagesDetected: string[];
    frameworksDetected: string[];
    patternsIdentified: number;
    summary: string;
    errors: Array<{ file: string; error: string }>;
}

// Webhook event types
export type WebhookEventName =
    | 'installation'
    | 'installation_repositories'
    | 'push'
    | 'pull_request'
    | 'pull_request_review'
    | 'pull_request_review_comment'
    | 'issue_comment';

export interface WebhookPayload {
    action?: string;
    installation?: {
        id: number;
        account: {
            login: string;
            id: number;
            type: 'User' | 'Organization';
        };
    };
    repository?: {
        id: number;
        node_id: string;
        name: string;
        full_name: string;
        private: boolean;
        owner: {
            login: string;
            id: number;
        };
        default_branch: string;
    };
    sender?: {
        login: string;
        id: number;
    };
}

export interface InstallationPayload extends WebhookPayload {
    action: 'created' | 'deleted' | 'suspend' | 'unsuspend' | 'new_permissions_accepted';
    repositories?: Array<{
        id: number;
        node_id: string;
        name: string;
        full_name: string;
        private: boolean;
    }>;
}

export interface PushPayload extends WebhookPayload {
    ref: string;
    before: string;
    after: string;
    created: boolean;
    deleted: boolean;
    forced: boolean;
    commits: Array<{
        id: string;
        message: string;
        timestamp: string;
        author: {
            name: string;
            email: string;
        };
        added: string[];
        removed: string[];
        modified: string[];
    }>;
    head_commit: {
        id: string;
        message: string;
        timestamp: string;
        author: {
            name: string;
            email: string;
        };
    } | null;
    pusher: {
        name: string;
        email: string;
    };
}

export interface PullRequestPayload extends WebhookPayload {
    action: 'opened' | 'edited' | 'closed' | 'reopened' | 'synchronize' | 'ready_for_review' | 'converted_to_draft';
    number: number;
    pull_request: {
        id: number;
        node_id: string;
        number: number;
        title: string;
        body: string | null;
        state: 'open' | 'closed';
        draft: boolean;
        merged: boolean;
        user: {
            login: string;
            id: number;
        };
        base: {
            ref: string;
            sha: string;
        };
        head: {
            ref: string;
            sha: string;
        };
        additions: number;
        deletions: number;
        changed_files: number;
        labels: Array<{ name: string }>;
        created_at: string;
        updated_at: string;
        merged_at: string | null;
        closed_at: string | null;
    };
}
