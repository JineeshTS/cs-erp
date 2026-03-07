import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCiiRating } from "@/lib/vessel-performance-efficiency/service";
import { VpeForm } from "@/components/vessel-performance-efficiency/vpe-form";
import type { FieldConfig } from "@/components/vessel-performance-efficiency/vpe-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function EditCiiRatingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vpe:edit")))
    redirect("/vessel-performance-efficiency/cii-ratings");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const CII_RATING_FIELDS: FieldConfig[] = [
    {
      name: "ratingType",
      label: "Rating Type",
      type: "select",
      required: true,
      options: [
        { value: "annual", label: "Annual" },
        { value: "quarterly", label: "Quarterly" },
        { value: "voyage", label: "Voyage" },
        { value: "corrected", label: "Corrected" },
        { value: "required", label: "Required" },
      ],
    },
    { name: "vesselId", label: "Vessel ID", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "imoNumber", label: "IMO Number", type: "text" },
    { name: "reportingYear", label: "Reporting Year", type: "number" },
    { name: "attainedCii", label: "Attained CII", type: "text" },
    { name: "requiredCii", label: "Required CII", type: "text" },
    { name: "reductionFactor", label: "Reduction Factor", type: "text" },
    {
      name: "rating",
      label: "Rating",
      type: "text",
      placeholder: "A-E",
    },
    { name: "totalCo2Emissions", label: "Total CO2 Emissions", type: "text" },
    { name: "totalDistanceNm", label: "Total Distance NM", type: "text" },
    { name: "dwt", label: "DWT", type: "text" },
    { name: "complianceStatus", label: "Compliance Status", type: "text" },
    {
      name: "correctiveActionPlan",
      label: "Corrective Action Plan",
      type: "textarea",
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;

  const record = await getCiiRating(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/vessel-performance-efficiency/cii-ratings/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit CII Rating
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <VpeForm
          entityType="CII Rating"
          apiPath={`/api/v1/vessel-performance-efficiency/cii-ratings/${id}`}
          fields={CII_RATING_FIELDS}
          initialData={{
            ratingType: record.ratingType,
            vesselId: record.vesselId ?? "",
            vesselName: record.vesselName ?? "",
            imoNumber: record.imoNumber ?? "",
            reportingYear: record.reportingYear ?? "",
            attainedCii: record.attainedCii ?? "",
            requiredCii: record.requiredCii ?? "",
            reductionFactor: record.reductionFactor ?? "",
            rating: record.rating ?? "",
            totalCo2Emissions: record.totalCo2Emissions ?? "",
            totalDistanceNm: record.totalDistanceNm ?? "",
            dwt: record.dwt ?? "",
            complianceStatus: record.complianceStatus ?? "",
            correctiveActionPlan: record.correctiveActionPlan ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/vessel-performance-efficiency/cii-ratings/${id}`}
        />
      </div>
    </div>
  );
}
