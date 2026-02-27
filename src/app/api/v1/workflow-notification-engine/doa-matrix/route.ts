import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { wneDoaMatrix } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createDoaMatrixSchema } from "@/lib/workflow-notification-engine/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const entityType = url.searchParams.get("entityType") || "";
    const actionType = url.searchParams.get("actionType") || "";
    const isActive = url.searchParams.get("isActive");
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [eq(wneDoaMatrix.tenantId, user.tenantId), isNull(wneDoaMatrix.deletedAt)];
    if (search) conditions.push(ilike(wneDoaMatrix.name, `%${search}%`));
    if (entityType) conditions.push(eq(wneDoaMatrix.entityType, entityType));
    if (actionType) conditions.push(eq(wneDoaMatrix.actionType, actionType));
    if (isActive !== null && isActive !== undefined && isActive !== "") {
      conditions.push(eq(wneDoaMatrix.isActive, isActive === "true"));
    }
    if (cursor) conditions.push(gt(wneDoaMatrix.createdAt, new Date(cursor)));

    const results = await db.select().from(wneDoaMatrix).where(and(...conditions))
      .orderBy(desc(wneDoaMatrix.createdAt)).limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("GET /doa-matrix error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch DOA matrix entries" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createDoaMatrixSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const { delegatedUntil, ...rest } = parsed.data;

    const [created] = await db.insert(wneDoaMatrix).values({
      tenantId: user.tenantId,
      ...rest,
      ...(delegatedUntil ? { delegatedUntil: new Date(delegatedUntil) } : {}),
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /doa-matrix error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create DOA matrix entry" } },
      { status: 500 }
    );
  }
}
