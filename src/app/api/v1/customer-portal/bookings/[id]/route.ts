import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { cspPortalBookings } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getBooking } from "@/lib/customer-portal/service";
import { updateBookingSchema } from "@/lib/customer-portal/validation";
import { eventBus } from "@/lib/events/event-bus";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "portal:read"))) return forbiddenResponse();

    const { id } = await params;
    const record = await getBooking(id, user.tenantId);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Booking not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get portal booking:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
        { error: { code: "VALIDATION_ERROR", message: "Only draft bookings can be updated" } },
        { status: 422 }
      );
    }

    const body = await request.json();
    const parsed = updateBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const [updated] = await db.update(cspPortalBookings).set(parsed.data)
      .where(and(
        eq(cspPortalBookings.id, id),
        eq(cspPortalBookings.tenantId, user.tenantId),
        isNull(cspPortalBookings.deletedAt)
      )).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "bookings", entityId: updated?.id, module: "customer-portal", previousData: existing as Record<string, unknown>, newData: updated as Record<string, unknown>, request });

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Booking not found" } },
        { status: 404 }
      );
    }

    // Emit status-change events (existing is "draft" per guard above)
    if (updated.status === "confirmed") {
      eventBus.emit({
        type: "BOOKING_CONFIRMED",
        tenantId: user.tenantId,
        userId: user.id,
        entityId: id,
        entityType: "booking",
        timestamp: new Date(),
        data: {
          bookingNumber: existing.bookingRef,
          voyageId: "",
          customerId: existing.customerId,
        },
      });
    }

    if (updated.status === "cancelled") {
      eventBus.emit({
        type: "BOOKING_CANCELLED",
        tenantId: user.tenantId,
        userId: user.id,
        entityId: id,
        entityType: "booking",
        timestamp: new Date(),
        data: {
          bookingNumber: existing.bookingRef,
          reason: updated.cancellationReason ?? "Cancelled by user",
        },
      });
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update portal booking:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
