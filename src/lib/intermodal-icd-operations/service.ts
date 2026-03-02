import { and, eq, ilike, isNull, gt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  icdDryPorts,
  icdRailPlans,
  icdTruckBookings,
  icdBondedWarehouses,
  icdLastMileDeliveries,
  icdMultimodalBols,
  icdHaulageRates,
  icdRouteOptimizations,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// ICD & Dry Port Management
// ==========================================

export async function listDryPorts({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icdDryPorts.tenantId, tenantId), isNull(icdDryPorts.deletedAt)];
  if (search) conditions.push(or(ilike(icdDryPorts.portRef, `%${search}%`), ilike(icdDryPorts.portName, `%${search}%`), ilike(icdDryPorts.portCode, `%${search}%`))!);
  if (status) conditions.push(eq(icdDryPorts.status, status));
  if (cursor) conditions.push(gt(icdDryPorts.createdAt, new Date(cursor)));
  const results = await db.select().from(icdDryPorts).where(and(...conditions)).orderBy(desc(icdDryPorts.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getDryPort(id: string, tenantId: string) {
  const [record] = await db.select().from(icdDryPorts).where(and(eq(icdDryPorts.id, id), eq(icdDryPorts.tenantId, tenantId), isNull(icdDryPorts.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Rail Wagon & Train Planning
// ==========================================

export async function listRailPlans({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icdRailPlans.tenantId, tenantId), isNull(icdRailPlans.deletedAt)];
  if (search) conditions.push(or(ilike(icdRailPlans.railPlanRef, `%${search}%`), ilike(icdRailPlans.trainNumber, `%${search}%`), ilike(icdRailPlans.trainOperator, `%${search}%`))!);
  if (status) conditions.push(eq(icdRailPlans.status, status));
  if (cursor) conditions.push(gt(icdRailPlans.createdAt, new Date(cursor)));
  const results = await db.select().from(icdRailPlans).where(and(...conditions)).orderBy(desc(icdRailPlans.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getRailPlan(id: string, tenantId: string) {
  const [record] = await db.select().from(icdRailPlans).where(and(eq(icdRailPlans.id, id), eq(icdRailPlans.tenantId, tenantId), isNull(icdRailPlans.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Truck Booking & Transport Management
// ==========================================

export async function listTruckBookings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icdTruckBookings.tenantId, tenantId), isNull(icdTruckBookings.deletedAt)];
  if (search) conditions.push(or(ilike(icdTruckBookings.bookingRef, `%${search}%`), ilike(icdTruckBookings.transporterName, `%${search}%`), ilike(icdTruckBookings.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(icdTruckBookings.status, status));
  if (cursor) conditions.push(gt(icdTruckBookings.createdAt, new Date(cursor)));
  const results = await db.select().from(icdTruckBookings).where(and(...conditions)).orderBy(desc(icdTruckBookings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getTruckBooking(id: string, tenantId: string) {
  const [record] = await db.select().from(icdTruckBookings).where(and(eq(icdTruckBookings.id, id), eq(icdTruckBookings.tenantId, tenantId), isNull(icdTruckBookings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Customs Bonded Warehouse Operations
// ==========================================

export async function listBondedWarehouses({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icdBondedWarehouses.tenantId, tenantId), isNull(icdBondedWarehouses.deletedAt)];
  if (search) conditions.push(or(ilike(icdBondedWarehouses.warehouseRef, `%${search}%`), ilike(icdBondedWarehouses.warehouseName, `%${search}%`), ilike(icdBondedWarehouses.warehouseCode, `%${search}%`))!);
  if (status) conditions.push(eq(icdBondedWarehouses.status, status));
  if (cursor) conditions.push(gt(icdBondedWarehouses.createdAt, new Date(cursor)));
  const results = await db.select().from(icdBondedWarehouses).where(and(...conditions)).orderBy(desc(icdBondedWarehouses.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getBondedWarehouse(id: string, tenantId: string) {
  const [record] = await db.select().from(icdBondedWarehouses).where(and(eq(icdBondedWarehouses.id, id), eq(icdBondedWarehouses.tenantId, tenantId), isNull(icdBondedWarehouses.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Last Mile Delivery Management
// ==========================================

export async function listLastMileDeliveries({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icdLastMileDeliveries.tenantId, tenantId), isNull(icdLastMileDeliveries.deletedAt)];
  if (search) conditions.push(or(ilike(icdLastMileDeliveries.deliveryRef, `%${search}%`), ilike(icdLastMileDeliveries.customerName, `%${search}%`), ilike(icdLastMileDeliveries.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(icdLastMileDeliveries.status, status));
  if (cursor) conditions.push(gt(icdLastMileDeliveries.createdAt, new Date(cursor)));
  const results = await db.select().from(icdLastMileDeliveries).where(and(...conditions)).orderBy(desc(icdLastMileDeliveries.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getLastMileDelivery(id: string, tenantId: string) {
  const [record] = await db.select().from(icdLastMileDeliveries).where(and(eq(icdLastMileDeliveries.id, id), eq(icdLastMileDeliveries.tenantId, tenantId), isNull(icdLastMileDeliveries.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Multimodal Bill of Lading
// ==========================================

export async function listMultimodalBols({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icdMultimodalBols.tenantId, tenantId), isNull(icdMultimodalBols.deletedAt)];
  if (search) conditions.push(or(ilike(icdMultimodalBols.bolRef, `%${search}%`), ilike(icdMultimodalBols.shipperName, `%${search}%`), ilike(icdMultimodalBols.bolNumber, `%${search}%`))!);
  if (status) conditions.push(eq(icdMultimodalBols.status, status));
  if (cursor) conditions.push(gt(icdMultimodalBols.createdAt, new Date(cursor)));
  const results = await db.select().from(icdMultimodalBols).where(and(...conditions)).orderBy(desc(icdMultimodalBols.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getMultimodalBol(id: string, tenantId: string) {
  const [record] = await db.select().from(icdMultimodalBols).where(and(eq(icdMultimodalBols.id, id), eq(icdMultimodalBols.tenantId, tenantId), isNull(icdMultimodalBols.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Inland Haulage Rate Management
// ==========================================

export async function listHaulageRates({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icdHaulageRates.tenantId, tenantId), isNull(icdHaulageRates.deletedAt)];
  if (search) conditions.push(or(ilike(icdHaulageRates.rateRef, `%${search}%`), ilike(icdHaulageRates.rateName, `%${search}%`), ilike(icdHaulageRates.carrierName, `%${search}%`))!);
  if (status) conditions.push(eq(icdHaulageRates.status, status));
  if (cursor) conditions.push(gt(icdHaulageRates.createdAt, new Date(cursor)));
  const results = await db.select().from(icdHaulageRates).where(and(...conditions)).orderBy(desc(icdHaulageRates.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getHaulageRate(id: string, tenantId: string) {
  const [record] = await db.select().from(icdHaulageRates).where(and(eq(icdHaulageRates.id, id), eq(icdHaulageRates.tenantId, tenantId), isNull(icdHaulageRates.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// AI Intermodal Route Optimization
// ==========================================

export async function listRouteOptimizations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(icdRouteOptimizations.tenantId, tenantId), isNull(icdRouteOptimizations.deletedAt)];
  if (search) conditions.push(or(ilike(icdRouteOptimizations.optimizationRef, `%${search}%`), ilike(icdRouteOptimizations.originLocation, `%${search}%`), ilike(icdRouteOptimizations.destinationLocation, `%${search}%`))!);
  if (status) conditions.push(eq(icdRouteOptimizations.status, status));
  if (cursor) conditions.push(gt(icdRouteOptimizations.createdAt, new Date(cursor)));
  const results = await db.select().from(icdRouteOptimizations).where(and(...conditions)).orderBy(desc(icdRouteOptimizations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getRouteOptimization(id: string, tenantId: string) {
  const [record] = await db.select().from(icdRouteOptimizations).where(and(eq(icdRouteOptimizations.id, id), eq(icdRouteOptimizations.tenantId, tenantId), isNull(icdRouteOptimizations.deletedAt))).limit(1);
  return record ?? null;
}
