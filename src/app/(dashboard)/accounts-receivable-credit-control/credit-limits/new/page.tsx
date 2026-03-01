import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ArccForm, type FieldConfig } from "@/components/accounts-receivable-credit-control/arcc-form";

export default async function NewCreditLimitPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "receivable:create"))) redirect("/");

  const fields: FieldConfig[] = [
    { name: "accountId", label: "Account ID", type: "text", required: true },
    { name: "accountNumber", label: "Account Number", type: "text", required: true },
    { name: "customerName", label: "Customer Name", type: "text", required: true },
    { name: "creditLimit", label: "Credit Limit", type: "number", required: true },
    { name: "riskCategory", label: "Risk Category", type: "select", options: [
      { label: "Low", value: "low" },
      { label: "Standard", value: "standard" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" },
      { label: "Critical", value: "critical" },
    ]},
    { name: "creditInsured", label: "Credit Insured", type: "checkbox" },
    { name: "insurerName", label: "Insurer Name", type: "text" },
    { name: "insuredAmount", label: "Insured Amount", type: "number" },
    { name: "insurancePolicyRef", label: "Insurance Policy Ref", type: "text" },
    { name: "nextReviewDate", label: "Next Review Date", type: "date" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Credit Limit</h1>
        <p className="text-sm text-gray-500">Set up a new credit limit for a customer</p>
      </div>
      <ArccForm
        entityType="Credit Limit"
        fields={fields}
        apiPath="/api/v1/accounts-receivable-credit-control/credit-limits"
        method="POST"
        returnPath="/accounts-receivable-credit-control/credit-limits"
      />
    </div>
  );
}
