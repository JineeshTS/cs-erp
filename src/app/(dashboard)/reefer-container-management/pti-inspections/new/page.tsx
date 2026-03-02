import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { RcmForm } from "@/components/reefer-container-management/rcm-form";
import type { FieldConfig } from "@/components/reefer-container-management/rcm-form";

const PTI_FIELDS: FieldConfig[] = [
  {
    name: "containerNumber",
    label: "Container Number",
    type: "text",
    required: true,
  },
  { name: "bookingRef", label: "Booking Ref", type: "text" },
  {
    name: "inspectionType",
    label: "Inspection Type",
    type: "select",
    required: true,
    options: [
      { value: "pre_trip", label: "Pre-Trip" },
      { value: "periodic", label: "Periodic" },
      { value: "post_trip", label: "Post-Trip" },
      { value: "emergency", label: "Emergency" },
    ],
  },
  {
    name: "inspectionDate",
    label: "Inspection Date",
    type: "datetime-local",
    required: true,
  },
  { name: "depotName", label: "Depot Name", type: "text" },
  { name: "depotLocation", label: "Depot Location", type: "text" },
  { name: "inspectorName", label: "Inspector Name", type: "text" },
  { name: "setPointTempC", label: "Set Point Temp (C)", type: "text" },
  { name: "achievedTempC", label: "Achieved Temp (C)", type: "text" },
  { name: "cooldownMinutes", label: "Cooldown Minutes", type: "number" },
  { name: "compressorOk", label: "Compressor OK", type: "checkbox" },
  { name: "evaporatorOk", label: "Evaporator OK", type: "checkbox" },
  { name: "condenserOk", label: "Condenser OK", type: "checkbox" },
  { name: "controllerOk", label: "Controller OK", type: "checkbox" },
  { name: "doorSealsOk", label: "Door Seals OK", type: "checkbox" },
  { name: "drainHolesOk", label: "Drain Holes OK", type: "checkbox" },
  { name: "powerCableOk", label: "Power Cable OK", type: "checkbox" },
  { name: "cleanlinessOk", label: "Cleanliness OK", type: "checkbox" },
  {
    name: "overallResult",
    label: "Overall Result",
    type: "select",
    options: [
      { value: "pass", label: "Pass" },
      { value: "fail", label: "Fail" },
      { value: "conditional", label: "Conditional" },
    ],
  },
  { name: "certificateNumber", label: "Certificate Number", type: "text" },
  {
    name: "certificateExpiry",
    label: "Certificate Expiry",
    type: "datetime-local",
  },
  {
    name: "repairsRequired",
    label: "Repairs Required",
    type: "textarea",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewPtiInspectionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "reefer:create")))
    redirect("/reefer-container-management");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/reefer-container-management/pti-inspections"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New PTI Inspection
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <RcmForm
          entityType="PTI Inspection"
          apiPath="/api/v1/reefer-container-management/pti-inspections"
          fields={PTI_FIELDS}
          returnPath="/reefer-container-management/pti-inspections"
        />
      </div>
    </div>
  );
}
