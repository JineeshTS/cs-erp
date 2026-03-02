import { and, eq, ilike, isNull, gt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  oogCargoAcceptances,
  oogStowagePlans,
  oogSpecialEquipment,
  oogSecuringPlans,
  oogHeavyLifts,
  oogMultiModalLogistics,
  oogDocPermits,
  oogPortApprovals,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Cargo Acceptances
// ==========================================

export async function listCargoAcceptances({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(oogCargoAcceptances.tenantId, tenantId), isNull(oogCargoAcceptances.deletedAt)];
  if (search) conditions.push(or(ilike(oogCargoAcceptances.acceptanceRef, `%${search}%`), ilike(oogCargoAcceptances.customerName, `%${search}%`), ilike(oogCargoAcceptances.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(oogCargoAcceptances.status, status));
  if (cursor) conditions.push(gt(oogCargoAcceptances.createdAt, new Date(cursor)));
  const results = await db.select().from(oogCargoAcceptances).where(and(...conditions)).orderBy(desc(oogCargoAcceptances.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCargoAcceptance(id: string, tenantId: string) {
  const [record] = await db.select().from(oogCargoAcceptances).where(and(eq(oogCargoAcceptances.id, id), eq(oogCargoAcceptances.tenantId, tenantId), isNull(oogCargoAcceptances.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Stowage Plans
// ==========================================

export async function listStowagePlans({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(oogStowagePlans.tenantId, tenantId), isNull(oogStowagePlans.deletedAt)];
  if (search) conditions.push(or(ilike(oogStowagePlans.stowageRef, `%${search}%`), ilike(oogStowagePlans.vesselName, `%${search}%`), ilike(oogStowagePlans.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(oogStowagePlans.status, status));
  if (cursor) conditions.push(gt(oogStowagePlans.createdAt, new Date(cursor)));
  const results = await db.select().from(oogStowagePlans).where(and(...conditions)).orderBy(desc(oogStowagePlans.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getStowagePlan(id: string, tenantId: string) {
  const [record] = await db.select().from(oogStowagePlans).where(and(eq(oogStowagePlans.id, id), eq(oogStowagePlans.tenantId, tenantId), isNull(oogStowagePlans.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Special Equipment
// ==========================================

export async function listSpecialEquipment({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(oogSpecialEquipment.tenantId, tenantId), isNull(oogSpecialEquipment.deletedAt)];
  if (search) conditions.push(or(ilike(oogSpecialEquipment.equipmentRef, `%${search}%`), ilike(oogSpecialEquipment.equipmentName, `%${search}%`), ilike(oogSpecialEquipment.equipmentNumber, `%${search}%`))!);
  if (status) conditions.push(eq(oogSpecialEquipment.status, status));
  if (cursor) conditions.push(gt(oogSpecialEquipment.createdAt, new Date(cursor)));
  const results = await db.select().from(oogSpecialEquipment).where(and(...conditions)).orderBy(desc(oogSpecialEquipment.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getSpecialEquipmentRecord(id: string, tenantId: string) {
  const [record] = await db.select().from(oogSpecialEquipment).where(and(eq(oogSpecialEquipment.id, id), eq(oogSpecialEquipment.tenantId, tenantId), isNull(oogSpecialEquipment.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Securing Plans
// ==========================================

export async function listSecuringPlans({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(oogSecuringPlans.tenantId, tenantId), isNull(oogSecuringPlans.deletedAt)];
  if (search) conditions.push(or(ilike(oogSecuringPlans.securingRef, `%${search}%`), ilike(oogSecuringPlans.cargoDescription, `%${search}%`))!);
  if (status) conditions.push(eq(oogSecuringPlans.status, status));
  if (cursor) conditions.push(gt(oogSecuringPlans.createdAt, new Date(cursor)));
  const results = await db.select().from(oogSecuringPlans).where(and(...conditions)).orderBy(desc(oogSecuringPlans.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getSecuringPlan(id: string, tenantId: string) {
  const [record] = await db.select().from(oogSecuringPlans).where(and(eq(oogSecuringPlans.id, id), eq(oogSecuringPlans.tenantId, tenantId), isNull(oogSecuringPlans.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Heavy Lifts
// ==========================================

export async function listHeavyLifts({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(oogHeavyLifts.tenantId, tenantId), isNull(oogHeavyLifts.deletedAt)];
  if (search) conditions.push(or(ilike(oogHeavyLifts.heavyLiftRef, `%${search}%`), ilike(oogHeavyLifts.projectName, `%${search}%`), ilike(oogHeavyLifts.customerName, `%${search}%`))!);
  if (status) conditions.push(eq(oogHeavyLifts.status, status));
  if (cursor) conditions.push(gt(oogHeavyLifts.createdAt, new Date(cursor)));
  const results = await db.select().from(oogHeavyLifts).where(and(...conditions)).orderBy(desc(oogHeavyLifts.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getHeavyLift(id: string, tenantId: string) {
  const [record] = await db.select().from(oogHeavyLifts).where(and(eq(oogHeavyLifts.id, id), eq(oogHeavyLifts.tenantId, tenantId), isNull(oogHeavyLifts.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Multi-Modal Logistics
// ==========================================

export async function listMultiModalLogistics({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(oogMultiModalLogistics.tenantId, tenantId), isNull(oogMultiModalLogistics.deletedAt)];
  if (search) conditions.push(or(ilike(oogMultiModalLogistics.logisticsRef, `%${search}%`), ilike(oogMultiModalLogistics.carrierName, `%${search}%`), ilike(oogMultiModalLogistics.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(oogMultiModalLogistics.status, status));
  if (cursor) conditions.push(gt(oogMultiModalLogistics.createdAt, new Date(cursor)));
  const results = await db.select().from(oogMultiModalLogistics).where(and(...conditions)).orderBy(desc(oogMultiModalLogistics.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getMultiModalLogistic(id: string, tenantId: string) {
  const [record] = await db.select().from(oogMultiModalLogistics).where(and(eq(oogMultiModalLogistics.id, id), eq(oogMultiModalLogistics.tenantId, tenantId), isNull(oogMultiModalLogistics.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Documentation & Permits
// ==========================================

export async function listDocPermits({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(oogDocPermits.tenantId, tenantId), isNull(oogDocPermits.deletedAt)];
  if (search) conditions.push(or(ilike(oogDocPermits.documentRef, `%${search}%`), ilike(oogDocPermits.documentTitle, `%${search}%`), ilike(oogDocPermits.permitNumber, `%${search}%`))!);
  if (status) conditions.push(eq(oogDocPermits.status, status));
  if (cursor) conditions.push(gt(oogDocPermits.createdAt, new Date(cursor)));
  const results = await db.select().from(oogDocPermits).where(and(...conditions)).orderBy(desc(oogDocPermits.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getDocPermit(id: string, tenantId: string) {
  const [record] = await db.select().from(oogDocPermits).where(and(eq(oogDocPermits.id, id), eq(oogDocPermits.tenantId, tenantId), isNull(oogDocPermits.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Port Authority Approvals
// ==========================================

export async function listPortApprovals({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(oogPortApprovals.tenantId, tenantId), isNull(oogPortApprovals.deletedAt)];
  if (search) conditions.push(or(ilike(oogPortApprovals.approvalRef, `%${search}%`), ilike(oogPortApprovals.portName, `%${search}%`), ilike(oogPortApprovals.portAuthority, `%${search}%`))!);
  if (status) conditions.push(eq(oogPortApprovals.status, status));
  if (cursor) conditions.push(gt(oogPortApprovals.createdAt, new Date(cursor)));
  const results = await db.select().from(oogPortApprovals).where(and(...conditions)).orderBy(desc(oogPortApprovals.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPortApproval(id: string, tenantId: string) {
  const [record] = await db.select().from(oogPortApprovals).where(and(eq(oogPortApprovals.id, id), eq(oogPortApprovals.tenantId, tenantId), isNull(oogPortApprovals.deletedAt))).limit(1);
  return record ?? null;
}
