import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { pttPortDuesWharfages, pttPilotageTowageCharges } from "@/db/schema";

/**
 * Voyage Costing Engine
 *
 * Calculates:
 * - Port Disbursement Account (PDA) estimates per port
 * - Bunker fuel costs per leg
 * - Total voyage costs
 * - Voyage P&L (revenue - costs)
 */

export interface PortCostEstimate {
  portCode: string;
  portName: string;
  pilotage: number;
  towage: number;
  berthHire: number;
  portDues: number;
  channelDues: number;
  mooring: number;
  agencyFee: number;
  other: number;
  total: number;
  currency: string;
}

export interface BunkerCostEstimate {
  fromPort: string;
  toPort: string;
  distanceNm: number;
  speedKnots: number;
  transitHours: number;
  dailyConsumptionMt: number;
  fuelConsumedMt: number;
  fuelPricePerMt: number;
  fuelType: string;
  totalCost: number;
  currency: string;
}

export interface VoyageCostSummary {
  voyageId: string;
  voyageNumber: string;
  portDisbursements: PortCostEstimate[];
  bunkerCosts: BunkerCostEstimate[];
  totalPortCosts: number;
  totalBunkerCosts: number;
  canalFees: number;
  insurance: number;
  charterHire: number;
  totalCosts: number;
  currency: string;
}

/**
 * Estimate Port Disbursement Account for a port call.
 *
 * Reads from ptt_port_dues_wharfages and ptt_pilotage_towage_charges tables by port code.
 * Falls back to industry-standard estimates when no DB data exists.
 */
export async function estimatePortDisbursement(params: {
  tenantId?: string;
  portCode: string;
  portName: string;
  vesselGrossTonnage?: number;
  vesselNetTonnage?: number;
  stayHours?: number;
}): Promise<PortCostEstimate> {
  const gt = params.vesselGrossTonnage || 50000;
  const nt = params.vesselNetTonnage || 30000;
  const stayDays = (params.stayHours || 24) / 24;

  // Attempt to read port tariff data from DB
  if (params.tenantId) {
    try {
      const duesRows = await db
        .select()
        .from(pttPortDuesWharfages)
        .where(
          and(
            eq(pttPortDuesWharfages.tenantId, params.tenantId),
            eq(pttPortDuesWharfages.portCode, params.portCode),
            eq(pttPortDuesWharfages.status, "active")
          )
        )
        .limit(10);

      const pilotageRows = await db
        .select()
        .from(pttPilotageTowageCharges)
        .where(
          and(
            eq(pttPilotageTowageCharges.tenantId, params.tenantId),
            eq(pttPilotageTowageCharges.portCode, params.portCode),
            eq(pttPilotageTowageCharges.status, "active")
          )
        )
        .limit(10);

      if (duesRows.length > 0 || pilotageRows.length > 0) {
        // Sum amounts by dues type from DB records
        let portDues = 0;
        let berthHire = 0;
        let channelDues = 0;
        const dbCurrency = duesRows[0]?.duesCurrency || "USD";

        for (const row of duesRows) {
          const amt = Number(row.calculatedAmount) || 0;
          switch (row.duesType) {
            case "port_dues": portDues += amt; break;
            case "wharfage": portDues += amt; break;
            case "berth_hire": berthHire += amt; break;
            case "channel_dues": channelDues += amt; break;
            case "anchorage": channelDues += amt; break;
            default: portDues += amt;
          }
        }

        let pilotage = 0;
        let towage = 0;
        let mooring = 0;
        for (const row of pilotageRows) {
          const amt = Number(row.calculatedAmount) || 0;
          switch (row.chargeType) {
            case "pilotage_inbound":
            case "pilotage_outbound": pilotage += amt; break;
            case "towage": towage += amt; break;
            case "mooring":
            case "unmooring": mooring += amt; break;
            default: pilotage += amt;
          }
        }

        const agencyFee = 500;
        const other = 300;
        const total = pilotage + towage + berthHire + portDues + channelDues + mooring + agencyFee + other;

        return {
          portCode: params.portCode,
          portName: params.portName,
          pilotage: Math.round(pilotage),
          towage: Math.round(towage),
          berthHire: Math.round(berthHire),
          portDues: Math.round(portDues),
          channelDues: Math.round(channelDues),
          mooring: Math.round(mooring),
          agencyFee,
          other,
          total: Math.round(total),
          currency: dbCurrency || "USD",
        };
      }
    } catch {
      // DB query failed — fall through to hardcoded estimates
    }
  }

  // Fallback: simplified PDA estimation (industry averages for Indo-Gulf region)
  const pilotage = gt * 0.005;
  const towage = 800 * stayDays;
  const berthHire = nt * 0.003 * stayDays;
  const portDues = gt * 0.008;
  const channelDues = gt * 0.003;
  const mooring = 200;
  const agencyFee = 500;
  const other = 300;

  const total = pilotage + towage + berthHire + portDues + channelDues + mooring + agencyFee + other;

  return {
    portCode: params.portCode,
    portName: params.portName,
    pilotage: Math.round(pilotage),
    towage: Math.round(towage),
    berthHire: Math.round(berthHire),
    portDues: Math.round(portDues),
    channelDues: Math.round(channelDues),
    mooring,
    agencyFee,
    other,
    total: Math.round(total),
    currency: "USD",
  };
}

/**
 * Calculate bunker fuel cost for a voyage leg.
 */
export function calculateBunkerCost(params: {
  fromPort: string;
  toPort: string;
  distanceNm: number;
  speedKnots: number;
  dailyConsumptionMt?: number;
  fuelPricePerMt?: number;
  fuelType?: string;
}): BunkerCostEstimate {
  const transitHours = params.distanceNm / params.speedKnots;
  const transitDays = transitHours / 24;
  const dailyConsumption = params.dailyConsumptionMt || 45; // Typical for 5000 TEU vessel
  const fuelConsumed = dailyConsumption * transitDays;
  const fuelPrice = params.fuelPricePerMt || 600; // VLSFO avg price $/mt
  const totalCost = fuelConsumed * fuelPrice;

  return {
    fromPort: params.fromPort,
    toPort: params.toPort,
    distanceNm: params.distanceNm,
    speedKnots: params.speedKnots,
    transitHours: Math.round(transitHours * 10) / 10,
    dailyConsumptionMt: dailyConsumption,
    fuelConsumedMt: Math.round(fuelConsumed * 10) / 10,
    fuelPricePerMt: fuelPrice,
    fuelType: params.fuelType || "VLSFO",
    totalCost: Math.round(totalCost),
    currency: "USD",
  };
}

/**
 * Calculate full voyage cost summary.
 *
 * Takes port calls with distances and calculates:
 * - PDA per port
 * - Bunker cost per leg
 * - Total voyage costs
 */
export async function calculateVoyageCosts(params: {
  tenantId?: string;
  voyageId: string;
  voyageNumber: string;
  portCalls: Array<{
    portCode: string;
    portName: string;
    distanceNm?: number;
    speedKnots?: number;
    portStayHours?: number;
  }>;
  vesselGrossTonnage?: number;
  vesselNetTonnage?: number;
  dailyCharterRate?: number;
  totalDays?: number;
}): Promise<VoyageCostSummary> {
  const portDisbursements = await Promise.all(
    params.portCalls.map((pc) =>
      estimatePortDisbursement({
        tenantId: params.tenantId,
        portCode: pc.portCode,
        portName: pc.portName,
        vesselGrossTonnage: params.vesselGrossTonnage,
        vesselNetTonnage: params.vesselNetTonnage,
        stayHours: pc.portStayHours,
      })
    )
  );

  const bunkerCosts: BunkerCostEstimate[] = [];
  for (let i = 1; i < params.portCalls.length; i++) {
    const prev = params.portCalls[i - 1];
    const curr = params.portCalls[i];
    if (curr.distanceNm && curr.speedKnots) {
      bunkerCosts.push(
        calculateBunkerCost({
          fromPort: prev.portCode,
          toPort: curr.portCode,
          distanceNm: curr.distanceNm,
          speedKnots: curr.speedKnots,
        })
      );
    }
  }

  const totalPortCosts = portDisbursements.reduce((s, p) => s + p.total, 0);
  const totalBunkerCosts = bunkerCosts.reduce((s, b) => s + b.totalCost, 0);
  const charterHire = params.dailyCharterRate
    ? params.dailyCharterRate * (params.totalDays || 14)
    : 0;

  return {
    voyageId: params.voyageId,
    voyageNumber: params.voyageNumber,
    portDisbursements,
    bunkerCosts,
    totalPortCosts,
    totalBunkerCosts,
    canalFees: 0, // No canal in Indo-Gulf route
    insurance: Math.round((totalPortCosts + totalBunkerCosts) * 0.02), // 2% of subtotal
    charterHire,
    totalCosts: totalPortCosts + totalBunkerCosts + charterHire + Math.round((totalPortCosts + totalBunkerCosts) * 0.02),
    currency: "USD",
  };
}

// ── Voyage P&L ────────────────────────────────────────────────────

export interface VoyagePnL {
  voyageId: string;
  voyageNumber: string;
  revenue: number;
  costs: number;
  grossProfit: number;
  margin: number;
  currency: string;
  costBreakdown: VoyageCostSummary;
}

/**
 * Calculate voyage profit & loss.
 *
 * Takes freight revenue (from bookings) and computed voyage costs,
 * returns revenue, costs, gross profit, and margin percentage.
 */
export async function calculateVoyagePnL(params: {
  tenantId?: string;
  voyageId: string;
  voyageNumber: string;
  revenue: number;
  portCalls: Array<{
    portCode: string;
    portName: string;
    distanceNm?: number;
    speedKnots?: number;
    portStayHours?: number;
  }>;
  vesselGrossTonnage?: number;
  vesselNetTonnage?: number;
  dailyCharterRate?: number;
  totalDays?: number;
  currency?: string;
}): Promise<VoyagePnL> {
  const costSummary = await calculateVoyageCosts({
    tenantId: params.tenantId,
    voyageId: params.voyageId,
    voyageNumber: params.voyageNumber,
    portCalls: params.portCalls,
    vesselGrossTonnage: params.vesselGrossTonnage,
    vesselNetTonnage: params.vesselNetTonnage,
    dailyCharterRate: params.dailyCharterRate,
    totalDays: params.totalDays,
  });

  const revenue = params.revenue;
  const costs = costSummary.totalCosts;
  const grossProfit = revenue - costs;
  const margin = revenue > 0 ? Math.round((grossProfit / revenue) * 10000) / 100 : 0;

  return {
    voyageId: params.voyageId,
    voyageNumber: params.voyageNumber,
    revenue,
    costs,
    grossProfit,
    margin,
    currency: params.currency || "USD",
    costBreakdown: costSummary,
  };
}
