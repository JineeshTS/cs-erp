import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getYardInspection } from "@/lib/mobile-operations-app/service";
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

export default async function EditYardInspectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mob:edit")))
    redirect("/mobile-operations-app/yard-inspections");

  const { id } = await params;

  const record = await getYardInspection(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/mobile-operations-app/yard-inspections/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Yard Inspection
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MobForm
          entityType="Yard Inspection"
          apiPath={`/api/v1/mobile-operations-app/yard-inspections/${id}`}
          fields={YARD_INSPECTION_FIELDS}
          initialData={{
            inspectionType: record.inspectionType,
            yardSection: record.yardSection ?? "",
            inspectorName: record.inspectorName ?? "",
            containersChecked: record.containersChecked ?? "",
            issuesFound: record.issuesFound ?? "",
            criticalIssues: record.criticalIssues ?? "",
            completionPct: record.completionPct ?? "",
            startedAt: record.startedAt ? record.startedAt.toISOString().slice(0, 16) : "",
            completedAt: record.completedAt ? record.completedAt.toISOString().slice(0, 16) : "",
            weatherCondition: record.weatherCondition ?? "",
            photoCount: record.photoCount ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/mobile-operations-app/yard-inspections/${id}`}
        />
      </div>
    </div>
  );
}
