import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { customFieldValues } from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { saveCustomFieldValuesSchema } from "@/lib/admin-portal/validation";
import { formatZodErrors } from "@/lib/validation";

/**
 * GET: Retrieve custom field values for a specific entity.
 * Query params: entityId, entityType
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();

    const url = new URL(request.url);
    const entityId = url.searchParams.get("entityId");
    const entityType = url.searchParams.get("entityType");

    if (!entityId || !entityType) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "entityId and entityType are required" } },
        { status: 400 }
      );
    }

    const results = await db
      .select()
      .from(customFieldValues)
      .where(
        and(
          eq(customFieldValues.tenantId, user.tenantId),
          eq(customFieldValues.entityId, entityId),
          eq(customFieldValues.entityType, entityType)
        )
      );

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error("Failed to get custom field values:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

/**
 * POST: Save/upsert custom field values for an entity.
 * Uses ON CONFLICT to upsert on (tenant_id, entity_id, field_definition_id).
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = saveCustomFieldValuesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: formatZodErrors(parsed.error) } },
        { status: 422 }
      );
    }

    const { entityId, entityType, values } = parsed.data;

    if (values.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Delete existing values for the given definitions, then insert fresh
    const definitionIds = values.map((v) => v.fieldDefinitionId);
    await db
      .delete(customFieldValues)
      .where(
        and(
          eq(customFieldValues.tenantId, user.tenantId),
          eq(customFieldValues.entityId, entityId),
          inArray(customFieldValues.fieldDefinitionId, definitionIds)
        )
      );

    const rows = values
      .filter((v) => v.valueText != null || v.valueJson != null)
      .map((v) => ({
        tenantId: user.tenantId,
        entityId,
        entityType,
        fieldDefinitionId: v.fieldDefinitionId,
        valueText: v.valueText ?? null,
        valueJson: v.valueJson ?? null,
        createdBy: user.id,
        updatedBy: user.id,
      }));

    if (rows.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const inserted = await db.insert(customFieldValues).values(rows).returning();

    return NextResponse.json({ data: inserted }, { status: 201 });
  } catch (error) {
    console.error("Failed to save custom field values:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
