import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * ERP-046: Generate the next document number for an entity type.
 * Uses PostgreSQL advisory lock for concurrency safety.
 *
 * Format: {prefix}{separator}{date_segment}{separator}{padded_number}
 * Example: BK-2603-00142, BL-INNSA-00001, INV-2026-00523
 *
 * @param entityType - e.g., "booking", "bill_of_lading", "invoice"
 * @param tenantId - tenant UUID
 * @returns Generated document number string
 */
export async function generateNextNumber(
  entityType: string,
  tenantId: string
): Promise<string> {
  // Use a transaction with advisory lock to prevent concurrent conflicts
  return db.transaction(async (tx) => {
    // Advisory lock based on hash of tenant+entity (prevents cross-tenant lock contention)
    const lockKey = hashCode(`${tenantId}:${entityType}`);
    await tx.execute(sql`SELECT pg_advisory_xact_lock(${lockKey})`);

    // Get or create the sequence config
    const [seq] = await tx.execute(sql`
      INSERT INTO number_sequences (tenant_id, entity_type, prefix, current_value)
      VALUES (${tenantId}, ${entityType}, ${getDefaultPrefix(entityType)}, 0)
      ON CONFLICT (tenant_id, entity_type) DO NOTHING
      RETURNING *
    `) as unknown as Array<Record<string, unknown>>;

    // If INSERT did nothing (already exists), fetch it
    let config: Record<string, unknown>;
    if (seq) {
      config = seq;
    } else {
      const [existing] = await tx.execute(sql`
        SELECT * FROM number_sequences
        WHERE tenant_id = ${tenantId} AND entity_type = ${entityType}
      `) as unknown as Array<Record<string, unknown>>;
      config = existing;
    }

    // Check if reset is needed
    const resetRule = (config.reset_rule as string) || "never";
    const lastReset = config.last_reset_at as Date | null;
    const now = new Date();
    let shouldReset = false;

    if (resetRule === "yearly" && (!lastReset || lastReset.getFullYear() !== now.getFullYear())) {
      shouldReset = true;
    } else if (resetRule === "monthly" && (!lastReset || lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear())) {
      shouldReset = true;
    }

    // Increment and optionally reset
    const [updated] = await tx.execute(sql`
      UPDATE number_sequences
      SET current_value = ${shouldReset ? 1 : sql`current_value + 1`},
          last_reset_at = ${shouldReset ? now : sql`last_reset_at`},
          updated_at = NOW()
      WHERE tenant_id = ${tenantId} AND entity_type = ${entityType}
      RETURNING current_value, prefix, date_format, separator, pad_length
    `) as unknown as Array<Record<string, unknown>>;

    const prefix = (updated.prefix as string) || "";
    const dateFormat = (updated.date_format as string) || "";
    const separator = (updated.separator as string) || "-";
    const padLength = (updated.pad_length as number) || 5;
    const value = updated.current_value as number;

    // Build the number
    const parts: string[] = [];
    if (prefix) parts.push(prefix);
    if (dateFormat) parts.push(formatDate(now, dateFormat));
    parts.push(String(value).padStart(padLength, "0"));

    return parts.join(separator);
  });
}

function formatDate(date: Date, format: string): string {
  const yyyy = date.getFullYear().toString();
  const yy = yyyy.slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");

  switch (format) {
    case "YYYY": return yyyy;
    case "YY": return yy;
    case "YYMM": return `${yy}${mm}`;
    case "YYYYMM": return `${yyyy}${mm}`;
    case "YYYYMMDD": return `${yyyy}${mm}${dd}`;
    default: return `${yy}${mm}`;
  }
}

function getDefaultPrefix(entityType: string): string {
  const prefixes: Record<string, string> = {
    booking: "BK",
    bill_of_lading: "BL",
    invoice: "INV",
    credit_note: "CN",
    debit_note: "DN",
    purchase_order: "PO",
    voyage: "VOY",
    container_release: "CRO",
    customs_filing: "CUS",
    quotation: "QT",
    contract: "CT",
    claim: "CLM",
    pda: "PDA",
    manifest: "MAN",
  };
  return prefixes[entityType] || entityType.slice(0, 3).toUpperCase();
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
