import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getTempAlert } from "@/lib/reefer-container-management/service";
import { RcmForm } from "@/components/reefer-container-management/rcm-form";
import type { FieldConfig } from "@/components/reefer-container-management/rcm-form";

const TEMP_ALERT_FIELDS: FieldConfig[] = [
  { name: "containerNumber", label: "Container Number", type: "text", required: true },
  { name: "bookingRef", label: "Booking Ref", type: "text" },
  {
    name: "alertType",
    label: "Alert Type",
    type: "select",
    required: true,
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
    name: "alertSeverity",
    label: "Alert Severity",
    type: "select",
    required: true,
    options: [
      { value: "warning", label: "Warning" },
      { value: "critical", label: "Critical" },
      { value: "emergency", label: "Emergency" },
    ],
  },
  { name: "setPointTempC", label: "Set Point Temp (\u00B0C)", type: "text", required: true },
  { name: "actualTempC", label: "Actual Temp (\u00B0C)", type: "text", required: true },
  { name: "deviationC", label: "Deviation (\u00B0C)", type: "text" },
  { name: "thresholdC", label: "Threshold (\u00B0C)", type: "text" },
  { name: "exceedanceDurationMinutes", label: "Exceedance Duration (min)", type: "number" },
  { name: "triggeredAt", label: "Triggered At", type: "datetime-local", required: true },
  { name: "acknowledgedAt", label: "Acknowledged At", type: "datetime-local" },
  { name: "acknowledgedByName", label: "Acknowledged By", type: "text" },
  { name: "escalationLevel", label: "Escalation Level", type: "number" },
  { name: "escalatedToName", label: "Escalated To", type: "text" },
  { name: "escalatedAt", label: "Escalated At", type: "datetime-local" },
  { name: "correctionAction", label: "Correction Action", type: "textarea" },
  { name: "resolvedAt", label: "Resolved At", type: "datetime-local" },
  { name: "resolvedByName", label: "Resolved By", type: "text" },
  {
    name: "cargoImpact",
    label: "Cargo Impact",
    type: "select",
    options: [
      { value: "none", label: "None" },
      { value: "minor", label: "Minor" },
      { value: "moderate", label: "Moderate" },
      { value: "severe", label: "Severe" },
      { value: "total_loss", label: "Total Loss" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditTempAlertPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "reefer:edit")))
    redirect("/reefer-container-management/temp-alerts");

  const { id } = await params;

  const record = await getTempAlert(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/reefer-container-management/temp-alerts/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Temperature Alert
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <RcmForm
          entityType="Temperature Alert"
          apiPath={`/api/v1/reefer-container-management/temp-alerts/${id}`}
          fields={TEMP_ALERT_FIELDS}
          initialData={{
            containerNumber: record.containerNumber,
            bookingRef: record.bookingRef ?? "",
            alertType: record.alertType,
            alertSeverity: record.alertSeverity,
            setPointTempC: record.setPointTempC ?? "",
            actualTempC: record.actualTempC ?? "",
            deviationC: record.deviationC ?? "",
            thresholdC: record.thresholdC ?? "",
            exceedanceDurationMinutes: record.exceedanceDurationMinutes ?? "",
            triggeredAt: record.triggeredAt ? new Date(record.triggeredAt).toISOString() : "",
            acknowledgedAt: record.acknowledgedAt ? new Date(record.acknowledgedAt).toISOString() : "",
            acknowledgedByName: record.acknowledgedByName ?? "",
            escalationLevel: record.escalationLevel ?? "",
            escalatedToName: record.escalatedToName ?? "",
            escalatedAt: record.escalatedAt ? new Date(record.escalatedAt).toISOString() : "",
            correctionAction: record.correctionAction ?? "",
            resolvedAt: record.resolvedAt ? new Date(record.resolvedAt).toISOString() : "",
            resolvedByName: record.resolvedByName ?? "",
            cargoImpact: record.cargoImpact ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/reefer-container-management/temp-alerts/${id}`}
        />
      </div>
    </div>
  );
}
