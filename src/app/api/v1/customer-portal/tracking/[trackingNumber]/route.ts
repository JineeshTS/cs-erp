import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getTrackingByNumber, listTrackingEvents } from "@/lib/customer-portal/service";

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

    const events = await listTrackingEvents(user.tenantId, tracking.id);

    return NextResponse.json({ data: { ...tracking, events } });
  } catch (error) {
    console.error("Failed to get shipment tracking:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
