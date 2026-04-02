import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ArccForm, type FieldConfig } from "@/components/accounts-receivable-credit-control/arcc-form";
import { getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewCustomerAccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "receivable:create"))) redirect("/");


  const [customerOpts, currencyOpts] = await Promise.all([
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);
  const fields: FieldConfig[] = [
    { name: "customerName", label: "Customer Name", type: "select", options: customerOpts, required: true },
    { name: "customerCode", label: "Customer Code", type: "select", options: customerOpts },
    { name: "tradingName", label: "Trading Name", type: "text" },
    { name: "registrationNumber", label: "Registration Number", type: "text" },
    { name: "taxId", label: "Tax ID", type: "text" },
    { name: "industry", label: "Industry", type: "text" },
    { name: "segment", label: "Segment", type: "select", options: [
      { label: "Enterprise", value: "enterprise" },
      { label: "Mid Market", value: "mid_market" },
      { label: "SME", value: "sme" },
      { label: "Retail", value: "retail" },
      { label: "Government", value: "government" },
      { label: "Other", value: "other" },
    ]},
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "paymentTerms", label: "Payment Terms", type: "text" },
    { name: "billingAddress", label: "Billing Address", type: "textarea" },
    { name: "billingEmail", label: "Billing Email", type: "text" },
    { name: "billingPhone", label: "Billing Phone", type: "text" },
    { name: "primaryContact", label: "Primary Contact", type: "text" },
    { name: "accountStatus", label: "Account Status", type: "select", options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Suspended", value: "suspended" },
      { label: "Closed", value: "closed" },
    ]},
    { name: "onHold", label: "On Hold", type: "checkbox" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Customer Account</h1>
        <p className="text-sm text-gray-500">Create a new customer account</p>
      </div>
      <ArccForm
        entityType="Customer Account"
        fields={fields}
        apiPath="/api/v1/accounts-receivable-credit-control/customer-accounts"
        returnPath="/accounts-receivable-credit-control/customer-accounts"
      />
    </div>
  );
}
