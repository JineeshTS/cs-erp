import { NextRequest, NextResponse } from "next/server";
import { eq, and, ilike, gt, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { eqyGateMovements } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createGateMovementSchema } from "@/lib/equipment-control-yard-managem/validation";
import { eventBus } from "@/lib/events/event-bus";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

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

    const conditions = [
      eq(eqyGateMovements.tenantId, user.tenantId),
      isNull(eqyGateMovements.deletedAt),
    ];
    if (search) conditions.push(ilike(eqyGateMovements.containerNumber, `%${search}%`));
    if (status) conditions.push(eq(eqyGateMovements.status, status));
    if (cursor) conditions.push(gt(eqyGateMovements.createdAt, new Date(cursor)));

    const results = await db
      .select()
      .from(eqyGateMovements)
      .where(and(...conditions))
      .orderBy(desc(eqyGateMovements.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list gate movements:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "equipment:create"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const body = await request.json();
    const parsed = createGateMovementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { movementTimestamp, ...rest } = parsed.data;

    const [created] = await db
      .insert(eqyGateMovements)
      .values({
        tenantId: user.tenantId,
        ...rest,
        ...(movementTimestamp && { movementTimestamp: new Date(movementTimestamp) }),
      })
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "gate-movements", entityId: created?.id, module: "equipment-control-yard-managem", newData: created as Record<string, unknown>, request });

    if (parsed.data.movementType === "gate_in") {
      eventBus.emit({
        type: "CONTAINER_GATE_IN",
        tenantId: user.tenantId,
        userId: user.id,
        entityId: created.id,
        entityType: "container",
        timestamp: new Date(),
        data: {
          containerNumber: parsed.data.containerNumber,
          terminalId: parsed.data.gateCode ?? "",
          bookingId: undefined,
          sealNumber: parsed.data.sealNumber,
        },
      });
    } else {
      eventBus.emit({
        type: "CONTAINER_GATE_OUT",
        tenantId: user.tenantId,
        userId: user.id,
        entityId: created.id,
        entityType: "container",
        timestamp: new Date(),
        data: {
          containerNumber: parsed.data.containerNumber,
          terminalId: parsed.data.gateCode ?? "",
          deliveryOrderId: undefined,
        },
      });
    }

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create gate movement:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
