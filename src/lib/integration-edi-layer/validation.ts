import { z } from "zod/v4";

// ==========================================
// Integration Connections
// ==========================================

export const createConnectionSchema = z.object({
  connectionName: z.string().min(1).max(255),
  connectionCode: z.string().min(1).max(50),
  connectionType: z.enum(["erp", "edi", "port", "customs", "api", "webhook", "sftp"]),
  provider: z.enum(["oracle_fusion", "sap", "dpw_portconnect", "customs_qa", "customs_ae", "customs_sa", "customs_in", "generic"]),
  baseUrl: z.string().max(500).optional(),
  authType: z.enum(["oauth2", "api_key", "basic", "certificate", "none"]).optional(),
  authConfig: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(["active", "inactive", "testing", "error"]).optional(),
  retryPolicy: z.record(z.string(), z.unknown()).optional(),
  rateLimitPerMinute: z.number().int().min(1).optional(),
  timeoutMs: z.number().int().min(1000).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateConnectionSchema = createConnectionSchema.partial();

// ==========================================
// Integration Endpoints
// ==========================================

export const createEndpointSchema = z.object({
  connectionId: z.string().uuid(),
  endpointName: z.string().min(1).max(255),
  endpointCode: z.string().min(1).max(50),
  httpMethod: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).optional(),
  path: z.string().min(1).max(500),
  requestSchema: z.record(z.string(), z.unknown()).optional(),
  responseSchema: z.record(z.string(), z.unknown()).optional(),
  transformConfig: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateEndpointSchema = createEndpointSchema.partial();

// ==========================================
// Oracle Sync Jobs
// ==========================================

export const createOracleSyncJobSchema = z.object({
  connectionId: z.string().uuid().optional(),
  jobCode: z.string().min(1).max(50),
  syncType: z.enum(["full", "incremental", "delta", "manual"]),
  direction: z.enum(["inbound", "outbound", "bidirectional"]).optional(),
  entityType: z.string().min(1).max(50),
  scheduleCron: z.string().max(100).optional(),
  syncConfig: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const triggerOracleSyncSchema = z.object({
  jobId: z.string().uuid().optional(),
  syncType: z.enum(["full", "incremental", "delta", "manual"]).optional(),
  entityType: z.string().min(1).max(50).optional(),
});

// ==========================================
// EDI Messages
// ==========================================

export const createEdiMessageSchema = z.object({
  messageType: z.enum(["BAPLIE", "COPARN", "COPRAR", "CUSCAR", "IFTMIN", "IFTMBC", "IFTSTA", "MOVINS", "BERMAN", "CUSTOM"]),
  ediStandard: z.enum(["EDIFACT", "X12", "XML", "JSON"]).optional(),
  direction: z.enum(["inbound", "outbound"]),
  senderCode: z.string().min(1).max(50),
  receiverCode: z.string().min(1).max(50),
  rawContent: z.string().optional(),
  connectionId: z.string().uuid().optional(),
  relatedEntityType: z.string().max(50).optional(),
  relatedEntityId: z.string().uuid().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const parseEdiSchema = z.object({
  rawContent: z.string().min(1),
  ediStandard: z.enum(["EDIFACT", "X12", "XML", "JSON"]).optional(),
  messageType: z.string().max(30).optional(),
});

export const generateEdiSchema = z.object({
  messageType: z.enum(["BAPLIE", "COPARN", "COPRAR", "CUSCAR", "IFTMIN", "IFTMBC", "IFTSTA", "MOVINS", "BERMAN", "CUSTOM"]),
  ediStandard: z.enum(["EDIFACT", "X12", "XML", "JSON"]).optional(),
  senderCode: z.string().min(1).max(50),
  receiverCode: z.string().min(1).max(50),
  data: z.record(z.string(), z.unknown()),
});

// ==========================================
// Port Connect Messages
// ==========================================

export const createPortConnectMessageSchema = z.object({
  messageType: z.enum(["vessel_call", "container_gate", "bay_plan", "discharge_list", "load_list", "vessel_departure", "customs_release"]),
  direction: z.enum(["inbound", "outbound"]),
  portCode: z.string().min(1).max(20),
  terminalCode: z.string().max(20).optional(),
  vesselImo: z.string().max(20).optional(),
  voyageRef: z.string().max(50).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
  connectionId: z.string().uuid().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ==========================================
// Customs Filings
// ==========================================

export const createCustomsFilingSchema = z.object({
  filingType: z.enum(["import_declaration", "export_declaration", "transit_declaration", "re_export", "temporary_import", "free_zone"]),
  customsAuthority: z.enum(["qatar_customs", "dubai_customs", "abu_dhabi_customs", "saudi_customs", "india_customs"]),
  countryCode: z.string().min(2).max(3),
  portCode: z.string().max(20).optional(),
  declarationType: z.enum(["standard", "simplified", "pre_arrival", "post_clearance"]),
  declarationData: z.record(z.string(), z.unknown()).optional(),
  lineItems: z.array(z.record(z.string(), z.unknown())).optional(),
  hsCode: z.string().max(20).optional(),
  totalValue: z.number().int().optional(),
  currency: z.string().max(3).optional(),
  connectionId: z.string().uuid().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const submitCustomsFilingSchema = z.object({
  filingId: z.string().uuid(),
});

export const updateCustomsFilingSchema = createCustomsFilingSchema.partial();
