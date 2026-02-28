import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import {
  csoInquiries,
  csoComplaints,
  csoServiceRequests,
  csoServiceCategories,
  csoSlaPolicies,
  csoSlaBreaches,
  csoEscalations,
  csoCommunicationLogs,
  csoCustomerFeedback,
  csoKnowledgeArticles,
  csoAgentAssignments,
  csoResolutionNotes,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "complaints", label: "Complaints" },
  { key: "service-requests", label: "Service Requests" },
  { key: "categories", label: "Categories" },
  { key: "sla-policies", label: "SLA Policies" },
  { key: "sla-breaches", label: "SLA Breaches" },
  { key: "escalations", label: "Escalations" },
  { key: "comm-logs", label: "Comm Logs" },
  { key: "feedback", label: "Feedback" },
  { key: "knowledge", label: "Knowledge" },
  { key: "assignments", label: "Assignments" },
  { key: "notes", label: "Notes" },
] as const;

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default async function InquiryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customer_service:read")))
    redirect("/customer-service-operations");

  const { id } = await params;
  const sp = await searchParams;
  const activeTab = sp.tab ?? "overview";

  const record = await db
    .select()
    .from(csoInquiries)
    .where(
      and(
        eq(csoInquiries.id, id),
        eq(csoInquiries.tenantId, session.tenantId),
        isNull(csoInquiries.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "customer_service:edit");
  const canDelete = await hasPermission(session.id, session.tenantId, "customer_service:delete");

  const tenantFilter = session.tenantId;
  const [
    complaints,
    serviceRequests,
    categories,
    slaPolicies,
    slaBreaches,
    escalations,
    commLogs,
    feedback,
    knowledge,
    assignments,
    notes,
  ] = await Promise.all([
    db.select().from(csoComplaints).where(and(eq(csoComplaints.tenantId, tenantFilter), isNull(csoComplaints.deletedAt))).orderBy(desc(csoComplaints.createdAt)).limit(50),
    db.select().from(csoServiceRequests).where(and(eq(csoServiceRequests.tenantId, tenantFilter), isNull(csoServiceRequests.deletedAt))).orderBy(desc(csoServiceRequests.createdAt)).limit(50),
    db.select().from(csoServiceCategories).where(and(eq(csoServiceCategories.tenantId, tenantFilter), isNull(csoServiceCategories.deletedAt))).orderBy(desc(csoServiceCategories.createdAt)).limit(50),
    db.select().from(csoSlaPolicies).where(and(eq(csoSlaPolicies.tenantId, tenantFilter), isNull(csoSlaPolicies.deletedAt))).orderBy(desc(csoSlaPolicies.createdAt)).limit(50),
    db.select().from(csoSlaBreaches).where(and(eq(csoSlaBreaches.tenantId, tenantFilter), isNull(csoSlaBreaches.deletedAt))).orderBy(desc(csoSlaBreaches.createdAt)).limit(50),
    db.select().from(csoEscalations).where(and(eq(csoEscalations.tenantId, tenantFilter), isNull(csoEscalations.deletedAt))).orderBy(desc(csoEscalations.createdAt)).limit(50),
    db.select().from(csoCommunicationLogs).where(and(eq(csoCommunicationLogs.tenantId, tenantFilter), isNull(csoCommunicationLogs.deletedAt))).orderBy(desc(csoCommunicationLogs.createdAt)).limit(50),
    db.select().from(csoCustomerFeedback).where(and(eq(csoCustomerFeedback.tenantId, tenantFilter), isNull(csoCustomerFeedback.deletedAt))).orderBy(desc(csoCustomerFeedback.createdAt)).limit(50),
    db.select().from(csoKnowledgeArticles).where(and(eq(csoKnowledgeArticles.tenantId, tenantFilter), isNull(csoKnowledgeArticles.deletedAt))).orderBy(desc(csoKnowledgeArticles.createdAt)).limit(50),
    db.select().from(csoAgentAssignments).where(and(eq(csoAgentAssignments.tenantId, tenantFilter), isNull(csoAgentAssignments.deletedAt))).orderBy(desc(csoAgentAssignments.createdAt)).limit(50),
    db.select().from(csoResolutionNotes).where(and(eq(csoResolutionNotes.tenantId, tenantFilter), isNull(csoResolutionNotes.deletedAt))).orderBy(desc(csoResolutionNotes.createdAt)).limit(50),
  ]);

  const tabData: Record<string, { headers: string[]; rows: string[][] }> = {
    complaints: {
      headers: ["Number", "Subject", "Type", "Severity", "Customer", "Status"],
      rows: complaints.map((c) => [c.complaintNumber, c.subject, c.complaintType, c.severity, c.customerName, c.status]),
    },
    "service-requests": {
      headers: ["Number", "Subject", "Type", "Priority", "Customer", "Status"],
      rows: serviceRequests.map((r) => [r.requestNumber, r.subject, r.requestType, r.priority, r.customerName, r.status]),
    },
    categories: {
      headers: ["Code", "Name", "SLA Hours", "Active", "Sort Order"],
      rows: categories.map((c) => [c.categoryCode, c.categoryName, c.slaHours?.toString() ?? "-", c.isActive ? "Yes" : "No", c.sortOrder?.toString() ?? "0"]),
    },
    "sla-policies": {
      headers: ["Code", "Name", "Entity Type", "Response (h)", "Resolution (h)", "Active"],
      rows: slaPolicies.map((p) => [p.policyCode, p.policyName, p.entityType, p.responseTimeHours.toString(), p.resolutionTimeHours.toString(), p.isActive ? "Yes" : "No"]),
    },
    "sla-breaches": {
      headers: ["Entity Type", "Breach Type", "Expected At", "Breached At", "Overage (min)", "Acknowledged"],
      rows: slaBreaches.map((b) => [b.entityType, b.breachType, fmtDate(b.expectedAt), fmtDate(b.breachedAt), b.overageMinutes?.toString() ?? "-", b.acknowledged ? "Yes" : "No"]),
    },
    escalations: {
      headers: ["Entity Type", "Level", "Reason", "Status", "Created"],
      rows: escalations.map((e) => [e.entityType, e.escalationLevel.toString(), e.reason.slice(0, 50), e.status, fmtDate(e.createdAt)]),
    },
    "comm-logs": {
      headers: ["Direction", "Channel", "Subject", "From", "To", "Sent At"],
      rows: commLogs.map((l) => [l.direction, l.channel, l.subject ?? "-", l.fromAddress ?? "-", l.toAddress ?? "-", fmtDate(l.sentAt)]),
    },
    feedback: {
      headers: ["Entity Type", "Customer", "Rating", "Score", "Channel", "Created"],
      rows: feedback.map((f) => [f.entityType, f.customerName ?? "-", f.rating?.toString() ?? "-", f.satisfactionScore?.toString() ?? "-", f.feedbackChannel ?? "-", fmtDate(f.createdAt)]),
    },
    knowledge: {
      headers: ["Code", "Title", "Status", "Public", "Views", "Helpful"],
      rows: knowledge.map((a) => [a.articleCode, a.title, a.status, a.isPublic ? "Yes" : "No", a.viewCount.toString(), a.helpfulCount.toString()]),
    },
    assignments: {
      headers: ["Entity Type", "Status", "Started", "Completed", "Created"],
      rows: assignments.map((a) => [a.entityType, a.status, fmtDate(a.startedAt), fmtDate(a.completedAt), fmtDate(a.createdAt)]),
    },
    notes: {
      headers: ["Entity Type", "Type", "Internal", "Content", "Created"],
      rows: notes.map((n) => [n.entityType, n.noteType, n.isInternal ? "Yes" : "No", n.content.slice(0, 60), fmtDate(n.createdAt)]),
    },
  };

  const currentTab = tabData[activeTab];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/customer-service-operations" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.subject}</h1>
          <p className="text-sm text-gray-500">{record.inquiryNumber} &mdash; {record.customerName}</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link href={`/customer-service-operations/${id}/edit`} className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
          {canDelete && (
            <form action={`/api/v1/customer-service-operations/inquiries/${id}`} method="POST">
              <button type="submit" className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border bg-gray-50 p-1">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/customer-service-operations/${id}?tab=${tab.key}`}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" ? (
        <div className="rounded-lg border bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Inquiry Number", value: record.inquiryNumber },
              { label: "Subject", value: record.subject },
              { label: "Customer", value: record.customerName },
              { label: "Email", value: record.customerEmail ?? "-" },
              { label: "Phone", value: record.customerPhone ?? "-" },
              { label: "Channel", value: record.channel },
              { label: "Priority", value: record.priority },
              { label: "Status", value: record.status },
              { label: "Assigned At", value: fmtDate(record.assignedAt) },
              { label: "First Response", value: fmtDate(record.firstResponseAt) },
              { label: "Resolved At", value: fmtDate(record.resolvedAt) },
              { label: "Closed At", value: fmtDate(record.closedAt) },
            ].map((field) => (
              <div key={field.label}>
                <p className="text-xs font-medium text-gray-500">{field.label}</p>
                <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
              </div>
            ))}
          </div>
          {record.description && (
            <div className="mt-6 border-t pt-4">
              <p className="text-xs font-medium text-gray-500">Description</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.description}</p>
            </div>
          )}
        </div>
      ) : currentTab ? (
        currentTab.rows.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">No records found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  {currentTab.headers.map((h) => (
                    <th key={h} className="px-4 py-3 text-start font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentTab.rows.map((row, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-3 text-gray-600">
                        {j === row.length - 1 ? (
                          <Badge variant="secondary">{String(cell).replace(/_/g, " ")}</Badge>
                        ) : (
                          String(cell)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </div>
  );
}
