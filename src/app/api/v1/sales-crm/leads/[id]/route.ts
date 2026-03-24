import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { scmLeads } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateLeadSchema } from "@/lib/sales-crm/validation";
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
    const [record] = await db.select().from(scmLeads)
      .where(and(eq(scmLeads.id, id), eq(scmLeads.tenantId, user.tenantId), isNull(scmLeads.deletedAt))).limit(1);

    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Lead not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (err) {
    console.error("Lead get error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch lead" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "sales:edit"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });
    }

    // Fetch existing to detect status transitions
    const [existing] = await db.select().from(scmLeads)
      .where(and(eq(scmLeads.id, id), eq(scmLeads.tenantId, user.tenantId), isNull(scmLeads.deletedAt))).limit(1);
    if (!existing) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Lead not found" } }, { status: 404 });

    const [updated] = await db.update(scmLeads).set(parsed.data)
      .where(and(eq(scmLeads.id, id), eq(scmLeads.tenantId, user.tenantId), isNull(scmLeads.deletedAt))).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "leads", entityId: existing.id, module: "sales-crm", previousData: null, newData: existing as Record<string, unknown>, request });

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Lead not found" } }, { status: 404 });

    // Emit events on status transitions
    if (updated.status === "qualified" && existing.status !== "qualified") {
      eventBus.emit({
        type: "LEAD_QUALIFIED",
        tenantId: user.tenantId,
        userId: user.id,
        entityId: updated.id,
        entityType: "lead",
        timestamp: new Date(),
        data: {
          companyName: updated.companyName,
          qualificationScore: updated.qualificationScore ?? 0,
          assignedTo: updated.assignedTo ?? undefined,
        },
      });
    }

    if (updated.status === "converted" && existing.status !== "converted") {
      eventBus.emit({
        type: "LEAD_CONVERTED",
        tenantId: user.tenantId,
        userId: user.id,
        entityId: updated.id,
        entityType: "lead",
        timestamp: new Date(),
        data: {
          companyName: updated.companyName,
          customerId: updated.convertedToCustomerId ?? "",
        },
      });
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("Lead update error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update lead" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "sales:delete"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const [deleted] = await db.update(scmLeads).set({ deletedAt: new Date() })
      .where(and(eq(scmLeads.id, id), eq(scmLeads.tenantId, user.tenantId), isNull(scmLeads.deletedAt))).returning({ id: scmLeads.id });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Lead not found" } }, { status: 404 });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "leads", entityId: deleted.id, module: "sales-crm", previousData: null, request });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (err) {
    console.error("Lead delete error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete lead" } },
      { status: 500 }
    );
  }
}
