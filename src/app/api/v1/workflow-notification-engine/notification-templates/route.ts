import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { wneNotificationTemplates } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createNotificationTemplateSchema } from "@/lib/workflow-notification-engine/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "notifications:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const channel = url.searchParams.get("channel") || "";
    const entityType = url.searchParams.get("entityType") || "";
    const isActive = url.searchParams.get("isActive");
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [
      eq(wneNotificationTemplates.tenantId, user.tenantId),
      isNull(wneNotificationTemplates.deletedAt),
    ];
    if (search) conditions.push(ilike(wneNotificationTemplates.name, `%${search}%`));
    if (channel) conditions.push(eq(wneNotificationTemplates.channel, channel));
    if (entityType) conditions.push(eq(wneNotificationTemplates.entityType, entityType));
    if (isActive !== null && isActive !== undefined && isActive !== "") {
      conditions.push(eq(wneNotificationTemplates.isActive, isActive === "true"));
    }
    if (cursor) conditions.push(gt(wneNotificationTemplates.createdAt, new Date(cursor)));

    const results = await db
      .select()
      .from(wneNotificationTemplates)
      .where(and(...conditions))
      .orderBy(desc(wneNotificationTemplates.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (err) {
    console.error("Notification templates list error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch notification templates" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "notifications:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createNotificationTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [created] = await db
      .insert(wneNotificationTemplates)
      .values({
        tenantId: user.tenantId,
        ...parsed.data,
      })
      .returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("Notification template create error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create notification template" } },
      { status: 500 }
    );
  }
}
