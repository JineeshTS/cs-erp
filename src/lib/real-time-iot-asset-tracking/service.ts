import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  iotContainerGpsTrackings,
  iotReeferMonitorings,
  iotElectronicSeals,
  iotShockDetections,
  iotVesselPositions,
  iotPortEquipments,
  iotPredictiveAlerts,
  iotDataLakeAnalytics,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Container GPS Location Tracking
// ==========================================
export async function listContainerGpsTrackings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(iotContainerGpsTrackings.tenantId, tenantId), isNull(iotContainerGpsTrackings.deletedAt)];
  if (search) conditions.push(or(ilike(iotContainerGpsTrackings.trackingRef, `%${search}%`), ilike(iotContainerGpsTrackings.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(iotContainerGpsTrackings.status, status));
  if (cursor) conditions.push(lt(iotContainerGpsTrackings.createdAt, new Date(cursor)));
  const results = await db.select().from(iotContainerGpsTrackings).where(and(...conditions)).orderBy(desc(iotContainerGpsTrackings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getContainerGpsTracking(id: string, tenantId: string) {
  const [record] = await db.select().from(iotContainerGpsTrackings).where(and(eq(iotContainerGpsTrackings.id, id), eq(iotContainerGpsTrackings.tenantId, tenantId), isNull(iotContainerGpsTrackings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Reefer IoT Temperature Humidity Monitoring
// ==========================================
export async function listReeferMonitorings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(iotReeferMonitorings.tenantId, tenantId), isNull(iotReeferMonitorings.deletedAt)];
  if (search) conditions.push(or(ilike(iotReeferMonitorings.monitoringRef, `%${search}%`), ilike(iotReeferMonitorings.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(iotReeferMonitorings.status, status));
  if (cursor) conditions.push(lt(iotReeferMonitorings.createdAt, new Date(cursor)));
  const results = await db.select().from(iotReeferMonitorings).where(and(...conditions)).orderBy(desc(iotReeferMonitorings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getReeferMonitoring(id: string, tenantId: string) {
  const [record] = await db.select().from(iotReeferMonitorings).where(and(eq(iotReeferMonitorings.id, id), eq(iotReeferMonitorings.tenantId, tenantId), isNull(iotReeferMonitorings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Electronic Seal Integrity Monitoring
// ==========================================
export async function listElectronicSeals({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(iotElectronicSeals.tenantId, tenantId), isNull(iotElectronicSeals.deletedAt)];
  if (search) conditions.push(or(ilike(iotElectronicSeals.sealRef, `%${search}%`), ilike(iotElectronicSeals.sealNumber, `%${search}%`))!);
  if (status) conditions.push(eq(iotElectronicSeals.status, status));
  if (cursor) conditions.push(lt(iotElectronicSeals.createdAt, new Date(cursor)));
  const results = await db.select().from(iotElectronicSeals).where(and(...conditions)).orderBy(desc(iotElectronicSeals.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getElectronicSeal(id: string, tenantId: string) {
  const [record] = await db.select().from(iotElectronicSeals).where(and(eq(iotElectronicSeals.id, id), eq(iotElectronicSeals.tenantId, tenantId), isNull(iotElectronicSeals.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Shock Tilt and Vibration Detection
// ==========================================
export async function listShockDetections({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(iotShockDetections.tenantId, tenantId), isNull(iotShockDetections.deletedAt)];
  if (search) conditions.push(or(ilike(iotShockDetections.detectionRef, `%${search}%`), ilike(iotShockDetections.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(iotShockDetections.status, status));
  if (cursor) conditions.push(lt(iotShockDetections.createdAt, new Date(cursor)));
  const results = await db.select().from(iotShockDetections).where(and(...conditions)).orderBy(desc(iotShockDetections.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getShockDetection(id: string, tenantId: string) {
  const [record] = await db.select().from(iotShockDetections).where(and(eq(iotShockDetections.id, id), eq(iotShockDetections.tenantId, tenantId), isNull(iotShockDetections.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// AIS Vessel Position Tracking
// ==========================================
export async function listVesselPositions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(iotVesselPositions.tenantId, tenantId), isNull(iotVesselPositions.deletedAt)];
  if (search) conditions.push(or(ilike(iotVesselPositions.positionRef, `%${search}%`), ilike(iotVesselPositions.vesselName, `%${search}%`))!);
  if (status) conditions.push(eq(iotVesselPositions.status, status));
  if (cursor) conditions.push(lt(iotVesselPositions.createdAt, new Date(cursor)));
  const results = await db.select().from(iotVesselPositions).where(and(...conditions)).orderBy(desc(iotVesselPositions.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getVesselPosition(id: string, tenantId: string) {
  const [record] = await db.select().from(iotVesselPositions).where(and(eq(iotVesselPositions.id, id), eq(iotVesselPositions.tenantId, tenantId), isNull(iotVesselPositions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Port Equipment IoT Monitoring
// ==========================================
export async function listPortEquipments({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(iotPortEquipments.tenantId, tenantId), isNull(iotPortEquipments.deletedAt)];
  if (search) conditions.push(or(ilike(iotPortEquipments.equipmentRef, `%${search}%`), ilike(iotPortEquipments.equipmentName, `%${search}%`))!);
  if (status) conditions.push(eq(iotPortEquipments.status, status));
  if (cursor) conditions.push(lt(iotPortEquipments.createdAt, new Date(cursor)));
  const results = await db.select().from(iotPortEquipments).where(and(...conditions)).orderBy(desc(iotPortEquipments.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPortEquipment(id: string, tenantId: string) {
  const [record] = await db.select().from(iotPortEquipments).where(and(eq(iotPortEquipments.id, id), eq(iotPortEquipments.tenantId, tenantId), isNull(iotPortEquipments.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Predictive Alert & Maintenance Engine
// ==========================================
export async function listPredictiveAlerts({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(iotPredictiveAlerts.tenantId, tenantId), isNull(iotPredictiveAlerts.deletedAt)];
  if (search) conditions.push(or(ilike(iotPredictiveAlerts.alertRef, `%${search}%`), ilike(iotPredictiveAlerts.assetIdentifier, `%${search}%`))!);
  if (status) conditions.push(eq(iotPredictiveAlerts.status, status));
  if (cursor) conditions.push(lt(iotPredictiveAlerts.createdAt, new Date(cursor)));
  const results = await db.select().from(iotPredictiveAlerts).where(and(...conditions)).orderBy(desc(iotPredictiveAlerts.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPredictiveAlert(id: string, tenantId: string) {
  const [record] = await db.select().from(iotPredictiveAlerts).where(and(eq(iotPredictiveAlerts.id, id), eq(iotPredictiveAlerts.tenantId, tenantId), isNull(iotPredictiveAlerts.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// IoT Data Lake Analytics Dashboard
// ==========================================
export async function listDataLakeAnalytics({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(iotDataLakeAnalytics.tenantId, tenantId), isNull(iotDataLakeAnalytics.deletedAt)];
  if (search) conditions.push(or(ilike(iotDataLakeAnalytics.analyticsRef, `%${search}%`), ilike(iotDataLakeAnalytics.reportName, `%${search}%`))!);
  if (status) conditions.push(eq(iotDataLakeAnalytics.status, status));
  if (cursor) conditions.push(lt(iotDataLakeAnalytics.createdAt, new Date(cursor)));
  const results = await db.select().from(iotDataLakeAnalytics).where(and(...conditions)).orderBy(desc(iotDataLakeAnalytics.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getDataLakeAnalytic(id: string, tenantId: string) {
  const [record] = await db.select().from(iotDataLakeAnalytics).where(and(eq(iotDataLakeAnalytics.id, id), eq(iotDataLakeAnalytics.tenantId, tenantId), isNull(iotDataLakeAnalytics.deletedAt))).limit(1);
  return record ?? null;
}
