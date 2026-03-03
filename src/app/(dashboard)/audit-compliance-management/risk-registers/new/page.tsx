import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { AcmForm } from "@/components/audit-compliance-management/acm-form";
import type { FieldConfig } from "@/components/audit-compliance-management/acm-form";

const fields: FieldConfig[] = [
  {
    name: "riskType",
    label: "Risk Type",
    type: "select",
    options: [
      { value: "strategic", label: "Strategic" },
      { value: "operational", label: "Operational" },
      { value: "financial", label: "Financial" },
      { value: "compliance", label: "Compliance" },
      { value: "reputational", label: "Reputational" },
      { value: "technology", label: "Technology" },
    ],
  },
  {
    name: "title",
    label: "Title",
    type: "text",
    required: true,
    placeholder: "Enter risk title",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Describe the risk in detail",
  },
  {
    name: "category",
    label: "Category",
    type: "text",
    placeholder: "Risk category",
  },
  {
    name: "likelihoodScore",
    label: "Likelihood Score",
    type: "number",
    placeholder: "1-5",
  },
  {
    name: "impactScore",
    label: "Impact Score",
    type: "number",
    placeholder: "1-5",
  },
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
  {
    name: "riskOwner",
    label: "Risk Owner",
    type: "text",
    placeholder: "Person responsible",
  },
  {
    name: "mitigationStrategy",
    label: "Mitigation Strategy",
    type: "textarea",
    placeholder: "Describe the mitigation strategy",
  },
  {
    name: "residualLikelihood",
    label: "Residual Likelihood",
    type: "number",
    placeholder: "1-5",
  },
  {
    name: "residualImpact",
    label: "Residual Impact",
    type: "number",
    placeholder: "1-5",
  },
  {
    name: "reviewDate",
    label: "Review Date",
    type: "datetime-local",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Additional notes",
  },
];

export default async function NewRiskRegisterPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "audit:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/audit-compliance-management/risk-registers"
          className="rounded-md border p-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Risk Register
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <AcmForm
          entityType="Risk Register"
          apiPath="/api/v1/audit-compliance-management/risk-registers"
          fields={fields}
          returnPath="/audit-compliance-management/risk-registers"
        />
      </div>
    </div>
  );
}
