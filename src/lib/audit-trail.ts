/**
 * ERP-091: Field-Level Change History (Audit Trail)
 *
 * Compares two objects field-by-field and records each change
 * in the auth_audit_log table with eventType = 'field_change'.
 * Stores field-level diffs in the metadata jsonb column.
 */

import { db } from "@/lib/db";
import { authAuditLog } from "@/db/schema";

interface FieldChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

/**
 * Compare two objects and record each changed field in auth_audit_log.
 *
 * @param tenantId - Tenant scope
 * @param userId - User who made the change
 * @param entityType - e.g. "booking", "vessel", "invoice"
 * @param entityId - ID of the entity being changed
 * @param previousData - The entity state before the change
 * @param newData - The entity state after the change
 * @returns Array of detected field changes
 */
export async function recordFieldChanges(
  tenantId: string,
  userId: string,
  entityType: string,
  entityId: string,
  previousData: Record<string, unknown>,
  newData: Record<string, unknown>
): Promise<FieldChange[]> {
  const changes: FieldChange[] = [];

  // Collect all unique keys from both objects
  const allKeys = new Set([
    ...Object.keys(previousData),
    ...Object.keys(newData),
  ]);

  for (const field of allKeys) {
    const oldValue = previousData[field];
    const newValue = newData[field];

    // Skip internal/system fields
    if (
      field === "updatedAt" ||
      field === "updated_at" ||
      field === "updatedBy" ||
      field === "updated_by"
    ) {
      continue;
    }

    // Deep equality check using JSON serialization
    const oldStr = JSON.stringify(oldValue ?? null);
    const newStr = JSON.stringify(newValue ?? null);

    if (oldStr !== newStr) {
      changes.push({ field, oldValue, newValue });
    }
  }

  if (changes.length === 0) {
    return changes;
  }

  // Insert one audit log row per field change for granular history
  const insertValues = changes.map((change) => ({
    tenantId,
    userId,
    eventType: "field_change" as const,
    metadata: {
      entityType,
      entityId,
      field: change.field,
      oldValue: change.oldValue,
      newValue: change.newValue,
    },
  }));

  try {
    await db.insert(authAuditLog).values(insertValues);
  } catch (err) {
    // Log but don't throw -- audit trail should not break the main operation
    console.error("[audit-trail] Failed to record field changes:", err);
  }

  return changes;
}
