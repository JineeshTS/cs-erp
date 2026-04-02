import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Brain } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { IcmForm } from "@/components/insurance-claims-management/icm-form";
import type { FieldConfig } from "@/components/insurance-claims-management/icm-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function NewClaimsPredictionPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "insurance:create"))) redirect("/login");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const fields: FieldConfig[] = [
    {
      name: "predictionType",
      label: "Prediction Type",
      type: "select",
      required: true,
      options: [
        { value: "risk_assessment", label: "Risk Assessment" },
        { value: "claim_likelihood", label: "Claim Likelihood" },
        { value: "severity_estimate", label: "Severity Estimate" },
        { value: "fraud_detection", label: "Fraud Detection" },
      ],
    },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "imoNumber", label: "IMO Number", type: "text" },
    { name: "voyageNumber", label: "Voyage Number", type: "text" },
    { name: "tradeRoute", label: "Trade Route", type: "text" },
    { name: "cargoType", label: "Cargo Type", type: "text" },
    { name: "riskScore", label: "Risk Score", type: "text", placeholder: "0-100" },
    {
      name: "riskLevel",
      label: "Risk Level",
      type: "select",
      options: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
        { value: "critical", label: "Critical" },
      ],
    },
    { name: "predictedClaimType", label: "Predicted Claim Type", type: "text" },
    { name: "predictedAmount", label: "Predicted Amount", type: "text" },
    { name: "predictionCurrency", label: "Prediction Currency", type: "text" },
    { name: "confidenceScore", label: "Confidence Score", type: "text" },
    { name: "modelVersion", label: "Model Version", type: "text" },
    {
      name: "actualOutcome",
      label: "Actual Outcome",
      type: "select",
      options: [
        { value: "no_claim", label: "No Claim" },
        { value: "claim_filed", label: "Claim Filed" },
        { value: "claim_settled", label: "Claim Settled" },
      ],
    },
    { name: "actualAmount", label: "Actual Amount", type: "text" },
    { name: "predictionAccuracy", label: "Prediction Accuracy", type: "text" },
    { name: "generatedAt", label: "Generated At", type: "datetime-local" },
    { name: "expiresAt", label: "Expires At", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/insurance-claims-management/claims-predictions"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Brain className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Claims Prediction</h1>
          <p className="text-sm text-muted-foreground">
            Create a new AI claims prediction record
          </p>
        </div>
      </div>

      <IcmForm
        entityType="Claims Prediction"
        apiPath="/api/v1/insurance-claims-management/claims-predictions"
        fields={fields}
        returnPath="/insurance-claims-management/claims-predictions"
      />
    </div>
  );
}
