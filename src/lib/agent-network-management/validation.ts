import { z } from "zod/v4";

// ==========================================
// General Agent GA Agreement Management
// ==========================================
export const createGaAgreementSchema = z.object({
  agreementType: z.enum(["exclusive_ga", "non_exclusive_ga", "liner_agency", "tramp_agency", "port_agency"]),
  agentName: z.string().max(255).optional(),
  agentCode: z.string().max(50).optional(),
  territory: z.string().max(255).optional(),
  portsCovered: z.string().optional(),
  commencementDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  autoRenewal: z.boolean().optional(),
  terminationNoticeDays: z.number().int().optional(),
  baseCommissionPct: z.string().optional(),
  commissionCurrency: z.string().max(3).optional(),
  exclusivityClause: z.boolean().optional(),
  performanceGuarantee: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateGaAgreementSchema = createGaAgreementSchema.partial();

// ==========================================
// Sub-Agent Configuration & Access
// ==========================================
export const createSubAgentConfigSchema = z.object({
  configType: z.enum(["sub_agent_appointment", "access_grant", "territory_assignment", "commission_split", "reporting_config"]),
  parentAgentName: z.string().max(255).optional(),
  parentAgentCode: z.string().max(50).optional(),
  subAgentName: z.string().max(255).optional(),
  subAgentCode: z.string().max(50).optional(),
  territory: z.string().max(255).optional(),
  accessLevel: z.string().max(50).optional(),
  commissionSplitPct: z.string().optional(),
  bookingAuthority: z.boolean().optional(),
  maxBookingValue: z.string().optional(),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateSubAgentConfigSchema = createSubAgentConfigSchema.partial();

// ==========================================
// Agent Commission Calculation & Payment
// ==========================================
export const createAgentCommissionSchema = z.object({
  commissionType: z.enum(["freight_commission", "thc_commission", "surcharge_commission", "bonus_commission", "override_commission"]),
  agentName: z.string().max(255).optional(),
  agentCode: z.string().max(50).optional(),
  bookingRef: z.string().max(100).optional(),
  freightAmount: z.string().optional(),
  commissionRate: z.string().optional(),
  commissionAmount: z.string().optional(),
  commissionCurrency: z.string().max(3).optional(),
  periodFrom: z.coerce.date().optional(),
  periodTo: z.coerce.date().optional(),
  paymentDate: z.coerce.date().optional(),
  paymentRef: z.string().max(100).optional(),
  invoiceNumber: z.string().max(100).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateAgentCommissionSchema = createAgentCommissionSchema.partial();

// ==========================================
// Agency Agreement Document Management
// ==========================================
export const createAgencyDocumentSchema = z.object({
  documentType: z.enum(["agency_agreement", "amendment", "addendum", "termination_notice", "performance_report"]),
  agentName: z.string().max(255).optional(),
  agentCode: z.string().max(50).optional(),
  documentTitle: z.string().max(255).optional(),
  documentVersion: z.string().max(20).optional(),
  effectiveDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  signedBy: z.string().max(255).optional(),
  signedDate: z.coerce.date().optional(),
  fileUrl: z.string().optional(),
  fileSizeBytes: z.number().int().optional(),
  confidential: z.boolean().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateAgencyDocumentSchema = createAgencyDocumentSchema.partial();

// ==========================================
// Agent Performance KPI Dashboard
// ==========================================
export const createPerformanceKpiSchema = z.object({
  kpiType: z.enum(["volume_target", "revenue_target", "customer_acquisition", "service_quality", "collection_efficiency"]),
  agentName: z.string().max(255).optional(),
  agentCode: z.string().max(50).optional(),
  kpiPeriod: z.string().max(20).optional(),
  targetValue: z.string().optional(),
  actualValue: z.string().optional(),
  achievementPct: z.string().optional(),
  kpiCurrency: z.string().max(3).optional(),
  ranking: z.number().int().optional(),
  trendDirection: z.string().max(20).optional(),
  benchmarkValue: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePerformanceKpiSchema = createPerformanceKpiSchema.partial();

// ==========================================
// Agent Portal Access & Configuration
// ==========================================
export const createPortalConfigSchema = z.object({
  configType: z.enum(["portal_access", "branding_setup", "module_permissions", "api_integration", "sso_config"]),
  agentName: z.string().max(255).optional(),
  agentCode: z.string().max(50).optional(),
  portalUrl: z.string().max(500).optional(),
  brandingTheme: z.string().max(50).optional(),
  enabledModules: z.string().optional(),
  maxUsers: z.number().int().optional(),
  ssoEnabled: z.boolean().optional(),
  apiKeyIssued: z.boolean().optional(),
  lastLoginAt: z.coerce.date().optional(),
  activeSessions: z.number().int().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePortalConfigSchema = createPortalConfigSchema.partial();

// ==========================================
// Booking Authority Matrix Management
// ==========================================
export const createBookingAuthoritySchema = z.object({
  authorityType: z.enum(["full_authority", "limited_authority", "quote_only", "approval_required", "emergency_authority"]),
  agentName: z.string().max(255).optional(),
  agentCode: z.string().max(50).optional(),
  tradeRoute: z.string().max(100).optional(),
  maxBookingValue: z.string().optional(),
  maxDiscountPct: z.string().optional(),
  authorityCurrency: z.string().max(3).optional(),
  containerTypes: z.string().optional(),
  approvalThreshold: z.string().optional(),
  escalationContact: z.string().max(255).optional(),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateBookingAuthoritySchema = createBookingAuthoritySchema.partial();

// ==========================================
// Agent Incentive & Bonus Management
// ==========================================
export const createAgentIncentiveSchema = z.object({
  incentiveType: z.enum(["volume_bonus", "target_achievement", "growth_incentive", "loyalty_bonus", "special_campaign"]),
  agentName: z.string().max(255).optional(),
  agentCode: z.string().max(50).optional(),
  incentivePeriod: z.string().max(20).optional(),
  targetTeu: z.string().optional(),
  achievedTeu: z.string().optional(),
  bonusRate: z.string().optional(),
  bonusAmount: z.string().optional(),
  incentiveCurrency: z.string().max(3).optional(),
  payoutDate: z.coerce.date().optional(),
  approvedBy: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateAgentIncentiveSchema = createAgentIncentiveSchema.partial();
