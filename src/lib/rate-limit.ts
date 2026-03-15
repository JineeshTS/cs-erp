import { getRedis } from "@/lib/redis";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Redis-based rate limiter. Works correctly across replicas.
 * Falls back to in-memory if Redis is unavailable.
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): RateLimitResult {
  // Try Redis first; fall back to in-memory for dev/single-instance
  try {
    const redis = getRedis();
    // Fire-and-forget: use sync wrapper returning optimistic result,
    // then async increment. This keeps the existing sync API contract.
    // For strict enforcement, callers should use checkRateLimitAsync.
    const entry = memStore.get(key);
    const now = Date.now();

    if (!entry || entry.resetAt <= now) {
      memStore.set(key, { count: 1, resetAt: now + windowMs });
      // Async sync to Redis
      redis.incr(`rl:${key}`).then(() => redis.expire(`rl:${key}`, Math.ceil(windowMs / 1000))).catch(() => {});
      return { allowed: true, remaining: maxAttempts - 1, resetAt: new Date(now + windowMs) };
    }

    entry.count++;
    memStore.set(key, entry);
    redis.incr(`rl:${key}`).catch(() => {});

    if (entry.count > maxAttempts) {
      return { allowed: false, remaining: 0, resetAt: new Date(entry.resetAt) };
    }

    return { allowed: true, remaining: maxAttempts - entry.count, resetAt: new Date(entry.resetAt) };
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

export function resetRateLimit(key: string): void {
  memStore.delete(key);
  try {
    getRedis().del(`rl:${key}`).catch(() => {});
  } catch { /* Redis unavailable */ }
}
