import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { pamVesselClearances } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createVesselClearanceSchema } from "@/lib/port-agency-management/validation";
import { eq, and, isNull, desc, ilike, or, gt } from "drizzle-orm";
import { eventBus } from "@/lib/events/event-bus";

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

    const conditions = [eq(pamVesselClearances.tenantId, user.tenantId), isNull(pamVesselClearances.deletedAt)];
    if (search) conditions.push(or(ilike(pamVesselClearances.clearanceRef, `%${search}%`), ilike(pamVesselClearances.vesselName, `%${search}%`), ilike(pamVesselClearances.portName, `%${search}%`))!);
    if (status) conditions.push(eq(pamVesselClearances.status, status));
    if (cursor) conditions.push(gt(pamVesselClearances.createdAt, new Date(cursor)));

    const results = await db.select().from(pamVesselClearances).where(and(...conditions)).orderBy(desc(pamVesselClearances.createdAt)).limit(limit + 1);
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    return NextResponse.json({ data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } });
  } catch (error) {
    console.error("Failed to list vessel clearances:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "port_agency:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createVesselClearanceSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } }, { status: 422 });

    const clearanceRef = `PVC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const [created] = await db.insert(pamVesselClearances).values({ ...parsed.data, clearanceRef, tenantId: user.tenantId }).returning();

    // Inward clearance = vessel arrived, outward = vessel departed
    if (parsed.data.clearanceType === "inward") {
      eventBus.emit({
        type: "VESSEL_ARRIVED",
        tenantId: user.tenantId,
        userId: user.id,
        entityId: created.id,
        entityType: "vessel",
        timestamp: new Date(),
        data: {
          vesselId: parsed.data.imoNumber ?? created.id,
          vesselName: parsed.data.vesselName,
          portId: parsed.data.portName,
          voyageId: parsed.data.portCallRef ?? "",
        },
      });
    } else if (parsed.data.clearanceType === "outward") {
      eventBus.emit({
        type: "VESSEL_DEPARTED",
        tenantId: user.tenantId,
        userId: user.id,
        entityId: created.id,
        entityType: "vessel",
        timestamp: new Date(),
        data: {
          vesselId: parsed.data.imoNumber ?? created.id,
          vesselName: parsed.data.vesselName,
          portId: parsed.data.portName,
          voyageId: parsed.data.portCallRef ?? "",
          nextPortId: parsed.data.nextPort ?? "",
        },
      });
    }

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create vessel clearance:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
