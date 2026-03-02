import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { OogForm } from "@/components/oog-special-cargo-management/oog-form";
import type { FieldConfig } from "@/components/oog-special-cargo-management/oog-form";

const EQUIPMENT_FIELDS: FieldConfig[] = [
  {
    name: "equipmentType",
    label: "Equipment Type",
    type: "select",
    required: true,
    options: [
      { value: "flat_rack", label: "Flat Rack" },
      { value: "open_top", label: "Open Top" },
      { value: "platform", label: "Platform" },
      { value: "bolster", label: "Bolster" },
      { value: "mafi_trailer", label: "Mafi Trailer" },
      { value: "tweendecks", label: "Tweendecks" },
      { value: "cradle", label: "Cradle" },
      { value: "spreader", label: "Spreader" },
    ],
  },
  { name: "equipmentNumber", label: "Equipment Number", type: "text" },
  {
    name: "equipmentName",
    label: "Equipment Name",
    type: "text",
    required: true,
  },
  { name: "manufacturer", label: "Manufacturer", type: "text" },
  { name: "modelNumber", label: "Model Number", type: "text" },
  {
    name: "maxLoadCapacityKg",
    label: "Max Load Capacity (kg)",
    type: "text",
  },
  { name: "tareWeightKg", label: "Tare Weight (kg)", type: "text" },
  { name: "internalLengthCm", label: "Internal Length (cm)", type: "text" },
  { name: "internalWidthCm", label: "Internal Width (cm)", type: "text" },
  { name: "internalHeightCm", label: "Internal Height (cm)", type: "text" },
  {
    name: "doorOpeningWidthCm",
    label: "Door Opening Width (cm)",
    type: "text",
  },
  {
    name: "doorOpeningHeightCm",
    label: "Door Opening Height (cm)",
    type: "text",
  },
  {
    name: "certificationNumber",
    label: "Certification Number",
    type: "text",
  },
  {
    name: "certificationExpiry",
    label: "Certification Expiry",
    type: "datetime-local",
  },
  {
    name: "lastInspectionDate",
    label: "Last Inspection Date",
    type: "datetime-local",
  },
  {
    name: "nextInspectionDate",
    label: "Next Inspection Date",
    type: "datetime-local",
  },
  { name: "currentLocation", label: "Current Location", type: "text" },
  {
    name: "ownershipType",
    label: "Ownership Type",
    type: "select",
    options: [
      { value: "owned", label: "Owned" },
      { value: "leased", label: "Leased" },
      { value: "third_party", label: "Third Party" },
    ],
  },
  { name: "leaseReference", label: "Lease Reference", type: "text" },
  { name: "availableFrom", label: "Available From", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewSpecialEquipmentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(
      session.id,
      session.tenantId,
      "oog_special:create"
    ))
  )
    redirect("/oog-special-cargo-management/special-equipment");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/oog-special-cargo-management/special-equipment"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Special Equipment
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <OogForm
          entityType="Special Equipment"
          apiPath="/api/v1/oog-special-cargo-management/special-equipment"
          fields={EQUIPMENT_FIELDS}
          returnPath="/oog-special-cargo-management/special-equipment"
        />
      </div>
    </div>
  );
}
