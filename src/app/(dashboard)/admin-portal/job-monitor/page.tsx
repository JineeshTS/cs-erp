import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCronQueue, getNotificationQueue, getImportExportQueue } from "@/lib/jobs/queue";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

async function getQueueStats() {
  const queues = [
    { name: "Cron Jobs", queue: getCronQueue() },
    { name: "Notifications", queue: getNotificationQueue() },
    { name: "Import/Export", queue: getImportExportQueue() },
  ];

  return Promise.all(
    queues.map(async ({ name, queue }) => {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
      ]);

      const recentFailed = await queue.getFailed(0, 4);
      const repeatables = await queue.getRepeatableJobs();

      return {
        name,
        queueName: queue.name,
        waiting,
        active,
        completed,
        failed,
        delayed,
        recentFailed: recentFailed.map((j) => ({
          id: j.id,
          name: j.name,
          failedReason: j.failedReason,
          timestamp: j.timestamp,
        })),
        repeatables: repeatables.map((r) => ({
          name: r.name,
          pattern: r.pattern,
          next: r.next,
        })),
      };
    })
  );
}

export default async function JobMonitorPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read")))
    redirect("/dashboard");

  let stats: Awaited<ReturnType<typeof getQueueStats>> = [];
  let error = "";
  try {
    stats = await getQueueStats();
  } catch (e) {
    error = "Unable to connect to Redis — job monitoring unavailable.";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-gray-100">
          Job Monitor
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
          BullMQ queue statistics and recent failures
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Queue overview cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((q) => (
          <div
            key={q.queueName}
            className="rounded-lg border border-slate-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
          >
            <h3 className="text-sm font-semibold text-slate-900 dark:text-gray-100">{q.name}</h3>
            <p className="mb-3 text-xs text-slate-400">{q.queueName}</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-brand-600">{q.active}</div>
                <div className="text-xs text-slate-500">Active</div>
              </div>
              <div>
                <div className="text-lg font-bold text-amber-600">{q.waiting + q.delayed}</div>
                <div className="text-xs text-slate-500">Queued</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">{q.failed}</div>
                <div className="text-xs text-slate-500">Failed</div>
              </div>
            </div>
            <div className="mt-3 text-right text-xs text-slate-400">
              {q.completed.toLocaleString()} completed total
            </div>
          </div>
        ))}
      </div>

      {/* Scheduled (repeatable) jobs */}
      <div className="rounded-lg border border-slate-200 dark:border-gray-700">
        <div className="border-b border-slate-200 px-4 py-3 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-gray-100">Scheduled Cron Jobs</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-gray-800/50">
              <TableHead>Job</TableHead>
              <TableHead>Queue</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Next Run</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.flatMap((q) =>
              q.repeatables.map((r, i) => (
                <TableRow key={`${q.queueName}-${i}`}>
                  <TableCell className="text-sm font-medium text-slate-700 dark:text-gray-300">
                    {r.name}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">{q.name}</TableCell>
                  <TableCell>
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">
                      {r.pattern}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {r.next ? new Date(r.next).toLocaleString() : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Recent failures */}
      {stats.some((q) => q.recentFailed.length > 0) && (
        <div className="rounded-lg border border-red-200 dark:border-red-800">
          <div className="border-b border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20">
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">Recent Failures</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Queue</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Error</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.flatMap((q) =>
                q.recentFailed.map((f) => (
                  <TableRow key={`${q.queueName}-${f.id}`}>
                    <TableCell>
                      <Badge variant="destructive">{q.name}</Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-700 dark:text-gray-300">
                      {f.name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-red-600 dark:text-red-400">
                      {f.failedReason || "Unknown error"}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {f.timestamp ? new Date(f.timestamp).toLocaleString() : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
