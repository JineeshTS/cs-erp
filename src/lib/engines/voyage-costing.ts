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
 * In production: reads from port tariff tables (ptt_*) by port + vessel GT/NT.
 * For now: uses industry-standard estimates per port region.
 */
export function estimatePortDisbursement(params: {
  portCode: string;
  portName: string;
  vesselGrossTonnage?: number;
  vesselNetTonnage?: number;
  stayHours?: number;
}): PortCostEstimate {
  const gt = params.vesselGrossTonnage || 50000;
  const nt = params.vesselNetTonnage || 30000;
  const stayDays = (params.stayHours || 24) / 24;

  // Simplified PDA estimation (industry averages for Indo-Gulf region)
  // In production, these come from ptt_port_dues_wharfages, ptt_pilotage_towage_charges tables
  const pilotage = gt * 0.005; // ~$250 for 50K GT
  const towage = 800 * stayDays; // 2 tugs at $400 each per movement
  const berthHire = nt * 0.003 * stayDays; // $90/day for 30K NT
  const portDues = gt * 0.008; // $400 for 50K GT
  const channelDues = gt * 0.003; // $150 for 50K GT
  const mooring = 200; // Flat
  const agencyFee = 500; // Flat
  const other = 300; // Miscellaneous

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
export function calculateVoyageCosts(params: {
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
}): VoyageCostSummary {
  const portDisbursements = params.portCalls.map((pc) =>
    estimatePortDisbursement({
      portCode: pc.portCode,
      portName: pc.portName,
      vesselGrossTonnage: params.vesselGrossTonnage,
      vesselNetTonnage: params.vesselNetTonnage,
      stayHours: pc.portStayHours,
    })
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
