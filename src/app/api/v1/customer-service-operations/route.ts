import { NextRequest, NextResponse } from "next/server";
import { eq, isNull, and, count } from "drizzle-orm";
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
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "customer_service:read")))
      return forbiddenResponse();

    const [
      [categories],
      [inquiries],
      [complaints],
      [serviceRequests],
      [slaPolicies],
      [slaBreaches],
      [escalations],
      [commLogs],
      [feedback],
      [articles],
      [assignments],
      [notes],
    ] = await Promise.all([
      db.select({ count: count() }).from(csoServiceCategories).where(and(eq(csoServiceCategories.tenantId, user.tenantId), isNull(csoServiceCategories.deletedAt))),
      db.select({ count: count() }).from(csoInquiries).where(and(eq(csoInquiries.tenantId, user.tenantId), isNull(csoInquiries.deletedAt))),
      db.select({ count: count() }).from(csoComplaints).where(and(eq(csoComplaints.tenantId, user.tenantId), isNull(csoComplaints.deletedAt))),
      db.select({ count: count() }).from(csoServiceRequests).where(and(eq(csoServiceRequests.tenantId, user.tenantId), isNull(csoServiceRequests.deletedAt))),
      db.select({ count: count() }).from(csoSlaPolicies).where(and(eq(csoSlaPolicies.tenantId, user.tenantId), isNull(csoSlaPolicies.deletedAt))),
      db.select({ count: count() }).from(csoSlaBreaches).where(and(eq(csoSlaBreaches.tenantId, user.tenantId), isNull(csoSlaBreaches.deletedAt))),
      db.select({ count: count() }).from(csoEscalations).where(and(eq(csoEscalations.tenantId, user.tenantId), isNull(csoEscalations.deletedAt))),
      db.select({ count: count() }).from(csoCommunicationLogs).where(and(eq(csoCommunicationLogs.tenantId, user.tenantId), isNull(csoCommunicationLogs.deletedAt))),
      db.select({ count: count() }).from(csoCustomerFeedback).where(and(eq(csoCustomerFeedback.tenantId, user.tenantId), isNull(csoCustomerFeedback.deletedAt))),
      db.select({ count: count() }).from(csoKnowledgeArticles).where(and(eq(csoKnowledgeArticles.tenantId, user.tenantId), isNull(csoKnowledgeArticles.deletedAt))),
      db.select({ count: count() }).from(csoAgentAssignments).where(and(eq(csoAgentAssignments.tenantId, user.tenantId), isNull(csoAgentAssignments.deletedAt))),
      db.select({ count: count() }).from(csoResolutionNotes).where(and(eq(csoResolutionNotes.tenantId, user.tenantId), isNull(csoResolutionNotes.deletedAt))),
    ]);

    return NextResponse.json({
      data: {
        serviceCategories: categories.count,
        inquiries: inquiries.count,
        complaints: complaints.count,
        serviceRequests: serviceRequests.count,
        slaPolicies: slaPolicies.count,
        slaBreaches: slaBreaches.count,
        escalations: escalations.count,
        communicationLogs: commLogs.count,
        customerFeedback: feedback.count,
        knowledgeArticles: articles.count,
        agentAssignments: assignments.count,
        resolutionNotes: notes.count,
      },
    });
  } catch (error) {
    console.error("Failed to get CSO summary:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
