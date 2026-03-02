import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { RcmForm } from "@/components/reefer-container-management/rcm-form";
import type { FieldConfig } from "@/components/reefer-container-management/rcm-form";

const POWER_FIELDS: FieldConfig[] = [
  {
    name: "containerNumber",
    label: "Container Number",
    type: "text",
    required: true,
  },
  {
    name: "locationName",
    label: "Location Name",
    type: "text",
    required: true,
  },
  {
    name: "locationType",
    label: "Location Type",
    type: "select",
    required: true,
    options: [
      { value: "terminal", label: "Terminal" },
      { value: "depot", label: "Depot" },
      { value: "vessel", label: "Vessel" },
      { value: "rail", label: "Rail" },
      { value: "truck", label: "Truck" },
    ],
  },
  { name: "plugType", label: "Plug Type", type: "text" },
  { name: "voltage", label: "Voltage", type: "text" },
  { name: "amperage", label: "Amperage", type: "text" },
  { name: "bayPosition", label: "Bay Position", type: "text" },
  { name: "tierPosition", label: "Tier Position", type: "text" },
  {
    name: "pluggedInAt",
    label: "Plugged In At",
    type: "datetime-local",
  },
  {
    name: "unpluggedAt",
    label: "Unplugged At",
    type: "datetime-local",
  },
  { name: "totalPlugHours", label: "Total Plug Hours", type: "text" },
  {
    name: "powerConsumptionKwh",
    label: "Power Consumption (kWh)",
    type: "text",
  },
  { name: "costPerKwh", label: "Cost Per kWh", type: "text" },
  { name: "totalCost", label: "Total Cost", type: "text" },
  {
    name: "currency",
    label: "Currency",
    type: "text",
    placeholder: "USD",
  },
  {
    name: "powerInterruptions",
    label: "Power Interruptions",
    type: "number",
  },
  {
    name: "lastInterruptionAt",
    label: "Last Interruption At",
    type: "datetime-local",
  },
  { name: "gensetBackup", label: "Genset Backup", type: "checkbox" },
  { name: "monitoredByName", label: "Monitored By", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewPowerManagementPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "reefer:create")))
    redirect("/reefer-container-management");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/reefer-container-management/power-management"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Power Management Record
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <RcmForm
          entityType="Power Management"
          apiPath="/api/v1/reefer-container-management/power-management"
          fields={POWER_FIELDS}
          returnPath="/reefer-container-management/power-management"
        />
      </div>
    </div>
  );
}
