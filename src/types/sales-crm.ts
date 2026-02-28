import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  scmCustomers,
  scmCustomerContacts,
  scmCustomerSegments,
  scmPipelineStages,
  scmOpportunities,
  scmOpportunityActivities,
  scmRateQuotations,
  scmQuotationLineItems,
  scmContracts,
  scmContractLineItems,
  scmAccountPlans,
  scmSalesTargets,
  scmIncentiveRules,
  scmOnboardingChecklists,
  scmLeads,
  scmCampaigns,
} from "@/db/schema/sales-crm";

// Customer
export type Customer = InferSelectModel<typeof scmCustomers>;
export type NewCustomer = InferInsertModel<typeof scmCustomers>;

// Customer Contact
export type CustomerContact = InferSelectModel<typeof scmCustomerContacts>;
export type NewCustomerContact = InferInsertModel<typeof scmCustomerContacts>;

// Customer Segment
export type CustomerSegment = InferSelectModel<typeof scmCustomerSegments>;
export type NewCustomerSegment = InferInsertModel<typeof scmCustomerSegments>;

// Pipeline Stage
export type PipelineStage = InferSelectModel<typeof scmPipelineStages>;
export type NewPipelineStage = InferInsertModel<typeof scmPipelineStages>;

// Opportunity
export type Opportunity = InferSelectModel<typeof scmOpportunities>;
export type NewOpportunity = InferInsertModel<typeof scmOpportunities>;

// Opportunity Activity
export type OpportunityActivity = InferSelectModel<typeof scmOpportunityActivities>;
export type NewOpportunityActivity = InferInsertModel<typeof scmOpportunityActivities>;

// Rate Quotation
export type RateQuotation = InferSelectModel<typeof scmRateQuotations>;
export type NewRateQuotation = InferInsertModel<typeof scmRateQuotations>;

// Quotation Line Item
export type QuotationLineItem = InferSelectModel<typeof scmQuotationLineItems>;
export type NewQuotationLineItem = InferInsertModel<typeof scmQuotationLineItems>;

// Contract
export type SalesContract = InferSelectModel<typeof scmContracts>;
export type NewSalesContract = InferInsertModel<typeof scmContracts>;

// Contract Line Item
export type ContractLineItem = InferSelectModel<typeof scmContractLineItems>;
export type NewContractLineItem = InferInsertModel<typeof scmContractLineItems>;

// Account Plan
export type AccountPlan = InferSelectModel<typeof scmAccountPlans>;
export type NewAccountPlan = InferInsertModel<typeof scmAccountPlans>;

// Sales Target
export type SalesTarget = InferSelectModel<typeof scmSalesTargets>;
export type NewSalesTarget = InferInsertModel<typeof scmSalesTargets>;

// Incentive Rule
export type IncentiveRule = InferSelectModel<typeof scmIncentiveRules>;
export type NewIncentiveRule = InferInsertModel<typeof scmIncentiveRules>;

// Onboarding Checklist
export type OnboardingChecklist = InferSelectModel<typeof scmOnboardingChecklists>;
export type NewOnboardingChecklist = InferInsertModel<typeof scmOnboardingChecklists>;

// Lead
export type Lead = InferSelectModel<typeof scmLeads>;
export type NewLead = InferInsertModel<typeof scmLeads>;

// Campaign
export type Campaign = InferSelectModel<typeof scmCampaigns>;
export type NewCampaign = InferInsertModel<typeof scmCampaigns>;
