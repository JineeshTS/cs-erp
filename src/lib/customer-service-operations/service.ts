import { and, eq, ilike, isNull, lt, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  csoServiceCategories,
  csoInquiries,
  csoComplaints,
  csoServiceRequests,
  csoSlaPolicies,
  csoSlaBreaches,
  csoEscalations,
  csoCommunicationLogs,
  csoCustomerFeedback,
  csoKnowledgeArticles,
  csoAgentAssignments,
  csoResolutionNotes,
} from "@/db/schema";

interface ListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

// ==========================================
// Service Categories
// ==========================================

export async function listServiceCategories({ tenantId, search, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(csoServiceCategories.tenantId, tenantId), isNull(csoServiceCategories.deletedAt)];
  if (search) conditions.push(ilike(csoServiceCategories.categoryName, `%${search}%`));
  if (cursor) conditions.push(lt(csoServiceCategories.createdAt, new Date(cursor)));

  const results = await db.select().from(csoServiceCategories).where(and(...conditions)).orderBy(desc(csoServiceCategories.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getServiceCategory(id: string, tenantId: string) {
  const [record] = await db.select().from(csoServiceCategories).where(and(eq(csoServiceCategories.id, id), eq(csoServiceCategories.tenantId, tenantId), isNull(csoServiceCategories.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Inquiries
// ==========================================

export async function listInquiries({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(csoInquiries.tenantId, tenantId), isNull(csoInquiries.deletedAt)];
  if (search) conditions.push(ilike(csoInquiries.subject, `%${search}%`));
  if (status) conditions.push(eq(csoInquiries.status, status));
  if (cursor) conditions.push(lt(csoInquiries.createdAt, new Date(cursor)));

  const results = await db.select().from(csoInquiries).where(and(...conditions)).orderBy(desc(csoInquiries.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getInquiry(id: string, tenantId: string) {
  const [record] = await db.select().from(csoInquiries).where(and(eq(csoInquiries.id, id), eq(csoInquiries.tenantId, tenantId), isNull(csoInquiries.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Complaints
// ==========================================

export async function listComplaints({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(csoComplaints.tenantId, tenantId), isNull(csoComplaints.deletedAt)];
  if (search) conditions.push(ilike(csoComplaints.subject, `%${search}%`));
  if (status) conditions.push(eq(csoComplaints.status, status));
  if (cursor) conditions.push(lt(csoComplaints.createdAt, new Date(cursor)));

  const results = await db.select().from(csoComplaints).where(and(...conditions)).orderBy(desc(csoComplaints.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getComplaint(id: string, tenantId: string) {
  const [record] = await db.select().from(csoComplaints).where(and(eq(csoComplaints.id, id), eq(csoComplaints.tenantId, tenantId), isNull(csoComplaints.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Service Requests
// ==========================================

export async function listServiceRequests({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(csoServiceRequests.tenantId, tenantId), isNull(csoServiceRequests.deletedAt)];
  if (search) conditions.push(ilike(csoServiceRequests.subject, `%${search}%`));
  if (status) conditions.push(eq(csoServiceRequests.status, status));
  if (cursor) conditions.push(lt(csoServiceRequests.createdAt, new Date(cursor)));

  const results = await db.select().from(csoServiceRequests).where(and(...conditions)).orderBy(desc(csoServiceRequests.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getServiceRequest(id: string, tenantId: string) {
  const [record] = await db.select().from(csoServiceRequests).where(and(eq(csoServiceRequests.id, id), eq(csoServiceRequests.tenantId, tenantId), isNull(csoServiceRequests.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// SLA Policies
// ==========================================

export async function listSlaPolicies({ tenantId, search, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(csoSlaPolicies.tenantId, tenantId), isNull(csoSlaPolicies.deletedAt)];
  if (search) conditions.push(ilike(csoSlaPolicies.policyName, `%${search}%`));
  if (cursor) conditions.push(lt(csoSlaPolicies.createdAt, new Date(cursor)));

  const results = await db.select().from(csoSlaPolicies).where(and(...conditions)).orderBy(desc(csoSlaPolicies.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getSlaPolicy(id: string, tenantId: string) {
  const [record] = await db.select().from(csoSlaPolicies).where(and(eq(csoSlaPolicies.id, id), eq(csoSlaPolicies.tenantId, tenantId), isNull(csoSlaPolicies.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// SLA Breaches
// ==========================================

export async function listSlaBreaches({ tenantId, search, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(csoSlaBreaches.tenantId, tenantId), isNull(csoSlaBreaches.deletedAt)];
  if (search) conditions.push(ilike(csoSlaBreaches.breachType, `%${search}%`));
  if (cursor) conditions.push(lt(csoSlaBreaches.createdAt, new Date(cursor)));

  const results = await db.select().from(csoSlaBreaches).where(and(...conditions)).orderBy(desc(csoSlaBreaches.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getSlaBreach(id: string, tenantId: string) {
  const [record] = await db.select().from(csoSlaBreaches).where(and(eq(csoSlaBreaches.id, id), eq(csoSlaBreaches.tenantId, tenantId), isNull(csoSlaBreaches.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Escalations
// ==========================================

export async function listEscalations({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(csoEscalations.tenantId, tenantId), isNull(csoEscalations.deletedAt)];
  if (search) conditions.push(ilike(csoEscalations.reason, `%${search}%`));
  if (status) conditions.push(eq(csoEscalations.status, status));
  if (cursor) conditions.push(lt(csoEscalations.createdAt, new Date(cursor)));

  const results = await db.select().from(csoEscalations).where(and(...conditions)).orderBy(desc(csoEscalations.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getEscalation(id: string, tenantId: string) {
  const [record] = await db.select().from(csoEscalations).where(and(eq(csoEscalations.id, id), eq(csoEscalations.tenantId, tenantId), isNull(csoEscalations.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Communication Logs
// ==========================================

export async function listCommunicationLogs({ tenantId, search, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(csoCommunicationLogs.tenantId, tenantId), isNull(csoCommunicationLogs.deletedAt)];
  if (search) conditions.push(ilike(csoCommunicationLogs.subject, `%${search}%`));
  if (cursor) conditions.push(lt(csoCommunicationLogs.createdAt, new Date(cursor)));

  const results = await db.select().from(csoCommunicationLogs).where(and(...conditions)).orderBy(desc(csoCommunicationLogs.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCommunicationLog(id: string, tenantId: string) {
  const [record] = await db.select().from(csoCommunicationLogs).where(and(eq(csoCommunicationLogs.id, id), eq(csoCommunicationLogs.tenantId, tenantId), isNull(csoCommunicationLogs.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Customer Feedback
// ==========================================

export async function listCustomerFeedback({ tenantId, search, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(csoCustomerFeedback.tenantId, tenantId), isNull(csoCustomerFeedback.deletedAt)];
  if (search) conditions.push(ilike(csoCustomerFeedback.feedbackText, `%${search}%`));
  if (cursor) conditions.push(lt(csoCustomerFeedback.createdAt, new Date(cursor)));

  const results = await db.select().from(csoCustomerFeedback).where(and(...conditions)).orderBy(desc(csoCustomerFeedback.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getCustomerFeedbackItem(id: string, tenantId: string) {
  const [record] = await db.select().from(csoCustomerFeedback).where(and(eq(csoCustomerFeedback.id, id), eq(csoCustomerFeedback.tenantId, tenantId), isNull(csoCustomerFeedback.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Knowledge Articles
// ==========================================

export async function listKnowledgeArticles({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(csoKnowledgeArticles.tenantId, tenantId), isNull(csoKnowledgeArticles.deletedAt)];
  if (search) conditions.push(ilike(csoKnowledgeArticles.title, `%${search}%`));
  if (status) conditions.push(eq(csoKnowledgeArticles.status, status));
  if (cursor) conditions.push(lt(csoKnowledgeArticles.createdAt, new Date(cursor)));

  const results = await db.select().from(csoKnowledgeArticles).where(and(...conditions)).orderBy(desc(csoKnowledgeArticles.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getKnowledgeArticle(id: string, tenantId: string) {
  const [record] = await db.select().from(csoKnowledgeArticles).where(and(eq(csoKnowledgeArticles.id, id), eq(csoKnowledgeArticles.tenantId, tenantId), isNull(csoKnowledgeArticles.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Agent Assignments
// ==========================================

export async function listAgentAssignments({ tenantId, search, status, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(csoAgentAssignments.tenantId, tenantId), isNull(csoAgentAssignments.deletedAt)];
  if (search) conditions.push(ilike(csoAgentAssignments.entityType, `%${search}%`));
  if (status) conditions.push(eq(csoAgentAssignments.status, status));
  if (cursor) conditions.push(lt(csoAgentAssignments.createdAt, new Date(cursor)));

  const results = await db.select().from(csoAgentAssignments).where(and(...conditions)).orderBy(desc(csoAgentAssignments.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getAgentAssignment(id: string, tenantId: string) {
  const [record] = await db.select().from(csoAgentAssignments).where(and(eq(csoAgentAssignments.id, id), eq(csoAgentAssignments.tenantId, tenantId), isNull(csoAgentAssignments.deletedAt))).limit(1);
  return record ?? null;
}

// ==========================================
// Resolution Notes
// ==========================================

export async function listResolutionNotes({ tenantId, search, cursor, limit = 50 }: ListParams) {
  const conditions = [eq(csoResolutionNotes.tenantId, tenantId), isNull(csoResolutionNotes.deletedAt)];
  if (search) conditions.push(ilike(csoResolutionNotes.content, `%${search}%`));
  if (cursor) conditions.push(lt(csoResolutionNotes.createdAt, new Date(cursor)));

  const results = await db.select().from(csoResolutionNotes).where(and(...conditions)).orderBy(desc(csoResolutionNotes.createdAt)).limit(limit + 1);
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;
  return { data, meta: { cursor: hasMore ? data[data.length - 1].createdAt.toISOString() : undefined, hasMore } };
}

export async function getResolutionNote(id: string, tenantId: string) {
  const [record] = await db.select().from(csoResolutionNotes).where(and(eq(csoResolutionNotes.id, id), eq(csoResolutionNotes.tenantId, tenantId), isNull(csoResolutionNotes.deletedAt))).limit(1);
  return record ?? null;
}
