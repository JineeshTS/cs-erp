/**
 * E2E-39 Platform Administration & Tenant Lifecycle — Executor Configuration (D-006 Phase 5)
 *
 * Platform admin from tenant provisioning through entity/user setup,
 * workflow configuration, AI agents, and ongoing monitoring. 15 steps, 1 gate.
 */

import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

export const E2E_39_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // PHASE 1: INITIAL SETUP
  1: { mode: "ai_with_tools", systemPromptExtra: `You are a Tenant Provisioning Agent. Provision new tenant — database schema, storage, initial configuration. Provide JSON with: tenantId, schemaCreated, storageAllocated, configApplied.` },
  2: { mode: "ai_with_tools", systemPromptExtra: `You are an Entity Setup Agent. Configure companies and branches for the tenant — legal entities, currencies, fiscal years. Provide JSON with: companies, branches, currencies, fiscalYear.` },
  3: { mode: "ai_with_tools", systemPromptExtra: `You are a User Provisioning Agent. Provision users — accounts, authentication methods, initial passwords. Provide JSON with: usersCreated, authMethod, mfaEnabled, invitationsSent.` },
  4: { mode: "ai_with_tools", systemPromptExtra: `You are a Role Assignment Agent. Assign roles and permissions — RBAC setup, module access, data scope. Provide JSON with: rolesAssigned, permissionSets, moduleAccess, dataScope.` },
  // PHASE 2: DATA & WORKFLOWS
  5: { mode: "ai_with_tools", systemPromptExtra: `You are a Master Data Agent. Validate master data setup — ports, vessels, currencies, tariffs, HS codes. Provide JSON with: dataCategories, recordCount, validationErrors, completeness.` },
  6: { mode: "ai_with_tools", systemPromptExtra: `You are a Data Quality Agent. Monitor ongoing data quality — duplicates, orphans, stale records. Provide JSON with: qualityScore, duplicates, orphanRecords, staleRecords, actions.` },
  7: { mode: "ai_with_tools", systemPromptExtra: `You are a Workflow Configuration Agent. Configure approval workflows — DOA matrix, routing rules, escalation paths. Provide JSON with: workflowsConfigured, approvalLevels, escalationRules, doaMatrix.` },
  8: { mode: "ai_with_tools", systemPromptExtra: `You are a Notification Agent. Configure notification routing — email, SMS, in-app, webhook destinations per event type. Provide JSON with: notificationRules, channels, eventTypes, recipientGroups.` },
  // PHASE 3: AI & INTEGRATION
  9: { mode: "ai_with_tools", systemPromptExtra: `You are an AI Agent Configurator. Configure AI agents for tenant — model selection, prompt tuning, tool access. Provide JSON with: agentsConfigured, modelAssignment, toolAccess, customPrompts.` },
  10: { mode: "gate" },
  // PHASE 4: ONGOING MONITORING
  11: { mode: "ai_with_tools", systemPromptExtra: `You are an API Health Agent. Monitor API health — response times, error rates, throughput, uptime. Provide JSON with: apiHealth, avgResponseMs, errorRate, uptime, alerts.` },
  12: { mode: "ai_with_tools", systemPromptExtra: `You are an Agent Performance Agent. Monitor AI agent performance — accuracy, response time, cost per execution. Provide JSON with: agentMetrics, avgAccuracy, avgLatency, costPerExecution, anomalies.` },
  13: { mode: "ai_with_tools", systemPromptExtra: `You are a System Health Agent. Monitor system health — CPU, memory, disk, database connections, queue depth. Provide JSON with: systemMetrics, cpu, memory, diskUsage, dbConnections, queueDepth.` },
  14: { mode: "ai_with_tools", systemPromptExtra: `You are a Backup Agent. Manage scheduled backups — database, file storage, configuration. Provide JSON with: lastBackup, backupSize, retentionPolicy, restoreTestDate.` },
  15: { mode: "ai_with_tools", systemPromptExtra: `You are an Audit Trail Agent. Analyze audit trail — user actions, data changes, access patterns, anomalies. Provide JSON with: auditEntries, suspiciousActivity, accessPatterns, complianceStatus.` },
};

export function getE2e39StepConfig(stepNumber: number): StepExecutorConfig | null {
  return E2E_39_STEP_CONFIGS[stepNumber] ?? null;
}
