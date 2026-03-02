import { and, eq, ilike, isNull, gt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  pamPortCallPlans,
  pamHusbandryServices,
  pamPreArrivalChecklists,
  pamPortAuthorityCommunications,
  pamCrewChangeCoordinations,
  pamCashToMasters,
  pamVesselClearances,
  pamDisbursementAccounts,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Port Call Plans
// ==========================================
export async function listPortCallPlans({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pamPortCallPlans.tenantId, tenantId), isNull(pamPortCallPlans.deletedAt)];
  if (search) conditions.push(or(ilike(pamPortCallPlans.planRef, `%${search}%`), ilike(pamPortCallPlans.vesselName, `%${search}%`), ilike(pamPortCallPlans.portName, `%${search}%`))!);
  if (status) conditions.push(eq(pamPortCallPlans.status, status));
  if (cursor) conditions.push(gt(pamPortCallPlans.createdAt, new Date(cursor)));
  const results = await db.select().from(pamPortCallPlans).where(and(...conditions)).orderBy(desc(pamPortCallPlans.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPortCallPlan(id: string, tenantId: string) {
  const [record] = await db.select().from(pamPortCallPlans).where(and(eq(pamPortCallPlans.id, id), eq(pamPortCallPlans.tenantId, tenantId), isNull(pamPortCallPlans.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Husbandry Services
// ==========================================
export async function listHusbandryServices({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pamHusbandryServices.tenantId, tenantId), isNull(pamHusbandryServices.deletedAt)];
  if (search) conditions.push(or(ilike(pamHusbandryServices.serviceRef, `%${search}%`), ilike(pamHusbandryServices.vesselName, `%${search}%`), ilike(pamHusbandryServices.supplierName, `%${search}%`))!);
  if (status) conditions.push(eq(pamHusbandryServices.status, status));
  if (cursor) conditions.push(gt(pamHusbandryServices.createdAt, new Date(cursor)));
  const results = await db.select().from(pamHusbandryServices).where(and(...conditions)).orderBy(desc(pamHusbandryServices.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getHusbandryService(id: string, tenantId: string) {
  const [record] = await db.select().from(pamHusbandryServices).where(and(eq(pamHusbandryServices.id, id), eq(pamHusbandryServices.tenantId, tenantId), isNull(pamHusbandryServices.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Pre-Arrival Checklists
// ==========================================
export async function listPreArrivalChecklists({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pamPreArrivalChecklists.tenantId, tenantId), isNull(pamPreArrivalChecklists.deletedAt)];
  if (search) conditions.push(or(ilike(pamPreArrivalChecklists.checklistRef, `%${search}%`), ilike(pamPreArrivalChecklists.vesselName, `%${search}%`), ilike(pamPreArrivalChecklists.portName, `%${search}%`))!);
  if (status) conditions.push(eq(pamPreArrivalChecklists.status, status));
  if (cursor) conditions.push(gt(pamPreArrivalChecklists.createdAt, new Date(cursor)));
  const results = await db.select().from(pamPreArrivalChecklists).where(and(...conditions)).orderBy(desc(pamPreArrivalChecklists.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPreArrivalChecklist(id: string, tenantId: string) {
  const [record] = await db.select().from(pamPreArrivalChecklists).where(and(eq(pamPreArrivalChecklists.id, id), eq(pamPreArrivalChecklists.tenantId, tenantId), isNull(pamPreArrivalChecklists.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Port Authority Communications
// ==========================================
export async function listPortAuthorityCommunications({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pamPortAuthorityCommunications.tenantId, tenantId), isNull(pamPortAuthorityCommunications.deletedAt)];
  if (search) conditions.push(or(ilike(pamPortAuthorityCommunications.commRef, `%${search}%`), ilike(pamPortAuthorityCommunications.authorityName, `%${search}%`), ilike(pamPortAuthorityCommunications.subject, `%${search}%`))!);
  if (status) conditions.push(eq(pamPortAuthorityCommunications.status, status));
  if (cursor) conditions.push(gt(pamPortAuthorityCommunications.createdAt, new Date(cursor)));
  const results = await db.select().from(pamPortAuthorityCommunications).where(and(...conditions)).orderBy(desc(pamPortAuthorityCommunications.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPortAuthorityCommunication(id: string, tenantId: string) {
  const [record] = await db.select().from(pamPortAuthorityCommunications).where(and(eq(pamPortAuthorityCommunications.id, id), eq(pamPortAuthorityCommunications.tenantId, tenantId), isNull(pamPortAuthorityCommunications.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Crew Change Coordinations
// ==========================================
export async function listCrewChangeCoordinations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pamCrewChangeCoordinations.tenantId, tenantId), isNull(pamCrewChangeCoordinations.deletedAt)];
  if (search) conditions.push(or(ilike(pamCrewChangeCoordinations.coordinationRef, `%${search}%`), ilike(pamCrewChangeCoordinations.vesselName, `%${search}%`), ilike(pamCrewChangeCoordinations.crewMemberName, `%${search}%`))!);
  if (status) conditions.push(eq(pamCrewChangeCoordinations.status, status));
  if (cursor) conditions.push(gt(pamCrewChangeCoordinations.createdAt, new Date(cursor)));
  const results = await db.select().from(pamCrewChangeCoordinations).where(and(...conditions)).orderBy(desc(pamCrewChangeCoordinations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCrewChangeCoordination(id: string, tenantId: string) {
  const [record] = await db.select().from(pamCrewChangeCoordinations).where(and(eq(pamCrewChangeCoordinations.id, id), eq(pamCrewChangeCoordinations.tenantId, tenantId), isNull(pamCrewChangeCoordinations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Cash to Master
// ==========================================
export async function listCashToMasters({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pamCashToMasters.tenantId, tenantId), isNull(pamCashToMasters.deletedAt)];
  if (search) conditions.push(or(ilike(pamCashToMasters.transactionRef, `%${search}%`), ilike(pamCashToMasters.vesselName, `%${search}%`), ilike(pamCashToMasters.masterName, `%${search}%`))!);
  if (status) conditions.push(eq(pamCashToMasters.status, status));
  if (cursor) conditions.push(gt(pamCashToMasters.createdAt, new Date(cursor)));
  const results = await db.select().from(pamCashToMasters).where(and(...conditions)).orderBy(desc(pamCashToMasters.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCashToMaster(id: string, tenantId: string) {
  const [record] = await db.select().from(pamCashToMasters).where(and(eq(pamCashToMasters.id, id), eq(pamCashToMasters.tenantId, tenantId), isNull(pamCashToMasters.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Vessel Clearances
// ==========================================
export async function listVesselClearances({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pamVesselClearances.tenantId, tenantId), isNull(pamVesselClearances.deletedAt)];
  if (search) conditions.push(or(ilike(pamVesselClearances.clearanceRef, `%${search}%`), ilike(pamVesselClearances.vesselName, `%${search}%`), ilike(pamVesselClearances.portName, `%${search}%`))!);
  if (status) conditions.push(eq(pamVesselClearances.status, status));
  if (cursor) conditions.push(gt(pamVesselClearances.createdAt, new Date(cursor)));
  const results = await db.select().from(pamVesselClearances).where(and(...conditions)).orderBy(desc(pamVesselClearances.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getVesselClearance(id: string, tenantId: string) {
  const [record] = await db.select().from(pamVesselClearances).where(and(eq(pamVesselClearances.id, id), eq(pamVesselClearances.tenantId, tenantId), isNull(pamVesselClearances.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Disbursement Accounts
// ==========================================
export async function listDisbursementAccounts({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pamDisbursementAccounts.tenantId, tenantId), isNull(pamDisbursementAccounts.deletedAt)];
  if (search) conditions.push(or(ilike(pamDisbursementAccounts.accountRef, `%${search}%`), ilike(pamDisbursementAccounts.vesselName, `%${search}%`), ilike(pamDisbursementAccounts.principalName, `%${search}%`))!);
  if (status) conditions.push(eq(pamDisbursementAccounts.status, status));
  if (cursor) conditions.push(gt(pamDisbursementAccounts.createdAt, new Date(cursor)));
  const results = await db.select().from(pamDisbursementAccounts).where(and(...conditions)).orderBy(desc(pamDisbursementAccounts.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getDisbursementAccount(id: string, tenantId: string) {
  const [record] = await db.select().from(pamDisbursementAccounts).where(and(eq(pamDisbursementAccounts.id, id), eq(pamDisbursementAccounts.tenantId, tenantId), isNull(pamDisbursementAccounts.deletedAt))).limit(1);
  return record ?? null;
}
