import { Worker, Queue } from 'bullmq';
import { connection } from './queues/connection';
import { processCommit } from './jobs/github/processCommit';
import { processPullRequest } from './jobs/github/processPullRequest';
import { syncRepository } from './jobs/github/syncRepository';
import { computeMetrics } from './jobs/analytics/computeMetrics';
import { generateInsights } from './jobs/analytics/generateInsights';
import { sendFeedback } from './jobs/slack/sendFeedback';

console.log('🚀 Lucyn Worker starting...');

// Check if Redis is available
async function startWorkers() {
  try {
    await connection.connect();
    console.log('📡 Connected to Redis');
  } catch (error) {
    console.warn('⚠️  Redis not available. Worker running in standby mode.');
    console.warn('    To enable job processing, start Redis:');
    console.warn('    docker run -d -p 6379:6379 redis:alpine');
    console.warn('');
    console.warn('    Or set UPSTASH_REDIS_REST_URL in .env for cloud Redis.');
    
    // Keep the process alive but don't try to process jobs
    setInterval(() => {}, 1 << 30);
    return;
  }

  // Define queues
  const githubQueue = new Queue('github', { connection });
  const analyticsQueue = new Queue('analytics', { connection });
  const slackQueue = new Queue('slack', { connection });

  // Export for external use
  (global as any).lucynQueues = { githubQueue, analyticsQueue, slackQueue };

  // GitHub Worker
  const githubWorker = new Worker(
    'github',
    async (job) => {
      console.log(`Processing GitHub job: ${job.name} (${job.id})`);

      switch (job.name) {
        case 'process-commit':
          return processCommit(job.data);
        case 'process-pull-request':
          return processPullRequest(job.data);
        case 'sync-repository':
          return syncRepository(job.data);
        default:
          console.log(`Unknown GitHub job type: ${job.name}`);
      }
    },
    {
      connection,
      concurrency: 5,
    }
  );

  // Analytics Worker
  const analyticsWorker = new Worker(
    'analytics',
    async (job) => {
      console.log(`Processing Analytics job: ${job.name} (${job.id})`);

      switch (job.name) {
        case 'compute-metrics':
          return computeMetrics(job.data);
        case 'generate-insights':
          return generateInsights(job.data);
        default:
          console.log(`Unknown Analytics job type: ${job.name}`);
      }
    },
    {
      connection,
      concurrency: 2,
    }
  );

  // Slack Worker
  const slackWorker = new Worker(
    'slack',
    async (job) => {
      console.log(`Processing Slack job: ${job.name} (${job.id})`);

      switch (job.name) {
        case 'send-feedback':
          return sendFeedback(job.data);
        default:
          console.log(`Unknown Slack job type: ${job.name}`);
      }
    },
    {
      connection,
      concurrency: 3,
    }
  );

  // Event handlers
  const workers = [githubWorker, analyticsWorker, slackWorker];

  workers.forEach((worker) => {
    worker.on('completed', (job) => {
      console.log(`✅ Job ${job.id} completed`);
    });

    worker.on('failed', (job, err) => {
      console.error(`❌ Job ${job?.id} failed:`, err.message);
    });
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('🛑 Shutting down workers...');
    
    await Promise.all(workers.map((w) => w.close()));
    
    console.log('👋 Workers shut down gracefully');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  console.log('✅ Lucyn Worker running');
  console.log('📋 Queues: github, analytics, slack');
}

// Start the workers
startWorkers();
