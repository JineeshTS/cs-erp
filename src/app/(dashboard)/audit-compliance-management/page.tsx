import Link from "next/link";
import {
  Plus,
  FileText,
  Search,
  ClipboardCheck,
  Calendar,
  AlertTriangle,
  BookOpen,
  Send,
  Shield,
  Award,
  Bot,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { sql, eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import {
  acmInternalAudits,
  acmRegulatoryComplianceCalendars,
  acmRiskRegisters,
  acmPolicyProcedures,
  acmRegulatoryReportingSubmissions,
  acmSoxFinancialControls,
  acmIsoCertificationTrackings,
  acmAiRiskDetections,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
export default async function AuditComplianceManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "audit:read")))
    redirect("/");

  const canCreate = await hasPermission(session.id, session.tenantId, "audit:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const [activeAudits, pendingCompliance, highRisks, activePolicies, pendingSubmissions, activeControls, activeCertifications, activeDetections] =
    await Promise.all([
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(acmInternalAudits)
        .where(and(eq(acmInternalAudits.tenantId, session.tenantId), isNull(acmInternalAudits.deletedAt), eq(acmInternalAudits.status, "in_progress")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(acmRegulatoryComplianceCalendars)
        .where(and(eq(acmRegulatoryComplianceCalendars.tenantId, session.tenantId), isNull(acmRegulatoryComplianceCalendars.deletedAt), eq(acmRegulatoryComplianceCalendars.status, "pending")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(acmRiskRegisters)
        .where(and(eq(acmRiskRegisters.tenantId, session.tenantId), isNull(acmRiskRegisters.deletedAt), eq(acmRiskRegisters.riskLevel, "high")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(acmPolicyProcedures)
        .where(and(eq(acmPolicyProcedures.tenantId, session.tenantId), isNull(acmPolicyProcedures.deletedAt), eq(acmPolicyProcedures.status, "active")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(acmRegulatoryReportingSubmissions)
        .where(and(eq(acmRegulatoryReportingSubmissions.tenantId, session.tenantId), isNull(acmRegulatoryReportingSubmissions.deletedAt), eq(acmRegulatoryReportingSubmissions.status, "pending")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(acmSoxFinancialControls)
        .where(and(eq(acmSoxFinancialControls.tenantId, session.tenantId), isNull(acmSoxFinancialControls.deletedAt), eq(acmSoxFinancialControls.status, "active")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(acmIsoCertificationTrackings)
        .where(and(eq(acmIsoCertificationTrackings.tenantId, session.tenantId), isNull(acmIsoCertificationTrackings.deletedAt), eq(acmIsoCertificationTrackings.status, "active")))
        .then((r) => r[0]?.value ?? 0),
      db.select({ value: sql<number>`cast(count(*) as int)` }).from(acmAiRiskDetections)
        .where(and(eq(acmAiRiskDetections.tenantId, session.tenantId), isNull(acmAiRiskDetections.deletedAt), eq(acmAiRiskDetections.status, "active")))
        .then((r) => r[0]?.value ?? 0),
    ]);

  const conditions = [
    eq(acmInternalAudits.tenantId, session.tenantId),
    isNull(acmInternalAudits.deletedAt),
  ];
  if (status) conditions.push(eq(acmInternalAudits.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(acmInternalAudits.auditRef, `%${escapeIlike(search)}%`),
        ilike(acmInternalAudits.title, `%${escapeIlike(search)}%`)
      )!
    );
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(acmInternalAudits.createdAt, acmInternalAudits.id, parsedCursor));

  const data = await db.select().from(acmInternalAudits)
    .where(and(...conditions))
    .orderBy(desc(acmInternalAudits.createdAt), desc(acmInternalAudits.id))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/audit-compliance-management?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit & Compliance Management</h1>
          <p className="text-sm text-gray-500">Internal audits, compliance calendars, risk registers, policies, regulatory submissions, SOX controls, ISO certifications, and AI risk detection</p>
        </div>
        {canCreate && (
          <Link href="/audit-compliance-management/internal-audits/new" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Audit
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600"><ClipboardCheck className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Audits</p><p className="text-2xl font-bold text-gray-900">{activeAudits}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600"><Calendar className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Compliance</p><p className="text-2xl font-bold text-gray-900">{pendingCompliance}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600"><AlertTriangle className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">High Risks</p><p className="text-2xl font-bold text-gray-900">{highRisks}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600"><BookOpen className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Active Policies</p><p className="text-2xl font-bold text-gray-900">{activePolicies}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600"><Send className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">Pending Submissions</p><p className="text-2xl font-bold text-gray-900">{pendingSubmissions}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2.5 text-yellow-600"><Shield className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">SOX Controls</p><p className="text-2xl font-bold text-gray-900">{activeControls}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600"><Award className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">ISO Certifications</p><p className="text-2xl font-bold text-gray-900">{activeCertifications}</p></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600"><Bot className="h-5 w-5" /></div>
            <div><p className="text-sm text-gray-500">AI Detections</p><p className="text-2xl font-bold text-gray-900">{activeDetections}</p></div>
          </div>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input id="search" name="search" type="text" defaultValue={search} placeholder="Audit ref, title..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select id="status" name="status" defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/audit-compliance-management" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No internal audits found.</p>
          {canCreate && (
            <Link href="/audit-compliance-management/internal-audits/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first audit</Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Title</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Lead Auditor</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Risk Rating</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/audit-compliance-management/internal-audits/${t.id}`} className="font-medium text-gray-900 hover:underline">{t.auditRef}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.title}</td>
                  <td className="px-4 py-3 text-gray-600">{t.auditType}</td>
                  <td className="px-4 py-3 text-gray-600">{t.leadAuditor || "-"}</td>
                  <td className="px-4 py-3">
                    {t.riskRating ? (
                      <Badge variant={t.riskRating === "critical" || t.riskRating === "high" ? "destructive" : t.riskRating === "medium" ? "secondary" : "success"}>{t.riskRating}</Badge>
                    ) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === "completed" ? "success" : t.status === "cancelled" ? "destructive" : "secondary"}>{t.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && nextCursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link href={buildNextUrl(nextCursor)} className="text-sm text-blue-600 hover:underline">Load more</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
