import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { cspPortalBookings } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getBooking } from "@/lib/customer-portal/service";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "portal:edit"))) return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;

    const existing = await getBooking(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Booking not found" } },
        { status: 404 }
      );
    }

    if (existing.status !== "draft") {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Only draft bookings can be confirmed" } },
        { status: 422 }
      );
    }

    const [updated] = await db.update(cspPortalBookings).set({
      status: "confirmed",
      confirmedAt: new Date(),
    }).where(and(
      eq(cspPortalBookings.id, id),
      eq(cspPortalBookings.tenantId, user.tenantId),
      isNull(cspPortalBookings.deletedAt)
    )).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "confirm", entityId: updated?.id, module: "customer-portal", newData: updated as Record<string, unknown>, request });

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Booking not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to confirm portal booking:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
