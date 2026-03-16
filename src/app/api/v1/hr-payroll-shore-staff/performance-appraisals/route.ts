import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { hpsPerformanceAppraisals } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createPerformanceAppraisalSchema } from "@/lib/hr-payroll-shore-staff/validation";
import { eq, and, isNull, desc, ilike, or, lt } from "drizzle-orm";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "hr:read"))) return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const cursor = searchParams.get("cursor") ?? "";
    const limit = 50;

    const conditions = [
      eq(hpsPerformanceAppraisals.tenantId, user.tenantId),
      isNull(hpsPerformanceAppraisals.deletedAt),
    ];

    if (search) {
      conditions.push(
        or(
          ilike(hpsPerformanceAppraisals.appraisalRef, `%${search}%`),
          ilike(hpsPerformanceAppraisals.employeeName, `%${search}%`)
        )!
      );
    }

    if (status) {
      conditions.push(eq(hpsPerformanceAppraisals.status, status));
    }

    if (cursor) {
      conditions.push(lt(hpsPerformanceAppraisals.createdAt, new Date(cursor)));
    }

    const results = await db
      .select()
      .from(hpsPerformanceAppraisals)
      .where(and(...conditions))
      .orderBy(desc(hpsPerformanceAppraisals.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    return NextResponse.json({
      data,
      meta: {
        cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Failed to list performance appraisals:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "hr:create"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createPerformanceAppraisalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const appraisalRef = `HPA-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const [created] = await db
      .insert(hpsPerformanceAppraisals)
      .values({ ...parsed.data, appraisalRef, tenantId: user.tenantId })
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "performance-appraisals", entityId: created?.id, module: "hr-payroll-shore-staff", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create performance appraisal:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
