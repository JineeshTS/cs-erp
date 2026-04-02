import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  tcmBankAccounts,
  tcmCashPositions,
  tcmBankReconciliations,
  tcmCashPoolingSweeps,
  tcmFxHedgingExposures,
  tcmLettersOfCredit,
  tcmBankGuarantees,
  tcmIntercompanyLoans,
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
// Bank Accounts
// ==========================================
export async function listBankAccounts({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(tcmBankAccounts.tenantId, tenantId), isNull(tcmBankAccounts.deletedAt)];
  if (search) conditions.push(or(ilike(tcmBankAccounts.accountRef, `%${search}%`), ilike(tcmBankAccounts.bankName, `%${search}%`))!);
  if (status) conditions.push(eq(tcmBankAccounts.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(tcmBankAccounts.createdAt, tcmBankAccounts.id, cc)); }
  const results = await db.select().from(tcmBankAccounts).where(and(...conditions)).orderBy(desc(tcmBankAccounts.createdAt), desc(tcmBankAccounts.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getBankAccount(id: string, tenantId: string) {
  const [record] = await db.select().from(tcmBankAccounts).where(and(eq(tcmBankAccounts.id, id), eq(tcmBankAccounts.tenantId, tenantId), isNull(tcmBankAccounts.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Cash Positions
// ==========================================
export async function listCashPositions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(tcmCashPositions.tenantId, tenantId), isNull(tcmCashPositions.deletedAt)];
  if (search) conditions.push(ilike(tcmCashPositions.positionRef, `%${search}%`));
  if (status) conditions.push(eq(tcmCashPositions.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(tcmCashPositions.createdAt, tcmCashPositions.id, cc)); }
  const results = await db.select().from(tcmCashPositions).where(and(...conditions)).orderBy(desc(tcmCashPositions.createdAt), desc(tcmCashPositions.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getCashPosition(id: string, tenantId: string) {
  const [record] = await db.select().from(tcmCashPositions).where(and(eq(tcmCashPositions.id, id), eq(tcmCashPositions.tenantId, tenantId), isNull(tcmCashPositions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Bank Reconciliations
// ==========================================
export async function listBankReconciliations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(tcmBankReconciliations.tenantId, tenantId), isNull(tcmBankReconciliations.deletedAt)];
  if (search) conditions.push(or(ilike(tcmBankReconciliations.reconciliationRef, `%${search}%`), ilike(tcmBankReconciliations.bankName, `%${search}%`))!);
  if (status) conditions.push(eq(tcmBankReconciliations.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(tcmBankReconciliations.createdAt, tcmBankReconciliations.id, cc)); }
  const results = await db.select().from(tcmBankReconciliations).where(and(...conditions)).orderBy(desc(tcmBankReconciliations.createdAt), desc(tcmBankReconciliations.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getBankReconciliation(id: string, tenantId: string) {
  const [record] = await db.select().from(tcmBankReconciliations).where(and(eq(tcmBankReconciliations.id, id), eq(tcmBankReconciliations.tenantId, tenantId), isNull(tcmBankReconciliations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Cash Pooling & Sweeps
// ==========================================
export async function listCashPoolingSweeps({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(tcmCashPoolingSweeps.tenantId, tenantId), isNull(tcmCashPoolingSweeps.deletedAt)];
  if (search) conditions.push(or(ilike(tcmCashPoolingSweeps.sweepRef, `%${search}%`), ilike(tcmCashPoolingSweeps.poolName, `%${search}%`))!);
  if (status) conditions.push(eq(tcmCashPoolingSweeps.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(tcmCashPoolingSweeps.createdAt, tcmCashPoolingSweeps.id, cc)); }
  const results = await db.select().from(tcmCashPoolingSweeps).where(and(...conditions)).orderBy(desc(tcmCashPoolingSweeps.createdAt), desc(tcmCashPoolingSweeps.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getCashPoolingSweep(id: string, tenantId: string) {
  const [record] = await db.select().from(tcmCashPoolingSweeps).where(and(eq(tcmCashPoolingSweeps.id, id), eq(tcmCashPoolingSweeps.tenantId, tenantId), isNull(tcmCashPoolingSweeps.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// FX Hedging & Exposures
// ==========================================
export async function listFxHedgingExposures({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(tcmFxHedgingExposures.tenantId, tenantId), isNull(tcmFxHedgingExposures.deletedAt)];
  if (search) conditions.push(or(ilike(tcmFxHedgingExposures.hedgeRef, `%${search}%`), ilike(tcmFxHedgingExposures.counterparty, `%${search}%`))!);
  if (status) conditions.push(eq(tcmFxHedgingExposures.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(tcmFxHedgingExposures.createdAt, tcmFxHedgingExposures.id, cc)); }
  const results = await db.select().from(tcmFxHedgingExposures).where(and(...conditions)).orderBy(desc(tcmFxHedgingExposures.createdAt), desc(tcmFxHedgingExposures.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getFxHedgingExposure(id: string, tenantId: string) {
  const [record] = await db.select().from(tcmFxHedgingExposures).where(and(eq(tcmFxHedgingExposures.id, id), eq(tcmFxHedgingExposures.tenantId, tenantId), isNull(tcmFxHedgingExposures.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Letters of Credit
// ==========================================
export async function listLettersOfCredit({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(tcmLettersOfCredit.tenantId, tenantId), isNull(tcmLettersOfCredit.deletedAt)];
  if (search) conditions.push(or(ilike(tcmLettersOfCredit.lcRef, `%${search}%`), ilike(tcmLettersOfCredit.beneficiary, `%${search}%`))!);
  if (status) conditions.push(eq(tcmLettersOfCredit.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(tcmLettersOfCredit.createdAt, tcmLettersOfCredit.id, cc)); }
  const results = await db.select().from(tcmLettersOfCredit).where(and(...conditions)).orderBy(desc(tcmLettersOfCredit.createdAt), desc(tcmLettersOfCredit.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getLetterOfCredit(id: string, tenantId: string) {
  const [record] = await db.select().from(tcmLettersOfCredit).where(and(eq(tcmLettersOfCredit.id, id), eq(tcmLettersOfCredit.tenantId, tenantId), isNull(tcmLettersOfCredit.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Bank Guarantees
// ==========================================
export async function listBankGuarantees({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(tcmBankGuarantees.tenantId, tenantId), isNull(tcmBankGuarantees.deletedAt)];
  if (search) conditions.push(or(ilike(tcmBankGuarantees.bgRef, `%${search}%`), ilike(tcmBankGuarantees.beneficiary, `%${search}%`))!);
  if (status) conditions.push(eq(tcmBankGuarantees.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(tcmBankGuarantees.createdAt, tcmBankGuarantees.id, cc)); }
  const results = await db.select().from(tcmBankGuarantees).where(and(...conditions)).orderBy(desc(tcmBankGuarantees.createdAt), desc(tcmBankGuarantees.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getBankGuarantee(id: string, tenantId: string) {
  const [record] = await db.select().from(tcmBankGuarantees).where(and(eq(tcmBankGuarantees.id, id), eq(tcmBankGuarantees.tenantId, tenantId), isNull(tcmBankGuarantees.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Intercompany Loans
// ==========================================
export async function listIntercompanyLoans({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(tcmIntercompanyLoans.tenantId, tenantId), isNull(tcmIntercompanyLoans.deletedAt)];
  if (search) conditions.push(or(ilike(tcmIntercompanyLoans.loanRef, `%${search}%`), ilike(tcmIntercompanyLoans.borrowerEntity, `%${search}%`))!);
  if (status) conditions.push(eq(tcmIntercompanyLoans.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(tcmIntercompanyLoans.createdAt, tcmIntercompanyLoans.id, cc)); }
  const results = await db.select().from(tcmIntercompanyLoans).where(and(...conditions)).orderBy(desc(tcmIntercompanyLoans.createdAt), desc(tcmIntercompanyLoans.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getIntercompanyLoan(id: string, tenantId: string) {
  const [record] = await db.select().from(tcmIntercompanyLoans).where(and(eq(tcmIntercompanyLoans.id, id), eq(tcmIntercompanyLoans.tenantId, tenantId), isNull(tcmIntercompanyLoans.deletedAt))).limit(1);
  return record ?? null;
}
