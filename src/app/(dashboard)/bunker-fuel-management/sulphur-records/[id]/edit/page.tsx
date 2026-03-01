import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getSulphurRecord } from "@/lib/bunker-fuel-management/service";
import {
  BfmForm,
  type FieldConfig,
} from "@/components/bunker-fuel-management/bfm-form";

export default async function EditSulphurRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:edit")))
    redirect("/bunker-fuel-management/sulphur-records");

  const { id } = await params;
  const record = await getSulphurRecord(id, session.tenantId);
  if (!record) notFound();

  const fields: FieldConfig[] = [
    { name: "vesselName", label: "Vessel Name", type: "text", required: true },
    { name: "vesselImo", label: "Vessel IMO", type: "text" },
    { name: "port", label: "Port", type: "text" },
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

  const initialData: Record<string, unknown> = {
    vesselName: record.vesselName,
    vesselImo: record.vesselImo ?? "",
    port: record.port ?? "",
    fuelType: record.fuelType,
    sulphurContentActual: record.sulphurContentActual,
    sulphurLimit: record.sulphurLimit,
    isCompliant: record.isCompliant,
    ecaZone: record.ecaZone ?? "",
    scrubberEquipped: record.scrubberEquipped,
    scrubberOperational: record.scrubberOperational ?? false,
    changoverDate: record.changoverDate
      ? new Date(record.changoverDate).toISOString()
      : "",
    changoverPort: record.changoverPort ?? "",
    changoverFromFuel: record.changoverFromFuel ?? "",
    changoverToFuel: record.changoverToFuel ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/bunker-fuel-management/sulphur-records/${record.id}`}
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit {record.recordRef}
          </h1>
          <p className="text-sm text-gray-500">
            Update sulphur record details
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <BfmForm
          entityType="Sulphur Record"
          apiPath={`/api/v1/bunker-fuel-management/sulphur-records/${record.id}`}
          fields={fields}
          initialData={initialData}
          isEdit
          returnPath="/bunker-fuel-management/sulphur-records"
        />
      </div>
    </div>
  );
}
