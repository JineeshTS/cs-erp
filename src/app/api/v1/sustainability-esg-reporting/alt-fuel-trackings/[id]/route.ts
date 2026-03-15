import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getAltFuelTracking } from "@/lib/sustainability-esg-reporting/service";
import { updateAltFuelTrackingSchema } from "@/lib/sustainability-esg-reporting/validation";
import { db } from "@/lib/db";
import { serAltFuelTrackings } from "@/db/schema";
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
    if (!(await hasPermission(user.id, user.tenantId, "ser:read")))
      return forbiddenResponse();

    const { id } = await params;
    const record = await getAltFuelTracking(id, user.tenantId);
    if (!record)
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Alt fuel tracking not found" } },
        { status: 404 }
      );

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get alt fuel tracking:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "ser:edit")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf)
      return NextResponse.json(
        { error: { code: "CSRF_MISSING", message: "CSRF token required" } },
        { status: 403 }
      );

    const { id } = await params;
    const existing = await getAltFuelTracking(id, user.tenantId);
    if (!existing)
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Alt fuel tracking not found" } },
        { status: 404 }
      );

    const body = await request.json();
    const parsed = updateAltFuelTrackingSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );

    const [updated] = await db
      .update(serAltFuelTrackings)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(serAltFuelTrackings.id, id),
          eq(serAltFuelTrackings.tenantId, user.tenantId)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "alt-fuel-trackings", entityId: updated?.id, module: "sustainability-esg-reporting", previousData: existing as Record<string, unknown>, newData: updated as Record<string, unknown>, request });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update alt fuel tracking:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "ser:delete")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf)
      return NextResponse.json(
        { error: { code: "CSRF_MISSING", message: "CSRF token required" } },
        { status: 403 }
      );

    const { id } = await params;
    const existing = await getAltFuelTracking(id, user.tenantId);
    if (!existing)
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Alt fuel tracking not found" } },
        { status: 404 }
      );

    const [deleted] = await db
      .update(serAltFuelTrackings)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(serAltFuelTrackings.id, id),
          eq(serAltFuelTrackings.tenantId, user.tenantId)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "alt-fuel-trackings", entityId: deleted?.id, module: "sustainability-esg-reporting", previousData: existing as Record<string, unknown>, request });

    return NextResponse.json({ data: deleted });
  } catch (error) {
    console.error("Failed to delete alt fuel tracking:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
