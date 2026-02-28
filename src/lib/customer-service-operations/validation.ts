import { z } from "zod/v4";

// ==========================================
// Service Categories
// ==========================================

export const createServiceCategorySchema = z.object({
  categoryCode: z.string().min(1).max(50),
  categoryName: z.string().min(1).max(255),
  parentCategoryId: z.string().uuid().optional(),
  description: z.string().optional(),
  slaHours: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateServiceCategorySchema = createServiceCategorySchema.partial();

// ==========================================
// Inquiries
// ==========================================

export const createInquirySchema = z.object({
  inquiryNumber: z.string().min(1).max(50),
  categoryId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  customerName: z.string().min(1).max(255),
  customerEmail: z.string().max(255).optional(),
  customerPhone: z.string().max(50).optional(),
  subject: z.string().min(1).max(500),
  description: z.string().optional(),
  channel: z.enum(["email", "phone", "chat", "portal", "walk_in"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  status: z.enum(["open", "in_progress", "pending_customer", "resolved", "closed"]).optional(),
  assignedTo: z.string().uuid().optional(),
  referenceType: z.string().max(30).optional(),
  referenceId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateInquirySchema = createInquirySchema.partial();

// ==========================================
// Complaints
// ==========================================

export const createComplaintSchema = z.object({
  complaintNumber: z.string().min(1).max(50),
  categoryId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  customerName: z.string().min(1).max(255),
  customerEmail: z.string().max(255).optional(),
  customerPhone: z.string().max(50).optional(),
  subject: z.string().min(1).max(500),
  description: z.string().optional(),
  complaintType: z.enum(["service", "billing", "cargo_damage", "delay", "documentation", "other"]).optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  status: z.enum(["open", "investigating", "in_progress", "resolved", "closed"]).optional(),
  assignedTo: z.string().uuid().optional(),
  rootCause: z.string().optional(),
  correctionAction: z.string().optional(),
  preventiveAction: z.string().optional(),
  compensationAmount: z.number().int().optional(),
  compensationCurrency: z.string().max(3).optional(),
  referenceType: z.string().max(30).optional(),
  referenceId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateComplaintSchema = createComplaintSchema.partial();

// ==========================================
// Service Requests
// ==========================================

export const createServiceRequestSchema = z.object({
  requestNumber: z.string().min(1).max(50),
  categoryId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  customerName: z.string().min(1).max(255),
  requestType: z.enum(["general", "booking_amendment", "documentation", "billing", "container_release", "tracking", "other"]).optional(),
  subject: z.string().min(1).max(500),
  description: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  status: z.enum(["open", "in_progress", "pending", "completed", "cancelled"]).optional(),
  assignedTo: z.string().uuid().optional(),
  dueDate: z.coerce.date().optional(),
  estimatedHours: z.number().int().min(0).optional(),
  referenceType: z.string().max(30).optional(),
  referenceId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateServiceRequestSchema = createServiceRequestSchema.partial();

// ==========================================
// SLA Policies
// ==========================================

export const createSlaPolicySchema = z.object({
  policyCode: z.string().min(1).max(50),
  policyName: z.string().min(1).max(255),
  entityType: z.enum(["inquiry", "complaint", "service_request"]),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  responseTimeHours: z.number().int().min(1),
  resolutionTimeHours: z.number().int().min(1),
  escalationAfterHours: z.number().int().min(1).optional(),
  businessHoursOnly: z.boolean().optional(),
  isActive: z.boolean().optional(),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateSlaPolicySchema = createSlaPolicySchema.partial();

// ==========================================
// SLA Breaches
// ==========================================

export const createSlaBreachSchema = z.object({
  slaPolicyId: z.string().uuid().optional(),
  entityType: z.enum(["inquiry", "complaint", "service_request"]),
  entityId: z.string().uuid(),
  breachType: z.enum(["response_time", "resolution_time"]),
  expectedAt: z.coerce.date(),
  breachedAt: z.coerce.date(),
  overageMinutes: z.number().int().optional(),
  acknowledged: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateSlaBreachSchema = createSlaBreachSchema.partial();

// ==========================================
// Escalations
// ==========================================

export const createEscalationSchema = z.object({
  entityType: z.enum(["inquiry", "complaint", "service_request"]),
  entityId: z.string().uuid(),
  escalationLevel: z.number().int().min(1).optional(),
  reason: z.string().min(1),
  escalatedBy: z.string().uuid(),
  escalatedTo: z.string().uuid().optional(),
  status: z.enum(["pending", "acknowledged", "in_progress", "resolved"]).optional(),
  responseNotes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateEscalationSchema = createEscalationSchema.partial();

// ==========================================
// Communication Logs
// ==========================================

export const createCommunicationLogSchema = z.object({
  entityType: z.enum(["inquiry", "complaint", "service_request"]),
  entityId: z.string().uuid(),
  direction: z.enum(["inbound", "outbound"]),
  channel: z.enum(["email", "phone", "chat", "sms", "portal"]),
  fromAddress: z.string().max(255).optional(),
  toAddress: z.string().max(255).optional(),
  subject: z.string().max(500).optional(),
  body: z.string().optional(),
  sentBy: z.string().uuid().optional(),
  sentAt: z.coerce.date().optional(),
  attachments: z.array(z.record(z.string(), z.unknown())).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateCommunicationLogSchema = createCommunicationLogSchema.partial();

// ==========================================
// Customer Feedback
// ==========================================

export const createCustomerFeedbackSchema = z.object({
  entityType: z.enum(["inquiry", "complaint", "service_request"]),
  entityId: z.string().uuid(),
  customerId: z.string().uuid().optional(),
  customerName: z.string().max(255).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  satisfactionScore: z.number().int().min(0).max(100).optional(),
  feedbackText: z.string().optional(),
  feedbackChannel: z.string().max(30).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateCustomerFeedbackSchema = createCustomerFeedbackSchema.partial();

// ==========================================
// Knowledge Articles
// ==========================================

export const createKnowledgeArticleSchema = z.object({
  articleCode: z.string().min(1).max(50),
  title: z.string().min(1).max(500),
  categoryId: z.string().uuid().optional(),
  content: z.string().optional(),
  summary: z.string().optional(),
  author: z.string().uuid().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateKnowledgeArticleSchema = createKnowledgeArticleSchema.partial();

// ==========================================
// Agent Assignments
// ==========================================

export const createAgentAssignmentSchema = z.object({
  agentId: z.string().uuid(),
  entityType: z.enum(["inquiry", "complaint", "service_request"]),
  entityId: z.string().uuid(),
  assignedBy: z.string().uuid(),
  status: z.enum(["active", "completed", "reassigned"]).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateAgentAssignmentSchema = createAgentAssignmentSchema.partial();

// ==========================================
// Resolution Notes
// ==========================================

export const createResolutionNoteSchema = z.object({
  entityType: z.enum(["inquiry", "complaint", "service_request"]),
  entityId: z.string().uuid(),
  noteType: z.enum(["internal", "customer_visible", "system"]).optional(),
  content: z.string().min(1),
  createdBy: z.string().uuid(),
  isInternal: z.boolean().optional(),
  attachments: z.array(z.record(z.string(), z.unknown())).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateResolutionNoteSchema = createResolutionNoteSchema.partial();
