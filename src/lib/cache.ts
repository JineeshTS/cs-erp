import { getRedis } from "./redis";

const DEFAULT_TTL = 300; // 5 minutes

/**
 * ERP-109: Generic Redis cache helper for master data and other hot queries.
 * Falls through to fetcher on cache miss or Redis error.
 */
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  try {
    const redis = getRedis();
    const raw = await redis.get(key);
    if (raw !== null) {
      return JSON.parse(raw) as T;
    }
  } catch {
    // Redis unavailable — fall through to DB
  }

  const data = await fetcher();

  try {
    const redis = getRedis();
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch {
    // Cache write failure — non-fatal
  }

  return data;
}

/**
 * Invalidate a cache key or pattern.
 */
export async function invalidateCache(pattern: string): Promise<number> {
  try {
    const redis = getRedis();
    if (pattern.includes("*")) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        return redis.del(...keys);
      }
      return 0;
    }
    return redis.del(pattern);
  } catch {
    return 0;
  }
}
