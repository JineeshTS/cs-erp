import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getTcSettlement } from "@/lib/voyage-results-settlement/service";
import { updateTcSettlementSchema } from "@/lib/voyage-results-settlement/validation";
import { db } from "@/lib/db";
import { vrsTcSettlements } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "vrs:read")))
      return forbiddenResponse();

    const { id } = await params;
    const record = await getTcSettlement(id, user.tenantId);
    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "TC settlement not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get TC settlement:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "vrs:edit")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const existing = await getTcSettlement(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "TC settlement not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updateTcSettlementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const [updated] = await db.update(vrsTcSettlements)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(vrsTcSettlements.id, id), eq(vrsTcSettlements.tenantId, user.tenantId)))
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "tc-settlements", entityId: updated?.id, module: "voyage-results-settlement", previousData: existing as Record<string, unknown>, newData: updated as Record<string, unknown>, request });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update TC settlement:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "vrs:delete")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const existing = await getTcSettlement(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "TC settlement not found" } },
        { status: 404 }
      );
    }

    const [deleted] = await db.update(vrsTcSettlements)
      .set({ deletedAt: new Date() })
      .where(and(eq(vrsTcSettlements.id, id), eq(vrsTcSettlements.tenantId, user.tenantId)))
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "tc-settlements", entityId: deleted?.id, module: "voyage-results-settlement", previousData: existing as Record<string, unknown>, request });

    return NextResponse.json({ data: deleted });
  } catch (error) {
    console.error("Failed to delete TC settlement:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
