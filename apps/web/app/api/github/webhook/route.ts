import { NextResponse } from 'next/server';
import crypto from 'crypto';

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || '';

function verifySignature(payload: string, signature: string): boolean {
  const hmac = crypto.createHmac('sha256', GITHUB_WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-hub-signature-256') || '';
    const event = request.headers.get('x-github-event') || '';
    const deliveryId = request.headers.get('x-github-delivery') || '';

    // Verify webhook signature
    if (GITHUB_WEBHOOK_SECRET && !verifySignature(payload, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const data = JSON.parse(payload);

    // Log the event for debugging
    console.log(`Received GitHub webhook: ${event} (${deliveryId})`);

    // Handle different event types
    switch (event) {
      case 'installation':
        await handleInstallation(data);
        break;
      case 'push':
        await handlePush(data);
        break;
      case 'pull_request':
        await handlePullRequest(data);
        break;
      case 'pull_request_review':
        await handlePullRequestReview(data);
        break;
      case 'repository':
        await handleRepository(data);
        break;
      default:
        console.log(`Unhandled event type: ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('GitHub webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleInstallation(data: any) {
  const { action, installation, repositories } = data;

  switch (action) {
    case 'created':
      console.log(`GitHub App installed for org: ${installation.account.login}`);
      // TODO: Queue job to sync repositories
      break;
    case 'deleted':
      console.log(`GitHub App uninstalled for org: ${installation.account.login}`);
      // TODO: Mark installation as inactive
      break;
    case 'suspend':
    case 'unsuspend':
      console.log(`Installation ${action}ed for org: ${installation.account.login}`);
      break;
  }
}

async function handlePush(data: any) {
  const { repository, commits, pusher, ref } = data;

  console.log(`Push to ${repository.full_name} (${ref}): ${commits.length} commits`);

  // TODO: Queue job to process each commit
  for (const commit of commits) {
    console.log(`  - ${commit.id.slice(0, 7)}: ${commit.message.split('\n')[0]}`);
    // Queue: processCommit({ repository, commit, pusher })
  }
}

async function handlePullRequest(data: any) {
  const { action, pull_request, repository } = data;

  console.log(`PR ${action} in ${repository.full_name}: #${pull_request.number} ${pull_request.title}`);

  switch (action) {
    case 'opened':
    case 'synchronize':
    case 'reopened':
      // TODO: Queue job to analyze PR
      break;
    case 'closed':
      if (pull_request.merged) {
        // TODO: Queue job to record PR merge
        console.log(`  PR merged by ${pull_request.merged_by?.login}`);
      }
      break;
  }
}

async function handlePullRequestReview(data: any) {
  const { action, review, pull_request, repository } = data;

  if (action === 'submitted') {
    console.log(`Review on PR #${pull_request.number} in ${repository.full_name} by ${review.user.login}: ${review.state}`);
    // TODO: Queue job to record review
  }
}

async function handleRepository(data: any) {
  const { action, repository } = data;

  switch (action) {
    case 'created':
      console.log(`New repository created: ${repository.full_name}`);
      // TODO: Add repository to database
      break;
    case 'deleted':
      console.log(`Repository deleted: ${repository.full_name}`);
      // TODO: Mark repository as inactive
      break;
    case 'renamed':
      console.log(`Repository renamed: ${repository.full_name}`);
      // TODO: Update repository name
      break;
  }
}
