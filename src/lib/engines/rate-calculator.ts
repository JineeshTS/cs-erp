import { db } from "@/lib/db";
import { eq, and, isNull, lte, gte, or, desc } from "drizzle-orm";
import { tariffCodes, cpmSpecialRates, cpmSurcharges } from "@/db/schema";
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
  const { tenantId, originPortCode, destinationPortCode, customerId, baseCurrency } = params;

  let baseRate = 0;
  let currency = "USD";
  let source: RateResult["source"] = "default";
  const basis = "per_teu";

  // Priority 1: Customer-specific contract rate (from cpm_special_rates)
  if (customerId) {
    const now = new Date();
    const [contractRate] = await db
      .select()
      .from(cpmSpecialRates)
      .where(
        and(
          eq(cpmSpecialRates.tenantId, tenantId),
          eq(cpmSpecialRates.customerId, customerId),
          eq(cpmSpecialRates.status, "active"),
          isNull(cpmSpecialRates.deletedAt),
          lte(cpmSpecialRates.effectiveFrom, now),
          or(isNull(cpmSpecialRates.effectiveTo), gte(cpmSpecialRates.effectiveTo, now))
        )
      )
      .orderBy(desc(cpmSpecialRates.effectiveFrom))
      .limit(1);

    if (contractRate) {
      baseRate = Number(contractRate.finalRate);
      currency = contractRate.currency || "USD";
      source = "contract";
    }
  }

  // Priority 2: Published tariff rate (fallback if no contract rate found)
  if (source === "default") {
    const tariffConditions = [
      eq(tariffCodes.tenantId, tenantId),
      isNull(tariffCodes.deletedAt),
      eq(tariffCodes.status, "active"),
    ];

    const [tariff] = await db
      .select()
      .from(tariffCodes)
      .where(and(...tariffConditions))
      .orderBy(desc(tariffCodes.createdAt))
      .limit(1);

    if (tariff) {
      baseRate = Number(tariff.rateAmount);
      currency = tariff.currency || "USD";
      source = "published_tariff";
    }
  }

  // Read surcharges from cpm_surcharges table, fall back to hardcoded defaults
  let surcharges: SurchargeItem[];
  const now = new Date();
  const dbSurcharges = await db
    .select()
    .from(cpmSurcharges)
    .where(
      and(
        eq(cpmSurcharges.tenantId, tenantId),
        eq(cpmSurcharges.isActive, true),
        isNull(cpmSurcharges.deletedAt),
        lte(cpmSurcharges.effectiveFrom, now),
        or(isNull(cpmSurcharges.effectiveTo), gte(cpmSurcharges.effectiveTo, now))
      )
    )
    .orderBy(desc(cpmSurcharges.createdAt))
    .limit(50);

  if (dbSurcharges.length > 0) {
    surcharges = dbSurcharges.map((s) => ({
      code: s.surchargeCode,
      name: s.surchargeName,
      amount: Number(s.amount) || 0,
      currency: s.currency || currency,
      basis: s.calculationBasis || "per_teu",
    }));
  } else {
    // Fallback: hardcoded defaults when no surcharges configured in DB
    surcharges = [
      { code: "THC", name: "Terminal Handling Charge", amount: 150, currency, basis: "per_teu" },
      { code: "BAF", name: "Bunker Adjustment Factor", amount: 250, currency, basis: "per_teu" },
      { code: "DOC", name: "Documentation Fee", amount: 50, currency, basis: "per_bl" },
    ];
  }

  const surchargeTotal = surcharges.reduce((sum, s) => sum + s.amount, 0);
  const totalFreight = baseRate + surchargeTotal;

  const result: RateResult = {
    baseRate,
    currency,
    basis,
    source,
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
