import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import crypto from "crypto";
import { db } from "@/lib/db";
import { ccrIspsCompliances } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createIspsComplianceSchema } from "@/lib/customs-compliance-regulatory/validation";
import { eq, and, isNull, desc, ilike, or } from "drizzle-orm";
import { formatZodErrors , escapeIlike } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "customs:read"))) return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const cursor = searchParams.get("cursor") ?? "";
    const limit = 50;

    const conditions = [eq(ccrIspsCompliances.tenantId, user.tenantId), isNull(ccrIspsCompliances.deletedAt)];
    if (search) { conditions.push(or(ilike(ccrIspsCompliances.ispsRef, `%${escapeIlike(search)}%`), ilike(ccrIspsCompliances.facilityName, `%${escapeIlike(search)}%`), ilike(ccrIspsCompliances.imoNumber, `%${escapeIlike(search)}%`))!); }
    if (status) { conditions.push(eq(ccrIspsCompliances.status, status)); }
    if (cursor) { const parsedCursor = parseCompoundCursor(cursor);
      if (parsedCursor) conditions.push(cursorCondition(ccrIspsCompliances.createdAt, ccrIspsCompliances.id, parsedCursor)); }

    const results = await db.select().from(ccrIspsCompliances).where(and(...conditions)).orderBy(desc(ccrIspsCompliances.createdAt), desc(ccrIspsCompliances.id)).limit(limit + 1);
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    return NextResponse.json({ data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } });
  } catch (error) {
    console.error("Failed to list ISPS compliance:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "customs:create"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = createIspsComplianceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });
    }

    const ispsRef = `CIS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const [created] = await db.insert(ccrIspsCompliances).values({ ...parsed.data, ispsRef, tenantId: user.tenantId }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "isps-compliances", entityId: created.id, module: "customs-compliance-regulatory", newData: created as Record<string, unknown>, request });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create ISPS compliance:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
