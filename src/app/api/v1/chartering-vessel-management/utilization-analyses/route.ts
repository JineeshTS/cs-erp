import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { cvmUtilizationAnalyses } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createUtilizationAnalysisSchema } from "@/lib/chartering-vessel-management/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "chartering:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [eq(cvmUtilizationAnalyses.tenantId, user.tenantId), isNull(cvmUtilizationAnalyses.deletedAt)];
    if (search) conditions.push(ilike(cvmUtilizationAnalyses.vesselName, `%${search}%`));
    if (status) conditions.push(eq(cvmUtilizationAnalyses.status, status));
    if (cursor) conditions.push(gt(cvmUtilizationAnalyses.createdAt, new Date(cursor)));

    const results = await db.select().from(cvmUtilizationAnalyses)
      .where(and(...conditions))
      .orderBy(desc(cvmUtilizationAnalyses.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list utilization analyses:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "chartering:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createUtilizationAnalysisSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const {
      analysisDate,
      periodFrom,
      periodTo,
      currentUtilizationPercent,
      projectedUtilizationPercent,
      ...rest
    } = parsed.data;

    const [created] = await db.insert(cvmUtilizationAnalyses).values({
      tenantId: user.tenantId,
      ...rest,
      analysisDate: new Date(analysisDate),
      ...(periodFrom !== undefined && { periodFrom: new Date(periodFrom) }),
      ...(periodTo !== undefined && { periodTo: new Date(periodTo) }),
      ...(currentUtilizationPercent !== undefined && { currentUtilizationPercent: currentUtilizationPercent.toString() }),
      ...(projectedUtilizationPercent !== undefined && { projectedUtilizationPercent: projectedUtilizationPercent.toString() }),
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create utilization analysis:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
