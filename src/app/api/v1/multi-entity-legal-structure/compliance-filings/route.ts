import { NextRequest, NextResponse } from "next/server";
import { eq, and, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { melsComplianceFilings } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createComplianceFilingSchema } from "@/lib/multi-entity-legal-structure/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "entities:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);
    const complianceRuleId = url.searchParams.get("complianceRuleId");
    const legalEntityId = url.searchParams.get("legalEntityId");
    const status = url.searchParams.get("status");

    const conditions = [eq(melsComplianceFilings.tenantId, user.tenantId), isNull(melsComplianceFilings.deletedAt)];
    if (complianceRuleId) conditions.push(eq(melsComplianceFilings.complianceRuleId, complianceRuleId));
    if (legalEntityId) conditions.push(eq(melsComplianceFilings.legalEntityId, legalEntityId));
    if (status) conditions.push(eq(melsComplianceFilings.status, status));
    if (cursor) conditions.push(gt(melsComplianceFilings.createdAt, new Date(cursor)));

    const results = await db.select().from(melsComplianceFilings).where(and(...conditions))
      .orderBy(desc(melsComplianceFilings.createdAt)).limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list compliance filings:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "entities:create"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createComplianceFilingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { dueDate, filedAt, ...rest } = parsed.data;
    const [created] = await db.insert(melsComplianceFilings).values({
      tenantId: user.tenantId,
      ...rest,
      dueDate: new Date(dueDate),
      ...(filedAt ? { filedAt: new Date(filedAt) } : {}),
    }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "compliance-filings", entityId: created?.id, module: "multi-entity-legal-structure", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create compliance filing:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
