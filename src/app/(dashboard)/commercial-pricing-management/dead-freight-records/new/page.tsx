import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { CpmForm } from "@/components/commercial-pricing-management/cpm-form";
import type { FieldConfig } from "@/components/commercial-pricing-management/cpm-form";
import { getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewDeadFreightRecordPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [customerOpts, currencyOpts] = await Promise.all([
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const fields: FieldConfig[] = [
    { name: "recordReference", label: "Record Reference", type: "text", required: true },
    { name: "voyageReference", label: "Voyage Reference", type: "text" },
    { name: "bookingReference", label: "Booking Reference", type: "text" },
    { name: "customerId", label: "Customer ID", type: "select", options: customerOpts },
    { name: "tradeLane", label: "Trade Lane", type: "text" },
    { name: "bookedTeu", label: "Booked TEU", type: "number", required: true },
    { name: "actualTeu", label: "Actual TEU", type: "number", required: true },
    { name: "shortShippedTeu", label: "Short Shipped TEU", type: "number", required: true },
    { name: "ratePerTeu", label: "Rate Per TEU", type: "number", required: true },
    { name: "deadFreightAmount", label: "Dead Freight Amount", type: "number", required: true },
    { name: "recoveredAmount", label: "Recovered Amount", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "waiverReason", label: "Waiver Reason", type: "text" },
    { name: "waivedAmount", label: "Waived Amount", type: "number" },
    { name: "invoiceId", label: "Invoice ID", type: "text" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Calculated", value: "calculated" },
        { label: "Invoiced", value: "invoiced" },
        { label: "Partially Recovered", value: "partially_recovered" },
        { label: "Recovered", value: "recovered" },
        { label: "Waived", value: "waived" },
      ],
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  await hasPermission(session.id, session.tenantId, "commercial:read");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/commercial-pricing-management/dead-freight-records"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-semibold">New Dead Freight Record</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CpmForm
          entityType="Dead Freight Record"
          fields={fields}
          apiPath="/api/v1/commercial-pricing-management/dead-freight-records"
          returnPath="/commercial-pricing-management/dead-freight-records"
        />
      </div>
    </div>
  );
}
