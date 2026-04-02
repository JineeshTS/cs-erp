import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getAiRiskDetection } from "@/lib/audit-compliance-management/service";
import { AcmForm } from "@/components/audit-compliance-management/acm-form";
import type { FieldConfig } from "@/components/audit-compliance-management/acm-form";

const fields: FieldConfig[] = [
  {
    name: "detectionType",
    label: "Detection Type",
    type: "select",
    options: [
      { value: "anomaly_detection", label: "Anomaly Detection" },
      { value: "pattern_analysis", label: "Pattern Analysis" },
      { value: "predictive_risk", label: "Predictive Risk" },
      { value: "fraud_detection", label: "Fraud Detection" },
      { value: "compliance_breach", label: "Compliance Breach" },
      { value: "behavioral_analysis", label: "Behavioral Analysis" },
    ],
  },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "modelName", label: "Model Name", type: "text" },
  { name: "modelVersion", label: "Model Version", type: "text" },
  { name: "entityType", label: "Entity Type", type: "text" },
  { name: "entityRef", label: "Entity Ref", type: "text" },
  { name: "riskScore", label: "Risk Score", type: "text" },
  { name: "confidenceScore", label: "Confidence Score", type: "text" },
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
  { name: "threshold", label: "Threshold", type: "text" },
  { name: "isAboveThreshold", label: "Above Threshold", type: "checkbox" },
  {
    name: "investigationStatus",
    label: "Investigation Status",
    type: "select",
    options: [
      { value: "pending", label: "Pending" },
      { value: "investigating", label: "Investigating" },
      { value: "resolved", label: "Resolved" },
      { value: "dismissed", label: "Dismissed" },
    ],
  },
  { name: "investigatedBy", label: "Investigated By", type: "text" },
  { name: "resolutionNotes", label: "Resolution Notes", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditAiRiskDetectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "audit:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getAiRiskDetection(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/audit-compliance-management/ai-risk-detections/${id}`}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit AI Risk Detection
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <AcmForm
          entityType="AI Risk Detection"
          apiPath={`/api/v1/audit-compliance-management/ai-risk-detections/${id}`}
          fields={fields}
          initialData={record as Record<string, unknown>}
          isEdit
          returnPath={`/audit-compliance-management/ai-risk-detections/${id}`}
        />
      </div>
    </div>
  );
}
