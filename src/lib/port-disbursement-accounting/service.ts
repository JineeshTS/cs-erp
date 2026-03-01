import { and, eq, ilike, isNull, gt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  pdaProformaEstimates,
  pdaFinalDas,
  pdaPortCosts,
  pdaAgentStatements,
  pdaExpenseAllocations,
  pdaVarianceAnalyses,
  pdaCostBenchmarks,
  pdaConsolidatedReports,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Proforma DA Estimates
// ==========================================

export async function listProformaEstimates({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pdaProformaEstimates.tenantId, tenantId), isNull(pdaProformaEstimates.deletedAt)];
  if (search) conditions.push(or(ilike(pdaProformaEstimates.estimateRef, `%${search}%`), ilike(pdaProformaEstimates.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(pdaProformaEstimates.status, status));
  if (cursor) conditions.push(gt(pdaProformaEstimates.createdAt, new Date(cursor)));
  const results = await db.select().from(pdaProformaEstimates).where(and(...conditions)).orderBy(desc(pdaProformaEstimates.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getProformaEstimate(id: string, tenantId: string) {
  const [record] = await db.select().from(pdaProformaEstimates).where(and(eq(pdaProformaEstimates.id, id), eq(pdaProformaEstimates.tenantId, tenantId), isNull(pdaProformaEstimates.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Final DAs
// ==========================================

export async function listFinalDas({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pdaFinalDas.tenantId, tenantId), isNull(pdaFinalDas.deletedAt)];
  if (search) conditions.push(or(ilike(pdaFinalDas.fdaRef, `%${search}%`), ilike(pdaFinalDas.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(pdaFinalDas.status, status));
  if (cursor) conditions.push(gt(pdaFinalDas.createdAt, new Date(cursor)));
  const results = await db.select().from(pdaFinalDas).where(and(...conditions)).orderBy(desc(pdaFinalDas.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getFinalDa(id: string, tenantId: string) {
  const [record] = await db.select().from(pdaFinalDas).where(and(eq(pdaFinalDas.id, id), eq(pdaFinalDas.tenantId, tenantId), isNull(pdaFinalDas.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Port Costs
// ==========================================

export async function listPortCosts({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pdaPortCosts.tenantId, tenantId), isNull(pdaPortCosts.deletedAt)];
  if (search) conditions.push(or(ilike(pdaPortCosts.costRef, `%${search}%`), ilike(pdaPortCosts.portName, `%${search}%`))!);
  if (status) conditions.push(eq(pdaPortCosts.status, status));
  if (cursor) conditions.push(gt(pdaPortCosts.createdAt, new Date(cursor)));
  const results = await db.select().from(pdaPortCosts).where(and(...conditions)).orderBy(desc(pdaPortCosts.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPortCost(id: string, tenantId: string) {
  const [record] = await db.select().from(pdaPortCosts).where(and(eq(pdaPortCosts.id, id), eq(pdaPortCosts.tenantId, tenantId), isNull(pdaPortCosts.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Agent Statements
// ==========================================

export async function listAgentStatements({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pdaAgentStatements.tenantId, tenantId), isNull(pdaAgentStatements.deletedAt)];
  if (search) conditions.push(or(ilike(pdaAgentStatements.statementRef, `%${search}%`), ilike(pdaAgentStatements.agentName, `%${search}%`))!);
  if (status) conditions.push(eq(pdaAgentStatements.status, status));
  if (cursor) conditions.push(gt(pdaAgentStatements.createdAt, new Date(cursor)));
  const results = await db.select().from(pdaAgentStatements).where(and(...conditions)).orderBy(desc(pdaAgentStatements.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getAgentStatement(id: string, tenantId: string) {
  const [record] = await db.select().from(pdaAgentStatements).where(and(eq(pdaAgentStatements.id, id), eq(pdaAgentStatements.tenantId, tenantId), isNull(pdaAgentStatements.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Expense Allocations
// ==========================================

export async function listExpenseAllocations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pdaExpenseAllocations.tenantId, tenantId), isNull(pdaExpenseAllocations.deletedAt)];
  if (search) conditions.push(or(ilike(pdaExpenseAllocations.allocationRef, `%${search}%`), ilike(pdaExpenseAllocations.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(pdaExpenseAllocations.status, status));
  if (cursor) conditions.push(gt(pdaExpenseAllocations.createdAt, new Date(cursor)));
  const results = await db.select().from(pdaExpenseAllocations).where(and(...conditions)).orderBy(desc(pdaExpenseAllocations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getExpenseAllocation(id: string, tenantId: string) {
  const [record] = await db.select().from(pdaExpenseAllocations).where(and(eq(pdaExpenseAllocations.id, id), eq(pdaExpenseAllocations.tenantId, tenantId), isNull(pdaExpenseAllocations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Variance Analyses
// ==========================================

export async function listVarianceAnalyses({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pdaVarianceAnalyses.tenantId, tenantId), isNull(pdaVarianceAnalyses.deletedAt)];
  if (search) conditions.push(or(ilike(pdaVarianceAnalyses.analysisRef, `%${search}%`), ilike(pdaVarianceAnalyses.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(pdaVarianceAnalyses.status, status));
  if (cursor) conditions.push(gt(pdaVarianceAnalyses.createdAt, new Date(cursor)));
  const results = await db.select().from(pdaVarianceAnalyses).where(and(...conditions)).orderBy(desc(pdaVarianceAnalyses.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getVarianceAnalysis(id: string, tenantId: string) {
  const [record] = await db.select().from(pdaVarianceAnalyses).where(and(eq(pdaVarianceAnalyses.id, id), eq(pdaVarianceAnalyses.tenantId, tenantId), isNull(pdaVarianceAnalyses.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Cost Benchmarks
// ==========================================

export async function listCostBenchmarks({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pdaCostBenchmarks.tenantId, tenantId), isNull(pdaCostBenchmarks.deletedAt)];
  if (search) conditions.push(or(ilike(pdaCostBenchmarks.benchmarkRef, `%${search}%`), ilike(pdaCostBenchmarks.portName, `%${search}%`))!);
  if (status) conditions.push(eq(pdaCostBenchmarks.status, status));
  if (cursor) conditions.push(gt(pdaCostBenchmarks.createdAt, new Date(cursor)));
  const results = await db.select().from(pdaCostBenchmarks).where(and(...conditions)).orderBy(desc(pdaCostBenchmarks.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCostBenchmark(id: string, tenantId: string) {
  const [record] = await db.select().from(pdaCostBenchmarks).where(and(eq(pdaCostBenchmarks.id, id), eq(pdaCostBenchmarks.tenantId, tenantId), isNull(pdaCostBenchmarks.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Consolidated Reports
// ==========================================

export async function listConsolidatedReports({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pdaConsolidatedReports.tenantId, tenantId), isNull(pdaConsolidatedReports.deletedAt)];
  if (search) conditions.push(or(ilike(pdaConsolidatedReports.reportRef, `%${search}%`), ilike(pdaConsolidatedReports.reportType, `%${search}%`))!);
  if (status) conditions.push(eq(pdaConsolidatedReports.status, status));
  if (cursor) conditions.push(gt(pdaConsolidatedReports.createdAt, new Date(cursor)));
  const results = await db.select().from(pdaConsolidatedReports).where(and(...conditions)).orderBy(desc(pdaConsolidatedReports.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getConsolidatedReport(id: string, tenantId: string) {
  const [record] = await db.select().from(pdaConsolidatedReports).where(and(eq(pdaConsolidatedReports.id, id), eq(pdaConsolidatedReports.tenantId, tenantId), isNull(pdaConsolidatedReports.deletedAt))).limit(1);
  return record ?? null;
}
