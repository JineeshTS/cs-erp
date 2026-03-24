import Link from "next/link";
import { ArrowLeft, Plus, Search, FileCheck } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import { isfComplianceReports } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
function statusVariant(status: string) {
  switch (status) {
    case "published":
      return "success" as const;
    case "review":
      return "warning" as const;
    case "in_progress":
      return "default" as const;
    case "draft":
      return "secondary" as const;
    case "archived":
      return "secondary" as const;
    default:
      return "secondary" as const;
  }
}

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default async function ComplianceReportsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "infra:read")))
    redirect("/infrastructure-security");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "infra:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const reportType = sp.reportType ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const conditions = [
    eq(isfComplianceReports.tenantId, session.tenantId),
    isNull(isfComplianceReports.deletedAt),
  ];

  if (reportType)
    conditions.push(eq(isfComplianceReports.reportType, reportType));
  if (status) conditions.push(eq(isfComplianceReports.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(isfComplianceReports.reportName, `%${escapeIlike(search)}%`),
        ilike(isfComplianceReports.reportCode, `%${escapeIlike(search)}%`)
      )!
    );
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(isfComplianceReports.createdAt, isfComplianceReports.id, parsedCursor));

  const data = await db
    .select()
    .from(isfComplianceReports)
    .where(and(...conditions))
    .orderBy(desc(isfComplianceReports.createdAt), desc(isfComplianceReports.id))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (reportType) p.set("reportType", reportType);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/infrastructure-security/compliance-reports?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/infrastructure-security"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Compliance Reports
            </h1>
            <p className="text-sm text-gray-500">
              Manage compliance and regulatory reports
            </p>
          </div>
        </div>
        {canCreate && (
          <Link
            href="/infrastructure-security/compliance-reports/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New Report
          </Link>
        )}
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label
            htmlFor="search"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Search
          </label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id="search"
              name="search"
              type="text"
              defaultValue={search}
              placeholder="Report name or code..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="reportType"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Report Type
          </label>
          <select
            id="reportType"
            name="reportType"
            defaultValue={reportType}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="soc2">SOC 2</option>
            <option value="iso27001">ISO 27001</option>
            <option value="gdpr">GDPR</option>
            <option value="pci_dss">PCI DSS</option>
            <option value="hipaa">HIPAA</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="status"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {(search || reportType || status) && (
          <Link
            href="/infrastructure-security/compliance-reports"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <FileCheck className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No compliance reports found.</p>
          {canCreate && (
            <Link
              href="/infrastructure-security/compliance-reports/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first report
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Report Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Code
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Framework
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Score
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Period Start
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((rpt) => (
                <tr
                  key={rpt.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/infrastructure-security/compliance-reports/${rpt.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {rpt.reportName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rpt.reportCode}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rpt.reportType.replace(/_/g, " ").toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rpt.framework ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(rpt.status)}>
                      {rpt.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {rpt.overallScore != null ? `${rpt.overallScore}%` : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {fmtDate(rpt.periodStart)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && nextCursor && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href={buildNextUrl(nextCursor)}
                className="text-sm text-blue-600 hover:underline"
              >
                Load more
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
