import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { customFieldDefinitions } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { createCustomFieldDefinitionSchema } from "@/lib/admin-portal/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "admin:read"))) return forbiddenResponse();

    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 50);
    const entityType = url.searchParams.get("entityType");

    const conditions = [
      eq(customFieldDefinitions.tenantId, user.tenantId),
      isNull(customFieldDefinitions.deletedAt),
    ];

    if (entityType) {
      conditions.push(eq(customFieldDefinitions.entityType, entityType));
    }

    const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) {
      conditions.push(
        cursorCondition(customFieldDefinitions.createdAt, customFieldDefinitions.id, parsedCursor)
      );
    }

    const results = await db
      .select()
      .from(customFieldDefinitions)
      .where(and(...conditions))
      .orderBy(desc(customFieldDefinitions.createdAt), desc(customFieldDefinitions.id))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore && data.length > 0
      ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id)
      : undefined;

    return NextResponse.json({ data, meta: { cursor: nextCursor, hasMore } });
  } catch (error) {
    console.error("Failed to list custom field definitions:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "admin:create"))) return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = createCustomFieldDefinitionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { effectiveFrom, effectiveTo, ...rest } = parsed.data;

    const [created] = await db
      .insert(customFieldDefinitions)
      .values({
        tenantId: user.tenantId,
        ...rest,
        ...(effectiveFrom ? { effectiveFrom: new Date(effectiveFrom) } : {}),
        ...(effectiveTo ? { effectiveTo: new Date(effectiveTo) } : {}),
        createdBy: user.id,
      })
      .returning();

    void logBusinessAudit({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: "create",
      entityType: "custom-field-definitions",
      entityId: created.id,
      module: "admin-portal",
      newData: created as Record<string, unknown>,
      request,
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create custom field definition:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
