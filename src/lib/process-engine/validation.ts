import { z } from "zod";
import { metadataSchema } from "@/lib/validation";

export const createProcessInstanceSchema = z.object({
  processId: z.string().min(1).max(20),
  processName: z.string().min(1).max(255),
  triggerType: z.enum(["event", "scheduled", "manual", "api"]),
  entityType: z.string().max(50).optional(),
  entityId: z.string().uuid().optional(),
  contextJson: z.record(z.string(), z.unknown()).optional(),
  slaDeadline: z.string().datetime().optional(),
  steps: z
    .array(
      z.object({
        stepNumber: z.number().int().min(1),
        stepName: z.string().min(1).max(255),
        executorType: z.enum(["ai", "human", "system"]),
        executorId: z.string().max(255).optional(),
      })
    )
    .min(1),
});

export const advanceStepSchema = z.object({
  output: z.record(z.string(), z.unknown()).optional(),
});

export const decideApprovalSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  comment: z.string().max(1000).optional(),
});

export const failProcessSchema = z.object({
  reason: z.string().min(1).max(1000),
});

export const logEventSchema = z.object({
  eventType: z.string().min(1).max(100),
  entityType: z.string().min(1).max(50),
  entityId: z.string().min(1).max(255),
  processInstanceId: z.string().uuid().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

// ── E2E Flow Schemas ──

export const createEventTriggerSchema = z.object({
  eventType: z.string().min(1).max(100),
  e2eFlowId: z.string().min(1).max(20),
  conditions: z.record(z.string(), z.unknown()).optional(),
  entityType: z.string().min(1).max(50),
  priority: z.number().int().min(0).max(100).optional(),
});

export const updateEventTriggerSchema = z.object({
  eventType: z.string().min(1).max(100).optional(),
  e2eFlowId: z.string().min(1).max(20).optional(),
  conditions: z.record(z.string(), z.unknown()).optional(),
  entityType: z.string().min(1).max(50).optional(),
  isActive: z.boolean().optional(),
  priority: z.number().int().min(0).max(100).optional(),
});

export const resolveGateSchema = z.object({
  decision: z.enum(["approved", "rejected", "option_selected", "input_provided"]),
  decisionData: z.record(z.string(), z.unknown()).optional(),
});

export const aiAssistSchema = z.object({
  action: z.enum(["generate", "accept", "reject"]),
  stepNumber: z.number().int().min(1),
  editedOutput: z.record(z.string(), z.unknown()).optional(),
  gateDecision: z.enum(["approved", "rejected", "option_selected", "input_provided"]).optional(),
});

// ── D-006: Entity Binding Schemas ──

export const stepCompleteSchema = z.object({
  stepNumber: z.number().int().min(1),
  entityId: z.string().uuid(),
  entityTable: z.string().min(1).max(100),
  entityAction: z.enum(["create", "update", "read"]).default("create"),
  entityData: z.record(z.string(), z.unknown()).optional(),
});

export const stepContextQuerySchema = z.object({
  step: z.coerce.number().int().min(1),
});

export const createFlowInstanceSchema = z.object({
  e2eFlowId: z.string().min(1).max(20),
  entityType: z.string().min(1).max(50),
  entityId: z.string().min(1).max(100),
  triggerEvent: z.string().min(1).max(100),
  parentFlowInstanceId: z.string().uuid().optional(),
  metadata: metadataSchema,
});
