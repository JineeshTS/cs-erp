import { db } from "@/lib/db";
import { adminFeatureFlags } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import Redis from "ioredis";

const CACHE_TTL = 300; // 5 minutes

let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
    redis.connect().catch(() => { redis = null; });
  }
  return redis;
}

function cacheKey(tenantId: string, flagKey: string): string {
  return `ff:${tenantId}:${flagKey}`;
}

interface FlagEvalContext {
  userId?: string;
  userRole?: string;
}

/**
 * ERP-051: Check if a feature flag is enabled for a given tenant/user.
 * Evaluates: isEnabled → rolloutPercentage → targetRoles → targetUsers.
 * Results cached in Redis for 5 minutes.
 */
export async function isFeatureEnabled(
  tenantId: string,
  flagKey: string,
  context?: FlagEvalContext
): Promise<boolean> {
  // Check Redis cache first
  const r = getRedis();
  if (r) {
    try {
      const cached = await r.get(cacheKey(tenantId, flagKey));
      if (cached !== null) {
        const flag = JSON.parse(cached);
        return evaluateFlag(flag, context);
      }
    } catch { /* cache miss, fall through */ }
  }

  // Query DB
  const [flag] = await db
    .select()
    .from(adminFeatureFlags)
    .where(and(
      eq(adminFeatureFlags.tenantId, tenantId),
      eq(adminFeatureFlags.flagKey, flagKey),
      isNull(adminFeatureFlags.deletedAt),
    ))
    .limit(1);

  if (!flag) return false;

  // Cache the flag
  if (r) {
    try {
      await r.setex(cacheKey(tenantId, flagKey), CACHE_TTL, JSON.stringify(flag));
    } catch { /* ignore cache write failure */ }
  }

  return evaluateFlag(flag, context);
}

function evaluateFlag(
  flag: { isEnabled: boolean; rolloutPercentage: number; targetRoles: unknown; targetUsers: unknown },
  context?: FlagEvalContext
): boolean {
  if (!flag.isEnabled) return false;

  // Target-specific checks
  if (context?.userId && Array.isArray(flag.targetUsers) && flag.targetUsers.length > 0) {
    return flag.targetUsers.includes(context.userId);
  }

  if (context?.userRole && Array.isArray(flag.targetRoles) && flag.targetRoles.length > 0) {
    return flag.targetRoles.includes(context.userRole);
  }

  // Rollout percentage (0 = off, 100 = on for everyone, 1-99 = gradual)
  if (flag.rolloutPercentage >= 100) return true;
  if (flag.rolloutPercentage <= 0) return false;

  // Deterministic rollout based on userId hash
  if (context?.userId) {
    let hash = 0;
    for (let i = 0; i < context.userId.length; i++) {
      hash = ((hash << 5) - hash) + context.userId.charCodeAt(i);
      hash |= 0;
    }
    return (Math.abs(hash) % 100) < flag.rolloutPercentage;
  }

  return flag.rolloutPercentage > 0;
}

/**
 * Invalidate a cached feature flag (call after admin updates a flag).
 */
export async function invalidateFeatureFlag(tenantId: string, flagKey: string): Promise<void> {
  const r = getRedis();
  if (r) {
    try { await r.del(cacheKey(tenantId, flagKey)); } catch { /* ignore */ }
  }
}
