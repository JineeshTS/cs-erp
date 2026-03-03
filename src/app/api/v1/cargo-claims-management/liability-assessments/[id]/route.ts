import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { ccmLiabilityAssessments } from "@/db/schema";
import { getLiabilityAssessment } from "@/lib/cargo-claims-management/service";
import { updateLiabilityAssessmentSchema } from "@/lib/cargo-claims-management/validation";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "ccm:read")))
      return forbiddenResponse();
    const { id } = await params;
    const record = await getLiabilityAssessment(id, user.tenantId);
    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Liability assessment not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get liability assessment:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "ccm:edit")))
      return forbiddenResponse();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateLiabilityAssessmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error } },
        { status: 422 }
      );
    }
    const [record] = await db
      .update(ccmLiabilityAssessments)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(ccmLiabilityAssessments.id, id),
          eq(ccmLiabilityAssessments.tenantId, user.tenantId)
        )
      )
      .returning();
    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Liability assessment not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to update liability assessment:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "ccm:delete")))
      return forbiddenResponse();
    const { id } = await params;
    const [record] = await db
      .update(ccmLiabilityAssessments)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(ccmLiabilityAssessments.id, id),
          eq(ccmLiabilityAssessments.tenantId, user.tenantId)
        )
      )
      .returning();
    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Liability assessment not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Failed to delete liability assessment:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
