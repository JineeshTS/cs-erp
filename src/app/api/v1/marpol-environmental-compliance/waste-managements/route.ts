import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listWasteManagements } from "@/lib/marpol-environmental-compliance/service";
import { createWasteManagementSchema } from "@/lib/marpol-environmental-compliance/validation";
import { db } from "@/lib/db";
import { mecWasteManagements } from "@/db/schema";
import { nanoid } from "nanoid";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "mec:read"))) return forbiddenResponse();
    const { searchParams } = new URL(request.url);
    const result = await listWasteManagements({
      tenantId: user.tenantId,
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ? Math.min(parseInt(searchParams.get("limit")!), 100) : undefined,
    });
    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (error) {
    console.error("Failed to list waste managements:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "mec:create"))) return forbiddenResponse();
    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;
    const body = await request.json();
    const parsed = createWasteManagementSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });
    const [record] = await db.insert(mecWasteManagements).values({ tenantId: user.tenantId, wasteRef: `WM-${nanoid(12)}`, ...parsed.data, status: "draft" }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "waste-managements", entityId: record.id, module: "marpol-environmental-compliance", newData: record as Record<string, unknown>, request });
    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    console.error("Failed to create waste management:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
