import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getProjectPlan } from "@/lib/implementation-change-management/service";
import { IcmForm, type FieldConfig } from "@/components/implementation-change-management/icm-form";

const PLAN_FIELDS: FieldConfig[] = [
  { name: "planType", label: "Plan Type", type: "select", required: true, options: [
    { value: "implementation", label: "Implementation" },
    { value: "upgrade", label: "Upgrade" },
    { value: "migration", label: "Migration" },
    { value: "integration", label: "Integration" },
    { value: "rollout", label: "Rollout" },
  ]},
  { name: "title", label: "Title", type: "text" },
  { name: "projectManager", label: "Project Manager", type: "text" },
  { name: "department", label: "Department", type: "text" },
  { name: "startDate", label: "Start Date", type: "datetime-local" },
  { name: "targetEndDate", label: "Target End Date", type: "datetime-local" },
  { name: "actualEndDate", label: "Actual End Date", type: "datetime-local" },
  { name: "totalMilestones", label: "Total Milestones", type: "number" },
  { name: "completedMilestones", label: "Completed Milestones", type: "number" },
  { name: "progressPct", label: "Progress (%)", type: "text" },
  { name: "budget", label: "Budget", type: "text" },
  { name: "priority", label: "Priority", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditProjectPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "icm:edit")))
    redirect("/implementation-change-management/project-plans");

  const { id } = await params;
  const record = await getProjectPlan(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/implementation-change-management/project-plans/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Project Plan</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <IcmForm entityType="Project Plan" apiPath={`/api/v1/implementation-change-management/project-plans/${id}`} fields={PLAN_FIELDS}
          initialData={{
            planType: record.planType,
            title: record.title ?? "",
            projectManager: record.projectManager ?? "",
            department: record.department ?? "",
            startDate: record.startDate ? record.startDate.toISOString().slice(0, 16) : "",
            targetEndDate: record.targetEndDate ? record.targetEndDate.toISOString().slice(0, 16) : "",
            actualEndDate: record.actualEndDate ? record.actualEndDate.toISOString().slice(0, 16) : "",
            totalMilestones: record.totalMilestones ?? "",
            completedMilestones: record.completedMilestones ?? "",
            progressPct: record.progressPct ?? "",
            budget: record.budget ?? "",
            priority: record.priority ?? "",
            notes: record.notes ?? "",
          }}
          isEdit returnPath={`/implementation-change-management/project-plans/${id}`} />
      </div>
    </div>
  );
}
