import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { DgmForm } from "@/components/dangerous-goods-management/dgm-form";
import type { FieldConfig } from "@/components/dangerous-goods-management/dgm-form";
import { getPortOptions, getVesselOptions } from "@/lib/lookups";

export default async function NewManifestPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "dangerous_goods:create"))
  )
    redirect("/dangerous-goods-management/manifests");

  const [portOpts, vesselOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
  ]);

  const MANIFEST_FIELDS: FieldConfig[] = [
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "voyageNumber", label: "Voyage Number", type: "text", required: true },
    { name: "imoNumber", label: "IMO Number", type: "text" },
    { name: "callSign", label: "Call Sign", type: "text" },
    { name: "masterName", label: "Master Name", type: "text" },
    { name: "portOfLoading", label: "Port of Loading", type: "select", options: portOpts, required: true },
    { name: "portOfDischarge", label: "Port of Discharge", type: "select", options: portOpts, required: true },
    { name: "departureDate", label: "Departure Date", type: "datetime-local" },
    { name: "arrivalDate", label: "Arrival Date", type: "datetime-local" },
    { name: "totalDgContainers", label: "Total DG Containers", type: "number" },
    { name: "totalDgWeight", label: "Total DG Weight", type: "text" },
    { name: "weightUnit", label: "Weight Unit", type: "text", placeholder: "e.g. KG, MT" },
    { name: "submittedToAuthority", label: "Submitted to Authority", type: "text" },
    { name: "submissionDate", label: "Submission Date", type: "datetime-local" },
    { name: "submissionReference", label: "Submission Reference", type: "text" },
    { name: "preparedByName", label: "Prepared By", type: "text" },
    { name: "approvedByName", label: "Approved By", type: "text" },
    { name: "approvedAt", label: "Approved At", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dangerous-goods-management/manifests"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New DG Manifest</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DgmForm
          entityType="Manifest"
          apiPath="/api/v1/dangerous-goods-management/manifests"
          fields={MANIFEST_FIELDS}
          returnPath="/dangerous-goods-management/manifests"
        />
      </div>
    </div>
  );
}
