import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";
import { getPortOptions, getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewRateQuotationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:create")))
    redirect("/sales-crm");

  const [portOpts, customerOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const QUOTATION_FIELDS: FieldConfig[] = [
    { name: "quotationNumber", label: "Quotation Number", type: "text", required: true },
    { name: "customerId", label: "Customer ID", type: "select", options: customerOpts, required: true },
    { name: "contactId", label: "Contact ID", type: "text" },
    { name: "opportunityId", label: "Opportunity ID", type: "text" },
    { name: "salesRepId", label: "Sales Rep ID", type: "text", required: true, placeholder: "UUID of the sales rep" },
    { name: "originPort", label: "Origin Port", type: "select", options: portOpts, required: true },
    { name: "destinationPort", label: "Destination Port", type: "select", options: portOpts, required: true },
    { name: "tradeLane", label: "Trade Lane", type: "text" },
    { name: "serviceType", label: "Service Type", type: "text" },
    { name: "containerType", label: "Container Type", type: "text" },
    { name: "containerSize", label: "Container Size", type: "text" },
    { name: "estimatedTeu", label: "Estimated TEU", type: "number" },
    { name: "estimatedVolume", label: "Estimated Volume", type: "number" },
    { name: "totalAmount", label: "Total Amount", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "validFrom", label: "Valid From", type: "datetime-local", required: true },
    { name: "validTo", label: "Valid To", type: "datetime-local", required: true },
    { name: "transitTimeDays", label: "Transit Time (Days)", type: "number" },
    { name: "freeTimeDays", label: "Free Time (Days)", type: "number" },
    { name: "incoterm", label: "Incoterm", type: "text" },
    { name: "status", label: "Status", type: "select", options: [
      { value: "draft", label: "Draft" },
      { value: "submitted", label: "Submitted" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
      { value: "expired", label: "Expired" },
      { value: "accepted", label: "Accepted" },
    ]},
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/sales-crm/rate-quotations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Quotation
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Rate Quotation"
          apiPath="/api/v1/sales-crm/rate-quotations"
          fields={QUOTATION_FIELDS}
          returnPath="/sales-crm/rate-quotations"
        />
      </div>
    </div>
  );
}
