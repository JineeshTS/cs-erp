import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPiClubScoring } from "@/lib/loss-prevention-risk-management/service";
import { LprForm, type FieldConfig } from "@/components/loss-prevention-risk-management/lpr-form";

const PI_CLUB_SCORING_FIELDS: FieldConfig[] = [
  {
    name: "scoringType",
    label: "Scoring Type",
    type: "select",
    required: true,
    options: [
      { value: "vessel_assessment", label: "Vessel Assessment" },
      { value: "fleet_review", label: "Fleet Review" },
      { value: "claims_analysis", label: "Claims Analysis" },
      { value: "premium_calculation", label: "Premium Calculation" },
      { value: "benchmark", label: "Benchmark" },
    ],
  },
  { name: "title", label: "Title", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "imoNumber", label: "IMO Number", type: "text" },
  { name: "piClubName", label: "P&I Club Name", type: "text" },
  { name: "assessmentDate", label: "Assessment Date", type: "datetime-local" },
  { name: "overallScore", label: "Overall Score", type: "text" },
  { name: "safetyScore", label: "Safety Score", type: "text" },
  { name: "claimsScore", label: "Claims Score", type: "text" },
  { name: "complianceScore", label: "Compliance Score", type: "text" },
  { name: "riskGrade", label: "Risk Grade", type: "text" },
  { name: "premiumImpact", label: "Premium Impact", type: "text" },
  { name: "recommendations", label: "Recommendations", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditPiClubScoringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "lpr:edit")))
    redirect("/loss-prevention-risk-management/pi-club-scorings");

  const { id } = await params;

  const record = await getPiClubScoring(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/loss-prevention-risk-management/pi-club-scorings/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit P&I Club Scoring
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LprForm
          entityType="P&I Club Scoring"
          apiPath={`/api/v1/loss-prevention-risk-management/pi-club-scorings/${id}`}
          fields={PI_CLUB_SCORING_FIELDS}
          initialData={{
            scoringType: record.scoringType,
            title: record.title ?? "",
            vesselName: record.vesselName ?? "",
            imoNumber: record.imoNumber ?? "",
            piClubName: record.piClubName ?? "",
            assessmentDate: record.assessmentDate ? record.assessmentDate.toISOString().slice(0, 16) : "",
            overallScore: record.overallScore ?? "",
            safetyScore: record.safetyScore ?? "",
            claimsScore: record.claimsScore ?? "",
            complianceScore: record.complianceScore ?? "",
            riskGrade: record.riskGrade ?? "",
            premiumImpact: record.premiumImpact ?? "",
            recommendations: record.recommendations ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/loss-prevention-risk-management/pi-club-scorings/${id}`}
        />
      </div>
    </div>
  );
}
