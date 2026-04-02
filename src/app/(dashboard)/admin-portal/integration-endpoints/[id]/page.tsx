import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { adminIntegrationEndpoints } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<
  string,
  "success" | "secondary" | "warning" | "destructive"
> = {
  active: "success",
  inactive: "secondary",
  testing: "warning",
  error: "destructive",
};

export default async function IntegrationEndpointDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/admin-portal");

  const { id } = await params;

  const endpoint = await db
    .select()
    .from(adminIntegrationEndpoints)
    .where(
      and(
        eq(adminIntegrationEndpoints.id, id),
        eq(adminIntegrationEndpoints.tenantId, session.tenantId),
        isNull(adminIntegrationEndpoints.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!endpoint) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "admin:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin-portal/integration-endpoints"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{endpoint.name}</h1>
          <p className="text-sm text-gray-500">{endpoint.slug}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/admin-portal/integration-endpoints/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-gray-900">{endpoint.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Slug</dt>
            <dd className="mt-1 text-gray-900">{endpoint.slug}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Provider</dt>
            <dd className="mt-1 text-gray-900">{endpoint.provider}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Method</dt>
            <dd className="mt-1">
              <Badge variant="secondary">{endpoint.method}</Badge>
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Endpoint URL</dt>
            <dd className="mt-1 break-all text-gray-900">
              {endpoint.endpointUrl}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Auth Type</dt>
            <dd className="mt-1 text-gray-900">{endpoint.authType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Timeout (ms)</dt>
            <dd className="mt-1 text-gray-900">{endpoint.timeoutMs}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Rate Limit / min
            </dt>
            <dd className="mt-1 text-gray-900">
              {endpoint.rateLimitPerMinute ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={STATUS_VARIANT[endpoint.status] ?? "secondary"}
              >
                {endpoint.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Tested</dt>
            <dd className="mt-1 text-gray-900">
              {endpoint.lastTestedAt
                ? endpoint.lastTestedAt.toLocaleString()
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Last Test Result
            </dt>
            <dd className="mt-1 text-gray-900">
              {endpoint.lastTestResult ?? "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-gray-900">
              {endpoint.description || "-"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Auth Config</dt>
            <dd className="mt-1">
              {endpoint.authConfig ? (
                <pre className="overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-800">
                  {JSON.stringify(endpoint.authConfig, null, 2)}
                </pre>
              ) : (
                <span className="text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Headers</dt>
            <dd className="mt-1">
              {endpoint.headers ? (
                <pre className="overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-800">
                  {JSON.stringify(endpoint.headers, null, 2)}
                </pre>
              ) : (
                <span className="text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Retry Policy</dt>
            <dd className="mt-1">
              {endpoint.retryPolicy ? (
                <pre className="overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-800">
                  {JSON.stringify(endpoint.retryPolicy, null, 2)}
                </pre>
              ) : (
                <span className="text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Metadata</dt>
            <dd className="mt-1">
              {endpoint.metadata ? (
                <pre className="overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-800">
                  {JSON.stringify(endpoint.metadata, null, 2)}
                </pre>
              ) : (
                <span className="text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-gray-900">
              {endpoint.createdAt.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated</dt>
            <dd className="mt-1 text-gray-900">
              {endpoint.updatedAt.toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
