import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { getCiiRating } from "@/lib/marpol-environmental-compliance/service";
import { MecForm, type FieldConfig } from "@/components/marpol-environmental-compliance/mec-form";
import Link from "next/link";

export default async function EditCiiRatingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "mec:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getCiiRating(id, session.tenantId);
  if (!record) notFound();

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
    { name: "vesselName", label: "Vessel Name", type: "text" },
    { name: "imoNumber", label: "IMO Number", type: "text" },
    { name: "reportingYear", label: "Reporting Year", type: "number" },
    { name: "attainedCii", label: "Attained CII", type: "text" },
    { name: "requiredCii", label: "Required CII", type: "text" },
    { name: "rating", label: "Rating", type: "text" },
    { name: "improvementTarget", label: "Improvement Target", type: "text" },
    { name: "correctionPlan", label: "Correction Plan", type: "textarea" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const initialData: Record<string, unknown> = {
    ciiType: record.ciiType,
    title: record.title,
    vesselName: record.vesselName,
    imoNumber: record.imoNumber,
    reportingYear: record.reportingYear,
    attainedCii: record.attainedCii,
    requiredCii: record.requiredCii,
    rating: record.rating,
    improvementTarget: record.improvementTarget,
    correctionPlan: record.correctionPlan,
    notes: record.notes,
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href={`/marpol-environmental-compliance/cii-ratings/${id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to Detail
        </Link>
        <h1 className="text-2xl font-bold">Edit CII Rating</h1>
      </div>

      <MecForm
        entityType="cii-ratings"
        apiPath="/api/v1/marpol-environmental-compliance/cii-ratings"
        fields={fields}
        initialData={initialData}
        isEdit
        returnPath={`/marpol-environmental-compliance/cii-ratings/${id}`}
      />
    </div>
  );
}
