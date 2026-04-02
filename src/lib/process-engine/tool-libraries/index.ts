/**
 * Tool Library Central Dispatcher (D-006 Phase 4)
 *
 * Routes tool calls from the AI Tool Executor to domain-specific
 * tool implementations. Each tool interacts with real DB tables.
 *
 * Tool Categories:
 * - CRM: lead scoring, credit, sanctions, negotiation, onboarding (E2E-01/02/03)
 * - Operations: route, space, equipment, gate-in, cutoffs, VGM, DG, stowage (E2E-04 steps 1-14)
 * - Documentation: customs, SI, BL, manifest (E2E-04 steps 15-21)
 * - Finance: invoice, tax, cash application, revenue recognition (E2E-04 steps 22-25)
 */

import type { ToolCallContext, ToolCallResult } from "./types";
import {
  executeScoreLead,
  executeGetLeadDetails,
  executeCalculateCreditScore,
  executeScreenSanctions,
  executeCalculateRate,
  executeAnalyzeCustomerResponse,
  executeGenerateNegotiationStrategy,
  executeActivateContract,
  executeExtractKycData,
  executeValidateDocuments,
  executeScreenEntity,
  executeCheckPepStatus,
  executeAssessCountryRisk,
  executeCompleteOnboarding,
} from "./crm-tools";
import {
  executeCalculateRoute,
  executeCheckCredit,
  executeGenerateQuote,
  executeAllocateSpace,
  executeReserveEquipment,
  executeDispatchTruck,
  executeSetCutoffs,
  executeProcessVgm,
  executeCheckCutoffCompliance,
  executeProcessGateIn,
  executeClassifyDangerousGoods,
  executePlanStowage,
} from "./operations-tools";
import {
  executeFileCustomsDeclaration,
  executeProcessShippingInstructions,
  executeGenerateBillOfLading,
  executeDetermineReleaseType,
  executeCompileManifest,
} from "./documentation-tools";
import {
  executeGenerateFreightInvoice,
  executeCalculateTax,
  executeApplyCash,
  executeRecognizeRevenue,
} from "./finance-tools";
import {
  executeGetServiceSchedule,
  executeGetPortRotation,
  executeGetVesselCapacity,
  executeGetVesselPosition,
  executeCreatePortRotation,
  executeGenerateVoyageNumber,
  executeAllocateTradeCapacity,
  executeGenerateLtsReport,
  executeCreateEtaRecords,
  executeUpdateSpeedConsumption,
  executeUpdateVoyageTracking,
  executeAnalyzeNoonReport,
  executeCalculateDelayImpact,
  executeCascadeEtaChanges,
  executeModifyPortCall,
} from "./voyage-tools";

// ═══════════════════════════════════════════════════════════
// TOOL DISPATCH MAP
// ═══════════════════════════════════════════════════════════

type ToolHandler = (
  input: Record<string, unknown>,
  ctx: ToolCallContext
) => Promise<ToolCallResult>;

const TOOL_HANDLERS: Record<string, ToolHandler> = {
  // ── CRM Tools (E2E-01, E2E-02, E2E-03) ──
  score_lead: executeScoreLead,
  get_lead_details: executeGetLeadDetails,
  calculate_credit_score: executeCalculateCreditScore,
  screen_sanctions: executeScreenSanctions,
  calculate_rate: executeCalculateRate,
  analyze_customer_response: executeAnalyzeCustomerResponse,
  generate_negotiation_strategy: executeGenerateNegotiationStrategy,
  activate_contract: executeActivateContract,
  extract_kyc_data: executeExtractKycData,
  validate_documents: executeValidateDocuments,
  screen_entity: executeScreenEntity,
  check_pep_status: executeCheckPepStatus,
  assess_country_risk: executeAssessCountryRisk,
  complete_onboarding: executeCompleteOnboarding,

  // ── Operations Tools (E2E-04 steps 1-14) ──
  calculate_route: executeCalculateRoute,
  check_credit: executeCheckCredit,
  generate_quote: executeGenerateQuote,
  allocate_space: executeAllocateSpace,
  reserve_equipment: executeReserveEquipment,
  dispatch_truck: executeDispatchTruck,
  set_cutoffs: executeSetCutoffs,
  process_vgm: executeProcessVgm,
  check_cutoff_compliance: executeCheckCutoffCompliance,
  process_gate_in: executeProcessGateIn,
  classify_dangerous_goods: executeClassifyDangerousGoods,
  plan_stowage: executePlanStowage,

  // ── Documentation Tools (E2E-04 steps 15-21) ──
  file_customs_declaration: executeFileCustomsDeclaration,
  process_shipping_instructions: executeProcessShippingInstructions,
  generate_bill_of_lading: executeGenerateBillOfLading,
  determine_release_type: executeDetermineReleaseType,
  compile_manifest: executeCompileManifest,

  // ── Finance Tools (E2E-04 steps 22-25) ──
  generate_freight_invoice: executeGenerateFreightInvoice,
  calculate_tax: executeCalculateTax,
  apply_cash: executeApplyCash,
  recognize_revenue: executeRecognizeRevenue,

  // ── Voyage Tools (E2E-18) ──
  get_service_schedule: executeGetServiceSchedule,
  get_port_rotation: executeGetPortRotation,
  get_vessel_capacity: executeGetVesselCapacity,
  get_vessel_position: executeGetVesselPosition,
  create_port_rotation: executeCreatePortRotation,
  generate_voyage_number: executeGenerateVoyageNumber,
  allocate_trade_capacity: executeAllocateTradeCapacity,
  generate_lts_report: executeGenerateLtsReport,
  create_eta_records: executeCreateEtaRecords,
  update_speed_consumption: executeUpdateSpeedConsumption,
  update_voyage_tracking: executeUpdateVoyageTracking,
  analyze_noon_report: executeAnalyzeNoonReport,
  calculate_delay_impact: executeCalculateDelayImpact,
  cascade_eta_changes: executeCascadeEtaChanges,
  modify_port_call: executeModifyPortCall,
};

/**
 * Dispatch a tool call to the appropriate handler.
 * Returns a structured result or an error if tool is unknown.
 */
export async function dispatchToolCall(
  toolName: string,
  input: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  const handler = TOOL_HANDLERS[toolName];
  if (!handler) {
    return { result: { error: `Unknown tool: ${toolName}`, toolName } };
  }

  try {
    return await handler(input, ctx);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Tool execution failed";
    console.error(`[ToolLibrary] ${toolName} failed:`, msg);
    return { result: { error: msg, toolName } };
  }
}

/**
 * Get list of all registered tool names.
 */
export function getRegisteredTools(): string[] {
  return Object.keys(TOOL_HANDLERS);
}
