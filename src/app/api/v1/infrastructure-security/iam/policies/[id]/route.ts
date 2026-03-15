import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { isfIamPolicies } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getIamPolicy } from "@/lib/infrastructure-security/service";
import { createIamPolicySchema } from "@/lib/infrastructure-security/validation";
import { formatZodErrors } from "@/lib/validation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "infra:read")))
      return forbiddenResponse();

    const { id } = await params;
    const record = await getIamPolicy(id, user.tenantId);
    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "IAM policy not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get IAM policy:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "infra:edit")))
      return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = createIamPolicySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const existing = await getIamPolicy(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "IAM policy not found" } },
        { status: 404 }
      );
    }

    const [updated] = await db
      .update(isfIamPolicies)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(isfIamPolicies.id, id),
          eq(isfIamPolicies.tenantId, user.tenantId)
        )
      )
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update IAM policy:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "infra:delete")))
      return forbiddenResponse();

    const csrf = request.headers.get("x-csrf-token");
    if (!csrf) return NextResponse.json({ error: { code: "CSRF_MISSING", message: "CSRF token required" } }, { status: 403 });

    const { id } = await params;
    const existing = await getIamPolicy(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "IAM policy not found" } },
        { status: 404 }
      );
    }

    await db
      .update(isfIamPolicies)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(isfIamPolicies.id, id),
          eq(isfIamPolicies.tenantId, user.tenantId)
        )
      );

    return NextResponse.json({ data: { id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete IAM policy:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
