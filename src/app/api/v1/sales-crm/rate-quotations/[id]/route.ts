import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { scmRateQuotations } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateRateQuotationSchema } from "@/lib/sales-crm/validation";
import { eventBus } from "@/lib/events/event-bus";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "sales:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(scmRateQuotations)
      .where(and(eq(scmRateQuotations.id, id), eq(scmRateQuotations.tenantId, user.tenantId), isNull(scmRateQuotations.deletedAt))).limit(1);

    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Rate quotation not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (err) {
    console.error("Rate quotation get error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch rate quotation" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "sales:edit"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const parsed = updateRateQuotationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });
    }

    // Fetch existing to detect status transitions
    const [existing] = await db.select().from(scmRateQuotations)
      .where(and(eq(scmRateQuotations.id, id), eq(scmRateQuotations.tenantId, user.tenantId), isNull(scmRateQuotations.deletedAt))).limit(1);
    if (!existing) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Rate quotation not found" } }, { status: 404 });

    const { validFrom, validTo, ...rest } = parsed.data;
    const [updated] = await db.update(scmRateQuotations).set({
      ...rest,
      ...(validFrom !== undefined && { validFrom: new Date(validFrom) }),
      ...(validTo !== undefined && { validTo: new Date(validTo) }),
    }).where(and(eq(scmRateQuotations.id, id), eq(scmRateQuotations.tenantId, user.tenantId), isNull(scmRateQuotations.deletedAt))).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "rate-quotations", entityId: existing?.id, module: "sales-crm", previousData: null, newData: existing as Record<string, unknown>, request });

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Rate quotation not found" } }, { status: 404 });

    if (updated.status === "approved" && existing.status !== "approved") {
      eventBus.emit({
        type: "QUOTATION_APPROVED",
        tenantId: user.tenantId,
        userId: user.id,
        entityId: updated.id,
        entityType: "rate_quotation",
        timestamp: new Date(),
        data: {
          quotationNumber: updated.quotationNumber,
          customerId: updated.customerId,
          approvedBy: updated.approvedBy ?? user.id,
        },
      });
    }

    if (updated.status === "accepted" && existing.status !== "accepted") {
      eventBus.emit({
        type: "QUOTATION_ACCEPTED",
        tenantId: user.tenantId,
        userId: user.id,
        entityId: updated.id,
        entityType: "rate_quotation",
        timestamp: new Date(),
        data: {
          quotationNumber: updated.quotationNumber,
          customerId: updated.customerId,
          opportunityId: updated.opportunityId ?? undefined,
        },
      });
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("Rate quotation update error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update rate quotation" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "sales:delete"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const [deleted] = await db.update(scmRateQuotations).set({ deletedAt: new Date() })
      .where(and(eq(scmRateQuotations.id, id), eq(scmRateQuotations.tenantId, user.tenantId), isNull(scmRateQuotations.deletedAt))).returning({ id: scmRateQuotations.id });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "rate-quotations", entityId: deleted?.id, module: "sales-crm", previousData: null, request });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Rate quotation not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (err) {
    console.error("Rate quotation delete error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete rate quotation" } },
      { status: 500 }
    );
  }
}
