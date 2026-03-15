import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getPoseidonAlignment } from "@/lib/sustainability-esg-reporting/service";
import { updatePoseidonAlignmentSchema } from "@/lib/sustainability-esg-reporting/validation";
import { db } from "@/lib/db";
import { serPoseidonAlignments } from "@/db/schema";
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
    const record = await getPoseidonAlignment(id, user.tenantId);
    if (!record)
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Poseidon alignment not found" } },
        { status: 404 }
      );

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get poseidon alignment:", error);
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
    const existing = await getPoseidonAlignment(id, user.tenantId);
    if (!existing)
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Poseidon alignment not found" } },
        { status: 404 }
      );

    const body = await request.json();
    const parsed = updatePoseidonAlignmentSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );

    const [updated] = await db
      .update(serPoseidonAlignments)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(serPoseidonAlignments.id, id),
          eq(serPoseidonAlignments.tenantId, user.tenantId)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "poseidon-alignments", entityId: updated?.id, module: "sustainability-esg-reporting", previousData: existing as Record<string, unknown>, newData: updated as Record<string, unknown>, request });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update poseidon alignment:", error);
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
    const existing = await getPoseidonAlignment(id, user.tenantId);
    if (!existing)
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Poseidon alignment not found" } },
        { status: 404 }
      );

    const [deleted] = await db
      .update(serPoseidonAlignments)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(serPoseidonAlignments.id, id),
          eq(serPoseidonAlignments.tenantId, user.tenantId)
        )
      )
      .returning();

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "poseidon-alignments", entityId: deleted?.id, module: "sustainability-esg-reporting", previousData: existing as Record<string, unknown>, request });

    return NextResponse.json({ data: deleted });
  } catch (error) {
    console.error("Failed to delete poseidon alignment:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
