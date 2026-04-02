import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { MecForm, type FieldConfig } from "@/components/marpol-environmental-compliance/mec-form";
import Link from "next/link";
import { getVesselOptions } from "@/lib/lookups";

export default async function NewCiiRatingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mec:create")))
    redirect("/");


  const vesselOpts = await getVesselOptions(session.tenantId);
  const fields: FieldConfig[] = [
    {
      name: "ciiType",
      label: "CII Type",
      type: "select",
      options: [
        { label: "Annual Rating", value: "annual_rating" },
        { label: "Quarterly Review", value: "quarterly_review" },
        { label: "Improvement Plan", value: "improvement_plan" },
        { label: "Corrective Action", value: "corrective_action" },
        { label: "Forecast", value: "forecast" },
      ],
    },
    { name: "title", label: "Title", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "imoNumber", label: "IMO Number", type: "text" },
    { name: "reportingYear", label: "Reporting Year", type: "number" },
    { name: "attainedCii", label: "Attained CII", type: "text" },
    { name: "requiredCii", label: "Required CII", type: "text" },
    { name: "rating", label: "Rating", type: "text" },
    { name: "improvementTarget", label: "Improvement Target", type: "text" },
    { name: "correctionPlan", label: "Correction Plan", type: "textarea" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href="/marpol-environmental-compliance/cii-ratings"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to CII Ratings
        </Link>
        <h1 className="text-2xl font-bold">New CII Rating</h1>
      </div>

      <MecForm
        entityType="cii-ratings"
        apiPath="/api/v1/marpol-environmental-compliance/cii-ratings"
        fields={fields}
        returnPath="/marpol-environmental-compliance/cii-ratings"
      />
    </div>
  );
}
