import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getSupplierScorecard } from "@/lib/procurement-supply-chain/service";
import { PscForm } from "@/components/procurement-supply-chain/psc-form";
import type { FieldConfig } from "@/components/procurement-supply-chain/psc-form";

const SCORECARD_FIELDS: FieldConfig[] = [
  {
    name: "scorecardType",
    label: "Scorecard Type",
    type: "select",
    required: true,
    options: [
      { value: "quarterly", label: "Quarterly" },
      { value: "annual", label: "Annual" },
      { value: "project", label: "Project" },
      { value: "incident", label: "Incident" },
      { value: "onboarding", label: "Onboarding" },
    ],
  },
  { name: "vendorName", label: "Vendor Name", type: "text", required: true },
  { name: "vendorId", label: "Vendor ID", type: "text" },
  { name: "evaluationPeriodStart", label: "Evaluation Period Start", type: "datetime-local" },
  { name: "evaluationPeriodEnd", label: "Evaluation Period End", type: "datetime-local" },
  { name: "qualityScore", label: "Quality Score", type: "text" },
  { name: "deliveryScore", label: "Delivery Score", type: "text" },
  { name: "priceScore", label: "Price Score", type: "text" },
  { name: "serviceScore", label: "Service Score", type: "text" },
  { name: "complianceScore", label: "Compliance Score", type: "text" },
  { name: "overallScore", label: "Overall Score", type: "text" },
  {
    name: "overallRating",
    label: "Overall Rating",
    type: "select",
    options: [
      { value: "excellent", label: "Excellent" },
      { value: "good", label: "Good" },
      { value: "satisfactory", label: "Satisfactory" },
      { value: "needs_improvement", label: "Needs Improvement" },
      { value: "poor", label: "Poor" },
    ],
  },
  { name: "totalOrdersEvaluated", label: "Total Orders Evaluated", type: "number" },
  { name: "onTimeDeliveryRate", label: "On-Time Delivery Rate", type: "text" },
  { name: "defectRate", label: "Defect Rate", type: "text" },
  { name: "responseTimeAvg", label: "Avg Response Time (hrs)", type: "text" },
  { name: "strengths", label: "Strengths", type: "textarea" },
  { name: "weaknesses", label: "Weaknesses", type: "textarea" },
  { name: "evaluatedBy", label: "Evaluated By", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditSupplierScorecardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "procurement:edit")))
    redirect("/procurement-supply-chain/supplier-scorecards");

  const { id } = await params;

  const record = await getSupplierScorecard(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/procurement-supply-chain/supplier-scorecards/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Supplier Scorecard
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PscForm
          entityType="Supplier Scorecard"
          apiPath={`/api/v1/procurement-supply-chain/supplier-scorecards/${id}`}
          fields={SCORECARD_FIELDS}
          initialData={{
            scorecardType: record.scorecardType,
            vendorName: record.vendorName ?? "",
            vendorId: record.vendorId ?? "",
            evaluationPeriodStart: record.evaluationPeriodStart
              ? new Date(record.evaluationPeriodStart).toISOString()
              : "",
            evaluationPeriodEnd: record.evaluationPeriodEnd
              ? new Date(record.evaluationPeriodEnd).toISOString()
              : "",
            qualityScore: record.qualityScore ?? "",
            deliveryScore: record.deliveryScore ?? "",
            priceScore: record.priceScore ?? "",
            serviceScore: record.serviceScore ?? "",
            complianceScore: record.complianceScore ?? "",
            overallScore: record.overallScore ?? "",
            overallRating: record.overallRating ?? "",
            totalOrdersEvaluated: record.totalOrdersEvaluated ?? "",
            onTimeDeliveryRate: record.onTimeDeliveryRate ?? "",
            defectRate: record.defectRate ?? "",
            responseTimeAvg: record.responseTimeAvg ?? "",
            strengths: record.strengths ?? "",
            weaknesses: record.weaknesses ?? "",
            evaluatedBy: record.evaluatedBy ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/procurement-supply-chain/supplier-scorecards/${id}`}
        />
      </div>
    </div>
  );
}
