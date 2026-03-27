import { db } from "@/lib/db";
import { eq, and, isNull, ilike, lt, desc } from "drizzle-orm";
import {
  eqyContainerFleet,
  eqyRepositioningPlans,
  eqyReeferContainers,
  eqyMaintenanceRepairs,
  eqyYardSlots,
  eqyGateMovements,
  eqyEquipmentInterchanges,
  eqyOnHireOffHire,
  eqyContainerSurveys,
  eqyLeasedContainers,
  eqyAvailabilityPlans,
  eqyRepositioningOptimizations,
} from "@/db/schema";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";

type ListParams = {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
};

// ==========================================
// Container Fleet
// ==========================================

export async function listContainerFleet({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(eqyContainerFleet.tenantId, tenantId),
    isNull(eqyContainerFleet.deletedAt),
  ];
  if (search)
    conditions.push(ilike(eqyContainerFleet.containerNumber, `%${search}%`));
  if (status) conditions.push(eq(eqyContainerFleet.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc)     conditions.push(cursorCondition(eqyContainerFleet.createdAt, eqyContainerFleet.id, cc)); }

  const results = await db
    .select()
    .from(eqyContainerFleet)
    .where(and(...conditions))
    .orderBy(desc(eqyContainerFleet.createdAt), desc(eqyContainerFleet.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getContainerFleetRecord(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(eqyContainerFleet)
    .where(
      and(
        eq(eqyContainerFleet.id, id),
        eq(eqyContainerFleet.tenantId, tenantId),
        isNull(eqyContainerFleet.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Repositioning Plans
// ==========================================

export async function listRepositioningPlans({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(eqyRepositioningPlans.tenantId, tenantId),
    isNull(eqyRepositioningPlans.deletedAt),
  ];
  if (search)
    conditions.push(ilike(eqyRepositioningPlans.planReference, `%${search}%`));
  if (status) conditions.push(eq(eqyRepositioningPlans.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc)     conditions.push(cursorCondition(eqyRepositioningPlans.createdAt, eqyRepositioningPlans.id, cc)); }

  const results = await db
    .select()
    .from(eqyRepositioningPlans)
    .where(and(...conditions))
    .orderBy(desc(eqyRepositioningPlans.createdAt), desc(eqyRepositioningPlans.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getRepositioningPlan(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(eqyRepositioningPlans)
    .where(
      and(
        eq(eqyRepositioningPlans.id, id),
        eq(eqyRepositioningPlans.tenantId, tenantId),
        isNull(eqyRepositioningPlans.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Reefer Containers
// ==========================================

export async function listReeferContainers({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(eqyReeferContainers.tenantId, tenantId),
    isNull(eqyReeferContainers.deletedAt),
  ];
  if (search)
    conditions.push(ilike(eqyReeferContainers.containerNumber, `%${search}%`));
  if (status) conditions.push(eq(eqyReeferContainers.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc)     conditions.push(cursorCondition(eqyReeferContainers.createdAt, eqyReeferContainers.id, cc)); }

  const results = await db
    .select()
    .from(eqyReeferContainers)
    .where(and(...conditions))
    .orderBy(desc(eqyReeferContainers.createdAt), desc(eqyReeferContainers.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getReeferContainer(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(eqyReeferContainers)
    .where(
      and(
        eq(eqyReeferContainers.id, id),
        eq(eqyReeferContainers.tenantId, tenantId),
        isNull(eqyReeferContainers.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Maintenance Repairs
// ==========================================

export async function listMaintenanceRepairs({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(eqyMaintenanceRepairs.tenantId, tenantId),
    isNull(eqyMaintenanceRepairs.deletedAt),
  ];
  if (search)
    conditions.push(ilike(eqyMaintenanceRepairs.mnrReference, `%${search}%`));
  if (status) conditions.push(eq(eqyMaintenanceRepairs.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc)     conditions.push(cursorCondition(eqyMaintenanceRepairs.createdAt, eqyMaintenanceRepairs.id, cc)); }

  const results = await db
    .select()
    .from(eqyMaintenanceRepairs)
    .where(and(...conditions))
    .orderBy(desc(eqyMaintenanceRepairs.createdAt), desc(eqyMaintenanceRepairs.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getMaintenanceRepair(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(eqyMaintenanceRepairs)
    .where(
      and(
        eq(eqyMaintenanceRepairs.id, id),
        eq(eqyMaintenanceRepairs.tenantId, tenantId),
        isNull(eqyMaintenanceRepairs.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Yard Slots
// ==========================================

export async function listYardSlots({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(eqyYardSlots.tenantId, tenantId),
    isNull(eqyYardSlots.deletedAt),
  ];
  if (search)
    conditions.push(ilike(eqyYardSlots.yardName, `%${search}%`));
  if (status) conditions.push(eq(eqyYardSlots.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc)     conditions.push(cursorCondition(eqyYardSlots.createdAt, eqyYardSlots.id, cc)); }

  const results = await db
    .select()
    .from(eqyYardSlots)
    .where(and(...conditions))
    .orderBy(desc(eqyYardSlots.createdAt), desc(eqyYardSlots.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getYardSlot(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(eqyYardSlots)
    .where(
      and(
        eq(eqyYardSlots.id, id),
        eq(eqyYardSlots.tenantId, tenantId),
        isNull(eqyYardSlots.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Gate Movements
// ==========================================

export async function listGateMovements({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(eqyGateMovements.tenantId, tenantId),
    isNull(eqyGateMovements.deletedAt),
  ];
  if (search)
    conditions.push(ilike(eqyGateMovements.containerNumber, `%${search}%`));
  if (status) conditions.push(eq(eqyGateMovements.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc)     conditions.push(cursorCondition(eqyGateMovements.createdAt, eqyGateMovements.id, cc)); }

  const results = await db
    .select()
    .from(eqyGateMovements)
    .where(and(...conditions))
    .orderBy(desc(eqyGateMovements.createdAt), desc(eqyGateMovements.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getGateMovement(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(eqyGateMovements)
    .where(
      and(
        eq(eqyGateMovements.id, id),
        eq(eqyGateMovements.tenantId, tenantId),
        isNull(eqyGateMovements.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Equipment Interchanges
// ==========================================

export async function listEquipmentInterchanges({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(eqyEquipmentInterchanges.tenantId, tenantId),
    isNull(eqyEquipmentInterchanges.deletedAt),
  ];
  if (search)
    conditions.push(
      ilike(eqyEquipmentInterchanges.interchangeReference, `%${search}%`)
    );
  if (status) conditions.push(eq(eqyEquipmentInterchanges.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc)     conditions.push(cursorCondition(eqyEquipmentInterchanges.createdAt, eqyEquipmentInterchanges.id, cc)); }

  const results = await db
    .select()
    .from(eqyEquipmentInterchanges)
    .where(and(...conditions))
    .orderBy(desc(eqyEquipmentInterchanges.createdAt), desc(eqyEquipmentInterchanges.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getEquipmentInterchange(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(eqyEquipmentInterchanges)
    .where(
      and(
        eq(eqyEquipmentInterchanges.id, id),
        eq(eqyEquipmentInterchanges.tenantId, tenantId),
        isNull(eqyEquipmentInterchanges.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// On-Hire Off-Hire
// ==========================================

export async function listOnHireOffHire({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(eqyOnHireOffHire.tenantId, tenantId),
    isNull(eqyOnHireOffHire.deletedAt),
  ];
  if (search)
    conditions.push(ilike(eqyOnHireOffHire.contractReference, `%${search}%`));
  if (status) conditions.push(eq(eqyOnHireOffHire.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc)     conditions.push(cursorCondition(eqyOnHireOffHire.createdAt, eqyOnHireOffHire.id, cc)); }

  const results = await db
    .select()
    .from(eqyOnHireOffHire)
    .where(and(...conditions))
    .orderBy(desc(eqyOnHireOffHire.createdAt), desc(eqyOnHireOffHire.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getOnHireOffHireRecord(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(eqyOnHireOffHire)
    .where(
      and(
        eq(eqyOnHireOffHire.id, id),
        eq(eqyOnHireOffHire.tenantId, tenantId),
        isNull(eqyOnHireOffHire.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Container Surveys
// ==========================================

export async function listContainerSurveys({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(eqyContainerSurveys.tenantId, tenantId),
    isNull(eqyContainerSurveys.deletedAt),
  ];
  if (search)
    conditions.push(ilike(eqyContainerSurveys.containerNumber, `%${search}%`));
  if (status) conditions.push(eq(eqyContainerSurveys.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc)     conditions.push(cursorCondition(eqyContainerSurveys.createdAt, eqyContainerSurveys.id, cc)); }

  const results = await db
    .select()
    .from(eqyContainerSurveys)
    .where(and(...conditions))
    .orderBy(desc(eqyContainerSurveys.createdAt), desc(eqyContainerSurveys.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getContainerSurvey(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(eqyContainerSurveys)
    .where(
      and(
        eq(eqyContainerSurveys.id, id),
        eq(eqyContainerSurveys.tenantId, tenantId),
        isNull(eqyContainerSurveys.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Leased Containers
// ==========================================

export async function listLeasedContainers({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(eqyLeasedContainers.tenantId, tenantId),
    isNull(eqyLeasedContainers.deletedAt),
  ];
  if (search)
    conditions.push(ilike(eqyLeasedContainers.leaseReference, `%${search}%`));
  if (status) conditions.push(eq(eqyLeasedContainers.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc)     conditions.push(cursorCondition(eqyLeasedContainers.createdAt, eqyLeasedContainers.id, cc)); }

  const results = await db
    .select()
    .from(eqyLeasedContainers)
    .where(and(...conditions))
    .orderBy(desc(eqyLeasedContainers.createdAt), desc(eqyLeasedContainers.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getLeasedContainer(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(eqyLeasedContainers)
    .where(
      and(
        eq(eqyLeasedContainers.id, id),
        eq(eqyLeasedContainers.tenantId, tenantId),
        isNull(eqyLeasedContainers.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Availability Plans
// ==========================================

export async function listAvailabilityPlans({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(eqyAvailabilityPlans.tenantId, tenantId),
    isNull(eqyAvailabilityPlans.deletedAt),
  ];
  if (search)
    conditions.push(ilike(eqyAvailabilityPlans.planReference, `%${search}%`));
  if (status) conditions.push(eq(eqyAvailabilityPlans.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc)     conditions.push(cursorCondition(eqyAvailabilityPlans.createdAt, eqyAvailabilityPlans.id, cc)); }

  const results = await db
    .select()
    .from(eqyAvailabilityPlans)
    .where(and(...conditions))
    .orderBy(desc(eqyAvailabilityPlans.createdAt), desc(eqyAvailabilityPlans.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getAvailabilityPlan(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(eqyAvailabilityPlans)
    .where(
      and(
        eq(eqyAvailabilityPlans.id, id),
        eq(eqyAvailabilityPlans.tenantId, tenantId),
        isNull(eqyAvailabilityPlans.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Repositioning Optimizations
// ==========================================

export async function listRepositioningOptimizations({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(eqyRepositioningOptimizations.tenantId, tenantId),
    isNull(eqyRepositioningOptimizations.deletedAt),
  ];
  if (search)
    conditions.push(
      ilike(eqyRepositioningOptimizations.optimizationRunId, `%${search}%`)
    );
  if (status)
    conditions.push(eq(eqyRepositioningOptimizations.status, status));
  if (cursor)
    conditions.push(
      cursorCondition(eqyRepositioningOptimizations.createdAt, eqyRepositioningOptimizations.id, parseCompoundCursor(cursor)!)
    );

  const results = await db
    .select()
    .from(eqyRepositioningOptimizations)
    .where(and(...conditions))
    .orderBy(desc(eqyRepositioningOptimizations.createdAt), desc(eqyRepositioningOptimizations.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getRepositioningOptimization(
  id: string,
  tenantId: string
) {
  const [record] = await db
    .select()
    .from(eqyRepositioningOptimizations)
    .where(
      and(
        eq(eqyRepositioningOptimizations.id, id),
        eq(eqyRepositioningOptimizations.tenantId, tenantId),
        isNull(eqyRepositioningOptimizations.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}
