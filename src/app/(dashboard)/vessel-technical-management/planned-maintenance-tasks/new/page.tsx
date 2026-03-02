import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { VtmForm } from "@/components/vessel-technical-management/vtm-form";
import type { FieldConfig } from "@/components/vessel-technical-management/vtm-form";

const fields: FieldConfig[] = [
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  {
    name: "equipmentCode",
    label: "Equipment Code",
    type: "text",
    required: true,
  },
  {
    name: "equipmentName",
    label: "Equipment Name",
    type: "text",
    required: true,
  },
  { name: "componentName", label: "Component Name", type: "text" },
  {
    name: "maintenanceType",
    label: "Maintenance Type",
    type: "select",
    required: true,
    options: [
      { label: "Preventive", value: "preventive" },
      { label: "Corrective", value: "corrective" },
      { label: "Condition Based", value: "condition_based" },
      { label: "Emergency", value: "emergency" },
    ],
  },
  {
    name: "intervalType",
    label: "Interval Type",
    type: "select",
    required: true,
    options: [
      { label: "Running Hours", value: "running_hours" },
      { label: "Calendar", value: "calendar" },
      { label: "Condition", value: "condition" },
    ],
  },
  {
    name: "intervalValue",
    label: "Interval Value",
    type: "number",
    required: true,
  },
  { name: "nextDueDate", label: "Next Due Date", type: "datetime-local" },
  {
    name: "priority",
    label: "Priority",
    type: "select",
    options: [
      { label: "Critical", value: "critical" },
      { label: "High", value: "high" },
      { label: "Medium", value: "medium" },
      { label: "Low", value: "low" },
    ],
  },
  { name: "assignedToName", label: "Assigned To", type: "text" },
  { name: "department", label: "Department", type: "text" },
  { name: "estimatedHours", label: "Estimated Hours", type: "number" },
  { name: "instructions", label: "Instructions", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewPlannedMaintenanceTaskPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "technical:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        New Maintenance Task
      </h1>
      <VtmForm
        entityType="Maintenance Task"
        apiPath="/api/v1/vessel-technical-management/planned-maintenance-tasks"
        fields={fields}
        returnPath="/vessel-technical-management/planned-maintenance-tasks"
      />
    </div>
  );
}
