// apps/web/app/api/github/webhooks/route.ts
// GitHub App webhook handler

import { NextRequest, NextResponse } from 'next/server';
import {
    verifyWebhookSignature,
    parseWebhookEvent,
    extractWebhookContext,
    isPushEvent,
    isPullRequestEvent,
    isInstallationEvent,
    type WebhookPayload,
} from '@lucyn/github';
import { prisma } from '@lucyn/database';

// Import BullMQ queues
const QUEUE_URL = process.env.REDIS_URL || 'redis://localhost:6379';

async function queueJob(queueName: string, jobName: string, data: any) {
    // We'll use a simple fetch to trigger the worker API or direct queue add
    // For now, we store the job in the database and the worker polls
    await prisma.syncLog.create({
        data: {
            entityType: `job:${queueName}:${jobName}`,
            status: 'pending',
            metadata: data,
            organizationId: data.organizationId || 'system',
        },
    });
}

export async function POST(request: NextRequest) {
    try {
        // Get raw body for signature verification
        const rawBody = await request.text();

        // Get signature header
        const signature = request.headers.get('x-hub-signature-256') || '';

        // Verify signature
        if (!verifyWebhookSignature(rawBody, signature)) {
            console.error('Webhook signature verification failed');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        // Parse event type
        const eventType = parseWebhookEvent(
            request.headers.get('x-github-event') || ''
        );

        if (!eventType) {
            console.log('Unrecognized webhook event type');
            return NextResponse.json({ received: true, skipped: 'unknown event' });
        }

        // Parse payload
        const payload: WebhookPayload = JSON.parse(rawBody);
        const context = extractWebhookContext(payload);

        console.log(`Received GitHub webhook: ${eventType}${context.action ? `/${context.action}` : ''}`);

        // Handle installation events
        if (isInstallationEvent(eventType, payload)) {
            if (context.action === 'created') {
                await handleInstallationCreated(payload);
            } else if (context.action === 'deleted') {
                await handleInstallationDeleted(payload);
            }
            return NextResponse.json({ received: true });
        }

        // Require installation ID for other events
        if (!context.installationId) {
            console.warn('Webhook missing installation ID');
            return NextResponse.json({ received: true, skipped: 'no installation' });
        }

        // Handle push events (new commits)
        if (isPushEvent(eventType, payload)) {
            await handlePushEvent(payload, context);
            return NextResponse.json({ received: true });
        }

        // Handle pull request events
        if (isPullRequestEvent(eventType, payload)) {
            await handlePullRequestEvent(payload, context.action || 'unknown', context);
            return NextResponse.json({ received: true });
        }

        // Log unhandled events
        console.log(`Unhandled event type: ${eventType}`);
        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function handleInstallationCreated(payload: any) {
    console.log(`New GitHub App installation: ${payload.installation.account.login}`);

    // Find or create organization
    let organization = await prisma.organization.findFirst({
        where: { githubOrgId: String(payload.installation.account.id) },
    });

    if (!organization) {
        organization = await prisma.organization.create({
            data: {
                name: payload.installation.account.login,
                slug: payload.installation.account.login.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                githubOrgId: String(payload.installation.account.id),
                githubOrgLogin: payload.installation.account.login,
            },
        });
    }

    // Queue ingestion for all repositories
    const repositories = payload.repositories || [];
    for (const repo of repositories) {
        await queueJob('github', 'ingestRepository', {
            installationId: payload.installation.id,
            repositoryGithubId: String(repo.id),
            owner: payload.installation.account.login,
            repo: repo.name,
            fullName: repo.full_name,
            organizationId: organization.id,
        });
    }

    console.log(`Queued ingestion for ${repositories.length} repositories`);
}

async function handleInstallationDeleted(payload: any) {
    console.log(`GitHub App uninstalled: ${payload.installation.account.login}`);

    // Delete related repositories (cascade will handle related data)
    // In production, you might want to soft-delete or archive instead
    const org = await prisma.organization.findFirst({
        where: { githubOrgId: String(payload.installation.account.id) },
        select: { id: true },
    });

    if (org) {
        await prisma.repository.deleteMany({
            where: { organizationId: org.id },
        });
        console.log(`Deleted repositories for organization: ${payload.installation.account.login}`);
    }
}

async function handlePushEvent(payload: any, context: any) {
    const { repository } = payload;

    // Only process pushes to default branch
    const defaultBranch = repository.default_branch;
    const pushedBranch = payload.ref.replace('refs/heads/', '');

    if (pushedBranch !== defaultBranch) {
        console.log(`Ignoring push to non-default branch: ${pushedBranch}`);
        return;
    }

    // Get repository record
    const repo = await prisma.repository.findUnique({
        where: { githubId: String(repository.id) },
        select: { id: true, organizationId: true },
    });

    if (!repo) {
        console.log(`Repository not found: ${repository.full_name}`);
        return;
    }

    // Process commits
    const commits = payload.commits || [];
    console.log(`Processing ${commits.length} commits for ${repository.full_name}`);

    for (const commit of commits) {
        // Queue commit processing
        await queueJob('github', 'processCommit', {
            repositoryId: repo.id,
            organizationId: repo.organizationId,
            installationId: context.installationId,
            owner: repository.owner.login,
            repo: repository.name,
            sha: commit.id,
            message: commit.message,
            author: commit.author,
            timestamp: commit.timestamp,
            added: commit.added || [],
            modified: commit.modified || [],
            removed: commit.removed || [],
        });
    }

    // Queue incremental update if there were file changes
    const changedFiles = commits.flatMap((c: any) => [
        ...(c.added || []).map((f: string) => ({ path: f, status: 'added' })),
        ...(c.modified || []).map((f: string) => ({ path: f, status: 'modified' })),
        ...(c.removed || []).map((f: string) => ({ path: f, status: 'removed' })),
    ]);

    if (changedFiles.length > 0) {
        await queueJob('github', 'updateFromPush', {
            repositoryId: repo.id,
            organizationId: repo.organizationId,
            installationId: context.installationId,
            owner: repository.owner.login,
            repo: repository.name,
            changedFiles,
        });
    }
}

async function handlePullRequestEvent(
    payload: any,
    action: string,
    context: any
) {
    const { pull_request, repository } = payload;

    // Only process opened, synchronize (new commits), or reopened
    if (!['opened', 'synchronize', 'reopened'].includes(action)) {
        console.log(`Ignoring PR action: ${action}`);
        return;
    }

    // Don't analyze draft PRs
    if (pull_request.draft) {
        console.log(`Ignoring draft PR #${pull_request.number}`);
        return;
    }

    // Get repository record
    const repo = await prisma.repository.findUnique({
        where: { githubId: String(repository.id) },
        select: { id: true, organizationId: true },
    });

    if (!repo) {
        console.log(`Repository not found: ${repository.full_name}`);
        return;
    }

    console.log(`Processing PR #${pull_request.number}: ${pull_request.title}`);

    // Queue PR analysis
    await queueJob('github', 'analyzePullRequest', {
        repositoryId: repo.id,
        organizationId: repo.organizationId,
        installationId: context.installationId,
        owner: repository.owner.login,
        repo: repository.name,
        pullRequest: {
            githubId: String(pull_request.id),
            number: pull_request.number,
            title: pull_request.title,
            body: pull_request.body,
            state: pull_request.state,
            isDraft: pull_request.draft,
            baseBranch: pull_request.base.ref,
            headBranch: pull_request.head.ref,
            baseRef: pull_request.base.sha,
            headRef: pull_request.head.sha,
            additions: pull_request.additions,
            deletions: pull_request.deletions,
            changedFiles: pull_request.changed_files,
            author: {
                login: pull_request.user.login,
                id: pull_request.user.id,
            },
        },
        action,
    });
}
