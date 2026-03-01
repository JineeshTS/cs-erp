import { and, eq, ilike, isNull, gt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  cfmVoyageBudgets,
  cfmPortDisbursements,
  cfmRevenueRecognitions,
  cfmAgencyCommissions,
  cfmVoyagePnlReports,
  cfmContainerCosts,
  cfmOverheadAllocations,
  cfmVarianceAnalyses,
  cfmCostCentres,
  cfmCapexItems,
  cfmAnomalyDetections,
  cfmKpiReports,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Voyage Budgets
// ==========================================

export async function listVoyageBudgets({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(cfmVoyageBudgets.tenantId, tenantId), isNull(cfmVoyageBudgets.deletedAt)];
  if (search) conditions.push(or(ilike(cfmVoyageBudgets.budgetRef, `%${search}%`), ilike(cfmVoyageBudgets.vesselName, `%${search}%`), ilike(cfmVoyageBudgets.voyageRef, `%${search}%`))!);
  if (status) conditions.push(eq(cfmVoyageBudgets.status, status));
  if (cursor) conditions.push(gt(cfmVoyageBudgets.createdAt, new Date(cursor)));
  const results = await db.select().from(cfmVoyageBudgets).where(and(...conditions)).orderBy(desc(cfmVoyageBudgets.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getVoyageBudget(id: string, tenantId: string) {
  const [record] = await db.select().from(cfmVoyageBudgets).where(and(eq(cfmVoyageBudgets.id, id), eq(cfmVoyageBudgets.tenantId, tenantId), isNull(cfmVoyageBudgets.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Port Disbursements
// ==========================================

export async function listPortDisbursements({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(cfmPortDisbursements.tenantId, tenantId), isNull(cfmPortDisbursements.deletedAt)];
  if (search) conditions.push(or(ilike(cfmPortDisbursements.disbursementRef, `%${search}%`), ilike(cfmPortDisbursements.vesselName, `%${search}%`), ilike(cfmPortDisbursements.port, `%${search}%`))!);
  if (status) conditions.push(eq(cfmPortDisbursements.status, status));
  if (cursor) conditions.push(gt(cfmPortDisbursements.createdAt, new Date(cursor)));
  const results = await db.select().from(cfmPortDisbursements).where(and(...conditions)).orderBy(desc(cfmPortDisbursements.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPortDisbursement(id: string, tenantId: string) {
  const [record] = await db.select().from(cfmPortDisbursements).where(and(eq(cfmPortDisbursements.id, id), eq(cfmPortDisbursements.tenantId, tenantId), isNull(cfmPortDisbursements.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Revenue Recognitions
// ==========================================

export async function listRevenueRecognitions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(cfmRevenueRecognitions.tenantId, tenantId), isNull(cfmRevenueRecognitions.deletedAt)];
  if (search) conditions.push(or(ilike(cfmRevenueRecognitions.recognitionRef, `%${search}%`), ilike(cfmRevenueRecognitions.voyageRef ?? "", `%${search}%`))!);
  if (status) conditions.push(eq(cfmRevenueRecognitions.status, status));
  if (cursor) conditions.push(gt(cfmRevenueRecognitions.createdAt, new Date(cursor)));
  const results = await db.select().from(cfmRevenueRecognitions).where(and(...conditions)).orderBy(desc(cfmRevenueRecognitions.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getRevenueRecognition(id: string, tenantId: string) {
  const [record] = await db.select().from(cfmRevenueRecognitions).where(and(eq(cfmRevenueRecognitions.id, id), eq(cfmRevenueRecognitions.tenantId, tenantId), isNull(cfmRevenueRecognitions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Agency Commissions
// ==========================================

export async function listAgencyCommissions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(cfmAgencyCommissions.tenantId, tenantId), isNull(cfmAgencyCommissions.deletedAt)];
  if (search) conditions.push(or(ilike(cfmAgencyCommissions.commissionRef, `%${search}%`), ilike(cfmAgencyCommissions.agentName, `%${search}%`))!);
  if (status) conditions.push(eq(cfmAgencyCommissions.status, status));
  if (cursor) conditions.push(gt(cfmAgencyCommissions.createdAt, new Date(cursor)));
  const results = await db.select().from(cfmAgencyCommissions).where(and(...conditions)).orderBy(desc(cfmAgencyCommissions.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getAgencyCommission(id: string, tenantId: string) {
  const [record] = await db.select().from(cfmAgencyCommissions).where(and(eq(cfmAgencyCommissions.id, id), eq(cfmAgencyCommissions.tenantId, tenantId), isNull(cfmAgencyCommissions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Voyage P&L Reports
// ==========================================

export async function listVoyagePnlReports({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(cfmVoyagePnlReports.tenantId, tenantId), isNull(cfmVoyagePnlReports.deletedAt)];
  if (search) conditions.push(or(ilike(cfmVoyagePnlReports.reportRef, `%${search}%`), ilike(cfmVoyagePnlReports.vesselName, `%${search}%`), ilike(cfmVoyagePnlReports.voyageRef, `%${search}%`))!);
  if (status) conditions.push(eq(cfmVoyagePnlReports.status, status));
  if (cursor) conditions.push(gt(cfmVoyagePnlReports.createdAt, new Date(cursor)));
  const results = await db.select().from(cfmVoyagePnlReports).where(and(...conditions)).orderBy(desc(cfmVoyagePnlReports.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getVoyagePnlReport(id: string, tenantId: string) {
  const [record] = await db.select().from(cfmVoyagePnlReports).where(and(eq(cfmVoyagePnlReports.id, id), eq(cfmVoyagePnlReports.tenantId, tenantId), isNull(cfmVoyagePnlReports.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Container Costs
// ==========================================

export async function listContainerCosts({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(cfmContainerCosts.tenantId, tenantId), isNull(cfmContainerCosts.deletedAt)];
  if (search) conditions.push(or(ilike(cfmContainerCosts.costRef, `%${search}%`), ilike(cfmContainerCosts.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(cfmContainerCosts.status, status));
  if (cursor) conditions.push(gt(cfmContainerCosts.createdAt, new Date(cursor)));
  const results = await db.select().from(cfmContainerCosts).where(and(...conditions)).orderBy(desc(cfmContainerCosts.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getContainerCost(id: string, tenantId: string) {
  const [record] = await db.select().from(cfmContainerCosts).where(and(eq(cfmContainerCosts.id, id), eq(cfmContainerCosts.tenantId, tenantId), isNull(cfmContainerCosts.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Overhead Allocations
// ==========================================

export async function listOverheadAllocations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(cfmOverheadAllocations.tenantId, tenantId), isNull(cfmOverheadAllocations.deletedAt)];
  if (search) conditions.push(or(ilike(cfmOverheadAllocations.allocationRef, `%${search}%`), ilike(cfmOverheadAllocations.costCentre, `%${search}%`))!);
  if (status) conditions.push(eq(cfmOverheadAllocations.status, status));
  if (cursor) conditions.push(gt(cfmOverheadAllocations.createdAt, new Date(cursor)));
  const results = await db.select().from(cfmOverheadAllocations).where(and(...conditions)).orderBy(desc(cfmOverheadAllocations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getOverheadAllocation(id: string, tenantId: string) {
  const [record] = await db.select().from(cfmOverheadAllocations).where(and(eq(cfmOverheadAllocations.id, id), eq(cfmOverheadAllocations.tenantId, tenantId), isNull(cfmOverheadAllocations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Variance Analyses
// ==========================================

export async function listVarianceAnalyses({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(cfmVarianceAnalyses.tenantId, tenantId), isNull(cfmVarianceAnalyses.deletedAt)];
  if (search) conditions.push(or(ilike(cfmVarianceAnalyses.analysisRef, `%${search}%`), ilike(cfmVarianceAnalyses.voyageRef ?? "", `%${search}%`))!);
  if (status) conditions.push(eq(cfmVarianceAnalyses.status, status));
  if (cursor) conditions.push(gt(cfmVarianceAnalyses.createdAt, new Date(cursor)));
  const results = await db.select().from(cfmVarianceAnalyses).where(and(...conditions)).orderBy(desc(cfmVarianceAnalyses.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getVarianceAnalysis(id: string, tenantId: string) {
  const [record] = await db.select().from(cfmVarianceAnalyses).where(and(eq(cfmVarianceAnalyses.id, id), eq(cfmVarianceAnalyses.tenantId, tenantId), isNull(cfmVarianceAnalyses.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Cost Centres
// ==========================================

export async function listCostCentres({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(cfmCostCentres.tenantId, tenantId), isNull(cfmCostCentres.deletedAt)];
  if (search) conditions.push(or(ilike(cfmCostCentres.centreCode, `%${search}%`), ilike(cfmCostCentres.centreName, `%${search}%`))!);
  if (status) conditions.push(eq(cfmCostCentres.centreType, status));
  if (cursor) conditions.push(gt(cfmCostCentres.createdAt, new Date(cursor)));
  const results = await db.select().from(cfmCostCentres).where(and(...conditions)).orderBy(desc(cfmCostCentres.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCostCentre(id: string, tenantId: string) {
  const [record] = await db.select().from(cfmCostCentres).where(and(eq(cfmCostCentres.id, id), eq(cfmCostCentres.tenantId, tenantId), isNull(cfmCostCentres.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// CAPEX Items
// ==========================================

export async function listCapexItems({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(cfmCapexItems.tenantId, tenantId), isNull(cfmCapexItems.deletedAt)];
  if (search) conditions.push(or(ilike(cfmCapexItems.capexRef, `%${search}%`), ilike(cfmCapexItems.assetName, `%${search}%`))!);
  if (status) conditions.push(eq(cfmCapexItems.status, status));
  if (cursor) conditions.push(gt(cfmCapexItems.createdAt, new Date(cursor)));
  const results = await db.select().from(cfmCapexItems).where(and(...conditions)).orderBy(desc(cfmCapexItems.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCapexItem(id: string, tenantId: string) {
  const [record] = await db.select().from(cfmCapexItems).where(and(eq(cfmCapexItems.id, id), eq(cfmCapexItems.tenantId, tenantId), isNull(cfmCapexItems.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Anomaly Detections
// ==========================================

export async function listAnomalyDetections({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(cfmAnomalyDetections.tenantId, tenantId), isNull(cfmAnomalyDetections.deletedAt)];
  if (search) conditions.push(or(ilike(cfmAnomalyDetections.anomalyRef, `%${search}%`), ilike(cfmAnomalyDetections.detectedEntity, `%${search}%`))!);
  if (status) conditions.push(eq(cfmAnomalyDetections.status, status));
  if (cursor) conditions.push(gt(cfmAnomalyDetections.createdAt, new Date(cursor)));
  const results = await db.select().from(cfmAnomalyDetections).where(and(...conditions)).orderBy(desc(cfmAnomalyDetections.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getAnomalyDetection(id: string, tenantId: string) {
  const [record] = await db.select().from(cfmAnomalyDetections).where(and(eq(cfmAnomalyDetections.id, id), eq(cfmAnomalyDetections.tenantId, tenantId), isNull(cfmAnomalyDetections.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// KPI Reports
// ==========================================

export async function listKpiReports({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(cfmKpiReports.tenantId, tenantId), isNull(cfmKpiReports.deletedAt)];
  if (search) conditions.push(or(ilike(cfmKpiReports.reportRef, `%${search}%`), ilike(cfmKpiReports.reportName, `%${search}%`))!);
  if (status) conditions.push(eq(cfmKpiReports.status, status));
  if (cursor) conditions.push(gt(cfmKpiReports.createdAt, new Date(cursor)));
  const results = await db.select().from(cfmKpiReports).where(and(...conditions)).orderBy(desc(cfmKpiReports.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getKpiReport(id: string, tenantId: string) {
  const [record] = await db.select().from(cfmKpiReports).where(and(eq(cfmKpiReports.id, id), eq(cfmKpiReports.tenantId, tenantId), isNull(cfmKpiReports.deletedAt))).limit(1);
  return record ?? null;
}
