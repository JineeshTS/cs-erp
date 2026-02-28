import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { eqyReeferContainers } from "@/db/schema";
import { EqyForm } from "@/components/equipment-control-yard-managem/eqy-form";
import type { FieldConfig } from "@/components/equipment-control-yard-managem/eqy-form";

const REEFER_FIELDS: FieldConfig[] = [
  { name: "containerFleetId", label: "Container Fleet ID", type: "text" },
  {
    name: "containerNumber",
    label: "Container Number",
    type: "text",
    required: true,
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

export default async function EditReeferContainerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:edit")))
    redirect("/equipment-control-yard-managem/reefer-containers");

  const { id } = await params;
  const record = await db
    .select()
    .from(eqyReeferContainers)
    .where(
      and(
        eq(eqyReeferContainers.id, id),
        eq(eqyReeferContainers.tenantId, session.tenantId),
        isNull(eqyReeferContainers.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    containerFleetId: record.containerFleetId ?? "",
    containerNumber: record.containerNumber,
    reeferUnitModel: record.reeferUnitModel ?? "",
    reeferUnitSerial: record.reeferUnitSerial ?? "",
    setTemperature: record.setTemperature ? Number(record.setTemperature) : "",
    minTemperature: record.minTemperature ? Number(record.minTemperature) : "",
    maxTemperature: record.maxTemperature ? Number(record.maxTemperature) : "",
    humidity: record.humidity ? Number(record.humidity) : "",
    ventilation: record.ventilation ?? "",
    atmosphere: record.atmosphere ?? "normal",
    lastPtiDate: record.lastPtiDate?.toISOString() ?? "",
    nextPtiDue: record.nextPtiDue?.toISOString() ?? "",
    powerStatus: record.powerStatus ?? "off",
    currentTemperature: record.currentTemperature
      ? Number(record.currentTemperature)
      : "",
    fuelType: record.fuelType ?? "",
    gensetRequired: record.gensetRequired ?? false,
    status: record.status,
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/equipment-control-yard-managem/reefer-containers/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Reefer Container
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <EqyForm
          entityType="Reefer Container"
          apiPath={`/api/v1/equipment-control-yard-managem/reefer-containers/${id}`}
          fields={REEFER_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/equipment-control-yard-managem/reefer-containers/${id}`}
        />
      </div>
    </div>
  );
}
