import { db } from "@/lib/db";
import { taxRates } from "@/db/schema";
import { and, eq, isNull, lte, sql } from "drizzle-orm";

// Fallback rates used when no DB rate is configured for a jurisdiction
const FALLBACK_RATES: Record<string, number> = {
  AE: 5, SA: 15, QA: 0, IN: 18, US: 0, GB: 20, OM: 0, BH: 0, KW: 0,
};

/**
 * ERP-107: Get the active tax rate for a jurisdiction.
 * Reads from mdm_tax_rates table, falls back to hardcoded defaults.
 */
export async function getTaxRate(
  tenantId: string,
  jurisdiction: string,
  taxType: string = "VAT"
): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);

  const [rate] = await db
    .select({ ratePercent: taxRates.ratePercent })
    .from(taxRates)
    .where(and(
      eq(taxRates.tenantId, tenantId),
      eq(taxRates.jurisdiction, jurisdiction.toUpperCase()),
      eq(taxRates.taxType, taxType),
      eq(taxRates.isActive, true),
      isNull(taxRates.deletedAt),
      lte(taxRates.effectiveFrom, sql`${today}::date`),
    ))
    .limit(1);

  if (rate) return parseFloat(String(rate.ratePercent));

  return FALLBACK_RATES[jurisdiction.toUpperCase()] ?? 5;
}

/**
 * Calculate tax amount given a subtotal and jurisdiction.
 */
export async function calculateTax(
  tenantId: string,
  subtotal: number,
  jurisdiction: string,
  taxType: string = "VAT"
): Promise<{ ratePercent: number; taxAmount: number; totalWithTax: number }> {
  const ratePercent = await getTaxRate(tenantId, jurisdiction, taxType);
  const taxAmount = Math.round(subtotal * ratePercent / 100 * 100) / 100;
  const totalWithTax = subtotal + taxAmount;
  return { ratePercent, taxAmount, totalWithTax };
}
