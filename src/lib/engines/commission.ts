/**
 * Commission Calculation Engine (ERP-116)
 *
 * Calculates agent commissions on booking revenue.
 * Can use an explicit rate or look up the rate from anm_agent_commissions.
 */

import { db } from "@/lib/db";
import { anmAgentCommissions } from "@/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

export interface CommissionResult {
  agentId: string;
  revenue: number;
  rate: number;
  commissionAmount: number;
  currency: string;
}

/**
 * Calculate commission for an agent on booking revenue.
 *
 * @param tenantId - tenant UUID
 * @param agentId - agent code (maps to agent_code in anm_agent_commissions)
 * @param bookingRevenue - the revenue amount to calculate commission on
 * @param commissionRate - explicit rate (percentage). If omitted, reads from DB.
 * @returns Commission calculation result
 */
export async function calculateCommission(
  tenantId: string,
  agentId: string,
  bookingRevenue: number,
  commissionRate?: number
): Promise<CommissionResult> {
  let rate = commissionRate ?? 0;
  let currency = "USD";

  // If no explicit rate provided, look up the latest rate from DB
  if (commissionRate === undefined || commissionRate === null) {
    const [record] = await db
      .select({
        commissionRate: anmAgentCommissions.commissionRate,
        commissionCurrency: anmAgentCommissions.commissionCurrency,
      })
      .from(anmAgentCommissions)
      .where(
        and(
          eq(anmAgentCommissions.tenantId, tenantId),
          eq(anmAgentCommissions.agentCode, agentId),
          isNull(anmAgentCommissions.deletedAt)
        )
      )
      .orderBy(desc(anmAgentCommissions.createdAt))
      .limit(1);

    if (record) {
      rate = Number(record.commissionRate ?? 0);
      currency = record.commissionCurrency ?? "USD";
    }
  }

  const commissionAmount = Math.round((bookingRevenue * rate / 100) * 100) / 100;

  return {
    agentId,
    revenue: bookingRevenue,
    rate,
    commissionAmount,
    currency,
  };
}
