import { getRedis } from "@/lib/redis";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Async Redis-first rate limiter. Falls back to in-memory if Redis is unavailable.
 * Use this for all rate limiting — it works correctly across replicas.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult> {
  try {
    const redis = getRedis();
    const redisKey = `rl:${key}`;
    const count = await redis.incr(redisKey);

    if (count === 1) {
      await redis.expire(redisKey, Math.ceil(windowMs / 1000));
    }

    const ttl = await redis.ttl(redisKey);
    const resetAt = new Date(Date.now() + Math.max(ttl, 1) * 1000);

    if (count > maxAttempts) {
      return { allowed: false, remaining: 0, resetAt };
    }

    return { allowed: true, remaining: maxAttempts - count, resetAt };
  } catch {
    // Redis unavailable — pure in-memory fallback
    return checkRateLimitMemory(key, maxAttempts, windowMs);
  }
}

// In-memory fallback
interface RateLimitEntry { count: number; resetAt: number; }
const memStore = new Map<string, RateLimitEntry>();

let cleanupInterval: ReturnType<typeof setInterval> | null = null;
function ensureCleanup() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of memStore) {
      if (v.resetAt <= now) memStore.delete(k);
    }
  }, 5 * 60 * 1000);
  if (cleanupInterval.unref) cleanupInterval.unref();
}

function checkRateLimitMemory(key: string, maxAttempts: number, windowMs: number): RateLimitResult {
  ensureCleanup();
  const now = Date.now();
  const entry = memStore.get(key);

  if (!entry || entry.resetAt <= now) {
    memStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetAt: new Date(now + windowMs) };
  }

  entry.count++;
  memStore.set(key, entry);

  if (entry.count > maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: new Date(entry.resetAt) };
  }

  return { allowed: true, remaining: maxAttempts - entry.count, resetAt: new Date(entry.resetAt) };
}

export async function resetRateLimit(key: string): Promise<void> {
  memStore.delete(key);
  try {
    await getRedis().del(`rl:${key}`);
  } catch { /* Redis unavailable */ }
}
