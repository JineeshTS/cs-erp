import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  wneWorkflows,
  wneWorkflowSteps,
  wneWorkflowInstances,
  wneWorkflowStepInstances,
  wneSlaDefinitions,
  wneSlaInstances,
  wneDoaMatrix,
  wneRoutingRules,
  wneNotificationTemplates,
  wneNotifications,
  wneNotificationPreferences,
} from "@/db/schema/workflow-notification-engine";

// Workflow
export type Workflow = InferSelectModel<typeof wneWorkflows>;
export type NewWorkflow = InferInsertModel<typeof wneWorkflows>;
export type WorkflowStep = InferSelectModel<typeof wneWorkflowSteps>;
export type NewWorkflowStep = InferInsertModel<typeof wneWorkflowSteps>;
export type WorkflowInstance = InferSelectModel<typeof wneWorkflowInstances>;
export type NewWorkflowInstance = InferInsertModel<typeof wneWorkflowInstances>;
export type WorkflowStepInstance = InferSelectModel<typeof wneWorkflowStepInstances>;
export type NewWorkflowStepInstance = InferInsertModel<typeof wneWorkflowStepInstances>;

// SLA
export type SlaDefinition = InferSelectModel<typeof wneSlaDefinitions>;
export type NewSlaDefinition = InferInsertModel<typeof wneSlaDefinitions>;
export type SlaInstance = InferSelectModel<typeof wneSlaInstances>;
export type NewSlaInstance = InferInsertModel<typeof wneSlaInstances>;

// DOA Matrix
export type DoaMatrixEntry = InferSelectModel<typeof wneDoaMatrix>;
export type NewDoaMatrixEntry = InferInsertModel<typeof wneDoaMatrix>;

// Routing Rules
export type RoutingRule = InferSelectModel<typeof wneRoutingRules>;
export type NewRoutingRule = InferInsertModel<typeof wneRoutingRules>;

// Notification Templates
export type NotificationTemplate = InferSelectModel<typeof wneNotificationTemplates>;
export type NewNotificationTemplate = InferInsertModel<typeof wneNotificationTemplates>;

// Notifications
export type Notification = InferSelectModel<typeof wneNotifications>;
export type NewNotification = InferInsertModel<typeof wneNotifications>;

// Notification Preferences
export type NotificationPreference = InferSelectModel<typeof wneNotificationPreferences>;
export type NewNotificationPreference = InferInsertModel<typeof wneNotificationPreferences>;
