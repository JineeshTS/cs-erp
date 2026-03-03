import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { pscSupplierScorecards } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createSupplierScorecardSchema } from "@/lib/procurement-supply-chain/validation";
import { eq, and, isNull, desc, ilike, or, gt } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "procurement:read"))) return forbiddenResponse();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const cursor = searchParams.get("cursor") ?? "";
    const limit = 50;

    const conditions = [eq(pscSupplierScorecards.tenantId, user.tenantId), isNull(pscSupplierScorecards.deletedAt)];
    if (search) conditions.push(or(ilike(pscSupplierScorecards.scorecardRef, `%${search}%`), ilike(pscSupplierScorecards.vendorName, `%${search}%`))!);
    if (status) conditions.push(eq(pscSupplierScorecards.status, status));
    if (cursor) conditions.push(gt(pscSupplierScorecards.createdAt, new Date(cursor)));

    const results = await db.select().from(pscSupplierScorecards).where(and(...conditions)).orderBy(desc(pscSupplierScorecards.createdAt)).limit(limit + 1);
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    return NextResponse.json({ data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } });
  } catch (error) {
    console.error("Failed to list supplier scorecards:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "procurement:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createSupplierScorecardSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });

    const scorecardRef = `SPS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const [created] = await db.insert(pscSupplierScorecards).values({ ...parsed.data, scorecardRef, tenantId: user.tenantId }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create supplier scorecard:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
