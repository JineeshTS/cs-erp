import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { ielOracleSyncJobs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  switch (status) {
    case "completed":
      return "success" as const;
    case "failed":
      return "destructive" as const;
    case "running":
      return "default" as const;
    case "pending":
      return "secondary" as const;
    case "cancelled":
      return "warning" as const;
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

export default async function OracleSyncJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "integration:read")))
    redirect("/integration-edi-layer");

  const { id } = await params;

  const record = await db
    .select()
    .from(ielOracleSyncJobs)
    .where(
      and(
        eq(ielOracleSyncJobs.id, id),
        eq(ielOracleSyncJobs.tenantId, session.tenantId),
        isNull(ielOracleSyncJobs.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/integration-edi-layer/oracle-sync-jobs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.jobCode}
          </h1>
          <p className="text-sm text-gray-500">
            {record.syncType} &middot; {record.entityType}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Job Code</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.jobCode}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Sync Type</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.syncType}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Direction</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.direction}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Entity Type</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.entityType}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <div className="mt-0.5">
              <Badge variant={statusVariant(record.status)}>
                {record.status}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Records Total</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.recordsTotal ?? 0}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Records Processed
            </p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.recordsProcessed ?? 0}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Records Failed</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.recordsFailed ?? 0}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Started At</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {fmtDate(record.startedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Completed At</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {fmtDate(record.completedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Schedule Cron</p>
            <p className="mt-0.5 font-mono text-xs text-gray-900">
              {record.scheduleCron ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Last Sync At</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {fmtDate(record.lastSyncAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Connection ID</p>
            <p className="mt-0.5 font-mono text-xs text-gray-900">
              {record.connectionId ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Created At</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {fmtDate(record.createdAt)}
            </p>
          </div>
        </div>

        {record.errorLog != null && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Error Log</p>
            <pre className="mt-1 overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-700">
              {formatJson(record.errorLog)}
            </pre>
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
      </div>
    </div>
  );
}
