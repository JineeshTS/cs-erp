import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { acmInternalAudits } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createInternalAuditSchema } from "@/lib/audit-compliance-management/validation";
import { eq, and, isNull, desc, ilike, or, gt } from "drizzle-orm";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "audit:read"))) return forbiddenResponse();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const cursor = searchParams.get("cursor") ?? "";
    const limit = 50;
    const conditions = [eq(acmInternalAudits.tenantId, user.tenantId), isNull(acmInternalAudits.deletedAt)];
    if (search) conditions.push(or(ilike(acmInternalAudits.auditRef, `%${search}%`), ilike(acmInternalAudits.title, `%${search}%`))!);
    if (status) conditions.push(eq(acmInternalAudits.status, status));
    if (cursor) conditions.push(gt(acmInternalAudits.createdAt, new Date(cursor)));
    const results = await db.select().from(acmInternalAudits).where(and(...conditions)).orderBy(desc(acmInternalAudits.createdAt)).limit(limit + 1);
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    return NextResponse.json({ data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } });
  } catch (error) {
    console.error("Failed to list internal audits:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "audit:create"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });
    const body = await request.json();
    const parsed = createInternalAuditSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });
    const auditRef = `AIA-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const [created] = await db.insert(acmInternalAudits).values({ ...parsed.data, auditRef, tenantId: user.tenantId }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "internal-audits", entityId: created?.id, module: "audit-compliance-management", newData: created as Record<string, unknown>, request });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create internal audit:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
