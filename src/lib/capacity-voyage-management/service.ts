import { db } from "@/lib/db";
import { eq, and, isNull, ilike, lt, desc } from "drizzle-orm";
import {
  capVesselSchedules,
  capPortRotations,
  capTradeAllocations,
  capSpaceControls,
  capTransshipmentPlans,
  capLoadingLists,
  capBayPlans,
  capStowagePlans,
  capLoadOptimizations,
  capRevenueAnalytics,
  capDemandForecasts,
  capSchedulePerformances,
} from "@/db/schema";

type ListParams = {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
};

// ==========================================
// Vessel Schedules
// ==========================================

export async function listVesselSchedules({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(capVesselSchedules.tenantId, tenantId),
    isNull(capVesselSchedules.deletedAt),
  ];
  if (search)
    conditions.push(ilike(capVesselSchedules.vesselName, `%${search}%`));
  if (status) conditions.push(eq(capVesselSchedules.status, status));
  if (cursor)
    conditions.push(lt(capVesselSchedules.createdAt, new Date(cursor)));

  const results = await db
    .select()
    .from(capVesselSchedules)
    .where(and(...conditions))
    .orderBy(desc(capVesselSchedules.createdAt))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getVesselSchedule(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(capVesselSchedules)
    .where(
      and(
        eq(capVesselSchedules.id, id),
        eq(capVesselSchedules.tenantId, tenantId),
        isNull(capVesselSchedules.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Port Rotations
// ==========================================

export async function listPortRotations({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams & { vesselScheduleId?: string }) {
  const conditions = [
    eq(capPortRotations.tenantId, tenantId),
    isNull(capPortRotations.deletedAt),
  ];
  if (search)
    conditions.push(ilike(capPortRotations.portName, `%${search}%`));
  if (status) conditions.push(eq(capPortRotations.status, status));
  if (cursor)
    conditions.push(lt(capPortRotations.createdAt, new Date(cursor)));

  const results = await db
    .select()
    .from(capPortRotations)
    .where(and(...conditions))
    .orderBy(desc(capPortRotations.createdAt))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getPortRotation(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(capPortRotations)
    .where(
      and(
        eq(capPortRotations.id, id),
        eq(capPortRotations.tenantId, tenantId),
        isNull(capPortRotations.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Trade Allocations
// ==========================================

export async function listTradeAllocations({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(capTradeAllocations.tenantId, tenantId),
    isNull(capTradeAllocations.deletedAt),
  ];
  if (search)
    conditions.push(ilike(capTradeAllocations.tradeLane, `%${search}%`));
  if (status) conditions.push(eq(capTradeAllocations.status, status));
  if (cursor)
    conditions.push(lt(capTradeAllocations.createdAt, new Date(cursor)));

  const results = await db
    .select()
    .from(capTradeAllocations)
    .where(and(...conditions))
    .orderBy(desc(capTradeAllocations.createdAt))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getTradeAllocation(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(capTradeAllocations)
    .where(
      and(
        eq(capTradeAllocations.id, id),
        eq(capTradeAllocations.tenantId, tenantId),
        isNull(capTradeAllocations.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Space Controls
// ==========================================

export async function listSpaceControls({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(capSpaceControls.tenantId, tenantId),
    isNull(capSpaceControls.deletedAt),
  ];
  if (search)
    conditions.push(ilike(capSpaceControls.bookingReference, `%${search}%`));
  if (status) conditions.push(eq(capSpaceControls.status, status));
  if (cursor)
    conditions.push(lt(capSpaceControls.createdAt, new Date(cursor)));

  const results = await db
    .select()
    .from(capSpaceControls)
    .where(and(...conditions))
    .orderBy(desc(capSpaceControls.createdAt))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getSpaceControl(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(capSpaceControls)
    .where(
      and(
        eq(capSpaceControls.id, id),
        eq(capSpaceControls.tenantId, tenantId),
        isNull(capSpaceControls.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Transshipment Plans
// ==========================================

export async function listTransshipmentPlans({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(capTransshipmentPlans.tenantId, tenantId),
    isNull(capTransshipmentPlans.deletedAt),
  ];
  if (search)
    conditions.push(
      ilike(capTransshipmentPlans.transshipmentPort, `%${search}%`)
    );
  if (status) conditions.push(eq(capTransshipmentPlans.status, status));
  if (cursor)
    conditions.push(lt(capTransshipmentPlans.createdAt, new Date(cursor)));

  const results = await db
    .select()
    .from(capTransshipmentPlans)
    .where(and(...conditions))
    .orderBy(desc(capTransshipmentPlans.createdAt))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getTransshipmentPlan(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(capTransshipmentPlans)
    .where(
      and(
        eq(capTransshipmentPlans.id, id),
        eq(capTransshipmentPlans.tenantId, tenantId),
        isNull(capTransshipmentPlans.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Loading Lists
// ==========================================

export async function listLoadingLists({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(capLoadingLists.tenantId, tenantId),
    isNull(capLoadingLists.deletedAt),
  ];
  if (search)
    conditions.push(ilike(capLoadingLists.listReference, `%${search}%`));
  if (status) conditions.push(eq(capLoadingLists.status, status));
  if (cursor)
    conditions.push(lt(capLoadingLists.createdAt, new Date(cursor)));

  const results = await db
    .select()
    .from(capLoadingLists)
    .where(and(...conditions))
    .orderBy(desc(capLoadingLists.createdAt))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getLoadingList(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(capLoadingLists)
    .where(
      and(
        eq(capLoadingLists.id, id),
        eq(capLoadingLists.tenantId, tenantId),
        isNull(capLoadingLists.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Bay Plans
// ==========================================

export async function listBayPlans({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(capBayPlans.tenantId, tenantId),
    isNull(capBayPlans.deletedAt),
  ];
  if (search)
    conditions.push(ilike(capBayPlans.fileReference, `%${search}%`));
  if (status) conditions.push(eq(capBayPlans.status, status));
  if (cursor)
    conditions.push(lt(capBayPlans.createdAt, new Date(cursor)));

  const results = await db
    .select()
    .from(capBayPlans)
    .where(and(...conditions))
    .orderBy(desc(capBayPlans.createdAt))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getBayPlan(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(capBayPlans)
    .where(
      and(
        eq(capBayPlans.id, id),
        eq(capBayPlans.tenantId, tenantId),
        isNull(capBayPlans.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Stowage Plans
// ==========================================

export async function listStowagePlans({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(capStowagePlans.tenantId, tenantId),
    isNull(capStowagePlans.deletedAt),
  ];
  if (search)
    conditions.push(ilike(capStowagePlans.containerNumber, `%${search}%`));
  if (status) conditions.push(eq(capStowagePlans.status, status));
  if (cursor)
    conditions.push(lt(capStowagePlans.createdAt, new Date(cursor)));

  const results = await db
    .select()
    .from(capStowagePlans)
    .where(and(...conditions))
    .orderBy(desc(capStowagePlans.createdAt))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getStowagePlan(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(capStowagePlans)
    .where(
      and(
        eq(capStowagePlans.id, id),
        eq(capStowagePlans.tenantId, tenantId),
        isNull(capStowagePlans.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Load Optimizations
// ==========================================

export async function listLoadOptimizations({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(capLoadOptimizations.tenantId, tenantId),
    isNull(capLoadOptimizations.deletedAt),
  ];
  if (search)
    conditions.push(
      ilike(capLoadOptimizations.optimizationRunId, `%${search}%`)
    );
  if (status) conditions.push(eq(capLoadOptimizations.status, status));
  if (cursor)
    conditions.push(lt(capLoadOptimizations.createdAt, new Date(cursor)));

  const results = await db
    .select()
    .from(capLoadOptimizations)
    .where(and(...conditions))
    .orderBy(desc(capLoadOptimizations.createdAt))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getLoadOptimization(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(capLoadOptimizations)
    .where(
      and(
        eq(capLoadOptimizations.id, id),
        eq(capLoadOptimizations.tenantId, tenantId),
        isNull(capLoadOptimizations.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Revenue Analytics
// ==========================================

export async function listRevenueAnalytics({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(capRevenueAnalytics.tenantId, tenantId),
    isNull(capRevenueAnalytics.deletedAt),
  ];
  if (search)
    conditions.push(ilike(capRevenueAnalytics.tradeLane, `%${search}%`));
  if (status) conditions.push(eq(capRevenueAnalytics.status, status));
  if (cursor)
    conditions.push(lt(capRevenueAnalytics.createdAt, new Date(cursor)));

  const results = await db
    .select()
    .from(capRevenueAnalytics)
    .where(and(...conditions))
    .orderBy(desc(capRevenueAnalytics.createdAt))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getRevenueAnalytic(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(capRevenueAnalytics)
    .where(
      and(
        eq(capRevenueAnalytics.id, id),
        eq(capRevenueAnalytics.tenantId, tenantId),
        isNull(capRevenueAnalytics.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Demand Forecasts
// ==========================================

export async function listDemandForecasts({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(capDemandForecasts.tenantId, tenantId),
    isNull(capDemandForecasts.deletedAt),
  ];
  if (search)
    conditions.push(ilike(capDemandForecasts.tradeLane, `%${search}%`));
  if (status) conditions.push(eq(capDemandForecasts.status, status));
  if (cursor)
    conditions.push(lt(capDemandForecasts.createdAt, new Date(cursor)));

  const results = await db
    .select()
    .from(capDemandForecasts)
    .where(and(...conditions))
    .orderBy(desc(capDemandForecasts.createdAt))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getDemandForecast(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(capDemandForecasts)
    .where(
      and(
        eq(capDemandForecasts.id, id),
        eq(capDemandForecasts.tenantId, tenantId),
        isNull(capDemandForecasts.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Schedule Performances
// ==========================================

export async function listSchedulePerformances({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(capSchedulePerformances.tenantId, tenantId),
    isNull(capSchedulePerformances.deletedAt),
  ];
  if (search)
    conditions.push(ilike(capSchedulePerformances.portName, `%${search}%`));
  if (status) conditions.push(eq(capSchedulePerformances.status, status));
  if (cursor)
    conditions.push(lt(capSchedulePerformances.createdAt, new Date(cursor)));

  const results = await db
    .select()
    .from(capSchedulePerformances)
    .where(and(...conditions))
    .orderBy(desc(capSchedulePerformances.createdAt))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getSchedulePerformance(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(capSchedulePerformances)
    .where(
      and(
        eq(capSchedulePerformances.id, id),
        eq(capSchedulePerformances.tenantId, tenantId),
        isNull(capSchedulePerformances.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}
