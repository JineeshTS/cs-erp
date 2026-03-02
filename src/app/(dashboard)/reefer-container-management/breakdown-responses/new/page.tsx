import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { RcmForm } from "@/components/reefer-container-management/rcm-form";
import type { FieldConfig } from "@/components/reefer-container-management/rcm-form";

const BREAKDOWN_RESPONSE_FIELDS: FieldConfig[] = [
  {
    name: "containerNumber",
    label: "Container Number",
    type: "text",
    required: true,
  },
  { name: "bookingRef", label: "Booking Ref", type: "text" },
  {
    name: "breakdownType",
    label: "Breakdown Type",
    type: "select",
    required: true,
    options: [
      { value: "compressor_failure", label: "Compressor Failure" },
      { value: "refrigerant_leak", label: "Refrigerant Leak" },
      { value: "electrical_fault", label: "Electrical Fault" },
      { value: "controller_malfunction", label: "Controller Malfunction" },
      { value: "sensor_failure", label: "Sensor Failure" },
      { value: "structural_damage", label: "Structural Damage" },
      { value: "other", label: "Other" },
    ],
  },
  {
    name: "severityLevel",
    label: "Severity Level",
    type: "select",
    required: true,
    options: [
      { value: "minor", label: "Minor" },
      { value: "moderate", label: "Moderate" },
      { value: "major", label: "Major" },
      { value: "critical", label: "Critical" },
    ],
  },
  {
    name: "reportedAt",
    label: "Reported At",
    type: "datetime-local",
    required: true,
  },
  { name: "locationDescription", label: "Location Description", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "voyageNumber", label: "Voyage Number", type: "text" },
  {
    name: "faultDescription",
    label: "Fault Description",
    type: "textarea",
    required: true,
  },
  { name: "faultCode", label: "Fault Code", type: "text" },
  { name: "lastKnownTempC", label: "Last Known Temp (C)", type: "text" },
  { name: "cargoAtRisk", label: "Cargo at Risk", type: "checkbox" },
  { name: "commodityName", label: "Commodity Name", type: "text" },
  { name: "immediateAction", label: "Immediate Action", type: "textarea" },
  { name: "technicianName", label: "Technician Name", type: "text" },
  {
    name: "responseStartedAt",
    label: "Response Started At",
    type: "datetime-local",
  },
  { name: "repairDescription", label: "Repair Description", type: "textarea" },
  { name: "resolvedAt", label: "Resolved At", type: "datetime-local" },
  {
    name: "totalDowntimeMinutes",
    label: "Total Downtime (min)",
    type: "number",
  },
  { name: "repairCost", label: "Repair Cost", type: "text" },
  {
    name: "currency",
    label: "Currency",
    type: "text",
    placeholder: "USD",
  },
  { name: "containerSwapped", label: "Container Swapped", type: "checkbox" },
  { name: "swappedToContainer", label: "Swapped to Container", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewBreakdownResponsePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "reefer:create"))
  )
    redirect("/reefer-container-management");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/reefer-container-management/breakdown-responses"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Breakdown Response
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <RcmForm
          entityType="Breakdown Response"
          apiPath="/api/v1/reefer-container-management/breakdown-responses"
          fields={BREAKDOWN_RESPONSE_FIELDS}
          returnPath="/reefer-container-management/breakdown-responses"
        />
      </div>
    </div>
  );
}
