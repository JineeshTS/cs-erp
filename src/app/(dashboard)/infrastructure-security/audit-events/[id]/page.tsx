import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
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

function formatJson(value: unknown): string {
  if (value == null) return "-";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default async function AuditEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "infra:read")))
    redirect("/infrastructure-security");

  const { id } = await params;

  const record = await db
    .select()
    .from(isfAuditEvents)
    .where(
      and(
        eq(isfAuditEvents.id, id),
        eq(isfAuditEvents.tenantId, session.tenantId),
        isNull(isfAuditEvents.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/infrastructure-security/audit-events"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.eventCode}
          </h1>
          <p className="text-sm text-gray-500">
            {record.eventType.replace(/_/g, " ")} &middot; {record.action}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Event Code</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.eventCode}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Event Type</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.eventType.replace(/_/g, " ")}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Action</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.action}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Resource Type</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.resourceType}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Resource ID</p>
            <p className="mt-0.5 font-mono text-xs text-gray-900">
              {record.resourceId ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Actor ID</p>
            <p className="mt-0.5 font-mono text-xs text-gray-900">
              {record.actorId ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Actor Type</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.actorType.replace(/_/g, " ")}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Severity</p>
            <div className="mt-0.5">
              <Badge variant={severityVariant(record.severity)}>
                {record.severity}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Outcome</p>
            <div className="mt-0.5">
              <Badge variant={outcomeVariant(record.outcome)}>
                {record.outcome}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">IP Address</p>
            <p className="mt-0.5 font-mono text-xs text-gray-900">
              {record.ipAddress ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Correlation ID</p>
            <p className="mt-0.5 font-mono text-xs text-gray-900">
              {record.correlationId ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Session ID</p>
            <p className="mt-0.5 font-mono text-xs text-gray-900">
              {record.sessionId ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Created At</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {fmtDate(record.createdAt)}
            </p>
          </div>
        </div>

        {record.userAgent && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">User Agent</p>
            <p className="mt-1 break-all text-sm text-gray-700">
              {record.userAgent}
            </p>
          </div>
        )}

        {record.notes && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
              {record.notes}
            </p>
          </div>
        )}

        {record.previousState != null && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Previous State</p>
            <pre className="mt-1 overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-700">
              {formatJson(record.previousState)}
            </pre>
          </div>
        )}

        {record.newState != null && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">New State</p>
            <pre className="mt-1 overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-700">
              {formatJson(record.newState)}
            </pre>
          </div>
        )}

        {record.changeDiff != null && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Change Diff</p>
            <pre className="mt-1 overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-700">
              {formatJson(record.changeDiff)}
            </pre>
          </div>
        )}

        {record.geoLocation != null && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Geo Location</p>
            <pre className="mt-1 overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-700">
              {formatJson(record.geoLocation)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
