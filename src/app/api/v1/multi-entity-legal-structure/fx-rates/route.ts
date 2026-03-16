import { NextRequest, NextResponse } from "next/server";
import { eq, and, lt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { melsFxRates } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createFxRateSchema } from "@/lib/multi-entity-legal-structure/validation";
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
    const sourceCurrency = url.searchParams.get("sourceCurrency");
    const targetCurrency = url.searchParams.get("targetCurrency");
    const rateType = url.searchParams.get("rateType");
    const isActive = url.searchParams.get("isActive");

    const conditions = [eq(melsFxRates.tenantId, user.tenantId), isNull(melsFxRates.deletedAt)];
    if (sourceCurrency) conditions.push(eq(melsFxRates.sourceCurrency, sourceCurrency));
    if (targetCurrency) conditions.push(eq(melsFxRates.targetCurrency, targetCurrency));
    if (rateType) conditions.push(eq(melsFxRates.rateType, rateType));
    if (isActive !== null && isActive !== undefined && isActive !== "") {
      conditions.push(eq(melsFxRates.isActive, isActive === "true"));
    }
    if (cursor) conditions.push(lt(melsFxRates.createdAt, new Date(cursor)));

    const results = await db.select().from(melsFxRates).where(and(...conditions))
      .orderBy(desc(melsFxRates.createdAt)).limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list FX rates:", error);
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
    const parsed = createFxRateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { effectiveFrom, effectiveTo, ...rest } = parsed.data;

    const [created] = await db.insert(melsFxRates).values({
      tenantId: user.tenantId,
      ...rest,
      effectiveFrom: new Date(effectiveFrom),
      ...(effectiveTo ? { effectiveTo: new Date(effectiveTo) } : {}),
    }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "fx-rates", entityId: created?.id, module: "multi-entity-legal-structure", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create FX rate:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
