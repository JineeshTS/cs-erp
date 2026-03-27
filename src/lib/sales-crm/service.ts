import { db } from "@/lib/db";
import { eq, and, isNull, ilike, lt, desc } from "drizzle-orm";
import {
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
} from "@/db/schema";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";

type ListParams = {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
};

// ==========================================
// Customers
// ==========================================

export async function listCustomers({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(scmCustomers.tenantId, tenantId),
    isNull(scmCustomers.deletedAt),
  ];
  if (search) conditions.push(ilike(scmCustomers.companyName, `%${search}%`));
  if (status) conditions.push(eq(scmCustomers.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(scmCustomers.createdAt, scmCustomers.id, cc)); }

  const results = await db
    .select()
    .from(scmCustomers)
    .where(and(...conditions))
    .orderBy(desc(scmCustomers.createdAt), desc(scmCustomers.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getCustomer(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(scmCustomers)
    .where(
      and(
        eq(scmCustomers.id, id),
        eq(scmCustomers.tenantId, tenantId),
        isNull(scmCustomers.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Customer Contacts
// ==========================================

export async function listCustomerContacts({
  tenantId,
  search,
  cursor,
  limit = 50,
}: ListParams & { customerId?: string }, customerId?: string) {
  const conditions = [
    eq(scmCustomerContacts.tenantId, tenantId),
    isNull(scmCustomerContacts.deletedAt),
  ];
  if (customerId) conditions.push(eq(scmCustomerContacts.customerId, customerId));
  if (search) conditions.push(ilike(scmCustomerContacts.firstName, `%${search}%`));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(scmCustomerContacts.createdAt, scmCustomerContacts.id, cc)); }

  const results = await db
    .select()
    .from(scmCustomerContacts)
    .where(and(...conditions))
    .orderBy(desc(scmCustomerContacts.createdAt), desc(scmCustomerContacts.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getCustomerContact(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(scmCustomerContacts)
    .where(
      and(
        eq(scmCustomerContacts.id, id),
        eq(scmCustomerContacts.tenantId, tenantId),
        isNull(scmCustomerContacts.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Customer Segments
// ==========================================

export async function listCustomerSegments({
  tenantId,
  search,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(scmCustomerSegments.tenantId, tenantId),
    isNull(scmCustomerSegments.deletedAt),
  ];
  if (search) conditions.push(ilike(scmCustomerSegments.segmentName, `%${search}%`));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(scmCustomerSegments.createdAt, scmCustomerSegments.id, cc)); }

  const results = await db
    .select()
    .from(scmCustomerSegments)
    .where(and(...conditions))
    .orderBy(desc(scmCustomerSegments.createdAt), desc(scmCustomerSegments.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getCustomerSegment(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(scmCustomerSegments)
    .where(
      and(
        eq(scmCustomerSegments.id, id),
        eq(scmCustomerSegments.tenantId, tenantId),
        isNull(scmCustomerSegments.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Pipeline Stages
// ==========================================

export async function listPipelineStages({
  tenantId,
  search,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(scmPipelineStages.tenantId, tenantId),
    isNull(scmPipelineStages.deletedAt),
  ];
  if (search) conditions.push(ilike(scmPipelineStages.stageName, `%${search}%`));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(scmPipelineStages.createdAt, scmPipelineStages.id, cc)); }

  const results = await db
    .select()
    .from(scmPipelineStages)
    .where(and(...conditions))
    .orderBy(desc(scmPipelineStages.createdAt), desc(scmPipelineStages.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getPipelineStage(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(scmPipelineStages)
    .where(
      and(
        eq(scmPipelineStages.id, id),
        eq(scmPipelineStages.tenantId, tenantId),
        isNull(scmPipelineStages.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Opportunities
// ==========================================

export async function listOpportunities({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(scmOpportunities.tenantId, tenantId),
    isNull(scmOpportunities.deletedAt),
  ];
  if (search) conditions.push(ilike(scmOpportunities.opportunityName, `%${search}%`));
  if (status) conditions.push(eq(scmOpportunities.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(scmOpportunities.createdAt, scmOpportunities.id, cc)); }

  const results = await db
    .select()
    .from(scmOpportunities)
    .where(and(...conditions))
    .orderBy(desc(scmOpportunities.createdAt), desc(scmOpportunities.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getOpportunity(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(scmOpportunities)
    .where(
      and(
        eq(scmOpportunities.id, id),
        eq(scmOpportunities.tenantId, tenantId),
        isNull(scmOpportunities.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Opportunity Activities
// ==========================================

export async function listOpportunityActivities({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams, opportunityId?: string) {
  const conditions = [
    eq(scmOpportunityActivities.tenantId, tenantId),
    isNull(scmOpportunityActivities.deletedAt),
  ];
  if (opportunityId) conditions.push(eq(scmOpportunityActivities.opportunityId, opportunityId));
  if (search) conditions.push(ilike(scmOpportunityActivities.subject, `%${search}%`));
  if (status) conditions.push(eq(scmOpportunityActivities.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(scmOpportunityActivities.createdAt, scmOpportunityActivities.id, cc)); }

  const results = await db
    .select()
    .from(scmOpportunityActivities)
    .where(and(...conditions))
    .orderBy(desc(scmOpportunityActivities.createdAt), desc(scmOpportunityActivities.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getOpportunityActivity(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(scmOpportunityActivities)
    .where(
      and(
        eq(scmOpportunityActivities.id, id),
        eq(scmOpportunityActivities.tenantId, tenantId),
        isNull(scmOpportunityActivities.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Rate Quotations
// ==========================================

export async function listRateQuotations({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(scmRateQuotations.tenantId, tenantId),
    isNull(scmRateQuotations.deletedAt),
  ];
  if (search) conditions.push(ilike(scmRateQuotations.quotationNumber, `%${search}%`));
  if (status) conditions.push(eq(scmRateQuotations.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(scmRateQuotations.createdAt, scmRateQuotations.id, cc)); }

  const results = await db
    .select()
    .from(scmRateQuotations)
    .where(and(...conditions))
    .orderBy(desc(scmRateQuotations.createdAt), desc(scmRateQuotations.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getRateQuotation(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(scmRateQuotations)
    .where(
      and(
        eq(scmRateQuotations.id, id),
        eq(scmRateQuotations.tenantId, tenantId),
        isNull(scmRateQuotations.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Quotation Line Items
// ==========================================

export async function listQuotationLineItems({
  tenantId,
  search,
  cursor,
  limit = 50,
}: ListParams, quotationId?: string) {
  const conditions = [
    eq(scmQuotationLineItems.tenantId, tenantId),
    isNull(scmQuotationLineItems.deletedAt),
  ];
  if (quotationId) conditions.push(eq(scmQuotationLineItems.quotationId, quotationId));
  if (search) conditions.push(ilike(scmQuotationLineItems.chargeName, `%${search}%`));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(scmQuotationLineItems.createdAt, scmQuotationLineItems.id, cc)); }

  const results = await db
    .select()
    .from(scmQuotationLineItems)
    .where(and(...conditions))
    .orderBy(desc(scmQuotationLineItems.createdAt), desc(scmQuotationLineItems.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getQuotationLineItem(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(scmQuotationLineItems)
    .where(
      and(
        eq(scmQuotationLineItems.id, id),
        eq(scmQuotationLineItems.tenantId, tenantId),
        isNull(scmQuotationLineItems.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Contracts
// ==========================================

export async function listContracts({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(scmContracts.tenantId, tenantId),
    isNull(scmContracts.deletedAt),
  ];
  if (search) conditions.push(ilike(scmContracts.contractName, `%${search}%`));
  if (status) conditions.push(eq(scmContracts.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(scmContracts.createdAt, scmContracts.id, cc)); }

  const results = await db
    .select()
    .from(scmContracts)
    .where(and(...conditions))
    .orderBy(desc(scmContracts.createdAt), desc(scmContracts.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getContract(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(scmContracts)
    .where(
      and(
        eq(scmContracts.id, id),
        eq(scmContracts.tenantId, tenantId),
        isNull(scmContracts.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Contract Line Items
// ==========================================

export async function listContractLineItems({
  tenantId,
  search,
  cursor,
  limit = 50,
}: ListParams, contractId?: string) {
  const conditions = [
    eq(scmContractLineItems.tenantId, tenantId),
    isNull(scmContractLineItems.deletedAt),
  ];
  if (contractId) conditions.push(eq(scmContractLineItems.contractId, contractId));
  if (search) conditions.push(ilike(scmContractLineItems.chargeName, `%${search}%`));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(scmContractLineItems.createdAt, scmContractLineItems.id, cc)); }

  const results = await db
    .select()
    .from(scmContractLineItems)
    .where(and(...conditions))
    .orderBy(desc(scmContractLineItems.createdAt), desc(scmContractLineItems.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getContractLineItem(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(scmContractLineItems)
    .where(
      and(
        eq(scmContractLineItems.id, id),
        eq(scmContractLineItems.tenantId, tenantId),
        isNull(scmContractLineItems.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Account Plans
// ==========================================

export async function listAccountPlans({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(scmAccountPlans.tenantId, tenantId),
    isNull(scmAccountPlans.deletedAt),
  ];
  if (search) conditions.push(ilike(scmAccountPlans.planName, `%${search}%`));
  if (status) conditions.push(eq(scmAccountPlans.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(scmAccountPlans.createdAt, scmAccountPlans.id, cc)); }

  const results = await db
    .select()
    .from(scmAccountPlans)
    .where(and(...conditions))
    .orderBy(desc(scmAccountPlans.createdAt), desc(scmAccountPlans.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getAccountPlan(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(scmAccountPlans)
    .where(
      and(
        eq(scmAccountPlans.id, id),
        eq(scmAccountPlans.tenantId, tenantId),
        isNull(scmAccountPlans.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Sales Targets
// ==========================================

export async function listSalesTargets({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(scmSalesTargets.tenantId, tenantId),
    isNull(scmSalesTargets.deletedAt),
  ];
  if (search) conditions.push(ilike(scmSalesTargets.targetName, `%${search}%`));
  if (status) conditions.push(eq(scmSalesTargets.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(scmSalesTargets.createdAt, scmSalesTargets.id, cc)); }

  const results = await db
    .select()
    .from(scmSalesTargets)
    .where(and(...conditions))
    .orderBy(desc(scmSalesTargets.createdAt), desc(scmSalesTargets.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getSalesTarget(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(scmSalesTargets)
    .where(
      and(
        eq(scmSalesTargets.id, id),
        eq(scmSalesTargets.tenantId, tenantId),
        isNull(scmSalesTargets.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Incentive Rules
// ==========================================

export async function listIncentiveRules({
  tenantId,
  search,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(scmIncentiveRules.tenantId, tenantId),
    isNull(scmIncentiveRules.deletedAt),
  ];
  if (search) conditions.push(ilike(scmIncentiveRules.ruleName, `%${search}%`));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(scmIncentiveRules.createdAt, scmIncentiveRules.id, cc)); }

  const results = await db
    .select()
    .from(scmIncentiveRules)
    .where(and(...conditions))
    .orderBy(desc(scmIncentiveRules.createdAt), desc(scmIncentiveRules.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getIncentiveRule(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(scmIncentiveRules)
    .where(
      and(
        eq(scmIncentiveRules.id, id),
        eq(scmIncentiveRules.tenantId, tenantId),
        isNull(scmIncentiveRules.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Onboarding Checklists
// ==========================================

export async function listOnboardingChecklists({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams, customerId?: string) {
  const conditions = [
    eq(scmOnboardingChecklists.tenantId, tenantId),
    isNull(scmOnboardingChecklists.deletedAt),
  ];
  if (customerId) conditions.push(eq(scmOnboardingChecklists.customerId, customerId));
  if (search) conditions.push(ilike(scmOnboardingChecklists.taskName, `%${search}%`));
  if (status) conditions.push(eq(scmOnboardingChecklists.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(scmOnboardingChecklists.createdAt, scmOnboardingChecklists.id, cc)); }

  const results = await db
    .select()
    .from(scmOnboardingChecklists)
    .where(and(...conditions))
    .orderBy(desc(scmOnboardingChecklists.createdAt), desc(scmOnboardingChecklists.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getOnboardingChecklist(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(scmOnboardingChecklists)
    .where(
      and(
        eq(scmOnboardingChecklists.id, id),
        eq(scmOnboardingChecklists.tenantId, tenantId),
        isNull(scmOnboardingChecklists.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Leads
// ==========================================

export async function listLeads({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(scmLeads.tenantId, tenantId),
    isNull(scmLeads.deletedAt),
  ];
  if (search) conditions.push(ilike(scmLeads.companyName, `%${search}%`));
  if (status) conditions.push(eq(scmLeads.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(scmLeads.createdAt, scmLeads.id, cc)); }

  const results = await db
    .select()
    .from(scmLeads)
    .where(and(...conditions))
    .orderBy(desc(scmLeads.createdAt), desc(scmLeads.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getLead(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(scmLeads)
    .where(
      and(
        eq(scmLeads.id, id),
        eq(scmLeads.tenantId, tenantId),
        isNull(scmLeads.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Campaigns
// ==========================================

export async function listCampaigns({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(scmCampaigns.tenantId, tenantId),
    isNull(scmCampaigns.deletedAt),
  ];
  if (search) conditions.push(ilike(scmCampaigns.campaignName, `%${search}%`));
  if (status) conditions.push(eq(scmCampaigns.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(scmCampaigns.createdAt, scmCampaigns.id, cc)); }

  const results = await db
    .select()
    .from(scmCampaigns)
    .where(and(...conditions))
    .orderBy(desc(scmCampaigns.createdAt), desc(scmCampaigns.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getCampaign(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(scmCampaigns)
    .where(
      and(
        eq(scmCampaigns.id, id),
        eq(scmCampaigns.tenantId, tenantId),
        isNull(scmCampaigns.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}
