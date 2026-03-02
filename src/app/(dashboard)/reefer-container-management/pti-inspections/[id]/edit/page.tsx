import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPtiInspection } from "@/lib/reefer-container-management/service";
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

export default async function EditPtiInspectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "reefer:edit")))
    redirect("/reefer-container-management");

  const { id } = await params;
  const record = await getPtiInspection(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/reefer-container-management/pti-inspections/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit PTI Inspection
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <RcmForm
          entityType="PTI Inspection"
          apiPath={`/api/v1/reefer-container-management/pti-inspections/${id}`}
          fields={PTI_FIELDS}
          initialData={{
            containerNumber: record.containerNumber ?? "",
            bookingRef: record.bookingRef ?? "",
            inspectionType: record.inspectionType ?? "",
            inspectionDate: record.inspectionDate
              ? new Date(record.inspectionDate).toISOString()
              : "",
            depotName: record.depotName ?? "",
            depotLocation: record.depotLocation ?? "",
            inspectorName: record.inspectorName ?? "",
            setPointTempC: record.setPointTempC ?? "",
            achievedTempC: record.achievedTempC ?? "",
            cooldownMinutes: record.cooldownMinutes ?? "",
            compressorOk: record.compressorOk ?? false,
            evaporatorOk: record.evaporatorOk ?? false,
            condenserOk: record.condenserOk ?? false,
            controllerOk: record.controllerOk ?? false,
            doorSealsOk: record.doorSealsOk ?? false,
            drainHolesOk: record.drainHolesOk ?? false,
            powerCableOk: record.powerCableOk ?? false,
            cleanlinessOk: record.cleanlinessOk ?? false,
            overallResult: record.overallResult ?? "",
            certificateNumber: record.certificateNumber ?? "",
            certificateExpiry: record.certificateExpiry
              ? new Date(record.certificateExpiry).toISOString()
              : "",
            repairsRequired: record.repairsRequired ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/reefer-container-management/pti-inspections/${id}`}
        />
      </div>
    </div>
  );
}
