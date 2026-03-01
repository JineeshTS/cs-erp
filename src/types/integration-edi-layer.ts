import type {
  ielIntegrationConnections,
  ielIntegrationEndpoints,
  ielOracleSyncJobs,
  ielOracleSyncMappings,
  ielEdiMessages,
  ielEdiMessageSegments,
  ielEdiProcessingLogs,
  ielPortConnectMessages,
  ielCustomsFilings,
  ielCustomsResponses,
} from "@/db/schema";

export type IntegrationConnection = typeof ielIntegrationConnections.$inferSelect;
export type NewIntegrationConnection = typeof ielIntegrationConnections.$inferInsert;

export type IntegrationEndpoint = typeof ielIntegrationEndpoints.$inferSelect;
export type NewIntegrationEndpoint = typeof ielIntegrationEndpoints.$inferInsert;

export type OracleSyncJob = typeof ielOracleSyncJobs.$inferSelect;
export type NewOracleSyncJob = typeof ielOracleSyncJobs.$inferInsert;

export type OracleSyncMapping = typeof ielOracleSyncMappings.$inferSelect;
export type NewOracleSyncMapping = typeof ielOracleSyncMappings.$inferInsert;

export type EdiMessage = typeof ielEdiMessages.$inferSelect;
export type NewEdiMessage = typeof ielEdiMessages.$inferInsert;

export type EdiMessageSegment = typeof ielEdiMessageSegments.$inferSelect;
export type NewEdiMessageSegment = typeof ielEdiMessageSegments.$inferInsert;

export type EdiProcessingLog = typeof ielEdiProcessingLogs.$inferSelect;
export type NewEdiProcessingLog = typeof ielEdiProcessingLogs.$inferInsert;

export type PortConnectMessage = typeof ielPortConnectMessages.$inferSelect;
export type NewPortConnectMessage = typeof ielPortConnectMessages.$inferInsert;

export type CustomsFiling = typeof ielCustomsFilings.$inferSelect;
export type NewCustomsFiling = typeof ielCustomsFilings.$inferInsert;

export type CustomsResponse = typeof ielCustomsResponses.$inferSelect;
export type NewCustomsResponse = typeof ielCustomsResponses.$inferInsert;
