import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cspTrackingEvents } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getTrackingByNumber, listTrackingEvents } from "@/lib/customer-portal/service";
import { createTrackingEventSchema } from "@/lib/customer-portal/validation";

type RouteParams = { params: Promise<{ trackingNumber: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "portal:read"))) return forbiddenResponse();

    const { trackingNumber } = await params;
    const tracking = await getTrackingByNumber(trackingNumber, user.tenantId);

    if (!tracking) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Tracking record not found" } },
        { status: 404 }
      );
    }

    const data = await listTrackingEvents(user.tenantId, tracking.id);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to list tracking events:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "portal:create"))) return forbiddenResponse();

    const { trackingNumber } = await params;
    const tracking = await getTrackingByNumber(trackingNumber, user.tenantId);

    if (!tracking) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Tracking record not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = createTrackingEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [created] = await db.insert(cspTrackingEvents).values({
      tenantId: user.tenantId,
      ...parsed.data,
      trackingId: tracking.id,
    }).returning();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to add tracking event:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
