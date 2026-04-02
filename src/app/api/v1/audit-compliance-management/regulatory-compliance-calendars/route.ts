import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import crypto from "crypto";
import { db } from "@/lib/db";
import { acmRegulatoryComplianceCalendars } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createRegulatoryComplianceCalendarSchema } from "@/lib/audit-compliance-management/validation";
import { eq, and, isNull, desc, ilike, or } from "drizzle-orm";
import { formatZodErrors , escapeIlike } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
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
    const conditions = [eq(acmRegulatoryComplianceCalendars.tenantId, user.tenantId), isNull(acmRegulatoryComplianceCalendars.deletedAt)];
    if (search) conditions.push(or(ilike(acmRegulatoryComplianceCalendars.calendarRef, `%${escapeIlike(search)}%`), ilike(acmRegulatoryComplianceCalendars.title, `%${escapeIlike(search)}%`))!);
    if (status) conditions.push(eq(acmRegulatoryComplianceCalendars.status, status));
    const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(acmRegulatoryComplianceCalendars.createdAt, acmRegulatoryComplianceCalendars.id, parsedCursor));
    const results = await db.select().from(acmRegulatoryComplianceCalendars).where(and(...conditions)).orderBy(desc(acmRegulatoryComplianceCalendars.createdAt), desc(acmRegulatoryComplianceCalendars.id)).limit(limit + 1);
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    return NextResponse.json({ data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } });
  } catch (error) {
    console.error("Failed to list regulatory compliance calendars:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "audit:create"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;
    const body = await request.json();
    const parsed = createRegulatoryComplianceCalendarSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });
    const calendarRef = `RCC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const [created] = await db.insert(acmRegulatoryComplianceCalendars).values({ ...parsed.data, calendarRef, tenantId: user.tenantId }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "regulatory-compliance-calendars", entityId: created.id, module: "audit-compliance-management", newData: created as Record<string, unknown>, request });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create regulatory compliance calendar:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
