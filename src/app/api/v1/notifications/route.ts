import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse } from "@/lib/auth/api-auth";
import { db } from "@/lib/db";
import { wneNotifications } from "@/db/schema";
import { and, eq, isNull, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();

  const unreadOnly = request.nextUrl.searchParams.get("unread") === "true";
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "20"), 50);

  const rows = await db
    .select({
      id: wneNotifications.id,
      title: wneNotifications.title,
      body: wneNotifications.body,
      priority: wneNotifications.priority,
      status: wneNotifications.status,
      readAt: wneNotifications.readAt,
      createdAt: wneNotifications.createdAt,
      entityType: wneNotifications.entityType,
      entityId: wneNotifications.entityId,
    })
    .from(wneNotifications)
    .where(and(
      eq(wneNotifications.userId, user.id),
      eq(wneNotifications.tenantId, user.tenantId),
      isNull(wneNotifications.deletedAt),
      unreadOnly ? isNull(wneNotifications.readAt) : undefined,
    ))
    .orderBy(desc(wneNotifications.createdAt))
    .limit(limit);

  // Count unread
  const unreadRows = await db
    .select({ id: wneNotifications.id })
    .from(wneNotifications)
    .where(and(
      eq(wneNotifications.userId, user.id),
      eq(wneNotifications.tenantId, user.tenantId),
      isNull(wneNotifications.deletedAt),
      isNull(wneNotifications.readAt),
    ))
    .limit(100);

  return NextResponse.json({
    data: rows,
    meta: { unreadCount: unreadRows.length },
  });
}

// Mark notification as read
export async function PATCH(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();

  const body = await request.json();
  const { id, markAllRead } = body as { id?: string; markAllRead?: boolean };

  if (markAllRead) {
    await db
      .update(wneNotifications)
      .set({ readAt: new Date() })
      .where(and(
        eq(wneNotifications.userId, user.id),
        eq(wneNotifications.tenantId, user.tenantId),
        isNull(wneNotifications.readAt),
      ));
    return NextResponse.json({ data: { markedAll: true } });
  }

  if (id) {
    await db
      .update(wneNotifications)
      .set({ readAt: new Date() })
      .where(and(
        eq(wneNotifications.id, id),
        eq(wneNotifications.userId, user.id),
      ));
    return NextResponse.json({ data: { id, read: true } });
  }

  return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Provide id or markAllRead" } }, { status: 400 });
}
