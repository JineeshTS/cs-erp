import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { VtmForm } from "@/components/vessel-technical-management/vtm-form";
import type { FieldConfig } from "@/components/vessel-technical-management/vtm-form";

const fields: FieldConfig[] = [
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  { name: "equipmentCode", label: "Equipment Code", type: "text" },
  { name: "equipmentName", label: "Equipment Name", type: "text" },
  {
    name: "defectCategory",
    label: "Defect Category",
    type: "select",
    required: true,
    options: [
      { value: "structural", label: "Structural" },
      { value: "mechanical", label: "Mechanical" },
      { value: "electrical", label: "Electrical" },
      { value: "piping", label: "Piping" },
      { value: "navigation", label: "Navigation" },
      { value: "safety", label: "Safety" },
      { value: "other", label: "Other" },
    ],
  },
  {
    name: "severity",
    label: "Severity",
    type: "select",
    required: true,
    options: [
      { value: "critical", label: "Critical" },
      { value: "major", label: "Major" },
      { value: "minor", label: "Minor" },
      { value: "observation", label: "Observation" },
    ],
  },
  {
    name: "reportedDate",
    label: "Reported Date",
    type: "datetime-local",
    required: true,
  },
  { name: "reportedByName", label: "Reported By", type: "text" },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    required: true,
  },
  { name: "rootCause", label: "Root Cause", type: "textarea" },
  { name: "repairMethod", label: "Repair Method", type: "textarea" },
  { name: "estimatedCost", label: "Estimated Cost", type: "number" },
  { name: "currency", label: "Currency", type: "text" },
  {
    name: "classNotificationRequired",
    label: "Class Notification Required",
    type: "checkbox",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewDefectRepairPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "technical:create"))
  )
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/vessel-technical-management/defect-repairs"
          className="rounded-md border border-gray-300 p-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Defect Report
          </h1>
          <p className="text-sm text-gray-500">
            Report a new vessel defect
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <VtmForm
          entityType="Defect Repair"
          apiPath="/api/v1/vessel-technical-management/defect-repairs"
          fields={fields}
          returnPath="/vessel-technical-management/defect-repairs"
        />
      </div>
    </div>
  );
}
