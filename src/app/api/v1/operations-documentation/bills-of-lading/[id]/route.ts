import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { odmBillsOfLading } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateBillOfLadingSchema } from "@/lib/operations-documentation/validation";
import { eventBus } from "@/lib/events/event-bus";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";
import { guardStatusTransition } from "@/lib/engines/status-guard";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "operations:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(odmBillsOfLading).where(and(eq(odmBillsOfLading.id, id), eq(odmBillsOfLading.tenantId, user.tenantId), isNull(odmBillsOfLading.deletedAt))).limit(1);

    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Bill of lading not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get bill of lading:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "operations:edit"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateBillOfLadingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } }, { status: 422 });
    }

    // Fetch existing record to detect status transitions
    const [existing] = await db.select().from(odmBillsOfLading).where(and(eq(odmBillsOfLading.id, id), eq(odmBillsOfLading.tenantId, user.tenantId), isNull(odmBillsOfLading.deletedAt))).limit(1);

    if (!existing) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Bill of lading not found" } }, { status: 404 });

    // ERP-112: Enforce BL status state machine (draft→verified→approved→released→surrendered)
    if (parsed.data.blStatus) {
      const guard = guardStatusTransition("bill_of_lading", existing.blStatus || "draft", parsed.data.blStatus);
      if (guard) return guard;

      // Auto-set timestamps on status transitions
      if (parsed.data.blStatus === "released") {
        (parsed.data as Record<string, unknown>).releasedAt = new Date();
      } else if (parsed.data.blStatus === "surrendered") {
        (parsed.data as Record<string, unknown>).surrenderedAt = new Date();
      }
    }

    // Block editing after release (except status transitions to surrendered/accomplished)
    if (existing.blStatus === "released" || existing.blStatus === "surrendered" || existing.blStatus === "accomplished") {
      const editableAfterRelease = ["blStatus"];
      const nonStatusFields = Object.keys(parsed.data).filter(k => !editableAfterRelease.includes(k));
      if (nonStatusFields.length > 0) {
        return NextResponse.json(
          { error: { code: "BL_LOCKED", message: `BL is ${existing.blStatus} — only status changes are allowed after release` } },
          { status: 422 }
        );
      }
    }

    const [updated] = await db.update(odmBillsOfLading).set({ ...parsed.data }).where(and(eq(odmBillsOfLading.id, id), eq(odmBillsOfLading.tenantId, user.tenantId), isNull(odmBillsOfLading.deletedAt))).returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "bills-of-lading", entityId: existing.id, module: "operations-documentation", previousData: null, newData: existing as Record<string, unknown>, request });

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Bill of lading not found" } }, { status: 404 });

    // Emit BL_SURRENDERED when status changes to surrendered
    if (existing && parsed.data.blStatus === "surrendered" && existing.blStatus !== "surrendered") {
      eventBus.emit({
        type: "BL_SURRENDERED",
        tenantId: user.tenantId,
        userId: user.id,
        entityId: id,
        entityType: "bill_of_lading",
        timestamp: new Date(),
        data: {
          blNumber: updated.blNumber,
          bookingId: updated.bookingReference ?? "",
        },
      });
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update bill of lading:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "operations:delete"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const [deleted] = await db.update(odmBillsOfLading).set({ deletedAt: new Date() }).where(and(eq(odmBillsOfLading.id, id), eq(odmBillsOfLading.tenantId, user.tenantId), isNull(odmBillsOfLading.deletedAt))).returning({ id: odmBillsOfLading.id });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Bill of lading not found" } }, { status: 404 });

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "bills-of-lading", entityId: deleted.id, module: "operations-documentation", previousData: null, request });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete bill of lading:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, { status: 500 });
  }
}
