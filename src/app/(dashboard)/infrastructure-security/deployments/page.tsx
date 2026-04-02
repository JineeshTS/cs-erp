import Link from "next/link";
import { ArrowLeft, Plus, Search, Rocket } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import { isfDeploymentConfigs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

import { escapeIlike } from "@/lib/validation";
import { parseCompoundCursor, cursorCondition, encodeCompoundCursor } from "@/lib/pagination";
function statusVariant(status: string) {
  switch (status) {
    case "running":
      return "success" as const;
    case "failed":
      return "destructive" as const;
    case "deploying":
      return "warning" as const;
    case "stopped":
      return "secondary" as const;
    default:
      return "secondary" as const;
  }
}

function healthVariant(health: string) {
  switch (health) {
    case "healthy":
      return "success" as const;
    case "unhealthy":
      return "destructive" as const;
    case "degraded":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
}

export default async function DeploymentsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "infra:read")))
    redirect("/infrastructure-security");

  const canCreate = await hasPermission(session.id, session.tenantId, "infra:create");

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const conditions = [
    eq(isfDeploymentConfigs.tenantId, session.tenantId),
    isNull(isfDeploymentConfigs.deletedAt),
  ];

  if (status) conditions.push(eq(isfDeploymentConfigs.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(isfDeploymentConfigs.deploymentName, `%${escapeIlike(search)}%`),
        ilike(isfDeploymentConfigs.deploymentCode, `%${escapeIlike(search)}%`)
      )!
    );
  }
  const parsedCursor = parseCompoundCursor(cursor);
    if (parsedCursor) conditions.push(cursorCondition(isfDeploymentConfigs.createdAt, isfDeploymentConfigs.id, parsedCursor));

  const data = await db
    .select()
    .from(isfDeploymentConfigs)
    .where(and(...conditions))
    .orderBy(desc(isfDeploymentConfigs.createdAt), desc(isfDeploymentConfigs.id))
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
    return `/infrastructure-security/deployments?${p.toString()}`;
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
            <h1 className="text-2xl font-bold text-gray-900">Deployments</h1>
            <p className="text-sm text-gray-500">
              Manage container deployment configurations
            </p>
          </div>
        </div>
        {canCreate && (
          <Link
            href="/infrastructure-security/deployments/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New Deployment
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
              placeholder="Deployment name or code..."
              className="w-full rounded-md border border-gray-300 py-2 pe-3 ps-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
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
            <option value="pending">Pending</option>
            <option value="deploying">Deploying</option>
            <option value="running">Running</option>
            <option value="failed">Failed</option>
            <option value="stopped">Stopped</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filter
        </button>
        {(search || status) && (
          <Link
            href="/infrastructure-security/deployments"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <Rocket className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No deployments found.</p>
          {canCreate && (
            <Link
              href="/infrastructure-security/deployments/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first deployment
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Deployment Name
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Code
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Image
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Replicas
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Health
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr
                  key={d.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/infrastructure-security/deployments/${d.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {d.deploymentName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {d.deploymentCode}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className="font-mono text-xs">
                      {d.imageName}:{d.imageTag}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{d.replicas}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(d.status)}>{d.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={healthVariant(d.healthStatus)}>
                      {d.healthStatus}
                    </Badge>
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
