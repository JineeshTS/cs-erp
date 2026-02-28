import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { odmVgmRecords } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createVgmRecordSchema } from "@/lib/operations-documentation/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "operations:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [eq(odmVgmRecords.tenantId, user.tenantId), isNull(odmVgmRecords.deletedAt)];
    if (search) conditions.push(ilike(odmVgmRecords.vgmReference, `%${search}%`));
    if (status) conditions.push(eq(odmVgmRecords.status, status));
    if (cursor) conditions.push(gt(odmVgmRecords.createdAt, new Date(cursor)));

    const results = await db.select().from(odmVgmRecords).where(and(...conditions)).orderBy(desc(odmVgmRecords.createdAt)).limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list VGM records:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "operations:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createVgmRecordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });
    }

    const [created] = await db.insert(odmVgmRecords).values({ tenantId: user.tenantId, ...parsed.data }).returning();
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create VGM record:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
