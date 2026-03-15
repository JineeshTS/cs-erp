import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { crmFlagStateCompliance } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listFlagStateCompliance } from "@/lib/crew-management/service";
import { createFlagStateComplianceSchema } from "@/lib/crew-management/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "crew:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const cursor = url.searchParams.get("cursor") || undefined;
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const result = await listFlagStateCompliance({ tenantId: user.tenantId, search, status, cursor, limit });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to list flag state compliance:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "crew:create"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createFlagStateComplianceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const complianceRef = `FSC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const [created] = await db
      .insert(crmFlagStateCompliance)
      .values({ tenantId: user.tenantId, complianceRef, ...parsed.data })
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "flag-state-compliance", entityId: created?.id, module: "crew-management", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create flag state compliance:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
