import { and, eq, ilike, isNull, lt, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  odmBillsOfLading,
  odmBlContainers,
  odmBlCharges,
  odmManifests,
  odmManifestItems,
  odmRegulatoryFilings,
  odmVgmRecords,
  odmShippingInstructions,
  odmCargoTrackingEvents,
  odmDocumentAmendments,
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
// Bills of Lading
// ==========================================

export async function listBillsOfLading({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(odmBillsOfLading.tenantId, tenantId), isNull(odmBillsOfLading.deletedAt)];
  if (search) conditions.push(ilike(odmBillsOfLading.blNumber, `%${search}%`));
  if (status) conditions.push(eq(odmBillsOfLading.blStatus, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(odmBillsOfLading.createdAt, odmBillsOfLading.id, cc)); }

  const results = await db.select().from(odmBillsOfLading).where(and(...conditions)).orderBy(desc(odmBillsOfLading.createdAt), desc(odmBillsOfLading.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getBillOfLading(id: string, tenantId: string) {
  const [record] = await db.select().from(odmBillsOfLading).where(and(eq(odmBillsOfLading.id, id), eq(odmBillsOfLading.tenantId, tenantId), isNull(odmBillsOfLading.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// BL Containers
// ==========================================

export async function listBlContainers({ tenantId, search, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(odmBlContainers.tenantId, tenantId), isNull(odmBlContainers.deletedAt)];
  if (search) conditions.push(ilike(odmBlContainers.containerNumber, `%${search}%`));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(odmBlContainers.createdAt, odmBlContainers.id, cc)); }

  const results = await db.select().from(odmBlContainers).where(and(...conditions)).orderBy(desc(odmBlContainers.createdAt), desc(odmBlContainers.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getBlContainer(id: string, tenantId: string) {
  const [record] = await db.select().from(odmBlContainers).where(and(eq(odmBlContainers.id, id), eq(odmBlContainers.tenantId, tenantId), isNull(odmBlContainers.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// BL Charges
// ==========================================

export async function listBlCharges({ tenantId, search, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(odmBlCharges.tenantId, tenantId), isNull(odmBlCharges.deletedAt)];
  if (search) conditions.push(ilike(odmBlCharges.chargeName, `%${search}%`));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(odmBlCharges.createdAt, odmBlCharges.id, cc)); }

  const results = await db.select().from(odmBlCharges).where(and(...conditions)).orderBy(desc(odmBlCharges.createdAt), desc(odmBlCharges.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getBlCharge(id: string, tenantId: string) {
  const [record] = await db.select().from(odmBlCharges).where(and(eq(odmBlCharges.id, id), eq(odmBlCharges.tenantId, tenantId), isNull(odmBlCharges.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Manifests
// ==========================================

export async function listManifests({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(odmManifests.tenantId, tenantId), isNull(odmManifests.deletedAt)];
  if (search) conditions.push(ilike(odmManifests.manifestNumber, `%${search}%`));
  if (status) conditions.push(eq(odmManifests.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(odmManifests.createdAt, odmManifests.id, cc)); }

  const results = await db.select().from(odmManifests).where(and(...conditions)).orderBy(desc(odmManifests.createdAt), desc(odmManifests.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getManifest(id: string, tenantId: string) {
  const [record] = await db.select().from(odmManifests).where(and(eq(odmManifests.id, id), eq(odmManifests.tenantId, tenantId), isNull(odmManifests.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Manifest Items
// ==========================================

export async function listManifestItems({ tenantId, search, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(odmManifestItems.tenantId, tenantId), isNull(odmManifestItems.deletedAt)];
  if (search) conditions.push(ilike(odmManifestItems.blNumber, `%${search}%`));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(odmManifestItems.createdAt, odmManifestItems.id, cc)); }

  const results = await db.select().from(odmManifestItems).where(and(...conditions)).orderBy(desc(odmManifestItems.createdAt), desc(odmManifestItems.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getManifestItem(id: string, tenantId: string) {
  const [record] = await db.select().from(odmManifestItems).where(and(eq(odmManifestItems.id, id), eq(odmManifestItems.tenantId, tenantId), isNull(odmManifestItems.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Regulatory Filings
// ==========================================

export async function listRegulatoryFilings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(odmRegulatoryFilings.tenantId, tenantId), isNull(odmRegulatoryFilings.deletedAt)];
  if (search) conditions.push(ilike(odmRegulatoryFilings.filingReference, `%${search}%`));
  if (status) conditions.push(eq(odmRegulatoryFilings.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(odmRegulatoryFilings.createdAt, odmRegulatoryFilings.id, cc)); }

  const results = await db.select().from(odmRegulatoryFilings).where(and(...conditions)).orderBy(desc(odmRegulatoryFilings.createdAt), desc(odmRegulatoryFilings.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getRegulatoryFiling(id: string, tenantId: string) {
  const [record] = await db.select().from(odmRegulatoryFilings).where(and(eq(odmRegulatoryFilings.id, id), eq(odmRegulatoryFilings.tenantId, tenantId), isNull(odmRegulatoryFilings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// VGM Records
// ==========================================

export async function listVgmRecords({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(odmVgmRecords.tenantId, tenantId), isNull(odmVgmRecords.deletedAt)];
  if (search) conditions.push(ilike(odmVgmRecords.vgmReference, `%${search}%`));
  if (status) conditions.push(eq(odmVgmRecords.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(odmVgmRecords.createdAt, odmVgmRecords.id, cc)); }

  const results = await db.select().from(odmVgmRecords).where(and(...conditions)).orderBy(desc(odmVgmRecords.createdAt), desc(odmVgmRecords.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getVgmRecord(id: string, tenantId: string) {
  const [record] = await db.select().from(odmVgmRecords).where(and(eq(odmVgmRecords.id, id), eq(odmVgmRecords.tenantId, tenantId), isNull(odmVgmRecords.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Shipping Instructions
// ==========================================

export async function listShippingInstructions({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(odmShippingInstructions.tenantId, tenantId), isNull(odmShippingInstructions.deletedAt)];
  if (search) conditions.push(ilike(odmShippingInstructions.siReference, `%${search}%`));
  if (status) conditions.push(eq(odmShippingInstructions.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(odmShippingInstructions.createdAt, odmShippingInstructions.id, cc)); }

  const results = await db.select().from(odmShippingInstructions).where(and(...conditions)).orderBy(desc(odmShippingInstructions.createdAt), desc(odmShippingInstructions.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getShippingInstruction(id: string, tenantId: string) {
  const [record] = await db.select().from(odmShippingInstructions).where(and(eq(odmShippingInstructions.id, id), eq(odmShippingInstructions.tenantId, tenantId), isNull(odmShippingInstructions.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Cargo Tracking Events
// ==========================================

export async function listCargoTrackingEvents({ tenantId, search, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(odmCargoTrackingEvents.tenantId, tenantId), isNull(odmCargoTrackingEvents.deletedAt)];
  if (search) conditions.push(ilike(odmCargoTrackingEvents.eventCode, `%${search}%`));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(odmCargoTrackingEvents.createdAt, odmCargoTrackingEvents.id, cc)); }

  const results = await db.select().from(odmCargoTrackingEvents).where(and(...conditions)).orderBy(desc(odmCargoTrackingEvents.createdAt), desc(odmCargoTrackingEvents.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getCargoTrackingEvent(id: string, tenantId: string) {
  const [record] = await db.select().from(odmCargoTrackingEvents).where(and(eq(odmCargoTrackingEvents.id, id), eq(odmCargoTrackingEvents.tenantId, tenantId), isNull(odmCargoTrackingEvents.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Document Amendments
// ==========================================

export async function listDocumentAmendments({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(odmDocumentAmendments.tenantId, tenantId), isNull(odmDocumentAmendments.deletedAt)];
  if (search) conditions.push(ilike(odmDocumentAmendments.amendmentNumber, `%${search}%`));
  if (status) conditions.push(eq(odmDocumentAmendments.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(odmDocumentAmendments.createdAt, odmDocumentAmendments.id, cc)); }

  const results = await db.select().from(odmDocumentAmendments).where(and(...conditions)).orderBy(desc(odmDocumentAmendments.createdAt), desc(odmDocumentAmendments.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getDocumentAmendment(id: string, tenantId: string) {
  const [record] = await db.select().from(odmDocumentAmendments).where(and(eq(odmDocumentAmendments.id, id), eq(odmDocumentAmendments.tenantId, tenantId), isNull(odmDocumentAmendments.deletedAt))).limit(1);
  return record ?? null;
}
