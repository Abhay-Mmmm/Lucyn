// packages/github/src/client.ts
// GitHub App client with authentication and Octokit factory

import { Octokit } from 'octokit';
import { createAppAuth } from '@octokit/auth-app';
import type { GitHubAppConfig } from './types';

// Cache for installation tokens
const tokenCache = new Map<number, { token: string; expiresAt: Date }>();

// Token refresh buffer (5 minutes before expiry)
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

/**
 * Get GitHub App configuration from environment variables
 */
export function getGitHubAppConfig(): GitHubAppConfig {
    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

    if (!appId) {
        throw new Error('GITHUB_APP_ID environment variable is not set');
    }

    if (!privateKey) {
        throw new Error('GITHUB_APP_PRIVATE_KEY environment variable is not set');
    }

    // Handle private key format (may have escaped newlines from env)
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

    return {
        appId,
        privateKey: formattedPrivateKey,
        clientId,
        clientSecret,
        webhookSecret,
    };
}

/**
 * Create an Octokit client authenticated as the GitHub App (for app-level operations)
 */
export function createAppOctokit(): Octokit {
    const config = getGitHubAppConfig();

    return new Octokit({
        authStrategy: createAppAuth,
        auth: {
            appId: config.appId,
            privateKey: config.privateKey,
            clientId: config.clientId,
            clientSecret: config.clientSecret,
        },
    });
}

/**
 * Get an installation access token
 */
export async function getInstallationToken(installationId: number): Promise<string> {
    // Check cache first
    const cached = tokenCache.get(installationId);
    if (cached && cached.expiresAt.getTime() > Date.now() + TOKEN_REFRESH_BUFFER_MS) {
        return cached.token;
    }

    // Generate new token
    const appOctokit = createAppOctokit();

    const { data } = await appOctokit.rest.apps.createInstallationAccessToken({
        installation_id: installationId,
    });

    // Cache the token
    tokenCache.set(installationId, {
        token: data.token,
        expiresAt: new Date(data.expires_at),
    });

    return data.token;
}

/**
 * Create an Octokit client authenticated as a specific installation
 */
export async function createInstallationOctokit(installationId: number): Promise<Octokit> {
    const token = await getInstallationToken(installationId);

    return new Octokit({
        auth: token,
    });
}

/**
 * Clear cached token for an installation (useful when token is revoked)
 */
export function clearInstallationToken(installationId: number): void {
    tokenCache.delete(installationId);
}

/**
 * Get app information
 */
export async function getAppInfo(): Promise<{
    id: number;
    slug: string;
    name: string;
    owner: { login: string; id: number };
    installations_count: number;
}> {
    const appOctokit = createAppOctokit();
    const { data } = await appOctokit.rest.apps.getAuthenticated();

    if (!data) {
        throw new Error('Failed to get app info');
    }

    return {
        id: data.id,
        slug: data.slug ?? '',
        name: data.name,
        owner: data.owner ? { login: (data.owner as any).login, id: (data.owner as any).id } : { login: '', id: 0 },
        installations_count: data.installations_count ?? 0,
    };
}

/**
 * List all installations for the app
 */
export async function listInstallations(): Promise<Array<{
    id: number;
    account: { login: string; id: number; type: string };
    repositorySelection: 'all' | 'selected';
    createdAt: string;
}>> {
    const appOctokit = createAppOctokit();
    const { data } = await appOctokit.rest.apps.listInstallations();

    return data.map((installation) => ({
        id: installation.id,
        account: {
            login: installation.account?.login ?? '',
            id: installation.account?.id ?? 0,
            type: installation.account?.type ?? 'User',
        },
        repositorySelection: installation.repository_selection as 'all' | 'selected',
        createdAt: installation.created_at,
    }));
}

/**
 * List repositories accessible to an installation
 */
export async function listInstallationRepositories(installationId: number): Promise<Array<{
    id: number;
    nodeId: string;
    name: string;
    fullName: string;
    private: boolean;
    defaultBranch: string;
}>> {
    const octokit = await createInstallationOctokit(installationId);

    const repositories: Array<{
        id: number;
        nodeId: string;
        name: string;
        fullName: string;
        private: boolean;
        defaultBranch: string;
    }> = [];

    // Paginate through all repositories
    for await (const response of octokit.paginate.iterator(
        octokit.rest.apps.listReposAccessibleToInstallation,
        { per_page: 100 }
    )) {
        for (const repo of response.data) {
            repositories.push({
                id: repo.id,
                nodeId: repo.node_id,
                name: repo.name,
                fullName: repo.full_name,
                private: repo.private,
                defaultBranch: repo.default_branch,
            });
        }
    }

    return repositories;
}

/**
 * Get repository details
 */
export async function getRepository(
    installationId: number,
    owner: string,
    repo: string
): Promise<{
    id: number;
    nodeId: string;
    name: string;
    fullName: string;
    description: string | null;
    private: boolean;
    defaultBranch: string;
    language: string | null;
    stargazersCount: number;
    forksCount: number;
    openIssuesCount: number;
    createdAt: string;
    updatedAt: string;
    pushedAt: string;
}> {
    const octokit = await createInstallationOctokit(installationId);
    const { data } = await octokit.rest.repos.get({ owner, repo });

    return {
        id: data.id,
        nodeId: data.node_id,
        name: data.name,
        fullName: data.full_name,
        description: data.description,
        private: data.private,
        defaultBranch: data.default_branch,
        language: data.language,
        stargazersCount: data.stargazers_count,
        forksCount: data.forks_count,
        openIssuesCount: data.open_issues_count,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        pushedAt: data.pushed_at ?? '',
    };
}

/**
 * Get the content of a file from a repository
 */
export async function getFileContent(
    installationId: number,
    owner: string,
    repo: string,
    path: string,
    ref?: string
): Promise<{ content: string; sha: string; size: number } | null> {
    const octokit = await createInstallationOctokit(installationId);

    try {
        const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
            ref,
        });

        if (Array.isArray(data) || data.type !== 'file' || !('content' in data)) {
            return null;
        }

        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return {
            content,
            sha: data.sha,
            size: data.size,
        };
    } catch (error: any) {
        if (error.status === 404) {
            return null;
        }
        throw error;
    }
}

/**
 * Get the tree (directory structure) of a repository
 */
export async function getRepositoryTree(
    installationId: number,
    owner: string,
    repo: string,
    sha: string = 'HEAD',
    recursive: boolean = true
): Promise<Array<{
    path: string;
    type: 'blob' | 'tree';
    sha: string;
    size?: number;
}>> {
    const octokit = await createInstallationOctokit(installationId);

    const { data } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: sha,
        recursive: recursive ? 'true' : undefined,
    });

    return data.tree
        .filter((item) => item.path && item.type && item.sha)
        .map((item) => ({
            path: item.path!,
            type: item.type as 'blob' | 'tree',
            sha: item.sha!,
            size: item.size,
        }));
}

/**
 * Get commits from a repository
 */
export async function getCommits(
    installationId: number,
    owner: string,
    repo: string,
    options: {
        sha?: string;
        since?: string;
        until?: string;
        perPage?: number;
        page?: number;
    } = {}
): Promise<Array<{
    sha: string;
    message: string;
    author: { name: string; email: string; date: string };
    committer: { name: string; email: string; date: string };
    stats?: { additions: number; deletions: number; total: number };
}>> {
    const octokit = await createInstallationOctokit(installationId);

    const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        sha: options.sha,
        since: options.since,
        until: options.until,
        per_page: options.perPage ?? 100,
        page: options.page ?? 1,
    });

    return data.map((commit) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
            name: commit.commit.author?.name ?? '',
            email: commit.commit.author?.email ?? '',
            date: commit.commit.author?.date ?? '',
        },
        committer: {
            name: commit.commit.committer?.name ?? '',
            email: commit.commit.committer?.email ?? '',
            date: commit.commit.committer?.date ?? '',
        },
    }));
}

/**
 * Get a specific commit with stats
 */
export async function getCommit(
    installationId: number,
    owner: string,
    repo: string,
    sha: string
): Promise<{
    sha: string;
    message: string;
    author: { name: string; email: string; date: string };
    committer: { name: string; email: string; date: string };
    stats: { additions: number; deletions: number; total: number };
    files: Array<{
        filename: string;
        status: string;
        additions: number;
        deletions: number;
        changes: number;
        patch?: string;
    }>;
}> {
    const octokit = await createInstallationOctokit(installationId);

    const { data } = await octokit.rest.repos.getCommit({
        owner,
        repo,
        ref: sha,
    });

    return {
        sha: data.sha,
        message: data.commit.message,
        author: {
            name: data.commit.author?.name ?? '',
            email: data.commit.author?.email ?? '',
            date: data.commit.author?.date ?? '',
        },
        committer: {
            name: data.commit.committer?.name ?? '',
            email: data.commit.committer?.email ?? '',
            date: data.commit.committer?.date ?? '',
        },
        stats: {
            additions: data.stats?.additions ?? 0,
            deletions: data.stats?.deletions ?? 0,
            total: data.stats?.total ?? 0,
        },
        files: (data.files ?? []).map((file) => ({
            filename: file.filename ?? '',
            status: file.status ?? 'modified',
            additions: file.additions ?? 0,
            deletions: file.deletions ?? 0,
            changes: file.changes ?? 0,
            patch: file.patch,
        })),
    };
}

/**
 * Get pull request details
 */
export async function getPullRequest(
    installationId: number,
    owner: string,
    repo: string,
    pullNumber: number
): Promise<{
    id: number;
    nodeId: string;
    number: number;
    title: string;
    body: string | null;
    state: 'open' | 'closed';
    draft: boolean;
    merged: boolean;
    user: { login: string; id: number };
    base: { ref: string; sha: string };
    head: { ref: string; sha: string };
    additions: number;
    deletions: number;
    changedFiles: number;
    labels: string[];
    createdAt: string;
    updatedAt: string;
    mergedAt: string | null;
    closedAt: string | null;
}> {
    const octokit = await createInstallationOctokit(installationId);

    const { data } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
    });

    return {
        id: data.id,
        nodeId: data.node_id,
        number: data.number,
        title: data.title,
        body: data.body,
        state: data.state as 'open' | 'closed',
        draft: data.draft ?? false,
        merged: data.merged ?? false,
        user: { login: data.user?.login ?? '', id: data.user?.id ?? 0 },
        base: { ref: data.base.ref, sha: data.base.sha },
        head: { ref: data.head.ref, sha: data.head.sha },
        additions: data.additions ?? 0,
        deletions: data.deletions ?? 0,
        changedFiles: data.changed_files ?? 0,
        labels: data.labels.map((l) => l.name),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        mergedAt: data.merged_at,
        closedAt: data.closed_at,
    };
}

/**
 * Get files changed in a pull request
 */
export async function getPullRequestFiles(
    installationId: number,
    owner: string,
    repo: string,
    pullNumber: number
): Promise<Array<{
    filename: string;
    status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
    previousFilename?: string;
}>> {
    const octokit = await createInstallationOctokit(installationId);

    const files: Array<{
        filename: string;
        status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
        additions: number;
        deletions: number;
        changes: number;
        patch?: string;
        previousFilename?: string;
    }> = [];

    for await (const response of octokit.paginate.iterator(
        octokit.rest.pulls.listFiles,
        { owner, repo, pull_number: pullNumber, per_page: 100 }
    )) {
        for (const file of response.data) {
            files.push({
                filename: file.filename,
                status: file.status as any,
                additions: file.additions,
                deletions: file.deletions,
                changes: file.changes,
                patch: file.patch,
                previousFilename: file.previous_filename,
            });
        }
    }

    return files;
}

/**
 * Create a comment on a pull request
 */
export async function createPRComment(
    installationId: number,
    owner: string,
    repo: string,
    pullNumber: number,
    body: string
): Promise<{ id: number; nodeId: string; url: string }> {
    const octokit = await createInstallationOctokit(installationId);

    const { data } = await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pullNumber,
        body,
    });

    return {
        id: data.id,
        nodeId: data.node_id,
        url: data.html_url,
    };
}

/**
 * Update a comment on a pull request
 */
export async function updatePRComment(
    installationId: number,
    owner: string,
    repo: string,
    commentId: number,
    body: string
): Promise<void> {
    const octokit = await createInstallationOctokit(installationId);

    await octokit.rest.issues.updateComment({
        owner,
        repo,
        comment_id: commentId,
        body,
    });
}

/**
 * Get languages used in a repository
 */
export async function getRepositoryLanguages(
    installationId: number,
    owner: string,
    repo: string
): Promise<Record<string, number>> {
    const octokit = await createInstallationOctokit(installationId);
    const { data } = await octokit.rest.repos.listLanguages({ owner, repo });
    return data;
}
