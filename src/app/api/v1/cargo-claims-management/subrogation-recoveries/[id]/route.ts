import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { ccmSubrogationRecoveries } from "@/db/schema";
import { getSubrogationRecovery } from "@/lib/cargo-claims-management/service";
import { updateSubrogationRecoverySchema } from "@/lib/cargo-claims-management/validation";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "ccm:read"))) return forbiddenResponse();

    const { id } = await params;
    const record = await getSubrogationRecovery(id, user.tenantId);
    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Subrogation recovery not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get subrogation recovery:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "ccm:edit"))) return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateSubrogationRecoverySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }

    const [record] = await db
      .update(ccmSubrogationRecoveries)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(ccmSubrogationRecoveries.id, id),
          eq(ccmSubrogationRecoveries.tenantId, user.tenantId)
        )
      )
      .returning();

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Subrogation recovery not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to update subrogation recovery:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "ccm:delete"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db
      .update(ccmSubrogationRecoveries)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(ccmSubrogationRecoveries.id, id),
          eq(ccmSubrogationRecoveries.tenantId, user.tenantId)
        )
      )
      .returning();

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Subrogation recovery not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Failed to delete subrogation recovery:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
