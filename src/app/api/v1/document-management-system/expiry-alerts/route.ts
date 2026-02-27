import { NextRequest, NextResponse } from "next/server";
import { eq, and, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { dmsExpiryAlerts } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createExpiryAlertSchema } from "@/lib/document-management-system/validation";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "documents:read"))) return forbiddenResponse();

  try {
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [eq(dmsExpiryAlerts.tenantId, user.tenantId), isNull(dmsExpiryAlerts.deletedAt)];
    if (cursor) conditions.push(gt(dmsExpiryAlerts.createdAt, new Date(cursor)));

    const results = await db.select().from(dmsExpiryAlerts)
      .where(and(...conditions))
      .orderBy(desc(dmsExpiryAlerts.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (err) {
    console.error("List expiry alerts error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to list expiry alerts" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "documents:read"))) return forbiddenResponse();

  try {
    const body = await request.json();
    const parsed = createExpiryAlertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const { alertDate, ...rest } = parsed.data;
    const [created] = await db.insert(dmsExpiryAlerts).values({
      tenantId: user.tenantId,
      ...rest,
      alertDate: new Date(alertDate),
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("Create expiry alert error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create expiry alert" } },
      { status: 500 }
    );
  }
}
