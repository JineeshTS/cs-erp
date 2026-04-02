import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { MobForm, type FieldConfig } from "@/components/mobile-operations-app/mob-form";

const YARD_INSPECTION_FIELDS: FieldConfig[] = [
  {
    name: "inspectionType",
    label: "Inspection Type",
    type: "select",
    required: true,
    options: [
      { value: "routine_check", label: "Routine Check" },
      { value: "safety_audit", label: "Safety Audit" },
      { value: "inventory_count", label: "Inventory Count" },
      { value: "condition_survey", label: "Condition Survey" },
      { value: "compliance_review", label: "Compliance Review" },
    ],
  },
  { name: "yardSection", label: "Yard Section", type: "text" },
  { name: "inspectorName", label: "Inspector Name", type: "text" },
  { name: "containersChecked", label: "Containers Checked", type: "number" },
  { name: "issuesFound", label: "Issues Found", type: "number" },
  { name: "criticalIssues", label: "Critical Issues", type: "number" },
  { name: "completionPct", label: "Completion %", type: "text" },
  { name: "startedAt", label: "Started At", type: "datetime-local" },
  { name: "completedAt", label: "Completed At", type: "datetime-local" },
  { name: "weatherCondition", label: "Weather Condition", type: "text" },
  { name: "photoCount", label: "Photo Count", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewYardInspectionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "mob:create"))
  )
    redirect("/mobile-operations-app/yard-inspections");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/mobile-operations-app/yard-inspections"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Yard Inspection
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MobForm
          entityType="Yard Inspection"
          apiPath="/api/v1/mobile-operations-app/yard-inspections"
          fields={YARD_INSPECTION_FIELDS}
          returnPath="/mobile-operations-app/yard-inspections"
        />
      </div>
    </div>
  );
}
