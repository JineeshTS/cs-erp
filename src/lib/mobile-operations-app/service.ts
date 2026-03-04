import { and, eq, ilike, isNull, gt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  mobGateProcessings,
  mobYardInspections,
  mobContainerSurveys,
  mobOfflineSyncs,
  mobDamageAssessments,
  mobDriverDeliveries,
  mobExecutiveDashboards,
  mobPushNotifications,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Gate In & Out Mobile Processing
// ==========================================
export async function listGateProcessings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(mobGateProcessings.tenantId, tenantId), isNull(mobGateProcessings.deletedAt)];
  if (search) conditions.push(or(ilike(mobGateProcessings.gateRef, `%${search}%`), ilike(mobGateProcessings.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(mobGateProcessings.status, status));
  if (cursor) conditions.push(gt(mobGateProcessings.createdAt, new Date(cursor)));
  const results = await db.select().from(mobGateProcessings).where(and(...conditions)).orderBy(desc(mobGateProcessings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getGateProcessing(id: string, tenantId: string) {
  const [record] = await db.select().from(mobGateProcessings).where(and(eq(mobGateProcessings.id, id), eq(mobGateProcessings.tenantId, tenantId), isNull(mobGateProcessings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Yard Inspection Mobile App
// ==========================================
export async function listYardInspections({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(mobYardInspections.tenantId, tenantId), isNull(mobYardInspections.deletedAt)];
  if (search) conditions.push(or(ilike(mobYardInspections.inspectionRef, `%${search}%`), ilike(mobYardInspections.inspectorName, `%${search}%`))!);
  if (status) conditions.push(eq(mobYardInspections.status, status));
  if (cursor) conditions.push(gt(mobYardInspections.createdAt, new Date(cursor)));
  const results = await db.select().from(mobYardInspections).where(and(...conditions)).orderBy(desc(mobYardInspections.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getYardInspection(id: string, tenantId: string) {
  const [record] = await db.select().from(mobYardInspections).where(and(eq(mobYardInspections.id, id), eq(mobYardInspections.tenantId, tenantId), isNull(mobYardInspections.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Container Survey Mobile App
// ==========================================
export async function listContainerSurveys({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(mobContainerSurveys.tenantId, tenantId), isNull(mobContainerSurveys.deletedAt)];
  if (search) conditions.push(or(ilike(mobContainerSurveys.surveyRef, `%${search}%`), ilike(mobContainerSurveys.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(mobContainerSurveys.status, status));
  if (cursor) conditions.push(gt(mobContainerSurveys.createdAt, new Date(cursor)));
  const results = await db.select().from(mobContainerSurveys).where(and(...conditions)).orderBy(desc(mobContainerSurveys.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getContainerSurvey(id: string, tenantId: string) {
  const [record] = await db.select().from(mobContainerSurveys).where(and(eq(mobContainerSurveys.id, id), eq(mobContainerSurveys.tenantId, tenantId), isNull(mobContainerSurveys.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Offline Sync Capability
// ==========================================
export async function listOfflineSyncs({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(mobOfflineSyncs.tenantId, tenantId), isNull(mobOfflineSyncs.deletedAt)];
  if (search) conditions.push(or(ilike(mobOfflineSyncs.syncRef, `%${search}%`), ilike(mobOfflineSyncs.deviceName, `%${search}%`))!);
  if (status) conditions.push(eq(mobOfflineSyncs.status, status));
  if (cursor) conditions.push(gt(mobOfflineSyncs.createdAt, new Date(cursor)));
  const results = await db.select().from(mobOfflineSyncs).where(and(...conditions)).orderBy(desc(mobOfflineSyncs.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getOfflineSync(id: string, tenantId: string) {
  const [record] = await db.select().from(mobOfflineSyncs).where(and(eq(mobOfflineSyncs.id, id), eq(mobOfflineSyncs.tenantId, tenantId), isNull(mobOfflineSyncs.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Container Damage Photo Upload & AI Assessment
// ==========================================
export async function listDamageAssessments({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(mobDamageAssessments.tenantId, tenantId), isNull(mobDamageAssessments.deletedAt)];
  if (search) conditions.push(or(ilike(mobDamageAssessments.assessmentRef, `%${search}%`), ilike(mobDamageAssessments.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(mobDamageAssessments.status, status));
  if (cursor) conditions.push(gt(mobDamageAssessments.createdAt, new Date(cursor)));
  const results = await db.select().from(mobDamageAssessments).where(and(...conditions)).orderBy(desc(mobDamageAssessments.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getDamageAssessment(id: string, tenantId: string) {
  const [record] = await db.select().from(mobDamageAssessments).where(and(eq(mobDamageAssessments.id, id), eq(mobDamageAssessments.tenantId, tenantId), isNull(mobDamageAssessments.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Driver App & POD Delivery Confirmation
// ==========================================
export async function listDriverDeliveries({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(mobDriverDeliveries.tenantId, tenantId), isNull(mobDriverDeliveries.deletedAt)];
  if (search) conditions.push(or(ilike(mobDriverDeliveries.deliveryRef, `%${search}%`), ilike(mobDriverDeliveries.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(mobDriverDeliveries.status, status));
  if (cursor) conditions.push(gt(mobDriverDeliveries.createdAt, new Date(cursor)));
  const results = await db.select().from(mobDriverDeliveries).where(and(...conditions)).orderBy(desc(mobDriverDeliveries.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getDriverDelivery(id: string, tenantId: string) {
  const [record] = await db.select().from(mobDriverDeliveries).where(and(eq(mobDriverDeliveries.id, id), eq(mobDriverDeliveries.tenantId, tenantId), isNull(mobDriverDeliveries.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Executive Mobile Dashboard
// ==========================================
export async function listExecutiveDashboards({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(mobExecutiveDashboards.tenantId, tenantId), isNull(mobExecutiveDashboards.deletedAt)];
  if (search) conditions.push(or(ilike(mobExecutiveDashboards.dashboardRef, `%${search}%`), ilike(mobExecutiveDashboards.dashboardName, `%${search}%`))!);
  if (status) conditions.push(eq(mobExecutiveDashboards.status, status));
  if (cursor) conditions.push(gt(mobExecutiveDashboards.createdAt, new Date(cursor)));
  const results = await db.select().from(mobExecutiveDashboards).where(and(...conditions)).orderBy(desc(mobExecutiveDashboards.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getExecutiveDashboard(id: string, tenantId: string) {
  const [record] = await db.select().from(mobExecutiveDashboards).where(and(eq(mobExecutiveDashboards.id, id), eq(mobExecutiveDashboards.tenantId, tenantId), isNull(mobExecutiveDashboards.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Push Notification Management
// ==========================================
export async function listPushNotifications({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(mobPushNotifications.tenantId, tenantId), isNull(mobPushNotifications.deletedAt)];
  if (search) conditions.push(or(ilike(mobPushNotifications.notificationRef, `%${search}%`), ilike(mobPushNotifications.title, `%${search}%`))!);
  if (status) conditions.push(eq(mobPushNotifications.status, status));
  if (cursor) conditions.push(gt(mobPushNotifications.createdAt, new Date(cursor)));
  const results = await db.select().from(mobPushNotifications).where(and(...conditions)).orderBy(desc(mobPushNotifications.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPushNotification(id: string, tenantId: string) {
  const [record] = await db.select().from(mobPushNotifications).where(and(eq(mobPushNotifications.id, id), eq(mobPushNotifications.tenantId, tenantId), isNull(mobPushNotifications.deletedAt))).limit(1);
  return record ?? null;
}
