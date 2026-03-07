import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { MecForm, type FieldConfig } from "@/components/marpol-environmental-compliance/mec-form";
import { getPortOptions, getVesselOptions } from "@/lib/lookups";

export default async function NewBallastWaterPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mec:create")))
    redirect("/");

  const [portOpts, vesselOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
  ]);

  const fields: FieldConfig[] = [
    {
      name: "ballastType",
      label: "Ballast Type",
      type: "select",
      options: [
        { label: "Exchange", value: "exchange" },
        { label: "Treatment", value: "treatment" },
        { label: "Discharge", value: "discharge" },
        { label: "Sampling", value: "sampling" },
        { label: "Compliance Check", value: "compliance_check" },
      ],
      required: true,
    },
    { name: "title", label: "Title", type: "text", required: true },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "imoNumber", label: "IMO Number", type: "text", required: true },
    { name: "treatmentSystem", label: "Treatment System", type: "text" },
    { name: "operationDate", label: "Operation Date", type: "datetime-local" },
    { name: "portName", label: "Port Name", type: "select", options: portOpts },
    { name: "volumeCubicMeters", label: "Volume (m\u00B3)", type: "number" },
    { name: "exchangeLatitude", label: "Exchange Latitude", type: "text" },
    { name: "exchangeLongitude", label: "Exchange Longitude", type: "text" },
    { name: "isCompliant", label: "Is Compliant", type: "checkbox" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Ballast Water Record</h1>
      <MecForm
        entityType="ballast-water"
        apiPath="/api/v1/marpol-environmental-compliance/ballast-waters"
        fields={fields}
        returnPath="/marpol-environmental-compliance/ballast-waters"
      />
    </div>
  );
}
