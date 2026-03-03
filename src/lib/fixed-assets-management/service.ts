import { and, eq, ilike, isNull, gt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  famAssetRegistries,
  famDepreciationSchedules,
  famAssetDisposals,
  famInsuranceValuations,
  famMaintenanceSchedules,
  famCapexOpexClassifications,
  famImpairmentTests,
  famLeaseAccounting,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Asset Registries
// ==========================================
export async function listAssetRegistries({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(famAssetRegistries.tenantId, tenantId), isNull(famAssetRegistries.deletedAt)];
  if (search) conditions.push(or(ilike(famAssetRegistries.assetRef, `%${search}%`), ilike(famAssetRegistries.assetName, `%${search}%`))!);
  if (status) conditions.push(eq(famAssetRegistries.status, status));
  if (cursor) conditions.push(gt(famAssetRegistries.createdAt, new Date(cursor)));
  const results = await db.select().from(famAssetRegistries).where(and(...conditions)).orderBy(desc(famAssetRegistries.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getAssetRegistry(id: string, tenantId: string) {
  const [record] = await db.select().from(famAssetRegistries).where(and(eq(famAssetRegistries.id, id), eq(famAssetRegistries.tenantId, tenantId), isNull(famAssetRegistries.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Depreciation Schedules
// ==========================================
export async function listDepreciationSchedules({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(famDepreciationSchedules.tenantId, tenantId), isNull(famDepreciationSchedules.deletedAt)];
  if (search) conditions.push(or(ilike(famDepreciationSchedules.scheduleRef, `%${search}%`), ilike(famDepreciationSchedules.assetName, `%${search}%`))!);
  if (status) conditions.push(eq(famDepreciationSchedules.status, status));
  if (cursor) conditions.push(gt(famDepreciationSchedules.createdAt, new Date(cursor)));
  const results = await db.select().from(famDepreciationSchedules).where(and(...conditions)).orderBy(desc(famDepreciationSchedules.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getDepreciationSchedule(id: string, tenantId: string) {
  const [record] = await db.select().from(famDepreciationSchedules).where(and(eq(famDepreciationSchedules.id, id), eq(famDepreciationSchedules.tenantId, tenantId), isNull(famDepreciationSchedules.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Asset Disposals
// ==========================================
export async function listAssetDisposals({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(famAssetDisposals.tenantId, tenantId), isNull(famAssetDisposals.deletedAt)];
  if (search) conditions.push(or(ilike(famAssetDisposals.disposalRef, `%${search}%`), ilike(famAssetDisposals.assetName, `%${search}%`))!);
  if (status) conditions.push(eq(famAssetDisposals.status, status));
  if (cursor) conditions.push(gt(famAssetDisposals.createdAt, new Date(cursor)));
  const results = await db.select().from(famAssetDisposals).where(and(...conditions)).orderBy(desc(famAssetDisposals.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getAssetDisposal(id: string, tenantId: string) {
  const [record] = await db.select().from(famAssetDisposals).where(and(eq(famAssetDisposals.id, id), eq(famAssetDisposals.tenantId, tenantId), isNull(famAssetDisposals.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Insurance & Valuations
// ==========================================
export async function listInsuranceValuations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(famInsuranceValuations.tenantId, tenantId), isNull(famInsuranceValuations.deletedAt)];
  if (search) conditions.push(or(ilike(famInsuranceValuations.recordRef, `%${search}%`), ilike(famInsuranceValuations.assetName, `%${search}%`))!);
  if (status) conditions.push(eq(famInsuranceValuations.status, status));
  if (cursor) conditions.push(gt(famInsuranceValuations.createdAt, new Date(cursor)));
  const results = await db.select().from(famInsuranceValuations).where(and(...conditions)).orderBy(desc(famInsuranceValuations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getInsuranceValuation(id: string, tenantId: string) {
  const [record] = await db.select().from(famInsuranceValuations).where(and(eq(famInsuranceValuations.id, id), eq(famInsuranceValuations.tenantId, tenantId), isNull(famInsuranceValuations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Maintenance Schedules
// ==========================================
export async function listMaintenanceSchedules({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(famMaintenanceSchedules.tenantId, tenantId), isNull(famMaintenanceSchedules.deletedAt)];
  if (search) conditions.push(or(ilike(famMaintenanceSchedules.maintenanceRef, `%${search}%`), ilike(famMaintenanceSchedules.assetName, `%${search}%`))!);
  if (status) conditions.push(eq(famMaintenanceSchedules.status, status));
  if (cursor) conditions.push(gt(famMaintenanceSchedules.createdAt, new Date(cursor)));
  const results = await db.select().from(famMaintenanceSchedules).where(and(...conditions)).orderBy(desc(famMaintenanceSchedules.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getMaintenanceSchedule(id: string, tenantId: string) {
  const [record] = await db.select().from(famMaintenanceSchedules).where(and(eq(famMaintenanceSchedules.id, id), eq(famMaintenanceSchedules.tenantId, tenantId), isNull(famMaintenanceSchedules.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// CAPEX/OPEX Classifications
// ==========================================
export async function listCapexOpexClassifications({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(famCapexOpexClassifications.tenantId, tenantId), isNull(famCapexOpexClassifications.deletedAt)];
  if (search) conditions.push(or(ilike(famCapexOpexClassifications.classificationRef, `%${search}%`), ilike(famCapexOpexClassifications.title, `%${search}%`))!);
  if (status) conditions.push(eq(famCapexOpexClassifications.status, status));
  if (cursor) conditions.push(gt(famCapexOpexClassifications.createdAt, new Date(cursor)));
  const results = await db.select().from(famCapexOpexClassifications).where(and(...conditions)).orderBy(desc(famCapexOpexClassifications.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCapexOpexClassification(id: string, tenantId: string) {
  const [record] = await db.select().from(famCapexOpexClassifications).where(and(eq(famCapexOpexClassifications.id, id), eq(famCapexOpexClassifications.tenantId, tenantId), isNull(famCapexOpexClassifications.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Impairment Tests
// ==========================================
export async function listImpairmentTests({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(famImpairmentTests.tenantId, tenantId), isNull(famImpairmentTests.deletedAt)];
  if (search) conditions.push(or(ilike(famImpairmentTests.testRef, `%${search}%`), ilike(famImpairmentTests.assetName, `%${search}%`))!);
  if (status) conditions.push(eq(famImpairmentTests.status, status));
  if (cursor) conditions.push(gt(famImpairmentTests.createdAt, new Date(cursor)));
  const results = await db.select().from(famImpairmentTests).where(and(...conditions)).orderBy(desc(famImpairmentTests.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getImpairmentTest(id: string, tenantId: string) {
  const [record] = await db.select().from(famImpairmentTests).where(and(eq(famImpairmentTests.id, id), eq(famImpairmentTests.tenantId, tenantId), isNull(famImpairmentTests.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Lease Accounting
// ==========================================
export async function listLeaseAccounting({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(famLeaseAccounting.tenantId, tenantId), isNull(famLeaseAccounting.deletedAt)];
  if (search) conditions.push(or(ilike(famLeaseAccounting.leaseRef, `%${search}%`), ilike(famLeaseAccounting.assetName, `%${search}%`))!);
  if (status) conditions.push(eq(famLeaseAccounting.status, status));
  if (cursor) conditions.push(gt(famLeaseAccounting.createdAt, new Date(cursor)));
  const results = await db.select().from(famLeaseAccounting).where(and(...conditions)).orderBy(desc(famLeaseAccounting.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getLeaseAccount(id: string, tenantId: string) {
  const [record] = await db.select().from(famLeaseAccounting).where(and(eq(famLeaseAccounting.id, id), eq(famLeaseAccounting.tenantId, tenantId), isNull(famLeaseAccounting.deletedAt))).limit(1);
  return record ?? null;
}
