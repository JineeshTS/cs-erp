import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { scmOpportunities } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateOpportunitySchema } from "@/lib/sales-crm/validation";
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
    const [record] = await db.select().from(scmOpportunities)
      .where(and(eq(scmOpportunities.id, id), eq(scmOpportunities.tenantId, user.tenantId), isNull(scmOpportunities.deletedAt))).limit(1);

    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Opportunity not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (err) {
    console.error("Opportunity get error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch opportunity" } },
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
    const parsed = updateOpportunitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });
    }

    // Fetch existing to detect status transitions
    const [existing] = await db.select().from(scmOpportunities)
      .where(and(eq(scmOpportunities.id, id), eq(scmOpportunities.tenantId, user.tenantId), isNull(scmOpportunities.deletedAt))).limit(1);
    if (!existing) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Opportunity not found" } }, { status: 404 });

    const [updated] = await db.update(scmOpportunities).set(parsed.data)
      .where(and(eq(scmOpportunities.id, id), eq(scmOpportunities.tenantId, user.tenantId), isNull(scmOpportunities.deletedAt))).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "opportunities", entityId: existing.id, module: "sales-crm", previousData: null, newData: existing as Record<string, unknown>, request });

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Opportunity not found" } }, { status: 404 });

    if (updated.status === "won" && existing.status !== "won") {
      eventBus.emit({
        type: "OPPORTUNITY_WON",
        tenantId: user.tenantId,
        userId: user.id,
        entityId: updated.id,
        entityType: "opportunity",
        timestamp: new Date(),
        data: {
          opportunityName: updated.opportunityName,
          customerId: updated.customerId,
          expectedRevenue: updated.expectedRevenue ?? undefined,
        },
      });
    }

    if (updated.status === "lost" && existing.status !== "lost") {
      eventBus.emit({
        type: "OPPORTUNITY_LOST",
        tenantId: user.tenantId,
        userId: user.id,
        entityId: updated.id,
        entityType: "opportunity",
        timestamp: new Date(),
        data: {
          opportunityName: updated.opportunityName,
          customerId: updated.customerId,
          lostReason: updated.lostReason ?? undefined,
          competitorName: updated.competitorName ?? undefined,
        },
      });
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("Opportunity update error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update opportunity" } },
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
    const [deleted] = await db.update(scmOpportunities).set({ deletedAt: new Date() })
      .where(and(eq(scmOpportunities.id, id), eq(scmOpportunities.tenantId, user.tenantId), isNull(scmOpportunities.deletedAt))).returning({ id: scmOpportunities.id });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Opportunity not found" } }, { status: 404 });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "opportunities", entityId: deleted.id, module: "sales-crm", previousData: null, request });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (err) {
    console.error("Opportunity delete error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete opportunity" } },
      { status: 500 }
    );
  }
}
