import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { z } from "zod";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  ports,
  vessels,
  customers,
  commodities,
  containerTypes,
  terminals,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import {
  updatePortSchema,
  updateVesselSchema,
  updateCustomerSchema,
  updateCommoditySchema,
  updateContainerTypeSchema,
  updateTerminalSchema,
} from "@/lib/master-data-management/validation";
import { formatZodErrors } from "@/lib/validation";
import { logBusinessAudit } from "@/lib/business-audit";

const MAX_UPDATES_PER_REQUEST = 100;

const bulkUpdateRequestSchema = z.object({
  entity: z.enum([
    "ports",
    "vessels",
    "customers",
    "commodities",
    "container-types",
    "terminals",
  ]),
  updates: z
    .array(
      z.object({
        id: z.string().uuid(),
        fields: z.record(z.string(), z.unknown()),
      })
    )
    .min(1)
    .max(MAX_UPDATES_PER_REQUEST),
});

/**
 * Apply a single entity update scoped to tenant, with soft-delete guard.
 * Returns the updated row array (empty = not found).
 */
async function applyEntityUpdate(
  entity: string,
  id: string,
  tenantId: string,
  userId: string,
  validatedFields: Record<string, unknown>
): Promise<unknown[]> {
  const setData = { ...validatedFields, updatedBy: userId };

  switch (entity) {
    case "ports":
      return db
        .update(ports)
        .set(setData)
        .where(and(eq(ports.id, id), eq(ports.tenantId, tenantId), isNull(ports.deletedAt)))
        .returning();
    case "vessels":
      return db
        .update(vessels)
        .set(setData)
        .where(and(eq(vessels.id, id), eq(vessels.tenantId, tenantId), isNull(vessels.deletedAt)))
        .returning();
    case "customers":
      return db
        .update(customers)
        .set(setData)
        .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId), isNull(customers.deletedAt)))
        .returning();
    case "commodities":
      return db
        .update(commodities)
        .set(setData)
        .where(and(eq(commodities.id, id), eq(commodities.tenantId, tenantId), isNull(commodities.deletedAt)))
        .returning();
    case "container-types":
      return db
        .update(containerTypes)
        .set(setData)
        .where(and(eq(containerTypes.id, id), eq(containerTypes.tenantId, tenantId), isNull(containerTypes.deletedAt)))
        .returning();
    case "terminals":
      return db
        .update(terminals)
        .set(setData)
        .where(and(eq(terminals.id, id), eq(terminals.tenantId, tenantId), isNull(terminals.deletedAt)))
        .returning();
    default:
      return [];
  }
}

function getValidationSchema(entity: string): z.ZodType | null {
  switch (entity) {
    case "ports":
      return updatePortSchema;
    case "vessels":
      return updateVesselSchema;
    case "customers":
      return updateCustomerSchema;
    case "commodities":
      return updateCommoditySchema;
    case "container-types":
      return updateContainerTypeSchema;
    case "terminals":
      return updateTerminalSchema;
    default:
      return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "admin:create")))
      return forbiddenResponse();

    const csrfError = validateCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = bulkUpdateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: formatZodErrors(parsed.error),
          },
        },
        { status: 422 }
      );
    }

    const { entity, updates } = parsed.data;
    const schema = getValidationSchema(entity);
    if (!schema) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: `Unsupported entity: ${entity}`,
          },
        },
        { status: 422 }
      );
    }

    let updatedCount = 0;
    let failedCount = 0;
    const errors: Array<{ id: string; field: string; message: string }> = [];

    for (const update of updates) {
      // Validate fields against the entity update schema
      const fieldParsed = schema.safeParse(update.fields);
      if (!fieldParsed.success) {
        failedCount++;
        const zodError = fieldParsed.error as z.ZodError;
        for (const issue of zodError.issues) {
          errors.push({
            id: update.id,
            field: issue.path.join("."),
            message: issue.message,
          });
        }
        continue;
      }

      // Apply the update, scoped to tenant with soft-delete guard
      try {
        const result = await applyEntityUpdate(
          entity,
          update.id,
          user.tenantId,
          user.id,
          fieldParsed.data as Record<string, unknown>
        );

        if (result.length === 0) {
          failedCount++;
          errors.push({
            id: update.id,
            field: "id",
            message: "Record not found or already deleted",
          });
        } else {
          updatedCount++;
        }
      } catch (dbError) {
        failedCount++;
        errors.push({
          id: update.id,
          field: "_db",
          message: "Database update failed",
        });
        console.error(`Bulk update DB error for ${entity}/${update.id}:`, dbError);
      }
    }

    void logBusinessAudit({
      tenantId: user.tenantId,
      userId: user.id,
      userEmail: user.email,
      action: "update",
      entityType: entity,
      entityId: user.tenantId,
      module: "admin-portal",
      newData: {
        updated: updatedCount,
        failed: failedCount,
        totalRequested: updates.length,
      } as Record<string, unknown>,
      request,
    });

    return NextResponse.json({
      data: {
        updated: updatedCount,
        failed: failedCount,
        errors,
      },
    });
  } catch (error) {
    console.error("Failed to process bulk update:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
