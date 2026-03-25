import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { cspPortalBookings } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getBooking } from "@/lib/customer-portal/service";
import { logBusinessAudit } from "@/lib/business-audit";
import { generateDraftBL } from "@/lib/engines/transaction-chain";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "portal:edit"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

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

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Booking not found" } },
        { status: 404 }
      );
    }

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "create", entityType: "confirm", entityId: updated.id, module: "customer-portal", newData: updated as Record<string, unknown>, request });

    // Transaction chain: auto-generate draft BL on booking confirmation
    let blResult: { blId: string; blNumber: string } | null = null;
    try {
      blResult = await generateDraftBL({
        tenantId: user.tenantId,
        bookingId: updated.id,
        bookingRef: updated.bookingRef || updated.id.slice(0, 8),
        customerName: updated.customerName || "Unknown",
        originPort: updated.originPort || undefined,
        destinationPort: updated.destinationPort || undefined,
        userId: user.id,
      });
    } catch (err) {
      console.error("[confirm] Failed to auto-generate BL:", err);
      // Non-fatal — booking is confirmed even if BL generation fails
    }

    return NextResponse.json({
      data: {
        ...updated,
        generatedBL: blResult,
      },
    });
  } catch (error) {
    console.error("Failed to confirm portal booking:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
