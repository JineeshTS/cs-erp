import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { oogPortApprovals } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getPortApproval } from "@/lib/oog-special-cargo-management/service";
import { updatePortApprovalSchema } from "@/lib/oog-special-cargo-management/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "oog_special:read"))) return forbiddenResponse();

    const { id } = await params;
    const record = await getPortApproval(id, user.tenantId);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Port approval not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get port approval:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "oog_special:edit"))) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updatePortApprovalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [updated] = await db.update(oogPortApprovals).set({
      ...parsed.data,
      updatedAt: new Date(),
    }).where(
      and(
        eq(oogPortApprovals.id, id),
        eq(oogPortApprovals.tenantId, user.tenantId),
        isNull(oogPortApprovals.deletedAt)
      )
    ).returning();

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Port approval not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update port approval:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "oog_special:delete"))) return forbiddenResponse();

    const { id } = await params;
    const [deleted] = await db.update(oogPortApprovals).set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    }).where(
      and(
        eq(oogPortApprovals.id, id),
        eq(oogPortApprovals.tenantId, user.tenantId),
        isNull(oogPortApprovals.deletedAt)
      )
    ).returning({ id: oogPortApprovals.id });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Port approval not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete port approval:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
