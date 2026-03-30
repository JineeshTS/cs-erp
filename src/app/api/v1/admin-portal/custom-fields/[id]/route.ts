import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { customFieldDefinitions } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { updateCustomFieldDefinitionSchema } from "@/lib/admin-portal/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "admin:read"))) return forbiddenResponse();

    const { id } = await params;
    const [record] = await db
      .select()
      .from(customFieldDefinitions)
      .where(
        and(
          eq(customFieldDefinitions.id, id),
          eq(customFieldDefinitions.tenantId, user.tenantId),
          isNull(customFieldDefinitions.deletedAt)
        )
      )
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Custom field definition not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("Failed to get custom field definition:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "admin:edit"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCustomFieldDefinitionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { effectiveFrom, effectiveTo, ...restData } = parsed.data;
    const updateData: Record<string, unknown> = {
      ...restData,
      updatedBy: user.id,
      ...(effectiveFrom !== undefined ? { effectiveFrom: new Date(effectiveFrom) } : {}),
      ...(effectiveTo !== undefined ? { effectiveTo: new Date(effectiveTo) } : {}),
    };

    const [updated] = await db
      .update(customFieldDefinitions)
      .set(updateData)
      .where(
        and(
          eq(customFieldDefinitions.id, id),
          eq(customFieldDefinitions.tenantId, user.tenantId),
          isNull(customFieldDefinitions.deletedAt)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Custom field definition not found" } },
        { status: 404 }
      );
    }

    void logBusinessAudit({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: "update",
      entityType: "custom-field-definitions",
      entityId: updated.id,
      module: "admin-portal",
      previousData: null,
      newData: updated as Record<string, unknown>,
      request,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Failed to update custom field definition:", error);
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
    if (!(await hasPermission(user.id, user.tenantId, "admin:delete"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const [deleted] = await db
      .update(customFieldDefinitions)
      .set({ deletedAt: new Date(), updatedBy: user.id })
      .where(
        and(
          eq(customFieldDefinitions.id, id),
          eq(customFieldDefinitions.tenantId, user.tenantId),
          isNull(customFieldDefinitions.deletedAt)
        )
      )
      .returning({ id: customFieldDefinitions.id });

    if (!deleted) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Custom field definition not found" } },
        { status: 404 }
      );
    }

    void logBusinessAudit({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: "delete",
      entityType: "custom-field-definitions",
      entityId: deleted.id,
      module: "admin-portal",
      previousData: null,
      request,
    });

    return NextResponse.json({ data: { id: deleted.id, deleted: true } });
  } catch (error) {
    console.error("Failed to delete custom field definition:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
