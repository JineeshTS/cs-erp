import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  csoServiceCategories,
  csoInquiries,
  csoComplaints,
  csoServiceRequests,
  csoSlaPolicies,
  csoSlaBreaches,
  csoEscalations,
  csoCommunicationLogs,
  csoCustomerFeedback,
  csoKnowledgeArticles,
  csoAgentAssignments,
  csoResolutionNotes,
} from "@/db/schema";

export type ServiceCategory = InferSelectModel<typeof csoServiceCategories>;
export type NewServiceCategory = InferInsertModel<typeof csoServiceCategories>;

export type Inquiry = InferSelectModel<typeof csoInquiries>;
export type NewInquiry = InferInsertModel<typeof csoInquiries>;

export type Complaint = InferSelectModel<typeof csoComplaints>;
export type NewComplaint = InferInsertModel<typeof csoComplaints>;

export type ServiceRequest = InferSelectModel<typeof csoServiceRequests>;
export type NewServiceRequest = InferInsertModel<typeof csoServiceRequests>;

export type SlaPolicy = InferSelectModel<typeof csoSlaPolicies>;
export type NewSlaPolicy = InferInsertModel<typeof csoSlaPolicies>;

export type SlaBreach = InferSelectModel<typeof csoSlaBreaches>;
export type NewSlaBreach = InferInsertModel<typeof csoSlaBreaches>;

export type Escalation = InferSelectModel<typeof csoEscalations>;
export type NewEscalation = InferInsertModel<typeof csoEscalations>;

export type CommunicationLog = InferSelectModel<typeof csoCommunicationLogs>;
export type NewCommunicationLog = InferInsertModel<typeof csoCommunicationLogs>;

export type CustomerFeedback = InferSelectModel<typeof csoCustomerFeedback>;
export type NewCustomerFeedback = InferInsertModel<typeof csoCustomerFeedback>;

export type KnowledgeArticle = InferSelectModel<typeof csoKnowledgeArticles>;
export type NewKnowledgeArticle = InferInsertModel<typeof csoKnowledgeArticles>;

export type AgentAssignment = InferSelectModel<typeof csoAgentAssignments>;
export type NewAgentAssignment = InferInsertModel<typeof csoAgentAssignments>;

export type ResolutionNote = InferSelectModel<typeof csoResolutionNotes>;
export type NewResolutionNote = InferInsertModel<typeof csoResolutionNotes>;
