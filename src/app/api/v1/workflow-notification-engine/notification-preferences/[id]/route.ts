import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { wneNotificationPreferences } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "notifications:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db
      .select()
      .from(wneNotificationPreferences)
      .where(
        and(
          eq(wneNotificationPreferences.id, id),
          eq(wneNotificationPreferences.tenantId, user.tenantId),
          isNull(wneNotificationPreferences.deletedAt)
        )
      )
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Notification preference not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (err) {
    console.error("Notification preference get error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch notification preference" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "notifications:manage"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const body = await request.json();

    if (typeof body.isEnabled !== "boolean") {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "isEnabled must be a boolean" } },
        { status: 422 }
      );
    }

    const [updated] = await db
      .update(wneNotificationPreferences)
      .set({ isEnabled: body.isEnabled })
      .where(
        and(
          eq(wneNotificationPreferences.id, id),
          eq(wneNotificationPreferences.tenantId, user.tenantId),
          isNull(wneNotificationPreferences.deletedAt)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "notification-preferences", entityId: updated?.id, module: "workflow-notification-engine", previousData: null, newData: updated as Record<string, unknown>, request });

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Notification preference not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("Notification preference update error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update notification preference" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "notifications:manage"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const [deleted] = await db
      .update(wneNotificationPreferences)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(wneNotificationPreferences.id, id),
          eq(wneNotificationPreferences.tenantId, user.tenantId),
          isNull(wneNotificationPreferences.deletedAt)
        )
      )
      .returning({ id: wneNotificationPreferences.id });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "notification-preferences", entityId: deleted?.id, module: "workflow-notification-engine", previousData: null, request });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Notification preference not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (err) {
    console.error("Notification preference delete error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete notification preference" } },
      { status: 500 }
    );
  }
}
