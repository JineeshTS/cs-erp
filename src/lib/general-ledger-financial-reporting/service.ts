import { and, eq, ilike, isNull, gt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  glfrChartOfAccounts,
  glfrJournalEntries,
  glfrPeriodClosures,
  glfrFinancialStatements,
  glfrSegmentReports,
  glfrConsolidatedStatements,
  glfrBudgets,
  glfrVarianceAnalyses,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Chart of Accounts
// ==========================================
export async function listChartOfAccounts({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(glfrChartOfAccounts.tenantId, tenantId), isNull(glfrChartOfAccounts.deletedAt)];
  if (search) conditions.push(or(ilike(glfrChartOfAccounts.accountCode, `%${search}%`), ilike(glfrChartOfAccounts.accountName, `%${search}%`))!);
  if (status) conditions.push(eq(glfrChartOfAccounts.status, status));
  if (cursor) conditions.push(gt(glfrChartOfAccounts.createdAt, new Date(cursor)));
  const results = await db.select().from(glfrChartOfAccounts).where(and(...conditions)).orderBy(desc(glfrChartOfAccounts.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getChartOfAccount(id: string, tenantId: string) {
  const [record] = await db.select().from(glfrChartOfAccounts).where(and(eq(glfrChartOfAccounts.id, id), eq(glfrChartOfAccounts.tenantId, tenantId), isNull(glfrChartOfAccounts.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Journal Entries
// ==========================================
export async function listJournalEntries({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(glfrJournalEntries.tenantId, tenantId), isNull(glfrJournalEntries.deletedAt)];
  if (search) conditions.push(or(ilike(glfrJournalEntries.entryRef, `%${search}%`), ilike(glfrJournalEntries.description, `%${search}%`))!);
  if (status) conditions.push(eq(glfrJournalEntries.status, status));
  if (cursor) conditions.push(gt(glfrJournalEntries.createdAt, new Date(cursor)));
  const results = await db.select().from(glfrJournalEntries).where(and(...conditions)).orderBy(desc(glfrJournalEntries.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getJournalEntry(id: string, tenantId: string) {
  const [record] = await db.select().from(glfrJournalEntries).where(and(eq(glfrJournalEntries.id, id), eq(glfrJournalEntries.tenantId, tenantId), isNull(glfrJournalEntries.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Period Closures
// ==========================================
export async function listPeriodClosures({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(glfrPeriodClosures.tenantId, tenantId), isNull(glfrPeriodClosures.deletedAt)];
  if (search) conditions.push(or(ilike(glfrPeriodClosures.closureRef, `%${search}%`), ilike(glfrPeriodClosures.periodName, `%${search}%`))!);
  if (status) conditions.push(eq(glfrPeriodClosures.status, status));
  if (cursor) conditions.push(gt(glfrPeriodClosures.createdAt, new Date(cursor)));
  const results = await db.select().from(glfrPeriodClosures).where(and(...conditions)).orderBy(desc(glfrPeriodClosures.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPeriodClosure(id: string, tenantId: string) {
  const [record] = await db.select().from(glfrPeriodClosures).where(and(eq(glfrPeriodClosures.id, id), eq(glfrPeriodClosures.tenantId, tenantId), isNull(glfrPeriodClosures.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Financial Statements
// ==========================================
export async function listFinancialStatements({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(glfrFinancialStatements.tenantId, tenantId), isNull(glfrFinancialStatements.deletedAt)];
  if (search) conditions.push(ilike(glfrFinancialStatements.statementRef, `%${search}%`));
  if (status) conditions.push(eq(glfrFinancialStatements.status, status));
  if (cursor) conditions.push(gt(glfrFinancialStatements.createdAt, new Date(cursor)));
  const results = await db.select().from(glfrFinancialStatements).where(and(...conditions)).orderBy(desc(glfrFinancialStatements.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getFinancialStatement(id: string, tenantId: string) {
  const [record] = await db.select().from(glfrFinancialStatements).where(and(eq(glfrFinancialStatements.id, id), eq(glfrFinancialStatements.tenantId, tenantId), isNull(glfrFinancialStatements.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Segment Reports
// ==========================================
export async function listSegmentReports({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(glfrSegmentReports.tenantId, tenantId), isNull(glfrSegmentReports.deletedAt)];
  if (search) conditions.push(or(ilike(glfrSegmentReports.reportRef, `%${search}%`), ilike(glfrSegmentReports.segmentName, `%${search}%`))!);
  if (status) conditions.push(eq(glfrSegmentReports.status, status));
  if (cursor) conditions.push(gt(glfrSegmentReports.createdAt, new Date(cursor)));
  const results = await db.select().from(glfrSegmentReports).where(and(...conditions)).orderBy(desc(glfrSegmentReports.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getSegmentReport(id: string, tenantId: string) {
  const [record] = await db.select().from(glfrSegmentReports).where(and(eq(glfrSegmentReports.id, id), eq(glfrSegmentReports.tenantId, tenantId), isNull(glfrSegmentReports.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Consolidated Statements
// ==========================================
export async function listConsolidatedStatements({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(glfrConsolidatedStatements.tenantId, tenantId), isNull(glfrConsolidatedStatements.deletedAt)];
  if (search) conditions.push(or(ilike(glfrConsolidatedStatements.consolidationRef, `%${search}%`), ilike(glfrConsolidatedStatements.parentEntity, `%${search}%`))!);
  if (status) conditions.push(eq(glfrConsolidatedStatements.status, status));
  if (cursor) conditions.push(gt(glfrConsolidatedStatements.createdAt, new Date(cursor)));
  const results = await db.select().from(glfrConsolidatedStatements).where(and(...conditions)).orderBy(desc(glfrConsolidatedStatements.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getConsolidatedStatement(id: string, tenantId: string) {
  const [record] = await db.select().from(glfrConsolidatedStatements).where(and(eq(glfrConsolidatedStatements.id, id), eq(glfrConsolidatedStatements.tenantId, tenantId), isNull(glfrConsolidatedStatements.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Budgets
// ==========================================
export async function listBudgets({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(glfrBudgets.tenantId, tenantId), isNull(glfrBudgets.deletedAt)];
  if (search) conditions.push(or(ilike(glfrBudgets.budgetRef, `%${search}%`), ilike(glfrBudgets.budgetName, `%${search}%`))!);
  if (status) conditions.push(eq(glfrBudgets.status, status));
  if (cursor) conditions.push(gt(glfrBudgets.createdAt, new Date(cursor)));
  const results = await db.select().from(glfrBudgets).where(and(...conditions)).orderBy(desc(glfrBudgets.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getBudget(id: string, tenantId: string) {
  const [record] = await db.select().from(glfrBudgets).where(and(eq(glfrBudgets.id, id), eq(glfrBudgets.tenantId, tenantId), isNull(glfrBudgets.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Variance Analyses
// ==========================================
export async function listVarianceAnalyses({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(glfrVarianceAnalyses.tenantId, tenantId), isNull(glfrVarianceAnalyses.deletedAt)];
  if (search) conditions.push(or(ilike(glfrVarianceAnalyses.analysisRef, `%${search}%`), ilike(glfrVarianceAnalyses.department, `%${search}%`))!);
  if (status) conditions.push(eq(glfrVarianceAnalyses.status, status));
  if (cursor) conditions.push(gt(glfrVarianceAnalyses.createdAt, new Date(cursor)));
  const results = await db.select().from(glfrVarianceAnalyses).where(and(...conditions)).orderBy(desc(glfrVarianceAnalyses.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getVarianceAnalysis(id: string, tenantId: string) {
  const [record] = await db.select().from(glfrVarianceAnalyses).where(and(eq(glfrVarianceAnalyses.id, id), eq(glfrVarianceAnalyses.tenantId, tenantId), isNull(glfrVarianceAnalyses.deletedAt))).limit(1);
  return record ?? null;
}
