import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getClaimAnalytic } from "@/lib/reefer-container-management/service";
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

export default async function EditClaimAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "reefer:edit")))
    redirect("/reefer-container-management/claim-analytics");

  const { id } = await params;

  const record = await getClaimAnalytic(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/reefer-container-management/claim-analytics/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Claim Analytics
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <RcmForm
          entityType="Claim Analytics"
          apiPath={`/api/v1/reefer-container-management/claim-analytics/${id}`}
          fields={CLAIM_ANALYTICS_FIELDS}
          initialData={{
            containerNumber: record.containerNumber ?? "",
            bookingRef: record.bookingRef ?? "",
            customerName: record.customerName ?? "",
            commodityName: record.commodityName ?? "",
            analysisType: record.analysisType,
            riskLevel: record.riskLevel,
            riskScore: record.riskScore ?? "",
            tempExceedanceCount: record.tempExceedanceCount ?? "",
            totalExceedanceMinutes: record.totalExceedanceMinutes ?? "",
            maxDeviationC: record.maxDeviationC ?? "",
            claimProbability: record.claimProbability ?? "",
            estimatedClaimAmount: record.estimatedClaimAmount ?? "",
            currency: record.currency ?? "",
            modelVersion: record.modelVersion ?? "",
            confidenceScore: record.confidenceScore ?? "",
            actualClaimFiled: record.actualClaimFiled ?? false,
            actualClaimAmount: record.actualClaimAmount ?? "",
            predictionAccuracy: record.predictionAccuracy ?? "",
            aiRecommendations: record.aiRecommendations ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/reefer-container-management/claim-analytics/${id}`}
        />
      </div>
    </div>
  );
}
