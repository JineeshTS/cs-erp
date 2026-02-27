import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, desc, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, roles } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();

  // Admin user management requires users:edit, not just users:read
  if (!(await hasPermission(user.id, user.tenantId, "users:edit"))) {
    return forbiddenResponse();
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const roleFilter = url.searchParams.get("role") || "";
  const cursor = url.searchParams.get("cursor");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

  const conditions = [eq(users.tenantId, user.tenantId)];
  if (search) conditions.push(ilike(users.email, `%${search}%`));
  if (roleFilter) conditions.push(eq(users.roleId, roleFilter));
  if (cursor) conditions.push(gt(users.createdAt, new Date(cursor)));

  const results = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      status: users.status,
      roleId: users.roleId,
      roleName: roles.name,
      emailVerified: users.emailVerified,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(and(...conditions))
    .orderBy(desc(users.createdAt))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? data[data.length - 1].createdAt?.toISOString() : undefined;

  return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
}
