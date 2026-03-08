import { z } from "zod";

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
