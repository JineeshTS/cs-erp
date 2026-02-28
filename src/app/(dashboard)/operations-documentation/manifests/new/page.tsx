import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { OdmForm } from "@/components/operations-documentation/odm-form";
import type { FieldConfig } from "@/components/operations-documentation/odm-form";

const MANIFEST_FIELDS: FieldConfig[] = [
  { name: "manifestNumber", label: "Manifest Number", type: "text", required: true },
  { name: "manifestType", label: "Type", type: "select", options: [
    { value: "export", label: "Export" },
    { value: "import", label: "Import" },
    { value: "transit", label: "Transit" },
    { value: "transshipment", label: "Transshipment" },
  ]},
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  { name: "voyageNumber", label: "Voyage Number", type: "text", required: true },
  { name: "portOfLoading", label: "Port of Loading", type: "text" },
  { name: "portOfDischarge", label: "Port of Discharge", type: "text" },
  { name: "estimatedDeparture", label: "Est. Departure", type: "datetime-local" },
  { name: "estimatedArrival", label: "Est. Arrival", type: "datetime-local" },
  { name: "totalBls", label: "Total B/Ls", type: "number" },
  { name: "totalContainers", label: "Total Containers", type: "number" },
  { name: "totalWeight", label: "Total Weight", type: "number" },
  { name: "submittedTo", label: "Submitted To", type: "text" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "draft", label: "Draft" },
    { value: "prepared", label: "Prepared" },
    { value: "submitted", label: "Submitted" },
    { value: "acknowledged", label: "Acknowledged" },
    { value: "rejected", label: "Rejected" },
    { value: "amended", label: "Amended" },
  ]},
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewManifestPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:create")))
    redirect("/operations-documentation/manifests");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/operations-documentation/manifests" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Manifest</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <OdmForm
          entityType="Manifest"
          apiPath="/api/v1/operations-documentation/manifests"
          fields={MANIFEST_FIELDS}
          returnPath="/operations-documentation/manifests"
        />
      </div>
    </div>
  );
}
