import { and, eq, ilike, isNull, gt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  clmLeaseAgreements,
  clmOnhireOffhires,
  clmMnrDamageBillings,
  clmLeaseCostAllocations,
  clmLessorReconciliations,
  clmContainerRedeliveries,
  clmLeaseVsBuyAnalyses,
  clmFleetOptimizers,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Lease Agreement Lifecycle Management
// ==========================================
export async function listLeaseAgreements({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(clmLeaseAgreements.tenantId, tenantId), isNull(clmLeaseAgreements.deletedAt)];
  if (search) conditions.push(or(ilike(clmLeaseAgreements.agreementRef, `%${search}%`), ilike(clmLeaseAgreements.lessorName, `%${search}%`))!);
  if (status) conditions.push(eq(clmLeaseAgreements.status, status));
  if (cursor) conditions.push(gt(clmLeaseAgreements.createdAt, new Date(cursor)));
  const results = await db.select().from(clmLeaseAgreements).where(and(...conditions)).orderBy(desc(clmLeaseAgreements.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getLeaseAgreement(id: string, tenantId: string) {
  const [record] = await db.select().from(clmLeaseAgreements).where(and(eq(clmLeaseAgreements.id, id), eq(clmLeaseAgreements.tenantId, tenantId), isNull(clmLeaseAgreements.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// On-Hire Off-Hire Event Tracking
// ==========================================
export async function listOnhireOffhires({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(clmOnhireOffhires.tenantId, tenantId), isNull(clmOnhireOffhires.deletedAt)];
  if (search) conditions.push(or(ilike(clmOnhireOffhires.eventRef, `%${search}%`), ilike(clmOnhireOffhires.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(clmOnhireOffhires.status, status));
  if (cursor) conditions.push(gt(clmOnhireOffhires.createdAt, new Date(cursor)));
  const results = await db.select().from(clmOnhireOffhires).where(and(...conditions)).orderBy(desc(clmOnhireOffhires.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getOnhireOffhire(id: string, tenantId: string) {
  const [record] = await db.select().from(clmOnhireOffhires).where(and(eq(clmOnhireOffhires.id, id), eq(clmOnhireOffhires.tenantId, tenantId), isNull(clmOnhireOffhires.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// MNR Damage Billing to Lessor
// ==========================================
export async function listMnrDamageBillings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(clmMnrDamageBillings.tenantId, tenantId), isNull(clmMnrDamageBillings.deletedAt)];
  if (search) conditions.push(or(ilike(clmMnrDamageBillings.billingRef, `%${search}%`), ilike(clmMnrDamageBillings.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(clmMnrDamageBillings.status, status));
  if (cursor) conditions.push(gt(clmMnrDamageBillings.createdAt, new Date(cursor)));
  const results = await db.select().from(clmMnrDamageBillings).where(and(...conditions)).orderBy(desc(clmMnrDamageBillings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getMnrDamageBilling(id: string, tenantId: string) {
  const [record] = await db.select().from(clmMnrDamageBillings).where(and(eq(clmMnrDamageBillings.id, id), eq(clmMnrDamageBillings.tenantId, tenantId), isNull(clmMnrDamageBillings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Lease Cost Allocation per Trade
// ==========================================
export async function listLeaseCostAllocations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(clmLeaseCostAllocations.tenantId, tenantId), isNull(clmLeaseCostAllocations.deletedAt)];
  if (search) conditions.push(or(ilike(clmLeaseCostAllocations.allocationRef, `%${search}%`), ilike(clmLeaseCostAllocations.tradeLane, `%${search}%`))!);
  if (status) conditions.push(eq(clmLeaseCostAllocations.status, status));
  if (cursor) conditions.push(gt(clmLeaseCostAllocations.createdAt, new Date(cursor)));
  const results = await db.select().from(clmLeaseCostAllocations).where(and(...conditions)).orderBy(desc(clmLeaseCostAllocations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getLeaseCostAllocation(id: string, tenantId: string) {
  const [record] = await db.select().from(clmLeaseCostAllocations).where(and(eq(clmLeaseCostAllocations.id, id), eq(clmLeaseCostAllocations.tenantId, tenantId), isNull(clmLeaseCostAllocations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Lessor Statement Reconciliation
// ==========================================
export async function listLessorReconciliations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(clmLessorReconciliations.tenantId, tenantId), isNull(clmLessorReconciliations.deletedAt)];
  if (search) conditions.push(or(ilike(clmLessorReconciliations.reconciliationRef, `%${search}%`), ilike(clmLessorReconciliations.lessorName, `%${search}%`))!);
  if (status) conditions.push(eq(clmLessorReconciliations.status, status));
  if (cursor) conditions.push(gt(clmLessorReconciliations.createdAt, new Date(cursor)));
  const results = await db.select().from(clmLessorReconciliations).where(and(...conditions)).orderBy(desc(clmLessorReconciliations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getLessorReconciliation(id: string, tenantId: string) {
  const [record] = await db.select().from(clmLessorReconciliations).where(and(eq(clmLessorReconciliations.id, id), eq(clmLessorReconciliations.tenantId, tenantId), isNull(clmLessorReconciliations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Container Return & Redelivery Management
// ==========================================
export async function listContainerRedeliveries({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(clmContainerRedeliveries.tenantId, tenantId), isNull(clmContainerRedeliveries.deletedAt)];
  if (search) conditions.push(or(ilike(clmContainerRedeliveries.redeliveryRef, `%${search}%`), ilike(clmContainerRedeliveries.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(clmContainerRedeliveries.status, status));
  if (cursor) conditions.push(gt(clmContainerRedeliveries.createdAt, new Date(cursor)));
  const results = await db.select().from(clmContainerRedeliveries).where(and(...conditions)).orderBy(desc(clmContainerRedeliveries.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getContainerRedelivery(id: string, tenantId: string) {
  const [record] = await db.select().from(clmContainerRedeliveries).where(and(eq(clmContainerRedeliveries.id, id), eq(clmContainerRedeliveries.tenantId, tenantId), isNull(clmContainerRedeliveries.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Lease vs Buy Financial Analysis
// ==========================================
export async function listLeaseVsBuyAnalyses({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(clmLeaseVsBuyAnalyses.tenantId, tenantId), isNull(clmLeaseVsBuyAnalyses.deletedAt)];
  if (search) conditions.push(or(ilike(clmLeaseVsBuyAnalyses.analysisRef, `%${search}%`), ilike(clmLeaseVsBuyAnalyses.containerType, `%${search}%`))!);
  if (status) conditions.push(eq(clmLeaseVsBuyAnalyses.status, status));
  if (cursor) conditions.push(gt(clmLeaseVsBuyAnalyses.createdAt, new Date(cursor)));
  const results = await db.select().from(clmLeaseVsBuyAnalyses).where(and(...conditions)).orderBy(desc(clmLeaseVsBuyAnalyses.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getLeaseVsBuyAnalysis(id: string, tenantId: string) {
  const [record] = await db.select().from(clmLeaseVsBuyAnalyses).where(and(eq(clmLeaseVsBuyAnalyses.id, id), eq(clmLeaseVsBuyAnalyses.tenantId, tenantId), isNull(clmLeaseVsBuyAnalyses.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// AI Fleet Composition Optimizer
// ==========================================
export async function listFleetOptimizers({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(clmFleetOptimizers.tenantId, tenantId), isNull(clmFleetOptimizers.deletedAt)];
  if (search) conditions.push(or(ilike(clmFleetOptimizers.optimizerRef, `%${search}%`), ilike(clmFleetOptimizers.modelVersion, `%${search}%`))!);
  if (status) conditions.push(eq(clmFleetOptimizers.status, status));
  if (cursor) conditions.push(gt(clmFleetOptimizers.createdAt, new Date(cursor)));
  const results = await db.select().from(clmFleetOptimizers).where(and(...conditions)).orderBy(desc(clmFleetOptimizers.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getFleetOptimizer(id: string, tenantId: string) {
  const [record] = await db.select().from(clmFleetOptimizers).where(and(eq(clmFleetOptimizers.id, id), eq(clmFleetOptimizers.tenantId, tenantId), isNull(clmFleetOptimizers.deletedAt))).limit(1);
  return record ?? null;
}
