import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

interface ReferenceCheck {
  table: string;
  column: string;
  label: string;
}

/**
 * ERP-054: Check if an entity has active references in other tables.
 * Returns a list of tables that reference this entity, or empty array if safe to delete.
 * Only counts non-deleted records (deleted_at IS NULL).
 */
export async function checkActiveReferences(
  entityId: string,
  tenantId: string,
  checks: ReferenceCheck[]
): Promise<{ table: string; label: string; count: number }[]> {
  const results: { table: string; label: string; count: number }[] = [];

  for (const check of checks) {
    const [row] = await db.execute<{ count: string }>(
      sql.raw(
        `SELECT COUNT(*)::text AS count FROM ${check.table} WHERE ${check.column} = '${entityId}' AND tenant_id = '${tenantId}' AND deleted_at IS NULL`
      )
    );
    const count = parseInt(String(row?.count ?? "0"), 10);
    if (count > 0) {
      results.push({ table: check.table, label: check.label, count });
    }
  }

  return results;
}

/**
 * Reference checks per master data entity type.
 * Maps entity to the tables/columns that reference it.
 */
export const MDM_REFERENCE_CHECKS: Record<string, ReferenceCheck[]> = {
  ports: [
    { table: "mdm_terminals", column: "port_id", label: "Terminals" },
    { table: "proforma_port_calls", column: "port_id", label: "Proforma Port Calls" },
    { table: "voyage_port_calls", column: "port_id", label: "Voyage Port Calls" },
  ],
  vessels: [
    { table: "generated_voyages", column: "vessel_id", label: "Voyages" },
    { table: "vtm_planned_maintenance_tasks", column: "vessel_id", label: "Maintenance Tasks" },
    { table: "vtm_survey_trackings", column: "vessel_id", label: "Survey Trackings" },
  ],
  customers: [
    { table: "csp_portal_bookings", column: "customer_id", label: "Bookings" },
    { table: "scm_opportunities", column: "customer_id", label: "Opportunities" },
    { table: "scm_contracts", column: "customer_id", label: "Contracts" },
    { table: "scm_rate_quotations", column: "customer_id", label: "Rate Quotations" },
  ],
  terminals: [
    { table: "csp_portal_bookings", column: "terminal_id", label: "Bookings" },
  ],
  commodities: [
    { table: "csp_portal_booking_containers", column: "commodity_id", label: "Booking Containers" },
  ],
};
