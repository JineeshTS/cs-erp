import Link from "next/link";
import { ArrowLeft, Search, ShieldAlert } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import { isfAuditEvents } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function severityVariant(severity: string) {
  switch (severity) {
    case "critical":
      return "destructive" as const;
    case "error":
      return "destructive" as const;
    case "warning":
      return "warning" as const;
    case "info":
      return "default" as const;
    case "debug":
      return "secondary" as const;
    default:
      return "secondary" as const;
  }
}

function outcomeVariant(outcome: string) {
  switch (outcome) {
    case "success":
      return "success" as const;
    case "failure":
      return "destructive" as const;
    case "denied":
      return "warning" as const;
    case "error":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleString();
}

export default async function AuditEventsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "infra:read")))
    redirect("/infrastructure-security");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const severity = sp.severity ?? "";
  const eventType = sp.eventType ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const conditions = [
    eq(isfAuditEvents.tenantId, session.tenantId),
    isNull(isfAuditEvents.deletedAt),
  ];

  if (severity) conditions.push(eq(isfAuditEvents.severity, severity));
  if (eventType) conditions.push(eq(isfAuditEvents.eventType, eventType));
  if (search) {
    conditions.push(
      or(
        ilike(isfAuditEvents.eventCode, `%${search}%`),
        ilike(isfAuditEvents.action, `%${search}%`)
      )!
    );
  }
  if (cursor) conditions.push(lt(isfAuditEvents.createdAt, new Date(cursor)));

  const data = await db
    .select()
    .from(isfAuditEvents)
    .where(and(...conditions))
    .orderBy(desc(isfAuditEvents.createdAt))
    .limit(limit + 1);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  function buildNextUrl(nextCur: string) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (severity) p.set("severity", severity);
    if (eventType) p.set("eventType", eventType);
    p.set("cursor", nextCur);
    return `/infrastructure-security/audit-events?${p.toString()}`;
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
            <h1 className="text-2xl font-bold text-gray-900">Audit Events</h1>
            <p className="text-sm text-gray-500">
              View security and compliance audit trail
            </p>
          </div>
        </div>
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
              placeholder="Event code or action..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="severity"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Severity
          </label>
          <select
            id="severity"
            name="severity"
            defaultValue={severity}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Severities</option>
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="eventType"
            className="mb-1 block text-xs font-medium text-gray-500"
          >
            Event Type
          </label>
          <select
            id="eventType"
            name="eventType"
            defaultValue={eventType}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="authentication">Authentication</option>
            <option value="authorization">Authorization</option>
            <option value="data_access">Data Access</option>
            <option value="data_modification">Data Modification</option>
            <option value="system">System</option>
            <option value="security">Security</option>
            <option value="compliance">Compliance</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {(search || severity || eventType) && (
          <Link
            href="/infrastructure-security/audit-events"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No audit events found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Event Code
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Event Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Action
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Severity
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Outcome
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  IP Address
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((evt) => (
                <tr
                  key={evt.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/infrastructure-security/audit-events/${evt.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {evt.eventCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {evt.eventType.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{evt.action}</td>
                  <td className="px-4 py-3">
                    <Badge variant={severityVariant(evt.severity)}>
                      {evt.severity}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={outcomeVariant(evt.outcome)}>
                      {evt.outcome}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {evt.ipAddress ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {fmtDate(evt.createdAt)}
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
