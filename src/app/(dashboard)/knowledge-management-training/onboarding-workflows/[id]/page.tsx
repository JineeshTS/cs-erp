import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getOnboardingWorkflow } from "@/lib/knowledge-management-training/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  in_progress: "warning",
  completed: "success",
  verified: "success",
  rejected: "destructive",
} as const;

export default async function OnboardingWorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "kmt:read")))
    redirect("/knowledge-management-training");

  const { id } = await params;

  const record = await getOnboardingWorkflow(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "kmt:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/knowledge-management-training/onboarding-workflows"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.workflowRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.workflowType?.replace(/_/g, " ")} &middot; {record.employeeName || "No employee name"}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/knowledge-management-training/onboarding-workflows/${id}/edit`}
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
            <dt className="text-sm font-medium text-gray-500">Workflow Ref</dt>
            <dd className="mt-1 text-gray-900">{record.workflowRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Workflow Type</dt>
            <dd className="mt-1 text-gray-900 capitalize">{record.workflowType?.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Employee Name</dt>
            <dd className="mt-1 text-gray-900">{record.employeeName || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Employee ID</dt>
            <dd className="mt-1 text-gray-900">{record.employeeId || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Department</dt>
            <dd className="mt-1 text-gray-900">{record.department || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Position</dt>
            <dd className="mt-1 text-gray-900">{record.position || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Start Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.startDate ? record.startDate.toLocaleDateString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Target Completion Date</dt>
            <dd className="mt-1 text-gray-900">
              {record.targetCompletionDate ? record.targetCompletionDate.toLocaleDateString() : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Completed Steps</dt>
            <dd className="mt-1 text-gray-900">{record.completedSteps ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Steps</dt>
            <dd className="mt-1 text-gray-900">{record.totalSteps ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Progress (%)</dt>
            <dd className="mt-1 text-gray-900">{record.progressPct ? `${record.progressPct}%` : "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    record.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
