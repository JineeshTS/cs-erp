import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getTcfdReport } from "@/lib/sustainability-esg-reporting/service";
import { updateTcfdReportSchema } from "@/lib/sustainability-esg-reporting/validation";
import { db } from "@/lib/db";
import { serTcfdReports } from "@/db/schema";
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
    if (!(await hasPermission(user.id, user.tenantId, "ser:read")))
      return forbiddenResponse();

    const { id } = await params;
    const record = await getTcfdReport(id, user.tenantId);
    if (!record)
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "TCFD report not found" } },
        { status: 404 }
      );

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get TCFD report:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "ser:edit")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf)
      return NextResponse.json(
        { error: { code: "CSRF_MISSING", message: "CSRF token required" } },
        { status: 403 }
      );

    const { id } = await params;
    const existing = await getTcfdReport(id, user.tenantId);
    if (!existing)
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "TCFD report not found" } },
        { status: 404 }
      );

    const body = await request.json();
    const parsed = updateTcfdReportSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );

    const [updated] = await db
      .update(serTcfdReports)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(serTcfdReports.id, id),
          eq(serTcfdReports.tenantId, user.tenantId)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "tcfd-reports", entityId: updated?.id, module: "sustainability-esg-reporting", previousData: existing as Record<string, unknown>, newData: updated as Record<string, unknown>, request });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update TCFD report:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "ser:delete")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf)
      return NextResponse.json(
        { error: { code: "CSRF_MISSING", message: "CSRF token required" } },
        { status: 403 }
      );

    const { id } = await params;
    const existing = await getTcfdReport(id, user.tenantId);
    if (!existing)
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "TCFD report not found" } },
        { status: 404 }
      );

    const [deleted] = await db
      .update(serTcfdReports)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(serTcfdReports.id, id),
          eq(serTcfdReports.tenantId, user.tenantId)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "tcfd-reports", entityId: deleted?.id, module: "sustainability-esg-reporting", previousData: existing as Record<string, unknown>, request });

    return NextResponse.json({ data: deleted });
  } catch (error) {
    console.error("Failed to delete TCFD report:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
