import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  anmGaAgreements,
  anmSubAgentConfigs,
  anmAgentCommissions,
  anmAgencyDocuments,
  anmPerformanceKpis,
  anmPortalConfigs,
  anmBookingAuthorities,
  anmAgentIncentives,
} from "@/db/schema";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// General Agent GA Agreement Management
// ==========================================
export async function listGaAgreements({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(anmGaAgreements.tenantId, tenantId), isNull(anmGaAgreements.deletedAt)];
  if (search) conditions.push(or(ilike(anmGaAgreements.agreementRef, `%${search}%`), ilike(anmGaAgreements.agentName, `%${search}%`))!);
  if (status) conditions.push(eq(anmGaAgreements.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(anmGaAgreements.createdAt, anmGaAgreements.id, cc)); }
  const results = await db.select().from(anmGaAgreements).where(and(...conditions)).orderBy(desc(anmGaAgreements.createdAt), desc(anmGaAgreements.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getGaAgreement(id: string, tenantId: string) {
  const [record] = await db.select().from(anmGaAgreements).where(and(eq(anmGaAgreements.id, id), eq(anmGaAgreements.tenantId, tenantId), isNull(anmGaAgreements.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Sub-Agent Configuration & Access
// ==========================================
export async function listSubAgentConfigs({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(anmSubAgentConfigs.tenantId, tenantId), isNull(anmSubAgentConfigs.deletedAt)];
  if (search) conditions.push(or(ilike(anmSubAgentConfigs.configRef, `%${search}%`), ilike(anmSubAgentConfigs.subAgentName, `%${search}%`))!);
  if (status) conditions.push(eq(anmSubAgentConfigs.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(anmSubAgentConfigs.createdAt, anmSubAgentConfigs.id, cc)); }
  const results = await db.select().from(anmSubAgentConfigs).where(and(...conditions)).orderBy(desc(anmSubAgentConfigs.createdAt), desc(anmSubAgentConfigs.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getSubAgentConfig(id: string, tenantId: string) {
  const [record] = await db.select().from(anmSubAgentConfigs).where(and(eq(anmSubAgentConfigs.id, id), eq(anmSubAgentConfigs.tenantId, tenantId), isNull(anmSubAgentConfigs.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Agent Commission Calculation & Payment
// ==========================================
export async function listAgentCommissions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(anmAgentCommissions.tenantId, tenantId), isNull(anmAgentCommissions.deletedAt)];
  if (search) conditions.push(or(ilike(anmAgentCommissions.commissionRef, `%${search}%`), ilike(anmAgentCommissions.agentName, `%${search}%`))!);
  if (status) conditions.push(eq(anmAgentCommissions.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(anmAgentCommissions.createdAt, anmAgentCommissions.id, cc)); }
  const results = await db.select().from(anmAgentCommissions).where(and(...conditions)).orderBy(desc(anmAgentCommissions.createdAt), desc(anmAgentCommissions.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getAgentCommission(id: string, tenantId: string) {
  const [record] = await db.select().from(anmAgentCommissions).where(and(eq(anmAgentCommissions.id, id), eq(anmAgentCommissions.tenantId, tenantId), isNull(anmAgentCommissions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Agency Agreement Document Management
// ==========================================
export async function listAgencyDocuments({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(anmAgencyDocuments.tenantId, tenantId), isNull(anmAgencyDocuments.deletedAt)];
  if (search) conditions.push(or(ilike(anmAgencyDocuments.documentRef, `%${search}%`), ilike(anmAgencyDocuments.agentName, `%${search}%`))!);
  if (status) conditions.push(eq(anmAgencyDocuments.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(anmAgencyDocuments.createdAt, anmAgencyDocuments.id, cc)); }
  const results = await db.select().from(anmAgencyDocuments).where(and(...conditions)).orderBy(desc(anmAgencyDocuments.createdAt), desc(anmAgencyDocuments.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getAgencyDocument(id: string, tenantId: string) {
  const [record] = await db.select().from(anmAgencyDocuments).where(and(eq(anmAgencyDocuments.id, id), eq(anmAgencyDocuments.tenantId, tenantId), isNull(anmAgencyDocuments.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Agent Performance KPI Dashboard
// ==========================================
export async function listPerformanceKpis({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(anmPerformanceKpis.tenantId, tenantId), isNull(anmPerformanceKpis.deletedAt)];
  if (search) conditions.push(or(ilike(anmPerformanceKpis.kpiRef, `%${search}%`), ilike(anmPerformanceKpis.agentName, `%${search}%`))!);
  if (status) conditions.push(eq(anmPerformanceKpis.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(anmPerformanceKpis.createdAt, anmPerformanceKpis.id, cc)); }
  const results = await db.select().from(anmPerformanceKpis).where(and(...conditions)).orderBy(desc(anmPerformanceKpis.createdAt), desc(anmPerformanceKpis.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getPerformanceKpi(id: string, tenantId: string) {
  const [record] = await db.select().from(anmPerformanceKpis).where(and(eq(anmPerformanceKpis.id, id), eq(anmPerformanceKpis.tenantId, tenantId), isNull(anmPerformanceKpis.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Agent Portal Access & Configuration
// ==========================================
export async function listPortalConfigs({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(anmPortalConfigs.tenantId, tenantId), isNull(anmPortalConfigs.deletedAt)];
  if (search) conditions.push(or(ilike(anmPortalConfigs.configRef, `%${search}%`), ilike(anmPortalConfigs.agentName, `%${search}%`))!);
  if (status) conditions.push(eq(anmPortalConfigs.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(anmPortalConfigs.createdAt, anmPortalConfigs.id, cc)); }
  const results = await db.select().from(anmPortalConfigs).where(and(...conditions)).orderBy(desc(anmPortalConfigs.createdAt), desc(anmPortalConfigs.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getPortalConfig(id: string, tenantId: string) {
  const [record] = await db.select().from(anmPortalConfigs).where(and(eq(anmPortalConfigs.id, id), eq(anmPortalConfigs.tenantId, tenantId), isNull(anmPortalConfigs.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Booking Authority Matrix Management
// ==========================================
export async function listBookingAuthorities({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(anmBookingAuthorities.tenantId, tenantId), isNull(anmBookingAuthorities.deletedAt)];
  if (search) conditions.push(or(ilike(anmBookingAuthorities.authorityRef, `%${search}%`), ilike(anmBookingAuthorities.agentName, `%${search}%`))!);
  if (status) conditions.push(eq(anmBookingAuthorities.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(anmBookingAuthorities.createdAt, anmBookingAuthorities.id, cc)); }
  const results = await db.select().from(anmBookingAuthorities).where(and(...conditions)).orderBy(desc(anmBookingAuthorities.createdAt), desc(anmBookingAuthorities.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getBookingAuthority(id: string, tenantId: string) {
  const [record] = await db.select().from(anmBookingAuthorities).where(and(eq(anmBookingAuthorities.id, id), eq(anmBookingAuthorities.tenantId, tenantId), isNull(anmBookingAuthorities.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Agent Incentive & Bonus Management
// ==========================================
export async function listAgentIncentives({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(anmAgentIncentives.tenantId, tenantId), isNull(anmAgentIncentives.deletedAt)];
  if (search) conditions.push(or(ilike(anmAgentIncentives.incentiveRef, `%${search}%`), ilike(anmAgentIncentives.agentName, `%${search}%`))!);
  if (status) conditions.push(eq(anmAgentIncentives.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(anmAgentIncentives.createdAt, anmAgentIncentives.id, cc)); }
  const results = await db.select().from(anmAgentIncentives).where(and(...conditions)).orderBy(desc(anmAgentIncentives.createdAt), desc(anmAgentIncentives.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getAgentIncentive(id: string, tenantId: string) {
  const [record] = await db.select().from(anmAgentIncentives).where(and(eq(anmAgentIncentives.id, id), eq(anmAgentIncentives.tenantId, tenantId), isNull(anmAgentIncentives.deletedAt))).limit(1);
  return record ?? null;
}
