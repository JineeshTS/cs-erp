/**
 * Imports all event handler modules to register them with the event bus.
 * Import this file once at app startup (via instrumentation.ts).
 *
 * Each handler file self-registers by calling eventBus.on() at module scope.
 * The process bridge creates pe_process_instances from domain events.
 */

import "./handlers/booking-handlers";
import "./handlers/container-handlers";
import "./handlers/vessel-handlers";
import "./handlers/financial-handlers";
import "./handlers/compliance-handlers";
import "./handlers/approval-handlers";
import "./handlers/sales-handlers";

import { registerProcessBridge } from "./process-bridge";
import { registerE2eFlowBridge } from "./e2e-flow-bridge";
import { registerWorkflowBridge } from "./workflow-bridge";

// Register event → process instance bridge (PRC-level)
registerProcessBridge();

// Register event → E2E flow instance bridge (E2E-level)
registerE2eFlowBridge();

// ERP-042: Register event → WNE workflow bridge
registerWorkflowBridge();

export const EVENT_HANDLERS_REGISTERED = true;
