import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, desc, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, roles } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";

type RouteParams = { params: Promise<{ tenantId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();

  const { tenantId } = await params;
  if (user.tenantId !== tenantId) return forbiddenResponse();

  if (!(await hasPermission(user.id, user.tenantId, "users:read"))) {
    return forbiddenResponse();
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const cursor = url.searchParams.get("cursor");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

  let query = db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      status: users.status,
      roleId: users.roleId,
      roleName: roles.name,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(
      and(
        eq(users.tenantId, tenantId),
        search ? ilike(users.email, `%${search}%`) : undefined,
        cursor ? lt(users.createdAt, new Date(cursor)) : undefined
      )
    )
    .orderBy(desc(users.createdAt))
    .limit(limit + 1);

  const results = await query;
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? data[data.length - 1].createdAt?.toISOString() : undefined;

  return NextResponse.json({
    data,
    meta: {
      cursor: nextCursor,
      hasMore } });
}
