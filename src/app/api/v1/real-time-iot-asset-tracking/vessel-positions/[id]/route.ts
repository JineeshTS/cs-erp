import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getVesselPosition } from "@/lib/real-time-iot-asset-tracking/service";
import { updateVesselPositionSchema } from "@/lib/real-time-iot-asset-tracking/validation";
import { db } from "@/lib/db";
import { iotVesselPositions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "iot:read")))
      return forbiddenResponse();

    const { id } = await params;
    const record = await getVesselPosition(id, user.tenantId);
    if (!record)
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Vessel position not found" } },
        { status: 404 }
      );

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get vessel position:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "iot:edit")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf)
      return NextResponse.json(
        { error: { code: "CSRF_MISSING", message: "CSRF token required" } },
        { status: 403 }
      );

    const { id } = await params;
    const existing = await getVesselPosition(id, user.tenantId);
    if (!existing)
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Vessel position not found" } },
        { status: 404 }
      );

    const body = await request.json();
    const parsed = updateVesselPositionSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );

    const [updated] = await db
      .update(iotVesselPositions)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(iotVesselPositions.id, id), eq(iotVesselPositions.tenantId, user.tenantId)))
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "vessel-positions", entityId: updated?.id, module: "real-time-iot-asset-tracking", previousData: existing as Record<string, unknown>, newData: updated as Record<string, unknown>, request });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update vessel position:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "iot:delete")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf)
      return NextResponse.json(
        { error: { code: "CSRF_MISSING", message: "CSRF token required" } },
        { status: 403 }
      );

    const { id } = await params;
    const existing = await getVesselPosition(id, user.tenantId);
    if (!existing)
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Vessel position not found" } },
        { status: 404 }
      );

    const [deleted] = await db
      .update(iotVesselPositions)
      .set({ deletedAt: new Date() })
      .where(and(eq(iotVesselPositions.id, id), eq(iotVesselPositions.tenantId, user.tenantId)))
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "vessel-positions", entityId: deleted?.id, module: "real-time-iot-asset-tracking", previousData: existing as Record<string, unknown>, request });

    return NextResponse.json({ data: deleted });
  } catch (error) {
    console.error("Failed to delete vessel position:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
