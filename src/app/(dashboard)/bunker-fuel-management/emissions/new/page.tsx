import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import {
  BfmForm,
  type FieldConfig,
} from "@/components/bunker-fuel-management/bfm-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function NewEmissionsRecordPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:create")))
    redirect("/bunker-fuel-management/emissions");


  const vesselOpts = await getVesselOptions(session.tenantId);
  const fields: FieldConfig[] = [
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "vesselImo", label: "Vessel IMO", type: "text" },
    { name: "voyageRef", label: "Voyage Ref", type: "text" },
    {
      name: "reportingPeriod",
      label: "Reporting Period",
      type: "select",
      required: true,
      options: [
        { value: "annual", label: "Annual" },
        { value: "quarterly", label: "Quarterly" },
        { value: "voyage", label: "Voyage" },
        { value: "monthly", label: "Monthly" },
      ],
    },
    {
      name: "reportYear",
      label: "Report Year",
      type: "number",
      required: true,
    },
    { name: "co2Emissions", label: "CO2 Emissions", type: "number" },
    { name: "noxEmissions", label: "NOx Emissions", type: "number" },
    { name: "soxEmissions", label: "SOx Emissions", type: "number" },
    { name: "eexiValue", label: "EEXI Value", type: "number" },
    { name: "eexiRequired", label: "EEXI Required", type: "number" },
    { name: "eexiCompliant", label: "EEXI Compliant", type: "checkbox" },
    {
      name: "ciiRating",
      label: "CII Rating",
      type: "select",
      options: [
        { value: "A", label: "A" },
        { value: "B", label: "B" },
        { value: "C", label: "C" },
        { value: "D", label: "D" },
        { value: "E", label: "E" },
      ],
    },
    { name: "ciiValue", label: "CII Value", type: "number" },
    { name: "ciiRequired", label: "CII Required", type: "number" },
    {
      name: "distanceTravelled",
      label: "Distance Travelled",
      type: "number",
    },
    { name: "cargoCarried", label: "Cargo Carried", type: "number" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/bunker-fuel-management/emissions"
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Emissions Record
          </h1>
          <p className="text-sm text-gray-500">
            Create a new EEXI/CII emissions compliance record
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <BfmForm
          entityType="Emissions Record"
          apiPath="/api/v1/bunker-fuel-management/emissions"
          fields={fields}
          returnPath="/bunker-fuel-management/emissions"
        />
      </div>
    </div>
  );
}
