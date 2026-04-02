import { z } from "zod/v4";

const domainEnum = z.enum([
  "sales_crm",
  "commercial_pricing",
  "customer_service",
  "operations_documentation",
  "freight_invoicing",
  "accounts_receivable",
  "accounts_payable",
  "chartering_vessel",
  "capacity_voyage",
  "equipment_control",
  "customs_compliance",
]);

const automationLevelEnum = z.enum([
  "full_auto",
  "semi_auto",
  "ai_assisted",
  "manual_ai_insights",
]);

const triggerTypeEnum = z.enum(["event", "scheduled", "manual", "api"]);

export const createProcessDefinitionSchema = z.object({
  processCode: z
    .string()
    .min(1, "Process code is required")
    .max(20, "Process code must be at most 20 characters"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be at most 200 characters"),
  description: z.string().max(5000).optional().nullable(),
  domain: domainEnum.optional().nullable(),
  automationLevel: automationLevelEnum.optional().nullable(),
  triggerType: triggerTypeEnum.optional().nullable(),
  agentName: z.string().max(200).optional().nullable(),
  agentType: z
    .enum(["autonomous", "semi-autonomous", "assistive"])
    .optional()
    .nullable(),
  inputDescription: z.string().max(5000).optional().nullable(),
  outputDescription: z.string().max(5000).optional().nullable(),
  sla: z.string().max(50).optional().nullable(),
  connectedModules: z.array(z.string().max(100)).max(50).optional().nullable(),
  crossDependencies: z.array(z.string().max(20)).max(50).optional().nullable(),
  metadata: z
    .record(z.string(), z.unknown())
    .refine((val) => Object.keys(val).length <= 50, {
      message: "Metadata must have at most 50 keys",
    })
    .optional()
    .nullable(),
});

export const updateProcessDefinitionSchema = z.object({
  processCode: z.string().min(1).max(20).optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  domain: domainEnum.optional().nullable(),
  automationLevel: automationLevelEnum.optional().nullable(),
  triggerType: triggerTypeEnum.optional().nullable(),
  agentName: z.string().max(200).optional().nullable(),
  agentType: z
    .enum(["autonomous", "semi-autonomous", "assistive"])
    .optional()
    .nullable(),
  inputDescription: z.string().max(5000).optional().nullable(),
  outputDescription: z.string().max(5000).optional().nullable(),
  sla: z.string().max(50).optional().nullable(),
  connectedModules: z.array(z.string().max(100)).max(50).optional().nullable(),
  crossDependencies: z.array(z.string().max(20)).max(50).optional().nullable(),
  metadata: z
    .record(z.string(), z.unknown())
    .refine((val) => Object.keys(val).length <= 50, {
      message: "Metadata must have at most 50 keys",
    })
    .optional()
    .nullable(),
});

export const cloneSchema = z.object({});

export type CreateProcessDefinitionData = z.infer<
  typeof createProcessDefinitionSchema
>;
export type UpdateProcessDefinitionData = z.infer<
  typeof updateProcessDefinitionSchema
>;
