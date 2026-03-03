import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getClaimPrediction } from "@/lib/cargo-claims-management/service";
import { CcmForm, type FieldConfig } from "@/components/cargo-claims-management/ccm-form";

const PREDICTION_FIELDS: FieldConfig[] = [
  {
    name: "predictionType",
    label: "Prediction Type",
    type: "select",
    options: [
      { value: "success_probability", label: "Success Probability" },
      { value: "settlement_range", label: "Settlement Range" },
      { value: "duration_estimate", label: "Duration Estimate" },
      { value: "liability_score", label: "Liability Score" },
      { value: "recovery_likelihood", label: "Recovery Likelihood" },
    ],
  },
  { name: "claimId", label: "Claim ID", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "modelVersion", label: "Model Version", type: "text" },
  { name: "successProbability", label: "Success Probability", type: "text" },
  { name: "predictedSettlement", label: "Predicted Settlement", type: "text" },
  { name: "confidenceInterval", label: "Confidence Interval", type: "text" },
  {
    name: "estimatedDurationDays",
    label: "Estimated Duration (Days)",
    type: "number",
  },
  { name: "riskScore", label: "Risk Score", type: "text" },
  {
    name: "recommendedAction",
    label: "Recommended Action",
    type: "textarea",
  },
  { name: "similarCasesCount", label: "Similar Cases Count", type: "number" },
  {
    name: "historicalAvgSettlement",
    label: "Historical Avg Settlement",
    type: "text",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditClaimPredictionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ccm:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getClaimPrediction(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/cargo-claims-management/claim-predictions/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Claim Prediction
          </h1>
          <p className="text-sm text-muted-foreground">
            Update claim prediction details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <CcmForm
          entityType="Claim Prediction"
          apiPath={`/api/v1/cargo-claims-management/claim-predictions/${id}`}
          returnPath={`/cargo-claims-management/claim-predictions/${id}`}
          fields={PREDICTION_FIELDS}
          initialData={{
            predictionType: record.predictionType ?? "",
            claimId: record.claimId ?? "",
            vesselName: record.vesselName ?? "",
            modelVersion: record.modelVersion ?? "",
            successProbability: record.successProbability ?? "",
            predictedSettlement: record.predictedSettlement ?? "",
            confidenceInterval: record.confidenceInterval ?? "",
            estimatedDurationDays: record.estimatedDurationDays ?? "",
            riskScore: record.riskScore ?? "",
            recommendedAction: record.recommendedAction ?? "",
            similarCasesCount: record.similarCasesCount ?? "",
            historicalAvgSettlement: record.historicalAvgSettlement ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
        />
      </div>
    </div>
  );
}
