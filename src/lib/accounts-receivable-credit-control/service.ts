import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  arccCustomerAccounts,
  arccCreditLimits,
  arccAgingReports,
  arccCashApplications,
  arccCollectionWorkflows,
  arccBadDebtProvisions,
  arccPaymentPredictions,
  arccCashFlowForecasts,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Customer Accounts
// ==========================================

export async function listCustomerAccounts({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(arccCustomerAccounts.tenantId, tenantId), isNull(arccCustomerAccounts.deletedAt)];
  if (search) conditions.push(or(ilike(arccCustomerAccounts.customerName, `%${search}%`), ilike(arccCustomerAccounts.accountNumber, `%${search}%`), ilike(arccCustomerAccounts.customerCode ?? "", `%${search}%`))!);
  if (status) conditions.push(eq(arccCustomerAccounts.accountStatus, status));
  if (cursor) conditions.push(lt(arccCustomerAccounts.createdAt, new Date(cursor)));
  const results = await db.select().from(arccCustomerAccounts).where(and(...conditions)).orderBy(desc(arccCustomerAccounts.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCustomerAccount(id: string, tenantId: string) {
  const [record] = await db.select().from(arccCustomerAccounts).where(and(eq(arccCustomerAccounts.id, id), eq(arccCustomerAccounts.tenantId, tenantId), isNull(arccCustomerAccounts.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Credit Limits
// ==========================================

export async function listCreditLimits({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(arccCreditLimits.tenantId, tenantId), isNull(arccCreditLimits.deletedAt)];
  if (search) conditions.push(or(ilike(arccCreditLimits.customerName, `%${search}%`), ilike(arccCreditLimits.accountNumber, `%${search}%`))!);
  if (status) conditions.push(eq(arccCreditLimits.status, status));
  if (cursor) conditions.push(lt(arccCreditLimits.createdAt, new Date(cursor)));
  const results = await db.select().from(arccCreditLimits).where(and(...conditions)).orderBy(desc(arccCreditLimits.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCreditLimit(id: string, tenantId: string) {
  const [record] = await db.select().from(arccCreditLimits).where(and(eq(arccCreditLimits.id, id), eq(arccCreditLimits.tenantId, tenantId), isNull(arccCreditLimits.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Aging Reports
// ==========================================

export async function listAgingReports({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(arccAgingReports.tenantId, tenantId), isNull(arccAgingReports.deletedAt)];
  if (search) conditions.push(or(ilike(arccAgingReports.reportRef, `%${search}%`), ilike(arccAgingReports.reportType, `%${search}%`))!);
  if (status) conditions.push(eq(arccAgingReports.status, status));
  if (cursor) conditions.push(lt(arccAgingReports.createdAt, new Date(cursor)));
  const results = await db.select().from(arccAgingReports).where(and(...conditions)).orderBy(desc(arccAgingReports.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getAgingReport(id: string, tenantId: string) {
  const [record] = await db.select().from(arccAgingReports).where(and(eq(arccAgingReports.id, id), eq(arccAgingReports.tenantId, tenantId), isNull(arccAgingReports.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Cash Applications
// ==========================================

export async function listCashApplications({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(arccCashApplications.tenantId, tenantId), isNull(arccCashApplications.deletedAt)];
  if (search) conditions.push(or(ilike(arccCashApplications.applicationRef, `%${search}%`), ilike(arccCashApplications.customerName, `%${search}%`), ilike(arccCashApplications.paymentReference, `%${search}%`))!);
  if (status) conditions.push(eq(arccCashApplications.status, status));
  if (cursor) conditions.push(lt(arccCashApplications.createdAt, new Date(cursor)));
  const results = await db.select().from(arccCashApplications).where(and(...conditions)).orderBy(desc(arccCashApplications.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCashApplication(id: string, tenantId: string) {
  const [record] = await db.select().from(arccCashApplications).where(and(eq(arccCashApplications.id, id), eq(arccCashApplications.tenantId, tenantId), isNull(arccCashApplications.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Collection Workflows
// ==========================================

export async function listCollectionWorkflows({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(arccCollectionWorkflows.tenantId, tenantId), isNull(arccCollectionWorkflows.deletedAt)];
  if (search) conditions.push(or(ilike(arccCollectionWorkflows.workflowRef, `%${search}%`), ilike(arccCollectionWorkflows.customerName, `%${search}%`))!);
  if (status) conditions.push(eq(arccCollectionWorkflows.status, status));
  if (cursor) conditions.push(lt(arccCollectionWorkflows.createdAt, new Date(cursor)));
  const results = await db.select().from(arccCollectionWorkflows).where(and(...conditions)).orderBy(desc(arccCollectionWorkflows.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCollectionWorkflow(id: string, tenantId: string) {
  const [record] = await db.select().from(arccCollectionWorkflows).where(and(eq(arccCollectionWorkflows.id, id), eq(arccCollectionWorkflows.tenantId, tenantId), isNull(arccCollectionWorkflows.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Bad Debt Provisions
// ==========================================

export async function listBadDebtProvisions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(arccBadDebtProvisions.tenantId, tenantId), isNull(arccBadDebtProvisions.deletedAt)];
  if (search) conditions.push(or(ilike(arccBadDebtProvisions.provisionRef, `%${search}%`), ilike(arccBadDebtProvisions.customerName, `%${search}%`))!);
  if (status) conditions.push(eq(arccBadDebtProvisions.status, status));
  if (cursor) conditions.push(lt(arccBadDebtProvisions.createdAt, new Date(cursor)));
  const results = await db.select().from(arccBadDebtProvisions).where(and(...conditions)).orderBy(desc(arccBadDebtProvisions.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getBadDebtProvision(id: string, tenantId: string) {
  const [record] = await db.select().from(arccBadDebtProvisions).where(and(eq(arccBadDebtProvisions.id, id), eq(arccBadDebtProvisions.tenantId, tenantId), isNull(arccBadDebtProvisions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Payment Predictions
// ==========================================

export async function listPaymentPredictions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(arccPaymentPredictions.tenantId, tenantId), isNull(arccPaymentPredictions.deletedAt)];
  if (search) conditions.push(or(ilike(arccPaymentPredictions.predictionRef, `%${search}%`), ilike(arccPaymentPredictions.customerName, `%${search}%`))!);
  if (status) conditions.push(eq(arccPaymentPredictions.status, status));
  if (cursor) conditions.push(lt(arccPaymentPredictions.createdAt, new Date(cursor)));
  const results = await db.select().from(arccPaymentPredictions).where(and(...conditions)).orderBy(desc(arccPaymentPredictions.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPaymentPrediction(id: string, tenantId: string) {
  const [record] = await db.select().from(arccPaymentPredictions).where(and(eq(arccPaymentPredictions.id, id), eq(arccPaymentPredictions.tenantId, tenantId), isNull(arccPaymentPredictions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Cash Flow Forecasts
// ==========================================

export async function listCashFlowForecasts({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(arccCashFlowForecasts.tenantId, tenantId), isNull(arccCashFlowForecasts.deletedAt)];
  if (search) conditions.push(or(ilike(arccCashFlowForecasts.forecastRef, `%${search}%`), ilike(arccCashFlowForecasts.forecastPeriod, `%${search}%`))!);
  if (status) conditions.push(eq(arccCashFlowForecasts.status, status));
  if (cursor) conditions.push(lt(arccCashFlowForecasts.createdAt, new Date(cursor)));
  const results = await db.select().from(arccCashFlowForecasts).where(and(...conditions)).orderBy(desc(arccCashFlowForecasts.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCashFlowForecast(id: string, tenantId: string) {
  const [record] = await db.select().from(arccCashFlowForecasts).where(and(eq(arccCashFlowForecasts.id, id), eq(arccCashFlowForecasts.tenantId, tenantId), isNull(arccCashFlowForecasts.deletedAt))).limit(1);
  return record ?? null;
}
