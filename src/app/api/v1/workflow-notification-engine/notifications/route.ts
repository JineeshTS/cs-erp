import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { wneNotifications } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createNotificationSchema } from "@/lib/workflow-notification-engine/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "notifications:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const channel = url.searchParams.get("channel") || "";
    const status = url.searchParams.get("status") || "";
    const userId = url.searchParams.get("userId") || user.id;
    const entityType = url.searchParams.get("entityType") || "";
    const unread = url.searchParams.get("unread");
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [
      eq(wneNotifications.tenantId, user.tenantId),
      isNull(wneNotifications.deletedAt),
      eq(wneNotifications.userId, userId),
    ];
    if (channel) conditions.push(eq(wneNotifications.channel, channel));
    if (status) conditions.push(eq(wneNotifications.status, status));
    if (entityType) conditions.push(eq(wneNotifications.entityType, entityType));
    if (unread === "true") conditions.push(isNull(wneNotifications.readAt));
    if (cursor) conditions.push(gt(wneNotifications.createdAt, new Date(cursor)));

    const results = await db
      .select()
      .from(wneNotifications)
      .where(and(...conditions))
      .orderBy(desc(wneNotifications.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (err) {
    console.error("Notifications list error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch notifications" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "notifications:create"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createNotificationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const [created] = await db
      .insert(wneNotifications)
      .values({
        tenantId: user.tenantId,
        ...parsed.data,
      })
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "notifications", entityId: created?.id, module: "workflow-notification-engine", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("Notification create error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create notification" } },
      { status: 500 }
    );
  }
}
