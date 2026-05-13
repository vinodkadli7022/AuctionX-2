import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    console.log(`Redis reconnect attempt #${times} in ${delay}ms`);
    return delay;
  },
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('ready', () => console.log('✅ Redis ready'));
redis.on('error', (err) => console.error('❌ Redis error:', err.message));
redis.on('close', () => console.warn('⚠️  Redis connection closed'));
redis.on('reconnecting', () => console.log('🔄 Redis reconnecting...'));

export const AUCTION_STATE_KEY = 'auction:live';
export const BID_LOCK_PREFIX = 'bid-lock:';
export const BID_LOCK_TTL_MS = 500;
export const BID_LOCK_TIMEOUT_MS = 50;
