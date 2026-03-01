import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCreditLimit } from "@/lib/accounts-receivable-credit-control/service";
import { ArccForm, type FieldConfig } from "@/components/accounts-receivable-credit-control/arcc-form";

export default async function EditCreditLimitPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "receivable:edit"))) redirect("/");

  const { id } = await params;
  const creditLimit = await getCreditLimit(id, session.tenantId);
  if (!creditLimit) notFound();

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
        <h1 className="text-2xl font-bold text-gray-900">Edit Credit Limit</h1>
        <p className="text-sm text-gray-500">Update credit limit for {creditLimit.customerName}</p>
      </div>
      <ArccForm
        entityType="Credit Limit"
        fields={fields}
        initialData={creditLimit}
        apiPath={`/api/v1/accounts-receivable-credit-control/credit-limits/${id}`}
        method="PUT"
        returnPath="/accounts-receivable-credit-control/credit-limits"
        isEdit
      />
    </div>
  );
}
