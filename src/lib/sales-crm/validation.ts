import { z } from "zod";

// ==========================================
// Customer schemas
// ==========================================
export const createCustomerSchema = z.object({
  customerCode: z.string().min(1).max(50),
  companyName: z.string().min(1).max(255),
  tradeName: z.string().max(255).optional(),
  customerType: z.enum(["shipper", "consignee", "freight_forwarder", "nvocc", "agent", "broker"]).optional(),
  segmentId: z.string().uuid().optional(),
  tier: z.enum(["platinum", "gold", "silver", "standard"]).optional(),
  industry: z.string().max(100).optional(),
  country: z.string().min(2).max(3),
  city: z.string().max(100).optional(),
  address: z.string().optional(),
  postalCode: z.string().max(20).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().max(255).optional(),
  website: z.string().max(255).optional(),
  taxRegistrationNo: z.string().max(50).optional(),
  creditLimitAmount: z.number().int().min(0).optional(),
  creditCurrency: z.string().max(3).optional(),
  paymentTermsDays: z.number().int().min(0).optional(),
  annualRevenue: z.number().int().min(0).optional(),
  employeeCount: z.number().int().min(0).optional(),
  accountManagerId: z.string().uuid().optional(),
  status: z.enum(["active", "inactive", "suspended", "blacklisted"]).optional(),
  notes: z.string().optional(),
});
export const updateCustomerSchema = createCustomerSchema.partial();

// ==========================================
// Customer Contact schemas
// ==========================================
export const createCustomerContactSchema = z.object({
  customerId: z.string().uuid(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  jobTitle: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  email: z.string().max(255).optional(),
  phone: z.string().max(30).optional(),
  mobile: z.string().max(30).optional(),
  isPrimary: z.boolean().optional(),
  isDecisionMaker: z.boolean().optional(),
  preferredLanguage: z.string().max(5).optional(),
  notes: z.string().optional(),
});
export const updateCustomerContactSchema = createCustomerContactSchema.partial();

// ==========================================
// Customer Segment schemas
// ==========================================
export const createCustomerSegmentSchema = z.object({
  segmentName: z.string().min(1).max(100),
  segmentCode: z.string().min(1).max(30),
  description: z.string().optional(),
  criteria: z.record(z.string(), z.unknown()).optional(),
  color: z.string().max(7).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});
export const updateCustomerSegmentSchema = createCustomerSegmentSchema.partial();

// ==========================================
// Pipeline Stage schemas
// ==========================================
export const createPipelineStageSchema = z.object({
  stageName: z.string().min(1).max(100),
  stageCode: z.string().min(1).max(30),
  sortOrder: z.number().int().min(0).optional(),
  probability: z.number().int().min(0).max(100).optional(),
  color: z.string().max(7).optional(),
  isWon: z.boolean().optional(),
  isLost: z.boolean().optional(),
  isActive: z.boolean().optional(),
});
export const updatePipelineStageSchema = createPipelineStageSchema.partial();

// ==========================================
// Opportunity schemas
// ==========================================
export const createOpportunitySchema = z.object({
  opportunityName: z.string().min(1).max(255),
  opportunityCode: z.string().max(50).optional(),
  customerId: z.string().uuid(),
  contactId: z.string().uuid().optional(),
  stageId: z.string().uuid().optional(),
  ownerId: z.string().uuid(),
  expectedRevenue: z.number().int().min(0).optional(),
  currency: z.string().max(3).optional(),
  probability: z.number().int().min(0).max(100).optional(),
  expectedTeu: z.number().int().min(0).optional(),
  tradeLane: z.string().max(100).optional(),
  originPort: z.string().max(10).optional(),
  destinationPort: z.string().max(10).optional(),
  serviceType: z.enum(["fcl", "lcl", "breakbulk", "reefer", "tanker"]).optional(),
  expectedCloseDate: z.string().optional(),
  lostReason: z.string().max(100).optional(),
  competitorName: z.string().max(255).optional(),
  source: z.string().max(50).optional(),
  status: z.enum(["open", "won", "lost", "on_hold"]).optional(),
  notes: z.string().optional(),
});
export const updateOpportunitySchema = createOpportunitySchema.partial();

// ==========================================
// Opportunity Activity schemas
// ==========================================
export const createOpportunityActivitySchema = z.object({
  opportunityId: z.string().uuid(),
  activityType: z.enum(["call", "email", "meeting", "demo", "proposal", "follow_up", "site_visit"]),
  subject: z.string().min(1).max(255),
  description: z.string().optional(),
  activityDate: z.string().datetime(),
  dueDate: z.string().datetime().optional(),
  assignedTo: z.string().uuid().optional(),
  outcome: z.string().max(50).optional(),
  status: z.enum(["planned", "completed", "cancelled"]).optional(),
});
export const updateOpportunityActivitySchema = createOpportunityActivitySchema.partial();

// ==========================================
// Rate Quotation schemas
// ==========================================
export const createRateQuotationSchema = z.object({
  quotationNumber: z.string().min(1).max(50),
  customerId: z.string().uuid(),
  contactId: z.string().uuid().optional(),
  opportunityId: z.string().uuid().optional(),
  salesRepId: z.string().uuid(),
  originPort: z.string().min(1).max(10),
  destinationPort: z.string().min(1).max(10),
  tradeLane: z.string().max(100).optional(),
  serviceType: z.string().max(30).optional(),
  containerType: z.string().max(20).optional(),
  containerSize: z.string().max(10).optional(),
  estimatedTeu: z.number().int().min(0).optional(),
  estimatedVolume: z.number().int().min(0).optional(),
  totalAmount: z.number().int().min(0).optional(),
  currency: z.string().max(3).optional(),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime(),
  transitTimeDays: z.number().int().min(0).optional(),
  freeTimeDays: z.number().int().min(0).optional(),
  incoterm: z.string().max(10).optional(),
  status: z.enum(["draft", "submitted", "approved", "rejected", "expired", "accepted"]).optional(),
  notes: z.string().optional(),
});
export const updateRateQuotationSchema = createRateQuotationSchema.partial();

// ==========================================
// Quotation Line Item schemas
// ==========================================
export const createQuotationLineItemSchema = z.object({
  quotationId: z.string().uuid(),
  chargeCode: z.string().min(1).max(30),
  chargeName: z.string().min(1).max(255),
  chargeType: z.enum(["ocean_freight", "thc", "documentation", "customs", "inland", "surcharge", "other"]),
  basis: z.enum(["per_container", "per_teu", "per_bl", "per_shipment", "lumpsum"]),
  unitPrice: z.number().int(),
  quantity: z.number().int().min(1).optional(),
  totalPrice: z.number().int(),
  currency: z.string().max(3).optional(),
  containerType: z.string().max(20).optional(),
  containerSize: z.string().max(10).optional(),
  isMandatory: z.boolean().optional(),
  notes: z.string().optional(),
});
export const updateQuotationLineItemSchema = createQuotationLineItemSchema.partial();

// ==========================================
// Contract schemas
// ==========================================
export const createContractSchema = z.object({
  contractNumber: z.string().min(1).max(50),
  contractName: z.string().min(1).max(255),
  customerId: z.string().uuid(),
  quotationId: z.string().uuid().optional(),
  contractType: z.enum(["standard", "volume_commitment", "coa", "spot", "framework"]).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  autoRenew: z.boolean().optional(),
  renewalTermDays: z.number().int().min(0).optional(),
  minimumCommitmentTeu: z.number().int().min(0).optional(),
  maximumCommitmentTeu: z.number().int().min(0).optional(),
  penaltyRate: z.number().int().min(0).optional(),
  totalValue: z.number().int().min(0).optional(),
  currency: z.string().max(3).optional(),
  paymentTermsDays: z.number().int().min(0).optional(),
  tradeLane: z.string().max(100).optional(),
  salesRepId: z.string().uuid().optional(),
  status: z.enum(["draft", "active", "expired", "terminated", "suspended"]).optional(),
  notes: z.string().optional(),
});
export const updateContractSchema = createContractSchema.partial();

// ==========================================
// Contract Line Item schemas
// ==========================================
export const createContractLineItemSchema = z.object({
  contractId: z.string().uuid(),
  chargeCode: z.string().min(1).max(30),
  chargeName: z.string().min(1).max(255),
  chargeType: z.enum(["ocean_freight", "thc", "documentation", "customs", "inland", "surcharge", "other"]),
  basis: z.enum(["per_container", "per_teu", "per_bl", "per_shipment", "lumpsum"]),
  unitPrice: z.number().int(),
  currency: z.string().max(3).optional(),
  containerType: z.string().max(20).optional(),
  containerSize: z.string().max(10).optional(),
  originPort: z.string().max(10).optional(),
  destinationPort: z.string().max(10).optional(),
  validFrom: z.string().datetime().optional(),
  validTo: z.string().datetime().optional(),
  notes: z.string().optional(),
});
export const updateContractLineItemSchema = createContractLineItemSchema.partial();

// ==========================================
// Account Plan schemas
// ==========================================
export const createAccountPlanSchema = z.object({
  customerId: z.string().uuid(),
  planName: z.string().min(1).max(255),
  fiscalYear: z.number().int().min(2020).max(2050),
  accountManagerId: z.string().uuid(),
  revenueTargetAmount: z.number().int().min(0).optional(),
  teuTarget: z.number().int().min(0).optional(),
  retentionStrategy: z.string().optional(),
  growthStrategy: z.string().optional(),
  riskAssessment: z.string().optional(),
  competitiveAnalysis: z.string().optional(),
  keyObjectives: z.record(z.string(), z.unknown()).optional(),
  swotAnalysis: z.record(z.string(), z.unknown()).optional(),
  reviewDate: z.string().optional(),
  status: z.enum(["draft", "active", "reviewed", "archived"]).optional(),
  notes: z.string().optional(),
});
export const updateAccountPlanSchema = createAccountPlanSchema.partial();

// ==========================================
// Sales Target schemas
// ==========================================
export const createSalesTargetSchema = z.object({
  salesRepId: z.string().uuid(),
  targetName: z.string().min(1).max(255),
  targetType: z.enum(["revenue", "teu", "new_customer", "combined"]),
  fiscalYear: z.number().int().min(2020).max(2050),
  fiscalQuarter: z.number().int().min(1).max(4).optional(),
  fiscalMonth: z.number().int().min(1).max(12).optional(),
  revenueTarget: z.number().int().min(0).optional(),
  teuTarget: z.number().int().min(0).optional(),
  newCustomerTarget: z.number().int().min(0).optional(),
  revenueActual: z.number().int().min(0).optional(),
  teuActual: z.number().int().min(0).optional(),
  newCustomerActual: z.number().int().min(0).optional(),
  currency: z.string().max(3).optional(),
  tradeLane: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  status: z.enum(["active", "achieved", "missed", "cancelled"]).optional(),
  notes: z.string().optional(),
});
export const updateSalesTargetSchema = createSalesTargetSchema.partial();

// ==========================================
// Incentive Rule schemas
// ==========================================
export const createIncentiveRuleSchema = z.object({
  ruleName: z.string().min(1).max(255),
  ruleCode: z.string().min(1).max(50),
  targetType: z.enum(["revenue", "teu", "new_customer", "retention"]),
  thresholdPercent: z.number().int().min(0).max(200),
  commissionRate: z.number().int().min(0),
  bonusAmount: z.number().int().min(0).optional(),
  currency: z.string().max(3).optional(),
  cappedAt: z.number().int().min(0).optional(),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional(),
  appliesTo: z.enum(["all", "individual", "team", "region"]).optional(),
  region: z.string().max(100).optional(),
  tradeLane: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});
export const updateIncentiveRuleSchema = createIncentiveRuleSchema.partial();

// ==========================================
// Onboarding Checklist schemas
// ==========================================
export const createOnboardingChecklistSchema = z.object({
  customerId: z.string().uuid(),
  taskName: z.string().min(1).max(255),
  taskCategory: z.enum(["kyc", "credit_check", "documentation", "system_setup", "rate_setup", "training", "other"]),
  description: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isRequired: z.boolean().optional(),
  documentRequired: z.boolean().optional(),
  documentUrl: z.string().max(500).optional(),
  status: z.enum(["pending", "in_progress", "completed", "skipped"]).optional(),
  notes: z.string().optional(),
});
export const updateOnboardingChecklistSchema = createOnboardingChecklistSchema.partial();

// ==========================================
// Lead schemas
// ==========================================
export const createLeadSchema = z.object({
  companyName: z.string().min(1).max(255),
  contactName: z.string().min(1).max(255),
  contactEmail: z.string().max(255).optional(),
  contactPhone: z.string().max(30).optional(),
  jobTitle: z.string().max(100).optional(),
  country: z.string().max(3).optional(),
  city: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  estimatedTeu: z.number().int().min(0).optional(),
  estimatedRevenue: z.number().int().min(0).optional(),
  tradeLane: z.string().max(100).optional(),
  source: z.enum(["website", "referral", "trade_show", "cold_call", "email_campaign", "partner", "social_media", "other"]),
  campaignId: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),
  qualificationScore: z.number().int().min(0).max(100).optional(),
  status: z.enum(["new", "contacted", "qualified", "unqualified", "converted", "lost"]).optional(),
  notes: z.string().optional(),
});
export const updateLeadSchema = createLeadSchema.partial();

// ==========================================
// Campaign schemas
// ==========================================
export const createCampaignSchema = z.object({
  campaignName: z.string().min(1).max(255),
  campaignCode: z.string().min(1).max(50),
  campaignType: z.enum(["email", "trade_show", "webinar", "print", "digital_ads", "referral_program", "other"]),
  description: z.string().optional(),
  targetAudience: z.string().max(100).optional(),
  channel: z.string().max(30).optional(),
  budgetAmount: z.number().int().min(0).optional(),
  spentAmount: z.number().int().min(0).optional(),
  currency: z.string().max(3).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  region: z.string().max(100).optional(),
  tradeLane: z.string().max(100).optional(),
  status: z.enum(["draft", "active", "paused", "completed", "cancelled"]).optional(),
  notes: z.string().optional(),
});
export const updateCampaignSchema = createCampaignSchema.partial();
