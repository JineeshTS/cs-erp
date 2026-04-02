import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewTempAlertPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "reefer:create"))
  )
    redirect("/reefer-container-management/temp-alerts");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/reefer-container-management/temp-alerts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Temperature Alert
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <RcmForm
          entityType="Temperature Alert"
          apiPath="/api/v1/reefer-container-management/temp-alerts"
          fields={TEMP_ALERT_FIELDS}
          returnPath="/reefer-container-management/temp-alerts"
        />
      </div>
    </div>
  );
}
