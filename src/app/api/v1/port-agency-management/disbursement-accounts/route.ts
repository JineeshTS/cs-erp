import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { pamDisbursementAccounts } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createDisbursementAccountSchema } from "@/lib/port-agency-management/validation";
import { eq, and, isNull, desc, ilike, or, lt } from "drizzle-orm";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "port_agency:read"))) return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const cursor = searchParams.get("cursor") ?? "";
    const limit = 50;

    const conditions = [eq(pamDisbursementAccounts.tenantId, user.tenantId), isNull(pamDisbursementAccounts.deletedAt)];
    if (search) conditions.push(or(ilike(pamDisbursementAccounts.accountRef, `%${search}%`), ilike(pamDisbursementAccounts.vesselName, `%${search}%`), ilike(pamDisbursementAccounts.principalName, `%${search}%`))!);
    if (status) conditions.push(eq(pamDisbursementAccounts.status, status));
    if (cursor) conditions.push(lt(pamDisbursementAccounts.createdAt, new Date(cursor)));

    const results = await db.select().from(pamDisbursementAccounts).where(and(...conditions)).orderBy(desc(pamDisbursementAccounts.createdAt)).limit(limit + 1);
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    return NextResponse.json({ data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } });
  } catch (error) {
    console.error("Failed to list disbursement accounts:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "port_agency:create"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createDisbursementAccountSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });

    const accountRef = `PDA-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const [created] = await db.insert(pamDisbursementAccounts).values({ ...parsed.data, accountRef, tenantId: user.tenantId }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "disbursement-accounts", entityId: created?.id, module: "port-agency-management", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create disbursement account:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
