import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getTempMonitoring } from "@/lib/reefer-container-management/service";
import { RcmForm } from "@/components/reefer-container-management/rcm-form";
import type { FieldConfig } from "@/components/reefer-container-management/rcm-form";

const MONITORING_FIELDS: FieldConfig[] = [
  { name: "containerNumber", label: "Container Number", type: "text", required: true },
  { name: "bookingRef", label: "Booking Ref", type: "text" },
  { name: "sensorId", label: "Sensor ID", type: "text" },
  {
    name: "sensorType",
    label: "Sensor Type",
    type: "select",
    options: [
      { value: "internal", label: "Internal" },
      { value: "external", label: "External" },
      { value: "bluetooth", label: "Bluetooth" },
      { value: "gps", label: "GPS" },
    ],
  },
  { name: "setPointTempC", label: "Set Point Temp (°C)", type: "text", required: true },
  { name: "actualTempC", label: "Actual Temp (°C)", type: "text" },
  { name: "setPointHumidity", label: "Set Point Humidity", type: "text" },
  { name: "actualHumidity", label: "Actual Humidity", type: "text" },
  { name: "supplyAirTempC", label: "Supply Air Temp (°C)", type: "text" },
  { name: "returnAirTempC", label: "Return Air Temp (°C)", type: "text" },
  { name: "o2Level", label: "O2 Level", type: "text" },
  { name: "co2Level", label: "CO2 Level", type: "text" },
  {
    name: "powerStatus",
    label: "Power Status",
    type: "select",
    options: [
      { value: "on", label: "On" },
      { value: "off", label: "Off" },
      { value: "backup", label: "Backup" },
    ],
  },
  {
    name: "compressorStatus",
    label: "Compressor Status",
    type: "select",
    options: [
      { value: "running", label: "Running" },
      { value: "stopped", label: "Stopped" },
      { value: "fault", label: "Fault" },
    ],
  },
  { name: "defrostCycleActive", label: "Defrost Cycle Active", type: "checkbox" },
  { name: "readingTimestamp", label: "Reading Timestamp", type: "datetime-local", required: true },
  { name: "locationDescription", label: "Location Description", type: "text" },
  { name: "latitude", label: "Latitude", type: "text" },
  { name: "longitude", label: "Longitude", type: "text" },
  { name: "alertTriggered", label: "Alert Triggered", type: "checkbox" },
  {
    name: "alertType",
    label: "Alert Type",
    type: "select",
    options: [
      { value: "high_temp", label: "High Temp" },
      { value: "low_temp", label: "Low Temp" },
      { value: "humidity", label: "Humidity" },
      { value: "power_loss", label: "Power Loss" },
      { value: "door_open", label: "Door Open" },
      { value: "sensor_fault", label: "Sensor Fault" },
    ],
  },
  {
    name: "dataSource",
    label: "Data Source",
    type: "select",
    options: [
      { value: "iot_sensor", label: "IoT Sensor" },
      { value: "manual", label: "Manual" },
      { value: "api", label: "API" },
      { value: "satellite", label: "Satellite" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditTempMonitoringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "reefer:edit")))
    redirect("/reefer-container-management");

  const { id } = await params;

  const record = await getTempMonitoring(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/reefer-container-management/temp-monitorings/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Temperature Monitoring</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <RcmForm
          entityType="Temperature Monitoring"
          apiPath={`/api/v1/reefer-container-management/temp-monitorings/${id}`}
          fields={MONITORING_FIELDS}
          initialData={{
            containerNumber: record.containerNumber,
            bookingRef: record.bookingRef ?? "",
            sensorId: record.sensorId ?? "",
            sensorType: record.sensorType ?? "",
            setPointTempC: record.setPointTempC ?? "",
            actualTempC: record.actualTempC ?? "",
            setPointHumidity: record.setPointHumidity ?? "",
            actualHumidity: record.actualHumidity ?? "",
            supplyAirTempC: record.supplyAirTempC ?? "",
            returnAirTempC: record.returnAirTempC ?? "",
            o2Level: record.o2Level ?? "",
            co2Level: record.co2Level ?? "",
            powerStatus: record.powerStatus ?? "",
            compressorStatus: record.compressorStatus ?? "",
            defrostCycleActive: record.defrostCycleActive ?? false,
            readingTimestamp: record.readingTimestamp ? new Date(record.readingTimestamp).toISOString() : "",
            locationDescription: record.locationDescription ?? "",
            latitude: record.latitude ?? "",
            longitude: record.longitude ?? "",
            alertTriggered: record.alertTriggered ?? false,
            alertType: record.alertType ?? "",
            dataSource: record.dataSource ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/reefer-container-management/temp-monitorings/${id}`}
        />
      </div>
    </div>
  );
}
