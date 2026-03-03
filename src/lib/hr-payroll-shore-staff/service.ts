import { and, eq, ilike, isNull, gt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  hpsEmployeeProfiles,
  hpsLeaveAbsences,
  hpsAttendanceTimeTrackings,
  hpsPerformanceAppraisals,
  hpsPayrollProcessings,
  hpsSocialInsuranceRecords,
  hpsGratuityCalculations,
  hpsVisaResidencyRecords,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Employee Profiles
// ==========================================
export async function listEmployeeProfiles({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(hpsEmployeeProfiles.tenantId, tenantId), isNull(hpsEmployeeProfiles.deletedAt)];
  if (search) conditions.push(or(ilike(hpsEmployeeProfiles.employeeRef, `%${search}%`), ilike(hpsEmployeeProfiles.firstName, `%${search}%`), ilike(hpsEmployeeProfiles.lastName, `%${search}%`))!);
  if (status) conditions.push(eq(hpsEmployeeProfiles.status, status));
  if (cursor) conditions.push(gt(hpsEmployeeProfiles.createdAt, new Date(cursor)));
  const results = await db.select().from(hpsEmployeeProfiles).where(and(...conditions)).orderBy(desc(hpsEmployeeProfiles.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getEmployeeProfile(id: string, tenantId: string) {
  const [record] = await db.select().from(hpsEmployeeProfiles).where(and(eq(hpsEmployeeProfiles.id, id), eq(hpsEmployeeProfiles.tenantId, tenantId), isNull(hpsEmployeeProfiles.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Leave & Absences
// ==========================================
export async function listLeaveAbsences({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(hpsLeaveAbsences.tenantId, tenantId), isNull(hpsLeaveAbsences.deletedAt)];
  if (search) conditions.push(or(ilike(hpsLeaveAbsences.leaveRef, `%${search}%`), ilike(hpsLeaveAbsences.employeeName, `%${search}%`))!);
  if (status) conditions.push(eq(hpsLeaveAbsences.status, status));
  if (cursor) conditions.push(gt(hpsLeaveAbsences.createdAt, new Date(cursor)));
  const results = await db.select().from(hpsLeaveAbsences).where(and(...conditions)).orderBy(desc(hpsLeaveAbsences.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getLeaveAbsence(id: string, tenantId: string) {
  const [record] = await db.select().from(hpsLeaveAbsences).where(and(eq(hpsLeaveAbsences.id, id), eq(hpsLeaveAbsences.tenantId, tenantId), isNull(hpsLeaveAbsences.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Attendance & Time Trackings
// ==========================================
export async function listAttendanceTimeTrackings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(hpsAttendanceTimeTrackings.tenantId, tenantId), isNull(hpsAttendanceTimeTrackings.deletedAt)];
  if (search) conditions.push(or(ilike(hpsAttendanceTimeTrackings.attendanceRef, `%${search}%`), ilike(hpsAttendanceTimeTrackings.employeeName, `%${search}%`))!);
  if (status) conditions.push(eq(hpsAttendanceTimeTrackings.status, status));
  if (cursor) conditions.push(gt(hpsAttendanceTimeTrackings.createdAt, new Date(cursor)));
  const results = await db.select().from(hpsAttendanceTimeTrackings).where(and(...conditions)).orderBy(desc(hpsAttendanceTimeTrackings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getAttendanceTimeTracking(id: string, tenantId: string) {
  const [record] = await db.select().from(hpsAttendanceTimeTrackings).where(and(eq(hpsAttendanceTimeTrackings.id, id), eq(hpsAttendanceTimeTrackings.tenantId, tenantId), isNull(hpsAttendanceTimeTrackings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Performance Appraisals
// ==========================================
export async function listPerformanceAppraisals({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(hpsPerformanceAppraisals.tenantId, tenantId), isNull(hpsPerformanceAppraisals.deletedAt)];
  if (search) conditions.push(or(ilike(hpsPerformanceAppraisals.appraisalRef, `%${search}%`), ilike(hpsPerformanceAppraisals.employeeName, `%${search}%`))!);
  if (status) conditions.push(eq(hpsPerformanceAppraisals.status, status));
  if (cursor) conditions.push(gt(hpsPerformanceAppraisals.createdAt, new Date(cursor)));
  const results = await db.select().from(hpsPerformanceAppraisals).where(and(...conditions)).orderBy(desc(hpsPerformanceAppraisals.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPerformanceAppraisal(id: string, tenantId: string) {
  const [record] = await db.select().from(hpsPerformanceAppraisals).where(and(eq(hpsPerformanceAppraisals.id, id), eq(hpsPerformanceAppraisals.tenantId, tenantId), isNull(hpsPerformanceAppraisals.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Payroll Processings
// ==========================================
export async function listPayrollProcessings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(hpsPayrollProcessings.tenantId, tenantId), isNull(hpsPayrollProcessings.deletedAt)];
  if (search) conditions.push(or(ilike(hpsPayrollProcessings.payrollRef, `%${search}%`), ilike(hpsPayrollProcessings.employeeName, `%${search}%`))!);
  if (status) conditions.push(eq(hpsPayrollProcessings.status, status));
  if (cursor) conditions.push(gt(hpsPayrollProcessings.createdAt, new Date(cursor)));
  const results = await db.select().from(hpsPayrollProcessings).where(and(...conditions)).orderBy(desc(hpsPayrollProcessings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPayrollProcessing(id: string, tenantId: string) {
  const [record] = await db.select().from(hpsPayrollProcessings).where(and(eq(hpsPayrollProcessings.id, id), eq(hpsPayrollProcessings.tenantId, tenantId), isNull(hpsPayrollProcessings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Social Insurance Records
// ==========================================
export async function listSocialInsuranceRecords({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(hpsSocialInsuranceRecords.tenantId, tenantId), isNull(hpsSocialInsuranceRecords.deletedAt)];
  if (search) conditions.push(or(ilike(hpsSocialInsuranceRecords.recordRef, `%${search}%`), ilike(hpsSocialInsuranceRecords.employeeName, `%${search}%`))!);
  if (status) conditions.push(eq(hpsSocialInsuranceRecords.status, status));
  if (cursor) conditions.push(gt(hpsSocialInsuranceRecords.createdAt, new Date(cursor)));
  const results = await db.select().from(hpsSocialInsuranceRecords).where(and(...conditions)).orderBy(desc(hpsSocialInsuranceRecords.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getSocialInsuranceRecord(id: string, tenantId: string) {
  const [record] = await db.select().from(hpsSocialInsuranceRecords).where(and(eq(hpsSocialInsuranceRecords.id, id), eq(hpsSocialInsuranceRecords.tenantId, tenantId), isNull(hpsSocialInsuranceRecords.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Gratuity Calculations
// ==========================================
export async function listGratuityCalculations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(hpsGratuityCalculations.tenantId, tenantId), isNull(hpsGratuityCalculations.deletedAt)];
  if (search) conditions.push(or(ilike(hpsGratuityCalculations.calculationRef, `%${search}%`), ilike(hpsGratuityCalculations.employeeName, `%${search}%`))!);
  if (status) conditions.push(eq(hpsGratuityCalculations.status, status));
  if (cursor) conditions.push(gt(hpsGratuityCalculations.createdAt, new Date(cursor)));
  const results = await db.select().from(hpsGratuityCalculations).where(and(...conditions)).orderBy(desc(hpsGratuityCalculations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getGratuityCalculation(id: string, tenantId: string) {
  const [record] = await db.select().from(hpsGratuityCalculations).where(and(eq(hpsGratuityCalculations.id, id), eq(hpsGratuityCalculations.tenantId, tenantId), isNull(hpsGratuityCalculations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Visa & Residency Records
// ==========================================
export async function listVisaResidencyRecords({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(hpsVisaResidencyRecords.tenantId, tenantId), isNull(hpsVisaResidencyRecords.deletedAt)];
  if (search) conditions.push(or(ilike(hpsVisaResidencyRecords.visaRef, `%${search}%`), ilike(hpsVisaResidencyRecords.employeeName, `%${search}%`))!);
  if (status) conditions.push(eq(hpsVisaResidencyRecords.status, status));
  if (cursor) conditions.push(gt(hpsVisaResidencyRecords.createdAt, new Date(cursor)));
  const results = await db.select().from(hpsVisaResidencyRecords).where(and(...conditions)).orderBy(desc(hpsVisaResidencyRecords.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getVisaResidencyRecord(id: string, tenantId: string) {
  const [record] = await db.select().from(hpsVisaResidencyRecords).where(and(eq(hpsVisaResidencyRecords.id, id), eq(hpsVisaResidencyRecords.tenantId, tenantId), isNull(hpsVisaResidencyRecords.deletedAt))).limit(1);
  return record ?? null;
}
