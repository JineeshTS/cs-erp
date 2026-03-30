import { describe, it, expect } from "vitest";
import {
  validateTransition,
  containerStateMachine,
  blStateMachine,
  claimStateMachine,
  bookingStateMachine,
  voyageStateMachine,
  invoiceStateMachine,
  portCallStateMachine,
  getStateMachine,
  validateEntityTransition,
} from "@/lib/engines/state-machines";

describe("Container State Machine", () => {
  const machine = containerStateMachine;

  it("has correct initial state", () => {
    expect(machine.initialState).toBe("empty_available");
  });

  it("allows valid transition: empty_available -> allocated", () => {
    const error = validateTransition(machine, "empty_available", "allocated");
    expect(error).toBeNull();
  });

  it("allows valid transition: allocated -> gate_in", () => {
    const error = validateTransition(machine, "allocated", "gate_in");
    expect(error).toBeNull();
  });

  it("allows valid transition: in_transit -> discharged", () => {
    const error = validateTransition(machine, "in_transit", "discharged");
    expect(error).toBeNull();
  });

  it("allows no-op transition (same state)", () => {
    const error = validateTransition(machine, "loaded", "loaded");
    expect(error).toBeNull();
  });

  it("blocks invalid transition: empty_available -> delivered", () => {
    const error = validateTransition(machine, "empty_available", "delivered");
    expect(error).not.toBeNull();
    expect(error).toContain("Invalid transition");
    expect(error).toContain("empty_available");
    expect(error).toContain("delivered");
  });

  it("blocks transition from terminal state: scrapped -> anything", () => {
    const error = validateTransition(machine, "scrapped", "empty_available");
    expect(error).not.toBeNull();
    expect(error).toContain("terminal state");
  });

  it("blocks transition from terminal state: sold -> anything", () => {
    const error = validateTransition(machine, "sold", "allocated");
    expect(error).not.toBeNull();
    expect(error).toContain("terminal state");
  });

  it("returns error for unknown state", () => {
    const error = validateTransition(machine, "nonexistent", "allocated");
    expect(error).not.toBeNull();
    expect(error).toContain('Unknown state "nonexistent"');
  });
});

describe("Bill of Lading State Machine", () => {
  const machine = blStateMachine;

  it("allows draft -> confirmed", () => {
    const error = validateTransition(machine, "draft", "confirmed");
    expect(error).toBeNull();
  });

  it("allows confirmed -> printed", () => {
    const error = validateTransition(machine, "confirmed", "printed");
    expect(error).toBeNull();
  });

  it("allows confirmed -> draft (correction)", () => {
    const error = validateTransition(machine, "confirmed", "draft");
    expect(error).toBeNull();
  });

  it("blocks draft -> printed (must go through confirmed)", () => {
    const error = validateTransition(machine, "draft", "printed");
    expect(error).not.toBeNull();
    expect(error).toContain("Invalid transition");
  });

  it("blocks transition from terminal state: accomplished", () => {
    const error = validateTransition(machine, "accomplished", "draft");
    expect(error).not.toBeNull();
    expect(error).toContain("terminal state");
  });
});

describe("Claim State Machine", () => {
  const machine = claimStateMachine;

  it("has correct initial state", () => {
    expect(machine.initialState).toBe("registered");
  });

  it("allows registered -> under_assessment", () => {
    const error = validateTransition(machine, "registered", "under_assessment");
    expect(error).toBeNull();
  });

  it("allows under_assessment -> surveyed", () => {
    const error = validateTransition(machine, "under_assessment", "surveyed");
    expect(error).toBeNull();
  });

  it("allows negotiation -> settled", () => {
    const error = validateTransition(machine, "negotiation", "settled");
    expect(error).toBeNull();
  });

  it("blocks registered -> settled (must go through assessment)", () => {
    const error = validateTransition(machine, "registered", "settled");
    expect(error).not.toBeNull();
  });
});

describe("Booking State Machine", () => {
  const machine = bookingStateMachine;

  it("allows draft -> confirmed", () => {
    const error = validateTransition(machine, "draft", "confirmed");
    expect(error).toBeNull();
  });

  it("allows draft -> cancelled", () => {
    const error = validateTransition(machine, "draft", "cancelled");
    expect(error).toBeNull();
  });

  it("blocks in_transit -> draft", () => {
    const error = validateTransition(machine, "in_transit", "draft");
    expect(error).not.toBeNull();
  });
});

describe("getStateMachine and validateEntityTransition", () => {
  it("returns correct machine for known entity", () => {
    const machine = getStateMachine("container");
    expect(machine).toBe(containerStateMachine);
  });

  it("returns null for unknown entity", () => {
    const machine = getStateMachine("nonexistent");
    expect(machine).toBeNull();
  });

  it("validateEntityTransition returns null for unknown entity type (allows any)", () => {
    const error = validateEntityTransition("unknown_entity", "a", "b");
    expect(error).toBeNull();
  });

  it("validateEntityTransition validates known entity transitions", () => {
    const error = validateEntityTransition("booking", "draft", "confirmed");
    expect(error).toBeNull();
  });

  it("validateEntityTransition blocks invalid transitions for known entities", () => {
    const error = validateEntityTransition("booking", "draft", "delivered");
    expect(error).not.toBeNull();
  });
});
