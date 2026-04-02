import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getDemandForecast } from "@/lib/empty-container-repositioning-ai/service";
import { updateDemandForecastSchema } from "@/lib/empty-container-repositioning-ai/validation";
import { db } from "@/lib/db";
import { ecrDemandForecasts } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "ecr:read"))) return forbiddenResponse();
    const { id } = await params;
    const record = await getDemandForecast(id, user.tenantId);
    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get demand forecast:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "ecr:edit"))) return forbiddenResponse();
    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;
    const { id } = await params;
    const existing = await getDemandForecast(id, user.tenantId);
    if (!existing) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Not found" } }, { status: 404 });
    const body = await request.json();
    const parsed = updateDemandForecastSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });
    const [updated] = await db.update(ecrDemandForecasts).set({ ...parsed.data, updatedAt: new Date() }).where(and(eq(ecrDemandForecasts.id, id), eq(ecrDemandForecasts.tenantId, user.tenantId), isNull(ecrDemandForecasts.deletedAt))).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "demand-forecasts", entityId: updated.id, module: "empty-container-repositioning-ai", previousData: existing as Record<string, unknown>, newData: updated as Record<string, unknown>, request });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update demand forecast:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "ecr:delete"))) return forbiddenResponse();
    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;
    const { id } = await params;
    const existing = await getDemandForecast(id, user.tenantId);
    if (!existing) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Not found" } }, { status: 404 });
    const [deleted] = await db.update(ecrDemandForecasts).set({ deletedAt: new Date() }).where(and(eq(ecrDemandForecasts.id, id), eq(ecrDemandForecasts.tenantId, user.tenantId), isNull(ecrDemandForecasts.deletedAt))).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "demand-forecasts", entityId: deleted.id, module: "empty-container-repositioning-ai", previousData: existing as Record<string, unknown>, request });
    return NextResponse.json({ data: deleted });
  } catch (error) {
    console.error("Failed to delete demand forecast:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
