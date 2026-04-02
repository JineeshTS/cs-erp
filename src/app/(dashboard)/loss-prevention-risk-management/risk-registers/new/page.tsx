import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { LprForm, type FieldConfig } from "@/components/loss-prevention-risk-management/lpr-form";

const RISK_REGISTER_FIELDS: FieldConfig[] = [
  {
    name: "riskType",
    label: "Risk Type",
    type: "select",
    required: true,
    options: [
      { value: "operational", label: "Operational" },
      { value: "financial", label: "Financial" },
      { value: "strategic", label: "Strategic" },
      { value: "compliance", label: "Compliance" },
      { value: "reputational", label: "Reputational" },
      { value: "environmental", label: "Environmental" },
    ],
  },
  { name: "title", label: "Title", type: "text" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "riskCategory", label: "Risk Category", type: "text" },
  { name: "likelihood", label: "Likelihood", type: "number" },
  { name: "impact", label: "Impact", type: "number" },
  { name: "riskScore", label: "Risk Score", type: "number" },
  { name: "riskOwner", label: "Risk Owner", type: "text" },
  { name: "mitigationStrategy", label: "Mitigation Strategy", type: "textarea" },
  { name: "residualLikelihood", label: "Residual Likelihood", type: "number" },
  { name: "residualImpact", label: "Residual Impact", type: "number" },
  { name: "residualScore", label: "Residual Score", type: "number" },
  { name: "reviewDate", label: "Review Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewRiskRegisterPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "lpr:create"))
  )
    redirect("/loss-prevention-risk-management/risk-registers");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/loss-prevention-risk-management/risk-registers"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Risk Register
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LprForm
          entityType="Risk Register"
          apiPath="/api/v1/loss-prevention-risk-management/risk-registers"
          fields={RISK_REGISTER_FIELDS}
          returnPath="/loss-prevention-risk-management/risk-registers"
        />
      </div>
    </div>
  );
}
