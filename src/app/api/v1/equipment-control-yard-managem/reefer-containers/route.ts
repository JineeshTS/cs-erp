import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, ilike, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { eqyReeferContainers } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createReeferContainerSchema } from "@/lib/equipment-control-yard-managem/validation";
import { formatZodErrors , escapeIlike } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "equipment:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);

    const conditions = [eq(eqyReeferContainers.tenantId, user.tenantId), isNull(eqyReeferContainers.deletedAt)];
    if (search) conditions.push(ilike(eqyReeferContainers.containerNumber, `%${escapeIlike(search)}%`));
    if (status) conditions.push(eq(eqyReeferContainers.status, status));
    const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(eqyReeferContainers.createdAt, eqyReeferContainers.id, parsedCursor));

    const results = await db.select().from(eqyReeferContainers).where(and(...conditions)).orderBy(desc(eqyReeferContainers.createdAt), desc(eqyReeferContainers.id)).limit(limit + 1);
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list reefer containers:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "equipment:create"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = createReeferContainerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });
    }

    const { lastPtiDate, nextPtiDue, setTemperature, minTemperature, maxTemperature, humidity, currentTemperature, ...rest } = parsed.data;
    const [created] = await db.insert(eqyReeferContainers).values({
      tenantId: user.tenantId,
      ...rest,
      ...(lastPtiDate && { lastPtiDate: new Date(lastPtiDate) }),
      ...(nextPtiDue && { nextPtiDue: new Date(nextPtiDue) }),
      ...(setTemperature !== undefined && { setTemperature: setTemperature.toString() }),
      ...(minTemperature !== undefined && { minTemperature: minTemperature.toString() }),
      ...(maxTemperature !== undefined && { maxTemperature: maxTemperature.toString() }),
      ...(humidity !== undefined && { humidity: humidity.toString() }),
      ...(currentTemperature !== undefined && { currentTemperature: currentTemperature.toString() }),
    }).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "reefer-containers", entityId: created.id, module: "equipment-control-yard-managem", newData: created as Record<string, unknown>, request });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create reefer container:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
