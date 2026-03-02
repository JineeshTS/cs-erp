import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { abiVoyageAnalytics } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createVoyageAnalyticsSchema } from "@/lib/analytics-business-intelligence/validation";
import { eq, and, isNull, desc, ilike, or, gt } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "analytics:read"))) return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const cursor = searchParams.get("cursor") ?? "";
    const limit = 50;

    const conditions = [eq(abiVoyageAnalytics.tenantId, user.tenantId), isNull(abiVoyageAnalytics.deletedAt)];
    if (search) conditions.push(or(ilike(abiVoyageAnalytics.analyticsRef, `%${search}%`), ilike(abiVoyageAnalytics.vesselName, `%${search}%`), ilike(abiVoyageAnalytics.serviceName, `%${search}%`))!);
    if (status) conditions.push(eq(abiVoyageAnalytics.status, status));
    if (cursor) conditions.push(gt(abiVoyageAnalytics.createdAt, new Date(cursor)));

    const results = await db.select().from(abiVoyageAnalytics).where(and(...conditions)).orderBy(desc(abiVoyageAnalytics.createdAt)).limit(limit + 1);
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    return NextResponse.json({ data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } });
  } catch (error) {
    console.error("Failed to list voyage analytics:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "analytics:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createVoyageAnalyticsSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });

    const analyticsRef = `AVA-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const [created] = await db.insert(abiVoyageAnalytics).values({ ...parsed.data, analyticsRef, tenantId: user.tenantId }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create voyage analytics:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
