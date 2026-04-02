import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getProjectPlan } from "@/lib/implementation-change-management/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = { draft: "secondary", in_progress: "warning", completed: "success", verified: "success", rejected: "destructive" } as const;

export default async function ProjectPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "icm:read")))
    redirect("/implementation-change-management");

  const { id } = await params;
  const record = await getProjectPlan(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "icm:edit");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/implementation-change-management/project-plans" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.planRef}</h1>
          <p className="text-sm text-gray-500">{record.planType?.replace(/_/g, " ")} &middot; {record.title || "Untitled"}</p>
        </div>
        {canEdit && (
          <Link href={`/implementation-change-management/project-plans/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="text-sm font-medium text-gray-500">Plan Ref</dt><dd className="mt-1 text-gray-900">{record.planRef}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Plan Type</dt><dd className="mt-1 text-gray-900 capitalize">{record.planType?.replace(/_/g, " ")}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Title</dt><dd className="mt-1 text-gray-900">{record.title || "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Project Manager</dt><dd className="mt-1 text-gray-900">{record.projectManager || "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Department</dt><dd className="mt-1 text-gray-900">{record.department || "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Start Date</dt><dd className="mt-1 text-gray-900">{record.startDate ? record.startDate.toLocaleDateString() : "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Target End Date</dt><dd className="mt-1 text-gray-900">{record.targetEndDate ? record.targetEndDate.toLocaleDateString() : "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Actual End Date</dt><dd className="mt-1 text-gray-900">{record.actualEndDate ? record.actualEndDate.toLocaleDateString() : "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Total Milestones</dt><dd className="mt-1 text-gray-900">{record.totalMilestones ?? "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Completed Milestones</dt><dd className="mt-1 text-gray-900">{record.completedMilestones ?? "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Progress</dt><dd className="mt-1 text-gray-900">{record.progressPct ? `${record.progressPct}%` : "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Budget</dt><dd className="mt-1 text-gray-900">{record.budget || "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Priority</dt><dd className="mt-1 text-gray-900">{record.priority || "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Status</dt><dd className="mt-1"><Badge variant={statusVariant[record.status as keyof typeof statusVariant] ?? "secondary"}>{record.status}</Badge></dd></div>
          <div className="sm:col-span-2 lg:col-span-3"><dt className="text-sm font-medium text-gray-500">Notes</dt><dd className="mt-1 text-gray-900">{record.notes || "-"}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Created At</dt><dd className="mt-1 text-gray-900">{record.createdAt.toLocaleDateString()}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Updated At</dt><dd className="mt-1 text-gray-900">{record.updatedAt.toLocaleDateString()}</dd></div>
        </dl>
      </div>
    </div>
  );
}
