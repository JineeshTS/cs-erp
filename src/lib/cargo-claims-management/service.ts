import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  ccmClaimRegistrations,
  ccmLiabilityAssessments,
  ccmDamageSurveys,
  ccmTimeBarTrackings,
  ccmClaimSettlements,
  ccmSubrogationRecoveries,
  ccmClaimPredictions,
  ccmPortfolioAnalytics,
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
// Cargo Claim Registration & Triage
// ==========================================
export async function listClaimRegistrations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ccmClaimRegistrations.tenantId, tenantId), isNull(ccmClaimRegistrations.deletedAt)];
  if (search) conditions.push(or(ilike(ccmClaimRegistrations.claimRef, `%${search}%`), ilike(ccmClaimRegistrations.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(ccmClaimRegistrations.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(ccmClaimRegistrations.createdAt, ccmClaimRegistrations.id, cc)); }
  const results = await db.select().from(ccmClaimRegistrations).where(and(...conditions)).orderBy(desc(ccmClaimRegistrations.createdAt), desc(ccmClaimRegistrations.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getClaimRegistration(id: string, tenantId: string) {
  const [record] = await db.select().from(ccmClaimRegistrations).where(and(eq(ccmClaimRegistrations.id, id), eq(ccmClaimRegistrations.tenantId, tenantId), isNull(ccmClaimRegistrations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Liability Assessment Hague-Visby Rules
// ==========================================
export async function listLiabilityAssessments({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ccmLiabilityAssessments.tenantId, tenantId), isNull(ccmLiabilityAssessments.deletedAt)];
  if (search) conditions.push(or(ilike(ccmLiabilityAssessments.assessmentRef, `%${search}%`), ilike(ccmLiabilityAssessments.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(ccmLiabilityAssessments.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(ccmLiabilityAssessments.createdAt, ccmLiabilityAssessments.id, cc)); }
  const results = await db.select().from(ccmLiabilityAssessments).where(and(...conditions)).orderBy(desc(ccmLiabilityAssessments.createdAt), desc(ccmLiabilityAssessments.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getLiabilityAssessment(id: string, tenantId: string) {
  const [record] = await db.select().from(ccmLiabilityAssessments).where(and(eq(ccmLiabilityAssessments.id, id), eq(ccmLiabilityAssessments.tenantId, tenantId), isNull(ccmLiabilityAssessments.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Cargo Damage Survey & Documentation
// ==========================================
export async function listDamageSurveys({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ccmDamageSurveys.tenantId, tenantId), isNull(ccmDamageSurveys.deletedAt)];
  if (search) conditions.push(or(ilike(ccmDamageSurveys.surveyRef, `%${search}%`), ilike(ccmDamageSurveys.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(ccmDamageSurveys.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(ccmDamageSurveys.createdAt, ccmDamageSurveys.id, cc)); }
  const results = await db.select().from(ccmDamageSurveys).where(and(...conditions)).orderBy(desc(ccmDamageSurveys.createdAt), desc(ccmDamageSurveys.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getDamageSurvey(id: string, tenantId: string) {
  const [record] = await db.select().from(ccmDamageSurveys).where(and(eq(ccmDamageSurveys.id, id), eq(ccmDamageSurveys.tenantId, tenantId), isNull(ccmDamageSurveys.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Time Bar Tracking & Alerts
// ==========================================
export async function listTimeBarTrackings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ccmTimeBarTrackings.tenantId, tenantId), isNull(ccmTimeBarTrackings.deletedAt)];
  if (search) conditions.push(or(ilike(ccmTimeBarTrackings.trackingRef, `%${search}%`), ilike(ccmTimeBarTrackings.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(ccmTimeBarTrackings.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(ccmTimeBarTrackings.createdAt, ccmTimeBarTrackings.id, cc)); }
  const results = await db.select().from(ccmTimeBarTrackings).where(and(...conditions)).orderBy(desc(ccmTimeBarTrackings.createdAt), desc(ccmTimeBarTrackings.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getTimeBarTracking(id: string, tenantId: string) {
  const [record] = await db.select().from(ccmTimeBarTrackings).where(and(eq(ccmTimeBarTrackings.id, id), eq(ccmTimeBarTrackings.tenantId, tenantId), isNull(ccmTimeBarTrackings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Claim Settlement & Payment Processing
// ==========================================
export async function listClaimSettlements({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ccmClaimSettlements.tenantId, tenantId), isNull(ccmClaimSettlements.deletedAt)];
  if (search) conditions.push(or(ilike(ccmClaimSettlements.settlementRef, `%${search}%`), ilike(ccmClaimSettlements.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(ccmClaimSettlements.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(ccmClaimSettlements.createdAt, ccmClaimSettlements.id, cc)); }
  const results = await db.select().from(ccmClaimSettlements).where(and(...conditions)).orderBy(desc(ccmClaimSettlements.createdAt), desc(ccmClaimSettlements.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getClaimSettlement(id: string, tenantId: string) {
  const [record] = await db.select().from(ccmClaimSettlements).where(and(eq(ccmClaimSettlements.id, id), eq(ccmClaimSettlements.tenantId, tenantId), isNull(ccmClaimSettlements.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Subrogation & Recovery Management
// ==========================================
export async function listSubrogationRecoveries({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ccmSubrogationRecoveries.tenantId, tenantId), isNull(ccmSubrogationRecoveries.deletedAt)];
  if (search) conditions.push(or(ilike(ccmSubrogationRecoveries.recoveryRef, `%${search}%`), ilike(ccmSubrogationRecoveries.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(ccmSubrogationRecoveries.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(ccmSubrogationRecoveries.createdAt, ccmSubrogationRecoveries.id, cc)); }
  const results = await db.select().from(ccmSubrogationRecoveries).where(and(...conditions)).orderBy(desc(ccmSubrogationRecoveries.createdAt), desc(ccmSubrogationRecoveries.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getSubrogationRecovery(id: string, tenantId: string) {
  const [record] = await db.select().from(ccmSubrogationRecoveries).where(and(eq(ccmSubrogationRecoveries.id, id), eq(ccmSubrogationRecoveries.tenantId, tenantId), isNull(ccmSubrogationRecoveries.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// AI Claim Probability Prediction
// ==========================================
export async function listClaimPredictions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ccmClaimPredictions.tenantId, tenantId), isNull(ccmClaimPredictions.deletedAt)];
  if (search) conditions.push(or(ilike(ccmClaimPredictions.predictionRef, `%${search}%`), ilike(ccmClaimPredictions.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(ccmClaimPredictions.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(ccmClaimPredictions.createdAt, ccmClaimPredictions.id, cc)); }
  const results = await db.select().from(ccmClaimPredictions).where(and(...conditions)).orderBy(desc(ccmClaimPredictions.createdAt), desc(ccmClaimPredictions.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getClaimPrediction(id: string, tenantId: string) {
  const [record] = await db.select().from(ccmClaimPredictions).where(and(eq(ccmClaimPredictions.id, id), eq(ccmClaimPredictions.tenantId, tenantId), isNull(ccmClaimPredictions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Claims Portfolio Analytics
// ==========================================
export async function listPortfolioAnalytics({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ccmPortfolioAnalytics.tenantId, tenantId), isNull(ccmPortfolioAnalytics.deletedAt)];
  if (search) conditions.push(or(ilike(ccmPortfolioAnalytics.analyticsRef, `%${search}%`), ilike(ccmPortfolioAnalytics.topClaimCategory, `%${search}%`))!);
  if (status) conditions.push(eq(ccmPortfolioAnalytics.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(ccmPortfolioAnalytics.createdAt, ccmPortfolioAnalytics.id, cc)); }
  const results = await db.select().from(ccmPortfolioAnalytics).where(and(...conditions)).orderBy(desc(ccmPortfolioAnalytics.createdAt), desc(ccmPortfolioAnalytics.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getPortfolioAnalytic(id: string, tenantId: string) {
  const [record] = await db.select().from(ccmPortfolioAnalytics).where(and(eq(ccmPortfolioAnalytics.id, id), eq(ccmPortfolioAnalytics.tenantId, tenantId), isNull(ccmPortfolioAnalytics.deletedAt))).limit(1);
  return record ?? null;
}
