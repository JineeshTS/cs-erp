/**
 * Demurrage & Detention Calculation Engine
 *
 * Demurrage: Charges for container use beyond free time at the port/terminal.
 * Detention: Charges for container use beyond free time outside the port (at customer premises).
 *
 * Calculation:
 * 1. Determine free time (days) from tariff rule
 * 2. Calculate chargeable days = total days - free days
 * 3. Apply tiered daily rates for chargeable days
 * 4. Sum charges per container
 */

// ── Types ────────────────────────────────────────────────────────

export interface DDTariffRule {
  /** Container type (e.g., "20GP", "40HC") */
  containerType: string;
  /** Port code */
  portCode: string;
  /** Direction: import or export */
  direction: "import" | "export";
  /** Number of free days */
  freeDays: number;
  /** Tiered daily rates: [{fromDay, toDay, dailyRate}] */
  tiers: DDTier[];
  /** Currency */
  currency: string;
  /** Whether weekends are excluded from chargeable days */
  excludeWeekends: boolean;
  /** Customer-specific override (null = applies to all) */
  customerId?: string | null;
}

export interface DDTier {
  fromDay: number; // Inclusive (1-based, day after free time)
  toDay: number; // Inclusive (use 9999 for unlimited)
  dailyRate: number; // Rate per day per container
}

export interface DDChargeResult {
  /** Container identifier */
  containerNumber: string;
  /** Container type */
  containerType: string;
  /** Direction */
  direction: "import" | "export";
  /** Port code */
  portCode: string;
  /** Start date (gate-out for export, discharge for import) */
  startDate: Date;
  /** End date (gate-in/return for export, gate-out for import) */
  endDate: Date;
  /** Total calendar days */
  totalDays: number;
  /** Free days allowed */
  freeDays: number;
  /** Chargeable days (after free time, excluding weekends if applicable) */
  chargeableDays: number;
  /** Charge breakdown by tier */
  tierBreakdown: Array<{
    tier: string;
    days: number;
    dailyRate: number;
    amount: number;
  }>;
  /** Total D&D charge */
  totalCharge: number;
  /** Currency */
  currency: string;
}

// ── Engine ────────────────────────────────────────────────────────

/**
 * Count business days between two dates (excluding weekends).
 */
function countBusinessDays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++; // Skip Sunday (0) and Saturday (6)
    current.setDate(current.getDate() + 1);
  }
  return count;
}

/**
 * Count calendar days between two dates.
 */
function countCalendarDays(start: Date, end: Date): number {
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Calculate D&D charges for a single container.
 */
export function calculateDDCharge(params: {
  containerNumber: string;
  containerType: string;
  direction: "import" | "export";
  portCode: string;
  startDate: Date;
  endDate: Date;
  tariff: DDTariffRule;
}): DDChargeResult {
  const { containerNumber, containerType, direction, portCode, startDate, endDate, tariff } = params;

  const totalDays = countCalendarDays(startDate, endDate);
  const effectiveDays = tariff.excludeWeekends
    ? countBusinessDays(startDate, endDate)
    : totalDays;

  const chargeableDays = Math.max(0, effectiveDays - tariff.freeDays);

  // Apply tiered rates
  const tierBreakdown: DDChargeResult["tierBreakdown"] = [];
  let remainingDays = chargeableDays;
  let totalCharge = 0;

  // Sort tiers by fromDay
  const sortedTiers = [...tariff.tiers].sort((a, b) => a.fromDay - b.fromDay);

  for (const tier of sortedTiers) {
    if (remainingDays <= 0) break;

    const tierDays = Math.min(remainingDays, tier.toDay - tier.fromDay + 1);
    const tierAmount = tierDays * tier.dailyRate;

    tierBreakdown.push({
      tier: `Day ${tier.fromDay}-${tier.toDay === 9999 ? "+" : tier.toDay}`,
      days: tierDays,
      dailyRate: tier.dailyRate,
      amount: Math.round(tierAmount * 100) / 100,
    });

    totalCharge += tierAmount;
    remainingDays -= tierDays;
  }

  return {
    containerNumber,
    containerType,
    direction,
    portCode,
    startDate,
    endDate,
    totalDays,
    freeDays: tariff.freeDays,
    chargeableDays,
    tierBreakdown,
    totalCharge: Math.round(totalCharge * 100) / 100,
    currency: tariff.currency,
  };
}

/**
 * Calculate D&D charges for multiple containers.
 */
export function calculateBulkDDCharges(
  containers: Array<{
    containerNumber: string;
    containerType: string;
    direction: "import" | "export";
    portCode: string;
    startDate: Date;
    endDate: Date;
  }>,
  tariffs: DDTariffRule[]
): { charges: DDChargeResult[]; totalAmount: number; currency: string } {
  const charges: DDChargeResult[] = [];
  let totalAmount = 0;
  let currency = "USD";

  for (const container of containers) {
    // Find matching tariff: customer-specific first, then default
    const tariff = tariffs.find(
      (t) =>
        t.containerType === container.containerType &&
        t.portCode === container.portCode &&
        t.direction === container.direction
    );

    if (!tariff) {
      // No tariff found — use default (7 free days, $50/day)
      const defaultTariff: DDTariffRule = {
        containerType: container.containerType,
        portCode: container.portCode,
        direction: container.direction,
        freeDays: 7,
        tiers: [
          { fromDay: 1, toDay: 3, dailyRate: 30 },
          { fromDay: 4, toDay: 7, dailyRate: 50 },
          { fromDay: 8, toDay: 9999, dailyRate: 75 },
        ],
        currency: "USD",
        excludeWeekends: false,
      };

      const charge = calculateDDCharge({ ...container, tariff: defaultTariff });
      charges.push(charge);
      totalAmount += charge.totalCharge;
      currency = defaultTariff.currency;
    } else {
      const charge = calculateDDCharge({ ...container, tariff });
      charges.push(charge);
      totalAmount += charge.totalCharge;
      currency = tariff.currency;
    }
  }

  return {
    charges,
    totalAmount: Math.round(totalAmount * 100) / 100,
    currency,
  };
}

/**
 * Example: Standard D&D tariff for Indo-Gulf Express (IGX) service.
 */
// ── Invoice Generation ──────────────────────────────────────────

import { db } from "@/lib/db";
import { firmFreightInvoices, firmInvoiceLineItems } from "@/db/schema";
import { generateNextNumber } from "@/lib/number-sequence";

export interface DDInvoiceResult {
  invoiceId: string;
  invoiceNumber: string;
  totalAmount: number;
  currency: string;
  lineItemCount: number;
}

/**
 * Generate a freight invoice from D&D calculation results.
 * Creates the invoice header + one line item per container charge.
 */
export async function generateDDInvoice(
  tenantId: string,
  calculationResult: { charges: DDChargeResult[]; totalAmount: number; currency: string },
  customerId: string,
  bookingRef: string
): Promise<DDInvoiceResult> {
  const invoiceNumber = await generateNextNumber("invoice", tenantId);
  const totalAmount = Math.round(calculationResult.totalAmount * 100); // Store as integer cents
  const currency = calculationResult.currency;

  const [invoice] = await db
    .insert(firmFreightInvoices)
    .values({
      tenantId,
      invoiceNumber,
      invoiceType: "demurrage_detention",
      bookingRef,
      customerName: customerId,
      currency,
      subtotal: totalAmount,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount,
      paidAmount: 0,
      outstandingAmount: totalAmount,
      paymentTerms: "Net 30",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "draft",
    })
    .returning();

  // Insert one line item per container charge
  const lineItems = calculationResult.charges.map((charge, idx) => ({
    tenantId,
    invoiceId: invoice.id,
    lineNumber: idx + 1,
    chargeCode: charge.direction === "import" ? "DEM" : "DET",
    description: `${charge.direction === "import" ? "Demurrage" : "Detention"} — ${charge.containerNumber} at ${charge.portCode} (${charge.chargeableDays} days)`,
    containerNumber: charge.containerNumber,
    containerType: charge.containerType,
    quantity: charge.chargeableDays,
    unitPrice: charge.chargeableDays > 0 ? Math.round((charge.totalCharge / charge.chargeableDays) * 100) : 0,
    currency: charge.currency,
    amount: Math.round(charge.totalCharge * 100),
    taxRate: 0,
    taxAmount: 0,
    totalAmount: Math.round(charge.totalCharge * 100),
  }));

  if (lineItems.length > 0) {
    await db.insert(firmInvoiceLineItems).values(lineItems);
  }

  return {
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    totalAmount: calculationResult.totalAmount,
    currency,
    lineItemCount: lineItems.length,
  };
}

// ── Example Tariffs ─────────────────────────────────────────────

export const IGX_DEFAULT_TARIFFS: DDTariffRule[] = [
  // Import — 20GP at Nhava Sheva
  {
    containerType: "20GP",
    portCode: "INNSA",
    direction: "import",
    freeDays: 7,
    tiers: [
      { fromDay: 1, toDay: 4, dailyRate: 30 },
      { fromDay: 5, toDay: 10, dailyRate: 60 },
      { fromDay: 11, toDay: 9999, dailyRate: 100 },
    ],
    currency: "USD",
    excludeWeekends: false,
  },
  // Import — 40HC at Nhava Sheva
  {
    containerType: "40HC",
    portCode: "INNSA",
    direction: "import",
    freeDays: 7,
    tiers: [
      { fromDay: 1, toDay: 4, dailyRate: 50 },
      { fromDay: 5, toDay: 10, dailyRate: 100 },
      { fromDay: 11, toDay: 9999, dailyRate: 175 },
    ],
    currency: "USD",
    excludeWeekends: false,
  },
  // Export — 20GP at Jebel Ali
  {
    containerType: "20GP",
    portCode: "AEJEA",
    direction: "export",
    freeDays: 10,
    tiers: [
      { fromDay: 1, toDay: 5, dailyRate: 20 },
      { fromDay: 6, toDay: 15, dailyRate: 50 },
      { fromDay: 16, toDay: 9999, dailyRate: 100 },
    ],
    currency: "USD",
    excludeWeekends: true, // UAE excludes Fri-Sat
  },
];
