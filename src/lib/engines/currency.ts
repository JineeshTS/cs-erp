import { db } from "@/lib/db";
import { eq, and, lte, gte, or, isNull, desc } from "drizzle-orm";
import { exchangeRates } from "@/db/schema";

/**
 * Convert an amount from one currency to another using effective exchange rates.
 *
 * Lookup logic:
 * 1. Find rate where baseCurrency=from, targetCurrency=to, effectiveDate <= date, validUntil >= date (or null)
 * 2. If not found, try inverse: baseCurrency=to, targetCurrency=from → use 1/rate
 * 3. If still not found, throw error
 *
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency code (e.g., "USD")
 * @param toCurrency - Target currency code (e.g., "QAR")
 * @param tenantId - Tenant ID for rate lookup
 * @param date - Date for effective rate (defaults to today)
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  tenantId: string,
  date?: Date
): Promise<{ convertedAmount: number; exchangeRate: number; rateDate: string; source: "direct" | "inverse" }> {
  if (fromCurrency === toCurrency) {
    return { convertedAmount: amount, exchangeRate: 1, rateDate: new Date().toISOString(), source: "direct" };
  }

  const asOfDate = date || new Date();
  const dateStr = asOfDate.toISOString().slice(0, 10); // YYYY-MM-DD for date columns

  // Try direct rate
  const [directRate] = await db
    .select()
    .from(exchangeRates)
    .where(and(
      eq(exchangeRates.tenantId, tenantId),
      eq(exchangeRates.baseCurrency, fromCurrency),
      eq(exchangeRates.targetCurrency, toCurrency),
      lte(exchangeRates.effectiveDate, dateStr),
      or(isNull(exchangeRates.validUntil), gte(exchangeRates.validUntil, dateStr)),
      isNull(exchangeRates.deletedAt),
    ))
    .orderBy(desc(exchangeRates.effectiveDate))
    .limit(1);

  if (directRate) {
    const rate = Number(directRate.rate);
    return {
      convertedAmount: Math.round(amount * rate * 100) / 100,
      exchangeRate: rate,
      rateDate: directRate.effectiveDate || asOfDate.toISOString(),
      source: "direct",
    };
  }

  // Try inverse rate
  const [inverseRate] = await db
    .select()
    .from(exchangeRates)
    .where(and(
      eq(exchangeRates.tenantId, tenantId),
      eq(exchangeRates.baseCurrency, toCurrency),
      eq(exchangeRates.targetCurrency, fromCurrency),
      lte(exchangeRates.effectiveDate, dateStr),
      or(isNull(exchangeRates.validUntil), gte(exchangeRates.validUntil, dateStr)),
      isNull(exchangeRates.deletedAt),
    ))
    .orderBy(desc(exchangeRates.effectiveDate))
    .limit(1);

  if (inverseRate) {
    const rate = 1 / Number(inverseRate.rate);
    return {
      convertedAmount: Math.round(amount * rate * 100) / 100,
      exchangeRate: Math.round(rate * 1000000) / 1000000,
      rateDate: inverseRate.effectiveDate || asOfDate.toISOString(),
      source: "inverse",
    };
  }

  throw new Error(`No exchange rate found for ${fromCurrency}→${toCurrency} as of ${asOfDate.toISOString().slice(0, 10)}`);
}
