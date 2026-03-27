import { z } from "zod";
import { metadataSchema } from "@/lib/validation";

// Workflow schemas
export const createWorkflowSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  entityType: z.string().min(1).max(50),
  triggerEvent: z.string().min(1).max(100),
  isActive: z.boolean().optional(),
});
export const updateWorkflowSchema = createWorkflowSchema.partial();

// Workflow Step schemas
export const createWorkflowStepSchema = z.object({
  workflowId: z.string().uuid(),
  name: z.string().min(1).max(255),
  stepOrder: z.number().int().min(0),
  stepType: z.enum(["approval", "review", "notification", "condition", "auto"]).optional(),
  assigneeType: z.enum(["role", "user", "department", "dynamic"]).optional(),
  assigneeValue: z.string().min(1).max(255),
  requiredApprovals: z.number().int().min(1).optional(),
  autoApproveAfterHours: z.number().int().positive().optional(),
  conditions: z.record(z.string(), z.unknown()).optional(),
});
export const updateWorkflowStepSchema = createWorkflowStepSchema.partial();

// Workflow Instance schemas
export const createWorkflowInstanceSchema = z.object({
  workflowId: z.string().uuid(),
  entityType: z.string().min(1).max(50),
  entityId: z.string().uuid(),
});

export const actionWorkflowStepSchema = z.object({
  action: z.enum(["approve", "reject", "return", "escalate"]),
  comment: z.string().optional(),
});

// SLA Definition schemas
export const createSlaDefinitionSchema = z.object({
  name: z.string().min(1).max(255),
  entityType: z.string().min(1).max(50),
  triggerEvent: z.string().min(1).max(100),
  targetHours: z.number().int().positive(),
  warningHours: z.number().int().positive(),
  criticalHours: z.number().int().positive(),
  escalationPolicy: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
});
export const updateSlaDefinitionSchema = createSlaDefinitionSchema.partial();

// SLA Instance schemas
export const updateSlaInstanceSchema = z.object({
  status: z.enum(["on_track", "at_risk", "warning", "breached", "completed", "cancelled"]).optional(),
  completedAt: z.string().datetime().optional(),
  breachedAt: z.string().datetime().optional(),
  assignedTo: z.string().uuid().optional(),
  metadata: metadataSchema,
});

// DOA Matrix schemas
export const createDoaMatrixSchema = z.object({
  name: z.string().min(1).max(255),
  entityType: z.string().min(1).max(50),
  actionType: z.string().min(1).max(50),
  roleId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  minAmount: z.number().int().min(0).optional(),
  maxAmount: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  requiresDualApproval: z.boolean().optional(),
  delegatedFrom: z.string().uuid().optional(),
  delegatedUntil: z.string().optional(),
  conditions: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
});
export const updateDoaMatrixSchema = createDoaMatrixSchema.partial();

// Routing Rule schemas
export const createRoutingRuleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  entityType: z.string().min(1).max(50),
  triggerEvent: z.string().min(1).max(100),
  priority: z.number().int().min(0).optional(),
  conditions: z.record(z.string(), z.unknown()),
  assignmentType: z.enum(["user", "role", "department", "round_robin", "least_loaded"]).optional(),
  assignmentValue: z.string().min(1).max(255),
  fallbackAssignment: z.string().max(255).optional(),
  isActive: z.boolean().optional(),
});
export const updateRoutingRuleSchema = createRoutingRuleSchema.partial();

// Notification Template schemas
export const createNotificationTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100),
  channel: z.enum(["email", "whatsapp", "sms", "in_app"]),
  subject: z.string().max(500).optional(),
  bodyTemplate: z.string().min(1),
  bodyHtml: z.string().optional(),
  variables: z.array(z.string()).optional(),
  locale: z.string().max(10).optional(),
  entityType: z.string().max(50).optional(),
  triggerEvent: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
});
export const updateNotificationTemplateSchema = createNotificationTemplateSchema.partial();

// Notification schemas
export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  templateId: z.string().uuid().optional(),
  channel: z.enum(["email", "whatsapp", "sms", "in_app"]),
  title: z.string().min(1).max(500),
  body: z.string().min(1),
  entityType: z.string().max(50).optional(),
  entityId: z.string().uuid().optional(),
  actionUrl: z.string().max(500).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
});

// Notification Preference schemas
export const updateNotificationPreferenceSchema = z.object({
  channel: z.enum(["email", "whatsapp", "sms", "in_app"]),
  eventType: z.string().min(1).max(100),
  isEnabled: z.boolean(),
});
