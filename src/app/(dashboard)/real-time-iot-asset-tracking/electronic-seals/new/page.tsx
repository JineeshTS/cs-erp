import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IotForm, type FieldConfig } from "@/components/real-time-iot-asset-tracking/iot-form";

const ELECTRONIC_SEAL_FIELDS: FieldConfig[] = [
  {
    name: "sealType",
    label: "Seal Type",
    type: "select",
    required: true,
    options: [
      { value: "bolt_seal", label: "Bolt Seal" },
      { value: "cable_seal", label: "Cable Seal" },
      { value: "rfid_seal", label: "RFID Seal" },
      { value: "gps_seal", label: "GPS Seal" },
      { value: "smart_seal", label: "Smart Seal" },
    ],
  },
  { name: "sealNumber", label: "Seal Number", type: "text" },
  { name: "containerNumber", label: "Container Number", type: "text" },
  { name: "sealStatus", label: "Seal Status", type: "text" },
  { name: "integrityCheck", label: "Integrity Check", type: "checkbox" },
  { name: "tamperDetected", label: "Tamper Detected", type: "checkbox" },
  { name: "lastVerifiedAt", label: "Last Verified At", type: "datetime-local" },
  { name: "appliedAt", label: "Applied At", type: "datetime-local" },
  { name: "removedAt", label: "Removed At", type: "datetime-local" },
  { name: "appliedBy", label: "Applied By", type: "text" },
  { name: "appliedLocation", label: "Applied Location", type: "text" },
  { name: "deviceId", label: "Device ID", type: "text" },
  { name: "batteryLevel", label: "Battery Level", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewElectronicSealPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "iot:create"))
  )
    redirect("/real-time-iot-asset-tracking/electronic-seals");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/real-time-iot-asset-tracking/electronic-seals"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Electronic Seal
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IotForm
          entityType="Electronic Seal"
          apiPath="/api/v1/real-time-iot-asset-tracking/electronic-seals"
          fields={ELECTRONIC_SEAL_FIELDS}
          returnPath="/real-time-iot-asset-tracking/electronic-seals"
        />
      </div>
    </div>
  );
}
