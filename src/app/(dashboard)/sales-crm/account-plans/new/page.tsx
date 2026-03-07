import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";
import { getCustomerOptions } from "@/lib/lookups";

export default async function NewAccountPlanPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:create")))
    redirect("/sales-crm");

  const customerOpts = await getCustomerOptions(session.tenantId);

  const ACCOUNT_PLAN_FIELDS: FieldConfig[] = [
    { name: "customerId", label: "Customer ID", type: "select", options: customerOpts, required: true },
    { name: "planName", label: "Plan Name", type: "text", required: true },
    { name: "fiscalYear", label: "Fiscal Year", type: "number", required: true },
    { name: "accountManagerId", label: "Account Manager ID", type: "text", required: true, placeholder: "UUID of the account manager" },
    { name: "revenueTargetAmount", label: "Revenue Target", type: "number" },
    { name: "teuTarget", label: "TEU Target", type: "number" },
    { name: "retentionStrategy", label: "Retention Strategy", type: "textarea" },
    { name: "growthStrategy", label: "Growth Strategy", type: "textarea" },
    { name: "riskAssessment", label: "Risk Assessment", type: "textarea" },
    { name: "competitiveAnalysis", label: "Competitive Analysis", type: "textarea" },
    { name: "reviewDate", label: "Review Date", type: "date" },
    { name: "status", label: "Status", type: "select", options: [
      { value: "draft", label: "Draft" },
      { value: "active", label: "Active" },
      { value: "reviewed", label: "Reviewed" },
      { value: "archived", label: "Archived" },
    ]},
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/sales-crm/account-plans"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Account Plan
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Account Plan"
          apiPath="/api/v1/sales-crm/account-plans"
          fields={ACCOUNT_PLAN_FIELDS}
          returnPath="/sales-crm/account-plans"
        />
      </div>
    </div>
  );
}
