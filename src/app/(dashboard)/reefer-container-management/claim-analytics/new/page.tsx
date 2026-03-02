import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { RcmForm } from "@/components/reefer-container-management/rcm-form";
import type { FieldConfig } from "@/components/reefer-container-management/rcm-form";

const CLAIM_ANALYTICS_FIELDS: FieldConfig[] = [
  { name: "containerNumber", label: "Container Number", type: "text" },
  { name: "bookingRef", label: "Booking Ref", type: "text" },
  { name: "customerName", label: "Customer Name", type: "text" },
  { name: "commodityName", label: "Commodity Name", type: "text" },
  {
    name: "analysisType",
    label: "Analysis Type",
    type: "select",
    required: true,
    options: [
      { value: "predictive", label: "Predictive" },
      { value: "historical", label: "Historical" },
      { value: "real_time", label: "Real Time" },
      { value: "post_voyage", label: "Post Voyage" },
    ],
  },
  {
    name: "riskLevel",
    label: "Risk Level",
    type: "select",
    required: true,
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "critical", label: "Critical" },
    ],
  },
  { name: "riskScore", label: "Risk Score", type: "text" },
  { name: "tempExceedanceCount", label: "Temp Exceedance Count", type: "number" },
  { name: "totalExceedanceMinutes", label: "Total Exceedance (min)", type: "number" },
  { name: "maxDeviationC", label: "Max Deviation (\u00B0C)", type: "text" },
  { name: "claimProbability", label: "Claim Probability", type: "text" },
  { name: "estimatedClaimAmount", label: "Estimated Claim Amount", type: "text" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "modelVersion", label: "Model Version", type: "text" },
  { name: "confidenceScore", label: "Confidence Score", type: "text" },
  { name: "actualClaimFiled", label: "Actual Claim Filed", type: "checkbox" },
  { name: "actualClaimAmount", label: "Actual Claim Amount", type: "text" },
  { name: "predictionAccuracy", label: "Prediction Accuracy", type: "text" },
  { name: "aiRecommendations", label: "AI Recommendations", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewClaimAnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "reefer:create"))
  )
    redirect("/reefer-container-management/claim-analytics");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/reefer-container-management/claim-analytics"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Claim Analytics
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <RcmForm
          entityType="Claim Analytics"
          apiPath="/api/v1/reefer-container-management/claim-analytics"
          fields={CLAIM_ANALYTICS_FIELDS}
          returnPath="/reefer-container-management/claim-analytics"
        />
      </div>
    </div>
  );
}
