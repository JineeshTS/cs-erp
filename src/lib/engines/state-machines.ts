/**
 * State Machine Engine
 *
 * Defines valid state transitions for core ERP entities.
 * Validates transitions before allowing status changes.
 * Used by API routes to enforce business rules.
 */

// ── Generic State Machine ────────────────────────────────────────

export interface StateMachine {
  /** Entity type identifier */
  entity: string;
  /** Map of current_state → allowed_next_states */
  transitions: Record<string, string[]>;
  /** Terminal states (no further transitions) */
  terminalStates: string[];
  /** Initial state for new records */
  initialState: string;
}

/**
 * Validate a state transition.
 * Returns null if valid, error message if invalid.
 */
export function validateTransition(
  machine: StateMachine,
  currentState: string,
  targetState: string
): string | null {
  if (currentState === targetState) return null; // No-op

  if (machine.terminalStates.includes(currentState)) {
    return `Cannot transition from terminal state "${currentState}"`;
  }

  const allowed = machine.transitions[currentState];
  if (!allowed) {
    return `Unknown state "${currentState}" for ${machine.entity}`;
  }

  if (!allowed.includes(targetState)) {
    return `Invalid transition: ${machine.entity} cannot go from "${currentState}" to "${targetState}". Allowed: ${allowed.join(", ")}`;
  }

  return null; // Valid
}

// ── Container Lifecycle ──────────────────────────────────────────

export const containerStateMachine: StateMachine = {
  entity: "container",
  initialState: "empty_available",
  terminalStates: ["scrapped", "sold"],
  transitions: {
    empty_available: ["allocated", "under_repair", "scrapped", "sold"],
    allocated: ["gate_in", "empty_available"], // Can be de-allocated
    gate_in: ["loaded", "empty_available"], // Loaded onto vessel or returned empty
    loaded: ["in_transit"],
    in_transit: ["discharged"],
    discharged: ["gate_out", "transshipment"], // Off-loaded or transshipped
    transshipment: ["loaded"], // Re-loaded for next leg
    gate_out: ["delivered"],
    delivered: ["returned"],
    returned: ["empty_available"],
    under_repair: ["empty_available"],
  },
};

// ── Booking Lifecycle ────────────────────────────────────────────

export const bookingStateMachine: StateMachine = {
  entity: "booking",
  initialState: "draft",
  terminalStates: ["closed", "cancelled"],
  transitions: {
    draft: ["confirmed", "cancelled"],
    confirmed: ["amendment_requested", "in_transit", "cancelled"],
    amendment_requested: ["confirmed", "cancelled"], // Back to confirmed after amendment approved
    in_transit: ["delivered"],
    delivered: ["closed"],
  },
};

// ── Voyage Lifecycle ─────────────────────────────────────────────

export const voyageStateMachine: StateMachine = {
  entity: "voyage",
  initialState: "planned",
  terminalStates: ["closed", "cancelled"],
  transitions: {
    planned: ["confirmed", "cancelled"],
    confirmed: ["active", "cancelled"],
    active: ["executing"], // First port departure
    executing: ["completed"], // Last port arrival
    completed: ["closed"], // After voyage P&L settled
  },
};

// ── Bill of Lading Lifecycle ─────────────────────────────────────

export const blStateMachine: StateMachine = {
  entity: "bill_of_lading",
  initialState: "draft",
  terminalStates: ["accomplished", "cancelled"],
  transitions: {
    draft: ["verified", "cancelled"],
    verified: ["approved", "draft"], // Can go back to draft for corrections
    approved: ["released", "verified"], // Can go back for corrections
    released: ["surrendered", "accomplished"],
    surrendered: ["accomplished"],
  },
};

// ── Invoice Lifecycle ────────────────────────────────────────────

export const invoiceStateMachine: StateMachine = {
  entity: "invoice",
  initialState: "draft",
  terminalStates: ["paid", "cancelled", "void"],
  transitions: {
    draft: ["pending_approval", "cancelled"],
    pending_approval: ["approved", "rejected"],
    rejected: ["draft"], // Back to draft for corrections
    approved: ["sent", "cancelled"],
    sent: ["partially_paid", "paid", "overdue", "disputed", "void"],
    partially_paid: ["paid", "overdue", "disputed"],
    overdue: ["partially_paid", "paid", "disputed", "void"],
    disputed: ["sent", "void"], // Resolved → back to sent, or voided
  },
};

// ── Port Call Lifecycle ──────────────────────────────────────────

export const portCallStateMachine: StateMachine = {
  entity: "port_call",
  initialState: "scheduled",
  terminalStates: ["departed", "cancelled", "skipped"],
  transitions: {
    scheduled: ["approaching", "cancelled", "skipped"],
    approaching: ["arrived", "cancelled"],
    arrived: ["berthed"],
    berthed: ["operations", "departed"], // Some ports have no cargo ops
    operations: ["departed"], // Loading/discharging complete
  },
};

// ── Claim Lifecycle ──────────────────────────────────────────────

export const claimStateMachine: StateMachine = {
  entity: "claim",
  initialState: "registered",
  terminalStates: ["settled", "rejected", "withdrawn"],
  transitions: {
    registered: ["under_assessment", "rejected", "withdrawn"],
    under_assessment: ["surveyed", "rejected", "withdrawn"],
    surveyed: ["negotiation", "rejected"],
    negotiation: ["settled", "rejected", "withdrawn"],
  },
};

// ── Registry ─────────────────────────────────────────────────────

const MACHINES: Record<string, StateMachine> = {
  container: containerStateMachine,
  booking: bookingStateMachine,
  voyage: voyageStateMachine,
  bill_of_lading: blStateMachine,
  invoice: invoiceStateMachine,
  port_call: portCallStateMachine,
  claim: claimStateMachine,
};

/**
 * Get state machine for an entity type.
 */
export function getStateMachine(entityType: string): StateMachine | null {
  return MACHINES[entityType] || null;
}

/**
 * Validate a status transition for any registered entity type.
 * Returns null if valid, error message if invalid.
 */
export function validateEntityTransition(
  entityType: string,
  currentState: string,
  targetState: string
): string | null {
  const machine = getStateMachine(entityType);
  if (!machine) return null; // No state machine defined — allow any transition
  return validateTransition(machine, currentState, targetState);
}
