import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listLeasingDecisions } from "@/lib/empty-container-repositioning-ai/service";
import { createLeasingDecisionSchema } from "@/lib/empty-container-repositioning-ai/validation";
import { db } from "@/lib/db";
import { ecrLeasingDecisions } from "@/db/schema";
import { nanoid } from "nanoid";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "ecr:read"))) return forbiddenResponse();
    const { searchParams } = new URL(request.url);
    const result = await listLeasingDecisions({
      tenantId: user.tenantId,
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ? Math.min(parseInt(searchParams.get("limit")!), 100) : undefined,
    });
    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (error) {
    console.error("Failed to list leasing decisions:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "ecr:create"))) return forbiddenResponse();
    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;
    const body = await request.json();
    const parsed = createLeasingDecisionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });
    const [record] = await db.insert(ecrLeasingDecisions).values({ tenantId: user.tenantId, decisionRef: `LD-${nanoid(12)}`, ...parsed.data, status: "draft" }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "leasing-decisions", entityId: record.id, module: "empty-container-repositioning-ai", newData: record as Record<string, unknown>, request });
    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    console.error("Failed to create leasing decision:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
