import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  icmPiClubPolicies,
  icmHullMachineryInsurances,
  icmCargoInsurancePolicies,
  icmSurveyAppointments,
  icmClaimsRegistrations,
  icmClaimsRecoveries,
  icmClaimsPredictions,
  icmLossPreventionReports,
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
// P&I Club Policies
// ==========================================
export async function listPiClubPolicies({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icmPiClubPolicies.tenantId, tenantId), isNull(icmPiClubPolicies.deletedAt)];
  if (search) conditions.push(or(ilike(icmPiClubPolicies.policyRef, `%${search}%`), ilike(icmPiClubPolicies.clubName, `%${search}%`), ilike(icmPiClubPolicies.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(icmPiClubPolicies.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(icmPiClubPolicies.createdAt, icmPiClubPolicies.id, cc)); }
  const results = await db.select().from(icmPiClubPolicies).where(and(...conditions)).orderBy(desc(icmPiClubPolicies.createdAt), desc(icmPiClubPolicies.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getPiClubPolicy(id: string, tenantId: string) {
  const [record] = await db.select().from(icmPiClubPolicies).where(and(eq(icmPiClubPolicies.id, id), eq(icmPiClubPolicies.tenantId, tenantId), isNull(icmPiClubPolicies.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Hull & Machinery Insurances
// ==========================================
export async function listHullMachineryInsurances({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icmHullMachineryInsurances.tenantId, tenantId), isNull(icmHullMachineryInsurances.deletedAt)];
  if (search) conditions.push(or(ilike(icmHullMachineryInsurances.policyRef, `%${search}%`), ilike(icmHullMachineryInsurances.insurerName, `%${search}%`), ilike(icmHullMachineryInsurances.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(icmHullMachineryInsurances.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(icmHullMachineryInsurances.createdAt, icmHullMachineryInsurances.id, cc)); }
  const results = await db.select().from(icmHullMachineryInsurances).where(and(...conditions)).orderBy(desc(icmHullMachineryInsurances.createdAt), desc(icmHullMachineryInsurances.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getHullMachineryInsurance(id: string, tenantId: string) {
  const [record] = await db.select().from(icmHullMachineryInsurances).where(and(eq(icmHullMachineryInsurances.id, id), eq(icmHullMachineryInsurances.tenantId, tenantId), isNull(icmHullMachineryInsurances.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Cargo Insurance Policies
// ==========================================
export async function listCargoInsurancePolicies({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icmCargoInsurancePolicies.tenantId, tenantId), isNull(icmCargoInsurancePolicies.deletedAt)];
  if (search) conditions.push(or(ilike(icmCargoInsurancePolicies.policyRef, `%${search}%`), ilike(icmCargoInsurancePolicies.insurerName, `%${search}%`), ilike(icmCargoInsurancePolicies.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(icmCargoInsurancePolicies.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(icmCargoInsurancePolicies.createdAt, icmCargoInsurancePolicies.id, cc)); }
  const results = await db.select().from(icmCargoInsurancePolicies).where(and(...conditions)).orderBy(desc(icmCargoInsurancePolicies.createdAt), desc(icmCargoInsurancePolicies.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getCargoInsurancePolicy(id: string, tenantId: string) {
  const [record] = await db.select().from(icmCargoInsurancePolicies).where(and(eq(icmCargoInsurancePolicies.id, id), eq(icmCargoInsurancePolicies.tenantId, tenantId), isNull(icmCargoInsurancePolicies.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Survey Appointments
// ==========================================
export async function listSurveyAppointments({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icmSurveyAppointments.tenantId, tenantId), isNull(icmSurveyAppointments.deletedAt)];
  if (search) conditions.push(or(ilike(icmSurveyAppointments.appointmentRef, `%${search}%`), ilike(icmSurveyAppointments.surveyorName, `%${search}%`), ilike(icmSurveyAppointments.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(icmSurveyAppointments.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(icmSurveyAppointments.createdAt, icmSurveyAppointments.id, cc)); }
  const results = await db.select().from(icmSurveyAppointments).where(and(...conditions)).orderBy(desc(icmSurveyAppointments.createdAt), desc(icmSurveyAppointments.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getSurveyAppointment(id: string, tenantId: string) {
  const [record] = await db.select().from(icmSurveyAppointments).where(and(eq(icmSurveyAppointments.id, id), eq(icmSurveyAppointments.tenantId, tenantId), isNull(icmSurveyAppointments.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Claims Registrations
// ==========================================
export async function listClaimsRegistrations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icmClaimsRegistrations.tenantId, tenantId), isNull(icmClaimsRegistrations.deletedAt)];
  if (search) conditions.push(or(ilike(icmClaimsRegistrations.claimRef, `%${search}%`), ilike(icmClaimsRegistrations.claimantName, `%${search}%`), ilike(icmClaimsRegistrations.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(icmClaimsRegistrations.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(icmClaimsRegistrations.createdAt, icmClaimsRegistrations.id, cc)); }
  const results = await db.select().from(icmClaimsRegistrations).where(and(...conditions)).orderBy(desc(icmClaimsRegistrations.createdAt), desc(icmClaimsRegistrations.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getClaimsRegistration(id: string, tenantId: string) {
  const [record] = await db.select().from(icmClaimsRegistrations).where(and(eq(icmClaimsRegistrations.id, id), eq(icmClaimsRegistrations.tenantId, tenantId), isNull(icmClaimsRegistrations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Claims Recoveries
// ==========================================
export async function listClaimsRecoveries({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icmClaimsRecoveries.tenantId, tenantId), isNull(icmClaimsRecoveries.deletedAt)];
  if (search) conditions.push(or(ilike(icmClaimsRecoveries.recoveryRef, `%${search}%`), ilike(icmClaimsRecoveries.respondentName, `%${search}%`), ilike(icmClaimsRecoveries.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(icmClaimsRecoveries.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(icmClaimsRecoveries.createdAt, icmClaimsRecoveries.id, cc)); }
  const results = await db.select().from(icmClaimsRecoveries).where(and(...conditions)).orderBy(desc(icmClaimsRecoveries.createdAt), desc(icmClaimsRecoveries.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getClaimsRecovery(id: string, tenantId: string) {
  const [record] = await db.select().from(icmClaimsRecoveries).where(and(eq(icmClaimsRecoveries.id, id), eq(icmClaimsRecoveries.tenantId, tenantId), isNull(icmClaimsRecoveries.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Claims Predictions
// ==========================================
export async function listClaimsPredictions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icmClaimsPredictions.tenantId, tenantId), isNull(icmClaimsPredictions.deletedAt)];
  if (search) conditions.push(or(ilike(icmClaimsPredictions.predictionRef, `%${search}%`), ilike(icmClaimsPredictions.vesselName, `%${search}%`), ilike(icmClaimsPredictions.tradeRoute, `%${search}%`))!);
  if (status) conditions.push(eq(icmClaimsPredictions.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(icmClaimsPredictions.createdAt, icmClaimsPredictions.id, cc)); }
  const results = await db.select().from(icmClaimsPredictions).where(and(...conditions)).orderBy(desc(icmClaimsPredictions.createdAt), desc(icmClaimsPredictions.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getClaimsPrediction(id: string, tenantId: string) {
  const [record] = await db.select().from(icmClaimsPredictions).where(and(eq(icmClaimsPredictions.id, id), eq(icmClaimsPredictions.tenantId, tenantId), isNull(icmClaimsPredictions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Loss Prevention Reports
// ==========================================
export async function listLossPreventionReports({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icmLossPreventionReports.tenantId, tenantId), isNull(icmLossPreventionReports.deletedAt)];
  if (search) conditions.push(or(ilike(icmLossPreventionReports.reportRef, `%${search}%`), ilike(icmLossPreventionReports.reportTitle, `%${search}%`), ilike(icmLossPreventionReports.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(icmLossPreventionReports.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(icmLossPreventionReports.createdAt, icmLossPreventionReports.id, cc)); }
  const results = await db.select().from(icmLossPreventionReports).where(and(...conditions)).orderBy(desc(icmLossPreventionReports.createdAt), desc(icmLossPreventionReports.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getLossPreventionReport(id: string, tenantId: string) {
  const [record] = await db.select().from(icmLossPreventionReports).where(and(eq(icmLossPreventionReports.id, id), eq(icmLossPreventionReports.tenantId, tenantId), isNull(icmLossPreventionReports.deletedAt))).limit(1);
  return record ?? null;
}
