import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { dmsExpiryAlerts } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateExpiryAlertSchema } from "@/lib/document-management-system/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "documents:read"))) return forbiddenResponse();

  try {
    const { id } = await params;
    const [record] = await db.select().from(dmsExpiryAlerts)
      .where(and(
        eq(dmsExpiryAlerts.id, id),
        eq(dmsExpiryAlerts.tenantId, user.tenantId),
        isNull(dmsExpiryAlerts.deletedAt)
      )).limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Expiry alert not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (err) {
    console.error("Get expiry alert error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch expiry alert" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "documents:edit"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateExpiryAlertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { renewalDate, ...restData } = parsed.data;
    const updateData: Record<string, unknown> = {
      ...restData,
      ...(renewalDate !== undefined ? { renewalDate: new Date(renewalDate) } : {}),
    };
    if (parsed.data.status === "acknowledged") {
      updateData.acknowledgedAt = new Date();
      updateData.acknowledgedBy = user.id;
    }
    if (parsed.data.status === "notified") {
      updateData.notifiedAt = new Date();
    }

    const [updated] = await db.update(dmsExpiryAlerts).set(updateData)
      .where(and(
        eq(dmsExpiryAlerts.id, id),
        eq(dmsExpiryAlerts.tenantId, user.tenantId),
        isNull(dmsExpiryAlerts.deletedAt)
      )).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "expiry-alerts", entityId: updated?.id, module: "document-management-system", previousData: null, newData: updated as Record<string, unknown>, request });

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Expiry alert not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("Update expiry alert error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update expiry alert" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "documents:delete"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

  try {
    const { id } = await params;
    const [deleted] = await db.update(dmsExpiryAlerts).set({ deletedAt: new Date() })
      .where(and(
        eq(dmsExpiryAlerts.id, id),
        eq(dmsExpiryAlerts.tenantId, user.tenantId),
        isNull(dmsExpiryAlerts.deletedAt)
      )).returning({ id: dmsExpiryAlerts.id });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "expiry-alerts", entityId: deleted?.id, module: "document-management-system", previousData: null, request });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Expiry alert not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (err) {
    console.error("Delete expiry alert error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete expiry alert" } },
      { status: 500 }
    );
  }
}
