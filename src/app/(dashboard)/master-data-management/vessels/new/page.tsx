import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { MdmForm } from "@/components/master-data-management/mdm-form";

const VESSEL_FIELDS = [
  { name: "imoNumber", label: "IMO Number", type: "text" as const, required: true },
  { name: "name", label: "Vessel Name", type: "text" as const, required: true },
  { name: "callSign", label: "Call Sign", type: "text" as const },
  { name: "mmsi", label: "MMSI", type: "text" as const },
  { name: "flag", label: "Flag (2-letter)", type: "text" as const },
  { name: "vesselType", label: "Vessel Type", type: "select" as const, options: [
    { value: "container", label: "Container" },
    { value: "bulk_carrier", label: "Bulk Carrier" },
    { value: "tanker", label: "Tanker" },
    { value: "ro_ro", label: "Ro-Ro" },
    { value: "general_cargo", label: "General Cargo" },
    { value: "other", label: "Other" },
  ]},
  { name: "teuCapacity", label: "TEU Capacity", type: "number" as const },
  { name: "dwt", label: "DWT", type: "number" as const },
  { name: "grossTonnage", label: "Gross Tonnage", type: "number" as const },
  { name: "netTonnage", label: "Net Tonnage", type: "number" as const },
  { name: "loa", label: "LOA (m)", type: "number" as const },
  { name: "beam", label: "Beam (m)", type: "number" as const },
  { name: "draft", label: "Draft (m)", type: "number" as const },
  { name: "builtYear", label: "Built Year", type: "number" as const },
  { name: "builder", label: "Builder", type: "text" as const },
  { name: "ownerName", label: "Owner Name", type: "text" as const },
  { name: "operatorName", label: "Operator Name", type: "text" as const },
  { name: "classificationSociety", label: "Classification Society", type: "text" as const },
];

export default async function NewVesselPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vessels:create")))
    redirect("/master-data-management/vessels");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/master-data-management/vessels"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Vessel</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MdmForm
          entityType="Vessel"
          apiPath="/api/v1/master-data-management/vessels"
          fields={VESSEL_FIELDS}
          returnPath="/master-data-management/vessels"
        />
      </div>
    </div>
  );
}
