import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { clmOnhireOffhires } from "@/db/schema";
import { getOnhireOffhire } from "@/lib/container-leasing-management/service";
import { updateOnhireOffhireSchema } from "@/lib/container-leasing-management/validation";
import { eq, and, isNull } from "drizzle-orm";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "clm:read"))) return forbiddenResponse();

    const { id } = await params;
    const record = await getOnhireOffhire(id, user.tenantId);
    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "On-hire/off-hire event not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get on-hire/off-hire event:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "clm:edit"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateOnhireOffhireSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const [record] = await db
      .update(clmOnhireOffhires)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(clmOnhireOffhires.id, id), eq(clmOnhireOffhires.tenantId, user.tenantId), isNull(clmOnhireOffhires.deletedAt)))
      .returning();

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "On-hire/off-hire event not found" } },
        { status: 404 }
      );
    }

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "update", entityType: "onhire-offhires", entityId: record.id, module: "container-leasing-management", previousData: null, newData: record as Record<string, unknown>, request });
    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to update on-hire/off-hire event:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "clm:delete"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const [record] = await db
      .update(clmOnhireOffhires)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(clmOnhireOffhires.id, id), eq(clmOnhireOffhires.tenantId, user.tenantId), isNull(clmOnhireOffhires.deletedAt)))
      .returning();

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "On-hire/off-hire event not found" } },
        { status: 404 }
      );
    }

    void logBusinessAudit({ tenantId: user.tenantId, userId: user.id, userEmail: user.email, action: "delete", entityType: "onhire-offhires", entityId: record.id, module: "container-leasing-management", previousData: null, request });
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Failed to delete on-hire/off-hire event:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
