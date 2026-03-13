/**
 * E2E-36 NVOCC & LCL Operations — Executor Configuration (D-006 Phase 5)
 *
 * LCL consolidation from planning through CFS stuffing, documentation,
 * transit, destuffing, and per-HBL invoicing. 18 steps, 1 gate.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_36_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // PHASE 1: CONSOLIDATION PLANNING
  1: { mode: "ai_with_tools", systemPromptExtra: `You are an LCL Consolidation Planner. Plan LCL consolidation — match shipments to containers, optimize fill rate. Provide JSON with: shipmentsGrouped, containersNeeded, fillRate, consolidationPlan.` },
  2: { mode: "ai_with_tools", systemPromptExtra: `You are a Route Calculator. Calculate routing for consolidated container — origin CFS to destination CFS, transit time. Provide JSON with: originCfs, destinationCfs, mainlineVessel, transitDays, route.` },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are an Equipment Reservation Agent. Reserve equipment for LCL consolidation — container type, pickup location. Provide JSON with: containerType, equipmentRef, pickupLocation, pickupDate.` },
  // PHASE 2: CFS STUFFING
  4: { mode: "ai_with_tools", systemPromptExtra: `You are a CFS Stuffing Agent. Coordinate CFS stuffing — cargo receipt, inspection, loading plan, seal. Provide JSON with: cargoReceived, stuffingPlan, sealNumber, totalCbm, weightKg.` },
  5: { mode: "ai_with_tools", systemPromptExtra: `You are a VGM Agent. Calculate and submit VGM for consolidated container. Provide JSON with: vgmWeight, method, certifiedBy, submittedTo.` },
  // PHASE 3: DOCUMENTATION
  6: { mode: "ai_with_tools", systemPromptExtra: `You are a House BL Agent. Generate House Bills of Lading per LCL shipper. Provide JSON with: hblCount, hblNumbers, shippers, consignees.` },
  7: { mode: "ai_with_tools", systemPromptExtra: `You are a Master BL Agent. Generate Master Bill of Lading for the consolidated container (CFS-to-CFS). Provide JSON with: mblNumber, shipper, consignee, containerNumber, sealNumber.` },
  8: { mode: "ai_with_tools", systemPromptExtra: `You are a BL Reconciliation Agent. Reconcile House BLs against Master BL — volumes, weights, piece counts. Provide JSON with: hblCount, totalVolumeCbm, totalWeightKg, mblMatches, discrepancies.` },
  9: { mode: "gate" },
  // PHASE 4: CUSTOMS & TRANSIT
  10: { mode: "ai_with_tools", systemPromptExtra: `You are a Customs Agent. File export customs declaration at master level for consolidated container. Provide JSON with: declarationRef, hsCode, customsStatus, clearanceDate.` },
  11: { mode: "ai_with_tools", systemPromptExtra: `You are a Gate-In Agent. Process container gate-in at export terminal. Provide JSON with: gateInTime, terminalRef, containerStatus, sealIntact.` },
  12: { mode: "ai_with_tools", systemPromptExtra: `You are a Loading Agent. Track container loading onto vessel — bay/row/tier allocation. Provide JSON with: vesselName, voyage, bayRowTier, loadedAt.` },
  13: { mode: "ai_with_tools", systemPromptExtra: `You are an In-Transit Tracker. Track consolidated container in transit — vessel position, ETA updates. Provide JSON with: currentPosition, vesselEta, transshipments, milestones.` },
  // PHASE 5: DESTINATION
  14: { mode: "ai_with_tools", systemPromptExtra: `You are a Discharge Agent. Track container discharge at destination port. Provide JSON with: dischargedAt, terminalRef, availableForPickup.` },
  15: { mode: "ai_with_tools", systemPromptExtra: `You are an Import Customs Agent. Process import customs at master level — duty calculation, clearance. Provide JSON with: declarationRef, dutyAmount, clearanceStatus, restrictions.` },
  16: { mode: "ai_with_tools", systemPromptExtra: `You are a Destuffing Agent. Coordinate CFS destuffing — break bulk, sort by consignee, inspect. Provide JSON with: cfsLocation, cargoSorted, consigneeCount, damageReport.` },
  17: { mode: "ai_with_tools", systemPromptExtra: `You are an LCL Delivery Agent. Coordinate individual LCL deliveries to consignees. Provide JSON with: deliveriesScheduled, delivered, pending, podCollected.` },
  // PHASE 6: INVOICING
  18: { mode: "ai_with_tools", systemPromptExtra: `You are an LCL Invoice Agent. Generate freight invoice per House BL — rate per CBM/weight, surcharges. Provide JSON with: invoicesGenerated, totalRevenue, rateBasis, surcharges.` },
};

export function getE2e36StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_36_STEP_CONFIGS[stepNumber] ?? null;
}
