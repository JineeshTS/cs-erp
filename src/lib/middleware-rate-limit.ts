/**
 * Edge-compatible in-memory rate limiter for Next.js middleware.
 *
 * Uses a sliding window counter. Since middleware runs in Edge Runtime,
 * we cannot use Redis here — this is per-instance in-memory only.
 *
 * For multi-instance deployments, the Redis-based rate-limit.ts
 * should be used in API route handlers instead.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL = 60_000; // 1 minute
let lastCleanup = Date.now();

function cleanup(windowMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store) {
    if (now - entry.windowStart > windowMs * 2) {
      store.delete(key);
    }
  }
}

export interface MiddlewareRateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp in seconds
}

/**
 * Check rate limit for a given key.
 *
 * @param key - Unique identifier (e.g., user ID or IP hash)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Window size in milliseconds
 */
export function checkMiddlewareRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): MiddlewareRateLimitResult {
  cleanup(windowMs);

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    // New window
    store.set(key, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: Math.ceil((now + windowMs) / 1000),
    };
  }

  entry.count++;

  if (entry.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: Math.ceil((entry.windowStart + windowMs) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: Math.ceil((entry.windowStart + windowMs) / 1000),
  };
}
