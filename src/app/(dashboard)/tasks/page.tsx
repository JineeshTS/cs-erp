import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { peTaskInstances } from "@/db/schema";
import { eq, and, isNull, desc, lt, count, sql } from "drizzle-orm";

// ── Status badge styling ──

const statusStyles: Record<string, string> = {
  pending:
    "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300",
  in_progress:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  failed:
    "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  blocked:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  cancelled:
    "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300",
};

const priorityStyles: Record<string, string> = {
  critical:
    "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  high:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
  normal:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  low:
    "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300",
};

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

function fmtLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function TasksListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "tasks:read")))
    redirect("/");

  const resolvedParams = await searchParams;
  const statusFilter = resolvedParams.status || "all";

  const canCreate = await hasPermission(
    session.id,
    session.tenantId,
    "tasks:create"
  );

  // ── Stats query ──
  const statsRows = await db
    .select({
      status: peTaskInstances.status,
      cnt: count(),
    })
    .from(peTaskInstances)
    .where(
      and(
        eq(peTaskInstances.tenantId, session.tenantId),
        isNull(peTaskInstances.deletedAt)
      )
    )
    .groupBy(peTaskInstances.status);

  const stats = { total: 0, in_progress: 0, completed: 0, overdue: 0 };
  for (const row of statsRows) {
    stats.total += Number(row.cnt);
    if (row.status === "in_progress") stats.in_progress = Number(row.cnt);
    if (row.status === "completed") stats.completed = Number(row.cnt);
  }

  // Overdue count: not completed/cancelled, dueAt < now
  const [overdueRow] = await db
    .select({ cnt: count() })
    .from(peTaskInstances)
    .where(
      and(
        eq(peTaskInstances.tenantId, session.tenantId),
        isNull(peTaskInstances.deletedAt),
        lt(peTaskInstances.dueAt, new Date()),
        sql`${peTaskInstances.status} NOT IN ('completed', 'cancelled')`
      )
    );
  stats.overdue = Number(overdueRow?.cnt ?? 0);

  // ── Task list query ──
  const conditions = [
    eq(peTaskInstances.tenantId, session.tenantId),
    isNull(peTaskInstances.deletedAt),
  ];
  if (statusFilter !== "all") {
    conditions.push(eq(peTaskInstances.status, statusFilter));
  }

  const tasks = await db
    .select()
    .from(peTaskInstances)
    .where(and(...conditions))
    .orderBy(desc(peTaskInstances.createdAt))
    .limit(50);

  const statCards = [
    { label: "Total", value: stats.total, color: "text-slate-900 dark:text-gray-100" },
    { label: "In Progress", value: stats.in_progress, color: "text-blue-600 dark:text-blue-400" },
    { label: "Completed", value: stats.completed, color: "text-green-600 dark:text-green-400" },
    { label: "Overdue", value: stats.overdue, color: "text-red-600 dark:text-red-400" },
  ];

  const tabs = ["all", "pending", "in_progress", "completed", "failed"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            Manage and track task instances
          </p>
        </div>
        {canCreate && (
          <Link
            href="/tasks/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            New Task
          </Link>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
          >
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
              {card.label}
            </p>
            <p className={`mt-1 text-2xl font-bold ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <Link
            key={tab}
            href={tab === "all" ? "/tasks" : `/tasks?status=${tab}`}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === tab
                ? "border-b-2 border-brand-600 text-brand-600"
                : "text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {fmtLabel(tab)}
          </Link>
        ))}
      </div>

      {/* Table */}
      {tasks.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
          <ClipboardList className="mx-auto h-12 w-12 text-slate-300 dark:text-gray-600" />
          <h3 className="mt-4 text-sm font-medium text-slate-900 dark:text-gray-100">
            No tasks found
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            {statusFilter !== "all"
              ? `No tasks with status "${fmtLabel(statusFilter)}".`
              : "Get started by creating your first task."}
          </p>
          {canCreate && statusFilter === "all" && (
            <Link
              href="/tasks/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              New Task
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white dark:border-gray-700 dark:bg-gray-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-gray-400">
                  Task Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-gray-400">
                  Priority
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-gray-400">
                  Assigned Role
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-gray-400">
                  Due Date
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-gray-400">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                    >
                      {task.name}
                    </Link>
                    {task.taskCode && (
                      <span className="ms-2 text-xs text-slate-400 dark:text-gray-500">
                        {task.taskCode}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusStyles[task.status] ?? statusStyles.pending
                      }`}
                    >
                      {fmtLabel(task.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        priorityStyles[task.priority] ?? priorityStyles.normal
                      }`}
                    >
                      {fmtLabel(task.priority)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-gray-300">
                    {task.assignedRole ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-gray-300">
                    {fmtDate(task.dueAt)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-gray-300">
                    {fmtDate(task.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
