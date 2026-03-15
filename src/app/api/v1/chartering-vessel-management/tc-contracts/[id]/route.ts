import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { cvmTcContracts } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateTcContractSchema } from "@/lib/chartering-vessel-management/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "chartering:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(cvmTcContracts)
      .where(and(eq(cvmTcContracts.id, id), eq(cvmTcContracts.tenantId, user.tenantId), isNull(cvmTcContracts.deletedAt)))
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "TC contract not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get TC contract:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "chartering:edit"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const parsed = updateTcContractSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { deliveryDate, redeliveryDate, commissionPercent, ...rest } = parsed.data;
    const updateData: Record<string, unknown> = { ...rest };
    if (deliveryDate !== undefined) updateData.deliveryDate = new Date(deliveryDate);
    if (redeliveryDate !== undefined) updateData.redeliveryDate = new Date(redeliveryDate);
    if (commissionPercent !== undefined) updateData.commissionPercent = commissionPercent.toString();

    const [updated] = await db.update(cvmTcContracts).set(updateData)
      .where(and(eq(cvmTcContracts.id, id), eq(cvmTcContracts.tenantId, user.tenantId), isNull(cvmTcContracts.deletedAt)))
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "tc-contracts", entityId: updated?.id, module: "chartering-vessel-management", previousData: null, newData: updated as Record<string, unknown>, request });

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "TC contract not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update TC contract:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "chartering:delete"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const [deleted] = await db.update(cvmTcContracts).set({ deletedAt: new Date() })
      .where(and(eq(cvmTcContracts.id, id), eq(cvmTcContracts.tenantId, user.tenantId), isNull(cvmTcContracts.deletedAt)))
      .returning({ id: cvmTcContracts.id });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "tc-contracts", entityId: deleted?.id, module: "chartering-vessel-management", previousData: null, request });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "TC contract not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete TC contract:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
