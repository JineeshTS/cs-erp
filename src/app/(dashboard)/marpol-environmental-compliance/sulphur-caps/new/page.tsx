import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { MecForm, type FieldConfig } from "@/components/marpol-environmental-compliance/mec-form";
import Link from "next/link";
import { getVesselOptions } from "@/lib/lookups";

export default async function NewSulphurCapPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mec:create")))
    redirect("/");


  const vesselOpts = await getVesselOptions(session.tenantId);
  const fields: FieldConfig[] = [
    {
      name: "sulphurType",
      label: "Sulphur Type",
      type: "select",
      options: [
        { label: "Fuel Sample", value: "fuel_sample" },
        { label: "Scrubber Report", value: "scrubber_report" },
        { label: "Compliance Plan", value: "compliance_plan" },
        { label: "Bunker Note", value: "bunker_note" },
        { label: "ECA Compliance", value: "eca_compliance" },
      ],
    },
    { name: "title", label: "Title", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "imoNumber", label: "IMO Number", type: "text" },
    { name: "fuelType", label: "Fuel Type", type: "text" },
    { name: "sulphurContent", label: "Sulphur Content", type: "text" },
    { name: "sampleDate", label: "Sample Date", type: "datetime-local" },
    { name: "labReference", label: "Lab Reference", type: "text" },
    { name: "hasScrubber", label: "Has Scrubber", type: "checkbox" },
    { name: "isCompliant", label: "Is Compliant", type: "checkbox" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href="/marpol-environmental-compliance/sulphur-caps"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to Sulphur Caps
        </Link>
        <h1 className="text-2xl font-bold">New Sulphur Cap</h1>
      </div>

      <MecForm
        entityType="sulphur-caps"
        apiPath="/api/v1/marpol-environmental-compliance/sulphur-caps"
        fields={fields}
        returnPath="/marpol-environmental-compliance/sulphur-caps"
      />
    </div>
  );
}
