import { and, eq, ilike, isNull, lt, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  cspPortalBookings,
  cspPortalBookingContainers,
  cspShipmentTracking,
  cspTrackingEvents,
  cspPortalDocuments,
  cspPortalInvoices,
  cspPortalPayments,
  cspPaymentTransactions,
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
// Portal Bookings
// ==========================================

export async function listBookings({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(cspPortalBookings.tenantId, tenantId), isNull(cspPortalBookings.deletedAt)];
  if (search) conditions.push(or(ilike(cspPortalBookings.bookingRef, `%${search}%`), ilike(cspPortalBookings.customerName, `%${search}%`))!);
  if (status) conditions.push(eq(cspPortalBookings.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(cspPortalBookings.createdAt, cspPortalBookings.id, cc)); }

  const results = await db.select().from(cspPortalBookings).where(and(...conditions)).orderBy(desc(cspPortalBookings.createdAt), desc(cspPortalBookings.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getBooking(id: string, tenantId: string) {
  const [record] = await db.select().from(cspPortalBookings).where(and(eq(cspPortalBookings.id, id), eq(cspPortalBookings.tenantId, tenantId), isNull(cspPortalBookings.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Booking Containers
// ==========================================

export async function listBookingContainers(tenantId: string, bookingId: string) {
  return db.select().from(cspPortalBookingContainers).where(and(eq(cspPortalBookingContainers.tenantId, tenantId), eq(cspPortalBookingContainers.bookingId, bookingId), isNull(cspPortalBookingContainers.deletedAt))).orderBy(desc(cspPortalBookingContainers.createdAt), desc(cspPortalBookingContainers.id));
}

// ==========================================
// Shipment Tracking
// ==========================================

export async function listTracking({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(cspShipmentTracking.tenantId, tenantId), isNull(cspShipmentTracking.deletedAt)];
  if (search) conditions.push(or(ilike(cspShipmentTracking.trackingNumber, `%${search}%`), ilike(cspShipmentTracking.blNumber ?? "", `%${search}%`))!);
  if (status) conditions.push(eq(cspShipmentTracking.currentStatus, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(cspShipmentTracking.createdAt, cspShipmentTracking.id, cc)); }

  const results = await db.select().from(cspShipmentTracking).where(and(...conditions)).orderBy(desc(cspShipmentTracking.createdAt), desc(cspShipmentTracking.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getTracking(id: string, tenantId: string) {
  const [record] = await db.select().from(cspShipmentTracking).where(and(eq(cspShipmentTracking.id, id), eq(cspShipmentTracking.tenantId, tenantId), isNull(cspShipmentTracking.deletedAt))).limit(1);
  return record ?? null;
}

export async function getTrackingByNumber(trackingNumber: string, tenantId: string) {
  const [record] = await db.select().from(cspShipmentTracking).where(and(eq(cspShipmentTracking.trackingNumber, trackingNumber), eq(cspShipmentTracking.tenantId, tenantId), isNull(cspShipmentTracking.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Tracking Events
// ==========================================

export async function listTrackingEvents(tenantId: string, trackingId: string) {
  return db.select().from(cspTrackingEvents).where(and(eq(cspTrackingEvents.tenantId, tenantId), eq(cspTrackingEvents.trackingId, trackingId), isNull(cspTrackingEvents.deletedAt))).orderBy(desc(cspTrackingEvents.eventTime));
}

// ==========================================
// Portal Documents
// ==========================================

export async function listDocuments({ tenantId, search, status, cursor, limit = 50 }: ListParams & { documentType?: string }, documentType?: string) {
  const conditions = [eq(cspPortalDocuments.tenantId, tenantId), isNull(cspPortalDocuments.deletedAt)];
  if (search) conditions.push(or(ilike(cspPortalDocuments.documentRef, `%${search}%`), ilike(cspPortalDocuments.documentName, `%${search}%`))!);
  if (status) conditions.push(eq(cspPortalDocuments.status, status));
  if (documentType) conditions.push(eq(cspPortalDocuments.documentType, documentType));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(cspPortalDocuments.createdAt, cspPortalDocuments.id, cc)); }

  const results = await db.select().from(cspPortalDocuments).where(and(...conditions)).orderBy(desc(cspPortalDocuments.createdAt), desc(cspPortalDocuments.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getDocument(id: string, tenantId: string) {
  const [record] = await db.select().from(cspPortalDocuments).where(and(eq(cspPortalDocuments.id, id), eq(cspPortalDocuments.tenantId, tenantId), isNull(cspPortalDocuments.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Portal Invoices
// ==========================================

export async function listInvoices({ tenantId, search, status, cursor, limit = 50 }: ListParams & { invoiceType?: string }, invoiceType?: string) {
  const conditions = [eq(cspPortalInvoices.tenantId, tenantId), isNull(cspPortalInvoices.deletedAt)];
  if (search) conditions.push(or(ilike(cspPortalInvoices.invoiceRef, `%${search}%`), ilike(cspPortalInvoices.currency, `%${search}%`))!);
  if (status) conditions.push(eq(cspPortalInvoices.status, status));
  if (invoiceType) conditions.push(eq(cspPortalInvoices.invoiceType, invoiceType));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(cspPortalInvoices.createdAt, cspPortalInvoices.id, cc)); }

  const results = await db.select().from(cspPortalInvoices).where(and(...conditions)).orderBy(desc(cspPortalInvoices.createdAt), desc(cspPortalInvoices.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getInvoice(id: string, tenantId: string) {
  const [record] = await db.select().from(cspPortalInvoices).where(and(eq(cspPortalInvoices.id, id), eq(cspPortalInvoices.tenantId, tenantId), isNull(cspPortalInvoices.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Portal Payments
// ==========================================

export async function listPayments({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(cspPortalPayments.tenantId, tenantId), isNull(cspPortalPayments.deletedAt)];
  if (search) conditions.push(ilike(cspPortalPayments.paymentRef, `%${search}%`));
  if (status) conditions.push(eq(cspPortalPayments.status, status));
  if (cursor) { const cc = parseCompoundCursor(cursor); if (cc) conditions.push(cursorCondition(cspPortalPayments.createdAt, cspPortalPayments.id, cc)); }

  const results = await db.select().from(cspPortalPayments).where(and(...conditions)).orderBy(desc(cspPortalPayments.createdAt), desc(cspPortalPayments.id)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? encodeCompoundCursor(data[data.length - 1].createdAt, data[data.length - 1].id) : undefined, hasMore } };
}

export async function getPayment(id: string, tenantId: string) {
  const [record] = await db.select().from(cspPortalPayments).where(and(eq(cspPortalPayments.id, id), eq(cspPortalPayments.tenantId, tenantId), isNull(cspPortalPayments.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Payment Transactions
// ==========================================

export async function listPaymentTransactions(tenantId: string, paymentId: string) {
  return db.select().from(cspPaymentTransactions).where(and(eq(cspPaymentTransactions.tenantId, tenantId), eq(cspPaymentTransactions.paymentId, paymentId), isNull(cspPaymentTransactions.deletedAt))).orderBy(desc(cspPaymentTransactions.createdAt), desc(cspPaymentTransactions.id));
}
