import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { clmLeaseVsBuyAnalyses } from "@/db/schema";
import { getLeaseVsBuyAnalysis } from "@/lib/container-leasing-management/service";
import { updateLeaseVsBuyAnalysisSchema } from "@/lib/container-leasing-management/validation";
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
    if (!(await hasPermission(user.id, user.tenantId, "clm:read"))) return forbiddenResponse();

    const { id } = await params;
    const record = await getLeaseVsBuyAnalysis(id, user.tenantId);
    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Lease vs buy analysis not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get lease vs buy analysis:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "clm:edit"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const parsed = updateLeaseVsBuyAnalysisSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const [record] = await db
      .update(clmLeaseVsBuyAnalyses)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(clmLeaseVsBuyAnalyses.id, id), eq(clmLeaseVsBuyAnalyses.tenantId, user.tenantId)))
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "lease-vs-buy-analyses", entityId: record?.id, module: "container-leasing-management", previousData: null, newData: record as Record<string, unknown>, request });

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Lease vs buy analysis not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to update lease vs buy analysis:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "clm:delete"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const [record] = await db
      .update(clmLeaseVsBuyAnalyses)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(clmLeaseVsBuyAnalyses.id, id), eq(clmLeaseVsBuyAnalyses.tenantId, user.tenantId)))
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "lease-vs-buy-analyses", entityId: record?.id, module: "container-leasing-management", previousData: null, request });

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Lease vs buy analysis not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Failed to delete lease vs buy analysis:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
