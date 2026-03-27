import { db } from "@/lib/db";
import { eq, and, isNull, ilike, lt, desc } from "drizzle-orm";
import {
  cpmTariffs,
  cpmTariffRates,
  cpmSpecialRates,
  cpmSurcharges,
  cpmDetentionDemurrage,
  cpmYieldTargets,
  cpmRateBenchmarks,
  cpmProfitabilityAnalyses,
  cpmAiPricingModels,
  cpmVsaSlotRates,
  cpmDeadFreightRecords,
  cpmRevenueLeakages,
  cpmPricingApprovals,
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
// Tariffs
// ==========================================

export async function listTariffs({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(cpmTariffs.tenantId, tenantId),
    isNull(cpmTariffs.deletedAt),
  ];
  if (search) conditions.push(ilike(cpmTariffs.tariffName, `%${search}%`));
  if (status) conditions.push(eq(cpmTariffs.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(cpmTariffs.createdAt, cpmTariffs.id, cc)); }

  const results = await db
    .select()
    .from(cpmTariffs)
    .where(and(...conditions))
    .orderBy(desc(cpmTariffs.createdAt), desc(cpmTariffs.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getTariff(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(cpmTariffs)
    .where(
      and(
        eq(cpmTariffs.id, id),
        eq(cpmTariffs.tenantId, tenantId),
        isNull(cpmTariffs.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Tariff Rates
// ==========================================

export async function listTariffRates({
  tenantId,
  search,
  cursor,
  limit = 50,
}: ListParams, tariffId?: string) {
  const conditions = [
    eq(cpmTariffRates.tenantId, tenantId),
    isNull(cpmTariffRates.deletedAt),
  ];
  if (tariffId) conditions.push(eq(cpmTariffRates.tariffId, tariffId));
  if (search) conditions.push(ilike(cpmTariffRates.chargeName, `%${search}%`));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(cpmTariffRates.createdAt, cpmTariffRates.id, cc)); }

  const results = await db
    .select()
    .from(cpmTariffRates)
    .where(and(...conditions))
    .orderBy(desc(cpmTariffRates.createdAt), desc(cpmTariffRates.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getTariffRate(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(cpmTariffRates)
    .where(
      and(
        eq(cpmTariffRates.id, id),
        eq(cpmTariffRates.tenantId, tenantId),
        isNull(cpmTariffRates.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Special Rates
// ==========================================

export async function listSpecialRates({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(cpmSpecialRates.tenantId, tenantId),
    isNull(cpmSpecialRates.deletedAt),
  ];
  if (search) conditions.push(ilike(cpmSpecialRates.rateName, `%${search}%`));
  if (status) conditions.push(eq(cpmSpecialRates.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(cpmSpecialRates.createdAt, cpmSpecialRates.id, cc)); }

  const results = await db
    .select()
    .from(cpmSpecialRates)
    .where(and(...conditions))
    .orderBy(desc(cpmSpecialRates.createdAt), desc(cpmSpecialRates.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getSpecialRate(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(cpmSpecialRates)
    .where(
      and(
        eq(cpmSpecialRates.id, id),
        eq(cpmSpecialRates.tenantId, tenantId),
        isNull(cpmSpecialRates.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Surcharges
// ==========================================

export async function listSurcharges({
  tenantId,
  search,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(cpmSurcharges.tenantId, tenantId),
    isNull(cpmSurcharges.deletedAt),
  ];
  if (search) conditions.push(ilike(cpmSurcharges.surchargeName, `%${search}%`));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(cpmSurcharges.createdAt, cpmSurcharges.id, cc)); }

  const results = await db
    .select()
    .from(cpmSurcharges)
    .where(and(...conditions))
    .orderBy(desc(cpmSurcharges.createdAt), desc(cpmSurcharges.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getSurcharge(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(cpmSurcharges)
    .where(
      and(
        eq(cpmSurcharges.id, id),
        eq(cpmSurcharges.tenantId, tenantId),
        isNull(cpmSurcharges.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Detention & Demurrage
// ==========================================

export async function listDetentionDemurrage({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(cpmDetentionDemurrage.tenantId, tenantId),
    isNull(cpmDetentionDemurrage.deletedAt),
  ];
  if (search) conditions.push(ilike(cpmDetentionDemurrage.tariffName, `%${search}%`));
  if (status) conditions.push(eq(cpmDetentionDemurrage.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(cpmDetentionDemurrage.createdAt, cpmDetentionDemurrage.id, cc)); }

  const results = await db
    .select()
    .from(cpmDetentionDemurrage)
    .where(and(...conditions))
    .orderBy(desc(cpmDetentionDemurrage.createdAt), desc(cpmDetentionDemurrage.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getDetentionDemurrageRecord(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(cpmDetentionDemurrage)
    .where(
      and(
        eq(cpmDetentionDemurrage.id, id),
        eq(cpmDetentionDemurrage.tenantId, tenantId),
        isNull(cpmDetentionDemurrage.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Yield Targets
// ==========================================

export async function listYieldTargets({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(cpmYieldTargets.tenantId, tenantId),
    isNull(cpmYieldTargets.deletedAt),
  ];
  if (search) conditions.push(ilike(cpmYieldTargets.targetName, `%${search}%`));
  if (status) conditions.push(eq(cpmYieldTargets.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(cpmYieldTargets.createdAt, cpmYieldTargets.id, cc)); }

  const results = await db
    .select()
    .from(cpmYieldTargets)
    .where(and(...conditions))
    .orderBy(desc(cpmYieldTargets.createdAt), desc(cpmYieldTargets.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getYieldTarget(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(cpmYieldTargets)
    .where(
      and(
        eq(cpmYieldTargets.id, id),
        eq(cpmYieldTargets.tenantId, tenantId),
        isNull(cpmYieldTargets.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Rate Benchmarks
// ==========================================

export async function listRateBenchmarks({
  tenantId,
  search,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(cpmRateBenchmarks.tenantId, tenantId),
    isNull(cpmRateBenchmarks.deletedAt),
  ];
  if (search) conditions.push(ilike(cpmRateBenchmarks.benchmarkName, `%${search}%`));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(cpmRateBenchmarks.createdAt, cpmRateBenchmarks.id, cc)); }

  const results = await db
    .select()
    .from(cpmRateBenchmarks)
    .where(and(...conditions))
    .orderBy(desc(cpmRateBenchmarks.createdAt), desc(cpmRateBenchmarks.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getRateBenchmark(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(cpmRateBenchmarks)
    .where(
      and(
        eq(cpmRateBenchmarks.id, id),
        eq(cpmRateBenchmarks.tenantId, tenantId),
        isNull(cpmRateBenchmarks.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Profitability Analyses
// ==========================================

export async function listProfitabilityAnalyses({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(cpmProfitabilityAnalyses.tenantId, tenantId),
    isNull(cpmProfitabilityAnalyses.deletedAt),
  ];
  if (search) conditions.push(ilike(cpmProfitabilityAnalyses.analysisName, `%${search}%`));
  if (status) conditions.push(eq(cpmProfitabilityAnalyses.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(cpmProfitabilityAnalyses.createdAt, cpmProfitabilityAnalyses.id, cc)); }

  const results = await db
    .select()
    .from(cpmProfitabilityAnalyses)
    .where(and(...conditions))
    .orderBy(desc(cpmProfitabilityAnalyses.createdAt), desc(cpmProfitabilityAnalyses.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getProfitabilityAnalysis(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(cpmProfitabilityAnalyses)
    .where(
      and(
        eq(cpmProfitabilityAnalyses.id, id),
        eq(cpmProfitabilityAnalyses.tenantId, tenantId),
        isNull(cpmProfitabilityAnalyses.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// AI Pricing Models
// ==========================================

export async function listAiPricingModels({
  tenantId,
  search,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(cpmAiPricingModels.tenantId, tenantId),
    isNull(cpmAiPricingModels.deletedAt),
  ];
  if (search) conditions.push(ilike(cpmAiPricingModels.modelName, `%${search}%`));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(cpmAiPricingModels.createdAt, cpmAiPricingModels.id, cc)); }

  const results = await db
    .select()
    .from(cpmAiPricingModels)
    .where(and(...conditions))
    .orderBy(desc(cpmAiPricingModels.createdAt), desc(cpmAiPricingModels.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getAiPricingModel(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(cpmAiPricingModels)
    .where(
      and(
        eq(cpmAiPricingModels.id, id),
        eq(cpmAiPricingModels.tenantId, tenantId),
        isNull(cpmAiPricingModels.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// VSA Slot Rates
// ==========================================

export async function listVsaSlotRates({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(cpmVsaSlotRates.tenantId, tenantId),
    isNull(cpmVsaSlotRates.deletedAt),
  ];
  if (search) conditions.push(ilike(cpmVsaSlotRates.vsaPartner, `%${search}%`));
  if (status) conditions.push(eq(cpmVsaSlotRates.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(cpmVsaSlotRates.createdAt, cpmVsaSlotRates.id, cc)); }

  const results = await db
    .select()
    .from(cpmVsaSlotRates)
    .where(and(...conditions))
    .orderBy(desc(cpmVsaSlotRates.createdAt), desc(cpmVsaSlotRates.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getVsaSlotRate(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(cpmVsaSlotRates)
    .where(
      and(
        eq(cpmVsaSlotRates.id, id),
        eq(cpmVsaSlotRates.tenantId, tenantId),
        isNull(cpmVsaSlotRates.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Dead Freight Records
// ==========================================

export async function listDeadFreightRecords({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(cpmDeadFreightRecords.tenantId, tenantId),
    isNull(cpmDeadFreightRecords.deletedAt),
  ];
  if (search) conditions.push(ilike(cpmDeadFreightRecords.recordReference, `%${search}%`));
  if (status) conditions.push(eq(cpmDeadFreightRecords.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(cpmDeadFreightRecords.createdAt, cpmDeadFreightRecords.id, cc)); }

  const results = await db
    .select()
    .from(cpmDeadFreightRecords)
    .where(and(...conditions))
    .orderBy(desc(cpmDeadFreightRecords.createdAt), desc(cpmDeadFreightRecords.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getDeadFreightRecord(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(cpmDeadFreightRecords)
    .where(
      and(
        eq(cpmDeadFreightRecords.id, id),
        eq(cpmDeadFreightRecords.tenantId, tenantId),
        isNull(cpmDeadFreightRecords.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Revenue Leakages
// ==========================================

export async function listRevenueLeakages({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(cpmRevenueLeakages.tenantId, tenantId),
    isNull(cpmRevenueLeakages.deletedAt),
  ];
  if (search) conditions.push(ilike(cpmRevenueLeakages.leakageReference, `%${search}%`));
  if (status) conditions.push(eq(cpmRevenueLeakages.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(cpmRevenueLeakages.createdAt, cpmRevenueLeakages.id, cc)); }

  const results = await db
    .select()
    .from(cpmRevenueLeakages)
    .where(and(...conditions))
    .orderBy(desc(cpmRevenueLeakages.createdAt), desc(cpmRevenueLeakages.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getRevenueLeakage(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(cpmRevenueLeakages)
    .where(
      and(
        eq(cpmRevenueLeakages.id, id),
        eq(cpmRevenueLeakages.tenantId, tenantId),
        isNull(cpmRevenueLeakages.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}

// ==========================================
// Pricing Approvals
// ==========================================

export async function listPricingApprovals({
  tenantId,
  search,
  status,
  cursor,
  limit = 50,
}: ListParams) {
  const conditions = [
    eq(cpmPricingApprovals.tenantId, tenantId),
    isNull(cpmPricingApprovals.deletedAt),
  ];
  if (search) conditions.push(ilike(cpmPricingApprovals.approvalReference, `%${search}%`));
  if (status) conditions.push(eq(cpmPricingApprovals.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(cpmPricingApprovals.createdAt, cpmPricingApprovals.id, cc)); }

  const results = await db
    .select()
    .from(cpmPricingApprovals)
    .where(and(...conditions))
    .orderBy(desc(cpmPricingApprovals.createdAt), desc(cpmPricingApprovals.id))
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { data, meta: { cursor: nextCursor, hasMore } };
}

export async function getPricingApproval(id: string, tenantId: string) {
  const [record] = await db
    .select()
    .from(cpmPricingApprovals)
    .where(
      and(
        eq(cpmPricingApprovals.id, id),
        eq(cpmPricingApprovals.tenantId, tenantId),
        isNull(cpmPricingApprovals.deletedAt)
      )
    )
    .limit(1);
  return record ?? null;
}
