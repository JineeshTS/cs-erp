import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import {
  FirmForm,
  type FieldConfig,
} from "@/components/freight-invoice-revenue-management/firm-form";
import { getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewInvoiceDisputePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "invoice:create")))
    redirect("/freight-invoice-revenue-management/invoice-disputes");

  const [customerOpts, currencyOpts] = await Promise.all([
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const DISPUTE_FIELDS: FieldConfig[] = [
    { name: "invoiceId", label: "Invoice ID", type: "text", required: true },
    {
      name: "invoiceNumber",
      label: "Invoice Number",
      type: "text",
      required: true,
    },
    {
      name: "customerName",
      label: "Customer Name",
      type: "select", options: customerOpts,
      required: true,
    },
    {
      name: "disputeType",
      label: "Dispute Type",
      type: "select",
      required: true,
      options: [
        { value: "rate_dispute", label: "Rate Dispute" },
        { value: "quantity_dispute", label: "Quantity Dispute" },
        { value: "charge_dispute", label: "Charge Dispute" },
        { value: "documentation_error", label: "Documentation Error" },
        { value: "service_issue", label: "Service Issue" },
        { value: "duplicate_billing", label: "Duplicate Billing" },
        { value: "other", label: "Other" },
      ],
    },
    {
      name: "disputedAmount",
      label: "Disputed Amount",
      type: "number",
      required: true,
    },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "reason", label: "Reason", type: "textarea", required: true },
    { name: "assignedToName", label: "Assigned To", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/freight-invoice-revenue-management/invoice-disputes"
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Invoice Dispute
          </h1>
          <p className="text-sm text-gray-500">
            File a new invoice dispute
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FirmForm
          entityType="Invoice Dispute"
          apiPath="/api/v1/freight-invoice-revenue-management/invoice-disputes"
          fields={DISPUTE_FIELDS}
          returnPath="/freight-invoice-revenue-management/invoice-disputes"
        />
      </div>
    </div>
  );
}
