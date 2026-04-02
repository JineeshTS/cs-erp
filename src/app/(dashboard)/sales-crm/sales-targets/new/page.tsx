import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewSalesTargetPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:create")))
    redirect("/sales-crm");

  const currencyOpts = await getCurrencyOptions();

  const SALES_TARGET_FIELDS: FieldConfig[] = [
    { name: "salesRepId", label: "Sales Rep ID", type: "text", required: true, placeholder: "UUID of the sales rep" },
    { name: "targetName", label: "Target Name", type: "text", required: true },
    { name: "targetType", label: "Target Type", type: "select", required: true, options: [
      { value: "revenue", label: "Revenue" },
      { value: "teu", label: "TEU" },
      { value: "new_customer", label: "New Customer" },
      { value: "combined", label: "Combined" },
    ]},
    { name: "fiscalYear", label: "Fiscal Year", type: "number", required: true },
    { name: "fiscalQuarter", label: "Fiscal Quarter", type: "number" },
    { name: "fiscalMonth", label: "Fiscal Month", type: "number" },
    { name: "revenueTarget", label: "Revenue Target", type: "number" },
    { name: "teuTarget", label: "TEU Target", type: "number" },
    { name: "newCustomerTarget", label: "New Customer Target", type: "number" },
    { name: "revenueActual", label: "Revenue Actual", type: "number" },
    { name: "teuActual", label: "TEU Actual", type: "number" },
    { name: "newCustomerActual", label: "New Customer Actual", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "tradeLane", label: "Trade Lane", type: "text" },
    { name: "region", label: "Region", type: "text" },
    { name: "status", label: "Status", type: "select", options: [
      { value: "active", label: "Active" },
      { value: "achieved", label: "Achieved" },
      { value: "missed", label: "Missed" },
      { value: "cancelled", label: "Cancelled" },
    ]},
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/sales-crm/sales-targets"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Sales Target
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Sales Target"
          apiPath="/api/v1/sales-crm/sales-targets"
          fields={SALES_TARGET_FIELDS}
          returnPath="/sales-crm/sales-targets"
        />
      </div>
    </div>
  );
}
