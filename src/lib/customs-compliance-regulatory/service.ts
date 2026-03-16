import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  ccrImportClearances,
  ccrExportFilings,
  ccrTransitProcedures,
  ccrDutyCalculations,
  ccrAeoCompliances,
  ccrIspsCompliances,
  ccrPscPreparations,
  ccrImoRegulations,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Import Customs Clearance
// ==========================================
export async function listImportClearances({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ccrImportClearances.tenantId, tenantId), isNull(ccrImportClearances.deletedAt)];
  if (search) conditions.push(or(ilike(ccrImportClearances.clearanceRef, `%${search}%`), ilike(ccrImportClearances.importerName, `%${search}%`), ilike(ccrImportClearances.blNumber, `%${search}%`))!);
  if (status) conditions.push(eq(ccrImportClearances.status, status));
  if (cursor) conditions.push(lt(ccrImportClearances.createdAt, new Date(cursor)));
  const results = await db.select().from(ccrImportClearances).where(and(...conditions)).orderBy(desc(ccrImportClearances.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getImportClearance(id: string, tenantId: string) {
  const [record] = await db.select().from(ccrImportClearances).where(and(eq(ccrImportClearances.id, id), eq(ccrImportClearances.tenantId, tenantId), isNull(ccrImportClearances.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Export Customs Filing
// ==========================================
export async function listExportFilings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ccrExportFilings.tenantId, tenantId), isNull(ccrExportFilings.deletedAt)];
  if (search) conditions.push(or(ilike(ccrExportFilings.filingRef, `%${search}%`), ilike(ccrExportFilings.exporterName, `%${search}%`), ilike(ccrExportFilings.blNumber, `%${search}%`))!);
  if (status) conditions.push(eq(ccrExportFilings.status, status));
  if (cursor) conditions.push(lt(ccrExportFilings.createdAt, new Date(cursor)));
  const results = await db.select().from(ccrExportFilings).where(and(...conditions)).orderBy(desc(ccrExportFilings.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getExportFiling(id: string, tenantId: string) {
  const [record] = await db.select().from(ccrExportFilings).where(and(eq(ccrExportFilings.id, id), eq(ccrExportFilings.tenantId, tenantId), isNull(ccrExportFilings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Transit & Re-Export Procedures
// ==========================================
export async function listTransitProcedures({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ccrTransitProcedures.tenantId, tenantId), isNull(ccrTransitProcedures.deletedAt)];
  if (search) conditions.push(or(ilike(ccrTransitProcedures.transitRef, `%${search}%`), ilike(ccrTransitProcedures.principalName, `%${search}%`), ilike(ccrTransitProcedures.containerNumber, `%${search}%`))!);
  if (status) conditions.push(eq(ccrTransitProcedures.status, status));
  if (cursor) conditions.push(lt(ccrTransitProcedures.createdAt, new Date(cursor)));
  const results = await db.select().from(ccrTransitProcedures).where(and(...conditions)).orderBy(desc(ccrTransitProcedures.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getTransitProcedure(id: string, tenantId: string) {
  const [record] = await db.select().from(ccrTransitProcedures).where(and(eq(ccrTransitProcedures.id, id), eq(ccrTransitProcedures.tenantId, tenantId), isNull(ccrTransitProcedures.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Customs Duty & Tax Calculation
// ==========================================
export async function listDutyCalculations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ccrDutyCalculations.tenantId, tenantId), isNull(ccrDutyCalculations.deletedAt)];
  if (search) conditions.push(or(ilike(ccrDutyCalculations.calculationRef, `%${search}%`), ilike(ccrDutyCalculations.hsCode, `%${search}%`), ilike(ccrDutyCalculations.clearanceRef, `%${search}%`))!);
  if (status) conditions.push(eq(ccrDutyCalculations.status, status));
  if (cursor) conditions.push(lt(ccrDutyCalculations.createdAt, new Date(cursor)));
  const results = await db.select().from(ccrDutyCalculations).where(and(...conditions)).orderBy(desc(ccrDutyCalculations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getDutyCalculation(id: string, tenantId: string) {
  const [record] = await db.select().from(ccrDutyCalculations).where(and(eq(ccrDutyCalculations.id, id), eq(ccrDutyCalculations.tenantId, tenantId), isNull(ccrDutyCalculations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// AEO Compliance
// ==========================================
export async function listAeoCompliances({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ccrAeoCompliances.tenantId, tenantId), isNull(ccrAeoCompliances.deletedAt)];
  if (search) conditions.push(or(ilike(ccrAeoCompliances.aeoRef, `%${search}%`), ilike(ccrAeoCompliances.companyName, `%${search}%`), ilike(ccrAeoCompliances.certificateNumber, `%${search}%`))!);
  if (status) conditions.push(eq(ccrAeoCompliances.status, status));
  if (cursor) conditions.push(lt(ccrAeoCompliances.createdAt, new Date(cursor)));
  const results = await db.select().from(ccrAeoCompliances).where(and(...conditions)).orderBy(desc(ccrAeoCompliances.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getAeoCompliance(id: string, tenantId: string) {
  const [record] = await db.select().from(ccrAeoCompliances).where(and(eq(ccrAeoCompliances.id, id), eq(ccrAeoCompliances.tenantId, tenantId), isNull(ccrAeoCompliances.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// ISPS Compliance
// ==========================================
export async function listIspsCompliances({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ccrIspsCompliances.tenantId, tenantId), isNull(ccrIspsCompliances.deletedAt)];
  if (search) conditions.push(or(ilike(ccrIspsCompliances.ispsRef, `%${search}%`), ilike(ccrIspsCompliances.facilityName, `%${search}%`), ilike(ccrIspsCompliances.imoNumber, `%${search}%`))!);
  if (status) conditions.push(eq(ccrIspsCompliances.status, status));
  if (cursor) conditions.push(lt(ccrIspsCompliances.createdAt, new Date(cursor)));
  const results = await db.select().from(ccrIspsCompliances).where(and(...conditions)).orderBy(desc(ccrIspsCompliances.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getIspsCompliance(id: string, tenantId: string) {
  const [record] = await db.select().from(ccrIspsCompliances).where(and(eq(ccrIspsCompliances.id, id), eq(ccrIspsCompliances.tenantId, tenantId), isNull(ccrIspsCompliances.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// PSC Preparations
// ==========================================
export async function listPscPreparations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ccrPscPreparations.tenantId, tenantId), isNull(ccrPscPreparations.deletedAt)];
  if (search) conditions.push(or(ilike(ccrPscPreparations.pscRef, `%${search}%`), ilike(ccrPscPreparations.vesselName, `%${search}%`), ilike(ccrPscPreparations.inspectionPort, `%${search}%`))!);
  if (status) conditions.push(eq(ccrPscPreparations.status, status));
  if (cursor) conditions.push(lt(ccrPscPreparations.createdAt, new Date(cursor)));
  const results = await db.select().from(ccrPscPreparations).where(and(...conditions)).orderBy(desc(ccrPscPreparations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getPscPreparation(id: string, tenantId: string) {
  const [record] = await db.select().from(ccrPscPreparations).where(and(eq(ccrPscPreparations.id, id), eq(ccrPscPreparations.tenantId, tenantId), isNull(ccrPscPreparations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// IMO Regulations
// ==========================================
export async function listImoRegulations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(ccrImoRegulations.tenantId, tenantId), isNull(ccrImoRegulations.deletedAt)];
  if (search) conditions.push(or(ilike(ccrImoRegulations.regulationRef, `%${search}%`), ilike(ccrImoRegulations.title, `%${search}%`), ilike(ccrImoRegulations.imoReference, `%${search}%`))!);
  if (status) conditions.push(eq(ccrImoRegulations.status, status));
  if (cursor) conditions.push(lt(ccrImoRegulations.createdAt, new Date(cursor)));
  const results = await db.select().from(ccrImoRegulations).where(and(...conditions)).orderBy(desc(ccrImoRegulations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getImoRegulation(id: string, tenantId: string) {
  const [record] = await db.select().from(ccrImoRegulations).where(and(eq(ccrImoRegulations.id, id), eq(ccrImoRegulations.tenantId, tenantId), isNull(ccrImoRegulations.deletedAt))).limit(1);
  return record ?? null;
}
