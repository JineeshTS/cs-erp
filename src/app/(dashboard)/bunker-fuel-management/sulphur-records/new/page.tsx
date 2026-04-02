import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import {
  BfmForm,
  type FieldConfig,
} from "@/components/bunker-fuel-management/bfm-form";
import { getPortOptions, getVesselOptions } from "@/lib/lookups";

export default async function NewSulphurRecordPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:create")))
    redirect("/bunker-fuel-management/sulphur-records");


  const [portOpts, vesselOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
  ]);
  const fields: FieldConfig[] = [
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "vesselImo", label: "Vessel IMO", type: "text" },
    { name: "port", label: "Port", type: "select", options: portOpts },
    {
      name: "fuelType",
      label: "Fuel Type",
      type: "select",
      required: true,
      options: [
        { value: "VLSFO", label: "VLSFO" },
        { value: "HSFO", label: "HSFO" },
        { value: "LSMGO", label: "LSMGO" },
        { value: "MGO", label: "MGO" },
        { value: "MDO", label: "MDO" },
        { value: "LNG", label: "LNG" },
        { value: "ULSFO", label: "ULSFO" },
        { value: "HFO", label: "HFO" },
        { value: "BIOFUEL", label: "BIOFUEL" },
      ],
    },
    {
      name: "sulphurContentActual",
      label: "Sulphur Content Actual",
      type: "number",
      required: true,
    },
    {
      name: "sulphurLimit",
      label: "Sulphur Limit",
      type: "number",
      required: true,
    },
    { name: "isCompliant", label: "Is Compliant", type: "checkbox" },
    { name: "ecaZone", label: "ECA Zone", type: "text" },
    {
      name: "scrubberEquipped",
      label: "Scrubber Equipped",
      type: "checkbox",
    },
    {
      name: "scrubberOperational",
      label: "Scrubber Operational",
      type: "checkbox",
    },
    {
      name: "changoverDate",
      label: "Changeover Date",
      type: "datetime-local",
    },
    { name: "changoverPort", label: "Changeover Port", type: "text" },
    {
      name: "changoverFromFuel",
      label: "Changeover From Fuel",
      type: "text",
    },
    { name: "changoverToFuel", label: "Changeover To Fuel", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/bunker-fuel-management/sulphur-records"
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Sulphur Record
          </h1>
          <p className="text-sm text-gray-500">
            Create a new low sulphur fuel compliance record
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <BfmForm
          entityType="Sulphur Record"
          apiPath="/api/v1/bunker-fuel-management/sulphur-records"
          fields={fields}
          returnPath="/bunker-fuel-management/sulphur-records"
        />
      </div>
    </div>
  );
}
