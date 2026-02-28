import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { adminAuditLogs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const SEVERITY_VARIANT: Record<string, "secondary" | "warning" | "destructive"> = {
  info: "secondary",
  warning: "warning",
  error: "destructive",
  critical: "destructive",
};

export default async function AuditLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/admin-portal");

  const { id } = await params;

  const log = await db
    .select()
    .from(adminAuditLogs)
    .where(
      and(
        eq(adminAuditLogs.id, id),
        eq(adminAuditLogs.tenantId, session.tenantId),
        isNull(adminAuditLogs.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!log) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin-portal/audit-logs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{log.action}</h1>
          <p className="text-sm text-gray-500">{log.entityType}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">ID</dt>
            <dd className="mt-1 text-gray-900">{log.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Action</dt>
            <dd className="mt-1 text-gray-900">{log.action}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Entity Type</dt>
            <dd className="mt-1 text-gray-900">{log.entityType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Entity ID</dt>
            <dd className="mt-1 text-gray-900">{log.entityId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Module</dt>
            <dd className="mt-1 text-gray-900">{log.module || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Severity</dt>
            <dd className="mt-1">
              <Badge
                variant={SEVERITY_VARIANT[log.severity] ?? "secondary"}
              >
                {log.severity}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">User ID</dt>
            <dd className="mt-1 text-gray-900">{log.userId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">User Email</dt>
            <dd className="mt-1 text-gray-900">{log.userEmail || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">IP Address</dt>
            <dd className="mt-1 text-gray-900">{log.ipAddress || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">User Agent</dt>
            <dd className="mt-1 text-gray-900">{log.userAgent || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {log.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {log.updatedAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tenant ID</dt>
            <dd className="mt-1 text-gray-900">{log.tenantId}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Metadata</dt>
            <dd className="mt-1 text-gray-900">
              {log.metadata ? (
                <pre className="overflow-auto rounded-md bg-gray-50 p-3 text-xs">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Previous Data</dt>
            <dd className="mt-1 text-gray-900">
              {log.previousData ? (
                <pre className="overflow-auto rounded-md bg-gray-50 p-3 text-xs">
                  {JSON.stringify(log.previousData, null, 2)}
                </pre>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">New Data</dt>
            <dd className="mt-1 text-gray-900">
              {log.newData ? (
                <pre className="overflow-auto rounded-md bg-gray-50 p-3 text-xs">
                  {JSON.stringify(log.newData, null, 2)}
                </pre>
              ) : (
                "-"
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
