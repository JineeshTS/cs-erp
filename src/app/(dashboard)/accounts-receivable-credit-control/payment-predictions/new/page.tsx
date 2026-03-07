import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ArccForm, type FieldConfig } from "@/components/accounts-receivable-credit-control/arcc-form";
import { getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewPaymentPredictionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "receivable:create"))) redirect("/");


  const [customerOpts, currencyOpts] = await Promise.all([
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);
  const fields: FieldConfig[] = [
    { name: "customerName", label: "Customer Name", type: "select", options: customerOpts, required: true },
    { name: "accountNumber", label: "Account Number", type: "text" },
    { name: "invoiceRef", label: "Invoice Ref", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "invoiceAmount", label: "Invoice Amount", type: "number", required: true },
    { name: "outstandingAmount", label: "Outstanding Amount", type: "number", required: true },
    { name: "predictedPaymentDate", label: "Predicted Payment Date", type: "datetime-local" },
    { name: "predictedAmount", label: "Predicted Amount", type: "number" },
    { name: "paymentProbability", label: "Payment Probability", type: "number" },
    { name: "defaultProbability", label: "Default Probability", type: "number" },
    { name: "paymentScore", label: "Payment Score", type: "number" },
    { name: "riskScore", label: "Risk Score", type: "number" },
    { name: "behaviorScore", label: "Behavior Score", type: "number" },
    { name: "aiModelVersion", label: "AI Model Version", type: "text" },
    { name: "confidenceScore", label: "Confidence Score", type: "number" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Payment Prediction</h1>
        <p className="text-sm text-gray-500">Create a new payment prediction</p>
      </div>
      <ArccForm
        entityType="Payment Prediction"
        fields={fields}
        apiPath="/api/v1/accounts-receivable-credit-control/payment-predictions"
        returnPath="/accounts-receivable-credit-control/payment-predictions"
      />
    </div>
  );
}
