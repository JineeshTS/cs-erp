import { eq, and, or, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, roles } from "@/db/schema";
import { rolePermissions, permissions } from "@/db/schema/permissions";
import { getRedis } from "@/lib/redis";

const CACHE_TTL = 300; // 5 minutes
const CACHE_PREFIX = "rbac";

function cacheKey(userId: string, tenantId: string): string {
  return `${CACHE_PREFIX}:${userId}:${tenantId}`;
}

export async function getUserPermissions(
  userId: string,
  tenantId: string
): Promise<string[]> {
  // Try Redis cache first
  try {
    const redis = getRedis();
    const cached = await redis.get(cacheKey(userId, tenantId));
    if (cached) return JSON.parse(cached);
  } catch {
    // Redis down — fall through to DB
  }

  // Fetch from DB: user -> role -> role_permissions -> permissions
  const [user] = await db
    .select({ roleId: users.roleId })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.tenantId, tenantId)))
    .limit(1);

  if (!user?.roleId) return [];

  // Check if role has wildcard permissions (stored as ["*"] in roles.permissions jsonb)
  const [role] = await db
    .select({ permissions: roles.permissions })
    .from(roles)
    .where(and(
      eq(roles.id, user.roleId),
      or(eq(roles.tenantId, tenantId), isNull(roles.tenantId))
    ))
    .limit(1);

  if (
    role?.permissions &&
    Array.isArray(role.permissions) &&
    role.permissions.includes("*")
  ) {
    // Wildcard — fetch ALL permission names
    const allPerms = await db
      .select({ name: permissions.name })
      .from(permissions);
    const permNames = allPerms.map((p) => p.name);
    await cachePermissions(userId, tenantId, permNames);
    return permNames;
  }

  // Standard: role -> role_permissions join -> permissions
  const result = await db
    .select({ name: permissions.name })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(and(
      eq(rolePermissions.roleId, user.roleId),
      or(eq(rolePermissions.tenantId, tenantId), isNull(rolePermissions.tenantId))
    ));

  const permNames = result.map((r) => r.name);
  await cachePermissions(userId, tenantId, permNames);
  return permNames;
}

async function cachePermissions(
  userId: string,
  tenantId: string,
  perms: string[]
): Promise<void> {
  try {
    const redis = getRedis();
    await redis.setex(cacheKey(userId, tenantId), CACHE_TTL, JSON.stringify(perms));
  } catch {
    // Silently fail — cache is optional
  }
}

export async function invalidatePermissionCache(
  userId: string,
  tenantId: string
): Promise<void> {
  try {
    const redis = getRedis();
    await redis.del(cacheKey(userId, tenantId));
  } catch {
    // Silently fail
  }
}

export async function hasPermission(
  userId: string,
  tenantId: string,
  permission: string
): Promise<boolean> {
  const perms = await getUserPermissions(userId, tenantId);
  return perms.includes(permission);
}

export async function requirePermission(
  userId: string,
  tenantId: string,
  permission: string
): Promise<void> {
  const allowed = await hasPermission(userId, tenantId, permission);
  if (!allowed) {
    const error = new Error("Forbidden") as Error & { statusCode: number };
    error.statusCode = 403;
    throw error;
  }
}

export async function getUserRole(
  userId: string,
  tenantId: string
): Promise<{ id: string; name: string } | null> {
  const [user] = await db
    .select({ roleId: users.roleId })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.tenantId, tenantId)))
    .limit(1);

  if (!user?.roleId) return null;

  const [role] = await db
    .select({ id: roles.id, name: roles.name })
    .from(roles)
    .where(and(
      eq(roles.id, user.roleId),
      or(eq(roles.tenantId, tenantId), isNull(roles.tenantId))
    ))
    .limit(1);

  return role ?? null;
}
