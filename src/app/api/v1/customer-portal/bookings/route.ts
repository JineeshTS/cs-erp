import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cspPortalBookings } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { listBookings } from "@/lib/customer-portal/service";
import { createBookingSchema } from "@/lib/customer-portal/validation";
import { eventBus } from "@/lib/events/event-bus";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "portal:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const cursor = url.searchParams.get("cursor") || undefined;

    const result = await listBookings({ tenantId: user.tenantId, search, status, cursor });

    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (error) {
    console.error("Failed to list portal bookings:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "portal:create"))) return forbiddenResponse();

    const body = await request.json();
    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const bookingRef = `BK-${Date.now()}`;

    const [created] = await db.insert(cspPortalBookings).values({
      tenantId: user.tenantId,
      customerId: user.id,
      bookingRef,
      ...parsed.data,
    }).returning();

    eventBus.emit({
      type: "BOOKING_CREATED",
      tenantId: user.tenantId,
      userId: user.id,
      entityId: created.id,
      entityType: "booking",
      timestamp: new Date(),
      data: {
        bookingNumber: bookingRef,
        customerId: user.id,
        tradeRoute: `${parsed.data.originPort}-${parsed.data.destinationPort}`,
        cargoType: parsed.data.cargoType,
        containerCount: parsed.data.containerCount ?? 1,
      },
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create portal booking:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
