import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { pamCrewChangeCoordinations } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createCrewChangeCoordinationSchema } from "@/lib/port-agency-management/validation";
import { eq, and, isNull, desc, ilike, or, gt } from "drizzle-orm";
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

    const conditions = [eq(pamCrewChangeCoordinations.tenantId, user.tenantId), isNull(pamCrewChangeCoordinations.deletedAt)];
    if (search) conditions.push(or(ilike(pamCrewChangeCoordinations.coordinationRef, `%${search}%`), ilike(pamCrewChangeCoordinations.vesselName, `%${search}%`), ilike(pamCrewChangeCoordinations.crewMemberName, `%${search}%`))!);
    if (status) conditions.push(eq(pamCrewChangeCoordinations.status, status));
    if (cursor) conditions.push(gt(pamCrewChangeCoordinations.createdAt, new Date(cursor)));

    const results = await db.select().from(pamCrewChangeCoordinations).where(and(...conditions)).orderBy(desc(pamCrewChangeCoordinations.createdAt)).limit(limit + 1);
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    return NextResponse.json({ data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } });
  } catch (error) {
    console.error("Failed to list crew change coordinations:", error);
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
    const parsed = createCrewChangeCoordinationSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });

    const coordinationRef = `PCC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const [created] = await db.insert(pamCrewChangeCoordinations).values({ ...parsed.data, coordinationRef, tenantId: user.tenantId }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "crew-change-coordinations", entityId: created?.id, module: "port-agency-management", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create crew change coordination:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
