import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { wneDoaMatrix } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateDoaMatrixSchema } from "@/lib/workflow-notification-engine/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db.select().from(wneDoaMatrix)
      .where(and(eq(wneDoaMatrix.id, id), eq(wneDoaMatrix.tenantId, user.tenantId), isNull(wneDoaMatrix.deletedAt))).limit(1);

    if (!record) return NextResponse.json({ error: { code: "NOT_FOUND", message: "DOA matrix entry not found" } }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("GET /doa-matrix/[id] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch DOA matrix entry" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:edit"))) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateDoaMatrixSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const { delegatedUntil, ...rest } = parsed.data;
    const updateData: Record<string, unknown> = { ...rest };
    if (delegatedUntil !== undefined) {
      updateData.delegatedUntil = new Date(delegatedUntil);
    }

    const [updated] = await db.update(wneDoaMatrix).set(updateData)
      .where(and(eq(wneDoaMatrix.id, id), eq(wneDoaMatrix.tenantId, user.tenantId), isNull(wneDoaMatrix.deletedAt))).returning();

    if (!updated) return NextResponse.json({ error: { code: "NOT_FOUND", message: "DOA matrix entry not found" } }, { status: 404 });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("PATCH /doa-matrix/[id] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update DOA matrix entry" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "workflows:delete"))) return forbiddenResponse();

    const { id } = await params;
    const [deleted] = await db.update(wneDoaMatrix).set({ deletedAt: new Date() })
      .where(and(eq(wneDoaMatrix.id, id), eq(wneDoaMatrix.tenantId, user.tenantId), isNull(wneDoaMatrix.deletedAt))).returning({ id: wneDoaMatrix.id });

    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "DOA matrix entry not found" } }, { status: 404 });
    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("DELETE /doa-matrix/[id] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete DOA matrix entry" } },
      { status: 500 }
    );
  }
}
