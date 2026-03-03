import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IotForm, type FieldConfig } from "@/components/real-time-iot-asset-tracking/iot-form";

const REEFER_MONITORING_FIELDS: FieldConfig[] = [
  {
    name: "monitoringType",
    label: "Monitoring Type",
    type: "select",
    required: true,
    options: [
      { value: "temperature_reading", label: "Temperature Reading" },
      { value: "humidity_reading", label: "Humidity Reading" },
      { value: "defrost_cycle", label: "Defrost Cycle" },
      { value: "alarm_event", label: "Alarm Event" },
      { value: "compliance_check", label: "Compliance Check" },
    ],
  },
  { name: "containerNumber", label: "Container Number", type: "text" },
  { name: "setTemperature", label: "Set Temperature", type: "text" },
  { name: "actualTemperature", label: "Actual Temperature", type: "text" },
  { name: "returnAirTemp", label: "Return Air Temp", type: "text" },
  { name: "supplyAirTemp", label: "Supply Air Temp", type: "text" },
  { name: "humidity", label: "Humidity", type: "text" },
  { name: "ventSetting", label: "Vent Setting", type: "text" },
  { name: "o2Level", label: "O2 Level", type: "text" },
  { name: "co2Level", label: "CO2 Level", type: "text" },
  { name: "powerStatus", label: "Power Status", type: "text" },
  { name: "alarmCode", label: "Alarm Code", type: "text" },
  { name: "sensorId", label: "Sensor ID", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewReeferMonitoringPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "iot:create"))
  )
    redirect("/real-time-iot-asset-tracking/reefer-monitorings");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/real-time-iot-asset-tracking/reefer-monitorings"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Reefer Monitoring
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IotForm
          entityType="Reefer Monitoring"
          apiPath="/api/v1/real-time-iot-asset-tracking/reefer-monitorings"
          fields={REEFER_MONITORING_FIELDS}
          returnPath="/real-time-iot-asset-tracking/reefer-monitorings"
        />
      </div>
    </div>
  );
}
