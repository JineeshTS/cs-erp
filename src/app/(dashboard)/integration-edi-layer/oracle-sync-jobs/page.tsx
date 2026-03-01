import Link from "next/link";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
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

export default async function OracleSyncJobsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "integration:read")))
    redirect("/integration-edi-layer");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "integration:create"
  );

  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = sp.status ?? "";
  const cursor = sp.cursor ?? "";
  const limit = 50;

  const conditions = [
    eq(ielOracleSyncJobs.tenantId, session.tenantId),
    isNull(ielOracleSyncJobs.deletedAt),
  ];

  if (status) conditions.push(eq(ielOracleSyncJobs.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(ielOracleSyncJobs.jobCode, `%${search}%`),
        ilike(ielOracleSyncJobs.entityType, `%${search}%`)
      )!
    );
  }
  if (cursor)
    conditions.push(lt(ielOracleSyncJobs.createdAt, new Date(cursor)));

  const data = await db
    .select()
    .from(ielOracleSyncJobs)
    .where(and(...conditions))
    .orderBy(desc(ielOracleSyncJobs.createdAt))
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
    return `/integration-edi-layer/oracle-sync-jobs?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/integration-edi-layer"
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Oracle Sync Jobs
            </h1>
            <p className="text-sm text-gray-500">
              Manage Oracle ERP synchronization jobs
            </p>
          </div>
        </div>
        {canCreate && (
          <Link
            href="/integration-edi-layer/oracle-sync-jobs/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Sync Job
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
              placeholder="Job code or entity type..."
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
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
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
            href="/integration-edi-layer/oracle-sync-jobs"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">No oracle sync jobs found.</p>
          {canCreate && (
            <Link
              href="/integration-edi-layer/oracle-sync-jobs/new"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Create your first sync job
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Job Code
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Sync Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Direction
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Entity Type
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Progress
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">
                  Last Sync
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((job) => (
                <tr
                  key={job.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/integration-edi-layer/oracle-sync-jobs/${job.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {job.jobCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{job.syncType}</td>
                  <td className="px-4 py-3 text-gray-600">{job.direction}</td>
                  <td className="px-4 py-3 text-gray-600">{job.entityType}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {job.recordsProcessed ?? 0}/{job.recordsTotal ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(job.status)}>
                      {job.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {fmtDate(job.lastSyncAt)}
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
