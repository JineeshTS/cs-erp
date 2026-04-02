import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IcdForm } from "@/components/intermodal-icd-operations/icd-form";
import type { FieldConfig } from "@/components/intermodal-icd-operations/icd-form";
import { getPortOptions, getCountryOptions } from "@/lib/lookups";

export default async function NewDryPortPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "intermodal:create"))
  )
    redirect("/intermodal-icd-operations/dry-ports");

  const [portOpts, countryOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCountryOptions(),
  ]);

  const DRY_PORT_FIELDS: FieldConfig[] = [
    { name: "portName", label: "Port Name", type: "select", options: portOpts, required: true },
    { name: "portCode", label: "Port Code", type: "select", options: portOpts },
    {
      name: "portType",
      label: "Port Type",
      type: "select",
      required: true,
      options: [
        { value: "icd", label: "ICD" },
        { value: "dry_port", label: "Dry Port" },
        { value: "cfs", label: "CFS" },
        { value: "depot", label: "Depot" },
      ],
    },
    { name: "country", label: "Country", type: "select", options: countryOpts },
    { name: "city", label: "City", type: "text" },
    { name: "address", label: "Address", type: "textarea" },
    { name: "latitude", label: "Latitude", type: "text" },
    { name: "longitude", label: "Longitude", type: "text" },
    { name: "operatorName", label: "Operator Name", type: "text" },
    { name: "operatorCode", label: "Operator Code", type: "text" },
    {
      name: "customsZoneType",
      label: "Customs Zone Type",
      type: "select",
      options: [
        { value: "free_zone", label: "Free Zone" },
        { value: "bonded", label: "Bonded" },
        { value: "general", label: "General" },
      ],
    },
    {
      name: "storageCapacityTeu",
      label: "Storage Capacity (TEU)",
      type: "number",
    },
    {
      name: "currentOccupancyTeu",
      label: "Current Occupancy (TEU)",
      type: "number",
    },
    { name: "railConnected", label: "Rail Connected", type: "checkbox" },
    {
      name: "gateHoursStart",
      label: "Gate Hours Start",
      type: "text",
      placeholder: "06:00",
    },
    {
      name: "gateHoursEnd",
      label: "Gate Hours End",
      type: "text",
      placeholder: "22:00",
    },
    { name: "contactName", label: "Contact Name", type: "text" },
    { name: "contactPhone", label: "Contact Phone", type: "text" },
    { name: "contactEmail", label: "Contact Email", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/intermodal-icd-operations/dry-ports"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Dry Port</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IcdForm
          entityType="Dry Port"
          apiPath="/api/v1/intermodal-icd-operations/dry-ports"
          fields={DRY_PORT_FIELDS}
          returnPath="/intermodal-icd-operations/dry-ports"
        />
      </div>
    </div>
  );
}
