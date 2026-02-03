import IORedis from 'ioredis';

// Use REDIS_URL for ioredis connections (rediss://... format from Upstash)
// UPSTASH_REDIS_REST_URL is for HTTP REST API only, not compatible with ioredis
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Check if we're using Upstash (requires TLS)
const isUpstash = REDIS_URL.startsWith('rediss://');

// Check if we're in development without Redis
const isDev = process.env.NODE_ENV !== 'production';

export const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true, // Don't connect immediately
  tls: isUpstash ? { rejectUnauthorized: false } : undefined,
  retryStrategy: (times) => {
    if (isDev && times > 3) {
      console.warn('⚠️  Redis not available. Worker features disabled.');
      console.warn('    To enable: docker run -d -p 6379:6379 redis:alpine');
      return null; // Stop retrying in dev
    }
    return Math.min(times * 500, 5000);
  },
});

connection.on('connect', () => {
  console.log('📡 Connected to Redis');
});

connection.on('error', (err) => {
  if (isDev) {
    // Suppress repeated errors in development
    return;
  }
  console.error('Redis connection error:', err);
});
