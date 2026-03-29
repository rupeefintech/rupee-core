import { Redis } from '@upstash/redis'

// Upstash REST client — works in both serverless and persistent processes
let _redis: Redis | null = null

function getRedis(): Redis | null {
  if (_redis) return _redis
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null // cache disabled — fall through to DB
  }
  _redis = new Redis({
    url:   process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  return _redis
}

const DEFAULT_TTL = 3600 // 1 hour

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis()
    if (!redis) return null
    const val = await redis.get<T>(key)
    return val ?? null
  } catch {
    return null // cache miss on error — never block the request
  }
}

export async function cacheSet<T>(key: string, value: T, ttl = DEFAULT_TTL): Promise<void> {
  try {
    const redis = getRedis()
    if (!redis) return
    await redis.set(key, value, { ex: ttl })
  } catch {
    // non-critical — continue without caching
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  try {
    const redis = getRedis()
    if (!redis) return
    const keys = await redis.keys(pattern)
    if (keys.length > 0) await redis.del(...keys)
  } catch {}
}

export async function cacheFlush(): Promise<void> {
  try {
    const redis = getRedis()
    if (!redis) return
    await redis.flushdb()
  } catch {}
}
