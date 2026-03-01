import Link from "next/link";
import { Plus, AlertTriangle, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike } from "drizzle-orm";
import { aafEscalations } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

function severityVariant(severity: string) {
  switch (severity) {
    case "critical":
      return "destructive" as const;
    case "high":
      return "warning" as const;
    case "medium":
      return "secondary" as const;
    case "low":
      return "default" as const;
    default:
      return "secondary" as const;
  }
}

function statusVariant(status: string) {
  switch (status) {
    case "resolved":
      return "success" as const;
    case "dismissed":
      return "secondary" as const;
    case "open":
      return "destructive" as const;
    case "assigned":
      return "warning" as const;
    case "in_review":
      return "default" as const;
    default:
      return "secondary" as const;
  }
}

export default async function EscalationsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "ai:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const conditions = [
    eq(aafEscalations.tenantId, session.tenantId),
    isNull(aafEscalations.deletedAt),
  ];
  if (search) {
    conditions.push(ilike(aafEscalations.escalationRef, `%${search}%`));
  }
  if (status) conditions.push(eq(aafEscalations.status, status));
  if (cursor) conditions.push(lt(aafEscalations.createdAt, new Date(cursor)));

  const data = await db
    .select()
    .from(aafEscalations)
    .where(and(...conditions))
    .orderBy(desc(aafEscalations.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("cursor", nextCur);
    return `/ai-agent-framework/escalations?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Escalations</h1>
          <p className="text-sm text-gray-500">
            Human-in-loop escalation management for AI agent operations
          </p>
        </div>
        {canCreate && (
          <Link
            href="/ai-agent-framework/escalations/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Escalation
          </Link>
        )}
      </div>

      {/* Filters */}
      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id="search"
              name="search"
              type="text"
              defaultValue={search}
              placeholder="Escalation reference..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-500">Status</label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Filter</button>
        {(search || status) && (
          <Link href="/ai-agent-framework/escalations" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</Link>
        )}
      </form>

      {/* Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No escalations found.</p>
          {canCreate && (
            <Link href="/ai-agent-framework/escalations/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
              Create your first escalation
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">Reference</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Source Type</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Severity</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Priority</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Reason</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/ai-agent-framework/escalations/${t.id}`} className="font-medium text-gray-900 hover:underline">
                      {t.escalationRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.sourceType.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">
                    <Badge variant={severityVariant(t.severity)}>
                      {t.severity}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.priority}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(t.status)}>
                      {t.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{(t.reason ?? "").slice(0, 50)}{(t.reason ?? "").length > 50 ? "..." : ""}</td>
                  <td className="px-4 py-3 text-gray-600">{fmtDate(t.createdAt)}</td>
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
