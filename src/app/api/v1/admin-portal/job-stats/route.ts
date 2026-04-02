import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { getCronQueue, getNotificationQueue, getImportExportQueue } from "@/lib/jobs/queue";

/**
 * GET /api/v1/admin-portal/job-stats
 *
 * ERP-025: Returns BullMQ queue statistics for the job monitoring dashboard.
 * Requires admin:read permission.
 */
export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();
  if (!(await hasPermission(user.id, user.tenantId, "admin:read"))) return forbiddenResponse();

  try {
    const queues = [
      { name: "Cron Jobs", queue: getCronQueue() },
      { name: "Notifications", queue: getNotificationQueue() },
      { name: "Import/Export", queue: getImportExportQueue() },
    ];

    const stats = await Promise.all(
      queues.map(async ({ name, queue }) => {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
          queue.getWaitingCount(),
          queue.getActiveCount(),
          queue.getCompletedCount(),
          queue.getFailedCount(),
          queue.getDelayedCount(),
        ]);
        const paused = 0;

        // Get recent failed jobs for debugging
        const recentFailed = await queue.getFailed(0, 4);
        const failures = recentFailed.map((j) => ({
          id: j.id,
          name: j.name,
          failedReason: j.failedReason,
          timestamp: j.timestamp,
          attemptsMade: j.attemptsMade,
        }));

        // Get repeatable (cron) jobs
        const repeatables = await queue.getRepeatableJobs();

        return {
          name,
          queueName: queue.name,
          counts: { waiting, active, completed, failed, delayed, paused },
          total: waiting + active + completed + failed + delayed + paused,
          recentFailures: failures,
          repeatableJobs: repeatables.map((r) => ({
            key: r.key,
            name: r.name,
            pattern: r.pattern,
            next: r.next,
          })),
        };
      })
    );

    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error("[job-stats] Error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch job stats" } },
      { status: 500 }
    );
  }
}
