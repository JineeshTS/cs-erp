import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  pttTerminalHandlingCharges,
  pttPortDuesWharfages,
  pttPilotageTowageCharges,
  pttStorageDemurrageTariffs,
  pttTariffComparisons,
  pttInvoiceValidations,
  pttCostOptimizations,
  pttBudgetPlannings,
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
// Terminal Handling Charge THC Management
// ==========================================
export async function listTerminalHandlingCharges({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pttTerminalHandlingCharges.tenantId, tenantId), isNull(pttTerminalHandlingCharges.deletedAt)];
  if (search) conditions.push(or(ilike(pttTerminalHandlingCharges.chargeRef, `%${search}%`), ilike(pttTerminalHandlingCharges.portName, `%${search}%`))!);
  if (status) conditions.push(eq(pttTerminalHandlingCharges.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(pttTerminalHandlingCharges.createdAt, pttTerminalHandlingCharges.id, cc)); }
  const results = await db.select().from(pttTerminalHandlingCharges).where(and(...conditions)).orderBy(desc(pttTerminalHandlingCharges.createdAt), desc(pttTerminalHandlingCharges.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getTerminalHandlingCharge(id: string, tenantId: string) {
  const [record] = await db.select().from(pttTerminalHandlingCharges).where(and(eq(pttTerminalHandlingCharges.id, id), eq(pttTerminalHandlingCharges.tenantId, tenantId), isNull(pttTerminalHandlingCharges.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Port Dues & Wharfage Calculation
// ==========================================
export async function listPortDuesWharfages({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pttPortDuesWharfages.tenantId, tenantId), isNull(pttPortDuesWharfages.deletedAt)];
  if (search) conditions.push(or(ilike(pttPortDuesWharfages.duesRef, `%${search}%`), ilike(pttPortDuesWharfages.portName, `%${search}%`))!);
  if (status) conditions.push(eq(pttPortDuesWharfages.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(pttPortDuesWharfages.createdAt, pttPortDuesWharfages.id, cc)); }
  const results = await db.select().from(pttPortDuesWharfages).where(and(...conditions)).orderBy(desc(pttPortDuesWharfages.createdAt), desc(pttPortDuesWharfages.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getPortDuesWharfage(id: string, tenantId: string) {
  const [record] = await db.select().from(pttPortDuesWharfages).where(and(eq(pttPortDuesWharfages.id, id), eq(pttPortDuesWharfages.tenantId, tenantId), isNull(pttPortDuesWharfages.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Pilotage Towage & Mooring Charges
// ==========================================
export async function listPilotageTowageCharges({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pttPilotageTowageCharges.tenantId, tenantId), isNull(pttPilotageTowageCharges.deletedAt)];
  if (search) conditions.push(or(ilike(pttPilotageTowageCharges.chargeRef, `%${search}%`), ilike(pttPilotageTowageCharges.portName, `%${search}%`))!);
  if (status) conditions.push(eq(pttPilotageTowageCharges.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(pttPilotageTowageCharges.createdAt, pttPilotageTowageCharges.id, cc)); }
  const results = await db.select().from(pttPilotageTowageCharges).where(and(...conditions)).orderBy(desc(pttPilotageTowageCharges.createdAt), desc(pttPilotageTowageCharges.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getPilotageTowageCharge(id: string, tenantId: string) {
  const [record] = await db.select().from(pttPilotageTowageCharges).where(and(eq(pttPilotageTowageCharges.id, id), eq(pttPilotageTowageCharges.tenantId, tenantId), isNull(pttPilotageTowageCharges.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Storage & Demurrage Tariff
// ==========================================
export async function listStorageDemurrageTariffs({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pttStorageDemurrageTariffs.tenantId, tenantId), isNull(pttStorageDemurrageTariffs.deletedAt)];
  if (search) conditions.push(or(ilike(pttStorageDemurrageTariffs.tariffRef, `%${search}%`), ilike(pttStorageDemurrageTariffs.portName, `%${search}%`))!);
  if (status) conditions.push(eq(pttStorageDemurrageTariffs.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(pttStorageDemurrageTariffs.createdAt, pttStorageDemurrageTariffs.id, cc)); }
  const results = await db.select().from(pttStorageDemurrageTariffs).where(and(...conditions)).orderBy(desc(pttStorageDemurrageTariffs.createdAt), desc(pttStorageDemurrageTariffs.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getStorageDemurrageTariff(id: string, tenantId: string) {
  const [record] = await db.select().from(pttStorageDemurrageTariffs).where(and(eq(pttStorageDemurrageTariffs.id, id), eq(pttStorageDemurrageTariffs.tenantId, tenantId), isNull(pttStorageDemurrageTariffs.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Port Tariff Comparison & Benchmarking
// ==========================================
export async function listTariffComparisons({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pttTariffComparisons.tenantId, tenantId), isNull(pttTariffComparisons.deletedAt)];
  if (search) conditions.push(or(ilike(pttTariffComparisons.comparisonRef, `%${search}%`), ilike(pttTariffComparisons.basePortName, `%${search}%`))!);
  if (status) conditions.push(eq(pttTariffComparisons.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(pttTariffComparisons.createdAt, pttTariffComparisons.id, cc)); }
  const results = await db.select().from(pttTariffComparisons).where(and(...conditions)).orderBy(desc(pttTariffComparisons.createdAt), desc(pttTariffComparisons.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getTariffComparison(id: string, tenantId: string) {
  const [record] = await db.select().from(pttTariffComparisons).where(and(eq(pttTariffComparisons.id, id), eq(pttTariffComparisons.tenantId, tenantId), isNull(pttTariffComparisons.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Terminal Invoice Validation & Dispute
// ==========================================
export async function listInvoiceValidations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pttInvoiceValidations.tenantId, tenantId), isNull(pttInvoiceValidations.deletedAt)];
  if (search) conditions.push(or(ilike(pttInvoiceValidations.validationRef, `%${search}%`), ilike(pttInvoiceValidations.terminalName, `%${search}%`))!);
  if (status) conditions.push(eq(pttInvoiceValidations.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(pttInvoiceValidations.createdAt, pttInvoiceValidations.id, cc)); }
  const results = await db.select().from(pttInvoiceValidations).where(and(...conditions)).orderBy(desc(pttInvoiceValidations.createdAt), desc(pttInvoiceValidations.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getInvoiceValidation(id: string, tenantId: string) {
  const [record] = await db.select().from(pttInvoiceValidations).where(and(eq(pttInvoiceValidations.id, id), eq(pttInvoiceValidations.tenantId, tenantId), isNull(pttInvoiceValidations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// AI Port Cost Optimization Recommendations
// ==========================================
export async function listCostOptimizations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pttCostOptimizations.tenantId, tenantId), isNull(pttCostOptimizations.deletedAt)];
  if (search) conditions.push(or(ilike(pttCostOptimizations.optimizationRef, `%${search}%`), ilike(pttCostOptimizations.portName, `%${search}%`))!);
  if (status) conditions.push(eq(pttCostOptimizations.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(pttCostOptimizations.createdAt, pttCostOptimizations.id, cc)); }
  const results = await db.select().from(pttCostOptimizations).where(and(...conditions)).orderBy(desc(pttCostOptimizations.createdAt), desc(pttCostOptimizations.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getCostOptimization(id: string, tenantId: string) {
  const [record] = await db.select().from(pttCostOptimizations).where(and(eq(pttCostOptimizations.id, id), eq(pttCostOptimizations.tenantId, tenantId), isNull(pttCostOptimizations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Port Budget Planning & Control
// ==========================================
export async function listBudgetPlannings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(pttBudgetPlannings.tenantId, tenantId), isNull(pttBudgetPlannings.deletedAt)];
  if (search) conditions.push(or(ilike(pttBudgetPlannings.budgetRef, `%${search}%`), ilike(pttBudgetPlannings.portName, `%${search}%`))!);
  if (status) conditions.push(eq(pttBudgetPlannings.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(pttBudgetPlannings.createdAt, pttBudgetPlannings.id, cc)); }
  const results = await db.select().from(pttBudgetPlannings).where(and(...conditions)).orderBy(desc(pttBudgetPlannings.createdAt), desc(pttBudgetPlannings.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getBudgetPlanning(id: string, tenantId: string) {
  const [record] = await db.select().from(pttBudgetPlannings).where(and(eq(pttBudgetPlannings.id, id), eq(pttBudgetPlannings.tenantId, tenantId), isNull(pttBudgetPlannings.deletedAt))).limit(1);
  return record ?? null;
}
