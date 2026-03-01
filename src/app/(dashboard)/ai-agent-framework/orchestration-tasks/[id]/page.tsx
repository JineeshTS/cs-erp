import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { aafOrchestrationTasks } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

function fmtDateTime(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleString();
}

function fmtDuration(ms: number | null): string {
  if (ms === null || ms === undefined) return "-";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function statusVariant(status: string) {
  switch (status) {
    case "completed":
      return "success" as const;
    case "running":
      return "success" as const;
    case "failed":
      return "destructive" as const;
    case "cancelled":
      return "default" as const;
    default:
      return "secondary" as const;
  }
}

function priorityVariant(priority: string) {
  switch (priority) {
    case "urgent":
      return "destructive" as const;
    case "high":
      return "default" as const;
    default:
      return "secondary" as const;
  }
}

export default async function OrchestrationTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:read")))
    redirect("/");

  const { id } = await params;

  const record = await db
    .select()
    .from(aafOrchestrationTasks)
    .where(
      and(
        eq(aafOrchestrationTasks.id, id),
        eq(aafOrchestrationTasks.tenantId, session.tenantId),
        isNull(aafOrchestrationTasks.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/ai-agent-framework/orchestration-tasks"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.taskName}
          </h1>
          <p className="text-sm text-gray-500">{record.taskCode}</p>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">Task Name</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.taskName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Task Code</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.taskCode}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Strategy</p>
            <p className="mt-0.5 text-sm text-gray-900">{record.strategy}</p>
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
            <p className="text-xs font-medium text-gray-500">Priority</p>
            <div className="mt-0.5">
              <Badge variant={priorityVariant(record.priority)}>
                {record.priority}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Progress</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.currentStep} / {record.totalSteps}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Started At</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {fmtDateTime(record.startedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Completed At</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {fmtDateTime(record.completedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Duration</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {fmtDuration(record.durationMs)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Triggered By</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {record.triggeredBy ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Created At</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {fmtDate(record.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Updated At</p>
            <p className="mt-0.5 text-sm text-gray-900">
              {fmtDate(record.updatedAt)}
            </p>
          </div>
        </div>

        {record.errorMessage && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Error Message</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-red-700">
              {record.errorMessage}
            </p>
          </div>
        )}

        {record.description && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Description</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
              {record.description}
            </p>
          </div>
        )}

        {record.notes && (
          <div className="mt-4 border-t pt-4">
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
