import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  isfK8sClusters,
  isfK8sNamespaces,
  isfDeploymentConfigs,
  isfIamPolicies,
  isfServiceAccounts,
  isfApiKeys,
  isfJitAccessRequests,
  isfEncryptionKeys,
  isfKeyRotationLog,
  isfAuditEvents,
  isfComplianceReports,
} from "@/db/schema";

export type K8sCluster = InferSelectModel<typeof isfK8sClusters>;
export type NewK8sCluster = InferInsertModel<typeof isfK8sClusters>;

export type K8sNamespace = InferSelectModel<typeof isfK8sNamespaces>;
export type NewK8sNamespace = InferInsertModel<typeof isfK8sNamespaces>;

export type DeploymentConfig = InferSelectModel<typeof isfDeploymentConfigs>;
export type NewDeploymentConfig = InferInsertModel<typeof isfDeploymentConfigs>;

export type IamPolicy = InferSelectModel<typeof isfIamPolicies>;
export type NewIamPolicy = InferInsertModel<typeof isfIamPolicies>;

export type ServiceAccount = InferSelectModel<typeof isfServiceAccounts>;
export type NewServiceAccount = InferInsertModel<typeof isfServiceAccounts>;

export type ApiKey = InferSelectModel<typeof isfApiKeys>;
export type NewApiKey = InferInsertModel<typeof isfApiKeys>;

export type JitAccessRequest = InferSelectModel<typeof isfJitAccessRequests>;
export type NewJitAccessRequest = InferInsertModel<typeof isfJitAccessRequests>;

export type EncryptionKey = InferSelectModel<typeof isfEncryptionKeys>;
export type NewEncryptionKey = InferInsertModel<typeof isfEncryptionKeys>;

export type KeyRotationLogEntry = InferSelectModel<typeof isfKeyRotationLog>;
export type NewKeyRotationLogEntry = InferInsertModel<typeof isfKeyRotationLog>;

export type AuditEvent = InferSelectModel<typeof isfAuditEvents>;
export type NewAuditEvent = InferInsertModel<typeof isfAuditEvents>;

export type ComplianceReport = InferSelectModel<typeof isfComplianceReports>;
export type NewComplianceReport = InferInsertModel<typeof isfComplianceReports>;
