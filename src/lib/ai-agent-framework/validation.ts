import { z } from "zod/v4";

// ==========================================
// Agents
// ==========================================

export const createAgentSchema = z.object({
  agentCode: z.string().min(1).max(50),
  agentName: z.string().min(1).max(255),
  agentType: z.string().min(1).max(30),
  description: z.string().optional(),
  capabilities: z.record(z.string(), z.unknown()).optional(),
  modelProvider: z.string().max(50).optional(),
  modelId: z.string().max(100).optional(),
  endpoint: z.string().max(500).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  maxConcurrency: z.number().int().min(1).optional(),
  timeoutMs: z.number().int().min(1000).optional(),
  retryPolicy: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
  status: z.enum(["idle", "running", "error", "disabled"]).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateAgentSchema = createAgentSchema.partial();

// ==========================================
// Agent Runs
// ==========================================

export const createAgentRunSchema = z.object({
  agentId: z.string().uuid(),
  orchestrationTaskId: z.string().uuid().optional(),
  runNumber: z.string().min(1).max(50),
  triggerType: z.enum(["manual", "scheduled", "event", "orchestration", "api"]).optional(),
  status: z.enum(["pending", "running", "completed", "failed", "cancelled"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  input: z.record(z.string(), z.unknown()).optional(),
  output: z.record(z.string(), z.unknown()).optional(),
  errorMessage: z.string().optional(),
  errorCode: z.string().max(50).optional(),
  tokensUsed: z.number().int().optional(),
  costEstimate: z.number().int().optional(),
  parentRunId: z.string().uuid().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateAgentRunSchema = createAgentRunSchema.partial();

// ==========================================
// Orchestration Tasks
// ==========================================

export const createOrchestrationTaskSchema = z.object({
  taskCode: z.string().min(1).max(50),
  taskName: z.string().min(1).max(255),
  description: z.string().optional(),
  strategy: z.enum(["sequential", "parallel", "conditional", "fan_out"]).optional(),
  agentIds: z.array(z.string().uuid()).optional(),
  agentConfig: z.record(z.string(), z.unknown()).optional(),
  input: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(["pending", "running", "completed", "failed", "cancelled"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  totalSteps: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateOrchestrationTaskSchema = createOrchestrationTaskSchema.partial();

// ==========================================
// Document Processing Jobs
// ==========================================

export const createDocumentProcessingJobSchema = z.object({
  jobReference: z.string().min(1).max(50),
  documentRef: z.string().max(255).optional(),
  documentType: z.string().min(1).max(50),
  jobType: z.enum(["ocr", "extraction", "classification", "validation", "translation"]),
  agentId: z.string().uuid().optional(),
  status: z.enum(["queued", "processing", "completed", "failed", "review_needed"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  inputData: z.record(z.string(), z.unknown()).optional(),
  ocrEngine: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateDocumentProcessingJobSchema = createDocumentProcessingJobSchema.partial();

// ==========================================
// Workflow Definitions
// ==========================================

export const createWorkflowDefinitionSchema = z.object({
  workflowCode: z.string().min(1).max(50),
  workflowName: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().max(50).optional(),
  version: z.number().int().min(1).optional(),
  steps: z.array(z.record(z.string(), z.unknown())).optional(),
  triggerConfig: z.record(z.string(), z.unknown()).optional(),
  agentAssignments: z.record(z.string(), z.unknown()).optional(),
  inputSchema: z.record(z.string(), z.unknown()).optional(),
  outputSchema: z.record(z.string(), z.unknown()).optional(),
  timeoutMs: z.number().int().min(1000).optional(),
  retryPolicy: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateWorkflowDefinitionSchema = createWorkflowDefinitionSchema.partial();

// ==========================================
// Workflow Instances
// ==========================================

export const createWorkflowInstanceSchema = z.object({
  definitionId: z.string().uuid(),
  instanceRef: z.string().min(1).max(50),
  status: z.enum(["pending", "running", "completed", "failed", "cancelled", "paused"]).optional(),
  input: z.record(z.string(), z.unknown()).optional(),
  totalSteps: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateWorkflowInstanceSchema = createWorkflowInstanceSchema.partial();

// ==========================================
// Escalations
// ==========================================

export const createEscalationSchema = z.object({
  escalationRef: z.string().min(1).max(50),
  sourceType: z.enum(["agent_run", "document_job", "workflow_instance", "orchestration_task", "manual"]),
  sourceId: z.string().uuid().optional(),
  agentId: z.string().uuid().optional(),
  runId: z.string().uuid().optional(),
  reason: z.string().min(1),
  reasonCode: z.string().max(50).optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  status: z.enum(["open", "assigned", "in_review", "resolved", "dismissed"]).optional(),
  contextData: z.record(z.string(), z.unknown()).optional(),
  suggestedActions: z.array(z.record(z.string(), z.unknown())).optional(),
  assignedTo: z.string().uuid().optional(),
  slaDeadline: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateEscalationSchema = createEscalationSchema.partial();

export const resolveEscalationSchema = z.object({
  resolution: z.string().min(1),
  resolutionAction: z.enum(["approve", "reject", "override", "modify", "dismiss"]),
  feedbackToAgent: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
});
