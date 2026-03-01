import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getEmissionsRecord } from "@/lib/bunker-fuel-management/service";
import {
  BfmForm,
  type FieldConfig,
} from "@/components/bunker-fuel-management/bfm-form";

export default async function EditEmissionsRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:edit")))
    redirect("/bunker-fuel-management/emissions");

  const { id } = await params;
  const record = await getEmissionsRecord(id, session.tenantId);
  if (!record) notFound();

  const fields: FieldConfig[] = [
    { name: "vesselName", label: "Vessel Name", type: "text", required: true },
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

  const initialData: Record<string, unknown> = {
    vesselName: record.vesselName,
    vesselImo: record.vesselImo ?? "",
    voyageRef: record.voyageRef ?? "",
    reportingPeriod: record.reportingPeriod,
    reportYear: record.reportYear,
    co2Emissions: record.co2Emissions ?? "",
    noxEmissions: record.noxEmissions ?? "",
    soxEmissions: record.soxEmissions ?? "",
    eexiValue: record.eexiValue ?? "",
    eexiRequired: record.eexiRequired ?? "",
    eexiCompliant: record.eexiCompliant ?? false,
    ciiRating: record.ciiRating ?? "",
    ciiValue: record.ciiValue ?? "",
    ciiRequired: record.ciiRequired ?? "",
    distanceTravelled: record.distanceTravelled ?? "",
    cargoCarried: record.cargoCarried ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/bunker-fuel-management/emissions/${record.id}`}
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit {record.recordRef}
          </h1>
          <p className="text-sm text-gray-500">
            Update emissions record details
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <BfmForm
          entityType="Emissions Record"
          apiPath={`/api/v1/bunker-fuel-management/emissions/${record.id}`}
          fields={fields}
          initialData={initialData}
          isEdit
          returnPath="/bunker-fuel-management/emissions"
        />
      </div>
    </div>
  );
}
