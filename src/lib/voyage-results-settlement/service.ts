import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  vrsVoyageCloses,
  vrsTcSettlements,
  vrsVoyagePnls,
  vrsHireReconciliations,
  vrsResultWorkflows,
  vrsIntercoSettlements,
  vrsProfitBenchmarks,
  vrsVoyageAnalytics,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Voyage Close Procedure & Sign-Off
// ==========================================
export async function listVoyageCloses({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vrsVoyageCloses.tenantId, tenantId), isNull(vrsVoyageCloses.deletedAt)];
  if (search) conditions.push(or(ilike(vrsVoyageCloses.closeRef, `%${search}%`), ilike(vrsVoyageCloses.title, `%${search}%`))!);
  if (status) conditions.push(eq(vrsVoyageCloses.status, status));
  if (cursor) conditions.push(lt(vrsVoyageCloses.createdAt, new Date(cursor)));
  const results = await db.select().from(vrsVoyageCloses).where(and(...conditions)).orderBy(desc(vrsVoyageCloses.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getVoyageClose(id: string, tenantId: string) {
  const [record] = await db.select().from(vrsVoyageCloses).where(and(eq(vrsVoyageCloses.id, id), eq(vrsVoyageCloses.tenantId, tenantId), isNull(vrsVoyageCloses.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Time Charter TA Settlement
// ==========================================
export async function listTcSettlements({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vrsTcSettlements.tenantId, tenantId), isNull(vrsTcSettlements.deletedAt)];
  if (search) conditions.push(or(ilike(vrsTcSettlements.settlementRef, `%${search}%`), ilike(vrsTcSettlements.title, `%${search}%`))!);
  if (status) conditions.push(eq(vrsTcSettlements.status, status));
  if (cursor) conditions.push(lt(vrsTcSettlements.createdAt, new Date(cursor)));
  const results = await db.select().from(vrsTcSettlements).where(and(...conditions)).orderBy(desc(vrsTcSettlements.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getTcSettlement(id: string, tenantId: string) {
  const [record] = await db.select().from(vrsTcSettlements).where(and(eq(vrsTcSettlements.id, id), eq(vrsTcSettlements.tenantId, tenantId), isNull(vrsTcSettlements.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Voyage P&L Finalization & Approval
// ==========================================
export async function listVoyagePnls({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vrsVoyagePnls.tenantId, tenantId), isNull(vrsVoyagePnls.deletedAt)];
  if (search) conditions.push(or(ilike(vrsVoyagePnls.pnlRef, `%${search}%`), ilike(vrsVoyagePnls.title, `%${search}%`))!);
  if (status) conditions.push(eq(vrsVoyagePnls.status, status));
  if (cursor) conditions.push(lt(vrsVoyagePnls.createdAt, new Date(cursor)));
  const results = await db.select().from(vrsVoyagePnls).where(and(...conditions)).orderBy(desc(vrsVoyagePnls.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getVoyagePnl(id: string, tenantId: string) {
  const [record] = await db.select().from(vrsVoyagePnls).where(and(eq(vrsVoyagePnls.id, id), eq(vrsVoyagePnls.tenantId, tenantId), isNull(vrsVoyagePnls.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Hire Statement Reconciliation & Dispute
// ==========================================
export async function listHireReconciliations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vrsHireReconciliations.tenantId, tenantId), isNull(vrsHireReconciliations.deletedAt)];
  if (search) conditions.push(or(ilike(vrsHireReconciliations.reconciliationRef, `%${search}%`), ilike(vrsHireReconciliations.title, `%${search}%`))!);
  if (status) conditions.push(eq(vrsHireReconciliations.status, status));
  if (cursor) conditions.push(lt(vrsHireReconciliations.createdAt, new Date(cursor)));
  const results = await db.select().from(vrsHireReconciliations).where(and(...conditions)).orderBy(desc(vrsHireReconciliations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getHireReconciliation(id: string, tenantId: string) {
  const [record] = await db.select().from(vrsHireReconciliations).where(and(eq(vrsHireReconciliations.id, id), eq(vrsHireReconciliations.tenantId, tenantId), isNull(vrsHireReconciliations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Voyage Result Workflow & Audit
// ==========================================
export async function listResultWorkflows({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vrsResultWorkflows.tenantId, tenantId), isNull(vrsResultWorkflows.deletedAt)];
  if (search) conditions.push(or(ilike(vrsResultWorkflows.workflowRef, `%${search}%`), ilike(vrsResultWorkflows.title, `%${search}%`))!);
  if (status) conditions.push(eq(vrsResultWorkflows.status, status));
  if (cursor) conditions.push(lt(vrsResultWorkflows.createdAt, new Date(cursor)));
  const results = await db.select().from(vrsResultWorkflows).where(and(...conditions)).orderBy(desc(vrsResultWorkflows.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getResultWorkflow(id: string, tenantId: string) {
  const [record] = await db.select().from(vrsResultWorkflows).where(and(eq(vrsResultWorkflows.id, id), eq(vrsResultWorkflows.tenantId, tenantId), isNull(vrsResultWorkflows.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Intercompany Voyage Cost Settlement
// ==========================================
export async function listIntercoSettlements({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vrsIntercoSettlements.tenantId, tenantId), isNull(vrsIntercoSettlements.deletedAt)];
  if (search) conditions.push(or(ilike(vrsIntercoSettlements.intercoRef, `%${search}%`), ilike(vrsIntercoSettlements.title, `%${search}%`))!);
  if (status) conditions.push(eq(vrsIntercoSettlements.status, status));
  if (cursor) conditions.push(lt(vrsIntercoSettlements.createdAt, new Date(cursor)));
  const results = await db.select().from(vrsIntercoSettlements).where(and(...conditions)).orderBy(desc(vrsIntercoSettlements.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getIntercoSettlement(id: string, tenantId: string) {
  const [record] = await db.select().from(vrsIntercoSettlements).where(and(eq(vrsIntercoSettlements.id, id), eq(vrsIntercoSettlements.tenantId, tenantId), isNull(vrsIntercoSettlements.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// AI Voyage Profitability Benchmarking
// ==========================================
export async function listProfitBenchmarks({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vrsProfitBenchmarks.tenantId, tenantId), isNull(vrsProfitBenchmarks.deletedAt)];
  if (search) conditions.push(or(ilike(vrsProfitBenchmarks.benchmarkRef, `%${search}%`), ilike(vrsProfitBenchmarks.title, `%${search}%`))!);
  if (status) conditions.push(eq(vrsProfitBenchmarks.status, status));
  if (cursor) conditions.push(lt(vrsProfitBenchmarks.createdAt, new Date(cursor)));
  const results = await db.select().from(vrsProfitBenchmarks).where(and(...conditions)).orderBy(desc(vrsProfitBenchmarks.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getProfitBenchmark(id: string, tenantId: string) {
  const [record] = await db.select().from(vrsProfitBenchmarks).where(and(eq(vrsProfitBenchmarks.id, id), eq(vrsProfitBenchmarks.tenantId, tenantId), isNull(vrsProfitBenchmarks.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Historical Voyage Analytics Dashboard
// ==========================================
export async function listVoyageAnalytics({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(vrsVoyageAnalytics.tenantId, tenantId), isNull(vrsVoyageAnalytics.deletedAt)];
  if (search) conditions.push(or(ilike(vrsVoyageAnalytics.analyticsRef, `%${search}%`), ilike(vrsVoyageAnalytics.title, `%${search}%`))!);
  if (status) conditions.push(eq(vrsVoyageAnalytics.status, status));
  if (cursor) conditions.push(lt(vrsVoyageAnalytics.createdAt, new Date(cursor)));
  const results = await db.select().from(vrsVoyageAnalytics).where(and(...conditions)).orderBy(desc(vrsVoyageAnalytics.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getVoyageAnalytics(id: string, tenantId: string) {
  const [record] = await db.select().from(vrsVoyageAnalytics).where(and(eq(vrsVoyageAnalytics.id, id), eq(vrsVoyageAnalytics.tenantId, tenantId), isNull(vrsVoyageAnalytics.deletedAt))).limit(1);
  return record ?? null;
}
