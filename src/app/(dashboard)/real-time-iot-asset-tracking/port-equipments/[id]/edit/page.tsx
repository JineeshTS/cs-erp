import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPortEquipment } from "@/lib/real-time-iot-asset-tracking/service";
import { IotForm, type FieldConfig } from "@/components/real-time-iot-asset-tracking/iot-form";

const PORT_EQUIPMENT_FIELDS: FieldConfig[] = [
  {
    name: "equipmentType",
    label: "Equipment Type",
    type: "select",
    required: true,
    options: [
      { value: "crane_monitoring", label: "Crane Monitoring" },
      { value: "rtg_tracking", label: "RTG Tracking" },
      { value: "straddle_carrier", label: "Straddle Carrier" },
      { value: "reach_stacker", label: "Reach Stacker" },
      { value: "yard_tractor", label: "Yard Tractor" },
    ],
  },
  { name: "equipmentName", label: "Equipment Name", type: "text" },
  { name: "equipmentId", label: "Equipment ID", type: "text" },
  { name: "portCode", label: "Port Code", type: "text" },
  { name: "terminalName", label: "Terminal Name", type: "text" },
  { name: "operationalStatus", label: "Operational Status", type: "text" },
  { name: "utilizationPct", label: "Utilization %", type: "text" },
  { name: "fuelConsumption", label: "Fuel Consumption", type: "text" },
  { name: "hoursOperated", label: "Hours Operated", type: "text" },
  { name: "lastMaintenanceAt", label: "Last Maintenance At", type: "datetime-local" },
  { name: "nextMaintenanceDue", label: "Next Maintenance Due", type: "datetime-local" },
  { name: "sensorId", label: "Sensor ID", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditPortEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "iot:edit")))
    redirect("/real-time-iot-asset-tracking/port-equipments");

  const { id } = await params;

  const record = await getPortEquipment(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/real-time-iot-asset-tracking/port-equipments/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Port Equipment
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IotForm
          entityType="Port Equipment"
          apiPath={`/api/v1/real-time-iot-asset-tracking/port-equipments/${id}`}
          fields={PORT_EQUIPMENT_FIELDS}
          initialData={{
            equipmentType: record.equipmentType,
            equipmentName: record.equipmentName ?? "",
            equipmentId: record.equipmentId ?? "",
            portCode: record.portCode ?? "",
            terminalName: record.terminalName ?? "",
            operationalStatus: record.operationalStatus ?? "",
            utilizationPct: record.utilizationPct ?? "",
            fuelConsumption: record.fuelConsumption ?? "",
            hoursOperated: record.hoursOperated ?? "",
            lastMaintenanceAt: record.lastMaintenanceAt
              ? record.lastMaintenanceAt.toISOString()
              : "",
            nextMaintenanceDue: record.nextMaintenanceDue
              ? record.nextMaintenanceDue.toISOString()
              : "",
            sensorId: record.sensorId ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/real-time-iot-asset-tracking/port-equipments/${id}`}
        />
      </div>
    </div>
  );
}
