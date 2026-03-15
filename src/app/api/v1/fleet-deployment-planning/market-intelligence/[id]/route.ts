import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getMarketIntelligence } from "@/lib/fleet-deployment-planning/service";
import { updateMarketIntelligenceSchema } from "@/lib/fleet-deployment-planning/validation";
import { db } from "@/lib/db";
import { fdpMarketIntelligence } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "fdp:read"))) return forbiddenResponse();
    const { id } = await params;
    const record = await getMarketIntelligence(id, user.tenantId);
    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get market intelligence:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "fdp:edit"))) return forbiddenResponse();
    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) {
      return NextResponse.json(
        { error: { code: "CSRF_MISSING", message: "CSRF token required" } },
        { status: 403 }
      );
    }
    const { id } = await params;
    const existing = await getMarketIntelligence(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Not found" } },
        { status: 404 }
      );
    }
    const body = await request.json();
    const parsed = updateMarketIntelligenceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }
    const [updated] = await db
      .update(fdpMarketIntelligence)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(fdpMarketIntelligence.id, id), eq(fdpMarketIntelligence.tenantId, user.tenantId)))
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "market-intelligence", entityId: updated?.id, module: "fleet-deployment-planning", previousData: existing as Record<string, unknown>, newData: updated as Record<string, unknown>, request });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update market intelligence:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "fdp:delete"))) return forbiddenResponse();
    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) {
      return NextResponse.json(
        { error: { code: "CSRF_MISSING", message: "CSRF token required" } },
        { status: 403 }
      );
    }
    const { id } = await params;
    const existing = await getMarketIntelligence(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Not found" } },
        { status: 404 }
      );
    }
    const [deleted] = await db
      .update(fdpMarketIntelligence)
      .set({ deletedAt: new Date() })
      .where(and(eq(fdpMarketIntelligence.id, id), eq(fdpMarketIntelligence.tenantId, user.tenantId)))
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "market-intelligence", entityId: deleted?.id, module: "fleet-deployment-planning", previousData: existing as Record<string, unknown>, request });
    return NextResponse.json({ data: deleted });
  } catch (error) {
    console.error("Failed to delete market intelligence:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
