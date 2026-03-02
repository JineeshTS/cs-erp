import Link from "next/link";
import { Plus, Search, FileText } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc, lt, ilike, or } from "drizzle-orm";
import { vtmPlannedMaintenanceTasks } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const PAGE_SIZE = 50;

function statusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge variant="success">{status}</Badge>;
    case "overdue":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function PlannedMaintenanceTasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "technical:read")))
    redirect("/");

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "technical:create"
  );

  const { search, status, cursor } = await searchParams;

  const conditions = [
    eq(vtmPlannedMaintenanceTasks.tenantId, session.tenantId),
    isNull(vtmPlannedMaintenanceTasks.deletedAt),
  ];

  if (search) {
    conditions.push(
      or(
        ilike(vtmPlannedMaintenanceTasks.taskRef, `%${search}%`),
        ilike(vtmPlannedMaintenanceTasks.vesselName, `%${search}%`),
        ilike(vtmPlannedMaintenanceTasks.equipmentName, `%${search}%`)
      )!
    );
  }

  if (status) {
    conditions.push(eq(vtmPlannedMaintenanceTasks.status, status));
  }

  if (cursor) {
    conditions.push(lt(vtmPlannedMaintenanceTasks.createdAt, new Date(cursor)));
  }

  const tasks = await db
    .select()
    .from(vtmPlannedMaintenanceTasks)
    .where(and(...conditions))
    .orderBy(desc(vtmPlannedMaintenanceTasks.createdAt))
    .limit(PAGE_SIZE + 1);

  const hasMore = tasks.length > PAGE_SIZE;
  const items = hasMore ? tasks.slice(0, PAGE_SIZE) : tasks;
  const nextCursor =
    hasMore && items.length > 0
      ? items[items.length - 1].createdAt.toISOString()
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Planned Maintenance Tasks
        </h1>
        {canCreate && (
          <Link
            href="/vessel-technical-management/planned-maintenance-tasks/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Task
          </Link>
        )}
      </div>

      <form method="GET" className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="search"
              name="search"
              type="text"
              defaultValue={search ?? ""}
              placeholder="Search by ref, vessel, equipment..."
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="min-w-[160px]">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
        >
          <Search className="h-4 w-4" />
          Filter
        </button>
      </form>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16 dark:border-gray-600">
          <FileText className="h-12 w-12 text-gray-400" />
          <p className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-100">
            No maintenance tasks found
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {search || status
              ? "Try adjusting your search or filter criteria."
              : "Get started by creating a new maintenance task."}
          </p>
          {canCreate && !search && !status && (
            <Link
              href="/vessel-technical-management/planned-maintenance-tasks/new"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New Task
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Ref
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Vessel
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Equipment
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Type
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Priority
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {items.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <Link
                      href={`/vessel-technical-management/planned-maintenance-tasks/${t.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {t.taskRef}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {t.vesselName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {t.equipmentName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {t.maintenanceType}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {t.priority}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {statusBadge(t.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {items.length} result{items.length !== 1 ? "s" : ""}
        </p>
        {nextCursor && (
          <Link
            href={{
              pathname:
                "/vessel-technical-management/planned-maintenance-tasks",
              query: {
                ...(search ? { search } : {}),
                ...(status ? { status } : {}),
                cursor: nextCursor,
              },
            }}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Next Page
          </Link>
        )}
      </div>
    </div>
  );
}
