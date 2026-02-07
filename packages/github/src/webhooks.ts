// packages/github/src/webhooks.ts
// Webhook verification and event handling utilities

import { createHmac, timingSafeEqual } from 'crypto';
import type {
    WebhookEventName,
    WebhookPayload,
    InstallationPayload,
    PushPayload,
    PullRequestPayload,
} from './types';

/**
 * Verify webhook signature from GitHub
 */
export function verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret?: string
): boolean {
    const webhookSecret = secret ?? process.env.GITHUB_WEBHOOK_SECRET;

    if (!webhookSecret) {
        throw new Error('GITHUB_WEBHOOK_SECRET environment variable is not set');
    }

    if (!signature) {
        return false;
    }

    // GitHub sends signature as "sha256=<signature>"
    const [algorithm, expectedSignature] = signature.split('=');

    if (algorithm !== 'sha256' || !expectedSignature) {
        return false;
    }

    const payloadString = typeof payload === 'string' ? payload : payload.toString('utf-8');
    const computedSignature = createHmac('sha256', webhookSecret)
        .update(payloadString)
        .digest('hex');

    try {
        return timingSafeEqual(
            Buffer.from(expectedSignature, 'hex'),
            Buffer.from(computedSignature, 'hex')
        );
    } catch {
        return false;
    }
}

/**
 * Parse webhook event name from header
 */
export function parseWebhookEvent(eventHeader: string | null): WebhookEventName | null {
    if (!eventHeader) {
        return null;
    }

    const validEvents: WebhookEventName[] = [
        'installation',
        'installation_repositories',
        'push',
        'pull_request',
        'pull_request_review',
        'pull_request_review_comment',
        'issue_comment',
    ];

    return validEvents.includes(eventHeader as WebhookEventName)
        ? (eventHeader as WebhookEventName)
        : null;
}

/**
 * Type guard for installation events
 */
export function isInstallationEvent(
    event: WebhookEventName,
    _payload: WebhookPayload
): _payload is InstallationPayload {
    return event === 'installation' || event === 'installation_repositories';
}

/**
 * Type guard for push events
 */
export function isPushEvent(
    event: WebhookEventName,
    _payload: WebhookPayload
): _payload is PushPayload {
    return event === 'push';
}

/**
 * Type guard for pull request events
 */
export function isPullRequestEvent(
    event: WebhookEventName,
    _payload: WebhookPayload
): _payload is PullRequestPayload {
    return event === 'pull_request';
}

/**
 * Extract key information from any webhook payload
 */
export function extractWebhookContext(payload: WebhookPayload): {
    installationId: number | null;
    repositoryId: number | null;
    repositoryFullName: string | null;
    senderLogin: string | null;
    action: string | null;
} {
    return {
        installationId: payload.installation?.id ?? null,
        repositoryId: payload.repository?.id ?? null,
        repositoryFullName: payload.repository?.full_name ?? null,
        senderLogin: payload.sender?.login ?? null,
        action: payload.action ?? null,
    };
}

/**
 * Check if an installation event grants access to new repositories
 */
export function getNewRepositoriesFromInstallation(
    payload: InstallationPayload
): Array<{
    id: number;
    nodeId: string;
    name: string;
    fullName: string;
    private: boolean;
}> {
    if (payload.action === 'created' && payload.repositories) {
        return payload.repositories.map((repo: any) => ({
            id: repo.id,
            nodeId: repo.node_id,
            name: repo.name,
            fullName: repo.full_name,
            private: repo.private,
        }));
    }
    return [];
}

/**
 * Extract commit information from push payload
 */
export function extractCommitsFromPush(payload: PushPayload): Array<{
    sha: string;
    message: string;
    timestamp: string;
    author: { name: string; email: string };
    addedFiles: string[];
    removedFiles: string[];
    modifiedFiles: string[];
}> {
    return payload.commits.map((commit) => ({
        sha: commit.id,
        message: commit.message,
        timestamp: commit.timestamp,
        author: commit.author,
        addedFiles: commit.added,
        removedFiles: commit.removed,
        modifiedFiles: commit.modified,
    }));
}

/**
 * Extract pull request info from PR payload
 */
export function extractPRFromPayload(payload: PullRequestPayload): {
    id: number;
    nodeId: string;
    number: number;
    title: string;
    body: string | null;
    state: 'open' | 'closed';
    draft: boolean;
    merged: boolean;
    author: { login: string; id: number };
    baseBranch: string;
    headBranch: string;
    additions: number;
    deletions: number;
    changedFiles: number;
    labels: string[];
} {
    const pr = payload.pull_request;
    return {
        id: pr.id,
        nodeId: pr.node_id,
        number: pr.number,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        draft: pr.draft,
        merged: pr.merged,
        author: { login: pr.user.login, id: pr.user.id },
        baseBranch: pr.base.ref,
        headBranch: pr.head.ref,
        additions: pr.additions,
        deletions: pr.deletions,
        changedFiles: pr.changed_files,
        labels: pr.labels.map((l) => l.name),
    };
}

/**
 * Check if a push event is to the default branch
 */
export function isPushToDefaultBranch(
    payload: PushPayload,
    defaultBranch: string
): boolean {
    const ref = payload.ref;
    return ref === `refs/heads/${defaultBranch}`;
}

/**
 * Check if this is a PR that should be analyzed
 */
export function shouldAnalyzePR(payload: PullRequestPayload): boolean {
    const analyzableActions = ['opened', 'synchronize', 'ready_for_review'];

    // Skip draft PRs unless they are being marked ready for review
    if (payload.pull_request.draft && payload.action !== 'ready_for_review') {
        return false;
    }

    return analyzableActions.includes(payload.action);
}

/**
 * Format a webhook processing result for logging
 */
export function formatWebhookResult(result: {
    event: WebhookEventName;
    action: string | null;
    repository: string | null;
    processed: boolean;
    jobIds?: string[];
    error?: string;
}): string {
    const parts = [
        `[${result.event}${result.action ? `:${result.action}` : ''}]`,
        result.repository ? `repo=${result.repository}` : 'repo=unknown',
        result.processed ? 'processed=true' : 'processed=false',
    ];

    if (result.jobIds?.length) {
        parts.push(`jobs=${result.jobIds.join(',')}`);
    }

    if (result.error) {
        parts.push(`error="${result.error}"`);
    }

    return parts.join(' ');
}
