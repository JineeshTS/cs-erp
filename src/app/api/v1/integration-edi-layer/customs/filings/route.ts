import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ielCustomsFilings } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listCustomsFilings } from "@/lib/integration-edi-layer/service";
import { createCustomsFilingSchema } from "@/lib/integration-edi-layer/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "integration:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const filingType = url.searchParams.get("filingType") || "";
    const customsAuthority = url.searchParams.get("customsAuthority") || "";
    const cursor = url.searchParams.get("cursor") || "";
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const result = await listCustomsFilings(
      { tenantId: user.tenantId, search: search || undefined, status: status || undefined, cursor: cursor || undefined, limit },
      filingType || undefined,
      customsAuthority || undefined
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to list customs filings:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "integration:create"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createCustomsFilingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const filingRef = `CUS-${Date.now()}`;

    const [created] = await db.insert(ielCustomsFilings).values({
      tenantId: user.tenantId,
      filingRef,
      ...parsed.data,
    }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "filings", entityId: created?.id, module: "integration-edi-layer", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create customs filing:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
