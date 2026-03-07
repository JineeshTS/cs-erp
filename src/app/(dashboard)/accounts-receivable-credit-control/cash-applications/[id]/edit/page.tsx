import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCashApplication } from "@/lib/accounts-receivable-credit-control/service";
import { ArccForm } from "@/components/accounts-receivable-credit-control/arcc-form";
import type { FieldConfig } from "@/components/accounts-receivable-credit-control/arcc-form";
import { getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditCashApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "receivable:edit")))
    redirect("/");


  const [customerOpts, currencyOpts] = await Promise.all([
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);
  const { id } = await params;
  const application = await getCashApplication(id, session.tenantId);
  if (!application) notFound();

  const fields: FieldConfig[] = [
    {
      name: "customerName",
      label: "Customer Name",
      type: "select", options: customerOpts,
      required: true,
    },
    { name: "accountNumber", label: "Account Number", type: "text" },
    {
      name: "paymentReference",
      label: "Payment Reference",
      type: "text",
      required: true,
    },
    {
      name: "paymentMethod",
      label: "Payment Method",
      type: "select",
      required: true,
      options: [
        { label: "Bank Transfer", value: "bank_transfer" },
        { label: "Cheque", value: "cheque" },
        { label: "Cash", value: "cash" },
        { label: "Credit Card", value: "credit_card" },
        { label: "Direct Debit", value: "direct_debit" },
        { label: "Letter of Credit", value: "lc" },
        { label: "Other", value: "other" },
      ],
    },
    {
      name: "paymentDate",
      label: "Payment Date",
      type: "datetime-local",
      required: true,
    },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    {
      name: "paymentAmount",
      label: "Payment Amount",
      type: "number",
      required: true,
    },
    { name: "bankReference", label: "Bank Reference", type: "text" },
    { name: "bankAccount", label: "Bank Account", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Cash Application
        </h1>
        <p className="text-sm text-gray-500">
          Update cash application {application.applicationRef}
        </p>
      </div>
      <ArccForm
        entityType="Cash Application"
        fields={fields}
        initialData={application}
        isEdit
        apiPath={`/api/v1/accounts-receivable-credit-control/cash-applications/${id}`}
        returnPath="/accounts-receivable-credit-control/cash-applications"
        method="PUT"
      />
    </div>
  );
}
