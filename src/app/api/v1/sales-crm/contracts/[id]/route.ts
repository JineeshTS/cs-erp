import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { scmContracts } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateContractSchema } from "@/lib/sales-crm/validation";
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
    const [record] = await db.select().from(scmContracts)
      .where(and(eq(scmContracts.id, id), eq(scmContracts.tenantId, user.tenantId), isNull(scmContracts.deletedAt))).limit(1);

    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Contract not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (err) {
    console.error("Contract get error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch contract" } },
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
    const parsed = updateContractSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });
    }

    // Fetch existing to detect status transitions
    const [existing] = await db.select().from(scmContracts)
      .where(and(eq(scmContracts.id, id), eq(scmContracts.tenantId, user.tenantId), isNull(scmContracts.deletedAt))).limit(1);
    if (!existing) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Contract not found" } }, { status: 404 });

    const { startDate, endDate, ...rest } = parsed.data;
    const [updated] = await db.update(scmContracts).set({
      ...rest,
      ...(startDate !== undefined && { startDate: new Date(startDate) }),
      ...(endDate !== undefined && { endDate: new Date(endDate) }),
    }).where(and(eq(scmContracts.id, id), eq(scmContracts.tenantId, user.tenantId), isNull(scmContracts.deletedAt))).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "contracts", entityId: existing.id, module: "sales-crm", previousData: null, newData: existing as Record<string, unknown>, request });

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Contract not found" } }, { status: 404 });

    if (updated.status === "active" && existing.status !== "active") {
      eventBus.emit({
        type: "CONTRACT_ACTIVATED",
        tenantId: user.tenantId,
        userId: user.id,
        entityId: updated.id,
        entityType: "contract",
        timestamp: new Date(),
        data: {
          contractNumber: updated.contractNumber,
          contractName: updated.contractName,
          customerId: updated.customerId,
          startDate: updated.startDate.toISOString(),
          endDate: updated.endDate.toISOString(),
        },
      });
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("Contract update error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update contract" } },
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
    const [deleted] = await db.update(scmContracts).set({ deletedAt: new Date() })
      .where(and(eq(scmContracts.id, id), eq(scmContracts.tenantId, user.tenantId), isNull(scmContracts.deletedAt))).returning({ id: scmContracts.id });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Contract not found" } }, { status: 404 });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "contracts", entityId: deleted.id, module: "sales-crm", previousData: null, request });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (err) {
    console.error("Contract delete error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete contract" } },
      { status: 500 }
    );
  }
}
