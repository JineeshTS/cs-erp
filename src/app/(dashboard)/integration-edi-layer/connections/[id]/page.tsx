import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { ielIntegrationConnections } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export default async function ConnectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "integration:read")))
    redirect("/integration-edi-layer");

  const { id } = await params;

  const conn = await db
    .select()
    .from(ielIntegrationConnections)
    .where(
      and(
        eq(ielIntegrationConnections.id, id),
        eq(ielIntegrationConnections.tenantId, session.tenantId),
        isNull(ielIntegrationConnections.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!conn) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "integration:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/integration-edi-layer/connections"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {conn.connectionName}
          </h1>
          <p className="text-sm text-gray-500">
            Connection &middot; {conn.connectionCode}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/integration-edi-layer/connections/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Connection Name
            </dt>
            <dd className="mt-1 text-gray-900">{conn.connectionName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Connection Code
            </dt>
            <dd className="mt-1 text-gray-900">{conn.connectionCode}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Connection Type
            </dt>
            <dd className="mt-1 text-gray-900">{conn.connectionType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Provider</dt>
            <dd className="mt-1 text-gray-900">
              {conn.provider.replace(/_/g, " ")}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Base URL</dt>
            <dd className="mt-1 text-gray-900">{conn.baseUrl || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Auth Type</dt>
            <dd className="mt-1 text-gray-900">{conn.authType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  conn.status === "active"
                    ? "success"
                    : conn.status === "error"
                      ? "destructive"
                      : "secondary"
                }
              >
                {conn.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Health Status
            </dt>
            <dd className="mt-1">
              <Badge
                variant={
                  conn.healthStatus === "healthy"
                    ? "success"
                    : conn.healthStatus === "unhealthy"
                      ? "destructive"
                      : conn.healthStatus === "degraded"
                        ? "default"
                        : "secondary"
                }
              >
                {conn.healthStatus}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Rate Limit (per min)
            </dt>
            <dd className="mt-1 text-gray-900">
              {conn.rateLimitPerMinute !== null
                ? conn.rateLimitPerMinute
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Timeout (ms)</dt>
            <dd className="mt-1 text-gray-900">
              {conn.timeoutMs !== null ? conn.timeoutMs.toLocaleString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Last Health Check
            </dt>
            <dd className="mt-1 text-gray-900">
              {conn.lastHealthCheckAt
                ? new Date(conn.lastHealthCheckAt).toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(conn.createdAt).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(conn.updatedAt).toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      {conn.notes && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-sm font-medium text-gray-500">Notes</h2>
          <p className="mt-2 whitespace-pre-wrap text-gray-900">
            {conn.notes}
          </p>
        </div>
      )}
    </div>
  );
}
