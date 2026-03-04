import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewProjectPlanPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "icm:create")))
    redirect("/implementation-change-management/project-plans");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/implementation-change-management/project-plans" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Project Plan</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <IcmForm entityType="Project Plan" apiPath="/api/v1/implementation-change-management/project-plans" fields={PLAN_FIELDS} returnPath="/implementation-change-management/project-plans" />
      </div>
    </div>
  );
}
