import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { EqyForm } from "@/components/equipment-control-yard-managem/eqy-form";
import type { FieldConfig } from "@/components/equipment-control-yard-managem/eqy-form";

const REEFER_FIELDS: FieldConfig[] = [
  { name: "containerFleetId", label: "Container Fleet ID", type: "text" },
  {
    name: "containerNumber",
    label: "Container Number",
    type: "text",
    required: true,
    placeholder: "RFCU1234567",
  },
  { name: "reeferUnitModel", label: "Reefer Unit Model", type: "text" },
  { name: "reeferUnitSerial", label: "Reefer Unit Serial", type: "text" },
  {
    name: "setTemperature",
    label: "Set Temperature (°C)",
    type: "number",
  },
  {
    name: "minTemperature",
    label: "Min Temperature (°C)",
    type: "number",
  },
  {
    name: "maxTemperature",
    label: "Max Temperature (°C)",
    type: "number",
  },
  { name: "humidity", label: "Humidity (%)", type: "number" },
  { name: "ventilation", label: "Ventilation", type: "text" },
  {
    name: "atmosphere",
    label: "Atmosphere",
    type: "select",
    options: [
      { value: "normal", label: "Normal" },
      { value: "CA", label: "Controlled Atmosphere (CA)" },
      { value: "MA", label: "Modified Atmosphere (MA)" },
    ],
  },
  { name: "lastPtiDate", label: "Last PTI Date", type: "datetime-local" },
  { name: "nextPtiDue", label: "Next PTI Due", type: "datetime-local" },
  {
    name: "powerStatus",
    label: "Power Status",
    type: "select",
    options: [
      { value: "on", label: "On" },
      { value: "off", label: "Off" },
      { value: "standby", label: "Standby" },
    ],
  },
  {
    name: "currentTemperature",
    label: "Current Temperature (°C)",
    type: "number",
  },
  { name: "fuelType", label: "Fuel Type", type: "text" },
  { name: "gensetRequired", label: "Genset Required", type: "checkbox" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "standby", label: "Standby" },
      { value: "under_repair", label: "Under Repair" },
      { value: "off", label: "Off" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewReeferContainerPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "equipment:create"))
  )
    redirect("/equipment-control-yard-managem/reefer-containers");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/equipment-control-yard-managem/reefer-containers"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Reefer Container
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <EqyForm
          entityType="Reefer Container"
          apiPath="/api/v1/equipment-control-yard-managem/reefer-containers"
          fields={REEFER_FIELDS}
          returnPath="/equipment-control-yard-managem/reefer-containers"
        />
      </div>
    </div>
  );
}
