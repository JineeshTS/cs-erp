import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { mobExecutiveDashboards } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getExecutiveDashboard } from "@/lib/mobile-operations-app/service";
import { updateExecutiveDashboardSchema } from "@/lib/mobile-operations-app/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "mob:read")))
      return forbiddenResponse();

    const { id } = await params;
    const record = await getExecutiveDashboard(id, user.tenantId);
    if (!record)
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Executive dashboard not found" } },
        { status: 404 }
      );

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get executive dashboard:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "mob:edit")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateExecutiveDashboardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const [updated] = await db
      .update(mobExecutiveDashboards)
      .set(parsed.data)
      .where(
        and(
          eq(mobExecutiveDashboards.id, id),
          eq(mobExecutiveDashboards.tenantId, user.tenantId),
          isNull(mobExecutiveDashboards.deletedAt)
        )
      )
      .returning();

    if (!updated)
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Executive dashboard not found" } },
        { status: 404 }
      );

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "executive-dashboards", entityId: updated.id, module: "mobile-operations-app", previousData: null, newData: updated as Record<string, unknown>, request });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update executive dashboard:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "mob:delete")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const [deleted] = await db
      .update(mobExecutiveDashboards)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(mobExecutiveDashboards.id, id),
          eq(mobExecutiveDashboards.tenantId, user.tenantId),
          isNull(mobExecutiveDashboards.deletedAt)
        )
      )
      .returning({ id: mobExecutiveDashboards.id });

    if (!deleted)
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Executive dashboard not found" } },
        { status: 404 }
      );

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "executive-dashboards", entityId: deleted.id, module: "mobile-operations-app", previousData: null, request });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete executive dashboard:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
