import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ielCustomsFilings } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";
import { getCustomsFiling } from "@/lib/integration-edi-layer/service";
import { updateCustomsFilingSchema } from "@/lib/integration-edi-layer/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "integration:read"))) return forbiddenResponse();

    const { id } = await params;
    const record = await getCustomsFiling(id, user.tenantId);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Customs filing not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get customs filing:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "integration:edit"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCustomsFilingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    // Only allow updates when status is "draft"
    const existing = await getCustomsFiling(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Customs filing not found" } },
        { status: 404 }
      );
    }

    if (existing.status !== "draft") {
      return NextResponse.json(
        { error: { code: "INVALID_STATUS", message: "Only draft filings can be updated" } },
        { status: 409 }
      );
    }

    const [updated] = await db.update(ielCustomsFilings)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(
        eq(ielCustomsFilings.id, id),
        eq(ielCustomsFilings.tenantId, user.tenantId),
        isNull(ielCustomsFilings.deletedAt)
      ))
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "filings", entityId: updated?.id, module: "integration-edi-layer", previousData: existing as Record<string, unknown>, newData: updated as Record<string, unknown>, request });

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Customs filing not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update customs filing:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
