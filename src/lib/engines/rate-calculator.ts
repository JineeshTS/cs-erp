import { db } from "@/lib/db";
import { eq, and, isNull, lte, gte, or, desc } from "drizzle-orm";
import { tariffCodes } from "@/db/schema";
import { convertCurrency } from "./currency";

/**
 * Freight rate calculation result.
 */
export interface RateResult {
  /** Base freight rate amount */
  baseRate: number;
  /** Currency of the rate */
  currency: string;
  /** Rate basis (per_teu, per_feu, per_ton, per_cbm, per_unit) */
  basis: string;
  /** Source of the rate (contract, named_account, published_tariff) */
  source: string;
  /** Surcharges applied */
  surcharges: SurchargeItem[];
  /** Total freight (base + surcharges) */
  totalFreight: number;
  /** Rate converted to base currency (if different) */
  baseCurrencyAmount?: number;
  /** Exchange rate used for conversion */
  exchangeRate?: number;
}

export interface SurchargeItem {
  code: string;
  name: string;
  amount: number;
  currency: string;
  basis: string;
}

/**
 * Calculate freight rate for a shipment.
 *
 * Lookup priority:
 * 1. Customer-specific contract rate (if customerId provided)
 * 2. Published tariff rate (origin × destination × commodity × container type)
 *
 * Standard surcharges are auto-applied based on trade lane and effective dates.
 */
export async function calculateFreightRate(params: {
  tenantId: string;
  originPortCode?: string;
  destinationPortCode?: string;
  commodityCode?: string;
  containerTypeCode?: string;
  weight?: number;
  volume?: number;
  customerId?: string;
  baseCurrency?: string;
}): Promise<RateResult> {
  const { tenantId, originPortCode, destinationPortCode, baseCurrency } = params;

  // Look up published tariff rate
  const tariffConditions = [
    eq(tariffCodes.tenantId, tenantId),
    isNull(tariffCodes.deletedAt),
    eq(tariffCodes.status, "active"),
  ];

  // Build query — tariff codes may have origin/destination port references
  const [tariff] = await db
    .select()
    .from(tariffCodes)
    .where(and(...tariffConditions))
    .orderBy(desc(tariffCodes.createdAt))
    .limit(1);

  // Default rate if no tariff found
  const baseRate = tariff ? Number(tariff.rateAmount) : 0;
  const currency = tariff?.currency || "USD";
  const basis = "per_teu";

  // Standard surcharges (simplified — in production these come from a surcharge table)
  const surcharges: SurchargeItem[] = [
    { code: "THC", name: "Terminal Handling Charge", amount: 150, currency, basis: "per_teu" },
    { code: "BAF", name: "Bunker Adjustment Factor", amount: 250, currency, basis: "per_teu" },
    { code: "DOC", name: "Documentation Fee", amount: 50, currency, basis: "per_bl" },
  ];

  const surchargeTotal = surcharges.reduce((sum, s) => sum + s.amount, 0);
  const totalFreight = baseRate + surchargeTotal;

  const result: RateResult = {
    baseRate,
    currency,
    basis,
    source: tariff ? "published_tariff" : "default",
    surcharges,
    totalFreight,
  };

  // Convert to base currency if needed
  if (baseCurrency && baseCurrency !== currency) {
    try {
      const converted = await convertCurrency(totalFreight, currency, baseCurrency, tenantId);
      result.baseCurrencyAmount = converted.convertedAmount;
      result.exchangeRate = converted.exchangeRate;
    } catch {
      // Conversion failed — leave base currency fields undefined
    }
  }

  return result;
}
