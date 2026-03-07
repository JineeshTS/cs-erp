import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { AbiForm } from "@/components/analytics-business-intelligence/abi-form";
import type { FieldConfig } from "@/components/analytics-business-intelligence/abi-form";
import { getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewCustomerRevenueAnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "analytics:create"))
  )
    redirect("/analytics-business-intelligence/customer-revenue-analytics");

  const [customerOpts, currencyOpts] = await Promise.all([
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const CUSTOMER_REVENUE_ANALYTICS_FIELDS: FieldConfig[] = [
    {
      name: "analyticsType",
      label: "Analytics Type",
      type: "select",
      required: true,
      options: [
        { value: "revenue_breakdown", label: "Revenue Breakdown" },
        { value: "profitability", label: "Profitability" },
        { value: "segmentation", label: "Segmentation" },
        { value: "lifetime_value", label: "Lifetime Value" },
      ],
    },
    {
      name: "customerName",
      label: "Customer Name",
      type: "select", options: customerOpts,
      required: true,
    },
    { name: "customerCode", label: "Customer Code", type: "select", options: customerOpts },
    { name: "customerSegment", label: "Customer Segment", type: "text" },
    { name: "periodStart", label: "Period Start", type: "datetime-local" },
    { name: "periodEnd", label: "Period End", type: "datetime-local" },
    { name: "totalRevenue", label: "Total Revenue", type: "number" },
    { name: "totalCosts", label: "Total Costs", type: "number" },
    { name: "grossProfit", label: "Gross Profit", type: "number" },
    { name: "grossMarginPct", label: "Gross Margin %", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "totalTeu", label: "Total TEU", type: "number" },
    { name: "totalShipments", label: "Total Shipments", type: "number" },
    {
      name: "avgRevenuePerShipment",
      label: "Avg Revenue Per Shipment",
      type: "number",
    },
    {
      name: "paymentTermsDays",
      label: "Payment Terms (Days)",
      type: "number",
    },
    {
      name: "avgDaysToPayment",
      label: "Avg Days to Payment",
      type: "number",
    },
    {
      name: "outstandingBalance",
      label: "Outstanding Balance",
      type: "number",
    },
    { name: "lifetimeValue", label: "Lifetime Value", type: "number" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/analytics-business-intelligence/customer-revenue-analytics"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Customer Revenue Analytics
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AbiForm
          entityType="Customer Revenue Analytics"
          apiPath="/api/v1/analytics-business-intelligence/customer-revenue-analytics"
          fields={CUSTOMER_REVENUE_ANALYTICS_FIELDS}
          returnPath="/analytics-business-intelligence/customer-revenue-analytics"
        />
      </div>
    </div>
  );
}
