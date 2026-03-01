import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  aafAgents,
  aafAgentRuns,
  aafOrchestrationTasks,
  aafDocumentProcessingJobs,
  aafWorkflowDefinitions,
  aafWorkflowInstances,
  aafEscalations,
} from "@/db/schema";

export type AiAgent = InferSelectModel<typeof aafAgents>;
export type NewAiAgent = InferInsertModel<typeof aafAgents>;

export type AiAgentRun = InferSelectModel<typeof aafAgentRuns>;
export type NewAiAgentRun = InferInsertModel<typeof aafAgentRuns>;

export type AiOrchestrationTask = InferSelectModel<typeof aafOrchestrationTasks>;
export type NewAiOrchestrationTask = InferInsertModel<typeof aafOrchestrationTasks>;

export type AiDocumentProcessingJob = InferSelectModel<typeof aafDocumentProcessingJobs>;
export type NewAiDocumentProcessingJob = InferInsertModel<typeof aafDocumentProcessingJobs>;

export type AiWorkflowDefinition = InferSelectModel<typeof aafWorkflowDefinitions>;
export type NewAiWorkflowDefinition = InferInsertModel<typeof aafWorkflowDefinitions>;

export type AiWorkflowInstance = InferSelectModel<typeof aafWorkflowInstances>;
export type NewAiWorkflowInstance = InferInsertModel<typeof aafWorkflowInstances>;

export type AiEscalation = InferSelectModel<typeof aafEscalations>;
export type NewAiEscalation = InferInsertModel<typeof aafEscalations>;
